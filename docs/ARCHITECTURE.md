# Architecture

## Binding principles

1. FreeSWITCH is authoritative for active call state.
2. Media nodes scale independently from the control plane.
3. Every business record is tenant-scoped. PostgreSQL RLS is enabled and forced.
4. Tenant identity propagates through database, cache, events, object storage,
   metrics, SIP domains and audit records.
5. Compliance decisions fail closed; plugins cannot bypass validated tenant policy.
6. Avoid unnecessary microservices until measured isolation or scale requires them.
7. coturn is the WebRTC NAT traversal layer; browsers receive short-lived credentials only.
8. Kamailio is an optional SIP edge. Business call flow remains in Llamar/FreeSWITCH so enabling it does not change tenant behavior.

## Components

- Node.js/TypeScript control plane: identity, tenant configuration and orchestration.
- PostgreSQL: tenants, approvals, campaigns, flows, ledger and audit history.
- FreeSWITCH nodes: SIP/RTP and call execution.
- coturn: STUN/TURN relay for browser agents behind NAT, CGNAT and restrictive firewalls.
- Optional Kamailio edge: SIP admission, topology hiding, trunk dispatch and health-based FreeSWITCH selection for scaled deployments.
- ESL controller: leased single-consumer command ownership plus reconciliation.
- Object storage: recordings, prompts, imports and approval documents under tenant prefixes.
- Web application: permission-aware Platform Admin, Tenant and Agent experiences.

FreeSWITCH configuration uses a static bootstrap with versioned dynamic configuration.
Inbound flows follow `Save Draft → Validate → Publish`; a DID resolves to one tenant and
one immutable published flow version.

TRAI/DoT and provider rules change. Production policy packs must be versioned, dated and
reviewed by qualified compliance/legal personnel. Llamar does not claim regulatory
approval, guaranteed deliverability, or guaranteed compliance.

## SIP scale decision

FreeSWITCH can manage multiple trunks and substantial channel counts when CPS, codecs, CPU, network and provider limits are enforced. Add Kamailio before production when using two or more FreeSWITCH nodes, active/active SIP ingress, registration load above a single node's tested capacity, topology hiding, geographic routing, or carrier-level health dispatch. It is not a substitute for FreeSWITCH and does not process RTP in this design.

The supported route is `carrier/agent → optional Kamailio → healthy FreeSWITCH node → Llamar control/AI services`. Kamailio configuration will be generated from the same approved trunk inventory; direct and proxied modes must pass the same contract tests.
