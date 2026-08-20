#!/bin/sh
set -eu

api="${LLAMAR_API_URL:-http://127.0.0.1:18443}"
web="${LLAMAR_WEB_URL:-http://127.0.0.1:3000}"
curl -fsS "$api/health/live" | grep -q '"status":"ok"'
curl -fsS "$api/health/ready" | grep -q '"status":"ready"'
curl -fsS "$api/docs/json" | grep -q 'Llamar Control Plane'
curl -fsS "$web/" | grep -q 'Llamar Control Center'
tenant_id="${BOOTSTRAP_TENANT_ID:-}"
admin_email="${BOOTSTRAP_ADMIN_EMAIL:-}"
if [ -n "$tenant_id" ] && [ -n "$admin_email" ] && [ "${LLAMAR_ENV:-development}" != "production" ]; then
  login="$(curl -fsS -X POST -H 'content-type: application/json' -d "{\"tenantId\":\"$tenant_id\",\"email\":\"$admin_email\"}" "$api/v1/auth/email/request")"
  printf '%s' "$login" | grep -q '"accepted":true'
  printf '%s' "$login" | grep -q '"debugCode":"[0-9][0-9][0-9][0-9][0-9][0-9]"'
fi
printf 'Smoke test passed: API and web are reachable.\n'
