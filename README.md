# Commune TCG Gacha Prototype

Phase 3 expands the clean mobile-first foundation for the gacha version of Commune TCG.

## Current status

- Branch: `Gacha`
- Phase: `3 - static battle loop`
- Data source: local mock data only
- Backend: not connected yet
- Deployment target: Cloudflare Pages-compatible static app

## Completed scope

Phase 1 established the Vite static app shell, bottom navigation, design tokens, reusable card component, and starter Home, Pull, Vault, and Library routes.

Phase 2 added pull confirmation, pull results, Vault card detail, Library card detail, Ticket Shop, route params, query-string parsing, and shared detail panels.

Phase 3 adds:

- Battle hub route
- Encounter selection route
- Squad builder route
- Battle results route
- Mock encounter and battle outcome data
- Scoped battle CSS
- Battle tab in bottom navigation
- Documentation for the static battle loop

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
#/shop
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
src/
  main.js                 App bootstrap, hash router, route params, query parsing
  components/             Reusable UI pieces
  data/                   Mock data for current static flows
  routes/                 Screen-level route renderers
  styles/                 Design tokens, base CSS, components, cards, battle
docs/
  architecture.md
  cloudflare-bindings.md
  design-intake.md
  phase-1-verification.md
  phase-2-flow.md
  phase-2-verification.md
  phase-3-flow.md
  phase-3-verification.md
  route-map.md
```

## Build discipline

1. Keep route files thin. Put shared UI in components.
2. Keep card rendering centralized in `src/components/CardFrame.js`.
3. Keep design values in `src/styles/tokens.css`.
4. Update README and docs when behavior, routes, architecture, or phase scope changes.
5. Prefer mock data until the front-end flow stabilizes.
6. Extract reusable patterns from Stitch instead of pasting full mockup pages.

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

## Next phase

Phase 4 will cover Submit Card, Admin dashboard, and backend contract drafting.
