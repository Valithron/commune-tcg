# Phase 1 Authentication, Ownership, and Administrator Audit

## Executive finding

The active session model is coherent: secure cookie token to D1 session row to a known player slot. The Phase 1 audit found and corrected two caller-controlled read overrides, one public ownership diagnostic, a public legacy submission list, a Cloudflare Access/temporary identity path on submission creation, and a hard-coded reviewer identity. No caller-supplied identity remains able to override the authenticated owner in active player mutation paths inspected so far.

## Session path

1. A player chooses one of seven known slots.
2. Setup/login validates a four-digit PIN and salted SHA-256 hash.
3. `createSession` writes a random token with a 30-day expiry.
4. The response sets `ctcg_session` as HttpOnly, Secure, SameSite=Lax.
5. `getSessionUser` joins the token to the slot row and deletes expired sessions.
6. `/api/auth/me` is the browser authority and adds `isAdmin` from the configured allowlist.
7. Logout deletes the server session and clears the cookie.

Secrets, raw PINs, cookies, and session tokens are not logged by the audited code.

## Ownership map

| Domain | Authenticated ID source | Reads/writes | Caller override | Phase 1 result |
| --- | --- | --- | --- | --- |
| Library ownership metadata | `getSessionUser().id` | current user's owned-card counts | None | Pass |
| Vault | `getSessionUser().id` | owned `cards` rows | Historical query override removed | Automated isolation pass |
| Pull resources | `getSessionUser().id` | `user_resources` | None | Pass |
| Daily/Gold exchange | `getSessionUser().id` | `user_resources` | Offer only; no identity field | Automated isolation pass |
| Pull resolution/history | `getSessionUser().id` | resources, cards, requests, history | Pull helper now rejects missing user | Automated transaction pass |
| Submission creation | `getSessionUser().id` | R2 art + D1 submission | Cloudflare Access/fallback path removed | Source pass |
| Squad/inventory/forecast | `getSessionUser().id` | owner-scoped cards and squad | No identity override found | Source pass |
| Battle creation/recovery | `getSessionUser().id` | resources, attempts, cards | No identity override found | Automated lifecycle pass |
| Battle finalization/history | `getSessionUser().id` | resources, cards, history | Historical history query override removed | Automated isolation/exactly-once pass |
| Admin review | `getAdminSessionUser().id` | submissions and approved card | Hard-coded reviewer removed | Policy pass; preview pending |

## Corrected findings

| ID | Finding | Root cause | Correction | Evidence |
| --- | --- | --- | --- | --- |
| RH-005 | Signed-in player could query another Vault owner | Historical diagnostic `ownerUserId` override remained in player endpoint | Ignore caller owner, query only session ID, and stop returning global owner counts | `ownership-isolation.test.js` |
| RH-010 | Signed-in player could query another battle history owner | Historical query override remained | Query only session ID | `ownership-isolation.test.js` |
| RH-009 | Vault inventory exposed owner IDs and samples without admin auth | Read-only diagnostic predated authentication | Require shared administrator session | `admin-auth.test.js` |
| RH-007 | Submission POST accepted Cloudflare Access identity | Compatibility current-user helper remained active | Require player session directly; remove unused helper | Source audit and full suite |
| RH-011 | Legacy GET `/api/submissions` exposed the submission list | Historical combined GET/POST endpoint | Require administrator session for GET | `admin-auth.test.js` |
| RH-008 | Review rows and approved cards recorded a fixed temporary reviewer | Service did not receive authenticated admin | Pass and persist reviewer slot ID from admin session | Source audit and full suite |

## Administrator boundary

Browser admin routes require `user.isAdmin`. Every privileged API and historical diagnostic path inspected requires `getAdminSessionUser`. The server policy is decisive; hiding the UI is not treated as authorization. `ADMIN_USER_IDS` remains an allowlist rather than a full role/audit model, which is documented debt but does not permit an ordinary signed-in slot to call protected handlers.

## Remaining verification

- Behavioral login, expiry, logout, and account-switch testing in preview.
- Multiple-browser and stale-cache testing with Sterling and Cydney.
- Direct unauthorized calls against the deployed Worker.
- Confirm no Cloudflare routing rule bypasses `worker.js` dispatch.
- Verify R2 submission keys and rollback behavior on a safe preview binding.

No wrong-user mutation has been observed or performed during this audit. No real account or production row was changed.
