# Commune TCG

A private character-based trading card game prototype.

## Current build

Static frontend only. No backend, no accounts, no real money, no blockchain. Cards, tokens, upload previews, minting rolls, equipment state, market prices, and battle results are stored locally in the browser with `localStorage`.

## Cloudflare Pages settings

Use these settings:

- Framework preset: None
- Build command: leave blank
- Build output directory: `/`
- Root directory: leave blank

Because this is a plain static app, Cloudflare can serve it directly from the repository.

## Local development

Open `index.html` in a browser, or run a simple static server:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Current features

- Collection page grouped by character and rarity
- Mint Card page with image upload, character selection, rarity preview, stat rolling, and minting
- Equip up to 3 passive cards per character
- Passive token generation
- Simple battle arena
- Fake token market
- Token vault dashboard
