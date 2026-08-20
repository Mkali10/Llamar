# Llamar operator training

This guide explains what each layer does, where it is configured, how a call moves, and how to verify the deployment. Complete it in staging before production access is granted.

## 1. Component map

| Component | Purpose | Main configuration |
|---|---|---|
| Web dashboard | Tenant/admin/agent user interface | `web/`, web bind settings in `.env` |
| Control API | Identity, permissions, campaigns, routing and policy | `backend/`, `LLAMAR_*` in `.env` |
| PostgreSQL | Tenant configuration, jobs, calls, audit and state | `DATABASE_URL`, `database/migrations/` |
| Campaign worker | Claims approved call jobs within campaign limits | `CAMPAIGN_WORKER_*` |
| Voice gateway | Bidirectional CPaaS audio to realtime AI providers | `VOICE_GATEWAY_*` |
| FreeSWITCH | SIP dialogs, RTP, IVR, bridge, conference and recordings | Separate media node; `infra/freeswitch/` contract |
| coturn | NAT/CGNAT relay for browser WebRTC audio | `TURN_*`, Compose `coturn` service |
| Optional Kamailio | HA SIP edge and health-based FreeSWITCH dispatch | Enable only under `SIP_SCALE_AND_KAMAILIO.md` triggers |
| Recording/report workers | Retention and asynchronous exports | storage paths and worker services |

## 2. Call paths

### Browser agent call

1. Agent signs in and requests `/v1/agent/webrtc/config`.
2. API returns SIP WSS details and short-lived TURN credentials.
3. SIP.js registers with FreeSWITCH, directly or through the optional Kamailio edge.
4. ICE tries the viable path; coturn relays media when direct connectivity fails.
5. FreeSWITCH selects the approved trunk and sends the call to the carrier.

### AI CPaaS call

1. Campaign worker leases one job after consent, channel and provider checks.
2. Twilio/Telnyx/Plivo/Vonage originates the PSTN call.
3. Provider opens a signed WebSocket to the voice gateway.
4. Gateway converts audio for the selected OpenAI/Gemini/xAI/NVIDIA provider.
5. Provider callbacks reconcile ringing, answer, failure and completion states.

### Scaled SIP call

1. Llamar reserves a healthy media node before origination.
2. Reservation rejects stale, drained, channel-full or CPS-full nodes.
3. Optional Kamailio sends new SIP signalling only to healthy FreeSWITCH nodes.
4. Existing calls remain on their selected FreeSWITCH node during drain.

## 3. Configuration locations

- `.env`: deployment-specific addresses, secrets, limits and provider credentials.
- `docker-compose.yml`: application containers and private/public bindings.
- `docs/FIREWALL_PORTS.md`: exact inbound/outbound firewall plan.
- `database/migrations/`: versioned database changes; never edit an applied migration.
- `infra/freeswitch/`: media-node contract and required modules.
- `scripts/install.sh`: first deployment.
- `scripts/backup.sh` and `scripts/restore.sh`: disaster recovery.
- `scripts/media-node-heartbeat.sh`: FreeSWITCH capacity heartbeat.

Change host-facing ports in `.env`. Internal ports should change only through a reviewed release because Compose, upstream proxies and health checks must move together.

## 4. Server inventory before installation

Run on every application and media server and save the output in the deployment record:

```bash
cat /etc/os-release
uname -a
lscpu
free -h
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINTS
df -hT
ip -br address
ip route
ss -lntup
docker --version
docker compose version
psql --version
fs_cli -x 'version'
fs_cli -x 'show modules'
timedatectl
```

Also record public IP, NAT type, SIP ALG status, carrier IP ranges, codecs, CPS, channel commitment, expected concurrent AI calls, recording volume and retention period. Without this inventory, a six-month stability claim is not valid.

## 5. Media-node registration and heartbeat

1. Platform admin registers each node with a unique key, private address, tested maximum channels and tested CPS.
2. On the FreeSWITCH server set `LLAMAR_CONTROL_URL`, `LLAMAR_INTERNAL_TOKEN` and `MEDIA_NODE_KEY` in a root-readable environment file.
3. Run `scripts/media-node-heartbeat.sh` every five seconds with systemd.
4. A heartbeat older than 15 seconds makes the node ineligible for new reservations.
5. Drain a node before maintenance. Wait for active channels to reach zero, then restart it.

Never set channel/CPS limits from marketing capacity. Use the lower of carrier allowance and measured server capacity, with operational headroom.

## 6. coturn training

- `TURN_SHARED_SECRET` signs temporary credentials; it never goes to the browser.
- `TURN_CREDENTIAL_TTL_SECONDS` controls credential lifetime.
- `TURN_EXTERNAL_IP` must be the actual public IP seen by agents.
- `TURN_URLS` must resolve to the TURN server.
- UDP is preferred; TCP is fallback for restrictive networks.
- Relay ports must be open exactly as documented.
- Set `WEBRTC_FORCE_TURN=true` only during relay testing; normal production uses all ICE candidates.

Test from an external mobile hotspot, an office network and a forced-relay browser test. Confirm two-way audio, hold, DTMF and reconnect behavior.

## 7. Kamailio training boundary

Kamailio is a SIP proxy, not a PBX and not the media engine. It accepts/protects SIP signalling and selects a healthy FreeSWITCH node. FreeSWITCH still executes the dialplan and carries RTP. Do not enable Kamailio until provider ACLs, dispatcher probes, TLS, two FreeSWITCH nodes and failover tests are ready.

## 8. Daily, weekly and monthly operations

Daily: check API/database readiness, offline/degraded media nodes, failed workers, disk usage, failed calls, carrier alarms and clock sync.

Weekly: test one inbound and outbound call per carrier, forced TURN audio, backup checksum, recording playback and alert delivery.

Monthly: restore a backup into staging, review certificate/secret expiry, patch staging first, inspect capacity peaks, verify provider IP ranges and test drain/failover.

## 9. Six-month release gate

Before claiming six-month operational readiness:

1. Supported OS and pinned container versions.
2. 24-hour expected-load soak test plus peak-CPS test.
3. Carrier-specific SIP/RTP acceptance tests.
4. WebRTC NAT/TURN matrix passed.
5. Backup restoration timed and verified.
6. Disk-growth forecast with alerts at 70%, 80% and 90%.
7. TLS and provider-secret expiry alerts.
8. FreeSWITCH drain and node-failure drill.
9. Database restart and application recovery drill.
10. Current TRAI/DoT/provider review and documented rollback.

Passing this gate reduces operational risk; it is not an uptime or regulatory guarantee.
