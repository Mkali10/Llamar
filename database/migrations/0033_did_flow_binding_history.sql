BEGIN;
ALTER TABLE did_flow_bindings DROP CONSTRAINT IF EXISTS did_flow_bindings_did_assignment_id_active_key;
CREATE UNIQUE INDEX did_flow_bindings_one_active_idx ON did_flow_bindings(did_assignment_id) WHERE active;
COMMIT;
