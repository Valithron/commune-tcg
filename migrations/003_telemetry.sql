CREATE TABLE IF NOT EXISTS telemetry_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  release_commit TEXT NOT NULL,
  environment TEXT NOT NULL,
  player_id TEXT NOT NULL,
  analytics_session_id TEXT NOT NULL,
  route TEXT NOT NULL,
  device_category TEXT NOT NULL,
  browser_category TEXT NOT NULL,
  outcome TEXT NOT NULL,
  duration_ms INTEGER,
  error_category TEXT NOT NULL,
  related_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_session_time
ON telemetry_events (analytics_session_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_player_time
ON telemetry_events (player_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_name_time
ON telemetry_events (event_name, occurred_at);

CREATE TABLE IF NOT EXISTS telemetry_daily_aggregates (
  event_day TEXT NOT NULL,
  event_name TEXT NOT NULL,
  environment TEXT NOT NULL,
  route TEXT NOT NULL,
  outcome TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  total_duration_ms INTEGER NOT NULL,
  aggregated_at TEXT NOT NULL,
  PRIMARY KEY (event_day, event_name, environment, route, outcome)
);

CREATE TABLE IF NOT EXISTS telemetry_admin_audit (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  filters_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);
