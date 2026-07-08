# Card Mechanics Contract

This document defines the current trait ownership model for the Gacha branch.

## Rule

Approval controls balance. Pulling controls ownership and collectible variation.

Users may suggest a target rarity and up to 3 types at submission, but approval is the balance gate. Admin review can either roll from the target rarity table or manually override the final rarity, and admin review chooses the approved type pool used for pull-time type rolling.

Pulling must not reroll base rarity. Pulling may roll narrow owned-copy POW/DEF/SPD budget variance inside the approved rarity's allowed range. Pulling may also roll one owned-copy type from the approved type pool.

## Rarity assignment

Submission stores `rarity_suggestion` as the user's requested target rarity.

Approval uses one of two paths:

1. Cascading target roll from the approved target rarity.
2. Admin final rarity override.

Current cascading confirmation chances:

```text
Common target:    100% Common
Uncommon target:  45% Uncommon -> 100% Common
Rare target:      20% Rare -> 55% Uncommon -> 100% Common
Legendary target:  8% Legendary -> 25% Rare -> 55% Uncommon -> 100% Common
Mythic target:     3% Mythic -> 12% Legendary -> 35% Rare -> 65% Uncommon -> 100% Common
```

Admin override skips the cascading roll and directly assigns the selected final rarity.

## Type model

Submission lets users suggest 1 to 3 types. Admin review chooses the approved type pool, also 1 to 3 types. The Library template stores the full approved pool and uses the first approved type as its primary display/stat-preview type. Each pulled Vault copy rolls one actual type from the approved pool at pull time.

Current accepted types:

| Type | Color | Core identity |
| --- | --- | --- |
| Flame | Red | Power, aggression, burst damage |
| Tide | Blue | Flow, healing, control |
| Bloom | Green | Growth, sustain, nature |
| Volt | Yellow | Speed, energy, disruption |
| Shadow | Black | Evil defense, drain, corruption, sacrifice, tricks |
| Radiant | White or gold | Healing, protection, holy or heroic power |
| Neutral | Tan | Balanced, mundane, flexible, comedy cards |

Type affects stat-budget allocation bias only. It does not change total stat budget.

Current stat allocation tendencies:

| Type | POW tendency | DEF tendency | SPD tendency |
| --- | ---: | ---: | ---: |
| Flame | +10% | -5% | 0% |
| Tide | 0% | +5% | +5% |
| Bloom | 0% | +10% | -5% |
| Volt | +5% | -5% | +10% |
| Shadow | 0% | +10% | -5% |
| Radiant | +5% | +5% | 0% |
| Neutral | 0% | 0% | 0% |

## Battle effective stats and type matchups

Phase 6 makes Battle use the mechanics model instead of stale top-level stats when mechanics metadata exists.

Battle stat resolution:

1. Read owned Vault card JSON.
2. If the card has mechanics metadata, calculate effective stats from `baseStats`, `copyTraits`, `progression.level`, `progressionRules`, and `originBonusPercent`.
3. If the card is legacy-only, fall back to legacy `stats/pow/def/spd + level` behavior.
4. Use effective stat total as base battle power for mechanics cards.
5. Apply type matchup modifier against the encounter enemy type.
6. Compare matchup-adjusted squad power against enemy power.

Current matchup modifiers:

- Advantage: +15% battle power.
- Disadvantage: -5% battle power.
- Neutral: 0%.

Current typed mock encounters:

```text
Training Yard Goblin: Neutral
Calendar Hydra: Shadow
Storm Forge Wyrm: Flame
```

Frontend preview and backend reward settlement both use the same Phase 6 idea: effective stats first, then type matchup-adjusted battle power.

## Stat budget and progression config

Approved rarity determines the static template budget, pull-time owned-copy budget range, max level, growth per level, and origin bonus.

```text
Common:    static 30, owned roll 28-32, max level 30, +2 total stats per level,  0% origin bonus
Uncommon:  static 44, owned roll 41-47, max level 40, +3 total stats per level,  3% origin bonus
Rare:      static 63, owned roll 59-67, max level 50, +4 total stats per level,  5% origin bonus
Legendary: static 71, owned roll 66-76, max level 60, +5 total stats per level,  7% origin bonus
Mythic:    static 80, owned roll 74-86, max level 70, +6 total stats per level, 10% origin bonus
```

Approval uses the static budget so the Library template stays stable. Pulling rolls the owned-copy budget inside the allowed range.

The system distributes the stat budget into POW/DEF/SPD using the selected type's stat allocation bias. For Library templates, the selected type is the first approved type. For pulled Vault copies, the selected type is rolled from the approved type pool.

Legacy inputs like `support`, `battle`, `defense`, `training`, and `utility` are normalized into the accepted 7-type model for compatibility.

## XP and leveling

Phase 5 aligns battle XP with the accepted hybrid curve.

```text
XP to next level = 40 + currentLevel * 15
```

Rules:

- No rarity XP multiplier in this version.
- Every selected squad card receives the full encounter XP amount.
- XP is not split between squad members.
- XP is cumulative lifetime XP in `card_json.xp`.
- XP overflow carries through multiple level-ups.
- Leveling caps at the card's own `maxLevel`, `max_level`, `levelCap`, or `progressionRules.maxLevel`.
- Battle reward writes update top-level `xp` and `level`, plus nested `progression.xp` and `progression.level` when present.

## Template traits

Template traits belong to the global Library card. They are created at admin approval.

Current template traits:

- name
- creator attribution
- character
- suggestedTypePool
- approvedTypePool
- primary type/category
- typeLabel
- typeColor
- typeIdentity
- typeStatBias
- art/crop data
- rarity
- targetRarity
- raritySource
- baseStats from the static rarity budget and primary approved type
- statBudget
- staticStatBudget
- ownedStatBudgetRange
- copyStatBudgetVariance
- statArchetype, temporarily retained as a compatibility mirror of type
- progressionRules
- originRarity
- originBonusPercent
- stats, kept for backward compatibility
- top-level pow/def/spd, kept for backward compatibility
- ability/mechanic text
- flavor text

Approved cards should include rarity, type metadata, baseStats, progressionRules, origin metadata, and backward-compatible `stats`, `pow`, `def`, and `spd` fields.

## Owned copy traits

Owned copy traits belong to one player's Vault copy. They are created at pull time.

Current owned copy traits:

- owner_user_id
- ownerDisplayName
- owned
- level
- xp
- copies
- pull_id
- pulled_at
- copyTraits
- progression
- copied progressionRules
- copied origin metadata
- approvedTypePool
- selectedType
- selectedTypeSource
- templateBaseStats
- owned-copy baseStats from pull-time budget and selected type

## Effective stats

Effective stats are calculated from:

- baseStats
- progression.level
- progressionRules.growthPerLevel
- copyTraits.statBonus
- originBonusPercent

Current level-growth implementation distributes total growth across POW/DEF/SPD. Ability scaling, evolution formulas, equipment, buffs, and debuffs are not implemented yet.

## Compatibility rule

Do not remove these fields yet:

- rarity
- type
- card_type
- stats
- pow
- def
- spd
- level
- xp
- copies

CardFrame, Library, Vault, and Battle still rely on those legacy-safe fields.

## Not implemented yet

These are intentionally not settled in this pass:

- Rarity evolution / promotion
- Duplicate merge versus separate copy rules
- Wild shards or duplicate substitute resources
- Foil/holo visual display
- Real sequential mint numbers
- Ability strength by rarity
- Ability effects in battle
