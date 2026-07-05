# Battle Phase 3: Real Battle Endpoint with battle_history

## Purpose

Battle Phase 3 adds the first write-enabled battle endpoint.

Scope is intentionally narrow:

```text
write battle_history only
```

This phase does not write rewards, XP, levels, currency, stamina, energy, Vault changes, or card progression.

## Backend changes

Added shared battle engine:

```text
functions/_shared/battle-engine.js
```

Updated Phase 2 simulation endpoint to use the shared engine:

```text
functions/api/battle-simulate.js
```

Added write endpoint:

```text
POST /api/battles
```

Added read-only history endpoint:

```text
GET /api/battle-history
GET /api/battle-history?ownerUserId=sterling&limit=20
```

## Shared engine responsibilities

The shared engine now owns:

```text
mock battle encounter contract
Sterling owned-card read model
battle card normalization
battle eligibility validation
squad validation
default squad selection
no-write simulation construction
battle_history schema creation
battle_history write
battle_history read/hydration
```

This prevents the Phase 2 simulation contract and Phase 3 write contract from drifting.

## POST /api/battles

Default payload behavior:

```text
ownerUserId: sterling
encounterId: training-yard-goblin
squadCardIds: optional
```

JSON example:

```json
{
  "encounterId": "training-yard-goblin"
}
```

Explicit squad example:

```json
{
  "ownerUserId": "sterling",
  "encounterId": "calendar-hydra",
  "squadCardIds": ["CARD_ID", "CARD_ID", "CARD_ID"]
}
```

Form payloads are also supported for simple manual testing.

## Validation before write

Before writing `battle_history`, the endpoint runs the same simulation validation used by Battle Phase 2.

Validation checks:

```text
encounter id resolves
squad size is 1 to 3
no duplicate selected card ids
selected cards are owned by ownerUserId
selected cards are battle-eligible
squad is not empty
```

If validation fails, the response includes:

```text
phase: battle-3
writesPerformed: false
writes: []
```

No write is attempted after failed validation.

## battle_history schema

The endpoint creates the table if it does not exist:

```sql
CREATE TABLE IF NOT EXISTS battle_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  encounter_id TEXT NOT NULL,
  victory INTEGER NOT NULL,
  squad_power INTEGER NOT NULL,
  enemy_power INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL
)
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_battle_history_user_created
ON battle_history (user_id, created_at)

CREATE INDEX IF NOT EXISTS idx_battle_history_encounter_created
ON battle_history (encounter_id, created_at)
```

## What result_json stores

Each battle history row stores semantic result data:

```text
battleId
phase
ownerUserId
ownerDisplayName
encounterId
encounterName
victory
squadPower
enemyPower
margin
squad
rewardPreview
xpPreview
combatLog
resultRule
writes: [battle_history]
deferredWrites
createdAt
```

Important:

```text
rewardPreview and xpPreview are still previews only.
```

They are stored in `battle_history.result_json` so future UI can show what the battle would have awarded, but no reward or XP mutation happens in this phase.

## GET /api/battle-history

The history endpoint is read-only.

It returns:

```text
ok
phase: battle-3
readOnly: true
source: D1 battle_history
ownerUserId
tableExists
totalReturned
battles
notes
```

If `battle_history` does not exist yet, it returns:

```text
tableExists: false
totalReturned: 0
battles: []
```

It does not create the table. The table is created only by the write path.

## Frontend diagnostic links

Updated:

```text
src/services/apiClient.js
src/routes/BackendStatus.js
src/routes/ResourceInventory.js
```

Diagnostic pages now include:

```text
/api/battle-inventory
/api/battle-simulate?encounterId=training-yard-goblin
/api/battle-history
```

`POST /api/battles` is not linked directly because plain links cannot POST.

No battle UI route has been wired to the write endpoint yet.

## Guardrails

This phase writes only:

```text
battle_history
```

This phase does not write:

```text
rewards
XP
levels
currency
gold
pull tickets
stamina
energy
Vault rows
card_json progression changes
owned card changes
auth changes
```

## Verification checklist

After Cloudflare deploys:

1. Open `#/backend`.
2. Confirm Battle History appears in the endpoint list.
3. Open `#/inventory`.
4. Confirm Battle History appears in the endpoint list.
5. Open `/api/battle-simulate?encounterId=training-yard-goblin`.
6. Confirm `phase: "battle-2"` and `readOnly: true`.
7. POST to `/api/battles` with:

```json
{
  "encounterId": "training-yard-goblin"
}
```

8. Confirm the response has:

```text
ok: true
phase: battle-3
writesPerformed: true
writes: [battle_history]
battleId
historyRow
simulation
```

9. Confirm guardrails say no rewards, XP, currency, stamina, energy, or Vault writes occurred.
10. Open `/api/battle-history`.
11. Confirm the new battle row appears.
12. Confirm `rewardPreview` and `xpPreview` are present but only as stored preview data.
13. POST an invalid encounter:

```json
{
  "encounterId": "missing-test"
}
```

14. Confirm validation fails with:

```text
writesPerformed: false
writes: []
```

15. Confirm Pull, Vault, Library, Submissions, rewards, XP, currency, and current battle UI behavior are unchanged.

## Next phase

Recommended next step:

```text
Battle Phase 4: Reward and XP contract
```

Do not write reward or XP mutations until Phase 4 defines:

```text
XP curve
level-up threshold
reward scaling
loss rewards
currency rewards
pull-ticket rewards
drop rules
card progression write format
history/result semantics
failure/rollback rules
```
