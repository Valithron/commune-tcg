# Commune TCG

A private character-based trading card game prototype.

## Current build

Cloudflare-backed frontend with a seven-account vault gate. Each Commune member has a fixed account and creates a 4-digit Vault PIN the first time they enter.

Player vaults are now separated server-side. Commune Cash, token balances, cards, equipped cards, draft state, and battle log are scoped to the signed-in account. Uploaded card images are stored in R2. The browser still keeps a per-user `localStorage` cache/fallback, but D1/R2 are the deployed source of truth.

No real money, no blockchain.

## Cloudflare Pages settings

Use these settings:

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

The build script copies the static app files into `dist/` for Cloudflare Pages and applies the build-time UI patches.

## Required Cloudflare bindings

The Pages project needs these bindings:

- D1 database binding: `DB`
- R2 bucket binding: `CARD_IMAGES`

The app currently uses:

- `GET /api/auth/users` to show the seven fixed accounts
- `POST /api/auth/setup-pin` to create a first-time 4-digit PIN
- `POST /api/auth/login` to enter an existing vault
- `POST /api/auth/logout` to switch vaults
- `GET /api/auth/me` to restore an active session
- `GET /api/state` to load the signed-in user's vault from D1
- `POST /api/state` to save the signed-in user's vault to D1
- `POST /api/upload` to save uploaded card art to R2
- `GET /api/image/:key` to serve saved card art from R2

## Data model status

Step 1 is deployed:

- Seven fixed users: Cydney, Sterling, Ryan, Gabi, Cooper, Kenly, Ashley
- First-time 4-digit PIN setup
- Session cookie after entry
- Per-user wallets
- Per-user token balances
- Per-user owned cards
- Shared market price table

Step 2 still needs to move individual game actions fully server-side. Right now, the frontend still performs the prototype game logic, then saves the signed-in user's result back to D1.

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

- Vault selection screen with first-time 4-digit PIN setup
- Collection page grouped by character and rarity
- Mint Card page with image upload, character selection, rarity preview, stat rolling, image crop controls, and minting
- Uploaded card images saved to R2
- Signed-in user state saved to D1
- Equip up to 3 passive cards per character
- Passive token generation
- Simple battle arena
- Shared fake token market prices
- Token vault dashboard
