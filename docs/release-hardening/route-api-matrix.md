# Phase 1 Route and API Regression Matrix

## Classification

- **Source pass:** route or endpoint is reachable in the current router/dispatcher, its policy was traced, and the production build includes it.
- **Automated pass:** at least one focused automated contract covers the named risk.
- **Preview pending:** live bindings, browser navigation, recovery states, and device layout still require a deployed preview.
- **Human pending:** behavior requires Sterling, Cydney, or Ashley evidence.

## Browser surfaces

The authentication gate precedes every hash route. Signed-out direct links render Sign In. Player routes render in `AppShell`, the arena renders in the battle-only shell, and administrator routes require `user.isAdmin` before their renderer executes.

| ID | Surface | Method | Account | Device | Expected state | Actual state | Result | Evidence | Defect link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI-01 | Sign In / auth gate | Hash entry | Signed out | Chrome/Linux, 1363x936 | Slot setup or login; redirect retained | Seven canonical setup slots, username, PIN confirmation, and Create Vault rendered cleanly | Desktop preview pass | Public browser inspection at commit `8ca094b`; no application console errors | None |
| UI-02 | `#/home` | Hash route | Player | Source/Linux | Dashboard and next actions | Player shell route registered | Source pass; preview pending | `src/main.js`, `src/routes/Home.js` | None |
| UI-03 | `#/pull` | Hash route | Player | Source/Linux | Resources, pull choices, history entry | Registered; resource-backed render | Source pass; preview pending | `Pull.js`, pull UI | None |
| UI-04 | `#/pull/confirm` | Hash route | Player | Source/Linux | Confirmation with guarded pending state | Compatibility route registered | Source pass; preview pending | `PullConfirm.js`, confirmation sheet | RH-006 |
| UI-05 | `#/pull/reveal` | Hash route | Player | Source/Linux | Stored committed reveal; no new charge on refresh | Session-backed reveal registered | Source pass; preview pending | reveal store and modal | RH-006 |
| UI-06 | `#/pull/results` | Hash route | Player | Source/Linux | Previously committed results and safe actions | Compatibility results route registered | Source pass; preview pending | `PullResults.js` | None |
| UI-07 | `#/pull/history` | Hash route | Player | Source/Linux | Current player's history | Owner-scoped API caller | Source pass; preview pending | `PullHistory.js` | None |
| UI-08 | `#/vault` | Hash route | Player | Source/Linux | Current player's owned copies, filters, empty/error states | Owner override removed; automated isolation passes | Automated pass; preview pending | `ownership-isolation.test.js` | RH-005 |
| UI-09 | `#/vault/card/:cardId` | Hash route | Player | Source/Linux | Owned-card detail or missing state | Registered; resolves from owner-scoped Vault data | Source pass; preview pending | `VaultCardDetail.js` | None |
| UI-10 | `#/library` | Hash route | Player | Source/Linux | Global templates plus current-player ownership count | Authenticated Library API caller | Source pass; preview pending | `Library.js`, `cards.js` | None |
| UI-11 | `#/library/card/:cardId` | Hash route | Player | Source/Linux | Template detail or missing state | Registered | Source pass; preview pending | `LibraryCardDetail.js` | None |
| UI-12 | `#/shop` | Hash route | Player | Source/Linux | Daily and Gold exchanges with pending/insufficient states | Guarded transaction caller | Automated transaction pass; preview pending | `economy-transactions.test.js` | None |
| UI-13 | `#/battle` | Hash route | Player | Source/Linux | Battle readiness and pending-state recovery | Registered | Source pass; preview pending | `BattleHub.js` | None |
| UI-14 | `#/battle/encounters` | Hash route | Player | Source/Linux | Versioned encounters and costs | Registered | Source pass; preview pending | `EncounterSelect.js` | None |
| UI-15 | `#/battle/squad` | Hash route | Player | Source/Linux | Ordered owned formation and forecasts | Registered; UI contract tests pass | Automated pass; preview pending | battle UI tests | None |
| UI-16 | `#/battle/arena` | Hash route | Player | Source/Linux | Full-screen stored-event playback and recovery | Dedicated shell; playback tests pass | Automated pass; preview pending | playback/UI tests | None |
| UI-17 | `#/battle/results` | Hash route | Player | Source/Linux | Persisted settlement and reward queue | Registered; reward UI tests pass | Automated pass; preview pending | battle backend/UI tests | None |
| UI-18 | `#/submit` | Hash route | Player | Source/Linux | Authenticated card submission | POST now requires player session | Source pass; preview pending | `SubmitCard.js`, `submissions.js` | RH-007 |
| UI-19 | `#/admin` | Hash route | Administrator | Source/Linux | Protected hub | Browser and server policy traced | Source pass; preview pending | `main.js`, admin auth tests | None |
| UI-20 | `#/admin/battle-check` | Hash route | Administrator | Source/Linux | Protected lifecycle diagnostic | Registered and admin-gated | Source pass; mutation preview pending | `AdminBattleTest.js` | None |
| UI-21 | `#/admin/cards` | Hash route | Administrator | Source/Linux | Protected card management | Registered and server-gated | Source pass; preview pending | admin auth tests | None |
| UI-22 | `#/admin/card-mechanics` | Hash route | Administrator | Source/Linux | Protected mechanics audit/repair | Registered and server-gated | Source pass; destructive actions not run | admin auth tests | None |
| UI-23 | `#/admin/submit-crop-lab` | Hash route | Administrator | Source/Linux | Protected crop diagnostics | Registered | Source pass; preview pending | `AdminSubmitCropLab.js` | None |
| UI-24 | `#/admin/submissions` and detail | Hash route | Administrator | Source/Linux | Protected review queue and authenticated reviewer audit | Reviewer identity now comes from session | Automated policy pass; preview pending | `submission-action.js` | RH-008 |
| UI-25 | `#/admin/backend`, inventory, Card Lab | Hash route | Administrator | Source/Linux | Protected diagnostics | Registered; Vault inventory protection added | Automated policy pass; preview pending | admin auth tests | RH-009 |

For all UI rows, populated, empty, loading, error, direct-link, refresh, back/forward, slow-response, and common iPhone-width checks remain **preview pending** unless an automated contract is named. Unknown routes safely fall back to Home or Admin Home. Mobile visual evidence is not claimed from source inspection.

## Worker and API contracts

| ID | Surface | Method | Account policy | Primary dependency | Client caller | Result |
| --- | --- | --- | --- | --- | --- | --- |
| API-01 | `/api/health` | GET | Public | Binding booleans only | Backend status | Source pass |
| API-02 | `/api/auth/users` | GET | Public | D1 auth tables | Sign In | Source pass |
| API-03 | `/api/auth/me` | GET | Session or 401 | D1 auth/session tables | Auth client | Source pass |
| API-04 | `/api/auth/setup-pin` | POST | Public slot setup validation | D1 auth/session tables | Sign In | Source pass; behavior tests pending |
| API-05 | `/api/auth/login` | POST | Public credential validation | D1 auth/session tables | Sign In | Source pass; behavior tests pending |
| API-06 | `/api/auth/logout` | GET/POST | Session cleanup | D1 auth/session tables | Auth client | Source pass; behavior tests pending |
| API-07 | `/api/cards` | GET | Player session | D1 cards | Library | Owner-scoped source pass |
| API-08 | `/api/card-image` | GET | Public known key | R2 `CARD_IMAGES` | Card renderer | Source pass; missing-image preview pending |
| API-09 | `/api/vault` | GET | Player session | D1 cards | Vault/Home/squad data | Automated isolation pass |
| API-10 | `/api/pull-resources` | GET | Player session | D1 `user_resources` | Top bar/Pull/Shop | Energy tests pass; preview pending |
| API-11 | `/api/pull-top-up` | POST | Player session | D1 `user_resources` | Ticket Shop | Automated daily/Gold/isolation pass |
| API-12 | `/api/pulls` | POST | Player session | D1 cards/resources/history/requests | Pull confirmation | Automated idempotency/concurrency pass |
| API-13 | `/api/pull-history` | GET | Player session | D1 pull history/cards | Pull History | Owner-scoped source pass |
| API-14 | `/api/submissions` | POST | Player session | D1 + R2 | Submit Card | Source pass; R2 failure preview pending |
| API-15 | `/api/battle-inventory` | GET | Player session | D1 cards | Squad | Owner-scoped source pass |
| API-16 | `/api/battle-encounters` | GET | Player session | Shared encounter registry | Encounter Select | Source pass |
| API-17 | `/api/battle-squad` | GET/POST | Player session | D1 squad/cards | Squad | Source/engine pass; isolation test pending |
| API-18 | `/api/battle-forecast` | POST | Player session | D1 cards + pure engine | Squad | Contract corrected; engine tests pass |
| API-19 | `/api/battle-simulate` | GET | Administrator session | Pure engine | Admin diagnostics | Automated policy pass |
| API-20 | `/api/battle-attempt` | GET | Player session | D1 attempts | Arena/results | Owner-scoped source pass |
| API-21 | `/api/battles` | POST | Player session | D1 resources/cards/attempts | Squad/Admin check | Automated Energy/idempotency pass |
| API-22 | `/api/battle-finalize` | POST | Player session | D1 attempts/resources/cards/history | Arena/results | Automated exactly-once pass |
| API-23 | `/api/battle-history` | GET | Player session | D1 history | Battle surfaces | Automated isolation pass |
| API-24 | `/api/battle-reward-contract` | GET | Public read-only constants | Shared reward contract | Admin diagnostics | Source/UI contract pass |
| API-25 | `/api/schema`, `/api/schema-details` | GET | Administrator session | D1 metadata | Admin diagnostics | Automated policy pass |
| API-26 | `/api/images`, `/api/images-summary` | GET | Administrator session | R2 | Admin diagnostics | Automated policy pass |
| API-27 | `/api/vault-inventory` | GET | Administrator session | D1 ownership diagnostics | Admin inventory | Policy corrected; automated pass |
| API-28 | `/api/submission-inventory`, `/api/submission-review-audit` | GET | Administrator session | D1/R2 diagnostics | Admin inventory | Automated policy pass |
| API-29 | `/api/pull-pool`, `/api/pull-simulate` | GET | Administrator session | D1/pull engine | Admin diagnostics | Automated policy pass |
| API-30 | `/api/submissions` | GET | Administrator session | D1 submission list | Legacy diagnostic | Policy corrected; automated static pass |
| API-31 | `/api/admin/submissions`, `/api/admin/submission` | GET | Administrator session | D1 submissions | Admin review | Automated policy pass |
| API-32 | `/api/admin/submission-action` | POST | Administrator session | D1 cards/submissions | Admin review | Policy and reviewer identity pass; behavior preview pending |
| API-33 | `/api/admin/cards` | GET/POST/DELETE | Administrator session | D1/R2 | Admin editor | Automated policy pass; mutations not run live |
| API-34 | `/api/admin/card-mechanics` | GET/POST | Administrator session | D1 card mechanics | Admin mechanics | Automated policy pass; destructive actions not run live |
| API-35 | `/api/telemetry` | POST | Player session | D1 telemetry events/aggregates | Non-blocking telemetry client | Automated validation, deduplication, rate-limit, and identity-derivation pass; preview pending |
| API-36 | `/api/admin/telemetry` | GET/DELETE | Administrator session | D1 telemetry events/aggregates/audit | Administrator diagnostics | Automated authorization, export, retention, deletion, and audit pass; live mutation pending binding verification |

## Public assets

| ID | Surface | Expected | Result |
| --- | --- | --- | --- |
| ASSET-01 | `/assets/commune-card-back.png` | Stable compatibility URL, Imago Core accessible copy | Build pass |
| ASSET-02 | `/assets/commune-pull-orb.svg` | Stable compatibility URL | Build pass |
| ASSET-03 | Rarity frame imports | Five canonical bundled frames | Build and branding pass |
| ASSET-04 | `/manifest.webmanifest` | Imago Core identity and palette | Automated branding pass |

## Read-only Cloudflare preview verification

Preview: `https://phase-release-hardening.commune-tcg.pages.dev`

| Surface | Result | Interpretation |
| --- | --- | --- |
| Static application and manifest | 200 | Branch preview and built assets are available |
| `/api/health` | 200, `DB: true`, `CARD_IMAGES: true` | Isolated preview bindings are present; exact resource IDs remain to be recorded |
| `/api/auth/users` | 200, seven canonical slots, all unclaimed | Idempotent auth schema bootstrap succeeded after isolation was verified |
| `/api/auth/me`, `/api/cards`, `/api/pull-resources` | Pending after remaining additive schema/seed | Stateful checks must use disposable isolated data only |
| `/api/battle-reward-contract` | 200 | Binding-independent read-only contract is available |
| `/api/card-image` | Pending disposable preview object | R2 binding is present and isolated |

No POST, DELETE, economy, Energy, battle, reward, XP, telemetry, or R2 mutation was attempted. The only D1 mutation was the post-isolation idempotent auth-schema bootstrap invoked by `GET /api/auth/users`; it created no credentials or gameplay resources.
