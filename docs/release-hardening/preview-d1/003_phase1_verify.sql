-- Run after 001_phase1_schema.sql and 002_phase1_fixtures.sql.

SELECT name, type
FROM sqlite_master
WHERE type IN ('table', 'index')
  AND name NOT LIKE 'sqlite_%'
ORDER BY type, name;

PRAGMA table_info(user_resources);
PRAGMA table_info(cards);
PRAGMA table_info(battle_attempts);
PRAGMA table_info(telemetry_events);

SELECT
  (SELECT COUNT(*) FROM player_auth_users) AS auth_slots,
  (SELECT COUNT(*) FROM user_resources WHERE user_id IN ('sterling', 'cydney')) AS phase1_resource_rows,
  (SELECT COUNT(*) FROM cards WHERE id LIKE 'phase1_library_%' AND owner_user_id = '') AS phase1_library_rows,
  (SELECT COUNT(*) FROM cards WHERE id LIKE 'phase1_owned_%' AND owner_user_id IN ('sterling', 'cydney')) AS phase1_owned_rows,
  (SELECT COUNT(*) FROM cards WHERE id LIKE 'phase1_%' AND json_valid(card_json) = 0) AS invalid_phase1_card_json,
  (SELECT COUNT(*) FROM telemetry_events) AS telemetry_events_before_validation;

SELECT user_id, pull_tickets, gold, energy, energy_updated_at
FROM user_resources
WHERE user_id IN ('sterling', 'cydney')
ORDER BY user_id;

SELECT owner_user_id, COUNT(*) AS card_count
FROM cards
WHERE id LIKE 'phase1_%'
GROUP BY owner_user_id
ORDER BY owner_user_id;

