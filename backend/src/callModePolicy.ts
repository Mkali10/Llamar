import type {OutboundCallRequest} from './telephony/types.js';

export type CampaignMode='preview'|'manual'|'power'|'predictive'|'ivr_broadcast';

export function machineDetectionForMode(mode:CampaignMode):OutboundCallRequest['machineDetection']{
  if(mode==='predictive')return 'Enable';
  if(mode==='ivr_broadcast')return 'DetectMessageEnd';
  return undefined;
}
