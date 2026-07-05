# Battle Phase 4: Reward and XP Contract

## Purpose

Battle Phase 4 defines the battle progression contract before any progression/resource writes are enabled.

This phase is read-only contract work.

It does not change battle resolution, battle history, cards, Vault ownership, user resources, stamina, energy, auth, or UI battle behavior.

## Backend changes

Added:

```text
functions/_shared/battle-reward-contract.js
functions/api/battle-reward-contract.js
```

New endpoint:

```text
GET /api/battle-reward-contract
```

Updated diagnostic pages:

```text
src/routes/BackendStatus.js
src/routes/ResourceInventory.js
```

`src/services/apiClient.js` was not changed in this phase because the connector repeatedly blocked that file update. The diagnostic pages link directly to `/api/battle-reward-contract` instead.

## Contract version

Current version:

```text
battle-reward-xp-v1
```

The endpoint returns:

```text
phase
version
readOnly
rewardRules
xpCurve
cardProgressionWriteTarget
userResourceWriteTarget
battleHistoryWriteTarget
failureAndRollbackRules
guardrails
xpThresholdSamples
encounterRewardSamples
```

## Progression rules defined

Current XP curve:

```text
startingLevel: 1
maxLevel: 50
xpToNextLevelFormula: 100 + ((level - 1) * 25)
```

Level policy:

```text
Advance through as many thresholds as cumulative XP allows, capped at maxLevel.
```

Split policy:

```text
Divide battle XP across squad cards.
If integer division leaves a remainder, assign the remainder by squad order when writes are enabled.
```

## Outcome scaling defined

The contract defines separate scaling for victory and loss outcomes.

Current rules:

```text
victoryGoldMultiplier: 1
lossGoldMultiplier: 0.25
victoryXpMultiplier: 1
lossXpMultiplier: 0.35
```

Pull-ticket and drop rewards remain disabled in this contract version.

## Future write targets

Future owned-card progression target:

```text
table: cards
selector: owned card row id from battle squad
column: card_json
future fields: xp, level, updated_at
```

Future user resource target:

```text
table: user_resources
selector: user_id
future fields: gold, updated_at
```

Current battle history target:

```text
table: battle_history
status: already enabled in Battle Phase 3
```

## Guardrails

Battle Phase 4 performs no writes.

Current write behavior remains:

```text
POST /api/battles writes battle_history only
```

Everything else remains deferred until Battle Phase 5 or later.

## Verification checklist

After Cloudflare deploys:

1. Open `#/backend`.
2. Confirm Battle Contract appears.
3. Open `#/inventory`.
4. Confirm Battle Contract appears.
5. Open `/api/battle-reward-contract`.
6. Confirm `ok: true`.
7. Confirm `phase: "battle-4"`.
8. Confirm `version: "battle-reward-xp-v1"`.
9. Confirm `readOnly: true`.
10. Confirm XP curve and outcome scaling are present.
11. Confirm `/api/battle-simulate?encounterId=training-yard-goblin` still works.
12. Confirm `POST /api/battles` still writes only `battle_history`.
13. Confirm cards, Vault, user resources, stamina, energy, and battle UI behavior are unchanged.

## Next phase

Recommended next step:

```text
Battle Phase 5: Reward/XP writes and hardening
```

Phase 5 should apply this contract atomically and harden failure behavior before any polish or battle animation work.
