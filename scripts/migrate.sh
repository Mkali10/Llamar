#!/bin/sh
set -eu

export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
port="${POSTGRES_PORT:-15432}"
for migration in /migrations/*.sql; do
  name="$(basename "$migration")"
  psql -v ON_ERROR_STOP=1 -h postgres -p "$port" -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL
  applied="$(psql -At -h postgres -p "$port" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1 FROM schema_migrations WHERE version = '$name'")"
  if [ "$applied" != "1" ]; then
    psql -v ON_ERROR_STOP=1 -h postgres -p "$port" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$migration"
    psql -v ON_ERROR_STOP=1 -h postgres -p "$port" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "INSERT INTO schema_migrations(version) VALUES ('$name')"
  fi
done
