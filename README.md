# Commune TCG Gacha Prototype

Phase 6 adds a read-only Cloudflare resource inventory layer for the gacha version of Commune TCG.

## Current status

- Branch: `Gacha`
- Phase: `6 - Cloudflare resource inventory`
- Data source: local mock data for gameplay screens
- Backend: read-only diagnostic and inventory endpoints added, real game writes not connected yet
- Deployment target: Cloudflare Pages-compatible app with Pages Functions

## Completed scope

Phase 1 established the Vite static app shell, bottom navigation, design tokens, reusable card component, and starter Home, Pull, Vault, and Library routes.

Phase 2 added pull confirmation, pull results, Vault card detail, Library card detail, Ticket Shop, route params, query-string parsing, and shared detail panels.

Phase 3 added Battle hub, Encounter selection, Squad builder, Battle results, mock encounter data, and scoped battle styles.

Phase 4 added Submit Card, Admin Dashboard, mock admin data, and backend contract docs.

Phase 5 added Cloudflare Pages Function diagnostics for health, D1 table list, and R2 object sample.

Phase 6 adds:

- `/api/schema-details` read-only D1 table column/index inventory endpoint
- `/api/images-summary` read-only R2 key-pattern summary endpoint
- Resource Inventory route
- Backend Status link to Resource Inventory
- Cloudflare resource inventory document
- Phase 6 flow and verification docs

## Active routes

```text
#/home
#/pull
#/pull/confirm?count=1
#/pull/confirm?count=5
#/pull/results?count=1
#/pull/results?count=5
#/battle
#/battle/encounters
#/battle/squad?encounter=training-yard-goblin
#/battle/results?encounter=training-yard-goblin
#/vault
#/vault/card/:cardId
#/library
#/library/card/:cardId
#/submit
#/admin
#/backend
#/inventory
#/shop
```

## Active API diagnostics and inventory endpoints

```text
/api/health
/api/schema
/api/schema-details
/api/images
/api/images-summary
```

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project structure

```text
functions/
  _shared/                Shared Pages Function helpers
  api/                    Read-only diagnostic and inventory endpoints
src/
  main.js                 App bootstrap, hash router, route params, query parsing
  components/             Reusable UI pieces
  data/                   Mock data for current static flows
  routes/                 Screen-level route renderers
  services/               Front-end API helper shell
  styles/                 Design tokens, base CSS, components, cards, battle, phase4
docs/
  architecture.md
  backend-contracts.md
  cloudflare-bindings.md
  cloudflare-resource-inventory.md
  design-intake.md
  phase-1-verification.md
  phase-2-flow.md
  phase-2-verification.md
  phase-3-flow.md
  phase-3-verification.md
  phase-4-flow.md
  phase-4-verification.md
  phase-5-flow.md
  phase-5-verification.md
  phase-6-flow.md
  phase-6-verification.md
  route-map.md
```

## Build discipline

1. Keep route files thin. Put shared UI in components.
2. Keep card rendering centralized in `src/components/CardFrame.js`.
3. Keep design values in `src/styles/tokens.css`.
4. Update README and docs when behavior, routes, architecture, or phase scope changes.
5. Prefer mock data until the front-end flow stabilizes.
6. Extract reusable patterns from Stitch instead of pasting full mockup pages.
7. Do not connect D1/R2 writes until backend contracts and permissions are explicit.
8. Keep diagnostic and inventory API endpoints read-only until schema mapping is complete.

## Canonical language

| Concept | Label |
|---|---|
| Gacha action | Pull |
| User-owned cards | Vault |
| Global card pool | Library |
| Battle team | Squad |
| Gacha currency | Pull Tickets |
| Soft currency | Gold |
| Card creation flow | Submit Card |
| Staff tools | Admin |

## Backend note

Cloudflare bindings are documented and now exposed through safe diagnostic and inventory endpoints:

```text
env.DB
env.CARD_IMAGES
```

Before Phase 7, paste deployed endpoint findings into `docs/cloudflare-resource-inventory.md` and reconcile them with `docs/backend-contracts.md`.
