BEGIN;
ALTER TABLE integration_events ADD COLUMN lease_owner text,ADD COLUMN lease_until timestamptz,ADD COLUMN delivered_at timestamptz,ADD COLUMN last_error text;
CREATE INDEX integration_events_delivery_idx ON integration_events(tenant_id,state,available_at,created_at) WHERE state IN('queued','processing');
COMMIT;
