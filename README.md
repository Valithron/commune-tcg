# Commune TCG Gacha

Vite single-page card-collection game deployed with Cloudflare Pages Functions, D1, and R2.

## Current status

The `Gacha` branch includes a complete first playable 3-on-3 PvE battle loop:

1. Choose Crossroads Patrol.
2. Inspect its three enemy lanes.
3. arrange exactly three owned cards as left, center, and right.
4. Review isolated-lane forecasts.
5. Create one server-authoritative seeded attempt and spend 1 Energy.
6. Watch the stored event log in a full-screen arena.
7. Pause, inspect, change speed, enable Reduced Motion, retreat, resume, or skip.
8. Finalize Gold and XP exactly once and view persisted MVP/results.

The battle core is shared by backend resolution, automated tests, batch simulation, forecasts, event replay, and MVP analytics. Player battles no longer resolve through aggregate Squad Power.

## Battle routes

```text
#/battle
#/battle/encounters
#/battle/squad?encounter=crossroads-patrol
#/battle/arena?attemptId=<attempt-id>
#/battle/results?attemptId=<attempt-id>
```

The arena uses a battle-only shell. All other player routes remain in `AppShell`; admin routes remain in `AdminShell`.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run battle:simulate -- --iterations=1000
npm run preview
```

## Battle architecture

```text
shared/battle/             Pure rules, RNG, engine, forecasts, MVP, simulator, encounters
functions/_shared/         D1 card adapter and authoritative attempt lifecycle
functions/api/             Create, recover, forecast, finalize, surrender, and history APIs
src/services/              Browser transport and stored-event playback
src/components/battle/     Canonical CardFrame battle extensions
src/routes/                Hub, encounter, formation, arena, and persisted results
tests/                     Engine, simulator, backend idempotency, and UI contract tests
```

## Canonical terminology

- ATK is the offensive stat; internal storage remains `pow` for compatibility.
- DEF is mitigation.
- SPD controls initiative, crit specialization, and Double-Strike eligibility.
- Power or PWR is ATK + DEF + SPD.
- Squad Power is the three-card total. It is a preview metric, not the combat resolver.

## Guardrails

- `src/components/CardFrame.js` remains the canonical card renderer.
- The browser never chooses the reward-bearing seed, result, MVP, or rewards.
- Pending attempts store the complete event log before playback.
- Energy, finalization, surrender, daily bonus, Gold, XP, levels, and history are idempotent.
- Refresh and disconnection never reroll a created attempt.
- Abilities, PvP, equipment, evolution, trading, deep statuses, and shards remain deferred.
