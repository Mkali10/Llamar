#!/bin/sh
set -eu
export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
tenant_id="${BOOTSTRAP_TENANT_ID:?BOOTSTRAP_TENANT_ID is required}"
tenant_name="${BOOTSTRAP_TENANT_NAME:?BOOTSTRAP_TENANT_NAME is required}"
admin_email="${BOOTSTRAP_ADMIN_EMAIL:?BOOTSTRAP_ADMIN_EMAIL is required}"
psql -v ON_ERROR_STOP=1 -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --set=tenant_id="$tenant_id" --set=tenant_name="$tenant_name" --set=admin_email="$admin_email" <<'SQL'
INSERT INTO tenants(id,legal_name,display_name,status)
VALUES (:'tenant_id'::uuid,:'tenant_name',:'tenant_name','active')
ON CONFLICT(id) DO UPDATE SET legal_name=excluded.legal_name,display_name=excluded.display_name,status='active',updated_at=now();
SELECT set_config('app.tenant_id',:'tenant_id',false);
INSERT INTO tenant_users(tenant_id,email,role,status)
VALUES (:'tenant_id'::uuid,lower(:'admin_email'),'owner','active')
ON CONFLICT(tenant_id,email) DO UPDATE SET role='owner',status='active';
SQL
printf 'Bootstrap ready. Tenant ID: %s  Admin: %s\n' "$tenant_id" "$admin_email"
