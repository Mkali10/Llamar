import {Inviter,Registerer,SessionState,UserAgent,type Invitation,type Session} from 'sip.js';
export type PhoneConfig={wssUrl:string;uri:string;authorizationUsername:string;authorizationPassword:string};
export class WebRtcPhone{
 private agent:UserAgent;private registerer:Registerer;private session:Session|null=null;
 constructor(config:PhoneConfig,onIncoming:(from:string)=>void){const uri=UserAgent.makeURI(config.uri);if(!uri)throw new Error('invalid SIP URI');this.agent=new UserAgent({uri,transportOptions:{server:config.wssUrl},authorizationUsername:config.authorizationUsername,authorizationPassword:config.authorizationPassword,delegate:{onInvite:(invitation:Invitation)=>{this.session=invitation;onIncoming(invitation.remoteIdentity.uri.toString())}}});this.registerer=new Registerer(this.agent)}
 async connect(){await this.agent.start();await this.registerer.register()}
 async call(target:string){const uri=UserAgent.makeURI(target);if(!uri)throw new Error('invalid destination');const inviter=new Inviter(this.agent,uri,{sessionDescriptionHandlerOptions:{constraints:{audio:true,video:false}}});this.session=inviter;await inviter.invite()}
 async answer(){if(this.session&&'accept'in this.session)await (this.session as Invitation).accept({sessionDescriptionHandlerOptions:{constraints:{audio:true,video:false}}})}
 async hangup(){if(!this.session)return;if(this.session.state===SessionState.Initial&&'reject'in this.session)await (this.session as Invitation).reject();else if('bye'in this.session)await (this.session as Inviter).bye();this.session=null}
 async disconnect(){await this.hangup();await this.registerer.unregister();await this.agent.stop()}
}
