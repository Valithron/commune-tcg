-- Phase 1 isolated-preview schema
-- Target only: com-tcg-db-preview
-- Database UUID: 4fb86e2a-59f9-4f3c-aa34-af4b64973f38
-- Additive only. No DROP, DELETE, or data correction statements.

CREATE TABLE IF NOT EXISTS player_auth_users (
  slot_id TEXT PRIMARY KEY,
  username TEXT,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL,
  pin_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_auth_sessions (
  token TEXT PRIMARY KEY,
  slot_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL DEFAULT '',
  character_id TEXT NOT NULL DEFAULT '',
  card_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_resources (
  user_id TEXT PRIMARY KEY,
  pull_tickets INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  daily_ticket_claimed_on TEXT,
  energy INTEGER NOT NULL DEFAULT 10,
  energy_updated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pull_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pull_count INTEGER NOT NULL,
  ticket_cost INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pull_history_user_created
ON pull_history (user_id, created_at);

CREATE TABLE IF NOT EXISTS pull_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pull_count INTEGER NOT NULL,
  ticket_cost INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  execution_token TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pull_requests_user_created
ON pull_requests (user_id, created_at);

CREATE TABLE IF NOT EXISTS user_battle_squads (
  user_id TEXT PRIMARY KEY,
  squad_card_ids TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS battle_attempts (
  attempt_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  encounter_id TEXT NOT NULL,
  encounter_version TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  mvp_version TEXT NOT NULL,
  seed TEXT NOT NULL,
  ordered_card_ids TEXT NOT NULL,
  result_json TEXT NOT NULL,
  settlement_json TEXT,
  settlement_token TEXT,
  energy_spent INTEGER NOT NULL DEFAULT 0,
  surrender INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  finalized_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_battle_attempts_user_status
ON battle_attempts (user_id, status, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_attempts_one_active_per_user
ON battle_attempts (user_id)
WHERE status IN ('pending', 'settling');

CREATE TABLE IF NOT EXISTS battle_daily_victories (
  user_id TEXT NOT NULL,
  encounter_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, encounter_id, local_date)
);

CREATE TABLE IF NOT EXISTS battle_history (
  id TEXT PRIMARY KEY,
  attempt_id TEXT,
  user_id TEXT NOT NULL,
  encounter_id TEXT NOT NULL,
  victory INTEGER NOT NULL,
  squad_power INTEGER NOT NULL,
  enemy_power INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_battle_history_user_created
ON battle_history (user_id, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_history_user_attempt
ON battle_history (user_id, attempt_id)
WHERE attempt_id IS NOT NULL AND TRIM(attempt_id) != '';

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

