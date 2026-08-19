import {useEffect,useState} from 'react';import {dashboard} from './api';import ProviderSettings from './ProviderSettings';import AgentStudio from './AgentStudio';import RoutingStudio from './RoutingStudio';import CampaignStudio from './CampaignStudio';
const nav = ['Overview', 'Campaigns', 'Live calls', 'AI agents', 'AI routing', 'Flow builder', 'DIDs & approvals', 'Recordings', 'Reports', 'AI providers', 'Team & rights'];
const calls = [
  ['A-92814', 'Outbound', '+91•••• 1842', 'Sales follow-up', 'Connected', '04:18'],
  ['A-92813', 'Inbound', '+91•••• 3091', 'Support IVR', 'In queue', '01:42'],
  ['A-92812', 'Outbound', '+91•••• 6704', 'Payment reminder', 'Ringing', '00:12']
];

export default function App({token}:{token:string}) {
  const [active,setActive]=useState('Overview');
  const [data,setData]=useState<{totalCalls:number;answeredCalls:number;failedCalls:number;talkSeconds:number;averagePddSeconds:string}|null>(null);const [error,setError]=useState('');useEffect(()=>{const to=new Date();const from=new Date(to.getTime()-86400000);dashboard(token,from.toISOString(),to.toISOString()).then(setData).catch(e=>setError(e instanceof Error?e.message:'Dashboard unavailable'))},[token]);const rate=data&&data.totalCalls?`${((data.answeredCalls/data.totalCalls)*100).toFixed(1)}%`:'0%';const metrics=[['Total calls',String(data?.totalCalls??'—'),'Last 24 hours'],['Answer rate',data?rate:'—','Last 24 hours'],['Failed calls',String(data?.failedCalls??'—'),'Last 24 hours'],['Average PDD',data?`${data.averagePddSeconds}s`:'—','Last 24 hours']];
  return <div className="shell">
    <aside><div className="brand"><span className="brandMark">L</span><div><strong>Llamar</strong><small>Control Center</small></div></div>
      <div className="tenant"><span>Workspace</span><b>Acme Operations</b><small>Tenant active</small></div>
      <nav>{nav.map((item, i) => <button onClick={()=>setActive(item)} className={active === item ? 'active' : ''} key={item}><span>{String(i + 1).padStart(2, '0')}</span>{item}</button>)}</nav>
      <div className="connect"><small>Need capacity or integration help?</small><b>Connect with our team</b></div>
    </aside>
    <main>{active==='AI providers'&&<ProviderSettings token={token}/>} {active==='AI agents'&&<AgentStudio token={token}/>} {active==='AI routing'&&<RoutingStudio token={token}/>} {active==='Campaigns'&&<CampaignStudio token={token}/>}<div className={['AI providers','AI agents','AI routing','Campaigns'].includes(active)?'viewHidden':''}><header><div><p>Operations / Overview</p><h1>Good evening, Ankit</h1><span>Live operational view across calling, agents and compliance.</span></div><div className="actions"><button>Export report</button><button className="primary" onClick={()=>setActive('Campaigns')}>Create campaign</button></div></header>
      {error&&<section className="notice errorNotice"><div><b>Dashboard data unavailable</b><span>{error}</span></div></section>}
      <section className="notice"><div><b>Compliance guard active</b><span>Consent, DLT and provider policy checks are enforced before call execution.</span></div><button>Review policies</button></section>
      <section className="metrics">{metrics.map(([name, value, note]) => <article key={name}><div><span>{name}</span><i>LIVE</i></div><strong>{value}</strong><small>{note}</small></article>)}</section>
      <section className="grid"><article className="panel calls"><div className="panelHead"><div><h2>Live call activity</h2><p>Masked customer data · realtime state</p></div><button>Open monitor</button></div>
        <div className="table"><div className="row headings"><span>Call</span><span>Direction</span><span>Number</span><span>Campaign</span><span>State</span><span>Duration</span></div>{calls.map(row => <div className="row" key={row[0]}>{row.map((cell, i) => <span className={i === 4 ? `state s${cell.replace(' ', '')}` : ''} key={i}>{cell}</span>)}</div>)}</div>
      </article><article className="panel capacity"><div className="panelHead"><div><h2>Capacity</h2><p>Tenant limits</p></div><i>Healthy</i></div>
        <div className="ring"><div><strong>128</strong><span>of 200 channels</span></div></div>
        <div className="bars"><label><span>Channels</span><b>64%</b></label><progress value="64" max="100"/><label><span>CPS</span><b>42%</b></label><progress value="42" max="100"/></div>
      </article></section>
      <footer><span>TRAI/DoT-aligned controls require deployment-specific review.</span><span>No uptime, delivery or compliance guarantee is implied.</span></footer></div>
    </main>
  </div>;
}
