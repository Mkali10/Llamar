BEGIN;
ALTER TABLE ai_agents
  ADD COLUMN skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN intents text[] NOT NULL DEFAULT '{}';
ALTER TABLE ai_agent_routes
  ADD COLUMN weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX ai_agent_routes_enabled_did_idx ON ai_agent_routes(did) WHERE enabled;
COMMIT;
