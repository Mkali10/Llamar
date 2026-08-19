BEGIN;

CREATE TABLE sip_trunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name text NOT NULL,
    provider text NOT NULL,
    gateway_name text NOT NULL UNIQUE,
    max_channels integer NOT NULL CHECK (max_channels > 0),
    cps_limit numeric(8,2) NOT NULL CHECK (cps_limit > 0),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disabled', 'degraded')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE call_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    freeswitch_uuid uuid NOT NULL UNIQUE,
    campaign_id uuid REFERENCES campaigns(id),
    trunk_id uuid REFERENCES sip_trunks(id),
    direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    from_number text NOT NULL,
    to_number text NOT NULL,
    state text NOT NULL CHECK (state IN ('created', 'ringing', 'answered', 'bridged', 'completed', 'failed')),
    hangup_cause text,
    started_at timestamptz NOT NULL DEFAULT now(),
    answered_at timestamptz,
    ended_at timestamptz,
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE recording_objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    call_session_id uuid NOT NULL REFERENCES call_sessions(id),
    object_key text NOT NULL UNIQUE,
    codec text NOT NULL,
    size_bytes bigint CHECK (size_bytes >= 0),
    sha256 text CHECK (sha256 IS NULL OR length(sha256) = 64),
    retention_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sip_trunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_trunks FORCE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE recording_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_objects FORCE ROW LEVEL SECURITY;

CREATE POLICY sip_trunks_isolation ON sip_trunks USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY call_sessions_isolation ON call_sessions USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY recording_objects_isolation ON recording_objects USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

COMMIT;
