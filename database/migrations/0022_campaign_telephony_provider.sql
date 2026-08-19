BEGIN;
ALTER TABLE campaigns ADD COLUMN telephony_provider_id uuid REFERENCES provider_connections(id);
CREATE INDEX campaigns_telephony_provider_idx ON campaigns(telephony_provider_id);
COMMIT;
