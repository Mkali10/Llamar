#!/bin/sh
set -eu

env_value(){ sed -n "s/^$1=//p" .env | tail -n 1; }
postgres_user="${POSTGRES_USER:-$(env_value POSTGRES_USER)}"
postgres_db="${POSTGRES_DB:-$(env_value POSTGRES_DB)}"
postgres_port="${POSTGRES_PORT:-$(env_value POSTGRES_PORT)}"
postgres_port="${postgres_port:-15432}"
case "$postgres_user:$postgres_db:$postgres_port" in *[!A-Za-z0-9_.:-]*) echo 'Invalid PostgreSQL backup configuration'; exit 1;; esac

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
root="${BACKUP_DIR:-./backups}/$stamp"
mkdir -p "$root"

docker compose exec -T postgres pg_dump --format=custom --no-owner --no-acl \
  -p "$postgres_port" -U "$postgres_user" "$postgres_db" > "$root/postgres.dump"

cp .env.example "$root/env.template"
git rev-parse HEAD > "$root/application.commit" 2>/dev/null || printf 'unknown\n' > "$root/application.commit"
find database/migrations -type f -name '*.sql' -exec sha256sum {} \; > "$root/migrations.sha256"
sha256sum "$root/postgres.dump" > "$root/postgres.dump.sha256"

tar -czf "${root}.tar.gz" -C "$(dirname "$root")" "$(basename "$root")"
sha256sum "${root}.tar.gz" > "${root}.tar.gz.sha256"
printf 'Backup created: %s.tar.gz\n' "$root"
