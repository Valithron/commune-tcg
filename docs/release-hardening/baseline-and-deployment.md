# Phase 1 Baseline and Deployment Record

## Source baseline

| Field | Value |
| --- | --- |
| Repository | `Valithron/commune-tcg` |
| Canonical branch | `main` |
| Verified starting commit | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Starting commit subject | `Merge PR #3: Phase 1 release hardening work order` |
| Phase branch | `phase/release-hardening` |
| Phase branch starting commit | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Work order present | Yes, `docs/phase-1-release-hardening-work-order.md` |
| Roadmap present | Yes, `docs/quality-playability-roadmap.md` |
| Baseline worktree | Clean before dependency installation and automated checks |

`main` and `origin/main` were fetched and compared before the phase branch was created. They resolved to the same full commit SHA. The branch was not created from `Gacha` or another historical reference.

## Production deployment evidence

Sterling confirmed the active production deployment directly from Cloudflare on 2026-07-11. Production is sourced from `Valithron/commune-tcg` branch `main` at full commit `2193be5550f34daa67051c35e3c0a8311a15ef82`. Cloudflare displays the matching short SHA `2193be5`. Production and the verified Phase 1 baseline therefore match exactly.

Later on 2026-07-11, emergency Energy countdown and 7-minute recharge hotfixes advanced `main` to `655c7c4c1b5783a6f9f2bc0c2563c5eb834baef4`. Phase 1 integrates that approved production source before further preview testing. The exact post-hotfix Cloudflare deployment ID and active SHA remain to be refreshed from the dashboard.

| Deployment fact | Verified value |
| --- | --- |
| Cloudflare project | `commune-tcg-gacha` |
| Production repository and branch | `Valithron/commune-tcg`, `main` |
| Exact live production SHA | `2193be5550f34daa67051c35e3c0a8311a15ef82` |
| Production deployment ID | `d3d3aafd-13e2-4942-a0e4-98fd36478bb2` |
| Deployment URL | `https://d3d3aafd.commune-tcg.pages.dev` |
| Production domains and aliases | `https://tcg.skpfam.com`, `https://www.tcg.skpfam.com`, `https://commune-tcg.pages.dev` |
| Production D1 binding | `DB` -> `com-tcg-db` |
| Production R2 binding | `CARD_IMAGES` -> `com-tcg-images` |
| Production result | Successful and active |
| Preview deployment behavior | Isolated `DB` and `CARD_IMAGES` bindings present; exact resources recorded below |

## Deployment ledger

| Environment | Project | Branch | Commit | URL | D1 binding | R2 binding | Result | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production | `commune-tcg-gacha` | `main` | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `https://d3d3aafd.commune-tcg.pages.dev` plus production aliases | `DB` -> `com-tcg-db` | `CARD_IMAGES` -> `com-tcg-images` | Successful and active | Restore this deployment ID or redeploy the exact SHA after verifying bindings |
| Preview | `commune-tcg-gacha` | `phase/release-hardening` | `8ca094bbcb062e25bd606f37bba521c9fccac205` application tree | `https://phase-release-hardening.commune-tcg.pages.dev` | `DB` -> `com-tcg-db-preview` (`4fb86e2a-59f9-4f3c-aa34-af4b64973f38`) | `CARD_IMAGES` -> `com-tcg-images-preview` | Health reports both bindings true; auth schema bootstrap complete; reviewed gameplay package pending dashboard execution | Run the targeted cleanup script or restore the prior isolated preview deployment |

## Runtime and binding inventory

`wrangler.toml` declares the Worker entry point, compatibility date, built-asset directory, `ASSETS` binding, and SPA fallback. Production D1 and R2 resource IDs are intentionally not checked in.

| Binding or configuration | Type | Known purpose | Source status |
| --- | --- | --- | --- |
| `ASSETS` | Worker assets | Serve `dist/` and the SPA fallback | Declared in `wrangler.toml` |
| `DB` | Cloudflare D1 | Application, account, collection, economy, and battle state | Production `com-tcg-db`; preview `com-tcg-db-preview`, UUID `4fb86e2a-59f9-4f3c-aa34-af4b64973f38` |
| `CARD_IMAGES` | Cloudflare R2 | Card and submission art | Production `com-tcg-images`; preview `com-tcg-images-preview` |
| `ADMIN_USER_IDS` | Environment variable | Comma-separated administrator slot allowlist | Optional; values not recorded; defaults to `sterling` |

Confirmed production resources remain D1 `com-tcg-db` and R2 `com-tcg-images`. Sterling confirmed preview D1 `com-tcg-db-preview` with UUID `4fb86e2a-59f9-4f3c-aa34-af4b64973f38` and preview R2 `com-tcg-images-preview` are separate resources. The preview health endpoint reports both bindings present.

No secret values were read or recorded.

## Preview and data safety

The Phase 1 branch preview is live at `https://phase-release-hardening.commune-tcg.pages.dev`. After Sterling configured isolated preview resources, a read-only `/api/health` request reports `DB: true` and `CARD_IMAGES: true`. Sterling confirmed these bindings are separate from production.

The deployed JavaScript asset `index-DX6pVCTS.js` and CSS asset `index-BGWE4WVZ.css` match a fresh build from commit `8ca094bbcb062e25bd606f37bba521c9fccac205`. This verifies that the exact reconciled branch source is deployed without relying on an application mutation.

After binding isolation and exact source deployment were verified, `GET /api/auth/users` performed the application's idempotent auth-schema bootstrap against the isolated preview D1 database. It succeeded and returned the seven canonical player slots with no usernames and `pinSet: false`. This created only the auth support schema and canonical slot rows. It did not create credentials, sessions, cards, economy resources, battle data, telemetry events, or R2 objects.

The reviewed dashboard execution package is in [`preview-d1/`](preview-d1/README.md). Its additive schema, minimum fixture set, verification queries, and cleanup procedure execute successfully against in-memory SQLite. Sterling executed schema and fixtures against the recorded preview D1 resource on 2026-07-12. Verification returned 7 auth slots, 2 resource rows, 5 Library templates, 6 owned cards, 0 invalid card JSON rows, and 0 telemetry events. The first fixture-console submission contained no executable SQL and had no effect; rerunning the actual statements succeeded. The cleanup script was not executed.

After the corrected authenticated harness completed, Sterling executed the read-only post-validation inventory. It confirmed 2 claimed test slots, 3 active sessions, 2 resource rows, 5 Library templates, 7 owned cards, 1 pull request/history pair, 2 saved squads, 2 battle attempts/history rows, 1 remaining telemetry event, and 2 telemetry administrator-audit rows. The dynamic pulled card is `owned_1783870862375_0a727e9d`; the pull request/history ID is `pull_phase1_0c89811897c64dddbafa857d949f9db2`. No cleanup or R2 object write occurred.

Sterling later reported the practical alpha human gate across desktop Chrome, iPhone Safari, and iPhone Chrome. Energy returned after 7 minutes, battle interruption recovered correctly, both testers completed a pull, and no duplicate transaction or account mixing was observed. The formal controlled-usability script was not completed and is not claimed. The final read-only human-session telemetry and persistence inventory is prepared as `preview-d1/007_phase1_human_telemetry_verify.sql` and must run before cleanup.

Safe read-only checks confirmed:

- Static application and manifest: 200.
- `/api/health`: 200 with both bindings true after isolated-resource configuration.
- `/api/auth/users`: 200 after isolated auth-schema bootstrap; seven unclaimed canonical slots returned.
- `/api/battle-reward-contract`: 200 and explicitly read-only.
- Public desktop UI: pass at 1363 by 936 in Chrome; all seven slot controls and setup fields rendered with no application console errors.
- Public desktop UI after authenticated validation: pass; `P1Sterling` and `P1Cydney` render as ready, the other five canonical slots remain in setup state, and no application console error was observed.
- Stateful gameplay: the corrected authenticated harness completed its success-only cleanup path after the reviewed retry reset. It covered account isolation, Energy reconciliation, pull idempotency, Vault/history isolation, squad persistence, battle recovery and settlement, rewards/XP, telemetry authorization/deletion/deduplication, and logout invalidation.
- R2 verification: the binding is present and isolated. The minimum Phase 1 fixtures and authenticated validation required no R2 object write.

No pull, Energy, battle, reward, XP, telemetry, D1, or R2 mutation was attempted before isolation was confirmed. After isolation, Sterling executed the reviewed additive schema and fixtures, then the reviewed targeted reset after a harness-only assertion stopped the first run. The corrected harness completed against preview only. No production resource and no R2 object was mutated.

### Disposable-data cleanup procedure

All Phase 1 fixtures use a recorded `phase1-` identifier or one of the two explicitly recorded test owners. The exact dashboard cleanup is [`preview-d1/004_phase1_cleanup.sql`](preview-d1/004_phase1_cleanup.sql). It deletes those owners' sessions, resources, owned cards, pull requests/history, squads, battle attempts/history, telemetry events, and telemetry audit rows in dependency order. No R2 object is required by the minimum fixture set. Any later R2 test object must have its exact key recorded before upload and deletion.

Do not drop shared tables, delete the seven canonical slot rows, delete the preview database or bucket, or run cleanup against production. Re-run `/api/auth/users`, `/api/health`, and the cleanup verification query to prove that disposable data is gone while bindings and additive schema remain intact.

## Rollback options

No Phase 1 code has been merged or deployed at baseline. The immediate source rollback is therefore to leave `main` unchanged.

After a preview deployment, rollback options are:

1. Restore the prior known-good Cloudflare deployment in the Cloudflare deployment history.
2. Redeploy the exact known-good source commit after verifying that its configured bindings remain attached.
3. Revert a Phase 1 commit on the phase branch and deploy the corrected preview.

Do not force-push shared history, reset production data, or detach/recreate D1 or R2 resources as a rollback method.

## Baseline environment

| Item | Value |
| --- | --- |
| Date | 2026-07-11 |
| OS | Linux x86_64 |
| Node | `v24.14.0` |
| npm | `11.9.0` |
| Required Node floor | Node 20 or newer |
| Dependency source | Locked `package-lock.json` via `npm ci` |

The first `npm ci` attempt failed because the execution environment could not create `/root/.npm`. This was classified as an environment failure. Re-running the same locked install with `NPM_CONFIG_CACHE=/tmp/commune-tcg-npm-cache` succeeded without changing repository files.

## Baseline automated result

- `npm test`: pass, 40 of 40 tests.
- `npm run build`: pass, 91 modules transformed.
- `npm run battle:simulate -- --iterations=1000`: pass, 1,000 iterations.
- `git diff --check`: pass.
- Final worktree after the gate: clean.

Detailed command records are maintained in [automated-validation.md](automated-validation.md).

## Outstanding release confirmations

- Human-session telemetry and matching transaction results from `007_phase1_human_telemetry_verify.sql`.
- Post-hotfix preview deployment SHA after the Phase 1 branch incorporates latest `main`.
- Current post-hotfix production deployment ID and active SHA.
- Cloudflare dashboard rollback availability and permissions.
- Sterling's explicit final merge decision after the Phase 1 recommendation is finalized.
