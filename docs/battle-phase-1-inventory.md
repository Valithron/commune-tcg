# Battle Phase 1: Battle Inventory and Read-only Diagnostics

## Purpose

Battle Phase 1 starts the new Battle Mechanics roadmap without calling it Phase 11.

The goal is to map the battle surface before writing battle results, rewards, XP, or progression.

This phase answers:

```text
Which owned cards can fight?
Which Sterling Vault cards are battle-eligible?
What current enemy and encounter data exists?
Where do enemy stats come from?
What squad size is expected?
How is a squad validated?
What does a battle input contract look like?
What does a battle result contract look like?
What rewards will eventually be written?
What tables exist or need to be created later?
What remains read-only until simulation and write phases?
```

## Backend changes

Added:

```text
functions/api/battle-inventory.js
```

New endpoint:

```text
GET /api/battle-inventory
GET /api/battle-inventory?ownerUserId=sterling
```

The endpoint is read-only.

It reads Sterling-owned cards from:

```text
cards.owner_user_id = sterling
```

It normalizes card data from `cards.card_json`, then reports battle eligibility.

Current battle eligibility rule:

```text
owned by ownerUserId
card_json parses cleanly
normalized ATK/DEF/SPD are finite
card is not explicitly disabled by card_json
```

The endpoint also inspects D1 table names for possible battle-related tables:

```text
battle_history
battles
encounters
enemies
enemy_cards
battle_encounters
battle_rewards
user_squads
squads
```

If any of those tables exist, it reports row counts. It does not create tables.

## Current enemy and encounter source

Current battle UI still uses:

```text
src/data/mockBattle.js
```

That file provides three mock encounters:

```text
Training Yard Goblin
Calendar Hydra
Storm Forge Wyrm
```

Current enemy stats are not full enemy-card stats yet. They are simple `enemyPower` values from mock encounter data.

## Frontend diagnostic links

Updated:

```text
src/services/apiClient.js
src/routes/BackendStatus.js
src/routes/ResourceInventory.js
```

The diagnostic pages now link to:

```text
/api/battle-inventory
```

No battle route behavior was changed.

## Endpoint response shape

The endpoint returns:

```text
ok
phase: battle-1
readOnly: true
ownerUserId
ownerDisplayName
ownedCardsScanned
battleEligibleCount
ineligibleOwnedCount
battleEligibleCards
ineligibleOwnedCards
squadValidation
enemySources
encounterSources
currentMockBattleRoutes
tableInventory
proposedBattleInputContract
proposedBattleResultContract
proposedRewardContract
readiness
notes
```

## Proposed squad contract

Current diagnostic proposal:

```text
expected squad size: 3
minimum squad size: 1
duplicate cards allowed: false
default selection: highest battlePower cards first, capped at 3, until saved squads exist
```

Power is diagnostic only for now:

```text
pow + def + spd + level
```

## Proposed future battle input contract

Future write-enabled endpoint is not built yet.

Proposed future endpoint:

```text
POST /api/battles
```

Potential no-write simulation endpoint for Battle Phase 2:

```text
GET /api/battle-simulate
or
POST /api/battle-simulate
```

Expected inputs:

```text
ownerUserId
encounterId
squadCardIds
```

Expected validation:

```text
owner owns every selected card
each selected card is battle-eligible
squad size is between 1 and 3
no duplicate card ids in one squad
encounter id resolves to an available encounter
future stamina or energy cost is valid before write-enabled battle starts
```

## Proposed future result contract

Battle Phase 2 should return a no-write result with:

```text
battleId or simulationId
ownerUserId
encounter
squad
squadPower
enemyPower
victory
combatLog
rewardPreview
xpPreview
createdAt
```

The simplest Battle Phase 2 deterministic rule can be:

```text
compare normalized squad battlePower against encounter enemyPower
```

Do not add richer combat math until this contract is proven.

## Proposed future reward contract

Reward writes are deferred until later phases.

Future reward preview fields:

```text
gold
xpPerCard
totalXp
pullTickets
drops
```

Future progression preview fields:

```text
cardId
previousXp
gainedXp
nextXp
previousLevel
nextLevel
```

Future write targets may include:

```text
user_resources.gold
cards.card_json XP and level fields
battle_history.result_json
```

## Guardrails

This phase does not perform:

```text
battle resolution
battle_history writes
reward writes
XP writes
level-up writes
currency changes
stamina or energy changes
Vault changes
card visual changes
animation changes
auth changes
```

## Verification checklist

After Cloudflare deploys:

1. Open `#/backend`.
2. Confirm Battle Inventory appears in the endpoint list.
3. Open `#/inventory`.
4. Confirm Battle Inventory appears in the inventory endpoint list.
5. Open `/api/battle-inventory`.
6. Confirm `ok: true`.
7. Confirm `phase: "battle-1"`.
8. Confirm `readOnly: true`.
9. Confirm `ownerUserId: "sterling"` by default.
10. Confirm `battleEligibleCards` and `ineligibleOwnedCards` return arrays.
11. Confirm `enemySources` names the frontend mock source and any observed D1 battle/enemy tables.
12. Confirm `proposedBattleInputContract`, `proposedBattleResultContract`, and `proposedRewardContract` are present.
13. Confirm no pull, Vault, Library, submission, reward, XP, or battle result behavior changed.

## Next phase

Recommended next step:

```text
Battle Phase 2: No-write battle simulation
```

Do not write `battle_history`, rewards, XP, or currency until the simulation contract is stable.
