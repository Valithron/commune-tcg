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

ALTER TABLE user_resources ADD COLUMN energy INTEGER NOT NULL DEFAULT 10;
ALTER TABLE user_resources ADD COLUMN energy_updated_at TEXT;
