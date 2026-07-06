# Battle Phase 8: Reward Hardening

## Purpose

Battle Phase 8 prevents the same battle result page from applying rewards repeatedly.

Plain-English rule:

```text
A battle attempt can be resolved once. The same attempt cannot grant gold or XP twice.
```

## What changed

Phase 8 adds a required `attemptId` to battle resolution.

The player flow now carries:

```text
encounter
squadCardIds
attemptId
```

through the route:

```text
#/battle/results?encounter=:encounterId&squadCardIds=:ids&attemptId=:attemptId
```

`POST /api/battles` now requires:

```json
{
  "encounterId": "training-yard-goblin",
  "squadCardIds": "card_row_1,card_row_2,card_row_3",
  "attemptId": "attempt_..."
}
```

## Backend hardening

`battle_history` now receives a nullable `attempt_id` column.

The writer creates this unique index:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_battle_history_user_attempt
ON battle_history (user_id, attempt_id)
WHERE attempt_id IS NOT NULL AND TRIM(attempt_id) != ''
```

That means:

```text
one user + one attempt ID = one successful reward write
```

## Attempt status preflight

Phase 8.1 adds a read-only status endpoint:

```text
GET /api/battle-attempt?ownerUserId=sterling&attemptId=:attemptId
```

This endpoint checks whether a battle attempt already has a `battle_history` row.

It performs no reward, XP, level, resource, or card writes.

Battle Results calls this endpoint during render. If the attempt has already resolved, the page renders:

```text
Already Resolved
```

and does not show a fresh Resolve Battle button.

## Duplicate behavior

If the same `attemptId` is posted again for the same user, the endpoint returns:

```text
409 duplicate-battle-attempt
```

No reward writes are performed on the duplicate request.

The duplicate response includes:

```text
attemptId
existingBattleId
writesPerformed: false
```

## Frontend behavior

Squad Builder creates a fresh attempt ID when linking to Battle Results.

Battle Results:

```text
shows the attempt ID
checks attempt status before rendering Resolve Battle
requires a valid attempt ID before Resolve Battle appears
hides Resolve Battle if the attempt was already used
sends attemptId to POST /api/battles when unresolved
turns duplicate POST responses into Already Resolved state
```

Admin Battle Check also generates a fresh attempt ID per run.

## Files changed

```text
functions/_shared/battle-progression.js
functions/api/battles.js
functions/api/battle-attempt.js
functions/api/battle-history.js
src/services/apiClient.js
src/services/battleSquadSelection.js
src/routes/BattleResults.js
src/routes/AdminBattleTest.js
docs/route-map.md
docs/battle-phase-8-reward-hardening.md
```

## Guardrails

Phase 8 does not add:

```text
saved squads
stamina
energy
drops
pull tickets
new card grants
Vault grants
auth changes
animations
```

Phase 8 does not rely on more route-local DOM mutation for reward hardening. The key protection is backend-side, and Phase 8.1 render state comes from a backend preflight read.

## Verification checklist

1. Open `#/battle`.
2. Choose an encounter.
3. Select backend-owned squad cards.
4. Click Start Battle.
5. Confirm Battle Results shows an Attempt ID.
6. Click Resolve Battle.
7. Confirm rewards apply and the button becomes Resolved.
8. Refresh the same results URL.
9. Confirm the page renders Already Resolved without showing a fresh Resolve Battle button.
10. Confirm gold does not increase a second time.
11. Confirm XP does not apply a second time to the selected cards.
12. Open `/api/battle-attempt?attemptId=<same attempt id>` and confirm `resolved: true`.
13. Confirm a new trip through Squad Builder creates a fresh attempt ID and can resolve normally.

## Recommended next phase

```text
Phase 9: saved squad state
```

Now that the one-time reward write is hardened and the UI can preflight attempt state, the next clean step is saving a preferred squad instead of only storing it in the URL.
