# Battle System Implementation Report

## Completed behavior

The active player path now runs a complete first playable 3-on-3 PvE battle instead of comparing aggregate Squad Power.

- Battle Hub with pending-attempt recovery
- Canonical Crossroads Patrol preview with three ordered enemies
- Exactly-three-card left/center/right formation, tap placement, tap swap, save, search, type/rarity filters, sorts, and isolated-lane forecasts
- One pure, versioned, seeded battle engine shared by backend, tests, simulator, forecast, event replay, and MVP inputs
- Full-screen 3-over-3 arena with stored-event playback, inward HP bars, 1×/2×, pause, log, sound preference, Reduced Motion, inspection snapshots, knockout/lane/end staging, skip, recovery, and retreat
- Server-owned seed, current stat snapshots, Energy spend, result, event log, MVP, reward preview, finalization, surrender, and daily bonus
- Automatic reward queue with tap-to-advance and Skip All
- Persisted result summary, MVP, Gold, XP progress, and level-ups

## Authoritative data flow

1. Browser sends canonical encounter ID, attempt ID, and three ordered owned card IDs.
2. Backend resolves the signed-in user, re-reads ownership/current stats, validates exactly three distinct eligible cards and Energy, selects a seed, and runs the pure engine.
3. D1 atomically stores a `pending` attempt and spends 1 Energy.
4. Browser animates the stored event log only.
5. Completion or Skip to Results finalizes the stored outcome. Retreat converts it to surrender/defeat.
6. A status/settlement-token-guarded D1 batch applies Gold, current-card XP/levels, history, and terminal status once.
7. Refresh recovers the same stored attempt. One active pending/settling attempt per user prevents cross-attempt card-XP races.

## Main changed files

### Canonical battle core

- `shared/battle/battle-config.js`
- `shared/battle/battle-contracts.js`
- `shared/battle/battle-rng.js`
- `shared/battle/battle-damage.js`
- `shared/battle/battle-engine.js`
- `shared/battle/battle-forecast.js`
- `shared/battle/battle-mvp.js`
- `shared/battle/battle-simulator.js`
- `shared/battle/encounter-registry.js`

### Backend and persistence

- `functions/_shared/battle-card-store.js`
- `functions/_shared/battle-adapter.js`
- `functions/_shared/battle-attempts.js`
- `functions/api/battles.js`
- `functions/api/battle-attempt.js`
- `functions/api/battle-finalize.js`
- `functions/api/battle-encounters.js`
- `functions/api/battle-forecast.js`
- `functions/api/battle-simulate.js`
- `functions/api/battle-squad.js`
- `functions/api/battle-history.js`
- `functions/api/battle-inventory.js`
- `functions/api/pull-resources.js`
- `worker.js`

### Browser and presentation

- `src/services/battleApi.js`
- `src/services/battlePlayback.js`
- `src/components/battle/BattleCard.js`
- `src/routes/BattleHub.js`
- `src/routes/EncounterSelect.js`
- `src/routes/SquadBuilder.js`
- `src/routes/BattleArena.js`
- `src/routes/BattleResults.js`
- `src/styles/battle-flow.css`
- `src/styles/battle-arena.css`
- `src/main.js`

### Removed obsolete active prototype

- `functions/_shared/battle-engine.js` aggregate Power resolver
- `functions/_shared/battle-progression.js` immediate settlement writer
- `src/data/mockBattle.js` duplicate encounter source
- `src/services/battleRewardClaim.js` manual reveal settlement path

## D1 migration

`migrations/001_battle_attempts.sql` adds:

- `battle_attempts`
- `battle_daily_victories`
- active-attempt and user/status indexes
- `user_resources.energy`
- `user_resources.energy_updated_at`

Runtime setup remains additive and introspection-safe for existing databases. `battle_history.attempt_id` and its unique user/attempt index are also ensured at runtime.

## Verification

Passed:

```text
npm test
30 tests passed

npm run build
Vite production build passed, 91 modules transformed

XDG_CONFIG_HOME=/tmp/commune-wrangler-config npx wrangler deploy --dry-run
Worker bundle and assets dry run passed

npm run battle:simulate -- --iterations=1000
24,000 primary scenario battles plus formation batches and isolated-lane comparisons recorded
```

Automated coverage includes deterministic RNG/results, formula/rounding/minimum damage, type relationships, crit caps, equal-SPD order, death cancellation, side/center routing, legal retargeting, immediate battle end, overkill accounting, Double-Strike tiers/overflow/no-retarget/no-crit, configurable reinforcement, event replay, forecast thresholds, formation permutations, backend ownership/order/Energy/idempotency/daily bonus/retreat, and required UI contracts.

## Simulator findings

Full findings: `docs/battle-simulator-findings.md` and `docs/battle-simulator-results.json`.

- Balanced control: 69.7% win rate, 7.25 rounds, 34.57 estimated seconds at 1×.
- Formation range across the same three balanced cards: 35.0% to 83.7%.
- 100% cross-lane damage remains selected. The 85% and 70% taxes reduced ordinary balanced performance but did not change the extreme ace scenario's outcome.
- Extreme ace concentration remains dominant and is a live-balance risk.
- Equal-budget ATK-heavy cards strongly outperformed DEF-heavy and SPD-heavy profiles in this encounter. No approved formula was silently changed.

## Forecast calibration

Forecasts run repeated isolated one-on-one battles through the canonical engine and return only:

- Favored: 65% or greater
- Even: 36% to 64%
- Risky: 35% or lower

The formation UI states that forecasts exclude reinforcement. Boundary tests cover 65%, 64%, 36%, and 35%.

## MVP behavior

MVP v1 scores useful HP removed, knockouts, lane wins, first lane, reinforcement contribution, final knockout, survival, critically-low survival, and Double-Strikes. Overkill is excluded. Balanced wins distributed MVP among all positions; the deliberately extreme ace earned every MVP because it produced nearly all decisive contribution.

## XP findings

Approved values remain unchanged: 18 XP per victory, +12 first-daily XP, and 5 XP on defeat/retreat. Ordinary victories per next level range from 4 at Level 1, 11 at Level 10, 28 at Level 30, and 60 at Level 69. High-level pacing should be judged alongside future missions and non-battle XP.

## Regression and presentation checks

- Production build imports all prior player/admin routes successfully.
- Arena is the only battle-shell route; ordinary navigation remains unchanged elsewhere.
- CardFrame remains canonical in encounter, formation, arena, inspection, and MVP.
- No active frontend/backend aggregate Power resolver or duplicate encounter registry remains.
- No manual routine Reveal Rewards path remains.
- Player-facing battle copy uses ATK, DEF, SPD, PWR/Power, and Double-Strike.
- Responsive CSS explicitly covers portrait mobile and desktop arena/inspection layouts.

## Known risks

- The simulator exposes strong ATK dominance and extreme ace carry under the approved first-test formulas. Broader live-card distributions and more encounters are needed before balance lock.
- Visual verification in this environment was limited to build, worker bundle, responsive/source contract checks, and CSS inspection because no browser runtime was installed. Device-level touch and animation polish should receive a short post-deploy playtest.
- Energy currently has a safe bootstrap balance and spend contract but no regeneration/purchase system because none was approved.
- Existing production bindings are configured in the Cloudflare project rather than declared with resource IDs in `wrangler.toml`; the dry run therefore reports only the asset binding.

## Intentionally deferred

Abilities, PvP, equipment, evolution, trading, physical/mystic damage categories, deep statuses, manual targeting, bespoke combat sprites, shards/dust drops, Challenge reward tables, Seasonal Boss rules, auto-repeat, sweeps, and Energy replenishment design.

