# Runtime Patch Map

Current inventory-only map of the Commune TCG browser patch load order. This file documents the current runtime surface and does not define a new architecture.

## Direct scripts loaded by index.html

1. `app.js`
2. `character-color-sync.js`
3. `ux-refresh-guard.js`
4. `crop-touch.js`
5. `title-limit.js`
6. `battle-end.js`
7. `mint-upload-enhance.js`
8. `mint-flavor.js`
9. `mint-success-redirect.js`
10. `ai-battle-squad.js`
11. `mobile-collection-fix.js`
12. `vaults.js`
13. `card-polish-fix.js`
14. `card-face-redesign.js`
15. `card-title-stability.js`
16. `card-badge-compact.js`
17. `no-sidebar-pages.js`
18. `ascension-failsafe.js`
19. `home-page.js`
20. `home-data.js`
21. `home-tuning.js`
22. `no-mobile-home.js`
23. `battle-color-clarity.js`

## Dynamic scripts injected by mobile-collection-fix.js

`mobile-collection-fix.js` injects these scripts at runtime:

- `ai-enemy-type.js`
- `market-sparklines.js`
- `market-smooth-refresh.js`
- `battle-history.js`
- `card-xp.js`
- `ascension-ceremony.js`
- `ascension-mobile-click-fix.js`
- `ascension-failsafe.js`
- `battle-rules.js`
- `battle-flow.js`
- `battle-setup-fix.js`
- `battle-results-polish.js`
- `battle-fullscreen.js`
- `battle-speed.js`
- `battle-ko-fix.js`
- `battle-no-flavor.js`

## Removed dormant legacy patches

These files were removed from the build allowlist and deleted from the repository:

- `battle-team-fix.js`
- `card-title-fit-final.js`

## Current winning files for high-risk globals

This records the current outermost or last runtime owner visible from the load map. Wrapped functions may still call earlier implementations internally.

- `render`: `no-mobile-home.js`
- `bind`: `battle-fullscreen.js` after the battle dynamic patch chain loads
- `cardHtml`: `card-title-stability.js` in the direct script chain; `card-xp.js` also wraps `cardHtml` dynamically, so this is a timing-sensitive chain
- `battle`: `battle-flow.js`
- `mintCard`: `mint-success-redirect.js` as the single mint patch owner; `mint-flavor.js` no longer overrides `mintCard`

## Ascension ownership

- `card-xp.js`: owns XP calculation, XP badge rendering, and rendering `[data-ascend-card]` buttons; it no longer defines or binds `ascendCard`.
- `ascension-ceremony.js`: owns the main `ascendCard` flow, the server ascend call for normal card-button activation, and `ascShowCeremony`.
- `ascension-mobile-click-fix.js`: owns mobile/touch hit handling and calls the main `ascendCard` function.
- `ascension-failsafe.js`: owns the backup bottom bar and fallback confirmation sheet; it no longer binds real card buttons directly.
