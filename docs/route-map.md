# Route Map

## Active Phase 1 routes

| Route | File | Purpose |
|---|---|---|
| `#/home` | `src/routes/Home.js` | Player dashboard and quick actions |
| `#/pull` | `src/routes/Pull.js` | Gacha entry point and ticket CTA |
| `#/vault` | `src/routes/Vault.js` | Owned card collection |
| `#/library` | `src/routes/Library.js` | Global card pool preview |

## Active Phase 2 routes

| Route | File | Purpose |
|---|---|---|
| `#/pull/confirm?count=1` | `src/routes/PullConfirm.js` | Confirm a 1-pull ticket spend |
| `#/pull/confirm?count=5` | `src/routes/PullConfirm.js` | Confirm a 5-pull ticket spend |
| `#/pull/results?count=1` | `src/routes/PullResults.js` | Show deterministic one-card mock result |
| `#/pull/results?count=5` | `src/routes/PullResults.js` | Show deterministic five-card mock result |
| `#/vault/card/:cardId` | `src/routes/VaultCardDetail.js` | Owned card detail screen |
| `#/library/card/:cardId` | `src/routes/LibraryCardDetail.js` | Global template detail screen |
| `#/shop` | `src/routes/TicketShop.js` | Static ticket shop layout |

## Active Phase 3 routes

| Route | File | Purpose |
|---|---|---|
| `#/battle` | `src/routes/BattleHub.js` | Battle hub and readiness summary |
| `#/battle/encounters` | `src/routes/EncounterSelect.js` | Choose enemy encounter |
| `#/battle/squad?encounter=:encounterId` | `src/routes/SquadBuilder.js` | Review selected squad before battle |
| `#/battle/results?encounter=:encounterId` | `src/routes/BattleResults.js` | Show deterministic battle result and rewards |

## Active Phase 4 routes

| Route | File | Purpose |
|---|---|---|
| `#/submit` | `src/routes/SubmitCard.js` | Static card submission form shape |
| `#/admin` | `src/routes/AdminDashboard.js` | Static moderation/admin dashboard |

## Active Phase 5 routes

| Route | File | Purpose |
|---|---|---|
| `#/backend` | `src/routes/BackendStatus.js` | Read-only backend status and diagnostic endpoint links |

## Active Phase 6 routes

| Route | File | Purpose |
|---|---|---|
| `#/inventory` | `src/routes/ResourceInventory.js` | Resource inventory hub before real backend reads |

## Active Phase 7.5 routes

| Route | File | Purpose |
|---|---|---|
| `#/card-lab` | `src/routes/CardLab.js` | Live card-frame inspection across title lengths and densities |

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

## Routing implementation note

Hash routing is temporary and practical for the static prototype. Phase 7.5 adds a Card Lab for frame stabilization, but it still performs no gameplay writes. If this becomes a larger app with deeper navigation and server-side concerns, route ownership should be revisited before backend coupling.
