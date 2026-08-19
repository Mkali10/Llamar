import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { validateFlow } from './flows.js';
import { can, type Principal, verifyToken } from './security.js';
import { AiVoiceProfile, ProviderConfig, telephonyProviders } from './providers.js';

declare module 'fastify' { interface FastifyRequest { principal: Principal | null } }
const app=Fastify({logger:true,trustProxy:true,bodyLimit:1_048_576});
await app.register(helmet); await app.register(rateLimit,{max:120,timeWindow:'1 minute'});
app.decorateRequest('principal',null);

app.addHook('preHandler',async(req,reply)=>{
  if(req.url.startsWith('/health')) return;
  const [scheme,token]=(req.headers.authorization??'').split(' ');
  if(scheme!=='Bearer'||!token) return reply.code(401).send({error:'bearer token required'});
  try{req.principal=await verifyToken(token);}catch{return reply.code(401).send({error:'invalid or expired token'});}
});
app.get('/health/live',async()=>({status:'ok'}));
app.get('/health/ready',async()=>({status:'ready'}));
app.get('/v1/auth/me',async req=>req.principal);
app.post('/v1/flows/validate',async(req,reply)=>{
  if(!req.principal||!can(req.principal,'flows.validate')) return reply.code(403).send({error:'insufficient permission'});
  try{const flow=validateFlow(req.body);return {valid:true,nodeCount:flow.nodes.length,edgeCount:flow.edges.length};}
  catch(error){return reply.code(422).send({error:error instanceof Error?error.message:'invalid flow'});}
});
app.get('/v1/providers/telephony',async(req,reply)=>{
  if(!req.principal||!can(req.principal,'plugins.view')) return reply.code(403).send({error:'insufficient permission'});
  return {providers:telephonyProviders};
});
app.post('/v1/providers/telephony/validate',async(req,reply)=>{
  if(!req.principal||!can(req.principal,'plugins.configure')) return reply.code(403).send({error:'insufficient permission'});
  const result=ProviderConfig.safeParse(req.body); if(!result.success)return reply.code(422).send({error:'invalid provider configuration',details:result.error.issues});
  return {valid:true,provider:result.data.provider,countries:result.data.enabledCountries};
});
app.post('/v1/ai/voice-profiles/validate',async(req,reply)=>{
  if(!req.principal||!can(req.principal,'ai_agents.configure')) return reply.code(403).send({error:'insufficient permission'});
  const result=AiVoiceProfile.safeParse(req.body); if(!result.success)return reply.code(422).send({error:'invalid voice profile',details:result.error.issues});
  return {valid:true,primaryLocale:result.data.primaryLocale,supportedLocales:result.data.supportedLocales,avatar:result.data.avatar.characterName};
});

const port=Number(process.env.PORT??8080); const host=process.env.HOST??'0.0.0.0';
app.listen({port,host}).catch(error=>{app.log.error(error);process.exit(1);});
