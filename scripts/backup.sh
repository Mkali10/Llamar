#!/bin/sh
set -eu

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
root="${BACKUP_DIR:-./backups}/$stamp"
mkdir -p "$root"

docker compose exec -T postgres pg_dump --format=custom --no-owner --no-acl \
  -U "$POSTGRES_USER" "$POSTGRES_DB" > "$root/postgres.dump"

cp .env.example "$root/env.template"
git rev-parse HEAD > "$root/application.commit" 2>/dev/null || printf 'unknown\n' > "$root/application.commit"
find database/migrations -type f -name '*.sql' -exec sha256sum {} \; > "$root/migrations.sha256"
sha256sum "$root/postgres.dump" > "$root/postgres.dump.sha256"

tar -czf "${root}.tar.gz" -C "$(dirname "$root")" "$(basename "$root")"
sha256sum "${root}.tar.gz" > "${root}.tar.gz.sha256"
printf 'Backup created: %s.tar.gz\n' "$root"
