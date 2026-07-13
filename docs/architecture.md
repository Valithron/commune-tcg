# Imago Core Architecture

This document maps the current release. It describes what exists now, not an aspirational rewrite.

## Runtime topology

```text
Browser
  -> index.html
  -> src/main.js hash router
  -> player, battle, or admin shell
  -> route renderer and shared components
  -> /api/*
  -> worker.js route dispatcher
  -> functions/api/* handlers
  -> functions/_shared/* adapters and services
  -> D1 and R2 bindings
```

Vite builds the browser bundle into `dist/`. Wrangler deploys `worker.js` and binds `dist/` as `ASSETS`. The Worker sends `/api/*` requests to the matching handler and sends all other requests to the single-page application asset binding.

## Entry points

| Entry | Responsibility |
|---|---|
| `index.html` | Metadata, fonts, PWA manifest, and browser bootstrap |
| `src/main.js` | Hash parsing, authentication gate, route selection, shell selection, route initialization, and scroll reset |
| `worker.js` | Worker API dispatch and static asset service |
| `scripts/battle-simulate.js` | Offline seeded balance simulation |

## Front-end ownership

| Area | Source of truth | Readers and writers |
|---|---|---|
| Authentication | `src/services/authClient.js` and `/api/auth/*` | `src/main.js`, sign-in, top bar; server writes session tables |
| Routes | `routeDefinitions` in `src/main.js` | Hash changes read; routes write only through hash navigation |
| Library | `src/data/libraryData.js` | Library and Library detail; cache invalidated by explicit reload |
| Vault | `src/data/vaultData.js` | Home, Vault, detail, pull completion; pull clears cache |
| Pull reveal queue | `src/services/pullRevealStore.js` | Pull confirmation writes session storage; reveal/results read and clear |
| Squad | D1 through `/api/battle-squad` | Squad builder reads and writes ordered owned-card IDs |
| Battle attempt | D1 `battle_attempts` | server creates/finalizes; arena reads stored event log only |
| Battle playback | module state in `BattleArena.js` and `battlePlayback.js` | arena controls speed, pause, checkpoint, and completion |
| Rewards | D1 authoritative settlement | finalize endpoint writes once; results and top bar read |
| Admin card state | D1/R2 and module-local editor cache | administrator-only API and routes |
| Persistent preferences | browser local/session storage | battle motion/sound/checkpoints and card-frame tuner |
| Operational telemetry | D1 telemetry tables | non-blocking browser events; administrator-only export/deletion |

Compatibility storage keys beginning `commune-` remain intentionally unchanged so existing browsers do not lose in-progress state or settings.

## Routing and shells

`src/main.js` owns the canonical route table. See `docs/route-map.md` for the complete list.

- Player routes use `AppShell`, `TopBar`, and `BottomNav`.
- The arena uses a dedicated battle-only shell so collection and navigation UI cannot interrupt playback.
- Admin and diagnostic routes use `AdminShell` and require `user.isAdmin`.
- Admin APIs independently enforce `ADMIN_USER_IDS`; hiding UI is not treated as authorization.

Route modules compose screens. Shared behavior belongs in components, data modules, or services.

## Authentication and authorization

`functions/_shared/auth.js` owns player slots, salted PIN hashing, sessions, cookies, and the admin allowlist.

1. `/api/auth/users` exposes setup status for the seven known slots.
2. Setup or login verifies the PIN and writes a 30-day HttpOnly, Secure, SameSite=Lax session cookie.
3. `/api/auth/me` returns the active user plus `isAdmin`.
4. `src/main.js` blocks unsigned users from application routes and non-admin users from admin routes.
5. Every `/api/admin/*` handler independently calls `getAdminSessionUser`.

`resolveCurrentUser` still contains Cloudflare Access and temporary-user fallbacks for older APIs. That compatibility path is documented debt; ownership-sensitive code should prefer a real player session.

## Card and collection flow

```text
D1 cards + R2 image keys
  -> functions/api/cards.js
  -> src/data/libraryData.js
  -> Library and CardDetailPanel
  -> CardFrame

D1 owned cards + template payload
  -> functions/api/vault.js
  -> duplicate normalization in vaultData.js
  -> Vault, Home highlight, squad inventory
  -> CardFrame
```

`src/components/CardFrame.js` is the only canonical player card renderer. Rarity frame PNGs are Vite imports. Type and identity presentation uses variables from `src/styles/tokens.css`.

## Pull and economy flow

```text
Ticket shop or daily claim
  -> /api/pull-top-up
  -> user resource row and pull history

Pull confirmation
  -> /api/pulls
  -> pull engine selects template, rarity, and weighted type
  -> owned card and history writes
  -> session-storage reveal payload
  -> reveal UI
  -> Vault cache invalidation
```

`functions/_shared/pull-config.js`, `pull-engine.js`, and `pull-pool-store.js` own pull behavior. Mountain Time daily boundaries and idempotent resource writes belong on the server.

## Battle flow

```text
owned cards + ordered saved squad + encounter registry
  -> backend card adapter
  -> pure seeded engine
  -> complete pending attempt and Energy debit
  -> stored event-log playback in browser
  -> exactly-once finalize or surrender
  -> Gold, XP, levels, and battle history
```

The pure rules live in `shared/battle/`. `shared/battle/battle-engine.js` performs no I/O and is reused by tests, forecasts, simulations, and backend attempt creation. Browser playback never recalculates damage or rewards.

## Submission and admin flow

Player submissions write validated rows and art references. Administrator routes read the queue, edit creator/type probabilities, approve or reject submissions, and manage Library cards. Approval writes canonical template data and keeps weighted type odds used during pulls.

All admin API reads and mutations require an authenticated admin session. `ADMIN_USER_IDS` defaults to `sterling` and can be expanded with a comma-separated environment value.

## CSS and brand organization

CSS loads in an intentional sequence from `src/main.js`:

1. tokens and base
2. shared components and account/auth controls
3. card foundation and density/context variants
4. battle presentation
5. crop and submission tools

`src/styles/tokens.css` owns the master palette, rarity colors, type colors, identity colors, typefaces, radii, and spacing. Component styles consume tokens. Card frame geometry and overlay PNG behavior are documented in the card-frame documents.

## Assets

- Card art is normally loaded from R2 through `/api/card-image?key=...`.
- Five rarity frames are bundled under `src/assets/card-frames/`.
- The historical filenames `commune-card-back.png` and `commune-pull-orb.svg` remain because they are stable public URLs; their accessible labels use Imago Core.
- Fonts are fetched from Google Fonts at runtime.

See `docs/assets.md` for the complete tracked inventory and classification.

## Data and migrations

The repository contains `migrations/001_battle_attempts.sql`. Several other tables are created defensively by runtime helpers because the application grew incrementally. Production data must never be reset or reseeded as part of branch promotion.

Internal `pow` is the stored offensive stat. UI labels it ATK. Do not perform a destructive column rename without a dedicated migration and compatibility window.

## Error handling and logging

API helpers return JSON with `cache-control: no-store`. User-facing routes catch transport errors and either show an actionable state or use documented mock fallbacks. Empty catches remain only for best-effort cleanup such as logout cookie deletion. The offline simulation script intentionally logs its output path and summary.

Telemetry is a separate failure domain. The browser does not await collection before completing gameplay, and telemetry writes do not share economy or settlement batches. Raw events retain authenticated player slot ID for 30 days; daily aggregates omit player identity and retain for 180 days.

## Deployment

`npm run build` creates `dist/`. `npm run deploy` runs the build and `wrangler deploy`. The Worker project ID remains `commune-tcg-gacha` for infrastructure continuity, while the deployed product is Imago Core. Branch promotion changes source control authority; it does not modify D1 or R2 data.

## Recommended future architecture

The current structure is workable and should not be rewritten during release hardening. Future extraction should proceed in this order:

1. `shared/config`: unify duplicated type colors and rules across Worker, browser, and battle code.
2. `auth/` and `admin/`: remove compatibility user fallbacks and centralize policy.
3. `cards/` and `card-rendering/`: separate normalization contracts from presentation without duplicating markup.
4. `pull/`, `economy/`, and `rewards/`: formalize resource transaction interfaces and daily-clock tests.
5. `battle/`: retain the pure engine boundary while splitting route composition from playback controllers.
6. `state/` and `routing/`: replace scattered module state only after contracts and regression coverage exist.

The detailed module map and risks are in `docs/developer-guide.md` and `docs/technical-debt.md`.
