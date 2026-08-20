#!/bin/sh
set -eu
export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
host="${POSTGRES_HOST:-postgres}";port="${POSTGRES_PORT:-15432}";user="${POSTGRES_USER:?POSTGRES_USER is required}";source_db="${POSTGRES_DB:?POSTGRES_DB is required}";verify_db="${POSTGRES_VERIFY_DB:-llamar_restore_verify}";dump="$(mktemp)"
cleanup(){ dropdb -h "$host" -p "$port" -U "$user" --if-exists "$verify_db" >/dev/null 2>&1 || true;rm -f "$dump"; }
trap cleanup EXIT INT TERM
pg_dump -h "$host" -p "$port" -U "$user" -d "$source_db" --format=custom --no-owner --no-acl --file="$dump"
dropdb -h "$host" -p "$port" -U "$user" --if-exists "$verify_db"
createdb -h "$host" -p "$port" -U "$user" "$verify_db"
pg_restore -h "$host" -p "$port" -U "$user" -d "$verify_db" --no-owner --no-acl --exit-on-error "$dump"
source_migrations="$(psql -h "$host" -p "$port" -U "$user" -d "$source_db" -Atc 'SELECT count(*) FROM schema_migrations')"
restored_migrations="$(psql -h "$host" -p "$port" -U "$user" -d "$verify_db" -Atc 'SELECT count(*) FROM schema_migrations')"
source_tenants="$(psql -h "$host" -p "$port" -U "$user" -d "$source_db" -Atc 'SELECT count(*) FROM tenants')"
restored_tenants="$(psql -h "$host" -p "$port" -U "$user" -d "$verify_db" -Atc 'SELECT count(*) FROM tenants')"
test "$source_migrations" = "$restored_migrations"
test "$source_tenants" = "$restored_tenants"
printf 'Restore verification passed: %s migrations, %s tenants.\n' "$restored_migrations" "$restored_tenants"
