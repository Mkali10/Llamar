import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import formbody from '@fastify/formbody';
import { z } from 'zod';
import { validateFlow } from './flows.js';
import { can, type Principal, verifyToken } from './security.js';
import { AiVoiceProfile, ProviderConfig, telephonyProviders } from './providers.js';
import { OutboundCallRequest } from './telephony/types.js';
import { telephonyAdapter } from './telephony/registry.js';
import { verifyTwilioSignature } from './telephony/twilio.js';
import { AiAgent, AgentRoute } from './ai/agents.js';
import { renderFreeSwitchXml } from './freeswitch/xml.js';
import { EslClient } from './freeswitch/esl.js';
import { AgentWebRtcRequest, publicWebRtcConfig } from './webrtc.js';
import { closeDatabase, databaseReady, withTenant } from './database.js';
import { CampaignCreate, createCampaign, listCampaigns } from './campaigns.js';

declare module 'fastify' { interface FastifyRequest { principal: Principal | null } }
const app=Fastify({logger:true,trustProxy:true,bodyLimit:1_048_576});
await app.register(helmet); await app.register(rateLimit,{max:120,timeWindow:'1 minute'}); await app.register(formbody);
app.decorateRequest('principal',null);

app.addHook('preHandler',async(req,reply)=>{
  if(req.url.startsWith('/health')||req.url.startsWith('/v1/webhooks/')||req.url==='/v1/freeswitch/xml') return;
  const [scheme,token]=(req.headers.authorization??'').split(' ');
  if(scheme!=='Bearer'||!token) return reply.code(401).send({error:'bearer token required'});
  try{req.principal=await verifyToken(token);}catch{return reply.code(401).send({error:'invalid or expired token'});}
});
app.get('/health/live',async()=>({status:'ok'}));
app.get('/health/ready',async(_req,reply)=>{try{return await databaseReady()?{status:'ready'}:reply.code(503).send({status:'not_ready'})}catch{return reply.code(503).send({status:'not_ready'})}});
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
app.post('/v1/calls/outbound',async(req,reply)=>{
  if(!req.principal||!can(req.principal,'calls.originate'))return reply.code(403).send({error:'insufficient permission'});
  const parsed=OutboundCallRequest.safeParse(req.body);if(!parsed.success)return reply.code(422).send({error:'invalid call request',details:parsed.error.issues});
  try{return reply.code(202).send(await telephonyAdapter('twilio').createCall(parsed.data));}
  catch(error){req.log.error(error);return reply.code(502).send({error:'telephony provider rejected the call'});}
});
app.post('/v1/webhooks/twilio/status',async(req,reply)=>{
  const token=process.env.TWILIO_AUTH_TOKEN??'';const base=(process.env.TWILIO_PUBLIC_BASE_URL??'').replace(/\/$/,'');
  const url=`${base}/v1/webhooks/twilio/status`;const params=(req.body??{}) as Record<string,unknown>;
  if(!verifyTwilioSignature(token,req.headers['x-twilio-signature'] as string|undefined,url,params))return reply.code(401).send({error:'invalid Twilio signature'});
  req.log.info({provider:'twilio',callSid:params.CallSid,status:params.CallStatus},'verified call status');return reply.code(204).send();
});
app.post('/v1/ai/agents/validate',async(req,reply)=>{if(!req.principal||!can(req.principal,'ai_agents.configure'))return reply.code(403).send({error:'insufficient permission'});const result=AiAgent.safeParse(req.body);if(!result.success)return reply.code(422).send({error:'invalid AI agent',details:result.error.issues});return {valid:true,trainingModes:[...new Set(result.data.trainingSources.map(s=>s.type))],languages:result.data.languages,maxConcurrentCalls:result.data.maxConcurrentCalls}});
app.post('/v1/ai/routes/validate',async(req,reply)=>{if(!req.principal||!can(req.principal,'ai_agents.route'))return reply.code(403).send({error:'insufficient permission'});const result=AgentRoute.safeParse(req.body);if(!result.success)return reply.code(422).send({error:'invalid AI route',details:result.error.issues});return {valid:true,did:result.data.did,agentCount:result.data.agentIds.length,strategy:result.data.strategy}});
app.post('/v1/freeswitch/xml',async(req,reply)=>{const expected=process.env.FREESWITCH_XML_CURL_TOKEN??'';const supplied=req.headers['x-llamar-freeswitch-token'];if(!expected||supplied!==expected)return reply.code(401).send('unauthorized');return reply.type('application/xml').send(renderFreeSwitchXml(req.body))});
app.get('/v1/freeswitch/channels',async(req,reply)=>{if(!req.principal||!can(req.principal,'calls.monitor'))return reply.code(403).send({error:'insufficient permission'});try{const client=new EslClient(process.env.FREESWITCH_ESL_HOST??'127.0.0.1',Number(process.env.FREESWITCH_ESL_PORT??8021),process.env.FREESWITCH_ESL_PASSWORD??'');const channels=await client.channels();return {count:channels.length,channels}}catch(error){req.log.error(error);return reply.code(503).send({error:'FreeSWITCH ESL unavailable'})}});
app.post('/v1/agent/webrtc/config',async(req,reply)=>{if(!req.principal||!can(req.principal,'agent.phone.use'))return reply.code(403).send({error:'insufficient permission'});const parsed=AgentWebRtcRequest.safeParse(req.body);if(!parsed.success)return reply.code(422).send({error:'invalid extension'});try{return publicWebRtcConfig(parsed.data.extension)}catch{return reply.code(503).send({error:'WebRTC is not configured'})}});
app.post('/v1/campaigns',async(req,reply)=>{if(!req.principal||!can(req.principal,'campaigns.create'))return reply.code(403).send({error:'insufficient permission'});if(!req.principal.tenantId)return reply.code(403).send({error:'tenant context required'});const parsed=CampaignCreate.safeParse(req.body);if(!parsed.success)return reply.code(422).send({error:'invalid campaign',details:parsed.error.issues});try{return reply.code(201).send(await withTenant(req.principal.tenantId,client=>createCampaign(client,req.principal!.tenantId!,parsed.data,req.principal!.sub)))}catch(error){req.log.error(error);return reply.code(500).send({error:'campaign could not be created'})}});
app.get('/v1/campaigns',async(req,reply)=>{if(!req.principal||!can(req.principal,'campaigns.view'))return reply.code(403).send({error:'insufficient permission'});if(!req.principal.tenantId)return reply.code(403).send({error:'tenant context required'});const query=z.object({limit:z.coerce.number().int().min(1).max(100).default(25),offset:z.coerce.number().int().min(0).default(0)}).safeParse(req.query);if(!query.success)return reply.code(422).send({error:'invalid pagination'});try{return await withTenant(req.principal.tenantId,client=>listCampaigns(client,query.data.limit,query.data.offset))}catch(error){req.log.error(error);return reply.code(500).send({error:'campaigns could not be loaded'})}});

app.addHook('onClose',async()=>closeDatabase());

const port=Number(process.env.PORT??8080); const host=process.env.HOST??'0.0.0.0';
app.listen({port,host}).catch(error=>{app.log.error(error);process.exit(1);});
