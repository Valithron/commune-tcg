# Battle Phase 9: Saved Squad State

## Purpose

Phase 9 saves one preferred backend-owned battle squad for the temporary user.

Plain-English rule:

```text
The player can save the current selected squad, and Squad Builder loads that saved squad by default next time.
```

## Main behavior

Squad Builder still uses URL state for the current edit:

```text
#/battle/squad?encounter=:encounterId&squadCardIds=:ids
```

Saved squad state is used when no explicit `squadCardIds` are present in the route.

```text
saved squad = default preference
route squadCardIds = current edit state
battle results squadCardIds = exact reward targets
```

## New endpoint

Added:

```text
GET /api/battle-squad
POST /api/battle-squad
```

File:

```text
functions/api/battle-squad.js
```

## Stored data

The write endpoint creates a small table for one saved squad per user:

```text
user_id
squad_card_ids
created_at
updated_at
```

The squad is saved as backend card row IDs.

## GET behavior

`GET /api/battle-squad` reads the saved squad, validates it against current owned battle inventory, and returns whether it is still valid for battle.

It performs no writes.

## POST behavior

`POST /api/battle-squad` accepts:

```json
{
  "squadCardIds": "card_row_1,card_row_2,card_row_3"
}
```

Before saving, it checks that the selected cards are owned and battle eligible.

If validation passes, it writes only the saved squad row.

It does not resolve a battle and does not apply rewards.

## Squad Builder behavior

`#/battle/squad` now:

```text
loads backend battle inventory
loads saved battle squad
uses URL squadCardIds if present
otherwise uses saved squad if valid
otherwise falls back to default highest-power eligible squad
shows selection source
shows saved squad status
shows saved IDs and selected IDs
has Save Squad button
```

## Verification checklist

1. Open `#/battle/squad`.
2. Select one to three backend-owned cards.
3. Click `Save Squad`.
4. Confirm the save status says `Saved squad:` followed by selected IDs.
5. Open `#/battle/squad` again without `squadCardIds` in the URL.
6. Confirm Selection Source says `saved-squad`.
7. Confirm Selected IDs match the saved IDs.
8. Click Start Battle.
9. Confirm Battle Results shows the same selected IDs.
10. Resolve Battle.
11. Confirm XP applies to those selected saved squad cards.
12. Confirm saving a squad did not apply gold or XP by itself.

## Recommended next phase

```text
Phase 10: battle result polish and reward presentation cleanup
```
