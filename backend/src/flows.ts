import { z } from 'zod';

const Node = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  type: z.enum(['answer','play','menu','queue','ai_agent','knowledge','meeting','webhook','voicemail','hangup']),
  config: z.record(z.string(), z.unknown()).default({})
});
const Edge = z.object({source:z.string(),target:z.string(),outcome:z.string().default('default')});
export const Flow = z.object({name:z.string().min(3).max(120),entryNodeId:z.string(),nodes:z.array(Node).min(1).max(200),edges:z.array(Edge).max(500)});

export function validateFlow(input: unknown) {
  const flow = Flow.parse(input); const ids = new Set(flow.nodes.map(n=>n.id));
  if (ids.size !== flow.nodes.length) throw new Error('node IDs must be unique');
  if (!ids.has(flow.entryNodeId)) throw new Error('entry node does not exist');
  for (const edge of flow.edges) if (!ids.has(edge.source)||!ids.has(edge.target)) throw new Error('edge references unknown node');
  const reached = new Set([flow.entryNodeId]); let changed = true;
  while(changed){changed=false;for(const e of flow.edges)if(reached.has(e.source)&&!reached.has(e.target)){reached.add(e.target);changed=true;}}
  const unreachable=[...ids].filter(id=>!reached.has(id)); if(unreachable.length) throw new Error(`unreachable nodes: ${unreachable.join(', ')}`);
  if(!flow.nodes.some(n=>n.type==='hangup')) throw new Error('flow requires a hangup node');
  return flow;
}
