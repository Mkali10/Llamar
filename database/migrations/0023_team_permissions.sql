BEGIN;
ALTER TABLE tenant_users ADD COLUMN permissions text[] NOT NULL DEFAULT '{}',ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
COMMIT;
