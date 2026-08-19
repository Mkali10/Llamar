const nav = ['Overview', 'Campaigns', 'Live calls', 'Flow builder', 'DIDs & approvals', 'Recordings', 'Reports', 'Team & rights'];
const metrics = [
  ['Active calls', '128', '+12 in 5 min'], ['Answer rate', '62.4%', 'Today'],
  ['Available agents', '46', '8 on wrap-up'], ['PDD p95', '1.2s', 'Within policy']
];
const calls = [
  ['A-92814', 'Outbound', '+91•••• 1842', 'Sales follow-up', 'Connected', '04:18'],
  ['A-92813', 'Inbound', '+91•••• 3091', 'Support IVR', 'In queue', '01:42'],
  ['A-92812', 'Outbound', '+91•••• 6704', 'Payment reminder', 'Ringing', '00:12']
];

export default function App() {
  return <div className="shell">
    <aside><div className="brand"><span className="brandMark">L</span><div><strong>Llamar</strong><small>Control Center</small></div></div>
      <div className="tenant"><span>Workspace</span><b>Acme Operations</b><small>Tenant active</small></div>
      <nav>{nav.map((item, i) => <button className={i === 0 ? 'active' : ''} key={item}><span>{String(i + 1).padStart(2, '0')}</span>{item}</button>)}</nav>
      <div className="connect"><small>Need capacity or integration help?</small><b>Connect with our team</b></div>
    </aside>
    <main><header><div><p>Operations / Overview</p><h1>Good evening, Ankit</h1><span>Live operational view across calling, agents and compliance.</span></div><div className="actions"><button>Export report</button><button className="primary">Create campaign</button></div></header>
      <section className="notice"><div><b>Compliance guard active</b><span>Consent, DLT and provider policy checks are enforced before call execution.</span></div><button>Review policies</button></section>
      <section className="metrics">{metrics.map(([name, value, note]) => <article key={name}><div><span>{name}</span><i>LIVE</i></div><strong>{value}</strong><small>{note}</small></article>)}</section>
      <section className="grid"><article className="panel calls"><div className="panelHead"><div><h2>Live call activity</h2><p>Masked customer data · realtime state</p></div><button>Open monitor</button></div>
        <div className="table"><div className="row headings"><span>Call</span><span>Direction</span><span>Number</span><span>Campaign</span><span>State</span><span>Duration</span></div>{calls.map(row => <div className="row" key={row[0]}>{row.map((cell, i) => <span className={i === 4 ? `state s${cell.replace(' ', '')}` : ''} key={i}>{cell}</span>)}</div>)}</div>
      </article><article className="panel capacity"><div className="panelHead"><div><h2>Capacity</h2><p>Tenant limits</p></div><i>Healthy</i></div>
        <div className="ring"><div><strong>128</strong><span>of 200 channels</span></div></div>
        <div className="bars"><label><span>Channels</span><b>64%</b></label><progress value="64" max="100"/><label><span>CPS</span><b>42%</b></label><progress value="42" max="100"/></div>
      </article></section>
      <footer><span>TRAI/DoT-aligned controls require deployment-specific review.</span><span>No uptime, delivery or compliance guarantee is implied.</span></footer>
    </main>
  </div>;
}
