import net from 'node:net';

export class EslClient {
  constructor(private readonly host:string,private readonly port:number,private readonly password:string) {}
  async command(command:string,timeoutMs=3000):Promise<string> {
    if(!/^[a-zA-Z0-9_+\- .,:@/{}=&()]+$/.test(command)) throw new Error('unsafe ESL command');
    return new Promise((resolve,reject)=>{
      const socket=net.createConnection({host:this.host,port:this.port});let buffer='';let authenticated=false;let commandSent=false;let settled=false;
      const finish=(error?:Error,value?:string)=>{if(settled)return;settled=true;clearTimeout(timer);socket.destroy();error?reject(error):resolve(value??'')};
      const timer=setTimeout(()=>finish(new Error('ESL timeout')),timeoutMs);
      socket.on('data',chunk=>{buffer+=chunk.toString('utf8');if(!authenticated&&buffer.includes('auth/request')){buffer='';authenticated=true;socket.write(`auth ${this.password}\n\n`);return;}if(authenticated&&!commandSent&&buffer.includes('Reply-Text: +OK')){buffer='';commandSent=true;socket.write(`api ${command}\n\n`);return;}const match=buffer.match(/Content-Length:\s*(\d+)\r?\n\r?\n([\s\S]*)/i);const length=Number(match?.[1]??0);const body=match?.[2];if(body&&body.length>=length)finish(undefined,body.slice(0,length));});
      socket.on('error',error=>finish(error));socket.on('end',()=>buffer?finish(undefined,buffer):finish(new Error('ESL connection closed')));
    });
  }
  async channels(){const raw=await this.command('show channels as json');const parsed=JSON.parse(raw) as {rows?:unknown[]};return parsed.rows??[];}
}
