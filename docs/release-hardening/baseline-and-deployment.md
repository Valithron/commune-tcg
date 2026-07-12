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
| Preview deployment behavior | Isolated `DB` and `CARD_IMAGES` bindings present; resource names/IDs pending record |

## Deployment ledger

| Environment | Project | Branch | Commit | URL | D1 binding | R2 binding | Result | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production | `commune-tcg-gacha` | `main` | `2193be5550f34daa67051c35e3c0a8311a15ef82` | `https://d3d3aafd.commune-tcg.pages.dev` plus production aliases | `DB` -> `com-tcg-db` | `CARD_IMAGES` -> `com-tcg-images` | Successful and active | Restore this deployment ID or redeploy the exact SHA after verifying bindings |
| Preview | `commune-tcg-gacha` | `phase/release-hardening` | `8ca094bbcb062e25bd606f37bba521c9fccac205` | `https://phase-release-hardening.commune-tcg.pages.dev` | Present and isolated; name/ID pending | Present and isolated; bucket name pending | Health reports both bindings true; auth schema bootstrap complete | Remove disposable data or restore the prior isolated preview deployment |

## Runtime and binding inventory

`wrangler.toml` declares the Worker entry point, compatibility date, built-asset directory, `ASSETS` binding, and SPA fallback. Production D1 and R2 resource IDs are intentionally not checked in.

| Binding or configuration | Type | Known purpose | Source status |
| --- | --- | --- | --- |
| `ASSETS` | Worker assets | Serve `dist/` and the SPA fallback | Declared in `wrangler.toml` |
| `DB` | Cloudflare D1 | Application, account, collection, economy, and battle state | Production `com-tcg-db`; isolated preview binding present, name/ID pending |
| `CARD_IMAGES` | Cloudflare R2 | Card and submission art | Production `com-tcg-images`; isolated preview binding present, bucket name pending |
| `ADMIN_USER_IDS` | Environment variable | Comma-separated administrator slot allowlist | Optional; values not recorded; defaults to `sterling` |

Confirmed production resources remain D1 `com-tcg-db` and R2 `com-tcg-images`. Sterling confirmed the preview bindings target separate resources, and the preview health endpoint now reports both bindings present. Exact preview resource names and the D1 identifier must still be recorded before direct migration or fixture writes.

No secret values were read or recorded.

## Preview and data safety

The Phase 1 branch preview is live at `https://phase-release-hardening.commune-tcg.pages.dev`. After Sterling configured isolated preview resources, a read-only `/api/health` request reports `DB: true` and `CARD_IMAGES: true`. Sterling confirmed these bindings are separate from production.

The deployed JavaScript asset `index-DX6pVCTS.js` and CSS asset `index-BGWE4WVZ.css` match a fresh build from commit `8ca094bbcb062e25bd606f37bba521c9fccac205`. This verifies that the exact reconciled branch source is deployed without relying on an application mutation.

After binding isolation and exact source deployment were verified, `GET /api/auth/users` performed the application's idempotent auth-schema bootstrap against the isolated preview D1 database. It succeeded and returned the seven canonical player slots with no usernames and `pinSet: false`. This created only the auth support schema and canonical slot rows. It did not create credentials, sessions, cards, economy resources, battle data, telemetry events, or R2 objects. Direct additive migrations and disposable gameplay fixtures remain blocked until the exact preview D1 name/identifier and R2 bucket name are recorded.

Safe read-only checks confirmed:

- Static application and manifest: 200.
- `/api/health`: 200 with both bindings true after isolated-resource configuration.
- `/api/auth/users`: 200 after isolated auth-schema bootstrap; seven unclaimed canonical slots returned.
- `/api/battle-reward-contract`: 200 and explicitly read-only.
- Public desktop UI: pass at 1363 by 936 in Chrome; all seven slot controls and setup fields rendered with no application console errors.
- Stateful gameplay and R2 verification: pending direct additive migrations and disposable seed data.

No pull, Energy, battle, reward, XP, telemetry, D1, or R2 mutation was attempted before isolation was confirmed. The only post-isolation D1 mutation so far is the minimal idempotent auth bootstrap described above. Authenticated core-loop and human testing remain pending minimal isolated schema and seed setup.

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

- Preview D1 database name and identifier.
- Preview R2 bucket name.
- Post-hotfix preview deployment SHA after the Phase 1 branch incorporates latest `main`.
- Current post-hotfix production deployment ID and active SHA.
- Cloudflare dashboard rollback availability and permissions.
