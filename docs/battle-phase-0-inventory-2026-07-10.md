# Battle Rebuild Phase 0 Inventory

Baseline commit: `94e2efe` on `Gacha`.

## Confirmed integration points

- The client is a Vite SPA with hash routing in `src/main.js`; ordinary player routes are wrapped in `AppShell`.
- Existing battle routes are Hub, Encounter Select, Squad Builder, and Results. There is no active arena route.
- `src/components/CardFrame.js` is the canonical card renderer and must remain the battle card source.
- `functions/_shared/battle-engine.js` currently combines D1 card adaptation, mock encounters, aggregate Power resolution, history schema, history writes, and history reads.
- `POST /api/battles` currently resolves and immediately settles a battle. `GET /api/battle-attempt` can only recover already-settled history.
- `functions/_shared/battle-progression.js` owns Gold/XP writes and duplicate-attempt protection. It mutates card JSON and `user_resources`.
- `user_battle_squads` stores one ordered comma-separated ID list per user. Order is retained, but the current contract allows one to three cards rather than requiring left, center, and right.
- `battle_history` stores the result payload in `result_json` and later adds a unique `attempt_id`. It has no explicit pending/finalized/surrendered lifecycle.
- `user_resources` currently has Pull Tickets and Gold. No battle Energy field or regeneration model exists.
- The accepted XP curve is `40 + currentLevel * 15`, implemented by the battle reward/progression modules.
- Encounter definitions are duplicated between `src/data/mockBattle.js` and `functions/_shared/battle-engine.js`.
- The active result is aggregate matchup-adjusted Squad Power versus one enemy Power value. The current Lead Card is Power-based.
- Baseline `npm run build` passes after using a writable npm cache.

## Required migration

The rebuild needs an explicit `battle_attempts` table for pending authoritative results and version/status fields. `user_resources` also needs an `energy` column and a daily-first-victory audit table or equivalent unique record. Existing `battle_history` remains the finalized audit/history surface.

## Principal risks

- D1 settlement must remain idempotent while creation, Energy spend, finalization, surrender, Gold, XP, daily bonus, and history move to distinct lifecycle steps.
- Older deployments may have incrementally created tables with different columns; schema setup must remain additive and introspection-safe.
- Routes and CSS have grown through phase-specific overrides. The arena should use a dedicated shell and cohesive battle modules, not another override stack.
- Existing clients and admin diagnostics expect legacy simulation response fields. Compatibility adapters are preferable to duplicating combat rules.

