#!/bin/sh
set -eu

command -v docker >/dev/null 2>&1 || { echo 'Docker Engine is required'; exit 1; }
docker compose version >/dev/null 2>&1 || { echo 'Docker Compose v2 is required'; exit 1; }
test -f .env || { cp .env.example .env; echo 'Edit .env and replace every example secret, then rerun.'; exit 1; }
grep -Eq 'change-me|replace-with' .env && { echo 'Refusing to start with example secrets in .env'; exit 1; }

docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm bootstrap
docker compose up --build -d api campaign-worker knowledge-worker voice-gateway web
if [ "${LLAMAR_ENV:-development}" = "production" ]; then
  test -n "${SMTP_HOST:-}" || { echo 'SMTP_HOST is required in production'; exit 1; }
  docker compose up -d notification-worker
fi
curl --retry 20 --retry-delay 2 --retry-connrefused -fsS http://127.0.0.1:8080/health/ready
printf '\nLlamar is ready. Dashboard: http://127.0.0.1:3000  API docs: http://127.0.0.1:8080/docs\n'
printf 'Sign in with BOOTSTRAP_TENANT_ID and BOOTSTRAP_ADMIN_EMAIL from .env.\n'
