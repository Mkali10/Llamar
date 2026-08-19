import {z} from 'zod';
import type pg from 'pg';

const Strategy=z.enum(['intent','language','skill','segment','availability','weighted']);
export const RouteCreate=z.object({did:z.string().min(4).max(32),strategy:Strategy,agentIds:z.array(z.string().uuid()).min(1).max(100),fallbackAgentId:z.string().uuid().nullable().default(null),weights:z.record(z.string().uuid(),z.number().min(0).max(10000)).default({}),criteria:z.record(z.string(),z.unknown()).default({}),enabled:z.boolean().default(true)});
export const ResolveRoute=z.object({tenantId:z.string().uuid(),did:z.string().min(4).max(32),language:z.string().max(16).optional(),intent:z.string().max(80).optional(),skill:z.string().max(80).optional()});
export const CampaignAgentBind=z.object({aiAgentId:z.string().uuid().nullable()});
type RouteInput=z.infer<typeof RouteCreate>;

export async function createRoute(c:pg.PoolClient,tenantId:string,input:RouteInput,actorId:string){
  const ids=[...new Set(input.agentIds)];
  if(input.fallbackAgentId&&!ids.includes(input.fallbackAgentId))throw new Error('fallback agent must be included in the route');
  const found=(await c.query(`SELECT id FROM ai_agents WHERE id=ANY($1::uuid[]) AND status='published'`,[ids])).rows.map(row=>row.id as string);
  if(found.length!==ids.length)throw new Error('all routed agents must exist and be published');
  const row=(await c.query(`INSERT INTO ai_agent_routes(tenant_id,did,strategy,agent_ids,fallback_agent_id,weights,criteria,enabled) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8) ON CONFLICT(tenant_id,did) DO UPDATE SET strategy=excluded.strategy,agent_ids=excluded.agent_ids,fallback_agent_id=excluded.fallback_agent_id,weights=excluded.weights,criteria=excluded.criteria,enabled=excluded.enabled,updated_at=now() RETURNING id,did,strategy,agent_ids AS "agentIds",fallback_agent_id AS "fallbackAgentId",weights,criteria,enabled,updated_at AS "updatedAt"`,[tenantId,input.did,input.strategy,ids,input.fallbackAgentId,JSON.stringify(input.weights),JSON.stringify(input.criteria),input.enabled])).rows[0];
  await audit(c,tenantId,actorId,'ai_route.saved','ai_agent_route',row.id,{did:input.did,strategy:input.strategy,agentCount:ids.length});return row;
}
export async function listRoutes(c:pg.PoolClient){return {items:(await c.query(`SELECT r.id,r.did,r.strategy,r.agent_ids AS "agentIds",r.fallback_agent_id AS "fallbackAgentId",r.weights,r.criteria,r.enabled,r.updated_at AS "updatedAt",coalesce(jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'status',a.status)) FILTER(WHERE a.id IS NOT NULL),'[]') AS agents FROM ai_agent_routes r LEFT JOIN ai_agents a ON a.id=ANY(r.agent_ids) GROUP BY r.id ORDER BY r.updated_at DESC`)).rows}}
export async function resolveRoute(c:pg.PoolClient,input:z.infer<typeof ResolveRoute>){
  const route=(await c.query(`SELECT * FROM ai_agent_routes WHERE did=$1 AND enabled=true`,[input.did])).rows[0];if(!route)return null;
  const rows=(await c.query(`SELECT a.id,a.name,a.languages,a.skills,a.intents,a.max_concurrent_calls AS "maxConcurrentCalls",count(s.id)::int AS "activeCalls" FROM ai_agents a LEFT JOIN ai_voice_sessions s ON s.ai_agent_id=a.id AND s.state IN('connected','active','interrupted') WHERE a.id=ANY($1::uuid[]) AND a.status='published' GROUP BY a.id`,[route.agent_ids])).rows as Array<{id:string;name:string;languages:string[];skills:string[];intents:string[];maxConcurrentCalls:number;activeCalls:number}>;
  let candidates=rows.filter(a=>a.activeCalls<a.maxConcurrentCalls);
  if(input.language)candidates=candidates.filter(a=>a.languages.includes(input.language!));
  if(input.intent)candidates=candidates.filter(a=>a.intents.includes(input.intent!));
  if(input.skill)candidates=candidates.filter(a=>a.skills.includes(input.skill!));
  const weights=(route.weights??{}) as Record<string,number>;
  candidates.sort((a,b)=>route.strategy==='weighted'?(weights[b.id]??0)-(weights[a.id]??0)||a.activeCalls-b.activeCalls:a.activeCalls-b.activeCalls);
  let selected=candidates[0];if(!selected&&route.fallback_agent_id)selected=rows.find(a=>a.id===route.fallback_agent_id&&a.activeCalls<a.maxConcurrentCalls);
  return selected?{routeId:route.id,agentId:selected.id,agentName:selected.name,strategy:route.strategy,activeCalls:selected.activeCalls,maxConcurrentCalls:selected.maxConcurrentCalls}:null;
}
export async function bindCampaignAgent(c:pg.PoolClient,tenantId:string,campaignId:string,aiAgentId:string|null,actorId:string){if(aiAgentId){const ok=(await c.query(`SELECT 1 FROM ai_agents WHERE id=$1 AND status='published'`,[aiAgentId])).rowCount;if(!ok)throw new Error('published AI agent required')}const row=(await c.query(`UPDATE campaigns SET ai_agent_id=$2 WHERE id=$1 RETURNING id,name,ai_agent_id AS "aiAgentId"`,[campaignId,aiAgentId])).rows[0];if(!row)throw new Error('campaign not found');await audit(c,tenantId,actorId,'campaign.ai_agent.bound','campaign',campaignId,{aiAgentId});return row}
async function audit(c:pg.PoolClient,tenantId:string,actorId:string,action:string,type:string,id:string,payload:Record<string,unknown>){await c.query(`INSERT INTO audit_events(tenant_id,actor_id,action,resource_type,resource_id,payload) VALUES($1,$2,$3,$4,$5,$6::jsonb)`,[tenantId,actorId,action,type,id,JSON.stringify(payload)])}
