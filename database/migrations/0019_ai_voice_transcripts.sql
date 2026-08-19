BEGIN;
CREATE TABLE ai_voice_transcripts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES tenants(id),voice_session_id uuid NOT NULL REFERENCES ai_voice_sessions(id),speaker text NOT NULL CHECK(speaker IN('caller','ai','human')),transcript text NOT NULL,is_final boolean NOT NULL DEFAULT true,provider_item_id text,locale text,emotion text,confidence numeric(5,4) CHECK(confidence BETWEEN 0 AND 1),occurred_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX ai_voice_transcripts_session_idx ON ai_voice_transcripts(voice_session_id,occurred_at);
ALTER TABLE ai_voice_transcripts ENABLE ROW LEVEL SECURITY;ALTER TABLE ai_voice_transcripts FORCE ROW LEVEL SECURITY;CREATE POLICY ai_voice_transcripts_isolation ON ai_voice_transcripts USING(tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK(tenant_id=current_setting('app.tenant_id',true)::uuid);
COMMIT;
