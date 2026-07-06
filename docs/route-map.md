# Route Map

## Player routes

These routes render through `src/components/AppShell.js` with the player top bar and bottom nav.

| Route | File | Purpose |
|---|---|---|
| `#/home` | `src/routes/Home.js` | Player dashboard and quick actions |
| `#/pull` | `src/routes/Pull.js` | Gacha entry point and ticket CTA |
| `#/pull/confirm?count=1` | `src/routes/PullConfirm.js` | Confirm a 1-pull ticket spend |
| `#/pull/confirm?count=5` | `src/routes/PullConfirm.js` | Confirm a 5-pull ticket spend |
| `#/pull/results?count=1` | `src/routes/PullResults.js` | Show pull result |
| `#/pull/results?count=5` | `src/routes/PullResults.js` | Show five-pull result |
| `#/pull/history` | `src/routes/PullHistory.js` | Show pull history |
| `#/vault` | `src/routes/Vault.js` | Owned card collection |
| `#/vault/card/:cardId` | `src/routes/VaultCardDetail.js` | Owned card detail screen |
| `#/library` | `src/routes/Library.js` | Global card pool preview |
| `#/library/card/:cardId` | `src/routes/LibraryCardDetail.js` | Global template detail screen |
| `#/shop` | `src/routes/TicketShop.js` | Ticket shop layout |
| `#/battle` | `src/routes/BattleHub.js` | Battle hub and readiness summary |
| `#/battle/encounters` | `src/routes/EncounterSelect.js` | Choose enemy encounter |
| `#/battle/squad?encounter=:encounterId&squadCardIds=:ids` | `src/routes/SquadBuilder.js` | Select backend-owned battle cards for the active squad |
| `#/battle/results?encounter=:encounterId&squadCardIds=:ids` | `src/routes/BattleResults.js` | Resolve selected backend squad and apply rewards |
| `#/submit` | `src/routes/SubmitCard.js` | Player-facing card submission form shape |

## Admin and diagnostic routes

These routes render through `src/components/AdminShell.js`. Admin navigation intentionally contains no links back to player routes.

| Route | File | Purpose |
|---|---|---|
| `#/admin` | `src/routes/AdminIndex.js` | Isolated admin and diagnostics hub |
| `#/admin/battle-check` | `src/routes/AdminBattleTest.js` | Button-based Phase 5 battle reward write check |
| `#/admin/submissions` | `src/routes/AdminDashboard.js` | Submission review queue |
| `#/admin/submission/:submissionId` | `src/routes/AdminSubmissionDetail.js` | Submission review detail and server-owned review actions |
| `#/admin/backend` | `src/routes/BackendStatus.js` | Backend status and diagnostic endpoint links |
| `#/admin/inventory` | `src/routes/ResourceInventory.js` | Resource inventory and verification checklist |
| `#/admin/card-lab` | `src/routes/CardLab.js` | Card frame inspection and tuning diagnostics |

## Legacy admin redirects

These older diagnostic routes are redirected into the admin boundary by `src/main.js`.

| Legacy route | Redirects to |
|---|---|
| `#/backend` | `#/admin/backend` |
| `#/inventory` | `#/admin/inventory` |
| `#/card-lab` | `#/admin/card-lab` |

## Active API endpoints

| Endpoint | File | Purpose |
|---|---|---|
| `/api/health` | `functions/api/health.js` | Confirm function runtime and binding availability |
| `/api/schema` | `functions/api/schema.js` | Read D1 table names from `sqlite_master` |
| `/api/schema-details` | `functions/api/schema-details.js` | Read D1 columns and indexes using PRAGMA metadata |
| `/api/images` | `functions/api/images.js` | Read a small R2 object sample |
| `/api/images-summary` | `functions/api/images-summary.js` | Summarize sampled R2 key patterns |
| `/api/cards` | `functions/api/cards.js` | Read and normalize Library cards from D1 |
| `/api/card-image?key=...` | `functions/api/card-image.js` | Read a single R2 card-art object by key |
| `/api/vault` | `functions/api/vault.js` | Read owned Vault cards |
| `/api/pull-pool` | `functions/api/pull-pool.js` | Read pull-eligible pool diagnostics |
| `/api/pull-simulate` | `functions/api/pull-simulate.js` | No-write pull simulation |
| `/api/pulls` | `functions/api/pulls.js` | Resolve pulls and write owned cards/history |
| `/api/pull-history` | `functions/api/pull-history.js` | Read pull history |
| `/api/pull-resources` | `functions/api/pull-resources.js` | Read pull tickets and gold resources |
| `/api/battle-inventory` | `functions/api/battle-inventory.js` | Read battle card and table diagnostics |
| `/api/battle-simulate` | `functions/api/battle-simulate.js` | No-write battle simulation |
| `/api/battles` | `functions/api/battles.js` | Resolve battle and write Phase 5 battle_history, gold, XP, and levels |
| `/api/battle-history` | `functions/api/battle-history.js` | Read battle history with reward and XP details |
| `/api/battle-reward-contract` | `functions/api/battle-reward-contract.js` | Read Battle Phase 5 reward and XP contract |

## Routing implementation note

The Gacha app currently uses hash routing because it is safer for a static Cloudflare Pages app. Phase 7 keeps hash routing and uses `squadCardIds` in the route query string so Squad Builder and Battle Results share the same backend-owned card selection. Normal slash routing can be revisited later after the player/admin split and progression writes are stable.
