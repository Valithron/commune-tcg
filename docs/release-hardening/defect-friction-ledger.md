# Phase 1 Defect and Friction Ledger

| ID | Area | Observation | Type | Severity | Reproduction | Evidence | Proposed response | Approval | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RH-001 | Energy | Energy was debited by battle creation but elapsed-time regeneration was never applied, so a depleted player could remain blocked indefinitely. | Reproduced | P1 | Set Energy below cap, advance persisted time, then read resources or create a battle. | Pre-fix resource and battle paths plus new regression tests. | Shared server-authoritative reconciliation on resource reads and before battle debit; 30 minutes, cap 10, partial preservation, safe timestamp backfill. | Pre-authorized by work order 6.2.1 | Implemented; preview verification pending |
| RH-002 | Documentation | Canonical backend contracts described current pull/resource flows as temporary Sterling-owned behavior. | Verified contradiction | P1 documentation risk | Compare authenticated handlers to `docs/backend-contracts.md`. | Authenticated source paths. | Correct canonical ownership and transaction text. | Not required | Implemented |
| RH-003 | Documentation | Card-frame guidance retained historical Card Lab route, Cydney color, and rarity-derived type styling. | Verified contradiction | P2 | Compare canonical brand, router, tokens, and frame guide. | Current route/color/type sources. | Correct guidance without visual redesign. | Not required | Implemented |
| RH-004 | Documentation | Route map listed battle forecast as GET while handler/caller use POST. | Verified contradiction | P2 | Compare route map, handler, and caller. | Source exposes POST. | Correct route map. | Not required | Implemented |
| RH-005 | Vault ownership | Authenticated `/api/vault` honored `ownerUserId`, exposing another player's owned-card rows and global owner counts. | Reproduced | P1 | Sign in as Sterling and request `?ownerUserId=cydney`. | Behavioral SQLite endpoint test. | Ignore caller owner, query session owner only, and return only current-owner counts. | Not required; unambiguous ownership fix | Implemented; automated verified |
| RH-006 | Pull integrity | Pulls lacked a durable request key, so retries or competing requests could duplicate charges/grants or grant cards after a raced zero-row debit. | Reproduced by code audit | P0 transaction risk | Submit repeated or concurrent pull requests around the same balance. | New transaction fixtures. | Add token-guarded `pull_requests` claim and client request reuse. | Not required; isolated idempotency fix | Implemented; automated verified |
| RH-007 | Submission ownership | Submission creation accepted Cloudflare Access identity instead of requiring the player session. | Verified | P1 | Call POST without player cookie but with Access identity header. | Source trace through removed `current-user.js`. | Require `getSessionUser` and remove unused fallback helper. | Not required | Implemented; preview pending |
| RH-008 | Admin audit | Submission review persisted `temporary-admin-sterling` instead of the authenticated reviewer. | Verified | P1 | Review as any configured administrator and inspect `reviewed_by`/approved card JSON. | Source trace. | Pass authenticated admin slot ID into review service and persistence. | Not required | Implemented; preview pending |
| RH-009 | Admin confidentiality | `/api/vault-inventory` exposed owner IDs and sample owned rows without administrator authorization. | Verified | P1 | Call endpoint signed out. | Source trace and policy test. | Require shared administrator session. | Not required | Implemented; automated policy verified |
| RH-010 | Battle history ownership | Authenticated history endpoint honored a caller owner override. | Reproduced | P1 | Sign in as Sterling and request Cydney owner ID. | Behavioral SQLite endpoint test. | Query session owner only. | Not required | Implemented; automated verified |
| RH-011 | Submission confidentiality | Legacy GET `/api/submissions` returned the review list without administrator authorization. | Verified | P1 | Call GET signed out. | Source trace and policy test. | Require administrator session for GET while POST requires player session. | Not required | Implemented; automated policy verified |

## Manual resource adjustment ledger

| Date | Environment | Player | Resource | Amount | Direction | Reason | Operator | Before | After | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | None | None | None | 0 | None | No real-account adjustment performed | Work mode | N/A | N/A | N/A |

## Deployment ledger

| Environment | Project | Branch | Commit | URL | D1 binding | R2 binding | Deployed at | Result | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Production | `commune-tcg-gacha` | `main` | Exact live SHA unknown; last repository trigger `e9066bb` | Unknown | `DB` / documented `com-tcg-db` | `CARD_IMAGES` / documented `com-tcg-images` | Unknown | Repository says deployment path was verified | Restore prior Cloudflare deployment or redeploy verified known-good commit |
