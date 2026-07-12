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
| Preview deployment behavior | Pending branch preview inspection |

## Deployment ledger

| Environment | Project | Branch | Commit | URL | D1 binding | R2 binding | Result | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production | `commune-tcg-gacha` | `main` | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `https://d3d3aafd.commune-tcg.pages.dev` plus production aliases | `DB` -> `com-tcg-db` | `CARD_IMAGES` -> `com-tcg-images` | Successful and active | Restore this deployment ID or redeploy the exact SHA after verifying bindings |
| Preview | `commune-tcg-gacha` | `phase/release-hardening` | `9713efe8c825815fd242468e28ab37a58fb5f1c1` | `https://phase-release-hardening.commune-tcg.pages.dev` | Missing | Missing | Static application and binding-independent reads available | No data mutation is possible without bindings; restore branch deployment after correction |

## Runtime and binding inventory

`wrangler.toml` declares the Worker entry point, compatibility date, built-asset directory, `ASSETS` binding, and SPA fallback. Production D1 and R2 resource IDs are intentionally not checked in.

| Binding or configuration | Type | Known purpose | Source status |
| --- | --- | --- | --- |
| `ASSETS` | Worker assets | Serve `dist/` and the SPA fallback | Declared in `wrangler.toml` |
| `DB` | Cloudflare D1 | Application, account, collection, economy, and battle state | Confirmed in production as `com-tcg-db`; preview unknown |
| `CARD_IMAGES` | Cloudflare R2 | Card and submission art | Confirmed in production as `com-tcg-images`; preview unknown |
| `ADMIN_USER_IDS` | Environment variable | Comma-separated administrator slot allowlist | Optional; values not recorded; defaults to `sterling` |

Confirmed production resources are D1 `com-tcg-db` and R2 `com-tcg-images`. Their attachment to the Phase 1 preview remains unverified and must be established before mutation testing.

No secret values were read or recorded.

## Preview and data safety

The Phase 1 branch preview is live at `https://phase-release-hardening.commune-tcg.pages.dev`. A read-only `/api/health` request reports `DB: false` and `CARD_IMAGES: false`, while production reports both as `true`. The preview therefore has missing bindings, not separate resources and not production resources.

The preview JavaScript asset hash `index-DxgXpvjz.js` matches a fresh build from the published Phase 1 tree. This verifies that the branch source is deployed without requiring an application mutation.

Safe read-only checks confirmed:

- Static application and manifest: 200.
- `/api/health`: 200 with both bindings false.
- `/api/battle-reward-contract`: 200 and explicitly read-only.
- D1-dependent GETs such as `/api/auth/me`, `/api/cards`, and `/api/pull-resources`: 503 with the expected missing-DB response.
- R2 image GET: 503 with the expected missing-R2 response.

No pull, Energy, battle, reward, XP, telemetry, D1, or R2 mutation was attempted. Authenticated core-loop and human testing remain blocked until a safe preview binding model is approved and configured.

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

## Outstanding baseline confirmations

- Whether isolated preview D1/R2 resources will be provisioned for core-loop and human testing.
- Cloudflare dashboard rollback availability and permissions.
