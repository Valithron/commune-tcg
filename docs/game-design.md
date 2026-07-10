# Commune TCG Game Design

Living design document for the Commune TCG gacha branch.

This document captures the current game model, design laws, open questions, and implementation direction. It should be updated as the design evolves. The goal is to keep the game's purpose and mechanics from living only in chat threads.

## Current Project Framing

**✨ Commune TCG is best understood as a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social/anime themed worldbuilding. ✨**

It is not currently intended to become a deep competitive tabletop TCG. The current target is a casual-to-midcore daily game where players collect different versions of Commune characters, build small squads, battle daily encounters and seasonal bosses, upgrade favorite cards, and grow a personal vault.

## Core Fantasy

Players collect themed variants of Commune characters across different card lines.

The strongest comparison points are:

- Fire Emblem Heroes: pull characters, build teams, battle in short daily sessions.
- Idle RPGs: daily rewards, upgrades, light progression, optional longer play.
- League of Legends skin lines: the same characters expressed through different thematic worlds, not a unified crossover multiverse.

The game should feel like premium anime gacha, with epic presentation and room for absurd/social humor.

## Design Laws

### 1. The heart of the game is character collection

The main emotional hook is wanting specific versions of specific Commune characters, not merely chasing the strongest stat block.

Examples:

- A player wants a favorite version of Cydney.
- A player collects every Ryan variant.
- A player builds around a weird rare Cooper card.
- A player wants to complete a seasonal line.

### 2. Lines are themed expressions, not a chaotic multiverse

Card lines should work like thematic skin lines. They can reinterpret the same characters in different worlds or aesthetics without requiring one unified crossover story.

Example line types:

- Full lines: usually include all 7 Commune members unless the theme does not fit one or more characters.
- Mini lines: duos, trios, or partial groups.
- Solo features: single-character chase cards, birthday cards, event cards, or boss cards.

### 3. Cards do not use rigid battle classes yet

The game should not currently store Role as a hard gameplay trait.

A card's practical battlefield role should emerge from:

- Character
- Type
- Stat spread
- Rarity
- Later, abilities
- Later, items or buffs if added

For example:

- Shadow Cydney with high DEF may function as a tank.
- Radiant Cydney with regen may function as support.
- Flame Cydney with high ATK may function as a burst attacker.

The UI may describe likely role behavior, but role should not control battle logic yet.

### 4. Any character can appear in any type, but each card template needs an approved type identity

A character is not locked to one type. A necromancer Ryan can be Shadow. A holy paladin Ryan can be Radiant. The card art and theme should inform type.

However, each specific card template should have an admin-approved type or type pool. This prevents meaningless randomness while preserving variety.

### 5. User submissions create flavor and art; admin/system controls power

Because users can submit cards, there must be a hard wall between creative submission and game balance.

Submitters may suggest:

- Card name
- Character
- Art
- Flavor/lore
- Type or type pool
- Rarity

Admin/system must control or approve:

- Final rarity
- Final type pool
- Stat profile
- Pull pool eligibility
- Evolution eligibility
- Future abilities

This prevents user-uploaded cards from exploiting the game system.

### 6. Casual players should never feel stupid; strategy players should never feel pointless

The game should support both casual users and more strategic users.

Casual layer:

- Clear card art
- Simple rarity
- Easy daily rewards
- Recommended squads later
- Simple type advantage indicators

Strategy layer:

- Type matchups
- Stat optimization
- Native rarity bonuses
- Evolution decisions
- Boss weaknesses
- Later, abilities and synergies

## Core Game Loop

A normal daily session should take about 5 to 10 minutes, with optional longer play.

Target daily loop:

1. Claim passive income or passive rewards.
2. Do daily free pull.
3. Spend energy on battles.
4. Complete daily missions.
5. Upgrade, evolve, deconstruct, or favorite cards.
6. Optionally play longer through minigames, extra battles, collection management, or seasonal events.

## Card Model

### Card Template

A card template is the possible card in the library.

Suggested fields:

- Template ID
- Character
- Card line / set
- Card name
- Art
- Creator attribution
- Suggested rarity
- Approved/native rarity band
- Suggested type or type pool
- Approved type pool
- Base stat profile or stat ranges
- Pull pool eligibility
- Evolution eligibility
- Future ability slot
- Flavor text/lore

### Owned Card Instance

An owned card instance is the actual copy in a user's vault.

Suggested fields:

- Owned card ID
- Owner/user ID
- Template ID
- Rolled type from the approved type pool
- Rolled stats
- Native rarity
- Current rarity
- Level
- XP
- Upgrade/evolution state
- Locked/favorited status
- Created/pulled timestamp

### Owned Copy Variation

Pull-time variation should be narrow and should not become IV hunting.

The card template controls the allowed identity of the card. The owned card instance may preserve copy-specific traits, but two copies of the same card should not feel like one is ruined and the other is perfect.

Current accepted direction:

- Template identity should not change at pull time.
- If a template has an approved type pool, the owned copy may roll a type from that pool.
- Each rarity has a static Level 1 total stat budget.
- Pull-time total stat budget variance equals that rarity's growth-per-level value.
- Example: Common has a static Level 1 budget of 30 and growth of +2, so Common rolls 28-32.
- The variance should be visible through stats, but the UI should not use bad-roll, IV, perfect-roll, or god-roll framing.
- Copy traits such as foil, holo, mint, or future special treatments should be copy-specific and separate from stat strength.
- Origin rarity and origin bonus are preserved.
- Level, XP, locked/favorited status, and progression are owned-copy specific.

Duplicates should be stored with enough internal detail to preserve copy-specific traits, but the UI should group normal duplicates together unless a copy is special, locked, leveled, favorited, foil/holo, or otherwise unusual.

## Rarity Model

Current rarity tiers:

1. Common
2. Uncommon
3. Rare
4. Legendary
5. Mythic

Epic is not currently included. It can be reconsidered later if the jump from Rare to Legendary feels too large.

### Native Rarity vs Current Rarity

A card should track both native rarity and current rarity.

- Native rarity: what the card was pulled as. Permanent.
- Current rarity: what the card has evolved into.
- Origin bonus: a small permanent bonus based on native rarity.

Design intent:

- A Common evolved to Legendary can become strong and emotionally worthwhile.
- A native Legendary should still feel more special than an evolved Legendary.
- Mythic should remain exceptional.

### Current Accepted Rarity and Progression Config

The current first-test direction uses a static Level 1 total stat budget for each rarity, with pull-time variance equal to that rarity's growth-per-level value.

Common remains centered at 30. For Uncommon through Mythic, the static budget is the median of the previously accepted Level 1 range.

| Rarity | Static Level 1 budget | Pull-time budget range | Max level | Growth per level | Origin bonus |
| --- | ---: | ---: | ---: | ---: | ---: |
| Common | 30 | 28-32 | 30 | +2 total stats | 0% |
| Uncommon | 44 | 41-47 | 40 | +3 total stats | 3% |
| Rare | 63 | 59-67 | 50 | +4 total stats | 5% |
| Legendary | 71 | 66-76 | 60 | +5 total stats | 7% |
| Mythic | 80 | 74-86 | 70 | +6 total stats | 10% |

Design intent:

- Starting stat budget should be only a little better by rarity.
- Level 1 rarity gaps should be tight, especially between Rare, Legendary, and Mythic.
- Rarity advantage should come mainly from higher max level, stronger growth, and origin bonus.
- Future ability strength may also matter, but abilities are not being designed around yet.
- These numbers are accepted for the first test pass and should be rechecked with a math simulator before evolution is implemented.

### Rarity Assignment at Approval

Submission stores a submitter-facing target rarity, but submitters do not choose ATK, DEF, SPD, final rarity, or final power.

Approval uses:

1. Cascading target roll, or
2. Admin manual final rarity override.

Current direction:

- The cascading rarity system is good and should remain.
- Admin final rarity override should remain available.
- Public submitters should not see cascading roll odds.
- Admins may see the cascade table or internal roll details because it helps with review and debugging.

### Current Recommendation

Normal evolution should cap at Legendary.

Mythic should be obtainable only through:

- Pulls
- Special events, if added later
- Major achievements, if added later
- Rare line-completion rewards, if added later

There should be no normal Legendary-to-Mythic evolution path.

## Leveling and XP Model

The current accepted first-test XP curve is the hybrid linear curve:

```txt
XP to next level = 40 + currentLevel × 15
```

There is no rarity XP multiplier in the first version.

Design intent:

- Higher-rarity cards already take longer to max because they have higher max levels.
- Mythics should feel like long-term projects, but not like a punishment for pulling something rare.
- Normal XP leveling should come from playing, not from duplicate pulls.
- Duplicate pulls should matter for evolution, limit-break style systems, shard conversion, or special upgrades later.
- XP overflow should carry forward when a battle grants more XP than needed for the next level.
- For the first version, every card in the battle squad should receive full battle XP.

Approximate total XP from Level 1 to max:

| Rarity | Max level | Total XP to max |
| --- | ---: | ---: |
| Common | 30 | 7,830 |
| Uncommon | 40 | 13,130 |
| Rare | 50 | 19,930 |
| Legendary | 60 | 28,230 |
| Mythic | 70 | 38,030 |

Battle XP payout values are not settled yet.

## Duplicate and Shard Model

Duplicates should be useful, not purely disappointing.

Current accepted material hierarchy:

- Exact duplicate: strongest upgrade material.
- Same-character shard: medium-strength upgrade material.
- Universal dust: weakest but most flexible upgrade material.

Example design direction:

- Exact duplicates can substitute for multiple shards.
- Character shards help upgrade any card of that character.
- Universal dust can fill gaps at a worse exchange rate.
- Normal duplicates should be grouped in the UI, but internally preserved well enough to avoid losing special copy traits.

This avoids requiring only exact duplicates while still preserving card identity.

## Type Model

Types are the matchup identity of a card.

The current selected type system is the elemental anime set. Exact labels may be refined later, but the core identities and color mapping are accepted.

| Type | Color | Core identity |
| --- | --- | --- |
| Flame | Red | Power, aggression, burst damage |
| Tide | Blue | Flow, healing, control |
| Bloom | Green | Growth, sustain, nature |
| Volt | Yellow | Speed, energy, disruption |
| Shadow | Black | Evil defense, drain, corruption, sacrifice, tricks |
| Radiant | White or gold | Healing, protection, holy or heroic power |
| Neutral | Tan | Balanced, mundane, flexible, comedy cards |

Current principles:

- Type should be based on art/theme.
- Submitters may suggest one to three possible types.
- Admin approves the final type or type pool.
- Owned copies may roll from the approved type pool.
- Type should help create a card's organic battlefield role.
- Type colors should be simple and immediately readable in the UI.
- The older archetype inference model should be removed. The 7-type system is the source of stat identity.

### Type Matchup Modifier

The current target type modifier is:

- Type advantage: +15% effectiveness.
- Type disadvantage: -5% effectiveness.
- Total swing between advantage and disadvantage: 20 percentage points.
- Neutral matchup: no modifier.

Design intent:

- Type should matter enough for strategic players to optimize squads.
- Type should not punish casual players so heavily that favorite cards feel unusable.
- The first user-testable version should start with this moderate modifier before increasing matchup penalties.

### Current Accepted Type Matchup Chart

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

- `+` means the attacker has advantage.
- `-` means the attacker has disadvantage.
- `=` means the matchup is neutral.

Reasoning summary:

- **Flame** beats **Bloom** because fire burns growth, and beats **Shadow** because flame reveals and drives back darkness.
- **Flame** loses to **Tide** because water douses fire, and loses to **Radiant** because radiant order/discipline contains raw flame.
- **Tide** beats **Flame** because water extinguishes fire, and beats **Radiant** because water refracts and erodes rigid light/protection.
- **Tide** loses to **Bloom** because growth thrives on water, and loses to **Volt** because electricity punishes conductive water.
- **Bloom** beats **Tide** because plant life drinks water, and beats **Volt** because roots/earth ground unstable electricity.
- **Bloom** loses to **Flame** because fire burns nature, and loses to **Shadow** because blight/corruption weakens living growth.
- **Volt** beats **Tide** because electricity conducts through water, and beats **Radiant** because fast unstable energy overloads radiant shields/order.
- **Volt** loses to **Bloom** because growth and rooted earth ground it, and loses to **Shadow** because shadow disrupts and smothers unstable energy.
- **Shadow** beats **Bloom** because blight corrupts life, and beats **Volt** because concealment/drain disrupts unstable energy.
- **Shadow** loses to **Flame** because fire exposes it, and loses to **Radiant** because radiance purges darkness.
- **Radiant** beats **Shadow** because light purifies darkness, and beats **Flame** because divine/ordered power contains reckless fire.
- **Radiant** loses to **Tide** because water flow/refraction erodes rigid protection, and loses to **Volt** because overload disrupts radiant shielding.
- **Neutral** has no strengths and no weaknesses. It is deliberately stable and easy to understand.

### Current Accepted Type Stat Tendencies

Types should influence stat identity modestly, while rarity, level, and native rarity still do most of the power work.

Important implementation direction:

- Type stat percentages should be treated as stat-budget allocation bias, not final stat multipliers.
- Type should change how the total stat budget is distributed across ATK, DEF, and SPD.
- Type should not usually increase the final total stat budget by itself.

Current accepted rule of thumb:

- Primary stat bias: about +10% toward that stat's share of the budget.
- Secondary stat bias: about +5% toward that stat's share of the budget.
- Tradeoff bias: about -5% away from that stat's share of the budget when needed.
- Neutral: no bias.

| Type | ATK tendency | DEF tendency | SPD tendency | Notes |
| --- | ---: | ---: | ---: | --- |
| Flame | +10% | -5% | 0% | Harder-hitting, slightly more fragile |
| Tide | 0% | +5% | +5% | Flexible, evasive, control/support flavor |
| Bloom | 0% | +10% | -5% | Defensive sustain, healing/support identity later |
| Volt | +5% | -5% | +10% | Fast, tempo-oriented, more fragile |
| Shadow | 0% | +10% | -5% | Evil defense, tricky survival, drain/sacrifice identity later |
| Radiant | +5% | +5% | 0% | Balanced, heroic, support-capable |
| Neutral | 0% | 0% | 0% | Stable, flexible, no special stat bend |

Bloom and Shadow can share a defensive stat bias for the first test version. Their deeper differentiation should come later through abilities and mechanics:

- Bloom: healing, sustain, growth, protection.
- Shadow: drain, sacrifice, corruption, dirty survival.

## Battle Model

Current target: light strategy.

### Squad

A battle squad should use 3 cards.

Each card contributes:

- ATK
- DEF
- SPD
- Type
- Rarity/current rarity
- Level
- Future abilities, later

### Encounters

Initial battle targets:

- Random enemies
- Seasonal bosses

Possible future target:

- User PvP, but not now.

### Battle Strategy

Battle should eventually consider:

- Total squad strength
- Type matchups
- Stat spreads
- Enemy weakness/resistance
- Random variance
- Energy cost

Initial type matchup balance target:

- Advantage: +15% effectiveness.
- Disadvantage: -5% effectiveness.
- Total swing: 20 percentage points.

Abilities are intentionally deferred until type matchups and stat ranges feel good.

### Future Damage Categories

A future battle pass may add two damage categories:

| Damage category | Meaning |
| --- | --- |
| Physical | Weapon hits, punches, athletic attacks, martial moves, mundane force |
| Mystic | Spells, alchemy, holy power, shadow drain, curses, supernatural or symbolic effects |

Current accepted direction:

- Physical and Mystic should be attack or ability tags, not new core stats.
- Do not add separate Physical Attack, Mystic Attack, Physical Defense, or Mystic Defense stats in the first version.
- ATK, DEF, and SPD remain the core stat model.
- Damage categories should not be implemented until the first battle model works.
- Damage categories may later interact with enemy weaknesses, resistances, card abilities, and boss design.
- Initial future modifiers should be modest if added, such as +10% into a weakness or -10% into a resistance.

Design intent:

- Type answers what elemental or anime identity the card has.
- Damage category answers how the card applies damage.
- A Flame card could be Physical or Mystic.
- A Shadow card could be Physical or Mystic.
- This keeps Ryan's two-damage-type idea available without disrupting the current stat foundation.

## Economy

Current or planned currencies:

- Gold
- Pull tickets
- Shards/dust
- Energy

### Gold

Main general currency. Earned from battles, missions, passive systems, and possibly events.

Uses:

- Buy pull tickets
- Pay for basic upgrades
- Possibly pay for minor shop items

### Pull Tickets

Used for card pulls.

Sources:

- Daily free pull
- Missions
- Gold shop
- Rare battle drops
- Events

### Shards/Dust

Used for upgrades and evolution.

Sources:

- Deconstructing duplicates
- Missions
- Events
- Possibly passive/minigame systems later

### Energy

Used to limit battle attempts and pace daily play.

Players should still have optional activities while waiting for energy or should be able to earn/replenish energy through rewards.

## Passive and Minigame Systems

Passive farming/gardening and smaller active minigames are desired, but not yet defined.

Possible activities:

- Gardening/passive farming
- Fishing
- Other light minigames

Initial recommendation:

- Passive systems should start by producing gold.
- More specialized materials can be added later after the economy is better understood.

## Collection and Vault Goals

The vault should support multiple flex modes:

- Favorite cards
- Rarest cards
- Highest power
- Collection completion
- Recently pulled
- Character filter
- Line filter
- Type filter
- Rarity filter

The default vault experience should feel like a trophy room, not only a spreadsheet.

## Character-Focused Progression

Players should eventually be rewarded for focusing on favorite characters.

Possible systems:

- Character collection bonuses
- Character mastery
- Character badges
- Profile titles
- Small bonuses for using or collecting a character

Example:

- Own 3 Cydney cards: small Cydney-related bonus.
- Own 5 Cydney cards: unlock Cydney badge or title.
- Use Cydney cards in battle: gain Cydney mastery.

This system is not yet designed.

## Line Completion Rewards

Line completion should matter.

Possible rewards:

- Badges
- Gold bonus
- Pull tickets
- Profile titles
- Card backs
- Vault frames
- Exclusive cards for very special lines

Exclusive cards should be used carefully because they complicate balance.

## Trading

Trading is not recommended for the near future.

Risks:

- Exploits
- Alt accounts
- Social pressure
- Value disputes
- Uneven collections
- Future real-money gray market risk

If trading is ever added, safer alternatives should be considered first:

- Gifting low-rarity duplicates
- Sending dust
- Limited friend trades
- Trade tokens
- No Mythic trading
- Cooldowns before trading newly pulled cards

## Admin Mechanics Simulator

An admin mechanics simulator is a good planned tool before implementing evolution.

First version should simulate:

- Rarity
- Origin rarity
- Level
- Type
- Stat budget
- Type stat allocation bias
- Origin bonus
- XP to next level and total XP to max
- Effective ATK, DEF, and SPD
- Comparison against another card

First version should not include abilities, evolution costs, or shards unless those systems are already mathematically settled.

## User-Testing Priority

Before adding abilities or deeper systems, the game should first test whether this spine feels good:

- 3-card squads
- Type matchups
- Rarity/stat ranges
- Native rarity bonus
- XP curve
- Energy
- Gold
- Pull tickets
- Duplicates
- Shards/dust
- Evolution
- Vault filtering/display

## Open Questions

1. How much XP should battles, missions, and passive systems award?
2. How exactly should evolution costs work across duplicates, character shards, universal dust, gold, and other materials?
3. Should evolved lower-rarity cards use the same current-rarity stat budget as natural cards, relying on origin bonus for natural-card superiority?
4. How should seasonal bosses reward players?
5. What should passive farming produce beyond gold, if anything?
6. What should character mastery/favorite-character progression look like?
7. Should every card line have its own pool, or should there be a general pool plus limited banners?

## Current Near-Term Direction

Do not build abilities yet.
Do not add Epic rarity yet.
Do not overbuild passive farming yet.
Do not add trading yet.
Do not implement evolution yet.
Do not implement Physical and Mystic damage categories yet.

Next likely design priorities:

1. Run a math pass on the accepted rarity, growth, origin bonus, type allocation-bias, narrow pull-time variance, and XP curve model.
2. Define battle XP, mission XP, and passive XP payout values.
3. Define duplicate/shard/evolution costs.
4. Define the first testable battle model.
5. Define the vault grouped-copy display model.
6. Plan the admin mechanics simulator.

## Canonical Stat Terminology

The three permanent core stats are:

- **ATK** controls offensive output.
- **DEF** controls durability or damage resistance, pending the final combat formula.
- **SPD** controls initiative and potential speed-focused mechanics.
- **Power** is the combined ATK + DEF + SPD total for one card.
- **PWR** is the compact abbreviation for Power when space is limited.
- **Squad Power** is the combined Power of all selected cards.
- **Effective Power** or **Matchup Power** is a temporary encounter-adjusted value after type modifiers or other temporary effects.

A card's permanent Power must remain distinct from its temporary Effective Power. The UI must not present an encounter-adjusted result as though the permanent card value changed.

### Internal compatibility

Existing code, D1 payloads, generated card JSON, normalizers, progression systems, simulations, and API responses may continue using `pow`, `stats.pow`, `baseStats.pow`, and `effectiveStats.pow`. The internal `pow` key is the canonical compatibility field for the offensive stat; **ATK** is the official player-facing term. Existing aliases such as `power`, `attack`, `atk`, and `strength` remain accepted where normalization already supports them.
