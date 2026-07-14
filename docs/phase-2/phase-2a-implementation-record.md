# Phase 2A Implementation Record

Status: Home correction implemented; corrected preview validation pending
Branch: `phase-2a-daily-loop-collection-clarity`
Baseline: `5f2219afbffa2c7f6fbc4a8bb933f16914ae421d`
Home correction baseline: latest `main` merged at `aca963d`, including the governing Core Commons asset

## References consulted

The governing reference is `docs/phase-2/phase-2-roadmap.md`. Implementation also consulted:

- `docs/quality-playability-roadmap.md` for player-loop goals and quality principles;
- the historical `docs/phase-2-daily-player-loop-work-order.md` branch version for non-governing research and acceptance ideas;
- `docs/game-design.md`, `docs/backend-contracts.md`, and `docs/architecture.md` for economy and ownership boundaries;
- `docs/card-frame-design.md`, `docs/card-mechanics-contract.md`, and `docs/brand.md` for card and presentation constraints;
- `docs/route-map.md`, `docs/developer-guide.md`, and `docs/technical-debt.md` for implementation boundaries;
- `docs/release-hardening/phase-1-final-report.md`, `human-test-results.md`, and `defect-friction-ledger.md` for release evidence and known friction;
- `auth-ownership-audit.md`, `economy-transaction-audit.md`, and `route-api-matrix.md` for Phase 1 isolation and transaction guarantees; and
- the telemetry event dictionary, privacy/retention record, and deployment baseline for bounded instrumentation and environment safety.

The older roadmap and work order contained stale Phase 1 status, a single-branch Phase 2 delivery assumption, broader optional systems, and routine approval pauses. The governing Phase 2 roadmap replaces those points with three pull requests, explicit exclusions, and autonomous routine implementation.

## Implemented player changes

- Home is now an asset-led Core Commons stage using `public/assets/home-background.png`, served at `/assets/home-background.png`.
- The existing authenticated top rail remains the source of Gold, Tickets, Energy, and account controls, presented as a compact glass overlay above the room.
- The strongest owned Vault card supplies art only to the central oval portal. The rarity-colored portal and compact Core nameplate both open the existing authenticated owned-card detail route.
- The daily smart socket reads the authenticated daily state and shows `Claim Daily Ticket` before claim or `Use Tickets` after claim. It preserves the existing Shop/Pull routes and does not change claim or economy behavior.
- Vault and Library use restrained side support sockets, and `Enter Battle` uses the lower illustrated threshold. No dormant feature system was implemented or advertised.
- Mock streak, Library-seen, account-slot, and fallback-user language was removed from Home.
- Account identity and logout moved into a compact top-bar account menu.
- Pull displays the current Ticket balance, exact one-card and five-card costs, and disables options known to be unavailable.
- The Ticket Shop displays claim and exchange availability before action and keeps the approved 1,000 and 2,000 Gold prices unchanged.
- Library consistently means all available designs; Vault consistently means owned card copies.
- Pull preview, Library inspection, and Vault inspection use centered modal presentation.
- Compact layouts were added for the Core Commons resource rail and landmarks, account navigation, Pull confirmation, Ticket Shop, and inspections.

### Core Commons overlay map

All positions are percentages of the responsive `941 / 1672` stage:

| Landmark | Position |
| --- | --- |
| Resource/account rail | `x 4%, y 1.5%, w 92%, h 7%` |
| Featured-art portal | `x 33.5%, y 11.5%, w 33%, h 29%` |
| Core nameplate | `x 31.5%, y 48.5%, w 37%, min-h 10.5%` |
| Daily smart socket | `x 70%, y 17%, w 23.5%, h 17%` |
| Vault support socket | `x 7.5%, y 39%, w 18.5%, h 10.5%` |
| Library support socket | `x 74%, y 41%, w 18.5%, h 10.5%` |
| Battle gate | `x 16%, y 73.5%, w 68%, min-h 12%` |

The nameplate is lower and shorter than the initial `y 44.5%, h 14.5%` suggestion so it reads as attached to the machine without obscuring the illustrated Core. Support sockets are intentionally narrower than the broad planning zones to keep the chamber visible.

## Telemetry

Three events were added to the existing bounded, authenticated, non-blocking envelope:

| Event | Related ID |
| --- | --- |
| `home.next_action_selected` | bounded action key |
| `pull.option_selected` | `pull-count-1` or `pull-count-5` |
| `card.inspected` | normalized card identifier |

No arbitrary copy, PIN, session token, query text, resource balance, or card payload is collected. Telemetry failure remains isolated from gameplay.

## Preserved contracts

No API transaction, schema, migration, pull odds, Ticket price, Gold rule, XP curve, Energy rule, battle balance, or authentication policy changed. Pull confirmation continues to use the Phase 1 idempotent request path. Vault detail continues to resolve through the authenticated owned-card read. No production or preview data was reset, and Phase 1 preview evidence was not cleaned.

## Automated evidence

| Check | Result |
| --- | --- |
| Baseline tests | 67 passed |
| Phase 2A tests | 5 added |
| Full tests after implementation | 72 passed, 0 failed |
| Production build | Passed |
| `git diff --check` | Passed |

Focused coverage verifies the governing Home asset and percentage landmarks, daily smart-state labels, secure featured-card inspection route, absence of the old dashboard composition, pre-action resource blocking, unchanged Ticket Shop prices, Library/Vault terminology, centered inspection contracts, account-menu placement, and telemetry allowlisting.

## Pre-correction preview baseline

| Check | Result |
| --- | --- |
| Preview URL | `https://phase-2a-daily-loop-collecti.commune-tcg.pages.dev` |
| Health | `ok: true` |
| D1 binding | `DB: true` |
| R2 binding | `CARD_IMAGES: true` |
| JavaScript bundle | `index-CZtKooaE.js` |
| CSS bundle | `index-CCqdKeS1.css` |

These hashes describe the last deployed Phase 2A preview before the Core Commons correction. They establish that the existing preview bindings were healthy and isolated. The corrected bundle and asset URL must be reconfirmed after this branch update is published. No cleanup or data reset was performed.

## Remaining PR validation

- Inspect the corrected authenticated Core Commons Home, Pull, Shop, Vault, and Library routes on the isolated preview.
- Confirm the governing background loads from `/assets/home-background.png` and that the portal, sockets, top rail, and gate align at iPhone 13 and narrow-phone widths.
- Confirm centered inspection at desktop and true phone viewport widths.
- Confirm the Home action matches live preview resource states.
- Confirm the three Phase 2A events are accepted without gameplay coupling.
- Confirm no preview cleanup occurs without Sterling's explicit approval.
