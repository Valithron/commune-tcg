# Commune TCG Battle Design

Living design document for the Commune TCG battle system on the `Gacha` branch.

This file records confirmed decisions, confirmed first-test values, serious proposals, rejected directions, unresolved questions, and the reasoning behind major choices. It is a design document only. Nothing here authorizes implementation unless Sterling explicitly requests implementation in a separate coding task.

## Document Status

**Phase:** Discovery and combat-model definition  
**Current objective:** Define the smallest battle system that is fun, readable, replayable, and expandable before writing combat code.  
**Implementation status:** Not authorized.  
**Primary related document:** `docs/game-design.md`

## Relationship to the Main Game Design

The main game-design document defines the wider collection, rarity, type, progression, economy, and product direction. This document narrows the discussion to battle.

When the documents overlap:

1. Confirmed rules in `game-design.md` remain authoritative unless intentionally revised here.
2. Battle-specific detail should live here.
3. Any battle decision that changes the wider economy or permanent card model should eventually also be reflected in `game-design.md`.
4. Unsettled ideas must be labeled as open or proposed rather than written as settled rules.
5. Numbers labeled as first-test values are accepted for implementation testing, but remain subject to tuning after real play data.

## Inherited Direction

### Product and session shape

- Commune TCG is a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social or anime-themed worldbuilding.
- It is not intended to become a deep competitive tabletop TCG.
- The target audience is casual-to-midcore.
- A normal daily session should take approximately 5 to 10 minutes, with optional longer play.
- Battle should support the collection fantasy rather than replace it.
- Casual players should be able to use favorites, while strategic players should gain meaningful advantages from preparation.

### Squad and card inputs

- A battle squad contains 3 cards.
- The first combat model uses ATK, DEF, SPD, Type, rarity, and level.
- A card's battlefield role should emerge from its stats, type, character, rarity, and later abilities rather than a rigid stored class.
- Every card in the active squad should receive full battle XP in the first version.

### Encounter scope

- Initial targets are PvE random enemies and seasonal bosses.
- User PvP is a possible future system, not a present requirement.
- Energy is intended to pace battle attempts.

### Types

Current types:

- Flame
- Tide
- Bloom
- Volt
- Shadow
- Radiant
- Neutral

Type biases the distribution of ATK, DEF, and SPD without increasing the total stat budget by itself.

### Deliberately deferred systems

The first testable battle model should not depend on:

- Card abilities
- Physical and Mystic damage categories
- Separate physical or magical attack and defense stats
- Evolution
- PvP
- Trading
- Deep class or role systems
- Equipment
- Deep status-effect systems

## Battle Design Goals

### 1. Make collected cards feel alive

Battle should turn a card from an image and stat block into a character the player recognizes, develops, favors, and remembers using.

### 2. Support progression and challenge play

Routine battles should provide low-friction leveling and resources. Difficult encounters should reward correct squad construction, matchup reading, and later tactical intervention.

### 3. Produce meaningful decisions without constant input

The player should not manually command every basic attack. The system still needs enough meaningful preparation that it is not merely a Squad Power comparison with animation.

### 4. Preserve favorite-card viability

Type, rarity, level, and optimization should matter without making a beloved card automatically unusable when it is not mathematically ideal.

### 5. Reward preparation without eliminating suspense

Good squad construction should strongly improve the expected outcome. Controlled uncertainty should create crits, low-HP survival, clutch wins, and occasional upsets without allowing luck to routinely defeat superior preparation.

### 6. Make outcomes legible

Players should understand why a card acted first, hit hard, survived, or lost. Important calculations should be represented through clear visual feedback.

### 7. Respect production scope

The battle system must work with existing card artwork. It must not require bespoke battle sprites for every outfit, scene, theme, or card variant.

## Failure Conditions to Avoid

The first battle model should be considered unsuccessful if it becomes primarily any of the following:

- A static Squad Power comparison with decorative animation
- A long chain of obvious manual choices
- A system where routine progression requires constant attention
- A system where SPD permanently dominates ATK and DEF
- A system where DEF creates slow, tedious stalls
- A system where type disadvantage invalidates favorite cards
- A system where randomness overwhelms preparation
- A system that cannot be understood without reading a combat log
- A system requiring bespoke character sprites
- A system too elaborate to simulate and balance against the current card pool
- A presentation where every hit receives maximum emphasis and important moments stop feeling important

## Core Stat Identities

Each core stat should have one primary identity and only a small number of secondary expressions.

### ATK

Primary identity: larger outgoing hits.

- ATK determines raw basic-attack damage.
- High-ATK cards naturally produce the largest critical hits because crits multiply their larger base hit.
- ATK does not independently increase crit chance.

Player fantasy:

> This card is going to hit hard.

### DEF

Primary identity: continuous incoming-damage mitigation.

- DEF reduces every incoming hit through a diminishing-returns armor formula.
- DEF does not increase maximum HP.
- DEF does not use flat `ATK - DEF` subtraction.
- DEF does not inherently create random block events.
- Future Shadow abilities may add dramatic armor surges, blocks, resistance, drain, sacrifice, or negation.

Player fantasy:

> This card is not going down easily.

### SPD

Primary identity: tempo.

- SPD determines normal attack order.
- SPD specialization modestly increases critical-hit chance.
- Genuine SPD specialists can earn occasional Follow-Up strikes.
- SPD increases the frequency of impactful moments, not the size of each hit.

Player fantasy:

> This card is going to act first and do clutch, speedy things.

### Power

- **Power** or compact **PWR** means ATK + DEF + SPD for one card.
- **Squad Power** means the sum of the selected cards' Power.
- **Effective Power** or **Matchup Power** means a temporary encounter-adjusted estimate.
- Power is not damage and is not directly inserted into combat formulas.
- Temporary matchup modifiers must never overwrite permanent Power shown in the Library, Vault, or normal card details.

## Confirmed First-Test Combat Package

These values are accepted for the first playable combat test. They are not guaranteed final production balance values.

### Round structure

- Combat proceeds in discrete rounds even if presentation appears continuous.
- Every living card receives one guaranteed normal attack each round.
- Cards act from highest SPD to lowest SPD.
- The exact deterministic tie-break for equal SPD remains open.

### Maximum HP

Normal cards use universal level-scaled HP:

```text
Max HP = 240 + (Level - 1) × 5
```

Examples:

| Level | Max HP |
| ---: | ---: |
| 1 | 240 |
| 10 | 285 |
| 20 | 335 |
| 30 | 385 |
| 40 | 435 |
| 50 | 485 |
| 60 | 535 |
| 70 | 585 |

Rules and intent:

- All normal cards use the same base HP formula in the first test.
- Rarity does not add a separate direct HP bonus.
- DEF does not create maximum HP.
- Higher-rarity cards survive through better rolled stats, level ceilings, and stronger DEF rather than hidden rarity HP.
- Future Bloom abilities may increase HP, healing, regeneration, growth, or protection.
- Bosses may use separate HP rules.

### Raw damage

```text
Raw Damage = 20 + ATK × 2.5
```

The fixed base prevents low-rarity fights from becoming excessively slow while still allowing ATK to matter strongly.

### DEF mitigation

```text
Damage After DEF = Raw Damage × 40 / (40 + DEF)
```

The armor constant is `40` for the first test.

This creates continuous diminishing returns:

- Every point of DEF helps.
- DEF cannot reduce ordinary damage to zero.
- High DEF remains useful without creating invincible stalls.

### Type modifier

The accepted first-test type package is:

- Advantage: `×1.08`
- Disadvantage: `×0.97`
- Neutral: `×1.00`

This replaces the earlier battle-test target of +15% and -5%.

Reasoning:

- The older package produced near-automatic wins between otherwise comparable cards because it crossed whole-hit defeat breakpoints.
- The new package gives correct formation a meaningful edge without allowing type alone to erase similar stat quality.
- Type advantage should strengthen an already favorable rarity or stat matchup rather than artificially normalize it.
- A Legendary Tide card should still decisively defeat a Common Flame card.

### Current type chart

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

- `+` means the attacker uses `×1.08`.
- `-` means the attacker uses `×0.97`.
- `=` means the attacker uses `×1.00`.

### Normal damage variance

Normal attacks use small symmetric variance:

```text
Random Variance = ×0.95 to ×1.05
```

Intent:

- Repeated attacks should not always display identical damage.
- The range is small enough that preparation remains more important than luck.
- The interface does not need to announce ordinary variance.

### Critical hits

First-test critical rules:

- Base crit chance: `5%`
- Maximum normal crit chance: `10%`
- Crit multiplier: `×1.5`
- SPD specialization increases crit chance.
- ATK naturally controls crit size through the underlying hit.

First-test SPD crit formula:

```text
Average Non-SPD Stat = (ATK + DEF) / 2
SPD Specialization = max(0, SPD / Average Non-SPD Stat - 1)
Crit Bonus = min(5%, SPD Specialization × 10%)
Crit Chance = 5% + Crit Bonus
```

Examples:

| Profile | ATK | DEF | SPD | Approx. crit chance |
| --- | ---: | ---: | ---: | ---: |
| Balanced | 20 | 20 | 20 | 5.0% |
| Mildly fast | 20 | 18 | 22 | 6.6% |
| SPD specialist | 18 | 17 | 25 | 9.3% |
| Extreme SPD | 16 | 16 | 28 | 10.0% cap |

This keeps crits exciting rather than routine and avoids giving SPD an unbounded scaling advantage.

### Final normal-hit structure

Conceptually:

```text
Final Damage =
(20 + ATK × 2.5)
× [40 / (40 + defender DEF)]
× Type Modifier
× Random Variance
× 1.5 if critical
```

Exact rounding order, minimum-damage handling, and integer display rules remain open for implementation specification.

## Confirmed First-Test SPD Follow-Up Package

The first test uses a conditional Follow-Up mechanic for genuine SPD specialists.

### Eligibility

A normal card qualifies when:

```text
SPD is at least 15% higher than ATK
and
SPD is at least 15% higher than DEF
```

This is a relative profile check, not an absolute SPD requirement.

Why:

- A high-rarity balanced card should not qualify merely because all its numbers are large.
- A low-rarity card can qualify if its rolled profile is genuinely speed-focused.
- Volt cards will often approach qualification, but not every Volt card should automatically receive the mechanic.
- No rigid stored `speed class` is required.

### Meter behavior

- Non-qualifying cards display no Follow-Up meter.
- Qualifying cards display a small secondary meter or pip track.
- Meter builds according to how far SPD exceeds the eligibility threshold.
- Meter progress carries through a lane victory and reinforcement.
- Maximum one Follow-Up can occur per round.
- A Follow-Up cannot generate another Follow-Up.
- Bosses and future abilities may explicitly override normal eligibility.

Target pacing for simulation:

- Near threshold: about one Follow-Up every 6 to 7 rounds
- Strong specialization: about one every 4 to 5 rounds
- Extreme specialization: about one every 3 to 4 rounds

The exact charge equation remains open.

### Follow-Up strike

When the meter is full during the card's normal turn:

1. The guaranteed normal attack resolves.
2. The meter flashes and spends its threshold.
3. The card immediately performs a Follow-Up against its current legal lane target.

First-test Follow-Up rules:

```text
Follow-Up Damage = 30% of the equivalent normal calculated hit
```

- It cannot crit.
- It uses the normal type and DEF calculations.
- It uses normal ±5% variance.
- It does not permit manual target redirection.
- It does not grant another action.
- It uses the card's current legal target after lane-state changes.

Presentation terminology:

- Mechanical term: **Follow-Up**
- Exciting visual treatment may say: **DOUBLE STRIKE**

### Rejected full second attack

A full-strength immediate second normal attack was rejected for the first test.

Simulation showed that a complete extra attack often did more than add damage. It also created early knockouts that denied the opponent's next scheduled action. Combined with acting first and critting more often, this made SPD specialists dominate comparable profiles.

The 30% non-critting Follow-Up preserves the visible speed fantasy without turning SPD into the automatic best stat.

## Combat Pacing Targets

The fundamental target is based on comparable cards, not every possible mismatch.

### Comparable matchup target

A neutral duel between cards of similar rarity, level, and Power should generally require:

```text
5 to 7 normal attack rounds to defeat one card
```

This leaves room for:

- Crits
- Low-HP survival
- SPD initiative
- Follow-Ups
- Lane wins
- Reinforcement

### Expected mismatch behavior

| Matchup | Expected lane result |
| --- | --- |
| Comparable cards, neutral type | About 5 to 7 attacks |
| Moderate stat or rarity advantage | About 4 to 6 attacks |
| Strong advantage plus favorable type | About 3 to 4 attacks |
| Extreme rarity, level, and type mismatch | Potentially 2 to 3 attacks |

The system should not artificially protect weak cards from obviously unfavorable matchups.

Example design expectation:

- Mermilf is Legendary Tide with 27 ATK, 27 DEF, and 25 SPD.
- Fire Fox is Common Flame with 11 ATK, 10 DEF, and 10 SPD.
- Mermilf should wreck Fire Fox.
- That result validates rarity, stat quality, type strategy, and progression rather than indicating an unfair fight.

## First Real-Card Test Findings

The first representative sample used seven Level 1 owned cards covering all seven types:

| Card | Type | ATK | DEF | SPD | Power |
| --- | --- | ---: | ---: | ---: | ---: |
| Mermilf | Tide | 27 | 27 | 25 | 79 |
| Infinidagger! | Volt | 22 | 18 | 23 | 63 |
| Galilee Mount | Radiant | 14 | 13 | 14 | 41 |
| Nevermore Command | Shadow | 10 | 12 | 10 | 32 |
| Fire Fox | Flame | 11 | 10 | 10 | 31 |
| Master of the Green | Neutral | 11 | 10 | 10 | 31 |
| Ramen Specialist | Bloom | 9 | 10 | 9 | 28 |

Main findings:

- The HP, ATK, and DEF package placed comparable mirror fights around the desired 5 to 7 rounds.
- Universal `+5 HP per level` stayed much more stable across levels than `+8 HP per level`.
- Infinidagger acted as a fast attacker and gained a modest crit bonus, but did not qualify as a true SPD specialist.
- None of the seven sampled cards qualified for Follow-Up under the 15% rule, which is acceptable. The mechanic should be uncommon and profile-driven.
- Severe rarity and Power gaps remained decisive.
- The earlier +15% and -5% type package was too deterministic between comparable cards.
- The accepted +8% and -3% package produced a meaningful edge without making type alone an automatic win.
- Whole-hit defeat breakpoints still matter, so the package must remain subject to tuning during real playtests.

## Confirmed Battle Field Structure

### 3-on-3 field

- The primary battle shows 3 player cards facing 3 enemy cards.
- All 6 cards are active from the beginning.
- The field uses left, center, and right lanes.

### Locked prebattle order

- The player arranges the three-card squad before battle.
- The formation locks when battle begins.
- The player cannot casually swap lanes after seeing early results.

### Strict lane duels

- Left attacks left, center attacks center, and right attacks right.
- A card cannot change targets while its original lane opponent remains alive.
- Formation is therefore the core opening strategic decision.

### Visible individual HP

- Every active card has an individual visible HP bar.
- HP supports clutch survival, lane state, healing, protection, drain, and boss mechanics.

### Automatic basic attacks

- Basic attacks happen automatically.
- There is no normal attack button.
- The base system uses no reflex taps or timing meters.

### Natural lane reinforcement

When a card defeats the enemy directly opposite it:

- The winner remains active at its current HP.
- It receives no free attack, bonus turn, reinforcement damage bonus, stat transfer, or merge.
- On its next normal scheduled turn, it attacks the nearest adjacent surviving enemy.
- The allied card in that lane continues acting normally.
- The result is a natural 2-on-1 made from separate cards using their own turns.
- A side-lane winner reinforces center if center is still occupied.

### Center reinforcement priority

If the center card wins while both side enemies remain alive:

- It reinforces the side containing the allied card with the lower current HP percentage.
- If both sides have exactly equal HP percentage, a deterministic tie-break remains open.

### Battle end

The battle ends when all three cards on one side are defeated.

## Confirmed Player-Facing Battle Loop

The primary player journey is:

> Choose encounter, inspect the enemy lanes, select and order the squad, lock formation, watch the lane battle unfold, recognize standout moments, collect progression rewards, then retry, continue, or edit the squad.

The loop uses three reward tempos:

1. **Anticipation before combat:** enemy inspection and formation decisions.
2. **Readable spikes during combat:** crits, low-health survival, Follow-Ups, lane wins, reinforcement, and final knockouts.
3. **Compressed reward cascade after combat:** MVP recognition, XP, level-ups, currencies, and rare drops.

### Battle Hub

Initial Battle Hub modes:

- **Daily Skirmish:** repeatable progression battle for card XP and ordinary resources.
- **Challenge:** stronger curated encounters that reward squad selection and formation.
- **Seasonal Boss:** time-limited major encounter with distinctive presentation and rewards.

The first Battle Hub does not use a level map.

### Encounter preview

The selected encounter shows the enemy squad in left, center, and right lanes before formation lock.

Each enemy card initially shows concise information such as:

- Power
- Type
- Level
- Rarity
- Other compact card-face identity pills

Tapping an enemy card expands it into a showcase-size view containing:

- Full card art and frame
- ATK, DEF, and SPD
- Type
- Level
- Rarity
- Power
- Abilities when abilities exist
- Encounter-specific modifiers

The player should not lose because ordinary enemy information was deliberately concealed.

### Squad selection and formation

The formation screen should support:

- Tapping an empty lane to choose a card
- Dragging or swapping cards between lanes
- Tapping a player card for showcase inspection
- Loading a saved squad
- Filtering the available cards
- A later recommended formation option for routine content, if useful

Each lane may show a concise non-guaranteed forecast such as:

- Favored
- Even
- Risky

### Formation lock-in

When the player presses **Begin Battle**:

1. Player positions visually click or flash into place.
2. Lane connections illuminate.
3. A brief `FORMATION LOCKED` confirmation appears.
4. The attempt and any energy cost are committed.
5. The short battle introduction begins.

### Battle introduction

A normal encounter introduction should last about one to two seconds:

1. Enemy cards slide into the upper row.
2. Player cards slide into the lower row.
3. A short `VS` flash appears.
4. Lane lines ignite.
5. Combat begins.

Ordinary battles should not show six long individual introductions.

### Portrait mobile battlefield

Primary mobile layout:

- Three compressed enemy cards across the upper section
- Three compressed player cards across the lower section
- Clear columns connecting each lane
- A center gap for trails, impacts, and lane-state feedback

Persistent controls should remain minimal:

- Pause
- Battle speed, such as `1x` and `2x`
- Auto status
- Retreat inside the pause interface, if retreat is allowed

### Battlefield card information

At a glance, an active battle card should communicate:

- Art and rarity frame
- Individual HP
- Type
- Level
- Rarity
- Power or another concise aggregate
- Follow-Up meter only when the card qualifies
- Status effects later, if introduced

Full title, stats, abilities, and calculations should be available through paused tap-to-expand inspection.

### Manual interaction

- Auto-play must be supported.
- The base battle currently does not need manual target redirection.
- Any future manual targeting or tactical command must pause combat.
- Prebattle formation is the main normal-battle skill expression.

## Battle Presentation

### Standard attack

A normal attack should be fast and restrained:

1. The attacker leans, scales, or lunges.
2. A type-colored trail or impact crosses the lane.
3. The target jolts.
4. A damage number appears.
5. The HP bar drains smoothly.
6. The attacker returns to position.

A normal hit should not receive full-screen flashes, heavy shake, long pauses, giant text, or the strongest sounds.

### Critical hit

A critical hit may use:

- Brief hit-stop
- Slightly larger card zoom
- Sharper sound
- Larger damage number
- Localized screen shake
- Concise `CRITICAL` treatment

### Follow-Up or Double Strike

1. The first normal attack lands.
2. The qualifying card's meter flashes and spends.
3. A compact speed signal appears.
4. The card immediately performs its 30% Follow-Up.

### Low-health survival

A card surviving at critically low HP may receive:

- HP-bar flash
- Frame pulse
- Lane-local danger vignette
- Tighter sound or music layer

### Lane victory

When a card defeats its opposing lane enemy:

1. The defeated card clearly leaves or dims from the field.
2. The lane connection breaks.
3. The winner receives a brief confirmation flash.
4. A compact `LANE WON` treatment appears.
5. A directional visual indicates the lane it will reinforce.

The first reinforcement attack may use a diagonal trail. It receives no reinforcement damage bonus.

### Final-card and comeback state

When one side is reduced to its final card, presentation may emphasize the survivor through background dimming, music escalation, or stronger lane focus. This does not silently grant a comeback bonus.

### Final knockout and victory

The final knockout receives more emphasis than an ordinary lane win:

1. Brief impact pause
2. Stronger defeat effect
3. Player squad brightens or moves forward
4. `VICTORY` appears
5. Winning formation remains visible briefly
6. Results begin

Possible descriptive labels:

- Clean Sweep
- Comeback
- Last Card Standing
- Perfect Formation
- Rapid Victory

Mechanical rewards for these labels remain open.

## Battle MVP

Every completed victory should showcase one Battle MVP card.

MVP should not be selected only by raw stats or raw damage. Contributions may include:

- Winning the first lane
- Winning a difficult or disadvantaged lane
- Reinforcement damage
- Rescuing the lowest-HP allied lane
- Multiple knockouts
- Surviving at critically low HP
- Producing an important Follow-Up
- Dealing decisive boss damage
- Remaining as the final surviving friendly card

The result should explain the choice in one concise line.

Example:

> **Battle MVP: Flame Sterling**  
> Won center lane and reinforced the endangered left lane.

## Rewards and Results

Rewards should arrive in a short hierarchy:

1. Base currency and ordinary materials
2. XP progress for all three squad cards
3. Level-up moments and stat increases
4. Milestone or ascension readiness
5. Rare rewards such as tickets, shards, special materials, or direct card drops

Common rewards should resolve quickly. Rare rewards should receive stronger staging. Repeated players should eventually have `Skip` or `Reveal All`.

Victory actions may include:

- Battle Again
- Next Encounter
- Edit Squad
- Battle Hub

Defeat actions may include:

- Retry
- Edit Formation
- Change Squad
- Battle Hub

A defeat screen should provide one or two concise and accurate observations, such as a type-disadvantaged lane or decisive SPD mismatch.

## Dopamine and Feedback Hierarchy

Stronger effects must be reserved for rarer moments.

### Tier 1: Constant feedback

- Card movement
- Damage numbers
- HP movement
- Light impact sounds

### Tier 2: Tactical confirmation

- Type effectiveness
- Follow-Up meter nearing full
- Enemy entering low HP
- Future block, dodge, or status feedback if implemented

### Tier 3: Battle spikes

- Critical hit
- Double Strike
- Lane won
- Reinforcement
- Critical low-HP survival

### Tier 4: Encounter climax

- Final knockout
- Comeback
- Boss phase break
- Victory

### Tier 5: Progression reward

- Level-up
- Milestone level
- Ascension readiness
- Rare material
- Pull ticket
- Card drop

## Current Emotional Targets

Battles should be capable of producing:

- Large attacks and critical-hit spikes
- Surviving at very low HP
- Pitched fights between comparable squads
- Fast rollover victories after excellent preparation
- Fast rollover defeats after poor preparation
- Difficult boss victories
- A favorite card winning its lane and carrying the squad
- A true SPD specialist charging toward a decisive Double Strike
- A specific card being recognized afterward for a distinctive contribution

## Still-Open Questions

1. What deterministic tie-break applies when two living cards have equal SPD?
2. What deterministic tie-break applies when a center winner sees equal allied HP percentages?
3. What exact equation controls Follow-Up meter charge above the 15% eligibility threshold?
4. Should the Follow-Up meter use a thin bar, pips, or another compact treatment?
5. What rounding order and minimum-damage rule should final damage use?
6. Should ordinary attacks ever miss?
7. Should SPD later affect dodge, accuracy, or anti-dodge, or remain limited to initiative, crit chance, and Follow-Up?
8. Do bosses use the normal three-lane structure or deliberately break it?
9. Is prebattle formation enough agency for ordinary battles once real playtesting begins?
10. What encounters and reward amounts define Daily Skirmish, Challenge, and Seasonal Boss?
11. When are battle speed, auto-repeat, quick resolution, or sweep options unlocked?
12. What exact scoring formula selects Battle MVP without making the result feel arbitrary?
13. What information belongs in the compact battlefield HUD after mobile layout testing?
14. What happens when the user taps a card during active combat?
15. Does the accepted +8% and -3% type package remain healthy after testing larger pools, higher levels, and abilities?

## Decision Log

| Date | Status | Topic | Decision or question | Reasoning summary |
| --- | --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Process | Battle design will be explored in a discussion-first document before implementation. | Prevents scattered chat decisions and premature combat code. |
| 2026-07-10 | Confirmed | Field | All 6 cards are active from the beginning of an ordinary 3-on-3 battle. | Matches the desired full-squad confrontation. |
| 2026-07-10 | Confirmed | Formation | Left, center, and right squad order is chosen and locked before combat. | Makes preparation and matchup placement meaningful. |
| 2026-07-10 | Confirmed | Lanes | Initial targets remain strictly fixed by lane until a card is defeated. | Establishes readable lane duels and formation strategy. |
| 2026-07-10 | Confirmed | Interaction | Any future manual battle command pauses combat. | Prevents reflex pressure and mobile-input disadvantage. |
| 2026-07-10 | Confirmed | Lane victory | A winner uses later normal turns to attack the nearest adjacent surviving enemy. | Creates natural reinforcement and carry moments without free actions. |
| 2026-07-10 | Confirmed | Reinforcement priority | A victorious center card helps the allied side with lower HP percentage. | Produces legible rescue behavior. |
| 2026-07-10 | Confirmed | HP | Normal-card HP is `240 + 5 × (Level - 1)` for the first test. | Keeps comparable fights near 5 to 7 attacks across levels. |
| 2026-07-10 | Confirmed test value | Damage | Raw damage is `20 + ATK × 2.5`. | Prevents low-rarity stalls while preserving ATK value. |
| 2026-07-10 | Confirmed test value | DEF | DEF uses continuous mitigation `40 / (40 + DEF)`. | Avoids flat subtraction and creates diminishing returns. |
| 2026-07-10 | Confirmed test value | Variance | Normal attacks use ±5% damage variance. | Keeps repeated hits visually interesting without letting luck dominate. |
| 2026-07-10 | Confirmed test value | Crits | Base crit is 5%, SPD specialization can raise it to 10%, and crit damage is 1.5×. | Gives SPD a modest precision identity while ATK controls crit size. |
| 2026-07-10 | Confirmed test value | SPD eligibility | Follow-Up requires SPD at least 15% above both ATK and DEF. | Identifies true speed specialists without rigid classes or absolute thresholds. |
| 2026-07-10 | Confirmed test value | Follow-Up | Follow-Up is an immediate 30% non-critting strike with no chaining. | Preserves double-strike fantasy without allowing full extra attacks to dominate. |
| 2026-07-10 | Confirmed test value | Type balance | Advantage is +8%, disadvantage is -3%, neutral is unchanged. | Produces a meaningful edge without near-automatic comparable-card wins. |
| 2026-07-10 | Confirmed | Battle Hub | Initial navigation uses Daily Skirmish, Challenge, and Seasonal Boss panels. | Keeps battle direct and appropriate to its supporting role. |
| 2026-07-10 | Confirmed | Enemy preview | Enemy cards show concise information and expand on tap for complete inspection. | Supports fast scanning and informed formation. |
| 2026-07-10 | Confirmed | Battlefield layout | Mobile battle uses a portrait 3-over-3 compressed-card layout. | Avoids landscape dependence and bespoke sprites. |
| 2026-07-10 | Confirmed | Battle MVP | Results showcase an MVP based on distinctive contribution rather than raw damage alone. | Creates memorable stories around collectible cards. |

## Immediate Discovery Order

1. Define the exact Follow-Up meter charge equation.
2. Decide SPD and reinforcement tie-break rules.
3. Decide damage rounding and minimum-damage behavior.
4. Run higher-level and larger-pool simulations with the accepted first-test package.
5. Build one ordinary Daily Skirmish encounter on paper.
6. Simulate full 3-on-3 battle duration and reinforcement snowballing.
7. Design the first Challenge encounter.
8. Design the first Seasonal Boss structure.
9. Define rewards, energy cost, failure cost, and repeat-play rules.
10. Only then prepare an implementation specification.
