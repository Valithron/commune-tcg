-- Read-only inventory after the authenticated Phase 1 validation harness.
-- Target only: com-tcg-db-preview
-- PIN hashes and session tokens are intentionally excluded.

SELECT
  slot_id,
  username,
  display_name,
  CASE WHEN pin_hash IS NULL THEN 0 ELSE 1 END AS pin_set,
  updated_at
FROM player_auth_users
WHERE slot_id IN ('sterling', 'cydney')
ORDER BY slot_id;

SELECT slot_id, COUNT(*) AS active_session_count
FROM player_auth_sessions
WHERE slot_id IN ('sterling', 'cydney')
GROUP BY slot_id
ORDER BY slot_id;

SELECT
  user_id,
  pull_tickets,
  gold,
  daily_ticket_claimed_on,
  energy,
  energy_updated_at,
  updated_at
FROM user_resources
WHERE user_id IN ('sterling', 'cydney')
ORDER BY user_id;

SELECT
  id,
  owner_user_id,
  character_id,
  json_extract(card_json, '$.name') AS card_name,
  json_extract(card_json, '$.rarity') AS rarity,
  COALESCE(json_extract(card_json, '$.xp'), json_extract(card_json, '$.progression.xp'), 0) AS xp,
  COALESCE(json_extract(card_json, '$.level'), json_extract(card_json, '$.progression.level'), 1) AS level,
  json_extract(card_json, '$.source') AS source
FROM cards
WHERE id LIKE 'phase1_%'
   OR owner_user_id IN ('sterling', 'cydney')
ORDER BY owner_user_id, id;

SELECT id, user_id, pull_count, ticket_cost, created_at
FROM pull_requests
WHERE user_id IN ('sterling', 'cydney')
ORDER BY created_at, id;

SELECT id, user_id, pull_count, ticket_cost, created_at
FROM pull_history
WHERE user_id IN ('sterling', 'cydney')
ORDER BY created_at, id;

SELECT user_id, squad_card_ids, created_at, updated_at
FROM user_battle_squads
WHERE user_id IN ('sterling', 'cydney')
ORDER BY user_id;

SELECT
  attempt_id,
  user_id,
  status,
  encounter_id,
  energy_spent,
  surrender,
  created_at,
  finalized_at
FROM battle_attempts
WHERE user_id IN ('sterling', 'cydney')
ORDER BY created_at, attempt_id;

SELECT
  id,
  attempt_id,
  user_id,
  encounter_id,
  victory,
  json_extract(result_json, '$.status') AS result_status,
  json_extract(result_json, '$.settlement.outcome') AS outcome,
  json_extract(result_json, '$.settlement.reward.gold') AS gold_awarded,
  json_array_length(json_extract(result_json, '$.settlement.xpApplied')) AS xp_application_count,
  created_at
FROM battle_history
WHERE user_id IN ('sterling', 'cydney')
ORDER BY created_at, id;

SELECT
  event_id,
  event_name,
  player_id,
  analytics_session_id,
  route,
  device_category,
  browser_category,
  outcome,
  related_id,
  occurred_at
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
ORDER BY occurred_at, event_id;

SELECT id, admin_id, action, filters_json, occurred_at
FROM telemetry_admin_audit
WHERE admin_id IN ('sterling', 'cydney')
ORDER BY occurred_at, id;

SELECT
  (SELECT COUNT(*) FROM player_auth_users WHERE slot_id IN ('sterling', 'cydney') AND pin_hash IS NOT NULL) AS claimed_test_slots,
  (SELECT COUNT(*) FROM player_auth_sessions WHERE slot_id IN ('sterling', 'cydney')) AS active_sessions,
  (SELECT COUNT(*) FROM user_resources WHERE user_id IN ('sterling', 'cydney')) AS resource_rows,
  (SELECT COUNT(*) FROM cards WHERE id LIKE 'phase1_library_%' AND owner_user_id = '') AS library_templates,
  (SELECT COUNT(*) FROM cards WHERE owner_user_id IN ('sterling', 'cydney')) AS owned_cards_after_pull,
  (SELECT COUNT(*) FROM pull_requests WHERE user_id IN ('sterling', 'cydney')) AS pull_requests,
  (SELECT COUNT(*) FROM pull_history WHERE user_id IN ('sterling', 'cydney')) AS pull_history_rows,
  (SELECT COUNT(*) FROM user_battle_squads WHERE user_id IN ('sterling', 'cydney')) AS saved_squads,
  (SELECT COUNT(*) FROM battle_attempts WHERE user_id IN ('sterling', 'cydney')) AS battle_attempts,
  (SELECT COUNT(*) FROM battle_history WHERE user_id IN ('sterling', 'cydney')) AS battle_history_rows,
  (SELECT COUNT(*) FROM telemetry_events WHERE player_id IN ('sterling', 'cydney')) AS remaining_telemetry_events,
  (SELECT COUNT(*) FROM telemetry_admin_audit WHERE admin_id IN ('sterling', 'cydney')) AS telemetry_admin_audit_rows;

