# Phase 1 Verification Checklist

Use this checklist after each Phase 1 patch.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Route checks

- `#/home` renders the dashboard
- `#/pull` renders the pull screen
- `#/vault` renders owned cards
- `#/library` renders the global card pool
- Unknown hashes fall back to `#/home`

## UI checks

- Bottom navigation highlights the active route
- Top resource bar displays tickets and gold
- Card grid is usable on mobile width
- Card rarity frames display distinct visual treatments
- Primary CTA is gold and visually dominant

## Architecture checks

- No route file defines a custom card renderer
- Shared app chrome remains in `components`
- Design values remain in `styles/tokens.css`
- README and docs are updated when scope changes
