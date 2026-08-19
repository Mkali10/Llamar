export type RealtimeTranscript = {speaker:'caller'|'ai';text:string;final:boolean;providerItemId?:string|undefined};
export type RealtimeCallbacks = {onReady():void;onAudio(payload:string):void;onTranscript(transcript:RealtimeTranscript):void;onInterruption():void;onEvent(type:string,payload:Record<string,unknown>):void;onError(error:Error):void};
export type RealtimeConfig = {instructions:string;voice:string;safetyIdentifier:string};
export interface RealtimeProvider {connect():Promise<void>;appendAudio(base64Pcmu:string):void;close():void}
export type RealtimeProviderKey='openai'|'gemini'|'xai';
