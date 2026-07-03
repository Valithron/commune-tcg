# Phase 2 Verification Checklist

Use this checklist after Phase 2 patches.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Route checks

- `#/pull/confirm?count=1` renders a 1-pull confirmation
- `#/pull/confirm?count=5` renders a 5-pull confirmation
- `#/pull/results?count=1` renders one mock result card
- `#/pull/results?count=5` renders five mock result cards
- `#/vault/card/forgefather-sterling` renders owned Vault detail
- `#/vault/card/cooper-arcane-aide` renders not-owned fallback
- `#/library/card/cooper-arcane-aide` renders Library detail
- `#/shop` renders static ticket offers
- Unknown hashes fall back to `#/home`

## UI checks

- Pull and Shop routes keep Pull nav highlighted
- Vault detail keeps Vault nav highlighted
- Library detail keeps Library nav highlighted
- Tappable cards retain the canonical `tcg-card` styling
- Detail screens use `CardDetailPanel`, not custom card markup

## Architecture checks

- `CardFrame.js` remains the only card-face renderer
- Pull results use `CardFrame.js`
- Vault and Library detail screens share `CardDetailPanel.js`
- README and route docs mention all active Phase 2 routes
- No backend binding is used yet
