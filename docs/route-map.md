# Route Map

## Active Phase 1 routes

| Route | File | Purpose |
|---|---|---|
| `#/home` | `src/routes/Home.js` | Player dashboard and quick actions |
| `#/pull` | `src/routes/Pull.js` | Gacha entry point and ticket CTA |
| `#/vault` | `src/routes/Vault.js` | Owned card collection |
| `#/library` | `src/routes/Library.js` | Global card pool preview |

## Planned Phase 2 routes

| Route | Purpose |
|---|---|
| `#/pull/confirm` | Confirm ticket spend before pull |
| `#/pull/results` | Show cards received from a pull |
| `#/vault/card/:id` | Owned card detail |
| `#/library/card/:id` | Global card template detail |
| `#/shop` | Ticket and currency shop |

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

Hash routing is temporary and practical for the static prototype. If this becomes a larger app with deeper navigation and server-side concerns, route ownership should be revisited before backend coupling.
