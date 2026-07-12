# Phase 1 Isolated Preview D1 Runbook

## Locked target

| Resource | Isolated preview value |
| --- | --- |
| D1 database | `com-tcg-db-preview` |
| D1 UUID | `4fb86e2a-59f9-4f3c-aa34-af4b64973f38` |
| R2 bucket | `com-tcg-images-preview` |
| Production D1 excluded | `com-tcg-db` |
| Production R2 excluded | `com-tcg-images` |

Sterling confirmed that preview bindings `DB` and `CARD_IMAGES` point to the isolated resources above. The preview health endpoint reports both bindings as present.

## Dashboard execution order

In Cloudflare D1, open `com-tcg-db-preview`, verify UUID `4fb86e2a-59f9-4f3c-aa34-af4b64973f38`, and use the Console in this order:

1. Run `001_phase1_schema.sql` once.
2. Run `002_phase1_fixtures.sql` once.
3. Run `003_phase1_verify.sql` and preserve the result.

If an authenticated validation run stops after creating partial disposable data, run `005_phase1_retry_reset.sql` to restore the approved fixture baseline without deleting the fixture rows or schema. Do not use it as ordinary cleanup after a completed validation run.

Expected verification totals are:

| Check | Expected |
| --- | --- |
| Canonical auth slots | `7` |
| Phase 1 resource rows | `2` |
| Phase 1 Library templates | `5` |
| Phase 1 owned cards | `6` |
| Invalid Phase 1 card JSON | `0` |
| Telemetry events before validation | `0` |

## Dashboard execution journal

On 2026-07-12, Sterling executed the package against `com-tcg-db-preview` UUID `4fb86e2a-59f9-4f3c-aa34-af4b64973f38`:

| Step | Result | Recorded detail |
| --- | --- | --- |
| `001_phase1_schema.sql` | Success | Additive schema accepted |
| `002_phase1_fixtures.sql`, first console attempt | No-op interface failure | The Cloudflare console received no executable SQL; no fixture statement ran |
| `002_phase1_fixtures.sql`, actual statements | Success | Approved fixture statements accepted |
| `003_phase1_verify.sql` | Success | `7 / 2 / 5 / 6 / 0 / 0` matched the manifest |
| `004_phase1_cleanup.sql` | Not executed | Fixtures remain available for validation |

The first authenticated harness attempt then stopped on a harness-only HTTP-status assertion after a successful pull. It had already created two credentials, three sessions, two saved squads, one pull claim/history row, one pulled card, and one ticket debit. `005_phase1_retry_reset.sql` was added to restore exactly that partial state while preserving the approved fixture rows and schema.

No R2 object is required for the minimum fixture set. Missing-image behavior can be verified without writing an object. If later R2 tests create an object, record its exact key before upload and add that key to the cleanup record before deletion.

## Schema inventory

The schema script creates only the tables and indexes required by the authenticated Phase 1 core loop. Every statement uses `IF NOT EXISTS`.

| Kind | Exact names |
| --- | --- |
| Authentication tables | `player_auth_users`, `player_auth_sessions` |
| Card and economy tables | `cards`, `user_resources`, `pull_history`, `pull_requests` |
| Battle tables | `user_battle_squads`, `battle_attempts`, `battle_daily_victories`, `battle_history` |
| Telemetry tables | `telemetry_events`, `telemetry_daily_aggregates`, `telemetry_admin_audit` |
| Pull indexes | `idx_pull_history_user_created`, `idx_pull_requests_user_created` |
| Battle indexes | `idx_battle_attempts_user_status`, `idx_battle_attempts_one_active_per_user`, `idx_battle_history_user_created`, `idx_battle_history_user_attempt` |
| Telemetry indexes | `idx_telemetry_events_session_time`, `idx_telemetry_events_player_time`, `idx_telemetry_events_name_time` |

It is additive and contains no destructive or corrective statement. It creates `user_resources` in its final Energy-aware shape rather than running `migrations/001_battle_attempts.sql` against a missing base table. Runtime `CREATE TABLE IF NOT EXISTS` calls remain compatible with this shape.

## Seed inventory

The fixture script inserts exactly these rows:

| Table | Primary key or owner | Purpose |
| --- | --- | --- |
| `user_resources` | `sterling` | 12 tickets, 0 Gold, 10 Energy |
| `user_resources` | `cydney` | 12 tickets, 0 Gold, 10 Energy |
| `cards` | `phase1_library_common` | Unowned common pull template |
| `cards` | `phase1_library_uncommon` | Unowned uncommon pull template |
| `cards` | `phase1_library_rare` | Unowned rare pull template |
| `cards` | `phase1_library_legendary` | Unowned legendary pull template |
| `cards` | `phase1_library_mythic` | Unowned mythic pull template |
| `cards` | `phase1_owned_sterling_1` | Sterling left-lane test card |
| `cards` | `phase1_owned_sterling_2` | Sterling center-lane test card |
| `cards` | `phase1_owned_sterling_3` | Sterling right-lane test card |
| `cards` | `phase1_owned_cydney_1` | Cydney left-lane test card |
| `cards` | `phase1_owned_cydney_2` | Cydney center-lane test card |
| `cards` | `phase1_owned_cydney_3` | Cydney right-lane test card |

The fixture script inserts zero credentials, zero sessions, zero telemetry events, and zero R2 objects.

Credentials are created through the normal preview setup flow so authentication itself is validated. PIN values must not be written to the repository, evidence documents, screenshots, or PR.

## Cleanup

After Phase 1 testing, run `004_phase1_cleanup.sql` only against the isolated preview D1 database. It removes the two accounts' sessions and disposable gameplay data, removes all cards generated or owned during the test, removes the five fixture Library templates, and resets only the expected Phase 1 usernames. It leaves the additive schema and seven canonical slot rows intact.

Any R2 object created later must be deleted by its individually recorded key from `com-tcg-images-preview`. Never delete the bucket and never run these scripts against production.
