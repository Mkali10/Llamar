const base='/api';
async function request<T>(path:string,init:RequestInit={}){const response=await fetch(`${base}${path}`,init);const data=response.status===204?null:await response.json();if(!response.ok)throw new Error(data?.error??`Request failed (${response.status})`);return data as T}
export async function requestCode(tenantId:string,email:string){return request('/v1/auth/email/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tenantId,email})})}
export async function verifyCode(tenantId:string,email:string,code:string){return request<{accessToken:string;refreshToken:string;expiresIn:number}>('/v1/auth/email/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tenantId,email,code})})}
export async function dashboard(token:string,from:string,to:string){const q=new URLSearchParams({from,to});return request<{totalCalls:number;answeredCalls:number;failedCalls:number;talkSeconds:number;averagePddSeconds:string}>(`/v1/reports/dashboard?${q}`,{headers:{authorization:`Bearer ${token}`}})}
export type RealtimeProvider={id:string;providerKey:string;displayName:string;status:string;capabilities:string[];configuration:Record<string,unknown>};
export type VoiceProfile={id:string;name:string;primaryLocale:string;supportedLocales:string[];voiceId:string;status:string;realtimeConnectionId:string|null;providerKey:string|null;providerName:string|null};
const auth=(token:string)=>({authorization:`Bearer ${token}`,'content-type':'application/json'});
export async function realtimeProviders(token:string){return request<{items:RealtimeProvider[];available:string[]}>('/v1/providers/realtime',{headers:auth(token)})}
export async function addRealtimeProvider(token:string,input:{providerKey:string;displayName:string;secretRef:string}){return request<RealtimeProvider>('/v1/providers/realtime',{method:'POST',headers:auth(token),body:JSON.stringify({...input,configuration:{}})})}
export async function testRealtimeProvider(token:string,id:string){return request<RealtimeProvider&{test:{ready:boolean;latencyMs:number;detail:string}}>(`/v1/providers/realtime/${id}/test`,{method:'POST',headers:auth(token)})}
export async function voiceProfiles(token:string){return request<{items:VoiceProfile[]}>('/v1/ai/voice-profiles',{headers:auth(token)})}
export async function bindVoiceProvider(token:string,profileId:string,providerConnectionId:string){return request(`/v1/ai/voice-profiles/${profileId}/realtime-provider`,{method:'POST',headers:auth(token),body:JSON.stringify({providerConnectionId})})}
export type AiAgent={id:string;name:string;languages:string[];skills:string[];intents:string[];maxConcurrentCalls:number;emotionAdaptation:boolean;meetingHandoff:boolean;status:string;voiceProfileId:string;voiceProfileName:string;providerKey:string|null;trainingSourceCount:number};
export async function aiAgents(token:string){return request<{items:AiAgent[]}>('/v1/ai/agents',{headers:auth(token)})}
export async function addVoiceProfile(token:string,input:Record<string,unknown>){return request<VoiceProfile>('/v1/ai/voice-profiles',{method:'POST',headers:auth(token),body:JSON.stringify(input)})}
export async function addAiAgent(token:string,input:Record<string,unknown>){return request<AiAgent>('/v1/ai/agents',{method:'POST',headers:auth(token),body:JSON.stringify(input)})}
export async function setAiAgentStatus(token:string,id:string,status:string){return request(`/v1/ai/agents/${id}/status`,{method:'POST',headers:auth(token),body:JSON.stringify({status})})}
export type AiRoute={id:string;did:string;strategy:string;agentIds:string[];fallbackAgentId:string|null;weights:Record<string,number>;criteria:Record<string,unknown>;enabled:boolean;updatedAt:string;agents:{id:string;name:string;status:string}[]};
export async function aiRoutes(token:string){return request<{items:AiRoute[]}>('/v1/ai/routes',{headers:auth(token)})}
export async function saveAiRoute(token:string,input:Record<string,unknown>){return request<AiRoute>('/v1/ai/routes',{method:'POST',headers:auth(token),body:JSON.stringify(input)})}
export async function bindCampaignAiAgent(token:string,campaignId:string,aiAgentId:string|null){return request(`/v1/campaigns/${campaignId}/ai-agent`,{method:'POST',headers:auth(token),body:JSON.stringify({aiAgentId})})}
