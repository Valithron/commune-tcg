# ChatGPT Work Handoff: Build the Commune TCG Battle System

Repository:

`https://github.com/Valithron/commune-tcg`

Branch:

`Gacha`

## Assignment

Implement the complete first playable Commune TCG 3-on-3 PvE battle system as one cohesive project.

This is not a request for another design pass, a prototype mockup, or a partial simulator. The battle system has already been designed. Your task is to inventory the current branch, build the authoritative combat engine and simulator, integrate it into the existing backend and player flow, implement the full-screen battle presentation, preserve reward safety, validate balance gates, test the result, update documentation, and report what changed.

Execute the work in controlled phases, but carry the assignment through to completion without stopping for routine approval between phases.

## Required Reading

Read these files in full before editing:

1. `docs/game-design.md`
2. `docs/battle-design.md`
3. `docs/battle-implementation-plan.md`
4. `docs/architecture.md`
5. Current battle routes, services, Functions, styles, schemas, and reward code

Authority order:

1. `docs/game-design.md` for wider game rules
2. `docs/battle-design.md` for battle mechanics and player-facing design
3. `docs/battle-implementation-plan.md` for architecture, phase order, tests, and delivery requirements
4. Existing code for compatibility and current integration facts

Do not reinterpret or replace approved rules with your own preferences.

## Product Outcome

The finished player flow must be:

> Choose an encounter, inspect three enemy lanes, prepare and order three owned cards, lock formation, create one authoritative seeded battle attempt, watch the stored event log in a full-screen 3-over-3 battlefield, inspect or pause without changing the result, receive MVP and automatic reward presentations, then battle again, edit formation, choose another encounter, or return to the Battle Hub.

The active player path must no longer resolve victory through aggregate Squad Power comparison.

## Current Repository Context

The app has grown organically. Avoid adding another patch stack.

Known starting conditions include:

- Vite single-page application with native ES modules
- Hash router in `src/main.js`
- Cloudflare Pages Functions and D1
- Canonical `src/components/CardFrame.js`
- Existing Battle Hub, encounter, squad, results, and admin battle routes
- Existing saved squad APIs
- Existing battle inventory
- Existing protected attempt IDs, Gold writes, XP writes, and battle history
- Current frontend and backend outcome logic based primarily on Effective Squad Power
- Current duplicate encounter definitions
- No dedicated active-battle route

Reverify all of this against the current branch before editing.

## Mandatory Architectural Result

Build one canonical, pure, seeded combat core that is shared by:

- Authoritative backend resolution
- Automated tests
- Batch simulator
- Lane forecasts
- MVP scoring inputs

The pure core must not access:

- DOM
- D1
- Cloudflare bindings
- Authentication
- Reward writes
- Wall-clock time
- `Math.random()`

The same normalized input, rules version, encounter version, and seed must always produce the same event log and final state.

Keep backend adapters, browser playback, reward settlement, and card rendering outside the pure core.

## Mandatory Mechanical Scope

Implement every confirmed first-build rule in `docs/battle-design.md`, including:

- Three active player cards versus three active enemy cards
- Left, center, and right formation
- Strict home-lane targeting until the opposing card is defeated
- Round-start SPD order snapshot
- Mid-round SPD changes applying next round
- Seeded equal-SPD priority rerolled each round
- Dead cards losing pending turns
- Immediate knockout removal
- Legal retargeting instead of wasted turns
- Side and center reinforcement routing
- Immediate battle end after final knockout
- Universal level-scaled HP
- ATK damage formula
- Diminishing-return DEF
- Type multipliers
- ±5% variance
- SPD-influenced crit chance
- Full-precision calculation, one final rounding step, minimum 1 successful damage
- Full displayed overkill and capped applied contribution
- No ordinary random misses
- Automatic Double-Strike eligibility, tiered charge, overflow, timing, 30% strike, no chaining, no crit, and no retarget after a lane-killing normal hit
- Configurable 100%, 85%, and 70% cross-lane damage, defaulting to 100% unless simulator evidence supports changing it

Player-facing terminology must use `ATK` and `Double-Strike`. Maintain internal `pow` compatibility without a destructive data migration.

## Mandatory Simulator and Validation Work

Before balance lock, build and run a reproducible simulator that can execute large seeded batches without the DOM or reward writes.

Test at minimum:

- All formation permutations
- Balanced versus balanced squads
- Ace plus weak supports versus three medium cards
- ATK-heavy squads
- DEF-heavy squads
- Genuine SPD specialists
- Mixed levels and rarities
- Type distributions
- Equal-SPD ties
- All Double-Strike charge tiers
- 100%, 85%, and 70% cross-lane damage

Collect:

- Win rates
- Lane win rates
- First lane broken
- First knockout round
- Total rounds
- Remaining HP
- Reinforcement attacks and applied damage
- Outcomes reversed by reinforcement
- Double-Strike frequency
- MVP frequency
- Estimated playback duration

Use the same engine to generate isolated-lane forecasts:

- Favored: 65% or greater
- Even: 36% to 64%
- Risky: 35% or lower

Do not expose exact percentages to players. State that forecasts exclude reinforcement.

Implement a versioned weighted MVP model using actual contribution, not highest Power. Exclude wasted overkill from useful damage. Generate a concise explanation.

Validate the approved Daily Skirmish XP values against the actual progression curve. Report representative battles-per-level. Keep the values configurable. Do not silently revise them.

## Mandatory Encounter and Formation Flow

Keep encounter selection and formation as separate screens.

Encounter preview must show:

- Encounter name and difficulty
- Encounter art or background treatment
- Three ordered enemy cards
- Enemy Squad Power
- Recommended range
- Energy cost
- Base rewards
- Visible encounter rule
- Prepare Squad action

Formation must:

- Require exactly three owned eligible cards
- Preserve explicit left, center, and right order
- Support tap placement and tap swap
- Support drag only as an optional enhancement
- Reuse CardFrame
- Support search, type filter, rarity filter, and approved sorts
- Show Favored, Even, or Risky per lane
- State that forecasts exclude reinforcement
- Save ordered formation

## Mandatory Server-Authoritative Attempt Lifecycle

Beginning battle must atomically:

1. Validate signed-in user
2. Validate unique attempt ID
3. Load canonical encounter
4. Validate exactly three distinct owned eligible cards in lane order
5. Re-read current stats
6. Validate available Energy
7. Select authoritative seed
8. Run the canonical engine
9. Spend exactly 1 Energy
10. Store the complete result as pending
11. Return the stored event log

If creation fails, spend no Energy.

Completing playback or selecting Skip to Results must finalize the stored outcome and apply rewards exactly once.

Retreat must:

- Keep Energy spent
- Convert the attempt to surrender/defeat
- Apply normal defeat rewards exactly once
- Prevent later victory finalization

Refresh or disconnection must not reroll. Pending attempts must offer Resume Battle or Skip to Results.

Preserve and strengthen duplicate protections. Animation completion must never be required for reward safety.

## Mandatory Full-Screen Battle Arena

Add a dedicated active-battle route between formation and results.

During active battle:

- Hide normal application navigation and unrelated UI
- Use a battle-only full-screen shell
- Show three upright enemy cards above three upright player cards
- Use the existing thumbnail card treatment on mobile or a deliberate canonical extension
- Put enemy HP bars below enemy cards
- Put player HP bars above player cards
- Imply lanes through placement and motion rather than permanent borders
- Hide permanent compact card names on mobile
- Use a reusable dark arena foundation plus encounter-specific treatment
- Keep exit inside pause

Playback must consume the stored event log rather than recalculate combat.

Implement the approved opening, normal attack, crit, Double-Strike, knockout, lane victory, final knockout, victory/defeat, 1×, and 2× behavior.

Normal attacks use restrained type-colored trails or impacts. Do not add elaborate ability-style elemental effects.

## Mandatory Pause, Inspection, and Accessibility

Pause must freeze all playback and idle motion without covering battlefield cards.

Pause options:

- Resume
- Speed
- Sound
- Battle log
- Reduced Motion
- Retreat / Exit

Cards must remain inspectable while paused.

Opening inspection during active combat must not pause the battle.

Inspection behavior:

- Snapshot values when opened
- No live HP updates inside the open panel
- Blocks accidental taps behind it
- Pause remains accessible
- Mobile emphasizes the full collectible card
- Desktop uses a split card-and-information layout

Reduced Motion must be available from pause and respect a saved preference. Follow the exact behavior in `battle-design.md`.

Do not communicate forecasts, type relationships, or low HP through color alone.

## Mandatory Results Flow

Results must show:

- Victory or Defeat
- MVP on victory
- Short battle summary
- Gold and other currency
- XP for all three cards
- XP progress
- Level-ups
- Optional highlights
- Battle Again
- Edit Formation
- Choose Encounter
- Battle Hub

Routine rewards must auto-present in succession. Do not require the current manual Reveal Rewards interaction.

Queue order:

1. Gold and ordinary currency
2. Special drops, when present
3. XP for each card
4. Level-ups
5. Later milestones or unlocks

Tapping advances to the next item. Skip All opens the complete summary. Reward writes remain exactly once regardless of presentation skips.

## Daily Skirmish 01

Implement Crossroads Patrol using the approved design:

- Energy cost: 1
- Victory: 20 Gold and 18 XP per squad card
- First daily victory: +40 Gold and +12 XP per squad card
- Defeat or retreat: no Gold and 25% of normal XP, rounded to a whole number
- No shard reward until a real shard system exists

Keep these configurable and report XP-curve findings.

## Required Execution Order

Follow the phases in `docs/battle-implementation-plan.md`:

0. Inventory and baseline
1. Shared contracts, config, encounter registry, and seeded RNG
2. Pure battle engine and unit tests
3. Simulator, forecasts, MVP, cross-lane testing, and XP validation
4. Authoritative backend attempt lifecycle
5. Encounter preview and formation
6. Full-screen arena and event playback
7. Results, reward queue, and MVP
8. Recovery and failure states
9. Cleanup, regression testing, documentation, and final report

Do not stop after an intermediate phase.

## Guardrails

- Do not broadly refactor unrelated application code.
- Do not add scattered fix or override files as the primary implementation method.
- Keep route files focused on composition.
- Keep one canonical encounter source.
- Keep one canonical battle rules implementation.
- Preserve CardFrame.
- Preserve auth and ownership validation.
- Preserve exactly-once settlement.
- Do not trust client stats or results.
- Do not calculate rewards in the browser.
- Do not add abilities, PvP, equipment, evolution, trading, or deep statuses.
- Do not use aggregate Squad Power as the final resolver.
- Do not hide a cross-lane penalty if testing selects one.
- Do not add a free lane-win attack.
- Do not add ordinary random misses.
- Do not add overkill spillover.
- Do not pause combat merely because inspection opens.
- Do not expose internal `pow` as player-facing `POW`.

## Required Verification

At minimum:

- `npm run build`
- Automated engine tests
- Backend idempotency tests
- Simulator runs and recorded findings
- Formation-order persistence
- Forecast calibration
- Full-screen mobile battle verification
- Pause and inspection verification
- 1× and 2× verification
- Reduced Motion verification
- Refresh and disconnect recovery
- Retreat and surrender integrity
- Automatic reward queue
- Major route regression smoke tests

## Definition of Done

Do not declare completion until:

- One canonical seeded engine exists
- Same seed and inputs reproduce identical results
- Active player battles use lane combat, not aggregate Power comparison
- Forecasts reuse the engine
- MVP uses actual contribution
- Server controls seed and result
- Energy and rewards apply exactly once
- Refresh does not reroll
- Retreat cannot exploit rewards
- Dedicated full-screen arena works
- Pause, inspection, speeds, reduced motion, recovery, and skip work
- Results and reward queue reflect persisted writes
- Existing major routes remain functional
- Documentation is updated
- No obsolete active-path battle prototype remains

## Final Response Required

When finished, provide a complete implementation report containing:

- What was built
- Architecture and authoritative data flow
- Changed files
- D1 migrations
- Test commands and results
- Simulator findings
- Cross-lane multiplier selected and reasoning
- XP-curve findings
- Forecast calibration
- MVP behavior
- Regression results
- Known risks
- Intentionally deferred systems

Do not claim success for work that was not completed or verified.
