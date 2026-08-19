BEGIN;

CREATE TABLE provider_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  category text NOT NULL CHECK (category IN ('telephony','stt','tts','llm','realtime_ai','avatar','calendar','meeting')),
  provider_key text NOT NULL, display_name text NOT NULL, secret_ref text NOT NULL,
  status text NOT NULL DEFAULT 'disabled' CHECK (status IN ('disabled','testing','active','degraded','revoked')),
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, category, display_name)
);

CREATE TABLE international_call_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  provider_connection_id uuid NOT NULL REFERENCES provider_connections(id), country_code char(2) NOT NULL,
  enabled boolean NOT NULL DEFAULT false, allowed_number_types text[] NOT NULL DEFAULT ARRAY['mobile','landline']::text[],
  max_cps numeric(8,2) NOT NULL CHECK (max_cps > 0), max_channels integer NOT NULL CHECK (max_channels > 0),
  verified_caller_id_required boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider_connection_id, country_code)
);

CREATE TABLE ai_voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL, primary_locale text NOT NULL, supported_locales text[] NOT NULL,
  allow_code_switching boolean NOT NULL DEFAULT true, stt_connection_id uuid REFERENCES provider_connections(id),
  tts_connection_id uuid REFERENCES provider_connections(id), voice_id text NOT NULL, fallback_voice_id text,
  speaking_rate numeric(4,2) NOT NULL DEFAULT 1 CHECK (speaking_rate BETWEEN 0.5 AND 2),
  pitch numeric(5,2) NOT NULL DEFAULT 0 CHECK (pitch BETWEEN -20 AND 20),
  emotion_adaptation boolean NOT NULL DEFAULT false, character_name text NOT NULL,
  persona text NOT NULL, visual_asset_ref text, avatar_connection_id uuid REFERENCES provider_connections(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','retired')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (tenant_id, name)
);

ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY; ALTER TABLE provider_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE international_call_policies ENABLE ROW LEVEL SECURITY; ALTER TABLE international_call_policies FORCE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_profiles ENABLE ROW LEVEL SECURITY; ALTER TABLE ai_voice_profiles FORCE ROW LEVEL SECURITY;
CREATE POLICY provider_connections_isolation ON provider_connections USING (tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK (tenant_id=current_setting('app.tenant_id',true)::uuid);
CREATE POLICY international_call_policies_isolation ON international_call_policies USING (tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK (tenant_id=current_setting('app.tenant_id',true)::uuid);
CREATE POLICY ai_voice_profiles_isolation ON ai_voice_profiles USING (tenant_id=current_setting('app.tenant_id',true)::uuid) WITH CHECK (tenant_id=current_setting('app.tenant_id',true)::uuid);

COMMIT;
