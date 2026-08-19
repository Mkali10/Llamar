BEGIN;
CREATE TABLE did_flow_bindings(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES tenants(id),did_assignment_id uuid NOT NULL REFERENCES did_assignments(id),flow_id uuid NOT NULL REFERENCES flows(id),flow_version integer NOT NULL,active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(did_assignment_id,active));
ALTER TABLE did_flow_bindings ENABLE ROW LEVEL SECURITY;ALTER TABLE did_flow_bindings FORCE ROW LEVEL SECURITY;CREATE POLICY did_flow_bindings_isolation ON did_flow_bindings USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
