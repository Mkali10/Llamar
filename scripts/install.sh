#!/bin/sh
set -eu

command -v docker >/dev/null 2>&1 || { echo 'Docker Engine is required'; exit 1; }
docker compose version >/dev/null 2>&1 || { echo 'Docker Compose v2 is required'; exit 1; }
test -f .env || { cp .env.example .env; echo 'Edit .env and replace every example secret, then rerun.'; exit 1; }
grep -Eq 'change-me|replace-with' .env && { echo 'Refusing to start with example secrets in .env'; exit 1; }

docker compose up -d postgres
docker compose run --rm migrate
docker compose up --build -d api
curl --retry 20 --retry-delay 2 --retry-connrefused -fsS http://127.0.0.1:8080/health/ready
printf '\nLlamar control plane is ready. API docs: http://127.0.0.1:8080/docs\n'
