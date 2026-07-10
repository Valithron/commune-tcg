# Commune TCG Battle Implementation Plan

Living build contract for implementing the Commune TCG battle system on the `Gacha` branch.

This document translates `docs/battle-design.md` into an ordered technical plan. It defines architecture, execution phases, integration boundaries, validation requirements, and completion criteria. It does not redefine game rules.

Implementation begins only when Sterling explicitly hands the approved plan to ChatGPT Work.

## Document Status

**Phase:** Ready for Work handoff  
**Design discovery:** Complete for the first battle build  
**Implementation status:** Not yet authorized in this conversation  
**Primary battle authority:** `docs/battle-design.md`  
**Wider game authority:** `docs/game-design.md`  
**Execution handoff:** `docs/battle-work-handoff.md`

## 1. Authority and Precedence

Work must follow this order:

1. `docs/game-design.md` for wider product, card, progression, type, and economy rules.
2. `docs/battle-design.md` for all battle mechanics, player-facing terminology, visual behavior, encounter values, and deferred systems.
3. This document for architecture, sequencing, integration, testing, and delivery requirements.
4. Existing code for verified starting conditions and compatibility constraints.

Existing prototype code does not overrule an intentional design change.

If Work discovers a genuine contradiction between approved documents, it must stop only that conflicting portion, document the contradiction, and continue all unaffected work. It must not silently choose a new design rule.

## 2. Build Objective

Deliver one complete ordinary 3-on-3 PvE battle loop:

> Choose an encounter, inspect three enemy lanes, prepare and order three owned cards, lock formation, create one authoritative seeded battle attempt, watch the stored event log in a full-screen battlefield, inspect or pause without changing the result, receive MVP and rewards, then retry, edit formation, choose another encounter, or return to the Battle Hub.

The build must replace the current aggregate Power comparison as the active outcome resolver without discarding working authentication, ownership validation, saved squads, duplicate protection, progression writes, or battle history.

## 3. Verified Repository Baseline

Work must recheck these facts before editing because the branch may change.

### Application

- Vite static single-page application
- Native ES modules
- Hash routing in `src/main.js`
- Screen composition in `src/routes/`
- Shared browser behavior in `src/services/` and `src/components/`
- Cloudflare Pages Functions for authenticated APIs and D1
- No current runtime dependencies
- `src/components/CardFrame.js` is the canonical card renderer

### Existing player routes

- `#/battle`
- `#/battle/encounters`
- `#/battle/squad`
- `#/battle/results`

There is no dedicated active-battle route yet.

### Existing battle behavior

- Encounter data is currently duplicated between frontend and backend mock definitions.
- Encounters currently describe one aggregate enemy rather than three lane cards.
- Saved squads already exist but are not yet a strict left, center, and right formation contract.
- The current player flow skips from squad selection directly to results.
- Frontend and backend currently resolve victory primarily through Effective Squad Power.
- The current Lead Card is selected by Power rather than actual combat contribution.
- Protected reward settlement, attempt IDs, XP writes, Gold writes, and battle history already exist.

### Existing APIs

- `GET /api/battle-inventory`
- `GET` and `POST /api/battle-squad`
- `GET /api/battle-simulate`
- `POST /api/battles`
- `GET /api/battle-attempt`
- `GET /api/battle-history`

### Current backend areas

- `functions/_shared/battle-engine.js` currently normalizes cards and resolves aggregate Power outcomes.
- `functions/_shared/battle-progression.js` protects progression writes.
- `functions/api/battles.js` validates attempts and invokes battle resolution plus writes.
- Battle history stores structured JSON.

## 4. Non-Negotiable Integration Boundaries

### Preserve

- Authentication
- Signed-in-user ownership validation
- Exactly-once reward protection
- Existing card progression calculations unless intentionally revised by approved design
- Canonical CardFrame rendering
- Internal `pow` compatibility while presenting `ATK`
- Existing major routes outside battle
- Existing Vault, Pull, Library, Submit, Admin, and Home behavior

### Replace

- Aggregate Squad Power as final combat outcome
- Frontend-independent victory calculation
- Aggregate single-enemy encounter structure
- Direct squad-to-results flow
- Highest-Power Lead Card as MVP
- Manual routine reward reveal

### Do not do

- Broad unrelated `app.js` or project refactor
- New scattered patch files
- Destructive `pow` to `atk` migration
- Client-trusted stats, seed, outcome, Energy cost, or rewards
- Duplicate combat formulas in browser, server, simulator, forecasts, and tests
- Abilities, PvP, equipment, deep statuses, evolution, trading, or bespoke sprites

## 5. Core Architectural Direction

There must be one canonical, pure, seeded battle core.

### Pure core requirements

The core must:

- Be independent of the DOM
- Be independent of D1 and Cloudflare bindings
- Avoid `Math.random()`
- Avoid wall-clock-dependent outcomes
- Accept normalized inputs plus explicit rules version and seed
- Return deterministic final state plus ordered event log
- Run one battle or large simulation batches
- Contain no authentication
- Contain no reward writes
- Contain no card markup

### Proposed module shape

Work may refine names after inventory, but separation of concerns is mandatory.

```text
shared/
  battle/
    battle-config.js
    battle-contracts.js
    battle-rng.js
    battle-damage.js
    battle-targeting.js
    battle-double-strike.js
    battle-engine.js
    battle-forecast.js
    battle-mvp.js
    battle-simulator.js

functions/
  _shared/
    battle-adapter.js
    battle-attempts.js
    battle-progression.js
    encounter-registry.js
  api/
    battles.js
    battle-attempt.js
    battle-finalize.js

src/
  services/
    battleApi.js
    battlePlayback.js
    battleRecovery.js
  routes/
    BattleHub.js
    EncounterSelect.js
    SquadBuilder.js
    BattleArena.js
    BattleResults.js
  components/
    battle/
      BattleCard.js
      BattleHpBar.js
      BattleControls.js
      BattleInspection.js
      BattleRewardQueue.js
```

The exact file list is not mandatory. The architectural separation is.

## 6. Canonical Data Contracts

### Battle rules version

Every authoritative result must record:

- `rulesVersion`
- `encounterVersion`
- `mvpVersion`
- `forecastVersion`, when applicable

### Normalized combat card

The pure engine should receive a normalized card shape containing at minimum:

```js
{
  instanceId,
  templateId,
  ownerId,
  name,
  rarity,
  type,
  level,
  stats: { atk, def, spd },
  power,
  maxHp,
  currentHp,
  lane,
  doubleStrike: {
    eligible,
    charge,
    tier,
    chargePerTurn
  }
}
```

The backend adapter may read stored `pow` and normalize it to `atk` for the pure core.

### Encounter

Each encounter must have one canonical definition containing:

```js
{
  id,
  version,
  mode,
  name,
  difficulty,
  recommendedPowerRange,
  energyCost,
  background,
  rulesText,
  enemies: {
    left: { ...normalized enemy card source },
    center: { ...normalized enemy card source },
    right: { ...normalized enemy card source }
  },
  rewards: {
    victory,
    defeat,
    firstDailyVictory
  }
}
```

Frontend and backend must consume the same canonical encounter source or generated contract.

### Attempt

An authoritative attempt requires at minimum:

```js
{
  attemptId,
  userId,
  status,
  encounterId,
  encounterVersion,
  rulesVersion,
  seed,
  orderedPlayerCardIds,
  normalizedPlayerSnapshot,
  normalizedEnemySnapshot,
  eventLog,
  finalState,
  outcome,
  mvp,
  rewardPreview,
  energySpent,
  createdAt,
  finalizedAt,
  surrender
}
```

Suggested statuses:

- `pending`
- `finalized`
- `surrendered`

Work may use existing battle-history storage plus versioned JSON or a migration, but the lifecycle must be explicit and auditable.

### Event log

Events must be sufficient to replay the complete battle without recalculating outcomes in the browser.

Representative event types:

- `battle-start`
- `round-start`
- `turn-order`
- `turn-start`
- `target-selected`
- `charge-gained`
- `attack-start`
- `damage`
- `critical`
- `double-strike-ready`
- `double-strike`
- `knockout`
- `lane-won`
- `reinforcement-attack`
- `battle-end`
- `mvp-awarded`

Each event should include sequence number, round, actor, target when applicable, before and after state needed for playback, and compact metadata for logs and analytics.

## 7. Server Authority and Attempt Lifecycle

### Begin Battle

The backend must atomically:

1. Resolve the signed-in user.
2. Validate `attemptId` uniqueness and format.
3. Load the canonical encounter.
4. Validate exactly three distinct owned eligible card IDs in left, center, and right order.
5. Re-read current effective stats from D1.
6. Validate available Energy.
7. Select or generate the authoritative seed.
8. Run the canonical engine.
9. Spend exactly 1 Energy.
10. Store the complete result as `pending`.
11. Return the stored attempt and event log.

No Energy is spent if attempt creation fails.

### Finalization

Completing playback or selecting Skip to Results must:

1. Validate the pending attempt belongs to the signed-in user.
2. Apply the stored outcome rewards exactly once.
3. Apply XP and levels exactly once.
4. Apply first-daily-victory bonus exactly once when eligible.
5. Mark the attempt `finalized`.
6. Return the persisted reward result.

### Retreat

Retreat must:

1. Validate the pending attempt.
2. Mark it surrendered.
3. Replace the reward outcome with approved defeat rewards.
4. Apply those defeat rewards exactly once.
5. Preserve the already spent Energy.
6. Prevent reroll or later victory finalization.

### Recovery

- Refresh or disconnect does not reroll the attempt.
- `GET /api/battle-attempt` must return enough data to resume or skip.
- A pending attempt remains safe until finalized or surrendered.
- Duplicate creation or finalization calls never duplicate Energy or rewards.
- Animation completion is never a requirement for reward integrity.

## 8. Browser Responsibility

The browser may:

- Request encounter data
- Select and save ordered squads
- Request forecasts
- Create a battle attempt
- Animate the stored event log
- Store nonauthoritative local playback checkpoints
- Pause, resume, change speed, inspect snapshots, and enable reduced motion
- Request finalization, surrender, or recovery
- Present persisted results and reward queue

The browser must not:

- Recalculate authoritative outcomes
- Choose the reward-bearing seed
- Trust URL stats
- Apply rewards
- Decide MVP independently
- Reroll after refresh

## 9. Execution Phases

ChatGPT Work should complete the assignment in these phases. It should not stop for approval between phases unless an approved document is genuinely contradictory.

## Phase 0: Inventory and Safety Baseline

### Tasks

- Read `docs/game-design.md`, `docs/battle-design.md`, and this document in full.
- Inventory all battle routes, services, Functions, D1 tables, CSS, and mock data.
- Identify current saved-squad schema and battle-history schema.
- Identify the current Energy or stamina model and actual resource field names.
- Identify the actual XP curve and level calculation.
- Map all current reward settlement and duplicate-protection paths.
- Run `npm install` if required and `npm run build` before edits.
- Record a baseline of major route smoke tests.

### Deliverable

A short internal inventory note or updated documentation describing integration points, risks, and any required migration.

## Phase 1: Shared Contracts, Config, and Seeded RNG

### Tasks

- Create canonical battle rules config with explicit version.
- Create canonical encounter registry with explicit versions.
- Implement stable seeded RNG.
- Define normalized card, encounter, attempt, event, result, and MVP contracts.
- Add adapters for internal `pow` to combat `atk`.
- Centralize type matchups and prevent duplicate frontend/backend copies.

### Acceptance

- Same seed produces same RNG sequence.
- Rules and encounter values have one canonical source.
- No player-facing `POW` is introduced.

## Phase 2: Pure Battle Engine

### Tasks

Implement the complete approved combat contract from `battle-design.md`, including:

- Max HP
- Damage and DEF formulas
- Type modifiers
- Variance
- Crit chance and damage
- Round-start SPD snapshot
- Seeded equal-SPD tie each round
- Death-based turn cancellation
- Legal retargeting
- Lane routing
- Center tie routing
- Immediate battle end
- Damage precision and minimum 1
- Displayed versus applied overkill
- Double-Strike eligibility, tiered charge, overflow, timing, stored meter after lane kill, and 30% strike
- Configurable cross-lane damage multiplier
- Full event log

### Acceptance

- Engine is DOM-free and D1-free.
- Same input, rules version, and seed reproduce identical final state and events.
- Unit tests cover every confirmed mechanical rule.
- Event replay reconstructs final state.

## Phase 3: Simulator, Forecasts, MVP, and Balance Gates

### Simulator requirements

Support single runs and high-volume batches across:

- All formation permutations
- Balanced versus balanced
- Ace plus weak supports versus three medium cards
- ATK-heavy, DEF-heavy, and SPD-specialist squads
- Mixed levels and rarities
- Type distributions
- Equal-SPD ties
- Double-Strike tiers
- 100%, 85%, and 70% cross-lane multipliers

Collect at minimum:

- Win rate
- Lane win rate
- First lane broken
- First knockout round
- Total rounds
- Remaining HP
- Cross-lane attacks and applied damage
- Outcomes reversed by reinforcement
- Double-Strike frequency
- MVP frequency
- Battle duration estimate

### Forecasts

- Reuse the canonical engine.
- Simulate isolated lanes only.
- Return Favored, Even, or Risky using approved bands.
- Do not expose percentages to players.
- Add automated calibration tests near thresholds.

### MVP

- Implement a versioned weighted contribution model.
- Exclude wasted overkill from useful damage.
- Generate a concise explanation from actual contributions.
- Tune weights with simulation so MVP is not always the highest-Power card.

### XP gate

- Compare 18 XP per card and +12 first-daily XP against the real level curve.
- Report expected battles per level at representative levels.
- Keep values configurable.
- Do not silently change approved numbers unless testing proves a serious progression problem. If adjustment is necessary, document the proposed change clearly in the final report.

### Cross-lane gate

- Run 100%, 85%, and 70%.
- Default production config to 100% unless evidence demonstrates unhealthy support irrelevance or ace snowballing.
- Record findings in documentation.

## Phase 4: Authoritative Backend Integration

### Tasks

- Replace aggregate Power outcome resolution with the pure engine.
- Add or revise APIs for create, recover, finalize, and surrender.
- Preserve signed-in ownership validation.
- Preserve and strengthen attempt idempotency.
- Add required D1 migration or structured JSON contract.
- Store rules version, encounter version, seed, ordered formation, snapshots, event log or reproducible event representation, final state, MVP, reward preview, and status.
- Integrate Energy spend atomically with attempt creation.
- Integrate reward finalization atomically and exactly once.
- Integrate daily first-victory bonus.
- Preserve battle history auditability.

### Acceptance

- Refresh cannot reroll.
- Duplicate create cannot spend Energy twice.
- Duplicate finalize cannot grant rewards twice.
- Retreat cannot later claim victory rewards.
- Client-submitted stats and outcomes are ignored.

## Phase 5: Encounter Preview and Formation

### Encounter screen

- Keep encounter selection separate from formation.
- Render three ordered enemy cards.
- Show difficulty, recommended range, Energy, base rewards, rules text, and Prepare Squad.
- Use canonical encounter data.

### Formation screen

- Upgrade saved squad to explicit left, center, and right order.
- Require exactly three cards to begin battle.
- Support tap placement and tap swap.
- Support drag where reliable but do not require it.
- Reuse the canonical card renderer.
- Add search, type filter, rarity filter, and approved sorts.
- Show lane forecasts only after placement.
- State that forecasts exclude reinforcement.
- Keep Begin Battle sticky and clear on mobile.

### Acceptance

- Formation order survives save, refresh, and recovery.
- The server receives lane order explicitly.
- Forecasts use engine output, not Power deltas.

## Phase 6: Full-Screen Battle Arena

### Route

Add a dedicated route such as:

```text
#/battle/arena?attemptId=<id>
```

The exact route may differ, but the active battle must not live inside Results.

### Shell

- Hide normal app navigation and top-level UI.
- Use a battle-only full-screen shell.
- Provide exit only through pause.

### Field

- Upright 3-over-3 cards
- Existing thumbnail treatment on mobile
- Larger responsive desktop treatment where practical
- Inward HP bars
- Implied lanes
- Hidden compact names
- Reusable dark arena plus encounter treatment

### Playback

- Consume stored events only.
- Implement approved opening, normal hit, crit, Double-Strike, knockout, lane victory, final knockout, and end timing.
- Use simple type-colored normal attacks.
- Reserve elaborate effects for future abilities.
- Support 1× and 2×.
- Record local playback checkpoints.

### Inspection

- Opening does not pause.
- Snapshot values do not update live.
- Mobile prioritizes the full card.
- Desktop uses split view.
- Inspection blocks accidental taps behind it.
- Pause remains accessible.

### Pause

- Freeze playback completely.
- Do not cover battlefield cards.
- Allow card inspection while paused.
- Include Resume, speed, sound, log, Reduced Motion, and Retreat.

### Accessibility

- Implement Reduced Motion behavior from design.
- Do not rely on color alone.
- Preserve contrast and readable 2× damage.
- Support saved preference and pause-menu access.

## Phase 7: Results, Reward Queue, and MVP

### Tasks

- Finalize the pending attempt on normal completion or Skip to Results.
- Render stored outcome and stored MVP.
- Replace manual routine Reveal Rewards with automatic queued presentation.
- Present Gold, drops, each card's XP, level-ups, and later milestones in order.
- Tap advances one item.
- Skip All shows the final summary.
- Use stronger staging only for rarer future rewards.
- Provide Battle Again, Edit Formation, Choose Encounter, and Battle Hub.
- Ensure Battle Again creates a fresh attempt ID and fresh authoritative result.

### Acceptance

- Presentation skips do not skip reward writes.
- Refreshing results shows persisted rewards without duplication.
- XP and level-up displays match database writes.
- Defeat and retreat show approved reduced rewards.

## Phase 8: Recovery and Failure States

### Tasks

- Detect pending attempts on arena entry or return.
- Offer Resume Battle or Skip to Results.
- Resume from nearest local checkpoint when available.
- If no checkpoint exists, replay from start or skip.
- Handle connection loss after creation.
- Handle create failure without Energy cost.
- Handle playback desynchronization by stopping and proceeding to results.
- Ensure the server result always wins.

### Acceptance

- No path rerolls an existing attempt.
- No animation error loses rewards.
- No connection error duplicates writes.

## Phase 9: Cleanup, Migration, and Verification

### Tasks

- Remove obsolete active-path Power-margin outcome code.
- Remove duplicate encounter definitions.
- Remove obsolete manual routine reward reveal UI.
- Keep useful admin diagnostics but update terminology and contracts.
- Add or update battle admin simulator output.
- Update route map, architecture docs, README, and backend contracts.
- Run build and automated tests.
- Smoke-test major existing routes.
- Verify mobile portrait layout and representative desktop width.
- Verify reduced motion.
- Verify no player-facing offensive `POW` label remains.

### Final report

Work must provide:

- Summary of completed behavior
- Architecture and authoritative data flow
- Changed files
- D1 migrations
- Test commands and results
- Simulator findings
- Chosen cross-lane value and why
- XP-curve findings
- Forecast calibration
- MVP behavior
- Known risks
- Intentionally deferred work

## 10. Test Matrix

### Engine unit tests

At minimum:

- Damage formula and rounding
- Minimum 1 damage
- No ordinary misses
- Type advantage, disadvantage, neutral
- Crit limits
- Round snapshot
- Mid-round SPD change deferral
- Equal-SPD seeded reroll
- Knockout cancels turn
- Retarget after target death
- Side routing
- Center lower-ally-HP routing
- Center tie to lower-enemy-HP
- Final seeded routing tie
- Immediate battle end
- Displayed versus applied overkill
- Double-Strike eligibility tiers
- Charge at turn start
- No charge if dead before turn
- Overflow retention
- One Double-Strike per round
- No chaining
- No retarget after lane-killing normal hit
- Cross-lane multiplier configuration

### Backend tests

- Authentication required
- Three distinct owned cards required
- Lane order preserved
- Ineligible card rejected
- Invalid encounter rejected
- Insufficient Energy rejected without write
- Duplicate attempt rejected or recovered idempotently
- Energy spends once
- Pending attempt recovers
- Finalization rewards once
- First-daily bonus once
- Retreat rewards once
- Retreat blocks victory finalization

### UI tests or structured manual verification

- Separate encounter and formation screens
- Full-screen arena shell
- 3-over-3 layout
- Inward HP bars
- No persistent names on mobile
- Pause does not cover cards
- Inspect while running
- Inspect while paused
- Snapshot inspection does not update live
- 1× and 2×
- Reduced Motion
- Connection recovery
- Skip to Results
- Automatic reward queue
- Tap next and Skip All
- Battle Again creates fresh attempt

### Regression smoke tests

- Sign in
- Home
- Pull
- Pull results
- Vault
- Library
- Card detail
- Submit
- Admin index
- Existing resource displays

## 11. Definition of Done

### Engine

- One canonical seeded engine exists.
- Same seed and input reproduce identical output.
- All confirmed rules have tests.
- Batch simulation works without DOM or writes.
- Forecast and MVP reuse canonical results.

### Player flow

- Player can inspect three enemy lanes.
- Player can select and order exactly three owned cards.
- Saved order preserves left, center, and right.
- Forecast labels are non-guaranteed and exclude reinforcement.
- Begin Battle creates one authoritative pending attempt.
- Active battle is full-screen.
- Event playback matches stored outcome.
- Pause, inspection, 1×, 2×, reduced motion, retreat, recovery, and skip work.
- Results show actual outcome, MVP, XP, levels, and rewards.

### Integrity

- Server validates player, ownership, encounter, squad, Energy, and attempt.
- Server controls the seed.
- Refresh does not reroll.
- Energy and rewards apply exactly once.
- Retreat cannot exploit result creation.
- History is versioned and auditable.

### Quality

- `npm run build` passes.
- Automated tests pass.
- Major routes pass smoke testing.
- No active Power-comparison resolver remains.
- No duplicate encounter registry remains.
- No normal battle UI exposes internal `pow` as `POW`.
- Documentation is updated.
- Final implementation report is complete.

## 12. Work Discipline

ChatGPT Work must:

- Complete the assignment as one cohesive project while executing it in controlled phases.
- Inspect before editing.
- Prefer modular replacements over accumulating patches.
- Keep routes focused on composition.
- Keep combat independent from UI and writes.
- Preserve working safety mechanisms.
- Test after each major phase.
- Continue through the full plan without requesting routine approval.
- Make reasonable implementation-level choices where design has intentionally delegated details.

ChatGPT Work must not:

- Invent new battle mechanics.
- Add deferred systems.
- Stop after only building the simulator or engine.
- Stop after only producing a mock UI.
- Declare completion while the active player path still uses Power comparison.
- Trade exactly-once integrity for visual speed.
- Hide known failures in the final report.

## 13. Decision Log

| Date | Status | Topic | Implementation consequence |
| --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Separate design and implementation docs | Mechanics live in battle design; this file owns build sequencing. |
| 2026-07-10 | Confirmed | Canonical core | Engine, forecasts, simulator, MVP, and backend use one rules implementation. |
| 2026-07-10 | Confirmed | Server authority | Reward-bearing result is resolved and stored before animation. |
| 2026-07-10 | Confirmed | Pending lifecycle | Attempt creation spends Energy; completion, skip, or surrender finalizes exactly once. |
| 2026-07-10 | Confirmed | Active route | A dedicated full-screen arena sits between formation and results. |
| 2026-07-10 | Confirmed | Recovery | Pending attempts resume or skip without rerolling. |
| 2026-07-10 | Validation required | Cross-lane damage | Implement 100%, 85%, and 70% configuration and test before balance lock. |
| 2026-07-10 | Validation required | Daily XP | Compare approved values against actual level requirements before final tuning. |

## 14. Handoff

Use `docs/battle-work-handoff.md` to start the complete implementation assignment in ChatGPT Work.
