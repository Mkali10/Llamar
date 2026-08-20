BEGIN;
ALTER TABLE report_exports ADD COLUMN attempts integer NOT NULL DEFAULT 0,ADD COLUMN error_message text,ADD COLUMN lease_owner text,ADD COLUMN lease_until timestamptz,ADD COLUMN completed_at timestamptz;
CREATE INDEX report_exports_worker_idx ON report_exports(state,created_at) WHERE state IN('queued','failed');
COMMIT;
