# ATK / Power Terminology Migration

Completed: 2026-07-10

## Canonical terms

- ATK is the offensive stat stored internally as `pow`.
- DEF is defense.
- SPD is speed.
- Power is ATK + DEF + SPD.
- PWR is the compact abbreviation for Power.
- Squad Power is the sum of the selected cards' Power.
- Effective Power or Matchup Power is temporary encounter-adjusted Power.

## Implementation boundaries

This migration changes display labels, accessibility copy, admin presentation, and documentation. It does not change stored values, card balance, rarity budgets, level growth, type weights, battle formulas, D1 columns, card JSON contracts, or compatibility parsing.

The following internal contracts intentionally remain supported:

- `pow`
- `stats.pow`
- `baseStats.pow`
- `effectiveStats.pow`
- `battlePower`
- `baseBattlePower`
- `adjustedBattlePower`
- `effectiveBattlePower`

Compatibility aliases such as `power`, `attack`, `atk`, and `strength` remain accepted where existing normalizers already support them.

## Updated surfaces

- Canonical standard, showcase, thumbnail, Library, Vault, Pull, submission, and admin card rendering
- Home strongest-card Power summary
- Battle Hub, encounter selection, Squad Builder, battle-result rows, lead-card summary, and combat summary
- Admin card editor, preview, audit table, Founder Pool mechanics table, and mechanics simulator
- Screen-reader stat descriptions and compact battle stat rows
- README, game design, battle design, mechanics contract, phase notes, inventories, fixtures, and source comments containing player-facing terminology

## Validation

The migration workflow performs:

1. Repository-wide stale visible-label checks.
2. Compact attack-shorthand checks.
3. Compatibility assertions for internal `pow` normalization.
4. `git diff --check`.
5. The production Vite build.

## Execution result

- Repository-wide terminology validation: passed
- Production Vite build: passed
- Internal `pow` compatibility assertions: passed
