import {z} from 'zod';
export const TrainingSource=z.discriminatedUnion('type',[
 z.object({type:z.literal('script'),script:z.string().min(20).max(100000)}),
 z.object({type:z.literal('url'),url:z.string().url().refine(v=>v.startsWith('https://'),'HTTPS URL required'),refreshHours:z.number().int().min(1).max(720).default(24)}),
 z.object({type:z.literal('flow'),flowId:z.string().uuid(),version:z.number().int().positive()})
]);
export const AiAgent=z.object({name:z.string().min(2).max(80),voiceProfileId:z.string().uuid(),languages:z.array(z.string().min(2).max(16)).min(1),trainingSources:z.array(TrainingSource).min(1).max(50),emotionAdaptation:z.boolean().default(false),meetingHandoff:z.boolean().default(false),maxConcurrentCalls:z.number().int().min(1).max(1000),status:z.enum(['draft','review','published','paused']).default('draft')});
export const AgentRoute=z.object({did:z.string().regex(/^\+[1-9]\d{6,14}$/),strategy:z.enum(['intent','language','skill','segment','availability','weighted']),agentIds:z.array(z.string().uuid()).min(1).max(100),fallbackAgentId:z.string().uuid().nullable().default(null)});
export type AgentRoute=z.infer<typeof AgentRoute>;
export function chooseAgent(route:AgentRoute,candidates:{id:string;available:boolean;weight?:number}[]):string|null{const allowed=new Set(route.agentIds);const ready=candidates.filter(c=>allowed.has(c.id)&&c.available);if(!ready.length)return route.fallbackAgentId;return [...ready].sort((a,b)=>(b.weight??1)-(a.weight??1)||a.id.localeCompare(b.id))[0]?.id??null}
