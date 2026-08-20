BEGIN;
CREATE TABLE media_nodes(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_key text NOT NULL UNIQUE CHECK(node_key~'^[a-z0-9][a-z0-9-]{1,62}$'),
  display_name text NOT NULL,
  private_address text NOT NULL,
  region text NOT NULL DEFAULT 'primary',
  status text NOT NULL DEFAULT 'offline' CHECK(status IN('active','draining','offline','degraded')),
  max_channels integer NOT NULL CHECK(max_channels BETWEEN 1 AND 100000),
  cps_limit numeric(8,2) NOT NULL CHECK(cps_limit>0 AND cps_limit<=10000),
  active_channels integer NOT NULL DEFAULT 0 CHECK(active_channels>=0),
  last_heartbeat_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE media_node_reservations(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_node_id uuid NOT NULL REFERENCES media_nodes(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  call_reference text NOT NULL,
  state text NOT NULL DEFAULT 'reserved' CHECK(state IN('reserved','connected','released','expired')),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  released_at timestamptz,
  UNIQUE(tenant_id,call_reference)
);
CREATE INDEX media_nodes_available_idx ON media_nodes(status,last_heartbeat_at,active_channels);
CREATE INDEX media_node_reservations_capacity_idx ON media_node_reservations(media_node_id,state,expires_at,reserved_at);
COMMIT;
