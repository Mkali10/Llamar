BEGIN;
CREATE TABLE provider_call_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES tenants(id),provider_key text NOT NULL,provider_call_id text NOT NULL,event_type text NOT NULL,payload jsonb NOT NULL,occurred_at timestamptz NOT NULL DEFAULT now(),UNIQUE(provider_key,provider_call_id,event_type,occurred_at));
ALTER TABLE provider_call_events ENABLE ROW LEVEL SECURITY;ALTER TABLE provider_call_events FORCE ROW LEVEL SECURITY;CREATE POLICY provider_call_events_isolation ON provider_call_events USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
