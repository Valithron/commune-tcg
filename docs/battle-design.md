# Commune TCG Battle Design

Living design authority for the Commune TCG battle system on the `Gacha` branch.

This document defines what the battle system is, how it should feel, and what the player should experience. It contains confirmed rules, active test values, visual direction, encounter design, economy test values, deferred systems, and remaining balance-validation work.

This document does not authorize implementation by itself. Implementation is governed by `docs/battle-implementation-plan.md` and begins only when Sterling explicitly hands the approved plan to ChatGPT Work.

## Document Status

**Phase:** Battle design complete enough for implementation planning
**Current objective:** Build and validate the first complete 3-on-3 PvE battle loop
**Implementation status:** First complete 3-on-3 PvE build implemented on `Gacha`; balance findings remain subject to live validation
**Primary wider-game authority:** `docs/game-design.md`
**Implementation authority:** `docs/battle-implementation-plan.md`

### Design-state labels

- **Confirmed:** Approved rule or player-facing behavior.
- **Active test value:** Approved for the first build and simulator pass, but still tunable.
- **Validation required:** Implement as configurable and test before treating the value as final balance.
- **Deferred:** Deliberately outside the first complete battle build.
- **Rejected:** Deliberately excluded unless later evidence justifies reopening it.

## 1. Relationship to the Main Game Design

`docs/game-design.md` governs the wider product, card model, rarity, types, progression, collection, and economy. This document governs battle-specific mechanics and presentation.

When the documents overlap:

1. Confirmed wider-game rules in `game-design.md` remain authoritative unless intentionally revised here.
2. Battle-specific mechanics and visual behavior live here.
3. Any battle decision that materially changes the wider economy or permanent card model should also be reflected in `game-design.md`.
4. The implementation plan may explain how to build a rule, but it must not invent or revise the rule.

## 2. Product Direction

### Product and session shape

- Commune TCG is a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social or anime-themed worldbuilding.
- It is not intended to become a deep competitive tabletop TCG.
- The target audience is casual-to-midcore.
- A normal daily session should take roughly 5 to 10 minutes, with optional longer play.
- Ordinary battles should generally fit within roughly 30 to 60 seconds.
- Battle supports the collection fantasy rather than replacing it.
- Casual players should be able to use favorite cards, while strategic players gain meaningful advantages from squad selection and formation.

### Squad and card inputs

- A battle squad contains exactly 3 cards for the first complete battle system.
- The first combat model uses ATK, DEF, SPD, Type, rarity, and level.
- A card's role emerges from its stats, type, rarity, level, and later abilities rather than a rigid stored class.
- Every card in the active squad receives the full approved battle XP amount unless the encounter explicitly states otherwise.

### Initial encounter scope

- Daily Skirmish
- Curated Challenge encounters
- Seasonal Boss encounters

User PvP remains a possible future system, not a requirement for the first battle build.

### Current types

- Flame
- Tide
- Bloom
- Volt
- Shadow
- Radiant
- Neutral

Type biases stat distribution without increasing total stat budget by itself.

### Deferred systems

The first complete battle build does not depend on:

- Card abilities
- Physical and Mystic damage categories
- Separate physical or magical attack and defense stats
- Evolution
- PvP
- Trading
- Equipment
- Deep classes
- Deep status systems
- Manual basic-attack targeting
- Reflex or timing mechanics
- Bespoke battle sprites
- Penetrate, trample, damage spillover, or overkill transfer
- Random ordinary misses

## 3. Battle Design Goals

### Make collected cards feel alive

Battle should turn a card from an image and stat block into a recognizable combatant that the player develops, favors, and remembers.

### Reward preparation without demanding constant input

The player should not command every basic attack. The primary ordinary-battle skill expression is choosing cards and arranging left, center, and right lanes before combat.

### Preserve favorite-card viability

Type, rarity, level, and optimization should matter without making a favorite card automatically unusable whenever it is not mathematically ideal.

### Preserve suspense without letting luck dominate

Good preparation should strongly improve expected outcomes. Controlled randomness should create crits, low-HP survival, close ties, and occasional upsets without routinely defeating superior preparation.

### Keep outcomes legible

Players should understand why a card acted first, hit hard, survived, won a lane, reinforced, or earned MVP.

### Respect production scope

The battle system must work with existing card artwork and the canonical card renderer. It must not require unique combat sprites for every card.

## 4. Failure Conditions to Avoid

The first battle model is unsuccessful if it becomes primarily any of the following:

- A static Squad Power comparison with decorative animation
- A long chain of obvious manual commands
- A system where routine progression demands constant attention
- A system where SPD permanently dominates ATK and DEF
- A system where DEF creates tedious deadlocks
- A system where type disadvantage invalidates favorite cards
- A system where randomness overwhelms preparation
- A system that cannot be understood without reading logs
- A system requiring bespoke character sprites
- A system too elaborate to simulate and balance
- A presentation where every hit receives maximum emphasis
- A formation system where one ace makes both support slots decorative
- A battle UI too crowded to read on a portrait mobile screen

## 5. Core Stat Identities

### ATK

Primary identity: larger outgoing hits.

- ATK determines raw basic-attack damage.
- High-ATK cards naturally produce larger critical hits because crits multiply the underlying hit.
- ATK does not independently raise crit chance.

Player fantasy:

> This card hits hard.

### DEF

Primary identity: continuous incoming-damage mitigation.

- DEF reduces every incoming damaging hit through diminishing returns.
- DEF does not increase maximum HP in the first build.
- DEF does not use flat `ATK - DEF` subtraction.
- DEF does not inherently create random block events.

Player fantasy:

> This card is difficult to bring down.

### SPD

Primary identity: tempo.

- SPD determines initiative order.
- SPD specialization modestly raises critical-hit chance.
- Genuine SPD specialists can earn Double-Strikes.
- SPD increases impactful moments rather than the size of each hit.

Player fantasy:

> This card acts first and creates clutch speed moments.

### Power

- **Power**, or compact **PWR**, means ATK + DEF + SPD for one card.
- **Squad Power** means the total Power of the three selected cards.
- **Effective Power** or **Matchup Power** is a temporary encounter-adjusted estimate.
- Power is not damage and is not directly inserted into combat formulas.
- Equal Squad Power does not guarantee equal battle strength because stat concentration, formation, initiative, and reinforcement matter.
- Existing stored offensive keys may remain `pow`, but player-facing battle text uses `ATK`.

## 6. Confirmed First-Test Combat Package

These are active first-build values. They must be centralized and versioned so simulation can tune them without rule duplication.

### Maximum HP

```text
Max HP = 240 + (Level - 1) × 5
```

Rules:

- All normal cards use this formula in the first build.
- Rarity does not add hidden HP.
- DEF does not create maximum HP.
- Bosses may later use separate HP rules.

### Raw damage

```text
Raw Damage = 20 + ATK × 2.5
```

### DEF mitigation

```text
Damage After DEF = Raw Damage × 40 / (40 + DEF)
```

The armor constant is `40` for the first test.

### Type modifier

- Advantage: `×1.08`
- Disadvantage: `×0.97`
- Neutral: `×1.00`

### Type chart

| Attacker ↓ / Defender → | Flame | Tide | Bloom | Volt | Shadow | Radiant | Neutral |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Flame** | = | - | + | = | + | - | = |
| **Tide** | + | = | - | - | = | + | = |
| **Bloom** | - | + | = | + | - | = | = |
| **Volt** | = | + | - | = | - | + | = |
| **Shadow** | - | = | + | + | = | - | = |
| **Radiant** | + | - | = | - | + | = | = |
| **Neutral** | = | = | = | = | = | = | = |

Legend:

- `+` uses `×1.08`.
- `-` uses `×0.97`.
- `=` uses `×1.00`.

### Normal damage variance

```text
Random Variance = ×0.95 to ×1.05
```

The interface does not need to announce ordinary variance.

### Critical hits

- Base crit chance: `5%`
- Maximum normal crit chance: `10%`
- Crit multiplier: `×1.5`

```text
Average Non-SPD Stat = (ATK + DEF) / 2
SPD Specialization = max(0, SPD / Average Non-SPD Stat - 1)
Crit Bonus = min(5%, SPD Specialization × 10%)
Crit Chance = 5% + Crit Bonus
```

### Final normal-hit calculation

```text
Calculated Damage =
(20 + ATK × 2.5)
× [40 / (40 + defender DEF)]
× Type Modifier
× Random Variance
× 1.5 if critical
```

Confirmed precision rules:

1. Keep full precision through the complete calculation.
2. Round the final calculated result once to the nearest whole number.
3. A successful damaging hit deals at least 1 damage.
4. Remaining HP cannot fall below 0.
5. The displayed damage number shows the full calculated integer, including overkill.
6. Applied damage for analytics and MVP is capped at the target's remaining HP before the hit.
7. Normal attacks do not randomly miss.
8. Explicit future effects such as Dodge, Immunity, or Barrier may create a miss or zero-damage result, but ordinary attacks cannot.

## 7. Round and Turn Resolution

### Round visibility

- Combat proceeds in discrete rounds.
- The ordinary battlefield presentation does not foreground round numbers.
- Round numbers appear in battle logs and debugging tools.

### Start-of-round snapshot

At the start of each round:

1. Read every living card's current SPD after buffs or debuffs already active at that moment.
2. Build the complete action order from highest SPD to lowest SPD.
3. Resolve equal-SPD ties through seeded random priority for that round.
4. Snapshot the order for the entire round.

Mid-round SPD changes affect the next round. They do not reorder the current round.

### Equal-SPD tie behavior

- Equal-SPD priority is resolved independently each round.
- The tie result comes from the battle's seeded RNG.
- The same inputs and seed reproduce the same tie results.
- One side does not receive permanent tie preference for the entire battle.

### Scheduled actions and death

- Every living card is scheduled for one normal turn when the round begins.
- A card acts only if it is still alive when its scheduled turn arrives.
- A faster knockout cancels the defeated card's pending turn.
- A defeated card is removed from legal targeting and future turn eligibility immediately.
- There is no finish-the-round-before-dying behavior.

### Retargeting before an action

If a card's intended target was defeated before its scheduled turn:

- The card finds the next legal enemy and attacks.
- Allied assistance must not cause the card to waste its turn.
- A living card does not idle while a legal enemy exists unless a future explicit status effect prevents acting.

### Battle end

- The battle ends immediately when the final enemy on either side reaches 0 HP.
- Remaining scheduled actions in that round do not resolve.
- No attacks target an empty battlefield.

## 8. Battlefield and Targeting Rules

### Field

- Three player cards face three enemy cards.
- All six cards are active from the beginning.
- Lanes are left, center, and right.
- Cards remain upright on both sides.

### Formation

- The player selects and orders exactly three owned eligible cards before combat.
- Formation locks when battle begins.
- The player cannot swap lanes during ordinary combat.

### Home-lane targeting

- Left attacks left, center attacks center, and right attacks right while the opposing home-lane card remains alive.
- A card cannot choose a different target while its home-lane enemy remains alive.

### Natural reinforcement

When a card defeats its home-lane opponent:

- The winner remains active at current HP.
- It receives no immediate free attack, bonus turn, stat transfer, or merge.
- It begins cross-lane reinforcement on its next scheduled normal turn.
- The allied card already fighting in that lane continues acting normally.
- The result is a natural 2-on-1 produced by separate cards using their own turns.

### Side-lane routing

- A left or right lane winner attacks center next if center remains occupied.
- If center is already empty, it attacks the remaining legal enemy.
- Once only one enemy remains, every living opposing card targets that enemy on its scheduled turn.

### Center routing

If the center card wins while both side enemies remain alive:

1. Compare the current HP percentages of the two allied side cards.
2. Reinforce the side containing the allied card with the lower HP percentage.
3. If allied HP percentages are exactly tied, target the side enemy with the lower current HP percentage.
4. If enemy HP percentages are also exactly tied, use seeded randomness.

### Reinforcement cues

- No persistent arrow, path, or UI marker is required to show where a card will reinforce.
- Cross-lane intent should read naturally when the attack motion occurs.
- The first cross-lane attack may use a diagonal type-colored trail, but no standing reinforcement indicator remains afterward.

### Cross-lane damage validation

Cross-lane damage is configurable for simulator testing:

- `100%`: current control and default first implementation value
- `85%`: mild Assist Attack tax candidate
- `70%`: strong Assist Attack tax candidate

The first implementation defaults to 100% unless reproducible simulation demonstrates excessive ace snowballing. Any adopted reduction must be visible and explainable. It must never be a hidden penalty.

## 9. Double-Strike

**Double-Strike** is the player-facing term for the SPD-specialist extra strike. Do not use `Follow-Up` in normal player-facing UI.

### Eligibility

A normal card qualifies when:

```text
SPD is at least 15% higher than ATK
and
SPD is at least 15% higher than DEF
```

This is a relative profile check, not an absolute SPD requirement.

### Starting state

- Eligible cards begin ordinary battles at 0 charge.
- Future abilities may begin partially charged.
- Non-eligible cards display no Double-Strike meter.

### Charge timing

- Charge is added at the beginning of the eligible card's scheduled turn.
- A card defeated before its scheduled turn gains no charge that round.
- Meter charge carries through lane victory and reinforcement.
- Excess charge above the threshold carries over after the strike.
- Maximum one Double-Strike can occur per round.
- A Double-Strike cannot generate another Double-Strike.

### First-test charge tiers

The meter threshold is 100 charge.

| SPD relationship | Charge per scheduled turn | Normal trigger pace |
| --- | ---: | ---: |
| SPD 15% to 24% above both ATK and DEF | 17 | About every 6 turns |
| SPD 25% to 39% above both | 20 | Every 5 turns |
| SPD 40% to 54% above both | 25 | Every 4 turns |
| SPD 55% or more above both | 34 | About every 3 turns |

These are active test values and must be simulator-configurable.

### Strike resolution

When the meter is full during the card's normal turn:

1. The normal attack resolves first.
2. If the original target survives and remains legal, the meter spends 100 charge.
3. The card immediately performs Double-Strike against that target.

```text
Double-Strike Damage = 30% of the equivalent normal calculated hit
```

Rules:

- It cannot crit.
- It uses normal type, DEF, and ±5% variance calculations.
- It cannot be manually redirected.
- It does not grant another normal action.
- If the normal attack defeats the lane opponent, Double-Strike does not retarget.
- In that case, the full meter remains stored for the card's next scheduled turn.
- A full-strength second normal attack remains rejected because action denial made SPD too dominant.

## 10. Combat Pacing Targets

### Comparable lane target

A neutral duel between comparable cards should generally require:

```text
5 to 7 normal attacks to defeat one card
```

### Expected mismatch behavior

| Matchup | Expected lane result |
| --- | --- |
| Comparable cards, neutral type | About 5 to 7 attacks |
| Moderate stat or rarity advantage | About 4 to 6 attacks |
| Strong advantage plus favorable type | About 3 to 4 attacks |
| Extreme rarity, level, and type mismatch | Potentially 2 to 3 attacks |

The system should not artificially protect weak cards from obvious mismatches. A Legendary Tide card should decisively defeat a Common Flame card.

### Full battle target

- Ordinary battles should generally resolve in roughly 7 to 8 rounds under representative conditions.
- The player-facing presentation should generally last roughly 30 to 60 seconds at 1×.
- Exact duration and win-rate claims must come from the reproducible simulator.

## 11. Confirmed Formation Findings

The first representative 3-on-3 pass established the following qualitative conclusions:

- Formation materially changes outcomes.
- Center has distinct strategic value but is not automatically the best slot for the strongest card.
- Matchup routing matters more than placing the strongest card in center by default.
- The first lane winner often becomes a major outcome driver.
- Reinforcement can overturn the apparent result of isolated lane forecasts.
- Concentrated ace power is more valuable than the same Squad Power distributed evenly.
- Ace carry is desirable, but support slots must remain consequential.
- Type modifiers are not the primary source of observed imbalance.
- Precise win rates remain noncanonical until regenerated by a reproducible simulator.

## 12. Formation Forecasts

### Player-facing labels

- **Favored:** estimated isolated-lane win chance of 65% or greater
- **Even:** estimated isolated-lane win chance of 36% to 64%
- **Risky:** estimated isolated-lane win chance of 35% or lower

### Forecast method

- Forecasts use repeated isolated-lane simulations from the canonical battle engine.
- They use the same card stats, damage rules, initiative, crit, type, variance, and Double-Strike rules as combat.
- They do not include cross-lane reinforcement.
- The player sees the category, not the exact percentage.
- The formation screen states that lane forecasts do not include reinforcement.
- Forecast labels are non-guaranteed.
- Three lane labels must not be presented as three independent votes for the final battle result.

A future squad-level observation may explain reinforcement pressure, but it is not required for the first complete implementation.

## 13. Battle MVP

Every completed victory showcases one Battle MVP.

MVP uses a versioned weighted contribution model that considers:

- Actual HP removed, excluding wasted overkill
- Knockouts
- Winning the first lane
- Winning any lane
- Cross-lane reinforcement contribution
- Final knockout
- Survival
- Critically low-HP survival
- Double-Strikes
- Other approved decisive contributions

The simulator should tune initial weights so the system does not simply select the highest-Power card or highest raw-damage card every time.

The results screen explains the choice in one concise line, for example:

> **Battle MVP: Mermilf**
> Won the first lane and dealt the most reinforcement damage.

Defeats do not require an MVP in the first version.

## 14. Battle Hub and Encounter Flow

Initial Battle Hub modes:

- **Daily Skirmish:** repeatable card XP and ordinary resources
- **Challenge:** stronger curated formation puzzles
- **Seasonal Boss:** time-limited major encounters

The first Battle Hub does not require a level map.

### Separate screens

Encounter selection and squad formation are separate screens.

The encounter screen answers:

> Do I want to fight this encounter?

The formation screen answers:

> How should I arrange my squad?

### Encounter preview content

The encounter preview shows:

- Encounter name
- Difficulty
- Background or enemy-group art
- Three enemy cards in left, center, and right order
- Enemy Squad Power
- Recommended Power range
- Energy cost
- Base rewards
- Visible special rule, when present
- `Prepare Squad` action

Lane forecasts do not appear until the player's formation exists.

### Formation screen

The formation screen shows:

1. Encounter name and compact rule summary
2. Enemy left, center, and right row
3. One forecast position per lane
4. Player left, center, and right slots
5. Selected-squad controls
6. Searchable and filterable Vault card list
7. Squad Power
8. `Begin Battle`

Interactions:

- Tap an empty slot and then tap a Vault card to place it.
- Tap occupied slots to swap.
- Support drag-and-drop where reliable, but do not require dragging.
- Tap a card to inspect it.
- Save the ordered left, center, and right formation.
- Search and filter by type and rarity.
- Sort by Power, level, recent, or favorite.

## 15. Battle Creation and Commitment

When the player presses `Begin Battle`:

1. Validate the signed-in player, encounter, formation, ownership, eligibility, and Energy.
2. Lock the formation.
3. Spend 1 Energy only after the server can successfully create the battle attempt.
4. Generate or select the authoritative seed.
5. Resolve and store the complete battle as a pending attempt.
6. Enter the full-screen battlefield.
7. Animate the stored event log.

If validation or attempt creation fails, the player remains on formation and Energy is not spent.

Victory, defeat, retreat, and skipping animation all consume the committed Energy.

## 16. Full-Screen Battlefield Layout

### Full-screen mode

- The active battlefield occupies the full screen.
- Normal app navigation, Vault, Library, Pull, top-level tabs, and other app UI are hidden.
- Exit is available only through the pause menu.

### Visual personality

Use a hybrid style:

- Calm, elegant, readable card battlefield during ordinary action
- Stronger anime-style emphasis for crits, Double-Strikes, lane victories, final knockouts, and results

### Background

- Use a reusable darkened arena foundation.
- Layer encounter-specific art, color, or environmental treatment behind it.
- Preserve card and HP readability over background spectacle.

### Card treatment

- Mobile uses the existing battle thumbnail-size card treatment or a deliberate extension of it.
- Preserve card art, rarity frame, type, level, HP, and Double-Strike meter where relevant.
- Do not show permanent card names on the compact mobile battlefield.
- Desktop may use larger cards and a wider layout later.
- Enemy cards remain upright, not rotated or upside down.

### 3-over-3 structure

```text
Enemy Left       Enemy Center       Enemy Right

            central combat space

Player Left      Player Center      Player Right
```

Lanes are implied by placement and attack motion. Do not use strong permanent lane borders.

### HP placement

- Enemy HP bars sit below enemy cards, facing inward.
- Player HP bars sit above player cards, facing inward.
- The battlefield normally shows bars without exact fractions.
- Exact current and maximum HP appear in inspection.

### Idle state

- Active combat may use very subtle glow, shimmer, or idle movement.
- Paused combat freezes completely.
- Reduced-motion mode removes or greatly limits idle movement.

## 17. Battle Controls and Inspection

### Persistent controls

A compact control cluster provides:

- Pause
- `1× / 2×` speed

Sound, logs, reduced motion, and retreat live inside pause rather than permanently occupying the battlefield.

### Pause menu

Pause freezes:

- Event playback
- Card movement
- Damage numbers
- Camera effects
- Timers
- Idle motion

The pause interface must not cover the battlefield cards. Cards remain selectable for inspection while paused.

Pause options:

- Resume
- Battle speed
- Sound
- Battle log
- Reduced Motion
- Retreat / Exit

### Card inspection while running

- Tapping a card opens an expanded inspection view.
- Opening inspection does not pause combat.
- Combat continues behind the panel.
- The inspection panel blocks accidental taps through to the battlefield.
- Pause remains accessible while inspection is open.
- Inspection shows a snapshot taken when the panel opens.
- Snapshot HP and status values do not update live.
- Closing and reopening refreshes the snapshot.

### Inspection layout

Mobile:

- Prioritize the full collectible card.
- Place a compact battle-information strip beneath it.

Desktop:

- Use a split view with large card presentation and battle information beside it.

Inspection may show:

- Full card
- Snapshot current and maximum HP
- ATK, DEF, and SPD
- Type relationship against current target
- Current crit chance
- Double-Strike eligibility and meter
- Active encounter modifiers
- Active buffs and debuffs when those systems exist

## 18. Battle Presentation and Timing

### Opening sequence

Target duration: roughly 2 to 3 seconds at 1×.

1. Encounter background fades in.
2. Enemy cards settle into the upper row.
3. Player cards rise into the lower row.
4. `FORMATION LOCKED` appears briefly.
5. `BATTLE START` appears briefly.
6. The first attack begins.

Reduced motion uses quick fades and minimal travel.

### Normal attack

Target duration at 1×: roughly 0.7 to 0.9 seconds per attack.

1. The attacker performs a small lean, lift, or forward lunge.
2. A simple trail or impact uses the attacker's type color.
3. The target jolts locally.
4. The damage number appears.
5. The HP bar drains.
6. The attacker returns to position.

Normal attacks do not use elaborate flames, water, lightning, vines, or similar elemental effects. Elaborate effects are reserved for future abilities.

At 2×, timing compresses while crits, Double-Strikes, lane victories, and final knockouts remain readable.

### Damage numbers

- The main number remains bright and legible.
- A glow, outline, slash, or accent uses the attacker's type color.
- The number drifts slightly upward.
- It fades before the next attack in that area.
- Old numbers do not pile up.
- Critical and Double-Strike labels may linger slightly longer.
- The number shows full calculated damage, including overkill.

### Critical hit

- Brief hit-stop
- Stronger local target shake
- Small camera punch-in
- Larger damage number
- `CRITICAL`
- Sharper impact sound
- No default full-screen flash

A critical hit feels stronger than a normal attack but less important than lane victory or the final knockout.

### Double-Strike presentation

1. The normal attack lands.
2. A very brief pause occurs.
3. The meter flashes and spends charge.
4. `DOUBLE-STRIKE` appears near the attacker.
5. A faster second lunge or trail lands.
6. A smaller secondary damage number appears.

If the normal attack defeats the lane opponent, Double-Strike does not trigger and the full meter remains stored.

### Low HP

Below 25% HP:

- The HP bar pulses subtly.
- The card gains a faint local danger edge or vignette.
- No constant screen shake or repeating alarm is used.
- The animated warning freezes while paused.
- Reduced motion uses a static warning edge.

### Defeat and lane victory

When a card reaches 0 HP:

1. HP empties immediately.
2. The card jolts and briefly desaturates.
3. The frame cracks, fragments, dissolves, fades, or drops out.
4. The defeated card leaves an empty slot.
5. The lane connection visually breaks.
6. The winner receives a brief `LANE WON` pulse.

The remaining cards do not collapse inward. No persistent reinforcement arrow appears.

### Battle end

1. The final knockout receives the strongest impact treatment.
2. Remaining cards hold position.
3. The background darkens slightly.
4. `VICTORY` or `DEFEAT` appears.
5. On victory, the MVP card receives a brief highlight.
6. The player may tap to continue early, or the game advances after a short pause.

Defeat does not require an MVP highlight.

## 19. Recovery, Connectivity, and Retreat

### Refresh or app interruption

The server result is resolved and stored before animation begins.

Returning to an unfinished pending attempt shows:

- `Resume Battle`
- `Skip to Results`

Resume continues from the nearest locally stored event checkpoint. If no checkpoint exists, replay may begin from the start. The battle never rerolls.

### Connection loss

- If the server created the attempt, the result and Energy commitment remain safe.
- The client reconnects and then offers Resume or Skip to Results.
- If the server never created the attempt, no result, rewards, or Energy cost is committed.

### Playback failure

- The server result always wins.
- If playback fails or desynchronizes, stop the animation.
- Show a clear interruption message.
- Proceed to results.
- Rewards never depend on animation completing.

### Retreat

- Retreat is available through pause.
- Retreat converts the pending attempt into a defeat.
- Retreat grants the normal reduced defeat rewards.
- Energy remains spent.
- Retreat cannot be used for a free reroll.

## 20. Reduced Motion and Accessibility

Reduced Motion is accessible from the pause menu and should respect a saved preference.

Reduced-motion behavior:

- Cards fade or shift slightly instead of lunging.
- No camera zoom.
- No shake.
- No idle floating.
- Damage numbers move minimally.
- Crit, Double-Strike, lane victory, and final knockout use labels, contrast, and color emphasis instead of heavy motion.
- Combat timing remains similar so accessibility does not create a speed advantage.

General accessibility:

- Never communicate Favored, Even, Risky, type advantage, or low HP through color alone.
- Important information must remain understandable without sound.
- Keep positions stable.
- Keep damage and HP legible at 2×.
- Use large mobile targets for cards and controls.
- Preserve readable contrast over encounter backgrounds.

## 21. Results and Reward Presentation

### Results structure

1. Victory or Defeat heading
2. MVP on victory
3. Short battle summary
4. Gold and other currencies
5. XP for all three cards
6. Individual XP progress
7. Level-up moments
8. Optional battle highlights
9. Final action choices

Actions:

- `Battle Again`
- `Edit Formation`
- `Choose Encounter`
- `Battle Hub`

### Automatic reward queue

Routine results do not require a manual `Reveal Rewards` button.

Rewards present automatically in a short succession:

1. Gold and ordinary currency
2. Special drops, when applicable
3. XP for each card
4. Individual level-ups
5. Later unlocks or milestones

Interaction:

- Tapping the active presentation advances to the next queued item.
- `Skip All` jumps to the complete results summary.
- Rare future drops may receive stronger staging than routine Gold and XP.
- Reward writes remain protected and exactly once regardless of presentation skips.

## 22. Daily Skirmish 01: Crossroads Patrol

### Purpose

Teach forecasts, formation lock, first lane victory, and natural reinforcement without abilities.

### Identity

- Mode: Daily Skirmish
- Name: Crossroads Patrol
- Recommended Squad Power: approximately 90 to 110
- Energy cost: 1
- Expected battle length: approximately 30 to 45 seconds at 1×
- Repeatable: yes
- First-victory bonus: once per daily reset

### Enemy formation

**Left**

- Flame Common
- Moderate ATK
- Low DEF
- Average SPD

**Center**

- Neutral Uncommon
- Balanced stats

**Right**

- Shadow Common
- Higher DEF
- Lower SPD

### Encounter rule

No hidden stat modifier.

Visible teaching text:

> First lane winners reinforce adjacent lanes on their next turn.

### Active reward test values

**Victory**

- 20 Gold
- 18 XP to each squad card

**First victory of the day**

- Additional 40 Gold
- Additional 12 XP to each squad card

**Defeat or retreat**

- No Gold
- 25% of normal XP, rounded to a whole number

Do not add shards until a real shard system exists.

Validation required:

- Compare 18 XP and the +12 first-win XP against the actual level-up curve.
- Confirm that Daily Skirmish progression is meaningful without trivializing levels.
- Keep these values configurable until that test is complete.

## 23. Server-Authoritative Attempt Lifecycle

The player experience requires two distinct concepts: stored battle result and finalized reward outcome.

### Create pending attempt

On `Begin Battle`:

1. Validate all inputs.
2. Spend Energy atomically with successful attempt creation.
3. Resolve the seeded battle.
4. Store the complete authoritative result as pending.
5. Return the event log for presentation.

### Finalize

- Completing playback or selecting `Skip to Results` finalizes the stored victory or defeat and applies rewards exactly once.
- Retreat finalizes the attempt as surrendered and applies defeat rewards.
- Refresh or disconnection leaves the attempt pending and recoverable.
- Playback failure skips to results and finalizes the stored outcome.
- Duplicate requests never duplicate Energy cost or rewards.

## 24. Validation Requirements Before Balance Lock

The reproducible simulator must test:

- Balanced squads
- Ace plus two weak cards versus three medium cards
- ATK-heavy squads
- DEF-heavy squads
- Genuine SPD specialists
- Higher-level and mixed-level squads
- Type-matchup distributions
- All formation permutations
- Equal-SPD ties across many seeds
- Double-Strike frequencies by tier
- 100%, 85%, and 70% cross-lane damage
- Forecast-category calibration
- MVP frequency and explanation quality
- Crossroads Patrol XP against level requirements
- Battle duration at 1× and 2×

The default first implementation remains 100% cross-lane damage unless the simulator demonstrates unhealthy snowballing.

## 25. Rejected Directions

- Do not rebalance a Legendary merely because it defeats Commons decisively.
- Do not increase type punishment to counter rarity concentration.
- Do not give losing lanes artificial survival protection.
- Do not remove reinforcement after one narrow sample.
- Do not normalize squads by Squad Power during combat.
- Do not grant a free attack on lane victory.
- Do not weaken base damage to solve reinforcement concerns.
- Do not treat three lane forecasts as independent votes.
- Do not publish precise win rates without reproducible simulation.
- Do not add random ordinary misses.
- Do not allow Double-Strike to retarget after its normal attack wins the lane.
- Do not add overkill spillover in the first build.
- Do not use persistent reinforcement arrows.
- Do not pause combat merely because the player opens card inspection.
- Do not require manual reward reveal for routine Gold and XP.

## 26. Deferred Questions

These do not block the first complete battle implementation:

1. Should SPD later affect dodge, accuracy, or anti-dodge?
2. Should bosses use ordinary three-lane structure or deliberately break it?
3. Is prebattle formation enough agency after real playtesting?
4. When should auto-repeat, quick resolution, or sweep unlock?
5. Should a squad-level reinforcement observation join lane forecasts?
6. Should forecasts later surface projected first-break timing?
7. What rewards define later Challenge and Seasonal Boss encounters?
8. When do abilities, healing, barriers, and deeper statuses enter battle?
9. Should defeats later showcase a Standout Card?
10. Should special effects be permitted to start Double-Strike partially charged?

## 27. Decision Log

| Date | Status | Topic | Decision |
| --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Round snapshot | Turn order is calculated once at round start from current SPD. Mid-round SPD changes apply next round. |
| 2026-07-10 | Confirmed | Equal SPD | Seeded priority is rerolled independently each round. |
| 2026-07-10 | Confirmed | Knockout timing | A card killed before its turn loses that turn and is removed immediately. |
| 2026-07-10 | Confirmed | Retargeting | A living card finds another legal target rather than wasting its scheduled turn. |
| 2026-07-10 | Confirmed | Damage precision | Calculate at full precision, round once to nearest integer, and enforce minimum 1 successful damage. |
| 2026-07-10 | Confirmed | Misses | Ordinary attacks do not miss. |
| 2026-07-10 | Confirmed | Overkill | Show full calculated damage, but cap applied contribution at remaining HP. |
| 2026-07-10 | Confirmed | Reinforcement timing | Lane winners reinforce on their next scheduled normal turn, never immediately. |
| 2026-07-10 | Confirmed | Center tie | Equal allied HP uses lower enemy HP, then seeded randomness if still tied. |
| 2026-07-10 | Confirmed | Double-Strike | Automatic tiered meter, 0 starting charge, overflow retained, 30% strike, no retarget after lane kill. |
| 2026-07-10 | Confirmed | Visual style | Hybrid readable card board with anime-style emphasis reserved for major moments. |
| 2026-07-10 | Confirmed | Mobile field | Upright 3-over-3 thumbnail cards, inward HP bars, implied lanes, hidden compact names. |
| 2026-07-10 | Confirmed | Inspection | Opening inspection does not pause battle and shows a snapshot, not live updates. |
| 2026-07-10 | Confirmed | Full-screen battle | Active combat hides normal app navigation; exit lives in pause. |
| 2026-07-10 | Confirmed | Recovery | Pending stored battles can resume or skip to results without rerolling. |
| 2026-07-10 | Confirmed | Retreat | Retreat consumes Energy and grants normal defeat rewards. |
| 2026-07-10 | Confirmed | Results | Routine rewards auto-present in sequence with tap-to-advance and Skip All. |
| 2026-07-10 | Validation required | Reinforcement damage | Implement 100%, 85%, and 70% configurability; default to 100% pending simulation. |
| 2026-07-10 | Active test value | Daily Skirmish | 1 Energy, 20 Gold, 18 XP per card, +40 Gold and +12 XP first daily victory, 25% XP on defeat. |

## 28. Next Step

The design discovery phase is complete for the first build.

Next actions:

1. Follow `docs/battle-implementation-plan.md`.
2. Build the canonical seeded engine and simulator first.
3. Validate reinforcement damage, forecast calibration, MVP weights, and XP pacing.
4. Implement the server-authoritative pending-attempt lifecycle.
5. Build the separate encounter, formation, full-screen battle, and results flows.
6. Complete recovery, accessibility, smoke testing, documentation, and final implementation report.
