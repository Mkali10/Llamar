BEGIN;

CREATE TABLE resellers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name text NOT NULL,
    display_name text NOT NULL,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants ADD COLUMN reseller_id uuid REFERENCES resellers(id);

CREATE TABLE did_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    requested_number text,
    provider text NOT NULL,
    request_type text NOT NULL CHECK (request_type IN ('new', 'change')),
    document_object_key text NOT NULL,
    document_sha256 text NOT NULL CHECK (length(document_sha256) = 64),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewed_by uuid,
    review_note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz,
    CHECK ((status = 'pending' AND reviewed_at IS NULL) OR status <> 'pending')
);

CREATE TABLE did_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    did text NOT NULL UNIQUE,
    provider text NOT NULL,
    source_request_id uuid REFERENCES did_requests(id),
    assigned_by uuid NOT NULL,
    assignment_mode text NOT NULL CHECK (assignment_mode IN ('approved_request', 'platform_admin_direct')),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (assignment_mode <> 'approved_request' OR source_request_id IS NOT NULL)
);

ALTER TABLE did_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE did_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE did_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE did_assignments FORCE ROW LEVEL SECURITY;

CREATE POLICY did_requests_isolation ON did_requests
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY did_assignments_isolation ON did_assignments
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

COMMIT;
