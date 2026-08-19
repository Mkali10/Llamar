# Llamar complete product scope

## Product model

Llamar is a white-label, multi-tenant cloud communication and AI calling platform.
It supports Platform Admin, Reseller, Client/Tenant, Supervisor, QA, Agent and Auditor
experiences with capability, entitlement and permission checks on every API and UI action.

## Calling

- Inbound, outbound, manual, preview, power, progressive and predictive dialing.
- Browser WebRTC phone, provisioned SIP softphone and click-to-call without a softphone.
- Queues, skills, wrap-up, dispositions, rechurn, callbacks, DNC, consent and time-window policy.
- IVR, visual flow builder, voicemail, conference, transfer, hold, mute and DTMF.
- Live monitor, listen, whisper, barge, coach, takeover and recording controls.
- SIP trunks, DIDs, caller-ID policy, CPS/channels, least-cost routing, failover and number pools.
- Cloud calling across approved SIP/CPaaS providers through isolated provider adapters.
- International PSTN calling through tenant-enabled providers such as Twilio, Telnyx, Vonage,
  Plivo and Bandwidth, plus custom SIP carriers. Routing considers country permission, number type,
  verified caller ID, local regulations, cost, quality, residency, emergency restrictions and failover.
- Call recording, pause/resume, encryption, retention, masking, access audit and legal hold.

## AI calling and orchestration

- One AI agent can originate calls to many permitted numbers through campaign concurrency controls.
- One business number can route callers to multiple AI agents using intent, language, skill,
  customer segment, availability, experiment or flow conditions.
- Multiple AI agents can collaborate in one interaction through a controlled orchestrator;
  only one voice owner speaks at a time to avoid overlapping audio.
- Human handoff to agent, supervisor or meeting flow with full transcript/context transfer.
- Barge-in, interruption, turn detection, latency budgets, silence handling and fallback prompts.
- Emotion/sentiment cues such as calm, confused, frustrated or urgent may adapt tone and routing.
  They are probabilistic signals, never medical/psychological diagnosis or sole basis for adverse action.
- Voice profiles, language, pronunciation dictionary, speaking rate, tone and approved persona controls.
- Multilingual and code-switching conversations. Hindi and English are first-class; providers may add
  other BCP-47 languages/locales and Indian languages including Bengali, Marathi, Telugu, Tamil,
  Gujarati, Urdu, Kannada, Odia, Malayalam, Punjabi and Assamese when their selected STT/TTS models support them.
- Per-agent voice selection with provider, voice ID, locale, gender/style metadata, speed, pitch,
  pronunciation and fallback voice. Voice cloning requires explicit documented authorization.
- Avatar/character profiles with name, visual identity, personality, tone, greeting, language set and
  channel-specific representation. Phone calls use the avatar's approved voice/persona; web/video
  channels may use an approved 2D/3D or realtime video avatar provider plugin.
- Provider plugins for STT, TTS, LLM and realtime speech; tenant-level provider/model selection,
  budget, latency, residency and fallback policies.

## AI agent training

1. **Script based:** goals, approved statements, objections, branching, mandatory disclosures,
   forbidden claims and escalation rules.
2. **URL/knowledge based:** authorized URL crawl, robots/access checks, content extraction,
   versioned citations, refresh schedule, review and publish. The agent answers only from approved content.
3. **Visual flow based:** nodes for prompt, gather, condition, API, knowledge lookup, AI response,
   queue/human transfer, meeting, payment, OTP, survey and hangup.

Agents also support uploaded approved documents, test conversations, evaluation datasets,
versioning, draft/review/publish/rollback and complete change audit.

## Meeting during a call

- Agent or AI can offer a meeting while the call is active.
- Check connected calendar availability, collect timezone and attendee consent, create/reschedule/cancel,
  send email/SMS/WhatsApp confirmation and place the event/link into CRM.
- Optionally transfer the current call into an audio conference or send a video-meeting link.
- Calendar and meeting providers are plugins; tenant administrators control scopes and rights.

## Plugins and integrations

- Telephony/SIP/CPaaS, AI STT/TTS/LLM/realtime, CRM, helpdesk, calendars, video meetings,
  email, SMS, WhatsApp, payments, storage, identity/SSO, analytics, webhooks and custom apps.
- Plugin lifecycle: install, configure, test, enable, disable, upgrade, revoke and audit.
- Secret vault references only; no plugin secret is returned to browsers or logs.
- Per tenant/user/role rights for view, install, configure, use, export and administer.
- Plugin hooks are isolated, timeout-limited, retry/fallback-aware and cannot bypass core policy.

## Granular rights

Rights include every domain and action: tenants, users, roles, campaigns, lists, contacts,
flows, agents, AI agents, knowledge, DIDs, trunks, caller IDs, recordings, transcripts,
reports, billing, credits, provider credentials, plugins, meetings, monitor/listen/whisper/barge,
exports, retention, audit and system settings. UI visibility never replaces backend authorization.

## Commercial and compliance constraints

- No public price or service/compliance/delivery guarantee; use **Connect with our team**.
- DID new/change requests require documents; Platform Admin direct assignment is separately audited.
- Current TRAI/DoT, DLT/DND, provider, consent, privacy and recording requirements are deployment gates.
- Calling and URL ingestion must be limited to authorized, lawful use with evidence and audit retention.
