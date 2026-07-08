# Card Mechanics Contract

This document defines the current trait ownership model for the Gacha branch.

## Rule

Approval controls balance. Pulling controls ownership and collectible variation.

Users may suggest a target rarity at submission, but approval is the balance gate. Admin review can either roll from the target rarity table or manually override the final rarity.

Pulling must not reroll base rarity. Pulling may roll narrow owned-copy POW/DEF/SPD budget variance inside the approved rarity's allowed range.

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

Phase 2 adds the accepted 7-type foundation.

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

The accepted matchup chart is centralized in `functions/_shared/type-config.js`, but Battle does not use it yet.

Current matchup modifiers, for a later Battle phase:

- Advantage: +15% effectiveness.
- Disadvantage: -5% effectiveness.
- Neutral: 0%.

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

The system distributes the stat budget into POW/DEF/SPD using the approved card type's stat allocation bias.

Legacy inputs like `support`, `battle`, `defense`, `training`, and `utility` are normalized into the accepted 7-type model for compatibility.

## Template traits

Template traits belong to the global Library card. They are created at admin approval.

Current template traits:

- name
- creator attribution
- character
- type/category
- typeLabel
- typeColor
- typeIdentity
- typeStatBias
- art/crop data
- rarity
- targetRarity
- raritySource
- baseStats from the static rarity budget
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

Approved cards should include:

```json
{
  "rarity": "rare",
  "type": "radiant",
  "cardType": "radiant",
  "typeLabel": "Radiant",
  "typeStatBias": {
    "pow": 5,
    "def": 5,
    "spd": 0
  },
  "targetRarity": "mythic",
  "raritySource": "approval_cascading_roll",
  "traitSource": "approval",
  "statsSource": "approval_static_rarity_budget",
  "statBudget": 63,
  "staticStatBudget": 63,
  "ownedStatBudgetRange": {
    "min": 59,
    "max": 67
  },
  "copyStatBudgetVariance": 4,
  "baseStats": {
    "pow": 22,
    "def": 21,
    "spd": 20
  },
  "progressionRules": {
    "levelCap": 50,
    "maxLevel": 50,
    "growthPerLevel": 4
  },
  "originRarity": "rare",
  "originBonusPercent": 5,
  "stats": {
    "pow": 22,
    "def": 21,
    "spd": 20
  },
  "pow": 22,
  "def": 21,
  "spd": 20
}
```

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
- copied type metadata
- templateBaseStats
- owned-copy baseStats from pull-time budget variance

Pulled cards should include:

```json
{
  "rarity": "rare",
  "type": "radiant",
  "typeLabel": "Radiant",
  "templateBaseStats": {
    "pow": 22,
    "def": 21,
    "spd": 20
  },
  "statBudget": 65,
  "staticStatBudget": 63,
  "ownedStatBudgetRange": {
    "min": 59,
    "max": 67
  },
  "baseStats": {
    "pow": 23,
    "def": 22,
    "spd": 20
  },
  "copyTraits": {
    "foil": false,
    "holo": false,
    "variant": "standard",
    "mintNumber": null,
    "statBonus": {
      "pow": 0,
      "def": 0,
      "spd": 0
    }
  },
  "progression": {
    "level": 1,
    "xp": 0,
    "copies": 1
  },
  "progressionRules": {
    "levelCap": 50,
    "maxLevel": 50,
    "growthPerLevel": 4
  },
  "originRarity": "rare",
  "originBonusPercent": 5,
  "stats": {
    "pow": 24,
    "def": 23,
    "spd": 21
  }
}
```

## Effective stats

Effective stats are calculated from:

- baseStats
- progression.level
- progressionRules.growthPerLevel
- copyTraits.statBonus
- originBonusPercent

Current level-growth implementation distributes total growth across POW/DEF/SPD. Ability scaling, evolution formulas, equipment, buffs, debuffs, and type matchup damage modifiers are not implemented yet.

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

- Submitter-facing type suggestion pool
- Admin-approved type pool controls
- Battle use of type matchups
- Rarity evolution / promotion
- Duplicate merge versus separate copy rules
- Wild shards or duplicate substitute resources
- Foil/holo visual display
- Real sequential mint numbers
- Ability strength by rarity
- XP curve and battle reward tuning
