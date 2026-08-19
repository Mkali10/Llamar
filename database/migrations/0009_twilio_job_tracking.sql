BEGIN;
ALTER TABLE campaign_call_jobs ADD COLUMN provider_key text,ADD COLUMN provider_call_id text;
CREATE UNIQUE INDEX campaign_call_jobs_provider_call_idx ON campaign_call_jobs(provider_key,provider_call_id) WHERE provider_call_id IS NOT NULL;
COMMIT;
