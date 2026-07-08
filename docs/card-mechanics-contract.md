# Card Mechanics Contract

This document defines the current trait ownership model for the Gacha branch.

## Rule

Approval controls balance. Pulling controls ownership and collectible variation.

Users may suggest a target rarity at submission, but approval is the balance gate. Admin review can either roll from the target rarity table or manually override the final rarity.

Pulling must not reroll base rarity or base POW/DEF/SPD unless the game is intentionally redesigned around variable copies.

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

## Stat budget and progression config

Approved rarity determines the level 1 stat budget and progression metadata.

```text
Common:    24-32 total stats,  max level 30, +2 total stats per level,  0% origin bonus
Uncommon:  38-50 total stats,  max level 40, +3 total stats per level,  5% origin bonus
Rare:      58-76 total stats,  max level 50, +4 total stats per level, 10% origin bonus
Legendary: 90-115 total stats, max level 60, +5 total stats per level, 15% origin bonus
Mythic:    130-165 total stats,max level 70, +6 total stats per level, 20% origin bonus
```

The system distributes the stat budget into POW/DEF/SPD using a small archetype bias inferred from card type:

- battle -> aggressor
- defense -> guardian
- training/utility -> swift
- support/magic/alchemy -> mystic
- otherwise -> balanced

## Template traits

Template traits belong to the global Library card. They are created at admin approval.

Current template traits:

- name
- creator attribution
- character
- type/category
- art/crop data
- rarity
- targetRarity
- raritySource
- baseStats
- statBudget
- statArchetype
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
  "targetRarity": "mythic",
  "raritySource": "approval_cascading_roll",
  "traitSource": "approval",
  "statsSource": "rarity_stat_budget",
  "statBudget": 66,
  "statArchetype": "mystic",
  "baseStats": {
    "pow": 24,
    "def": 20,
    "spd": 22
  },
  "progressionRules": {
    "levelCap": 50,
    "maxLevel": 50,
    "growthPerLevel": 4
  },
  "originRarity": "rare",
  "originBonusPercent": 10,
  "stats": {
    "pow": 24,
    "def": 20,
    "spd": 22
  },
  "pow": 24,
  "def": 20,
  "spd": 22
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

Pulled cards should include:

```json
{
  "rarity": "rare",
  "baseStats": {
    "pow": 24,
    "def": 20,
    "spd": 22
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
  "originBonusPercent": 10,
  "stats": {
    "pow": 26,
    "def": 22,
    "spd": 24
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

Current level-growth implementation distributes total growth across POW/DEF/SPD. Ability scaling, evolution formulas, equipment, buffs, and debuffs are not implemented yet.

## Compatibility rule

Do not remove these fields yet:

- rarity
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
- XP curve and battle reward tuning
