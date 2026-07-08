# Commune TCG Game Design

Living design document for the Commune TCG gacha branch.

This document captures the current game model, design laws, open questions, and implementation direction. It should be updated as the design evolves. The goal is to keep the game's purpose and mechanics from living only in chat threads.

## Current Project Framing

**Commune TCG is best understood as a character-collection RPG with TCG presentation, gacha acquisition, light squad battles, and social/anime themed worldbuilding.**

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
- Flame Cydney with high POW may function as a burst attacker.

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

### Current Recommendation

Normal evolution should probably cap at Legendary.

Mythic should likely be obtainable only through:

- Pulls
- Special events
- Major achievements
- Rare line-completion rewards

This is not fully settled yet.

## Duplicate and Shard Model

Duplicates should be useful, not purely disappointing.

Possible material hierarchy:

- Exact duplicate: strongest upgrade material.
- Same-character shard: medium-strength upgrade material.
- Universal dust: weakest but most flexible upgrade material.

Example design direction:

- Exact duplicates can substitute for multiple shards.
- Character shards help upgrade any card of that character.
- Universal dust can fill gaps at a worse exchange rate.

This avoids requiring only exact duplicates while still preserving card identity.

## Type Model

Types are the matchup identity of a card.

The exact type list is not decided yet.

Current principles:

- Type should be based on art/theme.
- Submitters may suggest one to three possible types.
- Admin approves the final type or type pool.
- Owned copies may roll from the approved type pool.
- Type should help create a card's organic battlefield role.

## Battle Model

Current target: light strategy.

### Squad

A battle squad should use 3 cards.

Each card contributes:

- POW
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

Abilities are intentionally deferred until type matchups and stat ranges feel good.

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

## User-Testing Priority

Before adding abilities or deeper systems, the game should first test whether this spine feels good:

- 3-card squads
- Type matchups
- Rarity/stat ranges
- Native rarity bonus
- Energy
- Gold
- Pull tickets
- Duplicates
- Shards/dust
- Evolution
- Vault filtering/display

## Open Questions

1. What is the final type list?
2. Should Common cards evolve all the way to Legendary, or cap at Rare/Legendary depending on template?
3. Should Mythic be pull/event-only?
4. How exactly should stat ranges be derived from rarity, type, character, and template?
5. Should submitters suggest stat personality, or only type/rarity/flavor?
6. How much should character identity influence stats?
7. How much should type influence stats?
8. How should seasonal bosses reward players?
9. What should passive farming produce beyond gold, if anything?
10. What should character mastery/favorite-character progression look like?
11. Should every card line have its own pool, or should there be a general pool plus limited banners?

## Current Near-Term Direction

Do not build abilities yet.
Do not add Epic rarity yet.
Do not overbuild passive farming yet.
Do not add trading yet.

Next likely design priorities:

1. Define the type system.
2. Define rarity/stat ranges.
3. Define native rarity bonuses.
4. Define duplicate/shard/evolution rules.
5. Define the first testable battle model.
6. Define the vault display/filter model.
