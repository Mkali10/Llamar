BEGIN;
CREATE TABLE call_handoffs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES tenants(id),call_job_id uuid NOT NULL REFERENCES campaign_call_jobs(id) ON DELETE CASCADE,requested_by text NOT NULL CHECK(requested_by IN('ai','agent','supervisor','system')),reason text NOT NULL,priority integer NOT NULL DEFAULT 100 CHECK(priority BETWEEN 1 AND 1000),status text NOT NULL DEFAULT 'queued' CHECK(status IN('queued','assigned','completed','cancelled','failed')),assigned_user_id uuid REFERENCES tenant_users(id),assigned_session_id uuid REFERENCES agent_sessions(id),requested_at timestamptz NOT NULL DEFAULT now(),assigned_at timestamptz,completed_at timestamptz,outcome text);
CREATE UNIQUE INDEX call_handoffs_one_open_idx ON call_handoffs(call_job_id) WHERE status IN('queued','assigned');
CREATE INDEX call_handoffs_queue_idx ON call_handoffs(status,priority,requested_at);
ALTER TABLE call_handoffs ENABLE ROW LEVEL SECURITY;ALTER TABLE call_handoffs FORCE ROW LEVEL SECURITY;
CREATE POLICY call_handoffs_isolation ON call_handoffs USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
