-- Destructive only to disposable Phase 1 preview data.
-- Target only: com-tcg-db-preview
-- Never run against production.

DELETE FROM player_auth_sessions
WHERE slot_id IN ('sterling', 'cydney');

DELETE FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney');

DELETE FROM telemetry_daily_aggregates
WHERE environment IN ('preview', 'unknown');

DELETE FROM telemetry_admin_audit
WHERE admin_id IN ('sterling', 'cydney');

DELETE FROM battle_daily_victories
WHERE user_id IN ('sterling', 'cydney');

DELETE FROM battle_history
WHERE user_id IN ('sterling', 'cydney');

DELETE FROM battle_attempts
WHERE user_id IN ('sterling', 'cydney');

DELETE FROM user_battle_squads
WHERE user_id IN ('sterling', 'cydney');

DELETE FROM pull_history
WHERE user_id IN ('sterling', 'cydney');

DELETE FROM pull_requests
WHERE user_id IN ('sterling', 'cydney');

DELETE FROM cards
WHERE owner_user_id IN ('sterling', 'cydney')
   OR id LIKE 'phase1_library_%';

DELETE FROM user_resources
WHERE user_id IN ('sterling', 'cydney');

UPDATE player_auth_users
SET username = NULL,
    display_name = CASE slot_id
      WHEN 'sterling' THEN 'Sterling'
      WHEN 'cydney' THEN 'Cydney'
      ELSE display_name
    END,
    pin_hash = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE slot_id IN ('sterling', 'cydney')
  AND (username IN ('P1Sterling', 'P1Cydney') OR username IS NULL);

SELECT
  (SELECT COUNT(*) FROM user_resources WHERE user_id IN ('sterling', 'cydney')) AS remaining_resource_rows,
  (SELECT COUNT(*) FROM cards WHERE owner_user_id IN ('sterling', 'cydney') OR id LIKE 'phase1_library_%') AS remaining_phase1_cards,
  (SELECT COUNT(*) FROM player_auth_sessions WHERE slot_id IN ('sterling', 'cydney')) AS remaining_sessions,
  (SELECT COUNT(*) FROM telemetry_events WHERE player_id IN ('sterling', 'cydney')) AS remaining_telemetry_events;

