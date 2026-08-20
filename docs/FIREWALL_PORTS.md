# Llamar firewall and port plan

Llamar application services use non-default ports and are configurable through `.env`. Keep database, API, voice gateway and FreeSWITCH control traffic on loopback or a private network. A custom port is not a replacement for authentication, TLS or source-IP filtering.

## Default custom ports

| Service | Port/protocol | Default exposure | Configuration |
|---|---:|---|---|
| Web dashboard (direct HTTP) | 18080/TCP | Development; private behind TLS proxy in production | `LLAMAR_WEB_PORT`, `LLAMAR_WEB_BIND_IP` |
| API (direct HTTP) | 18443/TCP | Loopback/private only | `LLAMAR_API_PORT`, `LLAMAR_API_BIND_IP` |
| Voice media gateway | 18090/TCP/WSS | Loopback/private; expose through TLS proxy | `VOICE_GATEWAY_PORT`, `VOICE_GATEWAY_BIND_IP` |
| PostgreSQL | 15432/TCP | Docker/private network only; never public | `DATABASE_URL` |
| FreeSWITCH ESL control | 18021/TCP | Private management network only | `FREESWITCH_ESL_PORT` |
| SIP signalling | 15060/UDP or TCP | Provider/agent IP ranges only | `FREESWITCH_SIP_PORT` |
| SIP signalling with TLS | 15061/TCP | Provider/agent IP ranges only | `FREESWITCH_SIP_TLS_PORT` |
| Browser softphone WSS | 17443/TCP | Agent networks or TLS proxy only | `FREESWITCH_WSS_PORT`, `WEBRTC_WSS_URL` |
| RTP media | 20000-24999/UDP | Provider/media-relay IP ranges only | `FREESWITCH_RTP_START`, `FREESWITCH_RTP_END` |
| coturn listener | 13478/UDP,TCP | Public for authenticated WebRTC clients | `TURN_PORT` |
| coturn TLS listener | 15443/TCP | Optional after certificate configuration | `TURN_TLS_PORT` |
| coturn relay media | 49160-49260/UDP | Public; authenticated allocations only | `TURN_RELAY_MIN`, `TURN_RELAY_MAX` |

## Production inbound allow-list

Open only the paths used by the selected deployment:

| Destination | Allow from | Required? | Purpose |
|---|---|---|---|
| 443/TCP on edge proxy | Internet or approved tenant networks | Recommended compatibility exception | HTTPS dashboard/API, provider webhooks and WSS. Browsers and many cloud providers expect standard HTTPS. Direct Llamar services remain on custom private ports. |
| 10443/TCP on edge proxy | Approved networks | Optional alternative | Non-default public HTTPS when every browser, webhook provider and client supports an explicit port. Do not assume all providers support it. |
| 15060/UDP,TCP | Configured carrier/SIP trunk IP ranges | Only for SIP trunking | SIP signalling without TLS. Prefer TLS where supported. |
| 15061/TCP | Configured carrier/SIP trunk and agent IP ranges | Only for SIP TLS | Encrypted SIP signalling. |
| 17443/TCP | Approved agent networks | Only if not proxied through 443/10443 | WebRTC secure WebSocket signalling. |
| 20000-24999/UDP | Configured carrier/media relay IP ranges | For live calls | RTP/SRTP audio. Narrow the range further to match capacity. |
| 13478/UDP,TCP | Agent networks/Internet | Browser calling | Authenticated TURN/STUN listener using short-lived credentials. |
| 49160-49260/UDP | Agent networks/Internet | TURN-relayed calls | coturn relay range; size it from measured concurrent relay usage. |
| Operator-selected SSH port, for example 22222/TCP | Fixed administrator/VPN IPs | Operations only | Server administration. Llamar does not change SSH configuration. |

Do **not** publicly allow 15432, 18021, 18090 or 18443. Port 18080 should also remain private in production; publish the dashboard through the TLS edge proxy.

## Outbound traffic

Outbound rules depend on enabled plugins. Common destinations are HTTPS 443/TCP for Twilio, Telnyx, Plivo, Vonage, OpenAI, Gemini, xAI, NVIDIA, meeting providers and URL knowledge ingestion; DNS 53/UDP,TCP and NTP 123/UDP for host operation; and the email provider's configured SMTP port (often 465 or 587/TCP). STUN/TURN and SIP carrier destinations must follow the selected provider's published IP ranges and ports.

Provider ports are not Llamar listening ports and cannot be changed unilaterally. Permit them only when their integration is enabled.

## Changing ports later

Host-facing ports and bind addresses can be changed in `.env`, then applied with `docker compose up -d`. Internal container ports are intentionally stable custom ports so service discovery and health checks remain deterministic. If an internal port is changed, update Docker Compose, service configuration, reverse-proxy upstream and health checks together.
