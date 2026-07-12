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
