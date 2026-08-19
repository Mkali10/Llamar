# Architecture

## Binding principles

1. FreeSWITCH is authoritative for active call state.
2. Media nodes scale independently from the control plane.
3. Every business record is tenant-scoped. PostgreSQL RLS is enabled and forced.
4. Tenant identity propagates through database, cache, events, object storage,
   metrics, SIP domains and audit records.
5. Compliance decisions fail closed; plugins cannot bypass validated tenant policy.
6. Avoid unnecessary microservices until measured isolation or scale requires them.

## Components

- FastAPI control plane: identity, tenant configuration and orchestration.
- PostgreSQL: tenants, approvals, campaigns, flows, ledger and audit history.
- FreeSWITCH nodes: SIP/RTP and call execution.
- ESL controller: leased single-consumer command ownership plus reconciliation.
- Object storage: recordings, prompts, imports and approval documents under tenant prefixes.
- Web application: permission-aware Platform Admin, Tenant and Agent experiences.

FreeSWITCH configuration uses a static bootstrap with versioned dynamic configuration.
Inbound flows follow `Save Draft → Validate → Publish`; a DID resolves to one tenant and
one immutable published flow version.

TRAI/DoT and provider rules change. Production policy packs must be versioned, dated and
reviewed by qualified compliance/legal personnel. Llamar does not claim regulatory
approval, guaranteed deliverability, or guaranteed compliance.
