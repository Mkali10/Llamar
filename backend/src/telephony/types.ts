import { z } from 'zod';
export const E164=z.string().regex(/^\+[1-9]\d{6,14}$/);
export const OutboundCallRequest=z.object({to:E164,from:E164.optional(),instructionUrl:z.string().url().refine(v=>v.startsWith('https://'),'HTTPS instruction URL required').optional(),streamUrl:z.string().url().refine(v=>v.startsWith('wss://'),'secure WebSocket stream URL required').optional(),statusCallbackUrl:z.string().url().refine(v=>v.startsWith('https://'),'HTTPS callback URL required'),timeoutSeconds:z.number().int().min(5).max(120).default(30),machineDetection:z.enum(['Enable','DetectMessageEnd']).optional()});
export type OutboundCallRequest=z.infer<typeof OutboundCallRequest>;
export type CallLaunch={providerCallId:string;status:string;provider:'twilio'|'telnyx'|'plivo'|'vonage'};
export interface TelephonyAdapter{createCall(request:OutboundCallRequest):Promise<CallLaunch>}
