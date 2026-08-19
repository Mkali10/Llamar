#!/bin/sh
set -eu

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
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$dump"
docker compose run --rm migrate
docker compose up -d
curl -fsS http://127.0.0.1:8080/health/ready
printf '\nRestore completed. Restore object storage and secrets from the same recovery set.\n'
