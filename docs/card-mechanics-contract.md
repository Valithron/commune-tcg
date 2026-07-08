# Card Mechanics Contract

This document defines the current trait ownership model for the Gacha branch.

## Rule

Approval controls balance. Pulling controls ownership and collectible variation.

That means base rarity and base POW/DEF/SPD are template traits. They are created when an admin approves a submitted card, not when a player pulls the card.

Pulling must not reroll base rarity or base POW/DEF/SPD unless the game is intentionally redesigned around variable copies.

## Template traits

Template traits belong to the global Library card. They are created at admin approval.

Current template traits:

- name
- creator attribution
- character
- type/category
- art/crop data
- rarity
- baseStats
- stats, kept for backward compatibility
- top-level pow/def/spd, kept for backward compatibility
- ability/mechanic text
- flavor text

Approved cards should include:

```json
{
  "rarity": "rare",
  "raritySource": "approval_random_roll",
  "rarity_source": "approval_random_roll",
  "traitSource": "approval",
  "trait_source": "approval",
  "statsSource": "approval_random_roll",
  "stats_source": "approval_random_roll",
  "baseStats": {
    "pow": 6,
    "def": 4,
    "spd": 5
  },
  "stats": {
    "pow": 6,
    "def": 4,
    "spd": 5
  },
  "pow": 6,
  "def": 4,
  "spd": 5
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

Pulled cards should include:

```json
{
  "rarity": "rare",
  "baseStats": {
    "pow": 6,
    "def": 4,
    "spd": 5
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
  "stats": {
    "pow": 6,
    "def": 4,
    "spd": 5
  }
}
```

## Effective battle stats

Effective stats should eventually be calculated from:

- baseStats
- progression
- copyTraits.statBonus
- future equipment, buffs, debuffs, or battle modifiers

Current implementation does not apply level scaling. It only preserves the data structure and calculates effective stats as baseStats plus copyTraits.statBonus.

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

## Open decisions

These are intentionally not settled in this pass:

- Whether foil/holo should visually display immediately
- Whether mint numbers should be real sequential serials
- Whether copy-specific stat variance should exist at all
- Whether rarity should drive stat budget, ability strength, or both
- How progression should scale battle stats
