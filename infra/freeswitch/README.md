# FreeSWITCH node contract

FreeSWITCH runs as a separate media-plane node. Do not expose ESL (8021) publicly.

Required modules: `mod_sofia`, `mod_event_socket`, `mod_xml_curl`, `mod_commands`,
`mod_dptools`, `mod_conference`, and the codecs approved by the SIP provider.

## Configuration strategy

- Static, version-controlled bootstrap for module loading, network bindings and ESL.
- Dynamic directory/dialplan/gateway configuration served through `mod_xml_curl`.
- One leased ESL command consumer per node.
- FreeSWITCH remains authoritative for active channel state.
- Reconciliation compares ESL events, periodic `show channels` snapshots and database state.

Firewall rules must restrict SIP and RTP to approved providers/client networks and ESL to
the controller network. Credentials belong in the deployment secret manager, never Git.

Before production, validate the provider-specific From/PAI/PPI rules, numbering, codecs,
DTMF, early media, RTP addressing, channel/CPS limits, failover and lawful record retention.
