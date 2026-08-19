BEGIN;

CREATE TABLE contact_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name text NOT NULL,
    object_key text NOT NULL,
    file_sha256 text NOT NULL CHECK (length(file_sha256) = 64),
    row_count integer NOT NULL DEFAULT 0 CHECK (row_count >= 0),
    status text NOT NULL DEFAULT 'validating'
        CHECK (status IN ('validating', 'ready', 'rejected', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name text NOT NULL,
    mode text NOT NULL CHECK (mode IN ('preview', 'manual', 'power', 'predictive', 'ivr_broadcast')),
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_approval', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
    contact_list_id uuid REFERENCES contact_lists(id),
    cps_limit numeric(8,2) NOT NULL DEFAULT 1 CHECK (cps_limit > 0),
    channel_limit integer NOT NULL DEFAULT 1 CHECK (channel_limit > 0),
    timezone text NOT NULL DEFAULT 'Asia/Kolkata',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE flows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name text NOT NULL,
    active_version integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE flow_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    flow_id uuid NOT NULL REFERENCES flows(id),
    version integer NOT NULL CHECK (version > 0),
    state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'validated', 'published', 'retired')),
    definition jsonb NOT NULL,
    definition_sha256 text NOT NULL CHECK (length(definition_sha256) = 64),
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (flow_id, version),
    CHECK ((state = 'published' AND published_at IS NOT NULL) OR state <> 'published')
);

ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists FORCE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows FORCE ROW LEVEL SECURITY;
ALTER TABLE flow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY contact_lists_isolation ON contact_lists USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY campaigns_isolation ON campaigns USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY flows_isolation ON flows USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY flow_versions_isolation ON flow_versions USING (tenant_id = current_setting('app.tenant_id', true)::uuid) WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

COMMIT;
