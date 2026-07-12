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

The repository records that Cloudflare production was switched from `Gacha` to `main` and that commit `e9066bbf3e12bfc162606e82f538f8ebbcf72822` was created as a clean deployment trigger. This is the latest production-deployment evidence available in source control.

The exact commit currently running in production is **not discoverable from the checked-in repository**. The current `main` commit is four commits ahead of `e9066bb`. This does not prove deployment lag because the intervening commits may have deployed automatically. Cloudflare dashboard or live deployment metadata must be checked before preview sign-off and final release recommendation.

| Deployment fact | Verified value |
| --- | --- |
| Cloudflare Worker project | `commune-tcg-gacha` |
| Configured source branch | Repository evidence says `main` |
| Last source-controlled deployment trigger | `e9066bbf3e12bfc162606e82f538f8ebbcf72822` |
| Exact live production SHA | Unknown from repository evidence |
| Production URL/domain | Unknown from repository evidence |
| Custom-domain attachment | Unknown from repository evidence |
| Preview deployment behavior | Unknown from repository evidence |

## Runtime and binding inventory

`wrangler.toml` declares the Worker entry point, compatibility date, built-asset directory, `ASSETS` binding, and SPA fallback. Production D1 and R2 resource IDs are intentionally not checked in.

| Binding or configuration | Type | Known purpose | Source status |
| --- | --- | --- | --- |
| `ASSETS` | Worker assets | Serve `dist/` and the SPA fallback | Declared in `wrangler.toml` |
| `DB` | Cloudflare D1 | Application, account, collection, economy, and battle state | Name documented; resource ID/dashboard binding unavailable |
| `CARD_IMAGES` | Cloudflare R2 | Card and submission art | Name documented; resource ID/dashboard binding unavailable |
| `ADMIN_USER_IDS` | Environment variable | Comma-separated administrator slot allowlist | Optional; values not recorded; defaults to `sterling` |

Documented live resource names are D1 `com-tcg-db` and R2 `com-tcg-images`. Their binding attachment must be verified against the target deployment before mutation testing.

No secret values were read or recorded.

## Preview and data safety

The repository does not establish whether preview deployments use production bindings, separate preview resources, or no D1/R2 bindings. Until this is verified:

- Do not run destructive or bulk mutation tests against a preview.
- Treat any preview with live bindings as production data access.
- Use local SQLite-backed adapter tests for transaction and concurrency cases.
- Record all intentional real-account resource adjustments before they occur.

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

- Exact production commit.
- Production and preview URLs.
- Custom-domain attachment.
- Preview branch deployment trigger.
- Whether preview shares production D1/R2 bindings.
- Cloudflare dashboard rollback availability and permissions.
