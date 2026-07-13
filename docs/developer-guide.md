# Imago Core Developer Guide

Read this document first for implementation work. Then read the domain design document relevant to the change.

## Repository orientation

- Product: **Imago Core**, a character-collection digital CCG.
- Repository: `Valithron/commune-tcg`; the slug is historical.
- Canonical branch: `main` after the Imago Core promotion.
- Preservation branch: `Old-main-TCG-save`.
- Temporary verification reference: `Gacha`.
- Branch new work from `main` using `feature/`, `fix/`, `chore/`, `docs/`, or `refactor/` prefixes.

## Folder layout

```text
src/components/       shared browser rendering
src/routes/           screen composition and initialization
src/services/         browser transport, playback, and transient stores
src/data/             caches, normalization, and mock fallbacks
src/styles/           tokens, components, cards, routes, and battle CSS
shared/battle/        pure battle rules and simulation
functions/api/        Worker-compatible API handlers
functions/_shared/    D1/R2 adapters and backend domain services
migrations/           versioned D1 migrations
public/               stable public assets and PWA manifest
tests/                Node contract and engine tests
docs/                 current design plus historical phase records
```

## Setup and commands

```bash
npm ci
npm run dev
npm run build
npm test
npm run battle:simulate -- --iterations=1000
npm run preview
```

Use Node 20 or newer. Live API behavior requires the `DB` and `CARD_IMAGES` Cloudflare bindings. `ADMIN_USER_IDS` optionally configures a comma-separated admin slot allowlist and defaults to `sterling`.

`RELEASE_COMMIT` and `DEPLOYMENT_ENVIRONMENT` are optional non-secret deployment variables used only to label telemetry. When absent, the server stores `unknown`; gameplay remains unaffected.

There is no lint command today. Build and tests are the automated gate. Run `git diff --check` for whitespace errors.

## Route and data overview

`src/main.js` owns route definitions, authentication, shell policy, and initializer dispatch. `docs/route-map.md` lists browser and API routes.

```text
route -> browser service/data module -> /api endpoint -> backend shared service -> D1/R2
```

Do not fetch D1/R2 directly from browser code. Do not add a second card renderer or battle resolver.

## State ownership

| State | Authority | Cache or persistence | Invalidation |
|---|---|---|---|
| Current user | D1 auth session | `authClient` module cache and secure cookie | sign-out or forced `/api/auth/me` |
| Player resources | D1 | no-store API reads | top-bar refresh after transactions |
| Library | D1 cards | `libraryData` module cache | force reload after admin template changes |
| Vault | D1 owned cards | owner-scoped `vaultData` cache | pull completion or explicit clear |
| Pull reveal | resolved server payload | session storage | reveal completion or new pull |
| Squad | D1 ordered IDs | route query plus server row | save formation |
| Battle attempt | D1 full attempt | session checkpoint only for playback position | finalize or surrender |
| Battle preferences | browser | local storage | player toggle |
| Admin table | D1/R2 | route module cache | successful mutation or rerender |

Known race risks include stale top-bar resources after a rejected transaction, parallel pull attempts, route rerenders during pending requests, and browser module caches surviving user changes. Server-side idempotency is required for all resource writes.

## Authentication

Player auth uses one of seven known slot IDs, a 4-digit PIN hashed with a random salt, and a 30-day secure session. `/api/auth/me` is the browser authority. Never trust `ownerUserId` supplied by the client when an authenticated session is available.

Admin policy is enforced twice:

- `src/main.js` blocks admin shells for users without `isAdmin`.
- `/api/admin/*` calls `getAdminSessionUser` before every read or mutation.

Add administrator roles through environment configuration for now. A D1 role and audit model is the recommended follow-up.

## Cards and rendering

`CardFrame.js` accepts normalized or compatibility-shaped card objects and resolves:

- rarity and rarity frame
- character identity and initials
- weighted selected type
- R2 or absolute image URL
- crop position and zoom
- ATK/DEF/SPD
- level/ownership presentation

Presentation tokens are in `tokens.css`. Server type behavior is in `functions/_shared/type-config.js`. Battle colors are also present in `shared/battle/battle-config.js`; keep these synchronized until a shared environment-neutral configuration is extracted.

### Add a card

1. Prefer the player submission and admin approval flow for real content.
2. Set a stable card/template ID and one of the seven character IDs.
3. Store art in R2 and retain the object key.
4. Provide rarity, base stats, crop, creator identity, and approved type odds.
5. Confirm it renders in Card Lab, Library, Vault, pull reveal, squad, and battle contexts.
6. Test duplicate grouping and image resolution.

Do not hand-edit an owned card as a substitute for changing a Library template.

### Change a rarity

Update only with an explicit economy/design decision. Synchronize:

- `tokens.css` rarity token
- canonical frame asset/import
- pull odds or admin mechanics if distribution changes
- normalizers and allowed-rarity sets
- tests and design documents

Never change rarity colors to character or type colors.

### Change a type

Update and test:

- `functions/_shared/type-config.js`
- `src/components/CardFrame.js`
- `src/styles/tokens.css` and type controls
- `shared/battle/battle-config.js`
- `src/services/typeMatchups.js` if the matchup contract changes
- submission/admin options and tests

Type changes can alter rolled stats and combat. Treat them as gameplay changes, not a cosmetic edit.

## Pull and economy

The pull endpoint owns ticket deduction, template selection, weighted type selection, owned-card creation, and history. The browser receives completed results for presentation. Daily claim and Gold exchanges belong to `/api/pull-top-up` and must use the intended Mountain Time calendar boundary.

When changing pulls or economy:

1. Test insufficient resources and correct-user debit.
2. Test one and five results with exactly-once history.
3. Test parallel/repeated request behavior.
4. Test daily claim immediately before and after Mountain Time midnight.
5. Verify reveal storage, pull again, Vault invalidation, and top-bar refresh.

Phase 2A player guidance reads the existing resource contract without changing it. Home recommends actions in this order: claim the available daily Ticket, make a pull when at least one Ticket exists, open the Ticket Shop when at least 1,000 Gold exists, start Battle when Energy exists, then review the Vault. Pull and Ticket Shop disable actions that the latest authenticated resource read proves cannot succeed. The server remains authoritative and still validates every transaction.

## Vault and Library

Library contains global templates. Vault contains owned instances. Duplicate grouping must use stable template identity before name/image fingerprints. Filters in Library and Vault intentionally share initialization through `initLibraryControls`.

Prefer these names in new code:

- `libraryTemplates` for global definitions
- `ownedCards` for concrete player instances
- `vaultCards` only for UI-facing collection language

Player-facing language follows the same distinction: Library means all available designs, while Vault means the signed-in player's owned card copies. Both detail routes use the shared centered inspection dialog while preserving their existing hash URLs and ownership reads.

## Battle

The battle engine is deterministic, pure, and server-authoritative. It consumes snapshots, a versioned encounter, a seed, and ordered lanes. It emits a complete event log and final state. The browser plays those events without recalculating combat.

Safe battle constant changes require:

1. Update the versioned config or encounter.
2. Run engine/backend/playback/UI tests.
3. Run at least 1,000 batch simulations.
4. Compare lane win rates, turn counts, crits, and Double-Strikes.
5. Confirm old stored attempts remain replayable through their recorded versions.

Do not award rewards from client playback completion alone. Finalization must remain exactly once.

## Rewards and progression

`functions/_shared/battle-reward-contract.js` defines the battle reward/XP contract. Attempt finalization writes Gold and XP, calculates levels, and records history. Results present the already-settled queue. Refreshing results must not settle again.

## Admin and submissions

The admin surface includes card editing, mechanics audits/repairs, submission review, creator selection, crop tools, weighted type odds, and protected battle diagnostics. Every endpoint under `/api/admin/` requires an admin session.

When adding an admin endpoint:

1. Put it under `functions/api/admin/`.
2. Check `DB`/R2 bindings.
3. Call `getAdminSessionUser` before reading privileged data or parsing a mutation.
4. Validate and bound all input.
5. Return JSON through the shared helpers.
6. Add the route to `worker.js` and `apiClient.js` if needed.
7. Add authorization and behavior tests.

## Add a browser route

1. Create a focused renderer under `src/routes/`.
2. Add the definition to `routeDefinitions` in `src/main.js`.
3. Choose `player`, `battle`, or `admin` shell intentionally.
4. Add initializer dispatch and cleanup needs.
5. Add navigation only when the route is primary.
6. Update `docs/route-map.md` and add a UI contract test.

## Add an API endpoint

1. Create `functions/api/<domain>.js` with method exports.
2. Use backend shared services for reusable domain logic.
3. Resolve the authenticated user server-side.
4. Add the module and pathname to `worker.js`.
5. Add the client URL to `src/services/apiClient.js` when browser code needs it.
6. Return no-store JSON and useful status codes.
7. Test errors, authorization, idempotency, and data ownership.

## Assets and styling

Read `docs/brand.md` before changing presentation. Use CSS tokens rather than introducing one-off brand colors. Preserve the 2:3 card ratio, approved rarity frames, and art-dominant construction. Dynamic asset paths require extra caution during orphan cleanup.

## Logging and errors

- Show actionable player errors for failed transactions.
- Log operational server errors without PINs, cookies, full request bodies, or sensitive row dumps.
- Suppress only genuinely best-effort cleanup.
- Do not use temporary `console.log` in browser source.
- Command scripts may log their result summaries.

## Telemetry

`src/services/telemetry.js` sends non-blocking, allowlisted operational events to `/api/telemetry`. The Worker derives the player from the session and stores only the bounded envelope defined in `functions/_shared/telemetry.js`. Administrator export and player/date deletion use `/api/admin/telemetry`. Telemetry must never be awaited as a prerequisite for gameplay success or included in pull, resource, battle, or reward transaction batches.

`wrangler.toml` schedules daily telemetry aggregation and retention at 09:17 UTC. This task is independent of player requests and uses the same idempotent routine as administrator export.

## Common regressions

- Pull buttons become unclickable because an overlay retains pointer events.
- Five-pull “Pull Again” freezes because old reveal state is not cleared.
- Daily claims use UTC or browser time rather than the server's Mountain Time boundary.
- Economy writes target a fallback user instead of the active session.
- Duplicate instances collapse because grouping uses card name alone.
- Card level collides with duplicate count on small frames.
- Battle playback reports interruption during a legitimate route transition.
- Results actions point outside the player shell.
- Re-registering route listeners causes double mutations.
- Admin UI is hidden but its endpoint remains callable.

## Future modularization

Do not perform a framework migration or wholesale state rewrite as incidental work. The proposed domains are `app-shell`, `auth`, `users`, `cards`, `card-rendering`, `pull`, `economy`, `vault`, `library`, `squads`, `battle`, `rewards`, `admin`, `routing`, `state`, `api`, `shared`, `styles`, and `assets`. Current locations, boundaries, risks, and extraction order are mapped in `docs/technical-debt.md`.

## Canonical documents

- `docs/game-design.md`: product and economy design
- `docs/battle-design.md`: battle rules and player experience
- `docs/card-mechanics-contract.md`: card stat and approval contracts
- `docs/card-frame-design.md`: visual frame rules
- `docs/backend-contracts.md`: backend assumptions
- `docs/architecture.md`: current technical map
- `docs/brand.md`: canonical visual and verbal identity
- `docs/technical-debt.md`: prioritized deferred work

Phase reports and old handoffs are historical evidence. They do not override current code or the canonical documents above.
