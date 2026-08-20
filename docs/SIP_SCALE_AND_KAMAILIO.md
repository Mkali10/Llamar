# SIP scaling and optional Kamailio edge

## Supported deployment profiles

### Direct profile

Use provider trunks and browser registrations directly on one FreeSWITCH node. This is the default for development, controlled pilots and production loads that remain within measured CPS/channel/CPU/network limits.

### SIP-edge profile

Place Kamailio in front of two or more FreeSWITCH nodes. Kamailio owns SIP admission, source allow-lists, rate limits, topology hiding and health-based dispatch. FreeSWITCH remains authoritative for dialogs, media and call applications; Llamar remains authoritative for tenant policy and routing intent.

## Mandatory adoption triggers

Enable the SIP-edge profile before launch if any condition applies:

- Two or more active FreeSWITCH nodes receive the same public SIP traffic.
- A carrier requires multiple signalling endpoints or fast gateway/node failover.
- Browser/SIP registration load exceeds the validated single-node envelope.
- Public SIP requires topology hiding and edge-level flood protection.
- Geographic or maintenance-aware node selection is required.

## Reliability rules

- Never advertise more channels or CPS than both the carrier and healthy media pool can sustain.
- Reject new work before overload; do not queue realtime SIP transactions indefinitely.
- Health probes, passive failure detection and drain mode must remove an unhealthy node without dropping established calls.
- Do not automatically retry an answered call on another node; that risks duplicate customer calls.
- Keep RTP anchored on the selected FreeSWITCH/media path. Kamailio does not relay RTP in this design.
- Test every trunk for caller identity headers, DTMF, early media, codecs, re-INVITE, hold, transfer and hangup causes.

Kamailio remains optional in Compose until its dispatcher, TLS certificates, provider ACLs and failover tests are supplied for the actual deployment. This avoids presenting an untested SIP proxy as production protection.
