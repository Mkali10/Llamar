BEGIN;
ALTER TABLE notification_outbox ADD COLUMN lease_owner text,ADD COLUMN lease_until timestamptz,ADD COLUMN provider_message_id text,ADD COLUMN last_error text,ADD COLUMN sent_at timestamptz;
CREATE INDEX notification_outbox_claim_idx ON notification_outbox(state,available_at,created_at);
COMMIT;
