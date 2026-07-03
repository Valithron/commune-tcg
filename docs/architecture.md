# Architecture Notes

## Goal

The Gacha branch should remain legible as it grows. Phase 1 avoids the previous app's patch-stack pattern by separating data, routes, components, and design tokens from the beginning.

## Front-end model

The app is currently a static single-page app with hash routing. This keeps Cloudflare Pages deployment simple and allows route work without backend coupling.

```text
index.html -> src/main.js -> route renderer -> reusable components
```

## Routing rule

Route files own screen composition only. They should not become long-term homes for shared UI behavior.

Good:

```text
routes/Vault.js uses CardFrame.js
```

Bad:

```text
routes/Vault.js defines a second card renderer
```

## Card rendering rule

`src/components/CardFrame.js` is the canonical card renderer.

Any future card display should use that component or deliberately extend it. Do not create separate card markup for Vault, Library, Pull Results, Squad Builder, and Battle unless a documented exception exists.

## Styling rule

Design primitives belong in this order:

1. `tokens.css` for colors, typography, spacing, z-index, and rarity values
2. `base.css` for document and layout defaults
3. `components.css` for reusable app UI
4. `cards.css` for card-specific rendering

## Data rule

Phase 1 uses mock data from `src/data`. Real backend contracts should be documented before implementation.

Expected future backend domains:

- Account/session
- Global card pool
- User vault
- Pull odds and pull history
- Currency and tickets
- Battle squad and encounters
- Admin card management
- Card submission pipeline

## Comment block standard

Meaningful files should start with a short ownership block explaining:

- Purpose
- Current phase responsibility
- What should not be added there

This is meant to prevent silent drift and patch sprawl.
