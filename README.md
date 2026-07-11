# Imago Core

Imago Core is a premium character-collection digital collectible card game. Human identity is forged into collectible artifacts: the person is the treasure, the card is the artifact, and the Core preserves identity across every variant.

> Every card. Every story. One Core.

## Current release

`main` is the canonical release branch after the Imago Core promotion. The historical repository slug remains `commune-tcg`; it is not the product name. `Gacha` is retained temporarily as a verification reference, and `Old-main-TCG-save` preserves the previous application.

The current game includes:

- Seven player identities with persistent PIN-based sessions
- Single and five-card pulls with weighted types, rarity odds, tickets, Gold, and daily state
- A live Library and per-player Vault with duplicate handling
- Canonical rarity frames and a unified card renderer
- Ordered three-card squads and a server-authoritative 3-on-3 PvE battle loop
- Stored battle playback, pause, inspection, speed, reduced motion, retreat, results, XP, and rewards
- Player card submissions and administrator review, card editing, mechanics, and diagnostic tools

## Technology

- Vite single-page application with hash routing
- Vanilla JavaScript and CSS
- Cloudflare Worker and static assets
- Cloudflare D1 for application data
- Cloudflare R2 through the `CARD_IMAGES` binding
- Node's built-in test runner

## Local setup

Requirements:

- Node.js 20 or newer
- npm
- Cloudflare bindings for live D1/R2 behavior

```bash
npm ci
npm run dev
```

Vite serves the front end locally. Backend behavior that depends on D1, R2, or Worker bindings requires an appropriate Wrangler environment.

## Commands

```bash
npm run dev
npm run build
npm test
npm run battle:simulate -- --iterations=1000
npm run preview
npm run deploy
```

There is currently no dedicated lint command. The release gate is syntax/build validation plus the automated test suite. Do not add a repository-wide formatting rewrite as incidental feature work.

## Environment and bindings

`wrangler.toml` intentionally retains the historical Cloudflare Worker identifier `commune-tcg-gacha` so branch promotion does not create a second deployment or disconnect existing resources.

Expected bindings:

- `DB`: Cloudflare D1 database
- `CARD_IMAGES`: Cloudflare R2 bucket for card art
- `ASSETS`: generated Worker asset binding
- `ADMIN_USER_IDS`: optional comma-separated player slot IDs allowed to use admin APIs; defaults to `sterling`

Never commit live secrets or production binding credentials.

## Architecture guardrails

- `src/components/CardFrame.js` is the canonical card renderer.
- `src/styles/tokens.css` is the canonical front-end brand and presentation palette.
- `functions/_shared/type-config.js` is the authoritative server type model and weighted type utility.
- `shared/battle/battle-engine.js` is the only combat resolver.
- The browser replays stored battle events and never chooses reward-bearing seeds or outcomes.
- Internal `pow` remains the compatibility field for player-facing ATK.
- Existing `commune-*` storage keys, Cloudflare IDs, and asset filenames are compatibility identifiers, not active branding.

## Documentation

- [Developer guide](docs/developer-guide.md)
- [Current architecture](docs/architecture.md)
- [Route map](docs/route-map.md)
- [Game design](docs/game-design.md)
- [Battle design](docs/battle-design.md)
- [Brand system](docs/brand.md)
- [Asset inventory](docs/assets.md)
- [Technical debt](docs/technical-debt.md)
- [Historical documentation index](docs/historical-index.md)
- [Imago Core beta release notes](docs/releases/imago-core-beta.md)
- [Changelog](CHANGELOG.md)

## Historical terminology

The project was developed under the names Commune TCG and the `Gacha` branch. Historical phase reports and handoffs retain those names when needed to describe the state that existed at the time. Current product surfaces and active documentation use **Imago Core**, abbreviated **IC**, and describe it as a digital CCG.
