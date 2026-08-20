BEGIN;
CREATE TABLE campaign_telephony_routes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES tenants(id),campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,provider_connection_id uuid NOT NULL REFERENCES provider_connections(id),priority integer NOT NULL CHECK(priority BETWEEN 1 AND 1000),enabled boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(campaign_id,provider_connection_id),UNIQUE(campaign_id,priority));
INSERT INTO campaign_telephony_routes(tenant_id,campaign_id,provider_connection_id,priority) SELECT tenant_id,id,telephony_provider_id,100 FROM campaigns WHERE telephony_provider_id IS NOT NULL ON CONFLICT DO NOTHING;
CREATE INDEX campaign_telephony_routes_select_idx ON campaign_telephony_routes(campaign_id,enabled,priority);
ALTER TABLE campaign_telephony_routes ENABLE ROW LEVEL SECURITY;ALTER TABLE campaign_telephony_routes FORCE ROW LEVEL SECURITY;
CREATE POLICY campaign_telephony_routes_isolation ON campaign_telephony_routes USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
