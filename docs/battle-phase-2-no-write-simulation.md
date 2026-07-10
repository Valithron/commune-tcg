# Battle Phase 2: No-write Battle Simulation

## Purpose

Battle Phase 2 adds a deterministic backend battle simulation without writing battle results, rewards, XP, currency, stamina, or Vault changes.

This follows the same pattern used for pulls:

```text
inventory
-> no-write simulation
-> write endpoint later
-> hardening
-> semantics/polish
```

Battle Phase 2 is still framework work, not visual polish.

## Backend changes

Added:

```text
functions/api/battle-simulate.js
```

New endpoint:

```text
GET /api/battle-simulate
GET /api/battle-simulate?encounterId=training-yard-goblin
GET /api/battle-simulate?ownerUserId=sterling&encounterId=calendar-hydra
GET /api/battle-simulate?ownerUserId=sterling&encounterId=training-yard-goblin&squadCardIds=CARD_ID,CARD_ID,CARD_ID
```

Default owner:

```text
sterling
```

Default encounter:

```text
training-yard-goblin
```

The endpoint performs no writes.

## Data sources

Owned cards are read from:

```text
cards.owner_user_id = sterling
```

The current encounter source remains:

```text
src/data/mockBattle.js equivalent mock contract inside the endpoint
```

Current mock encounters:

```text
Training Yard Goblin
Calendar Hydra
Storm Forge Wyrm
```

Enemy stats are still simple `enemyPower` values. Full enemy-card stats are deferred.

## Squad selection

If no `squadCardIds` are supplied, the endpoint selects a default squad:

```text
highest battlePower eligible cards first
capped at 3 cards
```

Power is still diagnostic/simple:

```text
pow + def + spd + level
```

If `squadCardIds` are supplied, the endpoint validates them against Sterling-owned cards.

Squad rules:

```text
minimum size: 1
maximum size: 3
duplicates: not allowed
cards must be owned by ownerUserId
cards must be battle-eligible
encounterId must resolve
```

A requested squad can use either normalized card ids or source row ids.

## Validation failures

Validation failures return:

```text
ok: false
phase: battle-2
readOnly: true
error: Battle simulation validation failed.
validation
writes: []
```

Possible validation errors:

```text
encounter-not-found
squad-too-large
duplicate-card-ids
squad-card-not-owned-by-owner
squad-card-ineligible
empty-squad
```

Even validation failures perform no writes.

## Successful response shape

A successful response returns:

```text
ok
phase: battle-2
readOnly
source
requested
ownedCardsScanned
battleEligibleCount
defaultSquadUsed
validation
simulation
availableEncounters
guardrails
nextStep
```

The `simulation` object includes:

```text
simulationId
ownerUserId
ownerDisplayName
encounter
squad
squadPower
enemyPower
margin
victory
rewardPreview
xpPreview
combatLog
resultRule
writes: []
```

## Battle result rule

Current deterministic rule:

```text
if squadPower >= enemyPower, victory is true
otherwise victory is false
```

This is intentionally simple. Do not add richer combat math until the input/result contracts are stable.

## Reward preview

Reward preview is not a write.

Victory returns the full mock encounter reward preview.
Loss returns a partial consolation preview.

The preview includes:

```text
gold
totalXp
xpPerCard
pullTickets
drops
rewardRule
writes: []
```

Current loss preview uses:

```text
gold = floor(rewardGold * 0.25)
totalXp = floor(rewardXp * 0.35)
```

This mirrors the old Phase 3 mock results, but it is still only a preview.

## XP preview

XP preview is not a write.

Each squad card receives a preview object:

```text
cardId
sourceRowId
cardTitle
previousLevel
previousXp
gainedXp
nextXpPreview
nextLevelPreview
levelPreviewStatus
writes: []
```

Important:

```text
Level-up math is intentionally deferred until the Reward and XP contract phase.
```

For now, `nextLevelPreview` stays at the current level and `levelPreviewStatus` explains that level-up calculation is deferred.

## Frontend diagnostic links

Updated:

```text
src/services/apiClient.js
src/routes/BackendStatus.js
src/routes/ResourceInventory.js
```

Diagnostic pages now link to:

```text
/api/battle-inventory
/api/battle-simulate?encounterId=training-yard-goblin
```

No battle UI route was wired to the new endpoint yet.

## Guardrails

This phase does not perform:

```text
battle_history writes
reward writes
XP writes
level-up writes
currency changes
stamina changes
energy changes
Vault changes
card visual changes
battle animation changes
auth changes
```

The response explicitly includes `writes: []` in the simulation and preview objects.

## Verification checklist

After Cloudflare deploys:

1. Open `#/backend`.
2. Confirm Battle Simulate appears in the endpoint list.
3. Open `#/inventory`.
4. Confirm Battle Simulate appears in the inventory endpoint list.
5. Open `/api/battle-simulate?encounterId=training-yard-goblin`.
6. Confirm `ok: true`.
7. Confirm `phase: "battle-2"`.
8. Confirm `readOnly: true`.
9. Confirm `simulation.writes` is an empty array.
10. Confirm `simulation.squad` is populated if Sterling has eligible owned cards.
11. Confirm `simulation.encounter.id` is `training-yard-goblin`.
12. Confirm `simulation.victory` is a boolean.
13. Confirm `rewardPreview`, `xpPreview`, and `combatLog` are present.
14. Open `/api/battle-simulate?encounterId=calendar-hydra`.
15. Confirm it simulates the different encounter without writes.
16. Open `/api/battle-simulate?encounterId=missing-test`.
17. Confirm it returns a validation failure and still reports `readOnly: true` and `writes: []`.
18. Confirm no pull, Vault, Library, submission, reward, XP, currency, or battle result behavior changed.

## Next phase

Recommended next step:

```text
Battle Phase 3: Real battle endpoint with battle_history
```

Do not write rewards, XP, level-ups, currency, stamina, or Vault changes in Phase 3 unless explicitly scoped. Phase 3 should focus on battle_history only after the no-write simulation contract is verified.
