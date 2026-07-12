# Phase 1 Automated Validation

## Coverage intent

The required automated gate is run at baseline, after meaningful test additions, after meaningful implementation changes, before preview sign-off, and before the final merge recommendation.

## Command ledger

| Date | Commit | Command | Environment | Result | Duration | Failure class | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-07-11 | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `npm ci` | Linux, Node 24.14.0, default npm cache | Fail | Not captured | Environment failure | npm could not create `/root/.npm`; repository content was not implicated |
| 2026-07-11 | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `NPM_CONFIG_CACHE=/tmp/commune-tcg-npm-cache npm ci` | Linux, Node 24.14.0 | Pass | 6.6 s | None | 55 packages installed from lockfile |
| 2026-07-11 | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `npm test` | Linux, Node 24.14.0 | Pass | 0.83 s | None | 40 tests passed, 0 failed |
| 2026-07-11 | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `npm run build` | Linux, Node 24.14.0 | Pass | 0.39 s | None | Vite transformed 91 modules and emitted production assets |
| 2026-07-11 | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `npm run battle:simulate -- --iterations=1000` | Linux, Node 24.14.0 | Pass | Not captured | None | Reproducible 1,000-battle simulation completed |
| 2026-07-11 | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `git diff --check` | Git working tree | Pass | Under 1 s | None | No whitespace errors |
| 2026-07-11 | Application tree committed through `189754a` | `npm test` | Linux, Node 24.14.0 | Pass | 1.17 s | None | 52 tests passed, 0 failed; 12 more than baseline |
| 2026-07-11 | Application tree committed through `189754a` | `npm run build` | Linux, Node 24.14.0 | Pass | 0.59 s | None | Vite transformed 91 modules and emitted production assets |
| 2026-07-11 | Application tree committed through `189754a` | `npm run battle:simulate -- --iterations=1000` | Linux, Node 24.14.0 | Pass | Not captured | None | Reproducible 1,000-battle simulation completed with unchanged results |
| 2026-07-11 | Application tree committed through `189754a` | `git diff --check` | Git working tree | Pass | Under 1 s | None | No whitespace errors |
| 2026-07-11 | Telemetry implementation working tree based on `b4c1a44` | `npm test` | Linux, Node 24.14.0 | Pass | 0.31 s | None | 61 tests passed, 0 failed; telemetry validation, deduplication, authorization, scheduled retention, deletion, per-session/player rate limiting, client non-blocking contracts, and simulated storage failure included |
| 2026-07-11 | Telemetry implementation working tree based on `b4c1a44` | `npm run build` | Linux, Node 24.14.0 | Pass | 0.13 s | None | Vite transformed 92 modules and emitted production assets |
| 2026-07-11 | Telemetry implementation working tree based on `b4c1a44` | `npm run battle:simulate -- --iterations=1000` | Linux, Node 24.14.0 | Pass | Not captured | None | Reproducible 1,000-battle simulation completed with unchanged checked-in results |
| 2026-07-11 | Telemetry implementation working tree based on `b4c1a44` | `git diff --check` | Git working tree | Pass | Under 1 s | None | No whitespace errors |
| 2026-07-11 | Telemetry implementation working tree based on `b4c1a44` | `npx wrangler deploy --dry-run` | Linux, Wrangler 4.110.0, default config home | Fail | 10 s | Environment failure | Wrangler could not create `/root/.config`; repository content was not implicated |
| 2026-07-11 | Telemetry implementation working tree based on `b4c1a44` | `XDG_CONFIG_HOME=/tmp/commune-tcg-config npx wrangler deploy --dry-run` | Linux, Wrangler 4.110.0 | Pass | 27.5 s | None | Worker bundle, assets, scheduled handler, and `wrangler.toml` parsed successfully without deployment or warnings |
| 2026-07-11 | Phase 1 working tree merged with production hotfix `655c7c4` | `npm test` | Linux, Node 24.14.0 | Pass | 0.43 s | None | 62 tests passed, 0 failed; approved 7-minute Energy interval and live countdown contract included |
| 2026-07-11 | Phase 1 working tree merged with production hotfix `655c7c4` | `npm run build` | Linux, Node 24.14.0 | Pass | 0.16 s | None | Vite transformed 93 modules and emitted production assets |
| 2026-07-11 | Phase 1 working tree merged with production hotfix `655c7c4` | `git diff --check` | Git merge working tree | Pass | Under 1 s | None | No conflict markers or whitespace errors |
| 2026-07-11 | Phase 1 working tree reconciled with remote Energy UI/isolation coverage through `f736ae9` | `npm test` | Linux, Node 24.14.0 | Pass | 0.43 s | None | 64 tests passed, 0 failed; final approved 7-minute value, live modal, server-preferred boundary refresh, and per-user isolation included |
| 2026-07-11 | Phase 1 working tree reconciled with remote Energy UI/isolation coverage through `f736ae9` | `npm run build` | Linux, Node 24.14.0 | Pass | 0.15 s | None | Vite transformed 93 modules and emitted production assets |
| 2026-07-12 | Preview dashboard package working tree based on `dd617ec` | `node --test tests/preview-d1-artifacts.test.js` | Linux, Node 24.14.0, in-memory SQLite | Pass | 0.07 s | None | Additive schema, 13 fixture rows, JSON validity, cleanup, slot preservation, and schema preservation passed |
| 2026-07-12 | Preview dashboard package working tree based on `dd617ec` | `npm test` | Linux, Node 24.14.0 | Pass | 0.37 s | None | 66 tests passed, 0 failed |
| 2026-07-12 | Preview dashboard package working tree based on `dd617ec` | `git diff --check` | Git working tree | Pass | Under 1 s | None | No whitespace errors |

## Baseline interpretation

The baseline suite is green, but its 40 tests are concentrated in battle rules, battle lifecycle, selected UI contracts, administrator gate presence, and branding contracts. A green baseline does not yet prove login/session lifecycle, player isolation across all domains, pull/economy concurrency, Mountain Time ticket boundaries, Energy regeneration, route recovery states, or live D1/R2 binding behavior.

The post-change suite adds Energy interval/cap/backfill/concurrency/pre-debit coverage, Vault and battle-history owner isolation, Mountain Time daily boundaries, daily-claim concurrency, authenticated Gold isolation, pull idempotency/concurrency, the approved telemetry privacy, authorization, retention, deduplication, rate-limit, and non-blocking client contracts, plus executable preview schema, fixture, verification, and cleanup artifacts.

## Coverage-by-domain status

| Domain | Baseline evidence | Current confidence | Highest-value gap |
| --- | --- | --- | --- |
| Authentication | Shared administrator policy plus authenticated endpoint fixtures | Medium-low | Session expiry, logout invalidation, and browser account switching |
| Ownership | Cross-owner Vault/history and Gold isolation plus owner-scoped battle/pull queries | Medium | Squad isolation and deployed multi-browser verification |
| Administrator authorization | Static handler-policy assertions expanded to all privileged diagnostics | Medium | Behavioral unauthorized calls against deployed Worker |
| Pulls | SQLite single/five-pull request claim, repeated ID, history, owned-card count, and competing request tests | Medium-high | Browser/network interruption and live D1 evidence |
| Ticket shop | Mountain boundary, daily concurrency, Gold isolation, and insufficient balance tests | Medium-high | Live D1 boundary and browser recovery evidence |
| Vault | UI/source contracts only | Low | Duplicate grouping and cross-account isolation |
| Squad | Battle UI/backend coverage | Medium | Cross-account card IDs and save isolation |
| Battle creation | SQLite-backed backend tests | High for represented cases | Recharge reconciliation before validation/debit |
| Battle finalization | SQLite-backed exactly-once tests | High for represented cases | Concurrent failure injection and recovery from settling state |
| Battle playback | Pure/UI contract tests | Medium | Browser refresh/navigation on real preview |
| Rewards and XP | SQLite-backed finalization tests | Medium to high | Multi-level overflow and cross-account negative tests |
| Energy debit/regeneration | SQLite-backed interval, partial, cap, backfill, concurrency, and pre-debit tests | High for represented cases | Live D1 and multiple-tab preview evidence |
| Branding | Static contract tests | Medium | Browser/device rendering |
| Telemetry | SQLite-backed ingestion, identity derivation, input allowlist, deduplication, rate limiting, aggregate retention, deletion, administrator authorization/audit, and client non-blocking contracts | Medium-high | Deployed D1 export/deletion and failure-isolation evidence |
