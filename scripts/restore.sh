#!/bin/sh
set -eu

env_value(){ sed -n "s/^$1=//p" .env | tail -n 1; }
postgres_user="${POSTGRES_USER:-$(env_value POSTGRES_USER)}"
postgres_db="${POSTGRES_DB:-$(env_value POSTGRES_DB)}"
postgres_port="${POSTGRES_PORT:-$(env_value POSTGRES_PORT)}"
postgres_port="${postgres_port:-15432}"
case "$postgres_user:$postgres_db:$postgres_port" in *[!A-Za-z0-9_.:-]*) echo 'Invalid PostgreSQL restore configuration'; exit 1;; esac

archive="${1:?Usage: scripts/restore.sh BACKUP.tar.gz}"
sha256sum -c "${archive}.sha256"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
tar -xzf "$archive" -C "$work"
dump="$(find "$work" -type f -name postgres.dump -print -quit)"
test -n "$dump"
sha256sum -c "${dump}.sha256"

docker compose up -d postgres
docker compose exec -T postgres pg_restore --clean --if-exists --no-owner --no-acl \
  -p "$postgres_port" -U "$postgres_user" -d "$postgres_db" < "$dump"
docker compose run --rm migrate
docker compose up -d
curl -fsS "http://127.0.0.1:${LLAMAR_API_PORT:-18443}/health/ready"
printf '\nRestore completed. Restore object storage and secrets from the same recovery set.\n'
