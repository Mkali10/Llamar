# Installation

Baseline: Ubuntu 24.04 LTS or Debian 12, Docker Engine and Compose v2.

```bash
git clone https://github.com/Mkali10/Llamar.git
cd Llamar
cp .env.example .env
# Replace all example secrets. Generate the required values:
openssl rand -hex 32
uuidgen
# Put the generated UUID in BOOTSTRAP_TENANT_ID and your email in BOOTSTRAP_ADMIN_EMAIL.
# Set TURN_EXTERNAL_IP to the server's public IPv4 address, TURN_REALM/TURN_URLS to
# the TURN DNS name, and generate TURN_SHARED_SECRET with: openssl rand -hex 32
make install
docker compose ps
curl -fsS http://127.0.0.1:18443/health/live
```

Preferred one-command path after editing `.env`:

```bash
make install
make smoke
```

Dashboard: `http://SERVER_IP:18080`; API documentation: `http://127.0.0.1:18443/docs` (loopback by default). Review `FIREWALL_PORTS.md` before production exposure.

Sign in with `BOOTSTRAP_TENANT_ID` and `BOOTSTRAP_ADMIN_EMAIL`. Development mode
shows the configured six-digit development code on the login screen. Production
mode never returns a code and requires working SMTP settings.

Do not expose this development stack directly to the internet. Production requires
TLS, external secret management, PostgreSQL migrations plus forced RLS, encrypted
object storage, restricted SIP/RTP/ESL networks, audit logging, monitoring, restore
drills, provider onboarding, and a current TRAI/DoT/legal review.

Safe update: backup, pull reviewed release, migrate, build, restart, health-check,
smoke-test, then monitor.
