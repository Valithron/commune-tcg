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

## Open Design Areas

### A. Core Battle Fantasy

Open questions:

- What should the player feel they are commanding: individual fighters, a coordinated trio, cards on a field, or an anime scene represented by cards?
- Should the three cards fight simultaneously, rotate into an active slot, or act one at a time?
- Should a battle feel tactical, cinematic, fast, chaotic, tense, or mostly relaxing?
- What should create the strongest emotional peak inside one battle?

### B. Player Interaction Model

Open questions:

- Fully automatic, semi-automatic, or turn-by-turn manual?
- Does the player choose targets, attacks, defensive actions, substitutions, timing, or only the squad?
- Is there one meaningful choice per round, several small choices, or mostly pre-battle strategy?
- Can a player speed up, skip, or auto-resolve previously cleared content?

### C. Squad Structure and Positioning

Open questions:

- Are all three cards active at once?
- Are there front, middle, and back positions?
- Does positioning alter targeting, damage, protection, or turn order?
- Can players rearrange the squad during battle?
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
- Does DEF reduce incoming damage, create health, produce shields, or influence survival probability?
- Does SPD only control action order, or also accuracy, evasion, critical chance, or energy generation?
- Do cards have HP as a derived combat value, or is DEF itself the survival resource?
- Should the three stats remain equally valuable across common encounter types?

### F. Damage and Survival Model

Open questions:

- Persistent HP per card, shared squad HP, lives/knockouts, or round points?
- Is damage deterministic with a narrow variance, or probability-based?
- Is there a minimum damage floor?
- Can attacks miss?
- Can attacks critically hit before abilities exist?
- Can defeated cards return during the same battle?
- Should damage persist between linked encounters or reset every fight?

### G. Targeting

Open questions:

- Player-selected targets, automatic targeting, position-based targeting, or threat rules?
- Can all cards attack any enemy?
- Can multiple cards focus the same target?
- Does type advantage influence automatic target selection?
- How should casual auto-play behave when several targets are reasonable?

### H. Type Matchups in Actual Combat

Open questions:

- What does the +15% or -5% modify: outgoing damage, total effectiveness, hit outcome, defense, or a broader action score?
- Is type checked attacker-to-defender for every action or summarized at squad level?
- Can Neutral's stability compensate for having no advantage?
- Is the current matchup chart readable enough during a fast battle?
- How prominently should advantage and disadvantage be shown before committing to an action?

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
- Do normal fights use one enemy, three enemies, waves, or mixed structures?
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

- Full card art, cropped portraits, sprites, tokens, or simple animated cards?
- Portrait or landscape battle screen?
- How long should a normal battle animation take?
- What must be visible at a glance: HP, turn order, type, buffs, projected damage, target, or only essentials?
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

No new battle rules have yet been confirmed in this document beyond the inherited direction from `game-design.md`.

## Proposed Battle Decisions

None yet. Proposals should be added only after the first discovery discussion.

## Rejected Directions

None yet. Rejections should preserve enough reasoning to prevent the same unproductive direction from repeatedly returning without new evidence.

## Decision Log

| Date | Status | Topic | Decision or question | Reasoning summary |
| --- | --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Process | Battle design will be explored in a dedicated discussion-first document before implementation. | Prevents scattered chat decisions and premature combat code. |
| 2026-07-10 | Confirmed | Scope | Existing constraints from `game-design.md` form the initial boundary. | Keeps battle compatible with the accepted card, type, rarity, and progression model. |

## Immediate Discovery Order

The recommended order for resolving the system is:

1. Define the desired battle fantasy and player agency.
2. Decide whether all three cards are simultaneously active.
3. Decide the turn/round structure.
4. Define exactly what POW, DEF, and SPD do.
5. Define damage, survival, targeting, and victory.
6. Define the role of type matchups and randomness.
7. Build one ordinary encounter on paper.
8. Build one boss encounter on paper.
9. Simulate expected fight length and stat behavior.
10. Define rewards, energy cost, failure cost, and repeat-play rules.
11. Only then prepare an implementation specification.

## Next Discussion Target

Begin with the player's moment-to-moment experience, not formulas:

- What appears on screen?
- What does the player control?
- What do the three cards physically do?
- What decision creates the fun?
- What makes a victory feel earned rather than merely calculated?
