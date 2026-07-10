# Commune TCG Battle Design

Living design document for the Commune TCG battle system on the `Gacha` branch.

This document records confirmed decisions, serious proposals, rejected directions, unresolved questions, and the reasoning behind major choices. It is a design document only. Nothing here authorizes implementation unless Sterling explicitly requests implementation in a separate coding task.

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
3. Any battle decision that changes the wider economy or card model should also be reflected in `game-design.md`.
4. Unsettled ideas must be labeled as open, proposed, or rejected rather than written as settled rules.

## Inherited Confirmed Direction

### Product and session shape

- Commune TCG is a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social/anime-themed worldbuilding.
- It is not intended to become a deep competitive tabletop TCG.
- The target audience is casual-to-midcore.
- A normal daily session should take approximately 5 to 10 minutes, with optional longer play.
- Battle should support the collection fantasy rather than replace it.
- Casual players should be able to use favorites, while strategic players should still gain meaningful advantages from good preparation.

### Squad and card inputs

- A battle squad contains 3 cards.
- The first combat model may use POW, DEF, SPD, Type, native/current rarity, and level.
- A card's battlefield role should emerge from its stats, type, character, rarity, and later abilities rather than a rigid stored class.
- Every card in the active squad should receive full battle XP in the first version.

### Encounter scope

- Initial targets are PvE random enemies and seasonal bosses.
- User PvP is a possible future system, not a present requirement.
- Energy is intended to pace battle attempts.

### Type system

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

Type should also bias the distribution of POW, DEF, and SPD without increasing the card's total stat budget by itself.

### Deliberately deferred systems

The first testable battle model should not depend on:

- Card abilities
- Physical and Mystic damage categories
- Separate physical or magical attack and defense stats
- Evolution
- PvP
- Trading
- Deep class or role systems

## Battle Design Goals

### 1. Make collected cards feel alive

Battle should turn a card from an image and stat block into a character the player recognizes, develops, favors, and remembers using.

### 2. Support progression play and challenge play

Routine battles should provide low-friction leveling and resource progression. Difficult encounters should reward correct squad construction, matchup reading, and any later tactical intervention.

### 3. Produce meaningful decisions without constant input

The player should not manually command every basic attack. The system still needs enough meaningful preparation or intervention that it is not merely a squad-power comparison with animation.

### 4. Preserve favorite-card viability

Type, rarity, level, and optimization should matter without making a beloved card automatically unusable when it is not mathematically ideal.

### 5. Reward preparation without eliminating suspense

Good squad construction should strongly improve the expected outcome. Controlled uncertainty should create crits, low-HP survival, clutch wins, and occasional upsets without allowing luck to routinely defeat superior preparation.

### 6. Make outcomes legible

Players should understand why a card acted first, hit hard, survived, missed, or lost. Important calculations should be represented through clear visual feedback.

### 7. Respect production scope

The battle system must work with the existing card artwork. It must not require bespoke character sprites for every outfit, scene, theme, or card variant.

## Failure Conditions to Avoid

The first battle model should be considered unsuccessful if it becomes primarily any of the following:

- A static squad-power comparison with decorative animation
- A long chain of obvious manual choices
- A system where routine progression requires constant attention
- A system where SPD permanently dominates POW and DEF
- A system where DEF creates slow, tedious stalls
- A system where type disadvantage invalidates favorite cards
- A system where randomness overwhelms preparation
- A system that cannot be understood without reading a combat log
- A system requiring bespoke character sprites
- A system too elaborate to simulate and balance against the current card pool

## Confirmed Battle Decisions

### 3-on-3 card field

**Rule:** The primary battle presentation shows 3 player cards facing 3 enemy cards.

**Intended experience:** The player's collected cards visibly enter battle as a squad against an opposing squad.

**Mechanical reason:** This matches the accepted squad size and creates readable individual confrontations without requiring sprites.

**Known risk:** Six vertical cards may become cramped on mobile. Battle views may need cropped or compressed card presentation while retaining recognizable art.

### All six cards active

**Rule:** All 3 player cards and all 3 enemy cards are active from the beginning of an ordinary 3-on-3 battle.

**Intended experience:** The screen presents a full squad confrontation rather than one fighter with two passive reserves.

**Mechanical reason:** This directly matches the desired visual of three cards facing three cards and allows squad order to create three immediate matchups.

**Known risk:** Simultaneous activity can become visually noisy. Attacks should still resolve in a readable sequence.

### Locked pre-battle squad order

**Rule:** The player arranges the three-card squad before battle and locks the left, center, and right order when battle begins.

**Intended experience:** Formation is a meaningful strategic commitment rather than something constantly corrected after battle begins.

**Mechanical reason:** Locked order gives type matchups and stat profiles real pre-battle significance while keeping moment-to-moment combat light.

**Known risk:** Enemy information must be clear enough that the choice is informed. Routine battles may later need a recommended formation option.

### Visible per-card HP

**Rule:** Each active card has an individual visible HP bar.

**Intended experience:** Players can immediately read danger, survival, knockouts, and clutch low-health moments.

**Mechanical reason:** Individual HP supports pitched battles and leaves room for later healing, protection, drain, and boss mechanics.

**Known risk:** HP scaling must not make DEF redundant or push fights beyond the target duration.

### Automatic basic attacks

**Rule:** Cards perform basic attacks automatically rather than requiring the player to command every attack.

**Intended experience:** Combat keeps moving and remains suitable for routine progression.

**Mechanical reason:** This reduces input burden and reserves player attention for squad building and any later high-impact decisions.

**Known risk:** The battle can become passive if formation is the only meaningful decision in every mode.

### Natural lane reinforcement

**Rule:** When a card defeats the enemy directly opposite it, the victorious card remains active with its current HP. On its next normal scheduled turn, it begins attacking the nearest adjacent surviving enemy using its own normal attack and applicable stats.

**Clarifications:**

- The victorious card does not transfer or donate stats to an ally.
- It does not merge with the allied card.
- It does not receive a free attack, extra turn, or reinforcement damage bonus.
- The allied card in the reinforced lane continues acting normally.
- The result is a natural 2-on-1 created by two separate cards using their own turns.
- A side-lane winner reinforces center if the center enemy is still alive.

**Intended experience:** Winning a lane has an immediate payoff. A strong or beloved card can win its confrontation, remain visibly active, and help carry the squad.

**Mechanical reason:** Reinforcement creates rollover victories and defeats, rewards strong formation, prevents victorious cards from standing idle, and requires no manual redirection interface.

**Known risk:** The first knockout may snowball into a rapid numerical collapse. Initial safeguards are that assistance starts only on the winner's next scheduled turn and grants no extra action or damage bonus.

**Reconsider if:** Testing shows the first knockout decides comparable battles too reliably or prevents the desired 30-to-60-second pitched fights.

### Center-lane reinforcement priority

**Rule:** If the center card wins its lane while both side enemies remain alive, it reinforces the side containing the allied card with the lower current HP percentage.

**Intended experience:** The center card appears to rescue the ally in greater danger, creating understandable clutch and comeback moments.

**Mechanical reason:** This is more emotionally legible than arbitrary left or right priority and less aggressively snowballing than always targeting the weakest enemy.

**Open edge case:** If both allied side cards have exactly the same HP percentage, a final deterministic tie-break is still needed.

### Auto-play support

**Rule:** The battle system must support auto-play.

**Intended experience:** Routine leveling and repeated farming do not become chores.

**Mechanical reason:** Battle serves the collection and progression loop as well as challenge content.

**Known risk:** If auto-play is fully optimal in all content, manual or preparatory play may feel pointless.

### No reflex-timing mechanic

**Rule:** The base combat model should not use reaction meters, timed taps, or reflex-based execution.

**Intended experience:** Success comes from collection development, matchup understanding, and strategic choices rather than dexterity or latency.

### Manual interaction pauses combat

**Rule:** If the final design includes any manual in-battle targeting or tactical command, opening that interaction must pause combat.

**Intended experience:** The player can make a considered choice without reflex pressure or losing actions while navigating the interface.

**Known note:** This rule may have no practical effect if the final base model contains no manual in-battle commands.

### Card-based presentation without bespoke sprites

**Rule:** Combat must be presentable through animated cards and interface effects without unique battle sprites for each card.

Possible presentation tools include card lunges, scale pulses, impact flashes, screen shake, damage numbers, HP-bar motion, type-colored trails, critical overlays, brief art zooms, and defeat dimming or cracking.

### Target battle duration

**Rule:** A normal battle should take approximately 30 to 60 seconds of active combat time, excluding pauses for player decisions.

**Intended experience:** Battles are long enough to produce drama but short enough to fit several encounters into the normal daily loop.

## Current Proposed Combat Spine

The current strongest structural candidate is a **fixed-lane, semi-automatic 3-on-3 battle**.

Proposed flow:

1. The enemy squad and relevant matchup information are shown.
2. The player selects three cards and arranges them into left, center, and right positions.
3. The squad order is locked when battle begins.
4. Each player card initially fights the enemy directly opposite it.
5. Basic attacks happen automatically according to a turn or initiative system.
6. Individual HP falls until cards are defeated.
7. A lane winner reinforces the nearest adjacent surviving lane on its next normal turn.
8. If a victorious center card can reinforce either side, it helps the allied card with the lower HP percentage.
9. The battle ends when all three cards on one side are defeated.

Steps 1 through 3 and 6 through 8 are confirmed in principle. Initial fixed targeting and the turn structure remain open.

### Current direction against manual redirection

Sterling's present instinct is that the base battle may not need manual target redirection.

That would make the primary skill expression:

- Reading the opposing formation
- Choosing the correct three-card squad
- Locking the correct left, center, and right order
- Developing cards with useful stat and type profiles
- Later, accounting for abilities or boss rules

This remains a proposed direction until the design proves that difficult battles offer enough agency after formation is locked.

## Still-Open Structural Questions

1. Are the left, center, and right matchups fully fixed until one card in the lane is defeated?
2. If allied HP percentages are tied when the center winner chooses a lane, what final deterministic tie-break applies?
3. Does SPD determine a fixed action order, an action meter, or initiative only?
4. Does each living card receive exactly one attack per round, or can high SPD eventually create extra actions?
5. How are maximum HP and damage derived from POW and DEF?
6. Should basic attacks have critical hits in the first version?
7. Should attacks ever miss, and if so, how much should SPD influence evasion?
8. Do bosses use the same three-lane structure or deliberately break it?
9. Is pre-battle formation the only player decision in ordinary battles, with deeper interaction reserved for bosses or later abilities?

## Current Emotional Targets

Battles should be capable of producing:

- Large attacks or critical-hit spikes
- Surviving at very low HP
- Pitched fights between comparable squads
- Fast rollover victories after excellent preparation
- Fast rollover defeats after poor preparation
- Difficult boss victories
- A favorite card winning its lane and carrying the squad

## Decision Log

| Date | Status | Topic | Decision or question | Reasoning summary |
| --- | --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Process | Battle design will be explored in a dedicated discussion-first document before implementation. | Prevents scattered chat decisions and premature combat code. |
| 2026-07-10 | Confirmed | Scope | Existing constraints from `game-design.md` form the initial boundary. | Keeps battle compatible with accepted card, type, rarity, and progression rules. |
| 2026-07-10 | Confirmed | Field | All 6 cards are active from the beginning of an ordinary 3-on-3 battle. | Matches the desired full-squad confrontation. |
| 2026-07-10 | Confirmed | Formation | The player's left, center, and right squad order is chosen and locked before combat. | Makes preparation and matchup placement meaningful without constant input. |
| 2026-07-10 | Proposed | Targeting | The base battle may use fixed lanes with no manual target redirection. | Keeps combat fast, automatic, and formation-driven. |
| 2026-07-10 | Confirmed | Interaction | Any future manual in-battle targeting or command must pause combat. | Prevents reflex pressure and mobile-input disadvantage. |
| 2026-07-10 | Confirmed | Lane victory | A victorious card uses later normal turns to attack the nearest adjacent surviving enemy. | Creates natural reinforcement, carry moments, and rollover results without stat transfer or manual targeting. |
| 2026-07-10 | Confirmed | Reinforcement priority | A victorious center card helps the allied side card with the lower current HP percentage. | Produces a legible rescue behavior and reduces arbitrary targeting. |

## Immediate Discovery Order

1. Confirm whether initial targets remain strictly fixed by lane until a knockout.
2. Decide the turn and SPD model.
3. Define maximum HP and the POW-versus-DEF damage relationship.
4. Decide critical-hit, miss, and damage-variance rules.
5. Build one ordinary encounter on paper.
6. Simulate battle duration and stat value.
7. Design the first boss structure.
8. Define rewards, energy cost, failure cost, and repeat-play rules.
9. Only then prepare an implementation specification.
