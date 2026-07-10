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
- A presentation where every hit receives maximum visual emphasis and important moments therefore stop feeling important

## Confirmed Battle Decisions

### 3-on-3 card field

**Rule:** The primary battle presentation shows 3 player cards facing 3 enemy cards.

**Intended experience:** The player's collected cards visibly enter battle as a squad against an opposing squad.

**Mechanical reason:** This matches the accepted squad size and creates readable individual confrontations without requiring sprites.

**Known risk:** Six vertical cards may become cramped on mobile. Battle views should use compressed card presentation while retaining recognizable art.

### All six cards active

**Rule:** All 3 player cards and all 3 enemy cards are active from the beginning of an ordinary 3-on-3 battle.

**Intended experience:** The screen presents a full squad confrontation rather than one fighter with two passive reserves.

**Mechanical reason:** This directly matches the desired visual of three cards facing three cards and creates three immediate matchups.

**Known risk:** Simultaneous activity can become visually noisy. Attacks should resolve in a readable sequence.

### Locked pre-battle squad order

**Rule:** The player arranges the three-card squad before battle and locks the left, center, and right order when battle begins.

**Intended experience:** Formation is a meaningful strategic commitment rather than something constantly corrected after battle begins.

**Mechanical reason:** Locked order gives type matchups and stat profiles real pre-battle significance while keeping moment-to-moment combat light.

**Known risk:** Enemy information must be clear enough that the choice is informed. Routine battles may later need a recommended formation option.

### Locked lane duels until a lane is won

**Rule:** At the start of battle, each card attacks only the enemy directly opposite it. Left fights left, center fights center, and right fights right. A card cannot change targets while its original lane opponent remains alive.

**Intended experience:** Battle begins as three simultaneous lane confrontations. The player watches each matchup develop and sees the formation decision pay off or fail before the field opens up.

**Mechanical reason:** Fixed lanes make pre-battle ordering consequential, keep targeting readable, and prevent universal focus fire from becoming the automatic best strategy.

**Player-reference rationale:** The structure draws on the satisfying lane-pressure rhythm Sterling remembers from League of Legends. Each lane initially stands on its own. Winning one creates pressure and allows that winner to affect the rest of the field.

**Known risk:** If lane matchups are too deterministic, battle may feel decided entirely before it begins. Controlled variance, crits, SPD behavior, and later abilities may be needed to preserve suspense.

### Visible per-card HP

**Rule:** Each active card has an individual visible HP bar.

**Intended experience:** Players can immediately read danger, survival, knockouts, and clutch low-health moments.

**Mechanical reason:** Individual HP supports pitched battles and leaves room for later healing, protection, drain, and boss mechanics.

**Known risk:** HP scaling must not make DEF redundant or push fights beyond the target duration.

### Automatic basic attacks

**Rule:** Cards perform basic attacks automatically rather than requiring the player to command every attack.

**Intended experience:** Combat keeps moving and remains suitable for routine progression.

**Mechanical reason:** This reduces input burden and reserves player attention for squad building and any later high-impact decisions.

**Known risk:** Battle can become passive if formation is the only meaningful decision in every mode.

### Natural lane reinforcement

**Rule:** When a card defeats the enemy directly opposite it, the victorious card remains active with its current HP. On its next normal scheduled turn, it begins attacking the nearest adjacent surviving enemy using its own normal attack and applicable stats.

Clarifications:

- The victorious card does not transfer or donate stats to an ally.
- It does not merge with the allied card.
- It does not receive a free attack, extra turn, or reinforcement damage bonus.
- The allied card in the reinforced lane continues acting normally.
- The result is a natural 2-on-1 created by two separate cards using their own turns.
- A side-lane winner reinforces center if the center enemy is still alive.

**Intended experience:** Winning a lane has an immediate payoff. A strong or beloved card can win its confrontation, remain visibly active, and help carry the squad.

**Mechanical reason:** Reinforcement creates rollover victories and defeats, rewards strong formation, prevents victorious cards from standing idle, and requires no manual redirection interface.

**Known risk:** The first knockout may snowball into a rapid numerical collapse. Initial safeguards are that assistance starts only on the winner's next scheduled turn and grants no extra action or damage bonus.

### Center-lane reinforcement priority

**Rule:** If the center card wins its lane while both side enemies remain alive, it reinforces the side containing the allied card with the lower current HP percentage.

**Intended experience:** The center card appears to rescue the ally in greater danger, creating understandable clutch and comeback moments.

**Mechanical reason:** This is more emotionally legible than arbitrary left or right priority and less aggressively snowballing than always targeting the weakest enemy.

**Open edge case:** If both allied side cards have exactly the same HP percentage, a final deterministic tie-break is still needed.

### Auto-play support

**Rule:** The battle system must support auto-play.

**Intended experience:** Routine leveling and repeated farming do not become chores.

**Known risk:** If auto-play is fully optimal in all content, manual or preparatory play may feel pointless.

### No reflex-timing mechanic

**Rule:** The base combat model should not use reaction meters, timed taps, or reflex-based execution.

### Manual interaction pauses combat

**Rule:** If the final design includes any manual in-battle targeting or tactical command, opening that interaction must pause combat.

### Card-based presentation without bespoke sprites

**Rule:** Combat must be presentable through animated cards and interface effects without unique battle sprites for each card.

Possible presentation tools include card lunges, scale pulses, impact flashes, screen shake, damage numbers, HP-bar motion, type-colored trails, critical overlays, brief art zooms, and defeat dimming or cracking.

### Target battle duration

**Rule:** A normal battle should take approximately 30 to 60 seconds of active combat time, excluding pauses for player decisions.

## Current Combat Spine

The current confirmed structural spine is a **locked-lane, semi-automatic 3-on-3 battle**.

1. The enemy squad and relevant matchup information are shown.
2. The player selects three cards and arranges them into left, center, and right positions.
3. The squad order is locked when battle begins.
4. Each card attacks only the enemy directly opposite it while that opponent remains alive.
5. Basic attacks happen automatically according to a turn or initiative system.
6. Individual HP falls until cards are defeated.
7. A lane winner reinforces the nearest adjacent surviving lane on its next normal turn.
8. If a victorious center card can reinforce either side, it helps the allied card with the lower HP percentage.
9. The battle ends when all three cards on one side are defeated.

The field structure is confirmed. The leading turn-system proposal is documented below.

## Proposed Conditional SPD Bonus-Action Model

Sterling proposed a hybrid between strict round-based initiative and a free-running action-time meter. The refined direction is that bonus-action charging should be a special result of a genuinely SPD-focused stat profile, not a universal meter possessed by every normal card.

### Proposed core rule

- Combat proceeds in discrete rounds even if the presentation appears continuous.
- Every living card receives one guaranteed normal attack each round.
- SPD determines the order of those normal attacks, from fastest to slowest.
- Only cards that meet a defined SPD-focus qualification receive a bonus-action meter.
- Eligible cards build meter based on how far their SPD exceeds the qualification breakpoint.
- When the meter reaches its threshold, the card earns one additional normal attack during its normal initiative turn.
- The likely presentation is an immediate follow-up attack after that card's guaranteed attack.
- Meter overflow carries forward rather than being discarded.
- Normal cards that do not qualify as SPD-focused never gain a routine second attack merely by surviving long enough.
- Bosses or future abilities may explicitly override the normal eligibility rule.

This allows genuinely fast cards to attack twice in a round occasionally without turning all combat into a universal action-meter system.

### Eligibility must come from stats, not a stored class

The game currently avoids rigid battlefield classes. Therefore the system should not store a manual `speed card` role merely to unlock this mechanic.

The qualification should be calculated from the card's effective stat profile. Serious candidate forms include:

- SPD must be the card's highest core stat and exceed the next-highest stat by a tested percentage.
- SPD must represent at least a tested percentage of the card's POW + DEF + SPD total.
- SPD must exceed the average of POW and DEF by a tested ratio.

The exact number is intentionally unsettled. Example thresholds such as a 10%, 15%, or 20% lead are test candidates, not accepted rules.

### Why a relative threshold is preferable

An absolute SPD number would behave poorly across rarity, level, evolution, and future stat growth. A relative stat-profile test is more stable because it asks whether the card is actually built around speed rather than merely whether it has reached a high level.

This also preserves organic roles:

- A Volt card will often qualify because its type biases SPD upward.
- A non-Volt card with an unusually speed-heavy rolled profile may also qualify.
- A high-level defensive or power card will not accidentally become a double-attacker merely because all of its stats increased.

### Recommended meter behavior

- Non-qualifying cards should display no bonus-action meter.
- Qualifying cards should display a small, visually secondary meter or pip track.
- Near-threshold SPD cards should earn bonus attacks rarely.
- Extreme SPD-focused cards should earn them more often.
- A card may receive no more than one bonus attack in the same round.
- A bonus attack cannot generate another immediate bonus attack.
- Bonus attacks use the card's current legal lane target and do not permit redirection.
- Bonus attacks grant no inherent damage multiplier.
- Meter progress persists when a card wins its lane and begins reinforcing another lane.

### Timing judgment

Resolving the earned bonus attack during the card's normal initiative slot is viable and more satisfying than a detached end-of-round bonus phase.

Proposed sequence:

1. At the start of a round, eligible cards receive SPD-derived meter progress.
2. Cards act in normal SPD order.
3. On an eligible card's turn, it performs its guaranteed attack.
4. If its meter is full, it immediately performs one follow-up normal attack and spends the threshold amount.
5. The remaining cards continue acting in initiative order.

This creates a visible double-strike moment while keeping all actions inside the normal turn sequence.

### Primary balance risks

SPD would perform two valuable jobs:

1. Acting earlier in the normal round order.
2. Generating extra attacks over time for qualifying cards.

That double benefit can make SPD dominant if the eligibility threshold or charge curve is too generous. The model must be simulated against actual Common through Mythic stat ranges before confirmation.

Specific failure signs:

- Most Volt cards double-attack every round.
- A qualifying speed card consistently defeats a comparable opponent before that opponent can meaningfully act.
- POW-focused cards cannot match the speed card's total damage.
- DEF-focused cards cannot survive long enough for their durability to matter.
- Small SPD differences abruptly separate excellent cards from useless cards.

### Breakpoint design warning

A sharp binary threshold can create a cliff where one point of SPD changes a card from ordinary to dramatically superior. The preferred design should soften that cliff.

Possible methods:

- Qualification unlocks the meter, but charge rate begins very slowly near the threshold.
- Eligibility uses a narrow transition band rather than one exact point.
- The first qualifying tier may earn roughly one bonus attack over several rounds, while only extreme SPD profiles approach a more frequent cadence.

The simulator should compare bonus attacks earned over a standard battle, not only whether a card technically qualifies.

### Current judgment

The conditional SPD meter is a strong design direction. It gives speed-focused cards a distinctive payoff without forcing every card into an action-meter interface. It should remain proposed until the actual stat distributions are loaded into a simulator and a breakpoint curve is tested.

## Confirmed Player-Facing Battle Loop

The primary player journey is:

> Choose encounter, inspect the three enemy lanes, select and order the squad, lock formation, watch the lane battle unfold, recognize standout moments, collect progression rewards, then retry, continue, or edit the squad.

The battle loop should have three reward tempos:

1. **Anticipation before combat** through enemy inspection and formation decisions.
2. **Readable dramatic spikes during combat** through crits, low-health survival, double strikes, lane wins, reinforcement, and final knockouts.
3. **A compressed reward cascade after combat** through MVP recognition, XP, level-ups, currencies, and rare drops.

### 1. Battle Hub

**Confirmed structure:** The Battle Hub initially uses three large mode panels or buttons. It does not use a level map.

Initial modes:

- **Daily Skirmish:** Repeatable progression battle for card XP and ordinary resources.
- **Challenge:** Stronger curated encounters that reward better squad selection and formation.
- **Seasonal Boss:** Time-limited major encounter with distinctive presentation and rewards.

Each panel should communicate only the most useful summary information, such as energy cost, primary reward, difficulty, available progress, or event time remaining.

The hub should get the player into a useful ordinary battle with very few taps.

### 2. Encounter preview

The selected encounter presents the enemy squad in left, center, and right lanes before the player locks a formation.

Each enemy card initially shows only concise card-face information:

- Combined battle stat or power number
- Type
- Level
- Rarity
- Other compact identity information already appropriate to the normal card's bottom pills

The initial preview should not expose a dense spreadsheet of POW, DEF, SPD, abilities, and formulas.

**Confirmed interaction:** Tapping an enemy card expands it into a showcase-size view containing its complete available information, including:

- Full card art and frame
- POW, DEF, and SPD
- Type
- Level
- Rarity
- Combined battle power
- Abilities, once abilities exist
- Any encounter-specific modifiers that affect that card

The information required to make a fair formation decision should be available. The player should not lose because ordinary enemy information was deliberately concealed.

### 3. Squad selection and formation

The player selects three owned cards and places them into left, center, and right positions beneath the enemy lanes.

The formation screen should support:

- Tapping an empty lane to choose a card
- Dragging or swapping selected cards between lanes
- Tapping any player card for a showcase-size inspection
- Loading a saved squad
- Filtering the available card list
- A later recommended formation option for routine content, if useful

Each lane may show a concise non-guaranteed forecast such as:

- Favored
- Even
- Risky

The forecast should help the player reason about the matchup without pretending to know the exact result.

### 4. Formation lock-in

When the player presses **Begin Battle**:

1. The three player positions visually click or flash into place.
2. The lane connections illuminate.
3. A brief `FORMATION LOCKED` confirmation appears.
4. The battle attempt and any energy cost are committed.
5. The battle introduction begins.

This should feel like a meaningful commitment rather than an ordinary form submission.

### 5. Battle introduction

A normal encounter introduction should remain short, approximately one to two seconds.

Proposed sequence:

1. Enemy cards slide into the upper row.
2. Player cards slide into the lower row.
3. A short `VS` or confrontation flash appears.
4. The three lane lines ignite.
5. Combat begins immediately.

Ordinary battles should not show six long individual introductions. Bosses, first encounters, and exceptional cards may receive more elaborate introductions later.

### 6. Portrait mobile battlefield

**Confirmed direction:** The primary mobile battlefield is portrait-oriented.

Layout:

- Three compressed enemy cards across the upper section
- Three compressed player cards across the lower section
- Clear visual columns connecting each opposing lane
- A center gap for attack trails, impact effects, and lane-state feedback

The collectible art remains the visual focus. The card thumbnails should not be replaced by generic character sprites.

Persistent controls should remain minimal:

- Pause
- Battle speed, such as `1x` and `2x`
- Auto status
- Retreat inside the pause interface, if retreat is allowed

There is no normal attack button and no reflex timing control.

### 7. Battlefield card information

The battle view should use the established thumbnail geometry as its starting point but should not copy the existing Squad Builder thumbnail information rules unchanged.

Current implementation facts:

- The canonical thumbnail density hides the card nameplate.
- The canonical thumbnail density hides the type chip while retaining compact rarity, character, and ability identity elements when they are not suppressed by context.
- The current Squad Builder battle thumbnail is approximately `4.25rem` wide, falls to `3.7rem` on very small screens, uses a `5 / 7` aspect ratio, and intentionally hides the nameplate, identity line, ownership row, and stat row.
- Therefore the current Squad Builder thumbnail effectively presents the art and rarity frame only.

**Confirmed battle-specific direction:** The active battlefield should reuse the thumbnail size logic but add a compact battle HUD rather than relying on the current art-only Squad Builder thumbnail.

At a glance, an active battle card should communicate:

- Art and rarity frame
- Individual HP
- Type
- Level
- Rarity
- Combined battle power or similarly concise aggregate
- SPD bonus meter only when the card qualifies for that proposed mechanic
- Status effects later, if introduced

The full title, full stats, abilities, and detailed calculations should be available through a paused tap-to-expand showcase rather than permanently occupying the six-card battlefield.

### 8. Standard attack feedback

A normal attack should be fast and restrained:

1. The attacking card leans, scales, or lunges toward its legal target.
2. A type-colored trail or impact crosses the lane.
3. The target card jolts.
4. A damage number appears.
5. The HP bar drains smoothly.
6. The attacker returns to position.

A basic hit should not receive full-screen flashes, heavy screen shake, long pauses, giant text, or the strongest sounds. Those effects must remain available for genuinely important moments.

### 9. High-value battle moments

#### Critical hit

A critical hit may use:

- Brief hit-stop
- A slightly larger art or card zoom
- Sharper sound
- Larger damage number
- Localized screen shake
- A concise `CRITICAL` treatment

The animation should remain short and sudden.

#### SPD double strike

If the conditional SPD mechanic survives testing:

1. The first normal attack lands.
2. The eligible card's meter flashes and spends its threshold.
3. A compact speed or double-strike signal appears.
4. The card immediately performs its follow-up normal attack.

#### Low-health survival

A card surviving at critically low HP may receive:

- HP-bar flash
- Frame pulse
- Lane-local danger vignette
- Tighter music or sound layer

This should create tension without repeatedly covering the screen with large messages.

#### Lane victory

When a card defeats its opposing lane enemy:

1. The defeated card dims, cracks, shatters, falls back, or otherwise leaves the field clearly.
2. The lane connection breaks.
3. The winning card receives a brief confirmation flash.
4. A compact `LANE WON` treatment appears.
5. A directional visual indicates the lane that card will reinforce.

The first reinforcement attack may use a diagonal trail or support connection to show that the battlefield state has changed. It does not receive bonus damage merely because it is a reinforcement attack.

#### Final-card and comeback state

When one side is reduced to its final card, the presentation may emphasize the survivor through background dimming, music escalation, or stronger lane focus. This should support memorable last-card victories without silently granting unapproved comeback bonuses.

### 10. Victory and final knockout

The final knockout should receive more emphasis than an ordinary lane win:

1. Brief impact pause
2. Stronger defeat effect on the final enemy
3. Player squad brightens or moves forward
4. `VICTORY` appears
5. The winning formation remains visible for a short beat
6. Results begin

Possible descriptive victory labels include:

- Clean Sweep
- Comeback
- Last Card Standing
- Perfect Formation
- Rapid Victory

These labels are presentation and recognition concepts first. Any mechanical reward attached to them remains open.

### 11. Battle MVP showcase

**Confirmed rule:** Every completed victory should showcase one Battle MVP card.

The MVP should not be selected only by raw card stats or raw damage dealt. The system should recognize distinctive contributions such as:

- Winning the first lane
- Winning a difficult or disadvantaged lane
- Reinforcement damage
- Rescuing the lowest-HP allied lane
- Multiple knockouts
- Surviving at critically low HP
- Producing an important SPD double strike
- Dealing decisive boss damage
- Remaining as the final surviving friendly card

The result should explain the choice in one concise line, for example:

> **Battle MVP: Flame Sterling**  
> Won center lane and reinforced the endangered left lane.

This supports the collection fantasy by creating stories about particular cards, including lower-rarity favorites, instead of reducing every result to the card with the largest number.

### 12. Rewards sequence

Rewards should arrive in a short hierarchy rather than appearing as one dense data table.

Recommended order:

1. Base currency and ordinary materials
2. XP progress for all three squad cards
3. Level-up moments and stat increases
4. Milestone or ascension readiness, when applicable
5. Rare rewards such as tickets, shards, special materials, or direct card drops

Common rewards should resolve quickly. Rare rewards should receive stronger staging. Repeated players should eventually have a `Skip` or `Reveal All` option.

### 13. Result actions

Victory actions may include:

- Battle Again
- Next Encounter
- Edit Squad
- Battle Hub

The primary action should match the content. Farming prioritizes `Battle Again`. Sequential challenge content prioritizes `Next Encounter`.

Defeat actions may include:

- Retry
- Edit Formation
- Change Squad
- Battle Hub

A defeat screen should provide one or two concise, accurate observations, such as a type-disadvantaged lane or a decisive SPD mismatch. It should teach a likely adjustment without producing a long automated combat report.

### 14. Routine versus challenge cadence

Routine progression should allow a very short path:

1. Open Battle Hub.
2. Select Daily Skirmish.
3. Accept or lightly adjust the current squad.
4. Watch the 30-to-60-second battle.
5. Receive XP and ordinary rewards.
6. Battle again or leave.

Challenge and boss content may ask for more inspection, formation changes, and later tactical decisions.

Previously cleared content may later support faster options such as `2x`, auto-repeat, quick resolution, or sweeps. Exact unlock and cost rules remain open.

## Dopamine and Feedback Hierarchy

Stronger effects must be reserved for rarer moments.

### Tier 1: Constant feedback

- Card movement
- Damage numbers
- HP movement
- Light impact sounds

### Tier 2: Tactical confirmation

- Type effectiveness
- Dodge or block, if implemented
- SPD meter nearing full
- Enemy entering low HP

### Tier 3: Battle spikes

- Critical hit
- Double strike
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

If all attacks flash, shake, pause, and use the loudest sound, the real spikes will lose their value.

## Current Direction Against Manual Redirection

Sterling's present instinct is that the base battle should not need manual target redirection.

Primary skill expression would therefore come from:

- Reading the opposing formation
- Choosing the correct three-card squad
- Locking the correct left, center, and right order
- Developing cards with useful stat and type profiles
- Later, accounting for abilities or boss rules

This remains a proposed direction until the design proves that difficult battles offer enough agency after formation is locked.

## Still-Open Structural Questions

1. If allied HP percentages are tied when the center winner chooses a lane, what final deterministic tie-break applies?
2. Should the conditional SPD bonus-action model be confirmed after simulation?
3. Which relative stat-profile test should define SPD-focus eligibility?
4. How should meter charge scale above the eligibility breakpoint?
5. Should the bonus meter appear as a thin bar, pips, or another compact treatment?
6. How are maximum HP and damage derived from POW and DEF?
7. Should basic attacks have critical hits in the first version?
8. Should attacks ever miss, and if so, how much should SPD influence evasion?
9. Do bosses use the same three-lane structure or deliberately break it?
10. Is pre-battle formation the only player decision in ordinary battles, with deeper interaction reserved for bosses or later abilities?
11. What specific encounters and reward amounts define Daily Skirmish, Challenge, and Seasonal Boss?
12. When are battle speed, auto-repeat, quick resolution, or sweep options unlocked?
13. What exact scoring formula selects the Battle MVP without making the result feel arbitrary?
14. What information belongs in the battle thumbnail's compact HUD after mobile layout testing?
15. What happens when the user taps a card during active combat: full pause and showcase, long-press inspection, or pause-menu-only inspection?

## Current Emotional Targets

Battles should be capable of producing:

- Large attacks or critical-hit spikes
- Surviving at very low HP
- Pitched fights between comparable squads
- Fast rollover victories after excellent preparation
- Fast rollover defeats after poor preparation
- Difficult boss victories
- A favorite card winning its lane and carrying the squad
- A true SPD-focused card charging toward and earning a decisive double strike
- A specific card being recognized afterward for a distinctive contribution

## Decision Log

| Date | Status | Topic | Decision or question | Reasoning summary |
| --- | --- | --- | --- | --- |
| 2026-07-10 | Confirmed | Process | Battle design will be explored in a dedicated discussion-first document before implementation. | Prevents scattered chat decisions and premature combat code. |
| 2026-07-10 | Confirmed | Scope | Existing constraints from `game-design.md` form the initial boundary. | Keeps battle compatible with accepted card, type, rarity, and progression rules. |
| 2026-07-10 | Confirmed | Field | All 6 cards are active from the beginning of an ordinary 3-on-3 battle. | Matches the desired full-squad confrontation. |
| 2026-07-10 | Confirmed | Formation | The player's left, center, and right squad order is chosen and locked before combat. | Makes preparation and matchup placement meaningful without constant input. |
| 2026-07-10 | Confirmed | Lanes | Initial targets remain strictly fixed by lane until one card in that lane is defeated. | Establishes three readable lane duels and makes formation the core opening strategy. |
| 2026-07-10 | Proposed | Targeting | The base battle may use no manual target redirection. | Keeps combat fast, automatic, and formation-driven. |
| 2026-07-10 | Confirmed | Interaction | Any future manual in-battle targeting or command must pause combat. | Prevents reflex pressure and mobile-input disadvantage. |
| 2026-07-10 | Confirmed | Lane victory | A victorious card uses later normal turns to attack the nearest adjacent surviving enemy. | Creates natural reinforcement, carry moments, and rollover results without stat transfer or manual targeting. |
| 2026-07-10 | Confirmed | Reinforcement priority | A victorious center card helps the allied side card with the lower current HP percentage. | Produces a legible rescue behavior and reduces arbitrary targeting. |
| 2026-07-10 | Proposed | SPD eligibility | Only cards with a genuinely SPD-focused stat profile should build toward routine bonus attacks. | Prevents universal meters and preserves a distinct speed-card identity. |
| 2026-07-10 | Proposed | SPD timing | An earned bonus attack resolves as an immediate follow-up during the card's normal initiative turn. | Creates a satisfying double-strike moment without a separate chaotic action queue. |
| 2026-07-10 | Confirmed | Battle Hub | Initial navigation uses Daily Skirmish, Challenge, and Seasonal Boss panels rather than a map. | Keeps the battle feature direct and appropriate to its supporting role in the larger collection game. |
| 2026-07-10 | Confirmed | Enemy preview | Enemy cards initially show concise card-face information and expand on tap into a complete showcase view. | Supports fast scanning while preserving informed formation decisions. |
| 2026-07-10 | Confirmed | Battlefield layout | Mobile battle uses a portrait 3-over-3 compressed-card layout. | Matches the existing thumbnail geometry and avoids requiring landscape rotation or sprites. |
| 2026-07-10 | Confirmed | Battle MVP | Results showcase an MVP based on distinctive contributions beyond raw damage or total stats. | Creates memorable stories around individual collectible cards. |

## Immediate Discovery Order

1. Define maximum HP and the POW-versus-DEF damage relationship.
2. Decide critical-hit, miss, and damage-variance rules.
3. Load representative card stat profiles into a battle simulator.
4. Test SPD qualification forms, charge curves, and bonus-attack frequency.
5. Build one ordinary Daily Skirmish encounter on paper.
6. Simulate battle duration and stat value.
7. Design the first Challenge encounter.
8. Design the first Seasonal Boss structure.
9. Define rewards, energy cost, failure cost, and repeat-play rules.
10. Only then prepare an implementation specification.
