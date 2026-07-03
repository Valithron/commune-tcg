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

## Planned Phase 3 routes

| Route | Purpose |
|---|---|
| `#/battle` | Battle hub |
| `#/battle/encounters` | Choose enemy encounter |
| `#/battle/squad` | Build squad from owned cards |
| `#/battle/results` | Rewards and battle outcome |

## Planned Phase 4 routes

| Route | Purpose |
|---|---|
| `#/submit` | Submit a card to the global pool |
| `#/admin` | Admin dashboard |

## Routing implementation note

Hash routing is temporary and practical for the static prototype. Phase 2 supports dynamic card ids and query values, but route files should still stay thin. If this becomes a larger app with deeper navigation and server-side concerns, route ownership should be revisited before backend coupling.
