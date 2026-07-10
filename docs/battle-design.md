# Commune TCG Battle Design

Living design document for the Commune TCG battle system on the `Gacha` branch.

This document records battle ideas, confirmed decisions, rejected directions, unresolved questions, and the reasoning behind major choices. It is a design document only. Nothing written here authorizes implementation unless Sterling explicitly requests implementation in a separate coding task.

## Document Status

**Phase:** Discovery and combat-model definition  
**Current objective:** Define the smallest battle system that is fun, readable, replayable, and expandable before writing combat code.  
**Implementation status:** Not authorized.  
**Primary related document:** `docs/game-design.md`

## Relationship to the Main Game Design

The main game-design document defines the wider collection, rarity, type, progression, economy, and product direction. This document narrows the discussion to battle.

When the documents overlap:

1. Confirmed rules in `game-design.md` remain authoritative unless intentionally revised.
2. Battle-specific detail should live here.
3. Any battle decision that changes the wider game economy or card model should also be reflected in `game-design.md`.
4. Unsettled ideas must be labeled as open, proposed, or rejected rather than written as settled rules.

## Inherited Confirmed Direction

The following battle constraints are already established by `game-design.md` and should be treated as the starting boundary for discussion.

### Product and Session Shape

- Commune TCG is a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social/anime-themed worldbuilding.
- It is not currently intended to become a deep competitive tabletop TCG.
- The target audience is casual-to-midcore.
- A normal daily session should take approximately 5 to 10 minutes, with optional longer play.
- Battles should support the collection fantasy rather than replace it.
- Casual players should not feel punished for using favorites, while strategic players should still gain meaningful advantages from good decisions.

### Squad and Card Inputs

- A battle squad contains 3 cards.
- The first combat model may use:
  - POW
  - DEF
  - SPD
  - Type
  - Native/current rarity
  - Level
- A card's battlefield role should emerge from its character, type, stats, rarity, and future abilities rather than a rigid stored class.
- Every card in the active battle squad should receive full battle XP in the first version.

### Encounter Scope

- Initial targets are PvE random enemies and seasonal bosses.
- User PvP is a possible future system, not a present requirement.
- Energy is intended to pace battle attempts.

### Type System

Current types:

- Flame
- Tide
- Bloom
- Volt
- Shadow
- Radiant
- Neutral

Current matchup target:

- Advantage: +15% effectiveness
- Disadvantage: -5% effectiveness
- Neutral: no modifier

Type is also intended to bias the distribution of POW, DEF, and SPD without increasing the card's total stat budget by itself.

### Deliberately Deferred Systems

The first testable battle model should not depend on:

- Card abilities
- Physical and Mystic damage categories
- Separate physical or magical attack/defense stats
- Evolution
- PvP
- Trading
- Deep class or role systems

These can be reconsidered only after the base combat spine proves enjoyable and understandable.

## Battle Design Goals

These goals guide decisions but are not yet mathematical specifications.

### 1. Make collected cards feel alive

Battle should turn a card from an image and stat block into a character the player recognizes, favors, develops, and remembers using.

### 2. Produce meaningful decisions quickly

A short battle should still contain at least one decision that can materially improve or worsen the outcome. The system should not merely calculate which squad has the larger number.

### 3. Preserve favorite-card viability

Type advantages, optimization, and rarity should matter, but they should not make a beloved card unusable whenever it is not mathematically ideal.

### 4. Make outcomes legible

Players should understand why they won, lost, dealt strong damage, survived, or acted first. Hidden calculations should not make the result feel arbitrary.

### 5. Reward preparation without eliminating suspense

Squad building, leveling, and matchup knowledge should improve expected performance. Some controlled uncertainty should preserve drama and replayability.

### 6. Support future depth without requiring it now

The base structure should leave clean room for abilities, status effects, boss mechanics, damage tags, items, and synergy systems later.

### 7. Respect development scope

The first version should be small enough to implement, simulate, tune, explain, and replace if testing exposes a bad foundation.

### 8. Support both progression play and challenge play

Routine battles should allow low-friction card leveling and resource progression. Difficult encounters should reward correct squad construction, matchup reading, and well-timed decisions. A player who is not pushing the edge of the roster should still have fun, but cutting-edge content should not be reliably defeated through luck alone.

## Failure Conditions to Avoid

The first battle model should be considered unsuccessful if it becomes primarily any of the following:

- A static squad-power comparison with decorative animation
- A long sequence of choices whose optimal answer is obvious
- A system where speed permanently dominates every other stat
- A system where defense creates stalled or tedious fights
- A system where type disadvantage makes favorite cards functionally invalid
- A system whose result cannot be understood without reading a combat log
- A system where randomness overwhelms preparation
- A system where there is no reason to replay after the daily reward
- A system requiring abilities to become interesting
- A system too elaborate to balance against the current card pool
- A system requiring bespoke character sprites for every card variant
- A system where routine progression battles demand constant manual input

## Design Method

Each major topic should be recorded under one of four labels:

- **Confirmed:** Sterling has approved the rule as the current direction.
- **Proposed:** A serious candidate still under discussion.
- **Rejected:** Considered and intentionally declined, with reasoning preserved.
- **Open:** Not yet decided.

When a major rule is confirmed, record:

1. The rule.
2. The intended player experience.
3. The mechanical reason.
4. Known risks.
5. What would cause the rule to be reconsidered.

## First Discovery Findings

The first discussion established a clearer product shape even though the exact combat loop remains open.

### Confirmed experiential direction

- Battle began as a progression system for leveling collectible cards rather than the primary hinge of the entire product.
- Battle now needs enough intrinsic quality to support the collection loop instead of functioning as a disposable XP calculator.
- The visual field should show 3 player cards facing 3 enemy cards.
- Card art should remain the primary visual asset. The battle system must not require bespoke sprites for every outfit, theme, or card variant.
- Ordinary combat should target approximately 30 to 60 seconds of active battle time, excluding any pause for player decisions.
- Cards should have visible individual HP bars.
- Cards should have automatic basic attacks.
- Auto-play is required.
- Reflex or timing-meter mechanics are not desired.
- The system should support routine, lower-friction progression and genuinely difficult encounters.
- Desired emotional peaks include large attacks, critical-hit-like spikes, low-HP survival, pitched battles, decisive rollover victories or defeats after strong or poor preparation, difficult boss victories, and a beloved card producing a clutch moment.

### Directional preferences that are not yet confirmed mechanics

- The player should probably make fewer, higher-impact decisions rather than manually command every attack.
- Some form of target selection is likely useful.
- Previously cleared or routine content will probably need a faster repeat or sweep path, but the unlock and cost rules are open.
- SPD may contribute to evasion, but the role of accuracy and misses is not settled.
- The desired tone leans fast, satisfying, dramatic, and uncertain, but the exact balance between those qualities remains open.

### Production constraint

The breadth of AI-created card art makes sprite production and outfit-consistent character animation impractical. Presentation should therefore animate the cards and interface rather than recreate each illustrated character as a separate battle sprite.

Possible low-cost presentation tools include:

- Card lunges or short slides
- Scale pulses
- Impact flashes
- Screen shake
- Damage numbers
- HP-bar motion
- Type-colored trails
- Critical overlays
- Brief art zooms for major moments
- Defeat dimming, cracking, or shattering effects

These are presentation possibilities, not confirmed requirements.

## Open Design Areas

### A. Core Battle Fantasy

Open questions:

- Are the player and enemy cards three independent fighters, three fixed lanes, or two open squads?
- Should the three cards act in one shared sequence or resolve lane-by-lane?
- How much of the drama should come from squad preparation versus decisions made during battle?

### B. Player Interaction Model

Open questions:

- What sparse decisions remain available while basic attacks occur automatically?
- Does the player choose a focus target, a squad posture, a formation shift, a special trigger, or some combination?
- Is manual control continuous, limited to decision windows, or available only in challenge content?
- Can a player speed up, skip, or auto-resolve previously cleared content?

### C. Squad Structure and Positioning

Open questions:

- Are all three cards active and vulnerable at once?
- Are there three fixed opposing lanes?
- Can a card attack only its opposing lane unless redirected?
- Can players rearrange the squad before or during battle?
- Does a defeated card leave the field permanently for that encounter?
- Can one card protect another without a formal ability system?

### D. Turn and Round Structure

Open questions:

- Does SPD determine a fixed action order, fill an action meter, affect initiative only, or modify another system?
- Do teams alternate actions or can a fast card act multiple times?
- How is a tie resolved?
- Should turns be deterministic after combat begins or rerolled each round?
- How many rounds should an ordinary fight usually last?

### E. Meaning of POW, DEF, and SPD

Open questions:

- Does POW directly determine damage, contest DEF, or generate a shared attack value?
- Does DEF reduce incoming damage, determine maximum HP, or do both in moderated amounts?
- Does SPD only control action order, or also accuracy, evasion, critical chance, or action frequency?
- Should the three stats remain equally valuable across common encounter types?

### F. Damage and Survival Model

Open questions:

- How is maximum HP derived for each card?
- Is damage deterministic with a narrow variance, or probability-based?
- Is there a minimum damage floor?
- Can attacks miss?
- Can attacks critically hit before abilities exist?
- Can defeated cards return during the same battle?
- Should damage persist between linked encounters or reset every fight?

### G. Targeting

Open questions:

- Player-selected focus target, individual card targets, automatic targeting, fixed lanes, or threat rules?
- Can all cards attack any enemy?
- Can multiple cards focus the same target?
- Does changing targets cost an action or happen freely?
- Does type advantage influence automatic target selection?
- How should auto-play behave when several targets are reasonable?

### H. Type Matchups in Actual Combat

Open questions:

- What does the +15% or -5% modify: outgoing damage, total effectiveness, hit outcome, defense, or a broader action score?
- Is type checked attacker-to-defender for every action or summarized at squad level?
- Can Neutral's stability compensate for having no advantage?
- Is the current matchup chart readable enough during a fast battle?
- How prominently should advantage and disadvantage be shown before committing to a target?

### I. Randomness and Drama

Open questions:

- What outcomes may vary: damage, initiative, targeting, criticals, blocks, enemy behavior, or rewards?
- How narrow should random damage variance be?
- Should the player see projected outcome ranges?
- Should bad luck protection exist inside battle?
- Can a weaker squad occasionally win without making strength feel meaningless?

### J. Enemy and Encounter Design

Open questions:

- Are normal enemies generated from collectible card templates, dedicated enemy templates, or abstract monsters?
- Do normal fights always use three enemies, or can bosses and special encounters break the 3-on-3 structure?
- Should enemies obey the same rules and stats as player cards?
- How is recommended squad power calculated and displayed?
- What distinguishes a new encounter besides larger numbers?

### K. Boss Design

Open questions:

- One large boss, a boss with adds, phases, or a sequence of enemies?
- Is a boss fought once, repeatedly over a season, or cooperatively by the community?
- Does damage persist across attempts?
- Are boss weaknesses static, rotating, discoverable, or partially hidden?
- What prevents a boss from being only a large health bar?
- Should the player receive partial rewards for progress without winning?

### L. Win, Loss, and Failure Cost

Open questions:

- What exactly constitutes victory?
- Is there a turn limit, time limit, survival objective, score target, or full defeat condition?
- What does the player lose on failure: energy, opportunity, nothing, or reduced rewards?
- Can the player retry immediately?
- Should failure teach a clear counter-strategy?

### M. Rewards and Progression

Open questions:

- How much XP should ordinary fights, difficult fights, and bosses award?
- How much gold should battle produce relative to passive systems and missions?
- Are rare drops tied to difficulty, first clears, streaks, or randomness?
- Does every squad card receive equal XP even when defeated?
- Should unused vault cards gain any passive experience?
- What makes an extra battle after daily obligations feel worthwhile?

### N. Energy and Play Cadence

Open questions:

- Does every battle cost energy?
- Do failures consume full energy?
- How quickly does energy regenerate?
- Is there a free practice mode?
- Can players earn energy through play without creating an infinite loop?
- Is the intended limit daily attempts, total minutes, reward efficiency, or all three?

### O. Difficulty and Scaling

Open questions:

- Fixed stages, account-scaled enemies, squad-scaled enemies, difficulty tiers, or a mixture?
- How should a new player and a veteran use the same content?
- Should enemy scaling respect the player's strongest cards or selected squad?
- How is overleveling rewarded without trivializing all content?
- Is there a reason to maintain multiple squads rather than one dominant trio?

### P. Presentation and Feedback

Open questions:

- Portrait or landscape battle screen?
- How should six cards be arranged without making the card art too small?
- What must be visible at a glance: HP, turn order, type, projected damage, target, or only essentials?
- Should the player be able to inspect the exact calculation after an action?
- How should victory, defeat, level-ups, drops, and rare rewards be staged?

### Q. Auto-Play and Repeat Play

Open questions:

- Is auto-play available immediately or unlocked after clearing a stage?
- Can cleared battles be instantly resolved?
- Does auto-play use a simple rule set or player-configured priorities?
- Should difficult content require manual play?
- How much repetitive play is acceptable before a sweep system becomes necessary?

### R. Future Expansion Hooks

These are not first-version requirements, but the base model should be evaluated for whether it could later support:

- Active and passive abilities
- Status effects
- Healing and shielding
- Taunt, guard, and protection
- Multi-target attacks
- Physical and Mystic attack tags
- Team and character synergies
- Line-themed bonuses
- Items or equipment
- Summons
- Phase-based bosses
- Cooperative community bosses
- Asynchronous PvP

## Confirmed Battle Decisions

### 3-on-3 card field

**Rule:** The primary battle presentation shows 3 player cards facing 3 enemy cards.

**Intended experience:** The player's collected cards visibly enter the field as a squad and confront an opposing squad.

**Mechanical reason:** This directly matches the accepted 3-card squad and creates readable individual matchups without requiring character sprites.

**Known risks:** Six full vertical cards may become visually cramped on mobile. The layout may need cropped battle-card views while preserving recognizable art.

**Reconsider if:** Mobile readability or target selection cannot be made clear with six cards on screen.

### Visible per-card HP

**Rule:** Each active card has an individual visible HP bar.

**Intended experience:** Players can read danger, survival, focus targets, and clutch low-health moments immediately.

**Mechanical reason:** Individual HP supports knockouts, target decisions, comeback drama, and later healing or protection mechanics.

**Known risks:** HP scaling must not make DEF redundant or produce excessively long battles.

**Reconsider if:** Per-card HP creates interface clutter or makes 30-to-60-second battles impossible to tune.

### Automatic basic attacks

**Rule:** Cards perform their basic attacks automatically rather than requiring the player to manually command every attack.

**Intended experience:** Combat keeps moving and remains suitable for routine progression play.

**Mechanical reason:** This reduces input burden and leaves room for a smaller number of meaningful tactical interventions.

**Known risks:** The battle can become passive if the remaining player decisions are weak or infrequent.

**Reconsider if:** Testing shows players feel like spectators rather than participants.

### Auto-play support

**Rule:** The battle system must support auto-play.

**Intended experience:** Routine leveling and repeated farming do not become chores.

**Mechanical reason:** Battle serves the collection and progression loop as well as challenge content.

**Known risks:** If auto-play is too optimal, manual play can feel pointless. If it is intentionally poor, it can feel insulting or wasteful.

**Reconsider if:** Never. The exact availability and intelligence may change, but some form of auto-play remains required.

### No reflex-timing mechanic

**Rule:** The base battle model should not use tap timing, reaction meters, or reflex-based execution.

**Intended experience:** Success comes from roster development, matchup understanding, and tactical choices rather than latency or dexterity.

**Mechanical reason:** Timing mechanics would conflict with auto-play, accessibility, and the low-friction progression role of battle.

**Known risks:** Removing execution skill increases pressure on targeting, preparation, and encounter design to provide agency.

**Reconsider if:** Only as an optional minigame or isolated event, not as the base combat spine.

### Card-based presentation without bespoke sprites

**Rule:** The battle system must be presentable through animated cards and UI effects without requiring a unique sprite set for every card.

**Intended experience:** The original card art remains central and recognizable during combat.

**Mechanical reason:** AI-created card variants have too many outfits, scenes, and art treatments for consistent sprite production to be practical.

**Known risks:** Card animation can feel visually flat if impact feedback is weak.

**Reconsider if:** A scalable automated sprite pipeline becomes available later, but the combat rules should not depend on it.

### Target battle duration

**Rule:** A normal battle should take approximately 30 to 60 seconds of active combat time, excluding pauses for player decisions.

**Intended experience:** Battles feel substantial enough to produce drama but short enough for a 5-to-10-minute daily loop.

**Mechanical reason:** This allows several fights per session without turning progression into a long grind.

**Known risks:** Too many manual decision windows or defensive stalls can break the target.

**Reconsider if:** Early simulations show the target prevents meaningful tactical outcomes.

## Proposed Battle Decisions

### Proposed spine: semi-automatic 3-on-3 combat

A strong current candidate is:

1. All 6 cards are visible.
2. Each card has individual HP.
3. Cards perform automatic basic attacks according to a turn or initiative system.
4. The player makes a small number of high-impact decisions rather than selecting every attack.
5. The most likely first manual decision is target focus, but formation or squad-level commands remain alternatives.
6. Auto-play makes those decisions through understandable rules.
7. Difficult encounters demand better preparation and better intervention, while routine battles can run with minimal attention.

This is a proposal, not an approved combat model.

### Why this proposal currently fits

- It preserves the desired visual of 3 cards facing 3 enemy cards.
- It works without sprites.
- It gives routine battles a low-input mode.
- It leaves room for target choice and clutch intervention.
- It can later support abilities without requiring them for the first prototype.
- It can produce both rollover victories and close battles through matchup quality and encounter tuning.

### Primary risk

If the player only selects a target once and then watches, the system may still become a decorative stat calculation. The next design step is therefore to identify one decision that matters enough to create ownership without slowing the battle.

### Three structural candidates still under consideration

#### Candidate A: Fixed lanes

- Each player card initially faces one opposing card.
- Cards normally attack within their lane.
- The player may be able to redirect, swap positions, or break a lane under defined conditions.

Strengths:

- Extremely readable
- Makes type matchups immediately visible
- Easy to animate and understand
- Gives squad ordering strategic weight before battle

Risks:

- Can become rigid or predetermined
- Clutch focus fire is harder to support
- A bad lane may feel decided before the fight begins

#### Candidate B: Open squad targeting

- All cards act in one shared battle space.
- Any card may target any enemy.
- The player can select a focus target while auto-play uses its own priority rules.

Strengths:

- Supports focus fire, clutch eliminations, and target switching
- Makes manual play clearly stronger than passive observation
- Allows type advantages to be exploited dynamically

Risks:

- Focus fire may create rapid snowballing
- Target logic and interface clarity become more important
- One enemy can be deleted before it meaningfully acts

#### Candidate C: Automatic attacks plus squad command

- Individual attacks remain automatic.
- At defined intervals, the player chooses a squad-level command such as Focus, Guard, or Surge.
- Commands alter behavior for a short window rather than selecting every action.

Strengths:

- Creates one clear, high-impact decision
- Works well on mobile
- Can preserve fast battle pacing
- Gives auto-play simple, legible rules

Risks:

- Commands may feel abstract or disconnected from the cards
- Poorly balanced commands can create one obvious best choice
- It may add a new mechanic before the meanings of POW, DEF, and SPD are settled

These candidates can be combined, but the first prototype should avoid combining all of them at once.

## Rejected Directions

### Mandatory manual attack selection

The player should not be required to select every basic attack. This conflicts with the desired speed, auto-play requirement, and progression role of ordinary battles.

### Reflex and timing execution

Tap meters, reaction prompts, and timing bonuses are rejected for the base battle system. They may be reconsidered only as optional side content.

### Sprite-dependent combat

The system should not depend on full character sprites or outfit-specific animations. The card art itself is the scalable visual asset.

## Decision Log

| Date | Status | Topic | Decision or question | Reasoning summary |
| --- | --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Process | Battle design will be explored in a dedicated discussion-first document before implementation. | Prevents scattered chat decisions and premature combat code. |
| 2026-07-10 | Confirmed | Scope | Existing constraints from `game-design.md` form the initial boundary. | Keeps battle compatible with the accepted card, type, rarity, and progression model. |
| 2026-07-10 | Confirmed | Presentation | Show 3 player cards facing 3 enemy cards. | Matches the squad model and keeps collectible card art central. |
| 2026-07-10 | Confirmed | Survival | Each card has a visible individual HP bar. | Supports targeting, danger readability, knockouts, and clutch survival. |
| 2026-07-10 | Confirmed | Input | Basic attacks occur automatically. | Keeps combat fast and supports routine progression. |
| 2026-07-10 | Confirmed | Accessibility | Auto-play is required. | Repeated leveling battles should not become manual chores. |
| 2026-07-10 | Rejected | Input | Do not use reflex or timing mechanics in the base combat system. | Conflicts with strategic intent, accessibility, and auto-play. |
| 2026-07-10 | Confirmed | Production | Base combat must work without bespoke character sprites. | The volume and visual variety of card art makes sprite consistency impractical. |
| 2026-07-10 | Confirmed | Pace | Target 30 to 60 seconds of active time for ordinary battles. | Supports drama within the intended short daily session. |
| 2026-07-10 | Proposed | Combat spine | Explore semi-automatic 3-on-3 combat with sparse, high-impact player decisions. | Best current fit for progression play, challenge, production scope, and card presentation. |

## Immediate Discovery Order

The recommended order for resolving the system is:

1. Choose fixed-lane, open-targeting, or a restrained hybrid structure.
2. Decide whether all three cards are simultaneously active and targetable.
3. Define the turn or initiative structure.
4. Define exactly what POW, DEF, and SPD do.
5. Define the one primary manual intervention in the first prototype.
6. Define damage, survival, targeting, and victory.
7. Define the role of type matchups and randomness.
8. Build one ordinary encounter on paper.
9. Build one boss encounter on paper.
10. Simulate expected fight length and stat behavior.
11. Define rewards, energy cost, failure cost, and repeat-play rules.
12. Only then prepare an implementation specification.

## Next Discussion Target

Resolve the battlefield structure before formulas.

The next questions are deliberately narrow:

1. Are the three opposing pairs arranged as meaningful lanes, or should every card be free to attack every enemy?
2. Are all three cards active and vulnerable from the opening second, or does only one card from each side fight at a time?
3. Should manual targeting mean selecting one enemy for the whole squad to focus, or selecting a separate target for each friendly card?
4. Should combat stop at decision windows, slow briefly while the player chooses, or continue in real time unless manually paused?
5. During a hard battle, what one action would make Sterling feel that he personally changed the result rather than merely bringing the correct squad?
