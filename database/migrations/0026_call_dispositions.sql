BEGIN;
CREATE TABLE call_dispositions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES tenants(id),call_job_id uuid REFERENCES campaign_call_jobs(id),call_session_id uuid REFERENCES call_sessions(id),agent_user_id uuid NOT NULL,code text NOT NULL CHECK(code IN('connected','sale','callback','no_answer','busy','wrong_number','dnc','not_interested','resolved','other')),notes text,callback_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),CHECK(num_nonnulls(call_job_id,call_session_id)=1),CHECK((code='callback' AND callback_at IS NOT NULL) OR code<>'callback'));
CREATE UNIQUE INDEX one_disposition_per_job ON call_dispositions(call_job_id) WHERE call_job_id IS NOT NULL;
CREATE UNIQUE INDEX one_disposition_per_session ON call_dispositions(call_session_id) WHERE call_session_id IS NOT NULL;
ALTER TABLE call_dispositions ENABLE ROW LEVEL SECURITY;ALTER TABLE call_dispositions FORCE ROW LEVEL SECURITY;
CREATE POLICY call_dispositions_isolation ON call_dispositions USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
