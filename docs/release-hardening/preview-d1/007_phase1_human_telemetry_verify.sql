-- Read-only Phase 1 human-session telemetry and transaction verification.
-- Target only: com-tcg-db-preview
-- Database UUID: 4fb86e2a-59f9-4f3c-aa34-af4b64973f38
--
-- The cutoff is immediately after the last recorded authenticated-harness
-- telemetry audit action. Run each SELECT independently if the Cloudflare
-- mobile console displays only one result set at a time.
-- PIN hashes and session tokens are intentionally excluded.

-- 1. Chronological human-session event record.
SELECT
  event_id,
  event_name,
  occurred_at,
  release_commit,
  environment,
  player_id,
  analytics_session_id,
  route,
  device_category,
  browser_category,
  outcome,
  duration_ms,
  error_category,
  related_id
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
ORDER BY occurred_at, event_id;

-- 2. Routes visited by account, device, and browser.
SELECT
  player_id,
  device_category,
  browser_category,
  route,
  COUNT(*) AS route_event_count,
  MIN(occurred_at) AS first_seen_at,
  MAX(occurred_at) AS last_seen_at
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
  AND event_name = 'route.viewed'
GROUP BY player_id, device_category, browser_category, route
ORDER BY player_id, device_category, browser_category, route;

-- 3. Analytics-session behavior without exposing authentication tokens.
SELECT
  player_id,
  analytics_session_id,
  device_category,
  browser_category,
  COUNT(*) AS event_count,
  COUNT(DISTINCT route) AS distinct_route_count,
  MIN(occurred_at) AS first_event_at,
  MAX(occurred_at) AS last_event_at,
  SUM(CASE WHEN event_name = 'error.displayed' OR outcome = 'failure' THEN 1 ELSE 0 END) AS error_or_failure_count
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
GROUP BY player_id, analytics_session_id, device_category, browser_category
ORDER BY first_event_at, player_id, analytics_session_id;

-- 4. Human-session funnel counts.
SELECT
  player_id,
  event_name,
  outcome,
  COUNT(*) AS event_count,
  MIN(occurred_at) AS first_seen_at,
  MAX(occurred_at) AS last_seen_at
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
GROUP BY player_id, event_name, outcome
ORDER BY player_id, event_name, outcome;

-- 5. Errors, failures, retries, and interruptions that may reveal hidden friction.
SELECT
  event_id,
  player_id,
  event_name,
  route,
  device_category,
  browser_category,
  outcome,
  error_category,
  related_id,
  occurred_at
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
  AND (
    event_name IN ('error.displayed', 'retry.attempted', 'pull.interrupted', 'battle.interrupted')
    OR outcome IN ('failure', 'interrupted')
    OR error_category != ''
  )
ORDER BY occurred_at, event_id;

-- 6. Pull start, interruption, and completion grouped by operation ID.
SELECT
  player_id,
  related_id,
  SUM(CASE WHEN event_name = 'pull.started' THEN 1 ELSE 0 END) AS started_count,
  SUM(CASE WHEN event_name = 'pull.interrupted' THEN 1 ELSE 0 END) AS interrupted_count,
  SUM(CASE WHEN event_name = 'pull.completed' AND outcome = 'success' THEN 1 ELSE 0 END) AS successful_completion_count,
  SUM(CASE WHEN event_name = 'pull.completed' AND outcome != 'success' THEN 1 ELSE 0 END) AS failed_completion_count,
  MIN(occurred_at) AS first_event_at,
  MAX(occurred_at) AS last_event_at
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
  AND event_name IN ('pull.started', 'pull.interrupted', 'pull.completed')
GROUP BY player_id, related_id
ORDER BY first_event_at, player_id, related_id;

-- 7. Vault follow-through after pulls.
SELECT
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
  AND occurred_at > '2026-07-12T15:41:08.596Z'
  AND event_name = 'vault.viewed_after_pull'
ORDER BY occurred_at, event_id;

-- 8. Battle creation, playback, interruption, surrender, completion, and reward.
SELECT
  player_id,
  related_id,
  SUM(CASE WHEN event_name = 'battle.created' THEN 1 ELSE 0 END) AS created_count,
  SUM(CASE WHEN event_name = 'battle.playback_started' THEN 1 ELSE 0 END) AS playback_count,
  SUM(CASE WHEN event_name = 'battle.interrupted' THEN 1 ELSE 0 END) AS interrupted_count,
  SUM(CASE WHEN event_name = 'battle.surrendered' THEN 1 ELSE 0 END) AS surrendered_count,
  SUM(CASE WHEN event_name = 'battle.completed' THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN event_name = 'reward.finalized' THEN 1 ELSE 0 END) AS reward_count,
  SUM(CASE WHEN outcome = 'failure' OR error_category != '' THEN 1 ELSE 0 END) AS failure_count,
  MIN(occurred_at) AS first_event_at,
  MAX(occurred_at) AS last_event_at
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
  AND event_name IN (
    'battle.created',
    'battle.playback_started',
    'battle.interrupted',
    'battle.surrendered',
    'battle.completed',
    'reward.finalized'
  )
GROUP BY player_id, related_id
ORDER BY first_event_at, player_id, related_id;

-- 9. Telemetry completion anomalies. Zero rows is the expected result.
SELECT
  player_id,
  related_id,
  event_name,
  COUNT(*) AS completion_count
FROM telemetry_events
WHERE player_id IN ('sterling', 'cydney')
  AND occurred_at > '2026-07-12T15:41:08.596Z'
  AND event_name IN ('pull.completed', 'battle.completed', 'reward.finalized')
  AND (
    (event_name = 'pull.completed' AND outcome = 'success')
    OR (event_name = 'battle.completed' AND outcome IN ('success', 'victory', 'defeat'))
    OR (event_name = 'reward.finalized' AND outcome = 'success')
  )
  AND related_id != ''
GROUP BY player_id, related_id, event_name
HAVING COUNT(*) > 1
ORDER BY player_id, related_id, event_name;

-- 10. Pull persistence integrity. Every request should have exactly one matching
-- history row, with the same owner, count, and ticket cost.
SELECT
  COALESCE(pr.id, ph.id) AS pull_id,
  pr.user_id AS request_user_id,
  ph.user_id AS history_user_id,
  pr.pull_count AS request_pull_count,
  ph.pull_count AS history_pull_count,
  pr.ticket_cost AS request_ticket_cost,
  ph.ticket_cost AS history_ticket_cost,
  CASE
    WHEN pr.id IS NULL THEN 'missing_request'
    WHEN ph.id IS NULL THEN 'missing_history'
    WHEN pr.user_id != ph.user_id THEN 'owner_mismatch'
    WHEN pr.pull_count != ph.pull_count THEN 'pull_count_mismatch'
    WHEN pr.ticket_cost != ph.ticket_cost THEN 'ticket_cost_mismatch'
    ELSE 'matched'
  END AS integrity_result
FROM pull_requests pr
LEFT JOIN pull_history ph ON ph.id = pr.id
WHERE pr.user_id IN ('sterling', 'cydney')
UNION ALL
SELECT
  ph.id AS pull_id,
  NULL AS request_user_id,
  ph.user_id AS history_user_id,
  NULL AS request_pull_count,
  ph.pull_count AS history_pull_count,
  NULL AS request_ticket_cost,
  ph.ticket_cost AS history_ticket_cost,
  'missing_request' AS integrity_result
FROM pull_history ph
LEFT JOIN pull_requests pr ON pr.id = ph.id
WHERE ph.user_id IN ('sterling', 'cydney')
  AND pr.id IS NULL
ORDER BY pull_id;

-- 11. Battle persistence integrity. A finalized or surrendered attempt should
-- have exactly one matching history row for the same owner.
SELECT
  ba.attempt_id,
  ba.user_id AS attempt_user_id,
  ba.status,
  ba.surrender,
  COUNT(bh.id) AS matching_history_rows,
  SUM(CASE WHEN bh.user_id = ba.user_id THEN 1 ELSE 0 END) AS owner_matching_history_rows,
  ba.created_at,
  ba.finalized_at
FROM battle_attempts ba
LEFT JOIN battle_history bh ON bh.attempt_id = ba.attempt_id
WHERE ba.user_id IN ('sterling', 'cydney')
GROUP BY ba.attempt_id, ba.user_id, ba.status, ba.surrender, ba.created_at, ba.finalized_at
ORDER BY ba.created_at, ba.attempt_id;

-- 12. Current owner-scoped economy and gameplay totals after human testing.
SELECT
  u.slot_id AS player_id,
  r.pull_tickets,
  r.gold,
  r.energy,
  r.daily_ticket_claimed_on,
  (SELECT COUNT(*) FROM cards c WHERE c.owner_user_id = u.slot_id) AS owned_cards,
  (SELECT COUNT(*) FROM user_battle_squads s WHERE s.user_id = u.slot_id) AS saved_squads,
  (SELECT COUNT(*) FROM pull_requests pr WHERE pr.user_id = u.slot_id) AS pull_requests,
  (SELECT COUNT(*) FROM pull_history ph WHERE ph.user_id = u.slot_id) AS pull_history_rows,
  (SELECT COUNT(*) FROM battle_attempts ba WHERE ba.user_id = u.slot_id) AS battle_attempts,
  (SELECT COUNT(*) FROM battle_history bh WHERE bh.user_id = u.slot_id) AS battle_history_rows
FROM player_auth_users u
LEFT JOIN user_resources r ON r.user_id = u.slot_id
WHERE u.slot_id IN ('sterling', 'cydney')
ORDER BY u.slot_id;

-- 13. Compact human-telemetry summary.
SELECT
  (SELECT COUNT(*) FROM telemetry_events
    WHERE player_id IN ('sterling', 'cydney')
      AND occurred_at > '2026-07-12T15:41:08.596Z') AS human_events,
  (SELECT COUNT(DISTINCT analytics_session_id) FROM telemetry_events
    WHERE player_id IN ('sterling', 'cydney')
      AND occurred_at > '2026-07-12T15:41:08.596Z') AS analytics_sessions,
  (SELECT COUNT(*) FROM telemetry_events
    WHERE player_id IN ('sterling', 'cydney')
      AND occurred_at > '2026-07-12T15:41:08.596Z'
      AND event_name = 'error.displayed') AS displayed_errors,
  (SELECT COUNT(*) FROM telemetry_events
    WHERE player_id IN ('sterling', 'cydney')
      AND occurred_at > '2026-07-12T15:41:08.596Z'
      AND event_name IN ('pull.interrupted', 'battle.interrupted')) AS recorded_interruptions,
  (SELECT COUNT(*) FROM telemetry_events
    WHERE player_id IN ('sterling', 'cydney')
      AND occurred_at > '2026-07-12T15:41:08.596Z'
      AND outcome = 'failure') AS failure_outcomes,
  (SELECT COUNT(*) FROM pull_requests WHERE user_id IN ('sterling', 'cydney')) AS persisted_pull_requests,
  (SELECT COUNT(*) FROM pull_history WHERE user_id IN ('sterling', 'cydney')) AS persisted_pull_history_rows,
  (SELECT COUNT(*) FROM battle_attempts WHERE user_id IN ('sterling', 'cydney')) AS persisted_battle_attempts,
  (SELECT COUNT(*) FROM battle_history WHERE user_id IN ('sterling', 'cydney')) AS persisted_battle_history_rows;
