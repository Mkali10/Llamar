BEGIN;
ALTER TABLE agent_sessions ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX one_open_agent_session ON agent_sessions(tenant_id,user_id) WHERE disconnected_at IS NULL;
COMMIT;
