-- Reset only partial mutations from an interrupted Phase 1 validation harness.
-- Target only: com-tcg-db-preview
-- This preserves the approved 13 fixture rows and all additive schema.

DELETE FROM player_auth_sessions
WHERE slot_id IN ('sterling', 'cydney');

DELETE FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney');

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
  AND id NOT IN (
    'phase1_owned_sterling_1',
    'phase1_owned_sterling_2',
    'phase1_owned_sterling_3',
    'phase1_owned_cydney_1',
    'phase1_owned_cydney_2',
    'phase1_owned_cydney_3'
  );

UPDATE user_resources
SET pull_tickets = 12,
    gold = 0,
    daily_ticket_claimed_on = NULL,
    energy = 10,
    energy_updated_at = '2026-07-12T00:00:00.000Z',
    updated_at = '2026-07-12T00:00:00.000Z'
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
  AND username IN ('P1Sterling', 'P1Cydney');

SELECT
  (SELECT COUNT(*) FROM player_auth_sessions WHERE slot_id IN ('sterling', 'cydney')) AS sessions,
  (SELECT COUNT(*) FROM player_auth_users WHERE slot_id IN ('sterling', 'cydney') AND pin_hash IS NOT NULL) AS claimed_test_slots,
  (SELECT COUNT(*) FROM user_resources WHERE user_id IN ('sterling', 'cydney') AND pull_tickets = 12 AND gold = 0 AND energy = 10) AS reset_resource_rows,
  (SELECT COUNT(*) FROM cards WHERE id LIKE 'phase1_library_%' AND owner_user_id = '') AS library_templates,
  (SELECT COUNT(*) FROM cards WHERE id LIKE 'phase1_owned_%' AND owner_user_id IN ('sterling', 'cydney')) AS owned_fixture_cards,
  (SELECT COUNT(*) FROM pull_requests WHERE user_id IN ('sterling', 'cydney')) AS pull_requests,
  (SELECT COUNT(*) FROM battle_attempts WHERE user_id IN ('sterling', 'cydney')) AS battle_attempts,
  (SELECT COUNT(*) FROM telemetry_events WHERE player_id IN ('sterling', 'cydney')) AS telemetry_events;

