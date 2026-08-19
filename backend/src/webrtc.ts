import {z} from 'zod';
export const AgentWebRtcRequest=z.object({extension:z.string().regex(/^\d{3,10}$/)});
export function publicWebRtcConfig(extension:string){const wssUrl=process.env.WEBRTC_WSS_URL??'';const domain=process.env.WEBRTC_SIP_DOMAIN??'';if(!wssUrl.startsWith('wss://')||!domain)throw new Error('WebRTC is not configured');return {wssUrl,uri:`sip:${extension}@${domain}`,domain,iceServers:[{urls:'stun:stun.l.google.com:19302'}]}}
