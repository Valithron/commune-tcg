# Commune TCG

A private character-based trading card game prototype.

## Current build

Static frontend only. No backend, no accounts, no real money, no blockchain. Cards, tokens, upload previews, minting rolls, equipment state, market prices, and battle results are stored locally in the browser with `localStorage`.

## Cloudflare Pages settings

Use these settings:

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

The build script copies the static app files into `dist/` for Cloudflare Pages.

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

## Current features

- Collection page grouped by character and rarity
- Mint Card page with image upload, character selection, rarity preview, stat rolling, and minting
- Equip up to 3 passive cards per character
- Passive token generation
- Simple battle arena
- Fake token market
- Token vault dashboard
