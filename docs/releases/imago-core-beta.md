# Imago Core Beta

Release date: **July 11, 2026**

Imago Core Beta establishes the modern game as the canonical product and release baseline. The `Gacha` application becomes `main`; the former `main` application remains recoverable from `Old-main-TCG-save`.

## Release identity

Imago Core is a premium character-collection digital CCG where human identity is forged into collectible artifacts. The master brand is personal, prestigious, art-forward, and clear. It is not positioned as astrology, space fantasy, or casino gacha.

## Major features present

- Seven authenticated player slots and player-scoped collections/resources
- Single and five-card pulls, weighted types, rarity odds, tickets, Gold, daily claim state, and history
- Global Library and player Vault with filters, details, duplicates, levels, and canonical card frames
- Card submission, crop, creator, rarity, and weighted type approval workflows
- Ordered 3-on-3 squads and a server-authoritative Crossroads Patrol PvE encounter
- Deterministic battle resolution, stored event playback, pause, inspection, speed, reduced motion, retreat, results, rewards, MVP, XP, and levels
- Admin card editing, card mechanics, review, diagnostics, and card lab

## Important release changes

- Replaced active Commune TCG and Gacha product naming with Imago Core.
- Added browser, Open Graph, Twitter, package, Worker, and PWA identity metadata.
- Added canonical brand tokens for master, rarity, type, and character colors.
- Corrected the Cydney player-slot identity color.
- Added server-side authorization to every `/api/admin/*` handler and blocked non-admin browser routes.
- Updated current architecture, development, asset, and technical-debt documentation.

## Compatibility notes

- The repository remains `commune-tcg`.
- The Cloudflare Worker remains `commune-tcg-gacha` so existing bindings and deployment identity are not severed.
- Existing `commune-*` storage keys, the `ctcg_session` cookie, battle seed fallbacks, and public asset filenames remain stable.
- `pow` remains the stored offensive field and is rendered as ATK.
- Historical phase documents retain the terminology that was current when written.
- No production D1 or R2 data is reset or migrated by branch promotion.

## Known issues

- Administrator policy is a configured slot allowlist rather than a full role and audit model.
- Some ownership helpers retain a temporary Sterling fallback for compatibility.
- Runtime-created D1 tables are not all represented by versioned migration files.
- Pull/economy integration coverage is less complete than battle engine coverage.
- The final logo, favicon, PWA icons, and social preview are not yet checked in.
- Protected diagnostic endpoints retain historical URL paths outside `/api/admin/*` and should eventually be grouped under an admin namespace.

## Deferred work

- Full `app.js`-style architecture refactor or framework migration
- Destructive `pow` to `atk` data migration
- Battle redesign or rebalance
- Database redesign
- Large-scale route/state rewrite
- Replacement of approved rarity frames
- Repository or Cloudflare project rename
- Speculative compatibility-key and asset deletion

## Recommended next milestones

1. Add integration tests for authenticated economy, daily reset, pulls, duplicates, and reward settlement.
2. Replace temporary ownership fallbacks with mandatory authenticated user contracts.
3. Introduce administrator roles, audit rows, and optional Cloudflare Access enforcement.
4. Convert runtime schema creation into a complete ordered D1 migration set.
5. Produce final logo, favicon, PWA icons, and Open Graph artwork.
6. Begin modularization with shared contracts and type configuration, not a framework rewrite.
