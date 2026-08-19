# Deployment checklist

## Control plane

- Dedicated non-root service account and current supported OS.
- TLS reverse proxy; API not directly exposed.
- PostgreSQL 16 with encryption, restricted network and tested replica/backup.
- Secrets supplied by a secret manager; no plaintext secrets in Git or backup manifests.
- Run migrations once per release before API rollout.
- Central logs, metrics, tracing, NTP and alerts.

## Media plane

- FreeSWITCH on dedicated nodes outside the web workload scheduler.
- SIP/RTP allowlists and private ESL network.
- Provider-specific health checks, channel/CPS enforcement and failover drills.
- Recording storage encrypted with tenant prefixes, access audit and retention lifecycle.

## Release gate

1. Backup and verify checksum.
2. Deploy reviewed commit and run migrations.
3. Verify liveness/readiness and tenant RLS tests.
4. Run controlled inbound/outbound, DTMF, recording and hangup-cause tests.
5. Confirm consent/DLT/provider policy evidence and current TRAI/DoT review.
6. Complete rollback and restore drill before declaring production readiness.
