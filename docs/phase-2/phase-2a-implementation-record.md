# Phase 2A Implementation Record

Status: Implementation complete; preview deployed; authenticated browser validation pending
Branch: `phase-2a-daily-loop-collection-clarity`
Baseline: `5f2219afbffa2c7f6fbc4a8bb933f16914ae421d`

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

- Home now reads authenticated resources and presents one recommended action.
- The action priority is daily Ticket, one-card pull, Gold exchange, Battle, then Vault.
- Mock streak, Library-seen, account-slot, and fallback-user language was removed from Home.
- Account identity and logout moved into a compact top-bar account menu.
- Pull displays the current Ticket balance, exact one-card and five-card costs, and disables options known to be unavailable.
- The Ticket Shop displays claim and exchange availability before action and keeps the approved 1,000 and 2,000 Gold prices unchanged.
- Library consistently means all available designs; Vault consistently means owned card copies.
- Pull preview, Library inspection, and Vault inspection use centered modal presentation.
- Compact layouts were added for Home resources, account navigation, Pull confirmation, Ticket Shop, and inspections.

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

Focused coverage verifies smart-action priority, pre-action resource blocking, unchanged Ticket Shop prices, Library/Vault terminology, centered inspection contracts, account-menu placement, and telemetry allowlisting.

## Preview deployment evidence

| Check | Result |
| --- | --- |
| Preview URL | `https://phase-2a-daily-loop-collecti.commune-tcg.pages.dev` |
| Health | `ok: true` |
| D1 binding | `DB: true` |
| R2 binding | `CARD_IMAGES: true` |
| JavaScript bundle | `index-CZtKooaE.js` |
| CSS bundle | `index-CCqdKeS1.css` |

The served bundle hashes match the local Phase 2A production build. Preview reads remain isolated through the existing preview bindings, and no cleanup or data reset was performed.

## Remaining PR validation

- Inspect authenticated Home, Pull, Shop, Vault, and Library routes on the isolated preview.
- Confirm centered inspection at desktop and true phone viewport widths.
- Confirm the Home action matches live preview resource states.
- Confirm the three Phase 2A events are accepted without gameplay coupling.
- Confirm no preview cleanup occurs without Sterling's explicit approval.
