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

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthGate /></React.StrictMode>);
