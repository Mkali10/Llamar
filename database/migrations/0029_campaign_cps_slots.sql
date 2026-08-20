BEGIN;
CREATE TABLE campaign_dial_slots(tenant_id uuid NOT NULL REFERENCES tenants(id),campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,bucket_start timestamptz NOT NULL,launches integer NOT NULL CHECK(launches>0),PRIMARY KEY(campaign_id,bucket_start));
CREATE INDEX campaign_dial_slots_cleanup_idx ON campaign_dial_slots(bucket_start);
ALTER TABLE campaign_dial_slots ENABLE ROW LEVEL SECURITY;ALTER TABLE campaign_dial_slots FORCE ROW LEVEL SECURITY;
CREATE POLICY campaign_dial_slots_isolation ON campaign_dial_slots USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
