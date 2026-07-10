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
| `#/battle/encounters` | `src/routes/EncounterSelect.js` | Inspect the canonical three-enemy formation, rule, Energy, and rewards |
| `#/battle/squad?encounter=:encounterId&squadCardIds=:ids` | `src/routes/SquadBuilder.js` | Save explicit left/center/right order and view isolated-lane forecasts |
| `#/battle/arena?attemptId=:attemptId` | `src/routes/BattleArena.js` | Full-screen stored-event playback, pause, inspection, recovery, skip, and retreat |
| `#/battle/results?attemptId=:attemptId` | `src/routes/BattleResults.js` | Persisted result, MVP, automatic reward queue, XP, and level-ups |
| `#/submit` | `src/routes/SubmitCard.js` | Player-facing card submission form shape |

## Admin and diagnostic routes

These routes render through `src/components/AdminShell.js`. Admin navigation intentionally contains no links back to player routes.

| Route | File | Purpose |
|---|---|---|
| `#/admin` | `src/routes/AdminIndex.js` | Isolated admin and diagnostics hub |
| `#/admin/battle-check` | `src/routes/AdminBattleTest.js` | Button-based protected battle reward write check |
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
| `/api/pull-resources` | `functions/api/pull-resources.js` | Read Pull Tickets, Gold, daily pull state, and Energy |
| `/api/battle-inventory` | `functions/api/battle-inventory.js` | Read battle cards, normalized image fields, and table diagnostics |
| `/api/battle-encounters` | `functions/api/battle-encounters.js` | Read the canonical versioned encounter registry |
| `/api/battle-forecast` | `functions/api/battle-forecast.js` | Generate Favored/Even/Risky labels from isolated canonical simulations |
| `/api/battle-simulate` | `functions/api/battle-simulate.js` | No-write canonical seeded lane simulation |
| `/api/battle-squad` | `functions/api/battle-squad.js` | Read and save exactly three ordered owned card IDs |
| `/api/battle-attempt` | `functions/api/battle-attempt.js` | Recover a specific attempt or latest pending attempt |
| `/api/battles` | `functions/api/battles.js` | Create a pending authoritative attempt and spend Energy exactly once |
| `/api/battle-finalize` | `functions/api/battle-finalize.js` | Finalize stored outcome or surrender and settle rewards exactly once |
| `/api/battle-history` | `functions/api/battle-history.js` | Read battle history with reward and XP details |
| `/api/battle-reward-contract` | `functions/api/battle-reward-contract.js` | Read Battle Phase 5 reward and XP contract |

## Routing implementation note

The Gacha app currently uses hash routing because it is safer for a static Cloudflare Pages app. Phase 10F.3 keeps the same routing model, but route renders now reset scroll to the top after mounting the new shell. This keeps Battle Results from opening halfway down the page after the player starts a battle from a scrolled Squad Builder screen.
