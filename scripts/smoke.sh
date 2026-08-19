#!/bin/sh
set -eu

api="${LLAMAR_API_URL:-http://127.0.0.1:8080}"
web="${LLAMAR_WEB_URL:-http://127.0.0.1:3000}"
curl -fsS "$api/health/live" | grep -q '"status":"ok"'
curl -fsS "$api/health/ready" | grep -q '"status":"ready"'
curl -fsS "$api/openapi.json" | grep -q 'Llamar Control Plane'
curl -fsS "$web/" | grep -q 'Llamar Control Center'
printf 'Smoke test passed: API and web are reachable.\n'
