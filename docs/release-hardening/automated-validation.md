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
| 2026-07-12 | Authenticated preview evidence working tree based on `9683959` | `npm test` | Linux, Node 24.14.0 | Pass | 0.41 s | None | 67 tests passed, 0 failed; retry-reset preservation and post-validation inventory syntax are executable coverage |
| 2026-07-12 | Authenticated preview evidence working tree based on `9683959` | `npm run build` | Linux, Node 24.14.0 | Pass | 0.14 s | None | Vite transformed 93 modules and emitted the same named production assets as the verified preview application tree |
| 2026-07-12 | Authenticated preview evidence working tree based on `9683959` | `git diff --check` | Git working tree | Pass | Under 1 s | None | No whitespace errors |

## Baseline interpretation

The baseline suite is green, but its 40 tests are concentrated in battle rules, battle lifecycle, selected UI contracts, administrator gate presence, and branding contracts. A green baseline does not yet prove login/session lifecycle, player isolation across all domains, pull/economy concurrency, Mountain Time ticket boundaries, Energy regeneration, route recovery states, or live D1/R2 binding behavior.

The post-change suite adds Energy interval/cap/backfill/concurrency/pre-debit coverage, Vault and battle-history owner isolation, Mountain Time daily boundaries, daily-claim concurrency, authenticated Gold isolation, pull idempotency/concurrency, the approved telemetry privacy, authorization, retention, deduplication, rate-limit, and non-blocking client contracts, plus executable preview schema, fixture, verification, and cleanup artifacts.

## Coverage-by-domain status

| Domain | Baseline evidence | Current confidence | Highest-value gap |
| --- | --- | --- | --- |
| Authentication | Shared administrator policy, authenticated endpoint fixtures, two-account deployed login, second-session recovery, and logout invalidation | High for represented cases | Human account switching and expiry over real time |
| Ownership | Cross-owner Vault/history, Gold, squad-card, battle-recovery, telemetry, and pull-history checks against isolated preview | High for represented cases | Human multi-browser verification |
| Administrator authorization | Static policy assertions plus deployed non-admin denial and administrator telemetry export/deletion | High for represented cases | Human administrator diagnostics review |
| Pulls | SQLite request claims plus deployed successful pull, same-ID retry, one-ticket debit, one-card grant, and history/Vault isolation | High for represented cases | Human interruption timing and five-pull UX |
| Ticket shop | Mountain boundary, daily concurrency, Gold isolation, and insufficient balance tests | Medium-high | Live D1 boundary and browser recovery evidence |
| Vault | Source contracts plus deployed owner isolation and pull-result persistence | High for represented cases | Human duplicate-grouping review |
| Squad | Backend coverage plus deployed cross-owner rejection and persistence across a second session | High for represented cases | Human formation UX |
| Battle creation | SQLite-backed backend tests | High for represented cases | Recharge reconciliation before validation/debit |
| Battle finalization | SQLite-backed exactly-once tests | High for represented cases | Concurrent failure injection and recovery from settling state |
| Battle playback | Pure/UI contracts plus deployed create, duplicate create, second-session recovery, cross-owner denial, finalize, duplicate finalize, and surrender recovery | High for represented cases | Human visual playback and browser refresh timing |
| Rewards and XP | SQLite-backed exactly-once tests plus deployed settlement and history isolation | High for represented cases | Multi-level overflow and human results-screen review |
| Energy debit/regeneration | SQLite-backed interval, partial, cap, backfill, concurrency, and pre-debit tests plus deployed 420,000 ms reconciliation and owner isolation | High for represented cases | Human live countdown observation |
| Branding | Static contract tests | Medium | Browser/device rendering |
| Telemetry | SQLite contracts plus deployed accept, deduplicate, query stripping, non-admin denial, admin export, player deletion, audit, and invalid-event gameplay isolation | High for represented cases | Post-run D1 row inventory and human consent/copy review |
