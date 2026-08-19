# Installation

Baseline: Ubuntu 24.04 LTS or Debian 12, Docker Engine and Compose v2.

```bash
git clone https://github.com/Mkali10/Llamar.git
cd Llamar
cp .env.example .env
# Replace all example secrets.
docker compose up --build -d
docker compose ps
curl -fsS http://127.0.0.1:8080/health/live
```

Preferred one-command path after editing `.env`:

```bash
make install
make smoke
```

Dashboard: `http://SERVER_IP:3000`; API documentation: `http://SERVER_IP:8080/docs`.

Do not expose this development stack directly to the internet. Production requires
TLS, external secret management, PostgreSQL migrations plus forced RLS, encrypted
object storage, restricted SIP/RTP/ESL networks, audit logging, monitoring, restore
drills, provider onboarding, and a current TRAI/DoT/legal review.

Safe update: backup, pull reviewed release, migrate, build, restart, health-check,
smoke-test, then monitor.
