# Imago Core Route Map

`src/main.js` is the browser route source of truth. `worker.js` is the Worker API dispatch source of truth.

## Player routes

| Route | File | Purpose |
|---|---|---|
| `#/home` | `src/routes/Home.js` | Player dashboard, daily/battle actions, and strongest owned card |
| `#/pull` | `src/routes/Pull.js` | Pull chamber, options, history, and confirmation entry |
| `#/pull/confirm` | `src/routes/PullConfirm.js` | Compatibility confirmation route |
| `#/pull/reveal` | `src/routes/PullReveal.js` | Single or multi resolved-card reveal |
| `#/pull/results` | `src/routes/PullResults.js` | Post-reveal results state |
| `#/pull/history` | `src/routes/PullHistory.js` | Player pull history |
| `#/vault` | `src/routes/Vault.js` | Owned-card collection, search, filters, sorting, and duplicates |
| `#/vault/card/:cardId` | `src/routes/VaultCardDetail.js` | Owned-card detail |
| `#/library` | `src/routes/Library.js` | Global template catalog, search, filters, and sorting |
| `#/library/card/:cardId` | `src/routes/LibraryCardDetail.js` | Library template detail |
| `#/shop` | `src/routes/TicketShop.js` | Daily ticket and Gold exchanges |
| `#/battle` | `src/routes/BattleHub.js` | Battle entry and readiness |
| `#/battle/encounters` | `src/routes/EncounterSelect.js` | Encounter formation, rules, cost, and rewards |
| `#/battle/squad` | `src/routes/SquadBuilder.js` | Ordered squad selection and lane forecasts |
| `#/battle/arena` | `src/routes/BattleArena.js` | Full-screen stored-event playback and controls |
| `#/battle/results` | `src/routes/BattleResults.js` | Persisted outcome, MVP, reward queue, XP, and retry |
| `#/submit` | `src/routes/SubmitCard.js` | Player card submission and crop preview |

Player routes use `AppShell`, except the arena, which uses a dedicated battle shell.

## Administrator routes

| Route | File | Purpose |
|---|---|---|
| `#/admin` | `src/routes/AdminIndex.js` | Protected admin and diagnostics hub |
| `#/admin/battle-check` | `src/routes/AdminBattleTest.js` | Protected battle reward write check |
| `#/admin/cards` | `src/routes/AdminCardEditor.js` | Library card editor, creator, art, crop, rarity, and types |
| `#/admin/card-mechanics` | `src/routes/AdminCardMechanics.js` | Mechanics audit, stats, founder rarity, and repair actions |
| `#/admin/submit-crop-lab` | `src/routes/AdminSubmitCropLab.js` | Submission crop diagnostics |
| `#/admin/submissions` | `src/routes/AdminDashboard.js` | Submission review queue |
| `#/admin/submission/:submissionId` | `src/routes/AdminSubmissionDetail.js` | Review detail, creator, rarity, type odds, approve/reject |
| `#/admin/backend` | `src/routes/BackendStatus.js` | Backend status and diagnostic links |
| `#/admin/inventory` | `src/routes/ResourceInventory.js` | D1/R2 inventory and verification checklist |
| `#/admin/card-lab` | `src/routes/CardLab.js` | Canonical card renderer inspection and tuning |

The browser requires `user.isAdmin` before rendering an admin shell. Every `/api/admin/*` endpoint independently enforces the server allowlist.

Legacy browser redirects:

| Old route | Target |
|---|---|
| `#/backend` | `#/admin/backend` |
| `#/inventory` | `#/admin/inventory` |
| `#/card-lab` | `#/admin/card-lab` |

## Authentication APIs

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/auth/users` | List known player slots and setup status |
| `GET` | `/api/auth/me` | Read active session and admin policy flag |
| `POST` | `/api/auth/setup-pin` | Set username/PIN and establish session |
| `POST` | `/api/auth/login` | Verify PIN and establish session |
| `POST` | `/api/auth/logout` | Destroy session and clear cookie |

## Player and collection APIs

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Runtime identity and binding availability |
| `GET` | `/api/cards` | Normalized Library templates |
| `GET` | `/api/card-image` | One R2 image by validated key |
| `GET` | `/api/vault` | Current player's owned cards and duplicates |
| `GET` | `/api/vault-inventory` | Vault schema and normalization diagnostics |
| `GET` | `/api/pull-resources` | Tickets, Gold, daily state, and Energy |
| `POST` | `/api/pull-top-up` | Daily claim or Gold-to-ticket transaction |
| `GET` | `/api/pull-pool` | Pull pool diagnostics |
| `GET` | `/api/pull-simulate` | No-write pull simulation |
| `POST` | `/api/pulls` | Resolve pull and write ownership/history |
| `GET` | `/api/pull-history` | Current player's pull history |
| `POST` | `/api/submissions` | Create player card submission |

## Battle APIs

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/battle-inventory` | Battle-eligible owned cards |
| `GET` | `/api/battle-encounters` | Versioned encounter registry |
| `GET/POST` | `/api/battle-squad` | Read or save ordered squad |
| `GET` | `/api/battle-forecast` | Isolated lane forecast |
| `GET` | `/api/battle-simulate` | No-write seeded simulation |
| `GET` | `/api/battle-attempt` | Recover a pending or specific attempt |
| `POST` | `/api/battles` | Create authoritative attempt and debit Energy |
| `POST` | `/api/battle-finalize` | Exactly-once finalize or surrender |
| `GET` | `/api/battle-history` | Persisted battle history |
| `GET` | `/api/battle-reward-contract` | Reward and XP contract |

## Administrator and diagnostic APIs

| Method | Path | Purpose |
|---|---|---|
| `GET/POST/DELETE` | `/api/admin/cards` | Protected Library card management |
| `GET/POST` | `/api/admin/card-mechanics` | Protected mechanics audit and mutations |
| `GET` | `/api/admin/submissions` | Protected review queue |
| `GET` | `/api/admin/submission` | Protected submission detail |
| `POST` | `/api/admin/submission-action` | Protected approval/rejection mutation |
| `GET` | `/api/schema` | D1 table diagnostics |
| `GET` | `/api/schema-details` | D1 columns/index diagnostics |
| `GET` | `/api/images` | R2 object sample |
| `GET` | `/api/images-summary` | R2 key summary |
| `GET` | `/api/submission-inventory` | Submission schema inventory |
| `GET` | `/api/submission-review-audit` | Submission-review diagnostics |

All schema, R2 inventory, submission audit, pull-pool, pull-simulation, and battle-simulation endpoints require the same administrator session policy even when their historical URL is not under `/api/admin/*`. `/api/health` remains intentionally public and reveals only service identity and binding booleans.

## Routing behavior

Imago Core uses hash routing so static asset delivery can always return the SPA shell. Route changes reset document, app-root, and main-content scroll positions. The battle arena removes normal app navigation. Unknown player routes return Home, while unknown admin routes return Admin Home and still pass admin policy.
