# Implementation status

## Setup baseline — complete

- Docker Compose for API, PostgreSQL migrations and web dashboard.
- Secret-safe installer that refuses example credentials.
- Versioned SQL migrations with forced tenant RLS.
- Node.js/TypeScript JWT verification and role/tenant enforcement.
- Compliance fail-closed evaluation and IVR graph validation APIs.
- Reseller, tenant, DID approval, campaigns, lists, flows, trunks, calls and recordings schema.
- FreeSWITCH ESL and XML-CURL bootstrap contract.
- Responsive white-label operations dashboard shell.
- CI for Python tests, frontend build, Compose and shell syntax.
- Checksum-protected database backup/restore and fresh-server runbook.

## Product implementation — active

Current reliability additions include authenticated coturn credentials, WebRTC ICE configuration,
media-node heartbeat/capacity registration, drain mode and fail-closed CPS/channel reservations.
See `OPERATOR_TRAINING.md` for configuration and operational training.

The primary application stack is Node.js/TypeScript + React with FreeSWITCH. The earlier
unapproved Python control-plane prototype has been removed; its history remains recoverable in Git.

The setup baseline is not a claim that the complete production dialer is finished. The
following require implementation and controlled integration testing:

1. Persistent CRUD/services for tenants, approvals, campaigns, flows and reporting.
2. Identity onboarding, email-code verification, refresh/revocation and passwordless/SSO policy.
3. FreeSWITCH XML-CURL renderer, leased ESL controller and reconciliation.
4. Agent WebRTC desk, queues, manual/power/predictive dialing and disposition/rechurn.
5. Listen/whisper/barge, recording authorization and realtime wallboards.
6. Provider adapters, billing/credit ledger, webhooks, CRM and optional AI voice.
7. Production HA, object storage, observability, restore drills and provider/TRAI/DoT sign-off.

No public pricing or service guarantee is included; commercial surfaces use “Connect with our team.”
