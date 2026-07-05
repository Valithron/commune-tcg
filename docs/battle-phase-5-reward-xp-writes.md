# Battle Phase 5: Reward and XP Writes

## Purpose

Battle Phase 5 lets a validated battle apply the Phase 4 reward contract.

Plain-English rule:

```text
A valid battle now gives gold to the user and XP to the owned squad cards.
```

This is still narrow. It does not add drops, pull tickets, stamina, energy, Vault grants, auth, or battle UI polish.

## Main behavior

`POST /api/battles` now does this:

1. Validate the encounter and squad.
2. Re-read the selected owned card rows before writing.
3. Calculate gold and XP from the battle reward contract.
4. Update `user_resources.gold`.
5. Update each selected owned card's `card_json.xp` and `card_json.level`.
6. Insert a `battle_history` row that records the result, rewardApplied, and xpApplied details.

The write path is implemented in:

```text
functions/_shared/battle-progression.js
```

The endpoint is:

```text
functions/api/battles.js
```

## Reward rules

Current reward contract version:

```text
battle-reward-xp-v1
```

Current rules:

```text
victoryGoldMultiplier: 1
lossGoldMultiplier: 0.25
victoryXpMultiplier: 1
lossXpMultiplier: 0.35
```

XP is split across the selected squad.

If total XP does not divide evenly, the remainder is assigned by squad order.

## XP and level rules

`card_json.xp` is cumulative lifetime XP.

Level thresholds use:

```text
100 + ((level - 1) * 25)
```

The contract also calculates total lifetime XP required for each level so higher levels do not trigger early.

## Writes enabled in Phase 5

Phase 5 writes only:

```text
battle_history
user_resources.gold
cards.card_json.xp
cards.card_json.level
cards.updated_at
```

## Writes still deferred

Phase 5 does not write:

```text
pull tickets
drops
stamina
energy
Vault grants
new card grants
auth changes
```

## Diagnostics updated

Updated:

```text
GET /api/battle-reward-contract
GET /api/battle-history
#/admin/backend
#/admin/inventory
```

Battle History now surfaces:

```text
rewardApplied
xpApplied
writes
deferredWrites
phase
```

## Verification checklist

After Cloudflare deploys:

1. Open `/api/battle-reward-contract`.
2. Confirm `phase: "battle-5"`.
3. Confirm `readOnly: true`.
4. Confirm `writeApplicationEndpoint: "POST /api/battles"`.
5. Open `/api/pull-resources` and note current gold.
6. Open `/api/vault?ownerUserId=sterling` and note XP/levels on likely squad cards.
7. POST to `/api/battles` with:

```json
{
  "encounterId": "training-yard-goblin"
}
```

8. Confirm response includes:

```text
phase: battle-5
writes: battle_history, user_resources.gold, cards.card_json.xp_level
rewardApplied
xpApplied
```

9. Open `/api/battle-history`.
10. Confirm the newest row includes `rewardApplied` and `xpApplied`.
11. Open `/api/pull-resources` again and confirm gold increased.
12. Open `/api/vault?ownerUserId=sterling` again and confirm selected owned cards gained XP and/or levels.
13. Confirm pull tickets did not change.
14. Confirm no drops, stamina, energy, Vault grants, or auth changes occurred.

## Next phase

Recommended next step after verification:

```text
Battle Phase 5.5: reward-write hardening and display pass
```

Do not add drops, stamina, or complex animation until the reward write path is verified live.
