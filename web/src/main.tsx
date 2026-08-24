import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthGate from './AuthGate';
import './styles.css';
import './provider.css';
import './studio.css';
import './routing.css';
import './campaign.css';
import './live.css';
import './telephony.css';
import './team.css';
import './dids.css';
import './flow.css';
import './records.css';
import './meetings.css';
import './agent-desk.css';
import './integrations.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><React.Suspense fallback={<div className="appLoading">Loading workspace…</div>}><AuthGate /></React.Suspense></React.StrictMode>);
