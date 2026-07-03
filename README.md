# Commune TCG Gacha Prototype

Phase 1 creates a clean mobile-first foundation for the gacha version of Commune TCG. This branch intentionally starts from an empty tree so the new app can grow without inheriting the old patch-stack structure.

## Current status

- Branch: `Gacha`
- Phase: `1 - static mobile shell`
- Data source: local mock data only
- Backend: not connected yet
- Deployment target: Cloudflare Pages-compatible static app

## Phase 1 scope

This phase implements the minimum clean foundation:

- A Vite-powered static single-page app
- Mobile-first app shell
- Bottom navigation
- Shared design tokens from the Stitch design intake
- Reusable card component
- Four starter routes:
  - `#/home`
  - `#/pull`
  - `#/vault`
  - `#/library`
- Documentation for architecture, route ownership, and Stitch source mapping

Phase 1 deliberately does **not** implement real accounts, real pulls, database state, card submissions, battle simulation, or admin tools. Those belong in later phases after the visual and component foundation is stable.

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
  main.js                 App bootstrap and hash router
  components/             Reusable UI pieces
  data/                   Mock data for Phase 1
  routes/                 Screen-level route renderers
  styles/                 Design tokens, base CSS, components, cards
docs/
  architecture.md         Front-end architecture rules
  design-intake.md        Stitch ZIP interpretation and canonical design choices
  route-map.md            Route ownership and future route plan
  phase-1-verification.md Manual verification checklist
```

## Build discipline

Every meaningful patch should preserve these rules:

1. Keep route files thin. Put shared UI in components.
2. Keep card rendering centralized in `src/components/CardFrame.js`.
3. Keep colors, spacing, typography, and rarity values in `src/styles/tokens.css`.
4. Update README and docs when behavior, routes, architecture, or phase scope changes.
5. Prefer mock data until the front-end flow stabilizes.
6. Do not paste Stitch pages directly into production code. Extract reusable patterns.

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

## Next phases

### Phase 2

- Pull confirmation screen
- Pull results screen
- Vault card detail screen
- Library card detail screen
- Ticket shop screen

### Phase 3

- Battle hub
- Encounter selection
- Squad builder
- Battle results

### Phase 4

- Submit card flow
- Admin dashboard
- Real data contracts drafted before backend implementation

## Notes

The Stitch files are design references, not production code. They contain repeated HTML, repeated Tailwind configuration, placeholder links, mock click handlers, and externally hosted images. This repo extracts their visual direction into maintainable vanilla JavaScript and CSS modules.
