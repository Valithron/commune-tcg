# Commune TCG

A private character-based trading card game prototype.

## Current build

Cloudflare-backed frontend. Game state is persisted to D1 through Pages Functions, and uploaded card images are stored in R2. The browser still keeps a local `localStorage` copy as a fast cache/fallback, but D1/R2 are now the durable source of truth on the deployed site.

No accounts, no real money, no blockchain.

## Cloudflare Pages settings

Use these settings:

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

The build script copies the static app files into `dist/` for Cloudflare Pages.

## Required Cloudflare bindings

The Pages project needs these bindings:

- D1 database binding: `DB`
- R2 bucket binding: `CARD_IMAGES`

The app currently uses:

- `GET /api/state` to load game state from D1
- `POST /api/state` to save game state to D1
- `POST /api/upload` to save uploaded card art to R2
- `GET /api/image/:key` to serve saved card art from R2

## Local development

Open `index.html` in a browser, or run a simple static server:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

To test the Cloudflare-style build locally:

```bash
npm run build
```

The D1/R2 APIs only work on Cloudflare unless you add a local Wrangler setup.

## Current features

- Collection page grouped by character and rarity
- Mint Card page with image upload, character selection, rarity preview, stat rolling, image crop controls, and minting
- Uploaded card images saved to R2
- Game state saved to D1
- Equip up to 3 passive cards per character
- Passive token generation
- Simple battle arena
- Fake token market
- Token vault dashboard
