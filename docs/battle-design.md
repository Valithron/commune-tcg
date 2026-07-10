# Commune TCG Battle Design

Living design document for the Commune TCG battle system on the `Gacha` branch.

This file is the single authority for battle-specific design. It records confirmed decisions, active first-test values, serious proposals, rejected directions, unresolved questions, and the reasoning behind major choices. It is a design document only. Nothing here authorizes implementation unless Sterling explicitly requests implementation in a separate coding task.

## Document Status

**Phase:** Combat-model definition and encounter design  
**Current objective:** Finish the smallest battle system that is fun, readable, replayable, expandable, and suitable for short mobile sessions before combat implementation begins.  
**Implementation status:** Not authorized.  
**Primary related document:** `docs/game-design.md`

### Design-state labels

- **Confirmed:** Accepted rule or product direction.
- **Active test value:** Accepted for the first playable test, but still subject to tuning.
- **Serious proposal:** Worth isolated testing, but not approved as a rule.
- **Open question:** Unresolved and not safe to infer during implementation.
- **Rejected direction:** Deliberately excluded unless new evidence justifies reconsideration.

## Relationship to the Main Game Design

The main game-design document defines the wider collection, rarity, type, progression, economy, and product direction. This document narrows the discussion to battle.

When the documents overlap:

1. Confirmed rules in `game-design.md` remain authoritative unless intentionally revised here.
2. Battle-specific detail should live here.
3. Any battle decision that changes the wider economy or permanent card model should eventually also be reflected in `game-design.md`.
4. Unsettled ideas must remain labeled as open or proposed.
5. Numbers labeled as first-test values are accepted for implementation testing, but not guaranteed final production values.

## Inherited Product Direction

### Product and session shape

- Commune TCG is a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social or anime-themed worldbuilding.
- It is not intended to become a deep competitive tabletop TCG.
- The target audience is casual-to-midcore.
- A normal daily session should take approximately 5 to 10 minutes, with optional longer play.
- Ordinary battles should generally fit within approximately 30 to 60 seconds.
- Battle should support the collection fantasy rather than replace it.
- Casual players should be able to use favorite cards, while strategic players should gain meaningful advantages from preparation.

### Squad and card inputs

- A battle squad contains 3 cards.
- The first combat model uses ATK, DEF, SPD, Type, rarity, and level.
- A card's battlefield role should emerge from its stats, type, character, rarity, and later abilities rather than a rigid stored class.
- Every card in the active squad should receive full battle XP in the first version.

### Encounter scope

- Initial targets are PvE random enemies, curated challenges, and seasonal bosses.
- User PvP is a possible future system, not a present requirement.
- Energy is intended to pace battle attempts.

### Current types

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

Players should understand why a card acted first, hit hard, survived, won a lane, or reinforced another lane. Important calculations should be represented through clear visual feedback.

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
- A formation system where the two supporting squad slots become decorative because one ace always decides the battle

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
- Equal Squad Power does not guarantee equal battle strength because stat concentration, lane routing, and reinforcement matter.

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

- The older package crossed whole-hit defeat breakpoints too often between otherwise comparable cards.
- The current package gives correct formation a meaningful edge without allowing type alone to erase similar stat quality.
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

| Profile | ATK | DEF | SPD | Approx. crit chance |
| --- | ---: | ---: | ---: | ---: |
| Balanced | 20 | 20 | 20 | 5.0% |
| Mildly fast | 20 | 18 | 22 | 6.6% |
| SPD specialist | 18 | 17 | 25 | 9.3% |
| Extreme SPD | 16 | 16 | 28 | 10.0% cap |

This keeps crits exciting rather than routine and avoids giving SPD an unbounded scaling advantage.

### Final normal-hit structure

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

A complete extra attack does more than add damage. It can create early knockouts that deny the opponent's next scheduled action. Combined with acting first and critting more often, this made SPD specialists dominate comparable profiles.

The 30% non-critting Follow-Up preserves the speed fantasy without turning SPD into the automatic best stat.

## Combat Pacing Targets

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

### Full-battle pacing target

The first 3-on-3 exploratory pass produced battles that generally resolved in approximately 7 to 8 rounds. That supports the target of roughly 30 to 60 seconds when normal attacks remain restrained and higher battle speeds are available.

Exact duration measurements should be regenerated from a reproducible simulator before they become canonical balance data.

## Real-Card Test Pool

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

### Confirmed findings from duel testing

- The HP, ATK, and DEF package placed comparable mirror fights around the desired 5 to 7 rounds.
- Universal `+5 HP per level` stayed much more stable across levels than `+8 HP per level`.
- Infinidagger acted as a fast attacker and gained a modest crit bonus, but did not qualify as a true SPD specialist.
- None of the seven sampled cards qualified for Follow-Up under the 15% rule, which is acceptable. The mechanic should be uncommon and profile-driven.
- Severe rarity and Power gaps remained decisive.
- The earlier +15% and -5% type package was too deterministic between comparable cards.
- The accepted +8% and -3% package produced a meaningful edge without making type alone an automatic win.
- Whole-hit defeat breakpoints still matter, so the package remains subject to tuning during real playtests.

## First Full 3-on-3 Formation Pass

### Test squads

**Squad A, 138 Squad Power**

- Mermilf
- Fire Fox
- Ramen Specialist

**Squad B, 136 Squad Power**

- Infinidagger!
- Galilee Mount
- Nevermore Command

All 36 possible formation pairings were explored under the accepted combat package.

### Simulation rigor boundary

The design conclusions from this pass are retained, but precise percentages are not canonical yet. A reproducible simulator should regenerate exact win rates, reinforcement counts, remaining HP, and MVP frequencies before those values are treated as authoritative.

Unresolved implementation details must not be silently canonized during simulation. Until decided, testing should neutralize or evenly distribute:

- Equal-SPD attack priority
- Equal-HP center reinforcement priority
- Damage-display rounding

### Confirmed qualitative findings

- Formation materially changes outcomes.
- Center placement has distinct strategic value because it can reinforce either side, but center is not automatically the best slot for the strongest card.
- Matchup routing matters more than simply placing the strongest card in center.
- The first lane winner often becomes a major outcome driver.
- Natural reinforcement can overturn the apparent result of the three isolated lane duels.
- Concentrated ace power is more valuable than the same Squad Power distributed evenly across three cards.
- The current damage, DEF, crit, and type package still produces healthy pacing.
- The +8% and -3% type package is not the source of the observed imbalance. Rarity, stat concentration, first-break timing, and reinforcement are the dominant forces.
- The ace-carry fantasy is desirable, but the other two squad slots must still feel consequential.

### Good decisions produced by the current structure

- Matching Fire Fox into Nevermore Command creates a real, readable favorable lane instead of sacrificing Fire Fox into a clearly superior card.
- Choosing Mermilf's first target changes how quickly the ace becomes available to reinforce.
- Center placement creates flexible rescue potential without becoming mandatory.
- Players can understand why a formation worked by observing the first lane break and reinforcement route.

### Dominant behavior to monitor

The strongest general strategy in this sample is:

> Place the strongest ace where it wins quickly and emerges with enough HP to attack multiple lanes.

This is strategically legitimate and supports the collection fantasy. It becomes unhealthy only if it consistently makes the other two squad slots decorative.

### False-choice warning

Three lane forecasts must not be presented as three independent votes.

A formation may be projected to lose two opening lanes and still win because one overwhelmingly strong lane winner crosses over and carries. The formation screen must teach reinforcement pressure rather than implying that winning two isolated lane forecasts guarantees victory.

### Breakpoints observed

- Mermilf reliably defeats the lower-rarity enemies quickly enough to begin reinforcing with meaningful HP remaining.
- Fire Fox versus Nevermore Command is the only clearly contestable low-rarity pairing in this sample.
- Ramen Specialist loses most available isolated lanes, so its placement is mainly about delaying the enemy, shaping first-break timing, and influencing reinforcement routes.
- This sample is intentionally narrow and should not be used to globally rebalance rarity or type.

## Confirmed Battlefield Structure

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
- Formation is the core opening strategic decision.

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

### Reinforcement health warning

Reinforcement is confirmed as a major outcome driver. The current 100% cross-lane attack remains the active control rule, but broader testing must determine whether ace concentration creates excessive snowballing.

Do not weaken the core damage package merely to compensate for a structural reinforcement issue.

### Battle end

The battle ends when all three cards on one side are defeated.

## Formation Forecasts

Honest lane forecasts are feasible, but they must describe expected duel quality rather than guarantee the final squad result.

### First forecast bands

- **Favored:** estimated isolated-lane win chance of 65% or higher
- **Even:** estimated isolated-lane win chance of 36% to 64%
- **Risky:** estimated isolated-lane win chance of 35% or lower

These bands are active UX test values, not final probability language.

### Forecast rules

- Forecasts must be explicitly non-guaranteed.
- Forecasts should initially evaluate the direct lane duel.
- Hidden reinforcement assumptions should not be folded into a simple lane label.
- A separate squad-level observation may explain likely reinforcement pressure.
- The UI should avoid fake numerical precision unless a future forecast model is proven stable and explainable.

Possible squad-level observations:

- Strong early reinforcement potential
- Center can support either side
- Two lanes are projected to break early
- Formation relies heavily on one ace

These are explanations, not additional hidden ratings.

## Confirmed Player-Facing Battle Loop

The primary player journey is:

> Choose encounter, inspect the enemy lanes, select and order the squad, lock formation, watch the lane battle unfold, recognize standout moments, collect progression rewards, then retry, continue, or edit the squad.

The loop uses three reward tempos:

1. **Anticipation before combat:** enemy inspection and formation decisions.
2. **Readable spikes during combat:** crits, low-health survival, Follow-Ups, lane wins, reinforcement, and final knockouts.
3. **Compressed reward cascade after combat:** MVP recognition, XP, level-ups, currencies, and rare drops.

## Battle Hub

Initial Battle Hub modes:

- **Daily Skirmish:** repeatable progression battle for card XP and ordinary resources.
- **Challenge:** stronger curated encounters that reward squad selection and formation.
- **Seasonal Boss:** time-limited major encounter with distinctive presentation and rewards.

The first Battle Hub does not use a level map.

## Encounter Preview

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

## Squad Selection and Formation

The formation screen should support:

- Tapping an empty lane to choose a card
- Dragging or swapping cards between lanes
- Tapping a player card for showcase inspection
- Loading a saved squad
- Searching the vault
- Filtering by type and rarity
- Sorting by Power, level, recent, or favorite
- A later recommended formation option for routine content, if useful

Each lane may show Favored, Even, or Risky after a player card is assigned.

## Formation Lock-In

When the player presses **Begin Battle**:

1. Player positions visually click or flash into place.
2. Lane connections illuminate.
3. A brief `FORMATION LOCKED` confirmation appears.
4. The attempt and any energy cost are committed.
5. The short battle introduction begins.

The lock transition should take less than one second before the normal battle introduction.

## Battle Introduction

A normal encounter introduction should last about one to two seconds:

1. Enemy cards slide into the upper row.
2. Player cards slide into the lower row.
3. A short `VS` flash appears.
4. Lane lines ignite.
5. Combat begins.

Ordinary battles should not show six long individual introductions.

## Daily Skirmish Encounter 01: Crossroads Patrol

This encounter is a complete paper design, not yet an approved economy specification.

### Purpose

Teach lane forecasts, formation lock, first lane victory, and natural reinforcement without requiring abilities.

### Encounter identity

- Mode: Daily Skirmish
- Name: Crossroads Patrol
- Recommended Squad Power: approximately 90 to 110
- Energy cost proposal: 1
- Expected battle length: approximately 30 to 45 seconds at 1×
- Repeatable: yes
- First-clear bonus: yes, once per daily reset

### Enemy formation

**Left**

- Flame Common
- Moderate ATK, low DEF, average SPD
- Forecast lesson: vulnerable to Tide, dangerous to Bloom

**Center**

- Neutral Uncommon
- Balanced stats
- Forecast lesson: no type shortcut; use raw card quality

**Right**

- Shadow Common
- Higher DEF, lower SPD
- Forecast lesson: Radiant or Flame can create an earlier lane break

### Encounter modifier

No hidden stat modifier.

Visible rule card:

> First lane winners reinforce adjacent lanes on their next turn.

This encounter should teach the normal battle rules rather than introduce a gimmick.

### Reward proposal

**Base victory**

- 20 Gold
- 18 XP to each squad card
- Small chance of universal dust

**First victory of the day**

- Additional 40 Gold
- Additional 12 XP to each squad card
- One small character-shard bundle or equivalent early progression material

**Defeat**

- No full material reward
- 25% of normal card XP to reduce frustration and preserve the value of trying
- Energy failure cost remains an open economy decision

These values remain proposals until battle XP, gold pacing, and energy costs are designed against the wider economy.

### Difficulty behavior

The enemy squad should be generated from a narrow approved stat band, not fully random rarity chaos. Daily Skirmish is routine progression content. It should reward sensible placement without demanding an optimized vault.

### Completion labels

Possible non-mechanical result labels:

- Clean Sweep
- Strong Formation
- Last Card Standing
- Rapid Victory

Do not attach bonus rewards until the labels are proven reliable and non-exploitable.

## Battle Page Wireframe Direction

### Screen 1: Encounter preview and formation

Portrait structure from top to bottom:

1. **Compact top bar**
   - Back
   - Encounter name
   - Energy cost
   - Help icon

2. **Enemy formation row**
   - Three compressed cards in left, center, and right lanes
   - Type, level, rarity, and PWR visible
   - Tap opens showcase inspection

3. **Lane forecast band**
   - One compact forecast per lane
   - Favored, Even, or Risky
   - Small type relationship icon
   - Reinforcement-path hint appears only after all three player cards are placed

4. **Player formation row**
   - Three lane slots
   - Tap to select
   - Drag or tap-swap between occupied lanes
   - Selected card receives a clear outline, not only color

5. **Squad tray**
   - Search
   - Type filter
   - Rarity filter
   - Sort by Power, level, recent, or favorite
   - Saved squad control

6. **Sticky action area**
   - Squad Power
   - Enemy Squad Power
   - Begin Battle

### Screen 2: Formation lock transition

- Player cards snap into lanes.
- Lane lines illuminate.
- `FORMATION LOCKED` appears briefly.
- Energy commits at this point.
- Enemy and player rows transition directly into the battlefield.

### Screen 3: Active battlefield

**Top section**

- Three enemy cards
- HP bars directly attached to cards
- Type icon and level
- Status region reserved but empty in version one

**Middle section**

- Three lane channels
- Attack trails and impact effects
- Broken-lane state
- Diagonal reinforcement path
- Compact round indicator optional; do not foreground it unless testing shows value

**Bottom section**

- Three player cards
- HP bars
- Follow-Up meter only for qualified cards

**Persistent controls**

- Pause
- 1× or 2× speed
- Auto indicator
- Retreat inside pause, if retreat is allowed

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

### Interaction

- Auto-play must be supported.
- The base battle does not need manual target redirection.
- Any future manual targeting or tactical command must pause combat.
- Prebattle formation is the main normal-battle skill expression.
- Tapping a card during active combat should pause and open inspection.
- Combat should not continue behind a modal.

The inspection panel should show:

- Full card
- Current and maximum HP
- ATK, DEF, and SPD
- Type relationship against current target
- Current crit chance
- Follow-Up eligibility and meter when relevant
- Concise explanation of active encounter modifiers

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

### Type effectiveness

Type advantage should receive a small local accent, not a full dramatic interruption. The player should understand that the matchup helped without mistaking it for a crit or special ability.

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

The first reinforcement attack may use a diagonal trail. Under the active control rule, it receives no damage bonus or penalty.

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

The first 3-on-3 pass confirmed that a dominant ace will often deserve MVP. The scoring model must still preserve room for meaningful support contributions when a weaker card wins a key lane or delays a dangerous enemy.

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

A defeat screen should provide one or two concise and accurate observations, such as a type-disadvantaged lane, an early lane break, or a decisive SPD mismatch.

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

## Accessibility and Readability

- Never communicate Favored, Even, Risky, type advantage, or low HP through color alone.
- Support reduced motion.
- Keep damage numbers and HP changes legible at 2× speed.
- Use stable card positions so players can track lanes without chasing moving UI.
- Give pause-and-inspect a large mobile target.
- Reinforcement paths must be visually distinct from normal lane attacks.
- Important information should remain understandable without audio.
- Animation intensity should preserve clarity on small portrait screens.

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
- A powerful ace rescuing a collapsing formation without making supporting cards feel irrelevant

## Serious Proposals for the Next Test Pass

### Cross-lane Assist Attack efficiency

Test an off-lane reinforcement-efficiency modifier only if broader simulations confirm that ace concentration dominates too strongly.

Candidate isolated test values:

- 100% cross-lane damage: current control
- 85% cross-lane damage: mild support tax
- 70% cross-lane damage: strong support tax

Preferred terminology if this rule is adopted:

- Home-lane attack: normal attack
- Cross-lane attack: **Assist Attack**

Any reduction must be communicated visibly. Hidden reduced damage would make combat feel inconsistent.

This proposal is not confirmed.

### Squad-level forecast observation

Test whether one short formation-level note improves understanding without cluttering the screen.

Examples:

- Strong early reinforcement potential
- Formation relies heavily on one ace
- Center can rescue either side

This proposal is not confirmed.

## Rejected Immediate Reactions

- Do not reduce Mermilf's stats because she performed like a Legendary.
- Do not increase type penalties to counter rarity concentration.
- Do not give losing lanes artificial survival protection.
- Do not remove reinforcement after one narrow sample.
- Do not normalize squads by Squad Power during combat.
- Do not grant free attacks on lane victory.
- Do not weaken the entire damage package to solve a reinforcement-structure concern.
- Do not treat three lane forecasts as three independent votes.
- Do not publish precise simulation percentages as canonical until a reproducible simulator generates them.

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
10. What exact reward amounts define Daily Skirmish, Challenge, and Seasonal Boss?
11. When are battle speed, auto-repeat, quick resolution, or sweep options unlocked?
12. What exact scoring formula selects Battle MVP without making the result feel arbitrary?
13. What information belongs in the compact battlefield HUD after mobile layout testing?
14. Does broader testing confirm that cross-lane reinforcement needs a damage-efficiency modifier?
15. Should the UI distinguish `Assist Attack` from a normal home-lane attack?
16. Should formation preview include a squad-level reinforcement observation in addition to lane forecasts?
17. What exact model should generate forecasts without exposing fake precision?
18. Should a forecast use only isolated lane odds, or also surface projected first-break timing?
19. Does the center rescue rule remain strategically distinct when squads are more evenly distributed?
20. Is 18 XP per Daily Skirmish card appropriate relative to the accepted XP curve?
21. Does a failed Daily Skirmish consume energy?
22. Should routine encounters show round count at all?
23. Does the accepted +8% and -3% type package remain healthy after testing larger pools, higher levels, and abilities?
24. How often should one ace be able to carry two substantially weaker allies before support-card identity feels suppressed?

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
| 2026-07-10 | Active test value | Damage | Raw damage is `20 + ATK × 2.5`. | Prevents low-rarity stalls while preserving ATK value. |
| 2026-07-10 | Active test value | DEF | DEF uses continuous mitigation `40 / (40 + DEF)`. | Avoids flat subtraction and creates diminishing returns. |
| 2026-07-10 | Active test value | Variance | Normal attacks use ±5% damage variance. | Keeps repeated hits visually interesting without letting luck dominate. |
| 2026-07-10 | Active test value | Crits | Base crit is 5%, SPD specialization can raise it to 10%, and crit damage is 1.5×. | Gives SPD a modest precision identity while ATK controls crit size. |
| 2026-07-10 | Active test value | SPD eligibility | Follow-Up requires SPD at least 15% above both ATK and DEF. | Identifies true speed specialists without rigid classes or absolute thresholds. |
| 2026-07-10 | Active test value | Follow-Up | Follow-Up is an immediate 30% non-critting strike with no chaining. | Preserves double-strike fantasy without allowing full extra attacks to dominate. |
| 2026-07-10 | Active test value | Type balance | Advantage is +8%, disadvantage is -3%, neutral is unchanged. | Produces a meaningful edge without near-automatic comparable-card wins. |
| 2026-07-10 | Confirmed | Battle Hub | Initial navigation uses Daily Skirmish, Challenge, and Seasonal Boss panels. | Keeps battle direct and appropriate to its supporting role. |
| 2026-07-10 | Confirmed | Enemy preview | Enemy cards show concise information and expand on tap for complete inspection. | Supports fast scanning and informed formation. |
| 2026-07-10 | Confirmed | Battlefield layout | Mobile battle uses a portrait 3-over-3 compressed-card layout. | Avoids landscape dependence and bespoke sprites. |
| 2026-07-10 | Confirmed | Battle MVP | Results showcase an MVP based on distinctive contribution rather than raw damage alone. | Creates memorable stories around collectible cards. |
| 2026-07-10 | Confirmed finding | Formation value | Formation materially changes outcomes, and center has distinct but not dominant strategic value. | Routing, first-break timing, and reinforcement access matter more than a universal best slot. |
| 2026-07-10 | Confirmed finding | Reinforcement | Reinforcement is a major outcome driver and can overturn isolated lane expectations. | Lane forecasts must not be presented as independent votes. |
| 2026-07-10 | Confirmed finding | Squad Power | Equal Squad Power does not imply equal battle strength when one squad concentrates power in an ace. | Concentrated strength converts lane wins into cross-lane pressure. |
| 2026-07-10 | Confirmed finding | Pacing | The current core package remains healthy for the next test pass. | Full battles generally fit the desired round and session target without changing damage math. |
| 2026-07-10 | Serious proposal | Assist Attack | Test 85% and 70% cross-lane damage against the current 100% control. | Isolates reinforcement snowballing without nerfing rarity, type, or base combat. |
| 2026-07-10 | Proposed encounter | Daily Skirmish | Crossroads Patrol is the first complete routine encounter design. | Teaches forecasts, formation, first lane break, and reinforcement without abilities. |
| 2026-07-10 | Confirmed process | Documentation | Simulation findings are merged into this file rather than maintained as a separate addendum. | Keeps one coherent living authority and prevents design archaeology. |

## Immediate Discovery Order

1. Build or specify a reproducible combat simulator before publishing precise balance percentages.
2. Test broader squad shapes under the current 100% reinforcement control.
3. Compare 100%, 85%, and 70% cross-lane Assist Attack damage as an isolated variable.
4. Define the exact Follow-Up meter charge equation.
5. Decide SPD and reinforcement tie-break rules.
6. Decide damage rounding and minimum-damage behavior.
7. Validate Crossroads Patrol rewards against the wider XP, gold, and energy economy.
8. Continue mobile battle-page wireframe and interaction design.
9. Design the first Challenge encounter.
10. Design the first Seasonal Boss structure.
11. Define rewards, energy cost, failure cost, repeat-play, speed, and sweep rules.
