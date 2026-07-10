# Commune TCG Battle Design V2 Simulation Addendum

This addendum records the first full 3-on-3 formation simulation pass for the accepted battle package. It is design documentation only and does not authorize combat implementation.

Primary authority remains `docs/battle-design.md`. These findings should be merged into that living document during the next direct document-maintenance pass.

## Simulation Scope

### Squads

Squad A, 138 Squad Power:

- Mermilf, Tide, Legendary, 27 ATK, 27 DEF, 25 SPD
- Fire Fox, Flame, Common, 11 ATK, 10 DEF, 10 SPD
- Ramen Specialist, Bloom, Common, 9 ATK, 10 DEF, 9 SPD

Squad B, 136 Squad Power:

- Infinidagger!, Volt, Rare, 22 ATK, 18 DEF, 23 SPD
- Galilee Mount, Radiant, Uncommon, 14 ATK, 13 DEF, 14 SPD
- Nevermore Command, Shadow, Common, 10 ATK, 12 DEF, 10 SPD

All 36 formation pairings were tested with 500 seeded trials each, for 18,000 full battles.

### Active rules

- Level 1 universal HP of 240
- Raw damage = 20 + ATK × 2.5
- DEF multiplier = 40 / (40 + DEF)
- Normal variance = ±5%
- Base crit chance = 5%
- SPD-specialization crit bonus, capped at 10%
- Crit damage = 1.5×
- Type advantage = 1.08×
- Type disadvantage = 0.97×
- Strict opening lane targets
- Natural reinforcement on later scheduled turns
- No sampled card qualified for Follow-Up

### Neutralized unresolved details

The simulation did not canonize unresolved implementation details.

- Equal-SPD priority was split evenly across trials to avoid granting either squad a hidden systemic advantage.
- Equal-HP center reinforcement ties were split evenly across trials.
- Damage retained decimals internally. Display rounding remains an implementation question.

## Confirmed Simulation Findings

### Overall outcome

- Squad A win rate: 84.3%
- Squad B win rate: 15.7%
- Average first knockout: round 4.20
- First-knockout distribution:
  - Round 3: 5.5%
  - Round 4: 69.0%
  - Round 5: 25.5%
- Average battle length: 7.27 rounds
- Battle-length distribution:
  - 5 rounds: 0.5%
  - 6 rounds: 14.9%
  - 7 rounds: 45.2%
  - 8 rounds: 36.2%
  - 9 rounds: 3.2%
- Average winning-side remaining HP: 93.6 total HP
- Average winning survivors: 1.58 cards

The nearly equal Squad Power totals do not produce a nearly even battle. Squad A concentrates much more of its power in one Legendary ace. Natural reinforcement lets that concentration convert one lane win into cross-lane cleanup.

### Reinforcement behavior

- Every simulated battle included at least one reinforcement attack.
- Average reinforcement attacks per battle: 4.67
- Average reinforcement damage per battle: 216.8
- A paired independent-lane comparison produced the opposite expected majority winner in 62.5% of trials.

The independent-lane comparison is diagnostic rather than an alternate game rule. It shows that reinforcement is not merely resolving close leftovers. It is frequently the primary determinant of the squad result.

### Formation effect

Formation meaningfully changes outcomes.

- Worst observed Squad A formation pairing: 56.4% win rate
- Best observed Squad A formation pairing: 100.0% win rate
- Mermilf average win rate by placement:
  - Left: 83.3%
  - Center: 85.0%
  - Right: 84.5%

Center gives Mermilf a small aggregate advantage, but it is not an automatic dominant slot. Its strategic value comes from flexible access to either side and the lower-HP rescue rule.

The more important variable is matchup routing. Formation controls which enemy Mermilf defeats first, how much HP remains afterward, and which allied lane receives the first reinforcement.

### First lane to break

Across all balanced formation enumeration, the first defeated lane was evenly distributed:

- Left: 33.3%
- Center: 33.4%
- Right: 33.3%

This does not mean lanes are strategically identical. It reflects that every card occupied every lane equally across the full formation set. Individual formations still produced sharply different first-break patterns.

### MVP frequency

Using a diagnostic contribution score that considered damage, knockouts, first lane win, reinforcement damage, and survival:

- Mermilf: 84.3%
- Infinidagger!: 10.7%
- Galilee Mount: 4.4%
- Nevermore Command: 0.6%
- Fire Fox and Ramen Specialist did not win MVP in this sample

This confirms the intended ace-carry fantasy, but also shows that the current reinforcement structure can suppress supporting-card identity when one card is dramatically stronger.

## Lane Forecast Feasibility

Honest lane forecasts are feasible, but they should describe expected duel quality rather than guarantee the final squad result.

Representative isolated-lane win rates for Squad A:

| Squad A card | Squad B card | A lane win rate | Forecast |
| --- | --- | ---: | --- |
| Mermilf | Infinidagger! | 99.1% | Favored |
| Mermilf | Galilee Mount | 100.0% | Favored |
| Mermilf | Nevermore Command | 100.0% | Favored |
| Fire Fox | Infinidagger! | 0.0% | Risky |
| Fire Fox | Galilee Mount | 0.0% | Risky |
| Fire Fox | Nevermore Command | 67.3% | Favored |
| Ramen Specialist | Infinidagger! | 0.0% | Risky |
| Ramen Specialist | Galilee Mount | 0.0% | Risky |
| Ramen Specialist | Nevermore Command | 0.1% | Risky |

Suggested first forecast bands:

- Favored: estimated lane win chance of 65% or higher
- Even: 36% to 64%
- Risky: 35% or lower

Forecasts must remain explicitly non-guaranteed. They should not include hidden reinforcement assumptions unless the UI separately presents a broader formation forecast.

## Game-Design Interpretation

### Good decisions created

- Matching Fire Fox into Nevermore Command creates a real, readable favorable lane rather than sacrificing Fire Fox into a superior card.
- Choosing Mermilf's first target changes how quickly the ace becomes available to reinforce.
- Center placement creates flexible rescue potential without becoming mandatory.
- Players can understand why a formation worked by observing the first lane break and reinforcement route.

### Dominant behavior

The strongest general strategy in this sample is:

> Place the strongest ace where it wins quickly and emerges with enough HP to attack multiple lanes.

This is strategically legitimate and supports the collection fantasy. It becomes a problem only if it consistently makes the other two squad slots feel decorative.

### False choices

A lane forecast alone can imply that winning two opening lanes is the objective. In the current system, that can be false. A single overwhelmingly strong lane winner may overturn two losing lanes through reinforcement.

The formation screen therefore should not present three lane forecasts as though they are three independent votes. It should teach that early lane victories can create reinforcement pressure.

### Breakpoints and determinism

- Mermilf defeats the lower-rarity enemies in roughly four attacks and usually retains enough HP to continue carrying.
- Fire Fox versus Nevermore Command is the only genuinely contestable low-rarity pairing in this sample.
- Ramen Specialist loses almost every available lane, so its formation decision is primarily about delaying the enemy and shaping reinforcement timing.
- The +8% and -3% type package is not causing the imbalance. Rarity and stat concentration are the dominant forces.

### Snowball risk

The first lane victory creates substantial snowballing. This is not automatically excessive because ace carries are desirable. The warning sign is that reinforcement reversed the expected independent-lane majority in 62.5% of paired trials.

The system needs more testing with:

- Three balanced cards versus three balanced cards
- Two medium-strength cards plus one weak card against one ace plus two weak cards
- Higher-level squads
- DEF-heavy squads
- True SPD specialists with Follow-Up
- Multiple card pools, not only these seven examples

## Recommendation

### Keep unchanged for the next test pass

Keep the current core combat package unchanged:

- HP formula
- Raw damage formula
- DEF formula
- ±5% variance
- Crit package
- +8% and -3% type package
- Current SPD Follow-Up eligibility and 30% strike

The package produces the intended 5-to-7-hit comparable duels and 7-to-8-round full battles. Changing the damage math would treat the symptom rather than the structural cause.

### Serious leading proposal

Test an off-lane reinforcement-efficiency modifier only if broader simulations confirm that ace concentration dominates too strongly.

Candidate test values:

- 100% off-lane damage: current control
- 85% off-lane damage: mild support tax
- 70% off-lane damage: strong support tax

This should be tested as an isolated variable. It is not confirmed.

Preferred terminology if used:

- Home-lane attack: normal attack
- Cross-lane attack: Assist Attack

A penalty must be communicated visibly. Hidden reduced damage would make combat feel inconsistent.

### Rejected immediate reactions

- Do not reduce Mermilf's stats because she performed like a Legendary.
- Do not increase type penalties to counter rarity concentration.
- Do not give losing lanes artificial survival protection.
- Do not remove reinforcement after one sample.
- Do not normalize squads by Squad Power during combat.
- Do not grant free attacks on lane victory.

## Daily Skirmish Encounter 01: Crossroads Patrol

### Purpose

Teach lane forecasts, formation lock, first lane victory, and natural reinforcement without requiring abilities.

### Encounter identity

- Mode: Daily Skirmish
- Name: Crossroads Patrol
- Recommended Squad Power: approximately 90 to 110
- Energy cost proposal: 1
- Expected battle length: 30 to 45 seconds at 1×, 18 to 28 seconds at 2×
- Repeatable: yes
- First-clear bonus: yes, once per daily reset

### Enemy formation

Left:

- Flame Common
- Moderate ATK, low DEF, average SPD
- Forecast lesson: vulnerable to Tide, dangerous to Bloom

Center:

- Neutral Uncommon
- Balanced stats
- Forecast lesson: no type shortcut; use raw card quality

Right:

- Shadow Common
- Higher DEF, lower SPD
- Forecast lesson: Radiant or Flame can create an earlier lane break

### Encounter modifier

No hidden stat modifier.

Visible rule card:

> First lane winners reinforce adjacent lanes on their next turn.

This encounter should teach the normal battle rules rather than introduce a gimmick.

### Reward proposal

Base victory:

- 20 Gold
- 18 XP to each squad card
- Small chance of universal dust

First victory of the day:

- Additional 40 Gold
- Additional 12 XP to each squad card
- One small character-shard bundle or equivalent early progression material

Defeat:

- No full material reward
- 25% of normal card XP to reduce frustration and preserve the value of trying
- Energy failure cost remains an open economy decision

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

1. Compact top bar
   - Back
   - Encounter name
   - Energy cost
   - Help icon

2. Enemy formation row
   - Three compressed cards in left, center, and right lanes
   - Type, level, rarity, and PWR visible
   - Tap opens showcase inspection

3. Lane forecast band
   - One compact forecast per lane
   - Favored, Even, or Risky
   - Small type relationship icon
   - Reinforcement-path hint appears only after all three player cards are placed

4. Player formation row
   - Three lane slots
   - Tap to select
   - Drag or tap-swap between occupied lanes
   - Selected card receives a clear outline, not only color

5. Squad tray
   - Search
   - Type filter
   - Rarity filter
   - Sort by Power, level, recent, or favorite
   - Saved squad control

6. Sticky action area
   - Squad Power
   - Enemy Squad Power
   - Begin Battle

### Forecast information rule

Do not reduce the formation screen to three green or red labels. A formation can lose two projected lanes and still win through an ace carry.

Add one concise squad-level observation when relevant:

- Strong early reinforcement potential
- Center can support either side
- Two lanes are projected to break early
- Formation relies heavily on one ace

These are explanations, not additional hidden ratings.

### Screen 2: Formation lock transition

- Player cards snap into lanes
- Lane lines illuminate
- `FORMATION LOCKED` appears briefly
- Energy commits at this point
- Enemy and player rows transition directly into the battlefield

Target duration: less than one second before the battle introduction.

### Screen 3: Active battlefield

Top section:

- Three enemy cards
- HP bars directly attached to cards
- Type icon and level
- Status region reserved but empty in version one

Middle section:

- Three lane channels
- Attack trails and impact effects
- Broken-lane state
- Diagonal reinforcement path
- Compact round indicator optional; do not foreground it unless testing shows value

Bottom section:

- Three player cards
- HP bars
- Follow-Up meter only for qualified cards

Persistent controls:

- Pause
- 1× or 2× speed
- Auto indicator

### Interaction

Tapping a card during active combat should pause and open inspection. Combat should not continue behind a modal.

The inspection panel should show:

- Full card
- Current and maximum HP
- ATK, DEF, SPD
- Type relationship against current target
- Current crit chance
- Follow-Up eligibility and meter when relevant
- Concise explanation of active encounter modifiers

### Animation hierarchy

- Normal attack: restrained lane-local motion
- Type advantage: small effectiveness accent
- Crit: sharper impact and brief hit-stop
- Lane victory: clear break and reinforcement arrow
- Reinforcement attack: diagonal trail distinct from home-lane attacks
- Final knockout: strongest battle emphasis

### Accessibility

- Never communicate Favored, Even, Risky, type advantage, or low HP through color alone.
- Support reduced motion.
- Keep damage numbers and HP changes legible at 2× speed.
- Use stable card positions so players can track lanes without chasing moving UI.
- Give pause-and-inspect a large mobile target.

## New Open Questions

1. Does broader testing confirm that cross-lane reinforcement needs a damage-efficiency modifier?
2. Should the UI distinguish `Assist Attack` from a normal home-lane attack?
3. Should formation preview include a squad-level reinforcement observation in addition to lane forecasts?
4. What exact model should generate forecasts without exposing fake precision?
5. Should a forecast use only isolated lane odds, or also surface projected first-break timing?
6. Does the center rescue rule remain strategically distinct when squads are more evenly distributed?
7. What deterministic equal-SPD tie-break is readable and fair?
8. What deterministic equal-HP center tie-break is readable and fair?
9. Is 18 XP per Daily Skirmish card appropriate relative to the accepted XP curve?
10. Does a failed Daily Skirmish consume energy?
11. At what point should 2× speed and repeat-battle controls unlock?
12. Should routine encounters show round count at all?

## Decision Summary

### Confirmed from this pass

- Formation materially changes outcomes.
- Center has distinct but not dominant strategic value.
- Honest lane forecasts are feasible.
- Full battles generally resolve in 7 to 8 rounds.
- The current damage package supports the intended pacing.
- Reinforcement is a major outcome driver.
- Concentrated ace power is more valuable than equal distributed Squad Power under the current reinforcement rules.

### Active test values retained

All existing first-test combat values remain unchanged.

### Serious proposal

Test 85% and 70% off-lane Assist Attack damage against the current 100% control in broader squad simulations.

### Rejected directions

Do not nerf rarity excitement, increase type punishment, add artificial lane protection, or normalize combat by Squad Power.
