# Commune TCG Battle Implementation Plan

Living build plan for implementing the Commune TCG battle system on the `Gacha` branch.

This document translates the accepted battle design into an implementation contract. It is intentionally incomplete while design decisions are still being settled. It should be updated throughout the planning discussion until it is precise enough to hand to ChatGPT Work as one cohesive implementation assignment.

Nothing in this document authorizes implementation yet. Implementation begins only after Sterling explicitly approves the completed plan and hands it off for execution.

## Document Status

**Phase:** Design-to-build planning  
**Current objective:** Define a complete, internally consistent, testable implementation plan for the first playable 3-on-3 battle system.  
**Implementation status:** Not authorized.  
**Work handoff readiness:** Incomplete.  
**Primary design authority:** `docs/battle-design.md`  
**Wider game authority:** `docs/game-design.md`

### Planning labels

- **Confirmed requirement:** Already accepted in the design documents and safe to implement.
- **Current-code fact:** Verified behavior or architecture already present on the `Gacha` branch.
- **Leading implementation proposal:** Recommended build direction, but still open to revision.
- **Blocking decision:** Must be settled before the final Work handoff.
- **Deferred:** Explicitly outside the first playable battle implementation.

## 1. Document Authority and Precedence

The implementation must follow this order of authority:

1. `docs/game-design.md` defines the wider product, card model, rarity, types, progression, economy, and collection direction.
2. `docs/battle-design.md` defines battle rules, battle UX, combat values, confirmed findings, serious proposals, rejected directions, and open battle questions.
3. This document defines how the approved battle system should be built safely in the existing application.
4. Existing code describes the current prototype and integration constraints, but does not overrule an intentional design change.

This file must not quietly invent or revise combat rules. When a planning discussion settles a mechanical decision:

1. Update `docs/battle-design.md` if the decision changes or clarifies the battle system itself.
2. Update this file with the implementation consequence.
3. Keep unresolved choices clearly labeled instead of burying assumptions in code.

## 2. Product Goal for the First Playable Battle

The first implementation should deliver a complete ordinary 3-on-3 PvE battle loop:

> Choose an encounter, inspect three enemy lanes, select and order three owned cards, lock the formation, watch a deterministic server-authoritative lane battle, understand major outcomes, receive an MVP and progression rewards, then retry, edit the squad, or return to the Battle Hub.

The first version should prove the battle spine before abilities or deeper combat systems are added.

### Success conditions

The implementation succeeds when:

- Formation materially changes expected outcomes.
- Card rarity, level, ATK, DEF, SPD, and type all have understandable value.
- Comparable neutral cards generally survive around 5 to 7 normal attacks.
- Full ordinary battles generally fit the intended 30-to-60-second presentation target.
- Powerful cards can carry without making all supporting cards irrelevant.
- Outcomes are reproducible from the same battle inputs and seed.
- The UI can explain why a lane was favored, why a card acted first, and how reinforcement changed the battle.
- Rewards are applied exactly once even after refreshes, repeated requests, interrupted animation, or navigation changes.
- The battle engine can be exercised through automated tests and large simulation batches without using the DOM.

## 3. Current Repository Baseline

This section records the verified starting point. It should be rechecked by Work before editing because the branch may continue changing while this plan is written.

### Current-code facts: application architecture

- The app is a Vite-built static single-page application using native ES modules.
- Cloudflare Pages Functions provide authenticated API and D1 integration.
- The package currently has no runtime dependencies and uses Vite and Wrangler as development dependencies.
- `src/main.js` owns hash-route registration and route initialization.
- Screen composition lives in `src/routes/`.
- Shared front-end behavior lives in `src/services/` and `src/components/`.
- `src/components/CardFrame.js` is the canonical card renderer and must remain the basis for battle-card presentation.
- Battle styling is already split across battle-specific CSS files rather than being placed entirely in the router.

### Current-code facts: existing battle routes

The current player routes include:

- `#/battle` through `src/routes/BattleHub.js`
- `#/battle/encounters` through `src/routes/EncounterSelect.js`
- `#/battle/squad` through `src/routes/SquadBuilder.js`
- `#/battle/results` through `src/routes/BattleResults.js`

The current admin route includes:

- `#/admin/battle-check` through `src/routes/AdminBattleTest.js`

There is not yet a dedicated active-battle route.

### Current-code facts: existing player flow

- Battle Hub and encounter selection use mock encounter definitions.
- The encounter preview currently compares aggregate Squad Power to one enemy Power value.
- The squad builder loads eligible owned cards from the backend.
- A saved squad can be loaded and written through the battle-squad API.
- Squad cards are currently represented as up to three numbered selections, not explicit left, center, and right battle lanes.
- Starting battle currently builds a URL that goes directly to the results route.
- The results route currently determines preview victory by comparing Effective Squad Power against enemy Power.
- The current “Lead Card” is selected from the highest battle Power rather than from actual battle contributions.
- The current results route already includes protected reward settlement and a player-controlled reward reveal.

### Current-code facts: existing backend battle path

- `GET /api/battle-inventory` supplies owned battle-eligible cards.
- `GET` and `POST /api/battle-squad` load and save the signed-in player’s squad.
- `GET /api/battle-simulate` runs the current no-write Power-based simulation.
- `POST /api/battles` is the protected reward write path.
- `GET /api/battle-attempt` can recover an already-resolved attempt.
- `GET /api/battle-history` exposes previous battle records.
- `functions/_shared/battle-engine.js` currently normalizes owned-card data, calculates effective stats, applies type-adjusted Effective Power, and resolves victory through aggregate Power comparison.
- `functions/_shared/battle-progression.js` applies protected gold and XP writes.
- Battle attempts use unique `attemptId` values to prevent duplicate settlement.
- Battle history stores structured result data in `result_json`.
- No stamina, energy, drops, tickets, or card grants are currently written by the battle path.

### Current-code risks that the implementation must address

1. Frontend and backend encounter definitions are duplicated.
2. Encounter data currently describes one aggregate enemy rather than three enemy lane cards.
3. The current result is a Power-margin comparison, not an actual combat simulation.
4. The current route flow skips directly from squad selection to results.
5. The current frontend can independently preview victory using logic that will become obsolete.
6. Current saved-squad behavior must be upgraded to preserve explicit lane order.
7. Reward settlement is valuable and working, so replacing the combat model must not weaken its duplicate protections.
8. New battle logic must not be duplicated separately in the frontend, backend, forecast system, simulator, and test suite.
9. The first real combat implementation must not create another large route file or scattered patch stack.

## 4. Confirmed First-Version Scope

### Confirmed requirements

The first playable battle implementation includes:

- PvE 3-on-3 squad battles.
- Three explicit lanes: left, center, and right.
- All six cards active from battle start.
- Player formation locked before combat.
- Strict lane targeting until a lane opponent is defeated.
- Visible individual HP.
- Automatic basic attacks.
- SPD-based initiative.
- SPD-influenced critical chance.
- Conditional SPD-specialist Follow-Up strikes.
- Natural cross-lane reinforcement on later normal turns.
- Center reinforcement toward the lower allied HP percentage.
- Seeded, reproducible randomness.
- A complete battle event log suitable for animation and debugging.
- Player-facing lane forecasts.
- One Battle MVP with a concise explanation.
- Battle results, XP, Gold, and level-up presentation.
- At least one complete Daily Skirmish encounter.
- Mobile-first portrait presentation.
- Pause, inspection, 1× speed, and 2× speed.
- Reduced-motion and non-color-only accessibility support.
- Automated engine tests and batch simulation tools.

### Deferred from the first implementation

- Card abilities.
- Physical and Mystic damage categories.
- Equipment.
- Deep status effects.
- Manual targeting during ordinary combat.
- Reflex or timing mechanics.
- PvP.
- Evolution implementation.
- Trading.
- Bespoke battle sprites.
- Full seasonal-boss phase design unless separately approved.
- Deep Challenge-mode mechanics unless separately approved.
- Sweep and auto-repeat unless explicitly included later in this plan.

## 5. Confirmed Combat Package

The implementation must read the final values from `docs/battle-design.md`. The current accepted first-test package is:

- `Max HP = 240 + (Level - 1) × 5`
- `Raw Damage = 20 + ATK × 2.5`
- `Damage After DEF = Raw Damage × 40 / (40 + DEF)`
- Normal variance: `×0.95` to `×1.05`
- Base crit chance: `5%`
- Maximum normal crit chance: `10%`
- Crit multiplier: `×1.5`
- Type advantage: `×1.08`
- Type disadvantage: `×0.97`
- Neutral type matchup: `×1.00`
- Follow-Up qualification: SPD at least 15% higher than both ATK and DEF
- Follow-Up damage: 30% of the equivalent normal calculated hit
- Follow-Up cannot crit
- Maximum one Follow-Up per round
- No Follow-Up chaining

### Internal-stat compatibility

- Player-facing offensive terminology is `ATK`.
- Existing stored data may continue using the internal key `pow`.
- The engine adapter must normalize internal `pow` to the combat contract’s ATK value.
- Do not perform a destructive `pow`-to-`atk` data migration as part of battle implementation.
- Permanent card Power remains `ATK + DEF + SPD` and is not directly inserted into the damage formula.

## 6. Blocking Mechanical Decisions

The final Work handoff must contain no silent assumptions in this section.

| Decision | Current direction | Status |
| --- | --- | --- |
| Round snapshot and action order | Living cards are ordered by SPD at round start. A card acts only if still alive when its turn arrives. | Blocking decision, leading direction established |
| Knockout action denial | A faster knockout prevents the defeated card’s later scheduled action in that round. | Blocking decision, leading direction established |
| Equal-SPD tie-break | Must be deterministic, readable, and free of permanent player-side advantage. | Blocking decision |
| Damage rounding | Retain precision during calculation, then apply one explicit final rounding rule. | Blocking decision |
| Minimum damage | Ordinary legal attacks may need a minimum of 1 displayed damage. | Blocking decision |
| Equal-HP center reinforcement tie | Must use one deterministic rule. | Blocking decision |
| Follow-Up meter charge | Exact charge equation above the 15% eligibility threshold is not settled. | Blocking decision |
| Cross-lane damage | Current control is 100%; 85% and 70% Assist Attack values remain test candidates. | Blocking decision after broader simulation |
| Forecast calculation | Must use the real combat engine and avoid fake precision. | Blocking decision |
| MVP scoring | Must reward meaningful contribution rather than raw damage or highest Power alone. | Blocking decision |
| Ordinary miss chance | Current design has no accepted miss system. | Blocking decision, leading direction is no misses |
| Battle energy and failure cost | Not yet settled. | Blocking economy decision |
| Daily Skirmish reward amounts | Current values are proposals only. | Blocking economy decision |

## 7. Leading Engine Architecture

### Architectural principle

There must be one canonical combat rules implementation.

The browser, server settlement path, forecast system, simulator, admin tools, and automated tests must not each recreate damage or targeting logic.

### Leading implementation proposal: shared pure battle core

Create a DOM-free, D1-free, seeded battle core that can be imported by backend adapters and Node tests. Work must verify the exact import path against Vite and Cloudflare Pages Functions before finalizing file placement.

Proposed shape:

```text
shared/
  battle/
    battle-config.js
    battle-contracts.js
    battle-rng.js
    battle-damage.js
    battle-targeting.js
    battle-engine.js
    battle-forecast.js
    battle-mvp.js
    battle-simulator.js

functions/
  _shared/
    battle-engine.js          D1 normalization and backend adapter
    battle-progression.js     Existing protected reward writes

src/
  services/
    battleApi.js              Player-facing battle API calls
    battlePresentation.js     Event-log playback helpers
  routes/
    BattleArena.js            Active-battle screen composition
```

This exact file list is a proposal, not a mandate. Work may refine names after inventory, but it must preserve the separation of concerns.

### Core rules

The pure battle core must:

- Accept fully normalized battle inputs.
- Never access the DOM.
- Never access D1 or Cloudflare bindings.
- Never call `Math.random()`.
- Never depend on wall-clock time for combat outcomes.
- Accept a seed or seeded RNG object.
- Produce the same result for the same normalized inputs, rules version, and seed.
- Return a complete final state and ordered event log.
- Be usable for one battle and for high-volume simulation.
- Contain no reward writes.
- Contain no player authentication logic.
- Contain no card-rendering markup.

### Server authority

The server must remain authoritative for battles that grant rewards.

For a real player battle, the backend must:

1. Resolve the signed-in user.
2. Validate `attemptId`.
3. Load the encounter from the canonical encounter source.
4. Validate exactly three distinct owned and eligible card IDs in explicit lane order.
5. Re-read current effective stats from the database.
6. Generate or securely select the battle seed.
7. Run the canonical battle engine.
8. Store the seed, rules version, ordered squad, encounter version, event summary, final result, MVP, and rewards in battle history.
9. Apply rewards exactly once.
10. Return or expose the resolved battle for presentation and recovery.

The client must not be trusted to submit final stats, final HP, a winner, damage values, event logs, or reward values.

## 8. Proposed Battle Data Contracts

The final implementation may use TypeScript-style JSDoc definitions or validated plain JavaScript objects. The current project does not use TypeScript, so the plan does not require a TypeScript migration.

### BattleCardInput

Minimum normalized engine input:

```js
{
  instanceId,
  templateId,
  name,
  characterId,
  rarity,
  level,
  type,
  atk,
  def,
  spd,
  maxHp,
  lane,
  side,
  presentation
}
```

`presentation` may contain safe display metadata such as image URL, crop, frame context, and title, but the engine must not depend on that metadata for outcomes.

### BattleEncounterInput

```js
{
  id,
  version,
  mode,
  name,
  difficulty,
  enemyLanes: {
    left: BattleCardInput,
    center: BattleCardInput,
    right: BattleCardInput
  },
  rewards,
  energyCost,
  modifiers,
  presentation
}
```

Ordinary Daily Skirmish version one should use no hidden combat modifiers.

### BattleRequest

```js
{
  attemptId,
  encounterId,
  squadCardIds: {
    left,
    center,
    right
  }
}
```

The client should not choose the authoritative random seed for a reward-bearing battle.

### BattleResult

```js
{
  attemptId,
  battleId,
  engineVersion,
  rulesVersion,
  encounterId,
  encounterVersion,
  seed,
  winner,
  rounds,
  initialState,
  finalState,
  events,
  metrics,
  mvp,
  rewards,
  createdAt
}
```

The exact persistence shape should be minimized where possible. Large detailed event logs may be stored in `result_json` unless querying requirements justify dedicated columns.

## 9. Battle State and Event Log

### State requirements

The canonical battle state should track:

- Current round.
- Current turn index.
- Rules and engine versions.
- Seed and RNG state if needed for replay.
- Each card’s starting HP, current HP, alive state, lane, original lane, and side.
- Each card’s Follow-Up eligibility, charge, and remaining threshold.
- Current legal target.
- Lane winner and broken-lane state.
- Pending reinforcement destination.
- Damage, crit, Follow-Up, knockout, reinforcement, and survival metrics.

### Event requirements

The engine should emit concise semantic events rather than animation instructions.

Candidate event types:

- `battle_started`
- `round_started`
- `turn_started`
- `attack_started`
- `damage_dealt`
- `critical_hit`
- `follow_up_charged`
- `follow_up_triggered`
- `card_knocked_out`
- `lane_won`
- `reinforcement_targeted`
- `assist_attack_started`
- `round_ended`
- `battle_ended`
- `mvp_selected`

Each event should include only the identifiers, values, and state changes required to reproduce and explain the moment. The presentation layer decides duration, easing, shake, sound, card movement, and text treatment.

### Event-log invariant

A consumer must be able to replay the event list against the initial state and reach the stored final state. Automated tests should verify this invariant.

## 10. Reproducible RNG

### Confirmed requirement

The engine must use seeded randomness.

### Requirements

- Same normalized inputs + same rules version + same seed = identical events and final state.
- Random draws must occur in a stable documented order.
- Normal damage variance and crit rolls must use the seeded RNG.
- Future Follow-Up randomness, if any, must use the same seeded source.
- The engine must not mix seeded RNG with `Math.random()`.
- The result must record the seed and engine/rules version.
- Test failures should print the seed for exact reproduction.

### Seed security

The seed does not need to remain secret after resolution. The server should choose it for reward-bearing battles so a client cannot repeatedly select favorable seeds before committing an attempt.

## 11. Simulator Requirements

The simulator is not optional development scaffolding. It is part of the balance and regression toolset.

### Required modes

1. Run one battle with a specified seed.
2. Replay one stored result.
3. Run many seeds for one formation.
4. Enumerate all 36 formation pairings between two three-card squads.
5. Compare rule packages such as 100%, 85%, and 70% cross-lane damage.
6. Export or display aggregate results.

### Required aggregate metrics

- Squad win rate.
- Formation-specific win rate.
- Lane-specific card outcomes.
- First lane to break.
- Round of first knockout.
- Total rounds.
- Winning survivors.
- Remaining HP.
- Normal attack count.
- Critical count and rate.
- Follow-Up count and rate.
- Reinforcement attacks and damage.
- First-lane-winner conversion rate.
- Frequency that reinforcement changes the independent-lane expectation.
- MVP frequency.
- Per-card damage, knockouts, survival, and reinforcement contribution.
- Forecast calibration.
- Invalid, stalled, or maximum-round battles.

### Required test packages

- Balanced squad versus balanced squad.
- Ace plus two weak cards versus three medium cards.
- Two medium cards plus one weak card versus one ace plus two weak cards.
- ATK-heavy profiles.
- DEF-heavy profiles.
- True SPD specialists.
- Higher-level squads.
- Mixed-level squads.
- Type-favored and type-disfavored formations.
- Neutral-type control cases.
- Mirror matches.
- Equal-SPD cases.
- Center reinforcement tie cases.
- Extreme rarity and level mismatches.

### Admin access proposal

Preserve the current protected reward tester. Add a separate no-write simulator interface or clearly separate simulator mode within the admin battle tools.

The balance simulator must never apply Gold, XP, energy, drops, card ownership, or battle-history progression writes unless explicitly running a protected real-battle test.

## 12. Forecast System

### Confirmed design requirement

The formation screen may show:

- Favored
- Even
- Risky

These are non-guaranteed lane forecasts, not promises.

### Requirements

- Forecasts must be generated from the canonical combat engine or a validated deterministic analytical approximation derived from it.
- Forecast logic must not use only aggregate Power difference.
- Forecasts must account for ATK, DEF, SPD initiative, crit chance, type, level-scaled HP, and Follow-Up eligibility.
- The first version should forecast isolated lane quality unless the UI clearly labels a broader squad forecast.
- The UI must not present three lane forecasts as three independent votes.
- Forecasts should use category labels rather than unsupported exact percentages in normal player UI.
- Internal testing should retain the underlying probability estimate for calibration.

### Initial forecast-band proposal

- Favored: estimated isolated lane win chance of 65% or higher.
- Even: 36% through 64%.
- Risky: 35% or lower.

These bands remain active test values until validated by the reproducible simulator.

### Squad-level observation proposal

After all three player cards are placed, the formation screen may show one concise observation such as:

- Strong early reinforcement potential.
- Formation relies heavily on one ace.
- Center can rescue either side.
- Two lanes are projected to break early.

This must be explainable and must not become a second opaque Power rating.

## 13. MVP System

### Confirmed requirement

Every completed battle should select one MVP and explain the choice in one concise line.

### Candidate contribution categories

- Damage dealt.
- Knockouts.
- Winning the first lane.
- Winning a forecasted Risky lane.
- Reinforcement damage.
- Rescuing the lower-HP allied lane.
- Multiple lane wins.
- Critical low-HP survival.
- Decisive Follow-Up.
- Final surviving friendly card.
- Boss-specific contribution later.

### Guardrails

- Do not select MVP solely by highest Power.
- Do not select MVP solely by total damage.
- Do not force diversity by denying an ace that clearly carried.
- The stored result should include both the selected card and the reasons used for the player-facing explanation.
- MVP scoring must be deterministic from the event log.

The exact weights remain a blocking decision.

## 14. Encounter Source and First Content

### Canonical encounter requirement

Frontend and backend encounter definitions must be consolidated into one authoritative encounter source or one backend endpoint with a versioned contract.

The player should never preview one encounter configuration and settle against another.

### Daily Skirmish 01: Crossroads Patrol

The first planned ordinary encounter is defined in `docs/battle-design.md`.

Core identity:

- Mode: Daily Skirmish.
- Three visible enemy cards.
- Left: offensive Flame Common.
- Center: balanced Neutral Uncommon.
- Right: defensive Shadow Common.
- No hidden combat modifier.
- Teaches formation, forecasts, first lane victory, and reinforcement.
- Target presentation duration: approximately 30 to 45 seconds at 1×.

Rewards, energy cost, daily-first-clear behavior, reset rules, and failure cost remain unresolved economy decisions.

### Enemy-card representation

Enemy lane cards should use the same normalized combat contract as player cards. They may be encounter-owned definitions rather than D1-owned card instances, but they should still provide:

- Card identity and art.
- Rarity.
- Level.
- Type.
- ATK, DEF, SPD.
- Power.
- Max HP.
- Future ability slots.

## 15. Player Route and State Flow

### Leading route proposal

Add a dedicated active-battle route:

```text
#/battle/active?attemptId=<id>
```

The exact route name can change, but the active battle must not be embedded inside the results page.

### Proposed normal flow

1. Player opens Battle Hub.
2. Player chooses an encounter.
3. Player inspects the enemy formation.
4. Player selects exactly three owned cards.
5. Player orders them into left, center, and right.
6. Player presses **Begin Battle**.
7. Formation locks and the attempt is committed.
8. Backend validates and resolves the battle exactly once.
9. Active-battle route loads the stored or returned battle result.
10. UI plays the event log.
11. Final knockout leads into victory or defeat presentation.
12. Results screen displays MVP, progression, and rewards.
13. Player may Battle Again, Edit Formation, Change Squad, or return to Battle Hub.

### Recovery requirements

- Refreshing during the battle must not create a new attempt.
- Returning to an already-resolved `attemptId` must load the same result.
- Reposting the same attempt must not duplicate rewards.
- Closing the browser after commitment must not lose legitimately earned rewards.
- The results screen must not recompute victory independently from Squad Power.
- Battle Again must create a new attempt ID.

### Commit timing

The final plan must explicitly decide when energy is deducted and rewards become secured. The leading safety direction is to resolve and persist the battle server-side at formation lock, then animate the already-secured result. This preserves recovery and duplicate protection.

## 16. Screen Implementation Scope

### Battle Hub

- Present Daily Skirmish, Challenge, and Seasonal Boss as distinct modes.
- Show availability, reward identity, and relevant reset timing.
- Remove prototype-only backend language from player-facing copy.

### Encounter preview

- Show all three enemy lane cards.
- Show concise type, rarity, level, and Power.
- Allow tap-to-expand inspection.
- Show proposed rewards and energy cost.
- Do not hide ordinary combat information.

### Squad selection and formation

- Require exactly three cards for a normal 3-on-3 battle.
- Name slots Left, Center, and Right rather than Slot 1, Slot 2, and Slot 3.
- Support tap-to-place and tap-swap.
- Support drag-and-drop only when it does not harm mobile reliability or accessibility.
- Preserve saved squad lane order.
- Retain search, type, rarity, Power, level, recent, and favorite controls as appropriate.
- Show lane forecasts after placement.
- Use the canonical `CardFrame` component.

### Formation lock

- Cards snap or flash into lanes.
- Lane connections illuminate.
- `FORMATION LOCKED` appears briefly.
- Attempt and energy commitment occur once.
- Transition into the active battlefield without a second redundant confirmation.

### Active battlefield

- Three enemy cards across the upper section.
- Three player cards across the lower section.
- Stable lane columns.
- Visible HP attached to each card.
- Type and level visible at a glance.
- Follow-Up meter only when a card qualifies.
- Broken-lane and reinforcement direction clearly shown.
- Pause and 1×/2× controls persist.
- No normal attack button.

### Pause and inspection

Tapping an active card should pause combat and show:

- Full card art and frame.
- Current and maximum HP.
- ATK, DEF, SPD.
- Type relationship against the current target.
- Current crit chance.
- Follow-Up eligibility and meter when relevant.
- Encounter modifiers.

Combat must not continue invisibly behind the inspection panel.

### Results

- Use the stored battle result, not a Power recomputation.
- Display Victory or Defeat.
- Showcase the MVP and reason.
- Show concise battle labels where reliable.
- Apply and reveal XP, Gold, level-ups, and other approved rewards.
- Preserve exactly-once reward behavior.
- Offer Battle Again, Edit Formation, Change Squad, and Battle Hub.

## 17. Animation and Presentation Contract

The engine emits facts. The presentation layer owns timing and emphasis.

### Priority hierarchy

1. Normal attacks remain fast and restrained.
2. Type effectiveness receives a small local accent.
3. Critical hits receive sharper impact and brief hit-stop.
4. Follow-Up receives a compact speed signal and immediate second strike.
5. Lane victory clearly breaks the lane and points toward reinforcement.
6. Cross-lane attacks use a diagonal path distinct from home-lane attacks.
7. Final knockout and victory receive the strongest battle emphasis.
8. Progression rewards receive their own post-combat hierarchy.

### Accessibility requirements

- Never communicate type, forecast, low HP, or lane state through color alone.
- Support reduced motion.
- Maintain readable HP and damage changes at 2× speed.
- Use stable card positions.
- Provide large mobile pause and inspection targets.
- Preserve important information without audio.
- Avoid full-screen flashing patterns that harm readability or accessibility.

## 18. Backend and Persistence Plan

### Preserve

- Session-based user authority.
- Ownership validation.
- Attempt ID validation.
- Duplicate-attempt protection.
- Protected progression writes.
- Battle-history recording.
- XP application only to selected owned cards.
- Gold settlement through the current resource system.

### Replace or extend

- Replace aggregate Effective Squad Power victory resolution with the canonical lane engine.
- Replace single enemy Power with three enemy combatants.
- Expand stored result data with seed, engine version, rules version, lane order, rounds, final HP, MVP, and useful metrics.
- Ensure preview and settlement use the same encounter version and combat rules.
- Add active-battle recovery through `attemptId`.

### Schema restraint

Avoid unnecessary D1 migrations. Prefer versioned structured `result_json` for detailed battle data unless a field must be queried efficiently. Any schema change must be documented and backward-compatible with existing battle history where practical.

## 19. Automated Testing Plan

### Test runner proposal

Use Node’s built-in test runner if the deployment environment supports the required Node version. This avoids adding a large dependency solely for battle tests. Work may select another lightweight runner only with a clear reason.

### Required unit tests

- HP formula across levels.
- Raw damage formula.
- DEF mitigation.
- Type modifiers in every chart direction.
- Crit chance formula and cap.
- Follow-Up qualification.
- Follow-Up damage restrictions.
- Seeded RNG reproducibility.
- Equal-SPD tie rule once selected.
- Dead cards skipping scheduled turns.
- Strict lane targeting.
- Side-lane reinforcement.
- Center reinforcement selection.
- No free turn after a lane victory.
- One Follow-Up maximum per round.
- No Follow-Up chaining.
- Battle termination.
- Maximum-round safety.
- MVP deterministic scoring.
- Event-log replay invariant.

### Required integration tests

- Signed-in user can start a valid battle.
- Unowned card IDs are rejected.
- Duplicate card IDs are rejected.
- Wrong squad size is rejected.
- Repeated `attemptId` cannot duplicate rewards.
- A resolved battle can be recovered by attempt ID.
- Results match the stored battle, not frontend recomputation.
- XP is applied to all three selected cards exactly once.
- Gold is applied exactly once.
- Energy is applied exactly once when energy is implemented.
- Battle Again creates a fresh attempt.

### Required regression checks

- `npm run build` succeeds.
- Existing authentication remains functional.
- Home, Pull, Vault, Library, Submit, and Admin routes still load.
- Canonical card rendering remains intact.
- Saved squad behavior remains functional with lane ordering.
- Existing battle history remains readable.
- Player-facing UI never exposes internal `pow` terminology.

## 20. Work Execution Phases

The final assignment may be handed to ChatGPT Work as one cohesive task, but Work should execute it internally in controlled phases.

### Phase A: Inventory and preservation

- Read all three design and planning documents.
- Inspect current battle routes, services, APIs, shared engine, progression writes, history, styles, and card renderer.
- Record existing behavior that must be preserved.
- Identify duplicate definitions and integration boundaries.

### Phase B: Pure engine and tests

- Create the canonical seeded battle core.
- Implement confirmed mechanics only.
- Add deterministic unit tests.
- Add event-log replay validation.

### Phase C: Simulator and balance validation

- Build batch simulation tooling.
- Run required squad packages.
- Compare reinforcement packages if still requested.
- Produce a balance report.
- Do not silently retune confirmed values.

### Phase D: Backend authority and persistence

- Adapt D1-owned cards into normalized engine inputs.
- Create canonical encounter loading.
- Replace Power-margin resolution.
- Preserve attempt and reward safeguards.
- Store versioned battle results.

### Phase E: Formation and forecast

- Upgrade saved squads to explicit lane order.
- Build enemy-lane preview.
- Implement forecasts from canonical rules.
- Add formation lock and attempt commitment.

### Phase F: Active battle presentation

- Add the active route.
- Play semantic events through animated cards and lane effects.
- Add pause, inspection, speed control, reduced motion, and recovery.

### Phase G: Results and rewards

- Replace highest-Power Lead Card with actual MVP.
- Drive Victory, Defeat, combat summary, and rewards from the stored result.
- Preserve reveal and exactly-once settlement behavior.

### Phase H: Verification and documentation

- Run tests and build.
- Smoke-test major routes.
- Update architecture, route, backend-contract, and battle documents.
- Remove obsolete mock outcome code only after the real path is verified.
- Deliver a final implementation report.

## 21. Implementation Guardrails

ChatGPT Work must:

- Read `docs/game-design.md`, `docs/battle-design.md`, and this file in full before editing.
- Treat `docs/battle-design.md` as the battle-rule authority.
- Inventory current code before changing architecture.
- Preserve the canonical card renderer.
- Preserve authentication and ownership validation.
- Preserve duplicate reward protection.
- Avoid a broad unrelated refactor.
- Avoid adding new scattered patch files.
- Keep route files focused on screen composition.
- Keep combat logic independent of the DOM.
- Keep backend writes outside the pure engine.
- Keep one canonical encounter definition.
- Keep one canonical combat rules implementation.
- Use explicit versioning for stored battle rules and encounter data.
- Maintain internal `pow` compatibility while presenting ATK to players.
- Update documentation when routes, contracts, persistence, or architecture change.
- Stop and report only if a genuine contradiction in approved documents makes correct implementation impossible.

ChatGPT Work must not:

- Invent abilities.
- Add PvP.
- Add equipment or deep status systems.
- Rewrite the card data model unnecessarily.
- Trust client-submitted stats or outcomes.
- Calculate rewards in the browser.
- Use aggregate Squad Power as the final combat resolver.
- Hide a reinforcement damage penalty if one is adopted.
- grant a free attack immediately on lane victory.
- Add reflex mechanics.
- Require bespoke sprites.
- Balance away intended rarity excitement merely to make equal Squad Power totals produce equal outcomes.

## 22. Definition of Done

The battle implementation is not complete until all approved criteria below are satisfied.

### Engine

- One canonical seeded battle engine exists.
- Same seed and input reproduce identical results.
- All confirmed mechanics are covered by tests.
- Event replay reaches the stored final state.
- Batch simulation works without the DOM or reward writes.

### Player flow

- Player can inspect three enemy lanes.
- Player can select and order exactly three owned cards.
- Saved squads preserve left, center, and right order.
- Formation forecasts are available and non-guaranteed.
- Begin Battle commits exactly one attempt.
- The active battle animates the stored event log.
- Pause, inspect, 1×, 2×, reduced motion, and recovery work.
- Results show actual battle outcome and MVP.

### Backend integrity

- Server validates user, ownership, squad, encounter, and attempt.
- Server selects or controls the reward-bearing seed.
- Duplicate attempts do not duplicate rewards.
- Refresh and recovery do not reroll the battle.
- Gold, XP, and approved energy writes occur exactly once.
- Battle history contains enough versioned information to reproduce or audit the result.

### Quality

- `npm run build` passes.
- Automated battle tests pass.
- Major existing routes pass smoke testing.
- No player-facing `POW` label remains for ATK.
- No obsolete mock Power-comparison outcome remains on the active player path.
- No prototype-only admin or backend language remains in normal battle UI.
- Documentation is updated.
- Final report lists changed files, migrations, tests, simulator findings, unresolved risks, and intentionally deferred work.

## 23. Decisions to Resolve Next

The planning discussion should proceed in this order:

1. Final round-resolution contract.
2. Equal-SPD tie-break.
3. Damage precision, rounding, and minimum damage.
4. Equal-HP center reinforcement tie-break.
5. Exact Follow-Up meter charge equation.
6. Broader simulation plan and cross-lane damage decision.
7. Forecast model and category bands.
8. MVP scoring.
9. Daily Skirmish rewards, energy cost, failure cost, and reset behavior.
10. Active-battle route and settlement timing.
11. Complete screen-state and error-state specification.
12. Final Work handoff and implementation authorization.

## 24. Planning Decision Log

| Date | Status | Topic | Decision or direction | Implementation consequence |
| --- | --- | --- | --- | --- |
| 2026-07-10 | Confirmed process | Separate planning document | Battle design remains in `battle-design.md`; build planning lives here. | Work can follow a dedicated implementation contract without turning design rationale into code instructions. |
| 2026-07-10 | Current-code fact | Existing battle backend | Protected attempts, reward settlement, XP writes, Gold writes, and history already exist. | Replace the outcome model without discarding the settlement safeguards. |
| 2026-07-10 | Current-code fact | Existing outcome | Current frontend and backend resolve battle primarily through Effective Squad Power. | The real lane engine must replace, not sit beside, the current outcome rule. |
| 2026-07-10 | Leading proposal | Canonical core | Use one pure seeded battle core shared by simulation, tests, and backend resolution. | Prevents rule drift across player UI, server, forecast, and simulator. |
| 2026-07-10 | Leading proposal | Server authority | Resolve and persist reward-bearing battles at formation lock, then animate the stored result. | Supports refresh recovery and exactly-once progression. |
| 2026-07-10 | Leading proposal | Active route | Add a dedicated active-battle route between squad formation and results. | Prevents combat presentation from being embedded in the results screen. |
