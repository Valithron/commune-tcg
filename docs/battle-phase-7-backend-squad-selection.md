# Battle Phase 7: Backend-Owned Squad Selection

## Purpose

Battle Phase 7 connects the player-facing squad selection screen to real backend-owned cards.

Plain-English rule:

```text
The cards selected on Squad Builder are the same cards sent into Resolve Battle and the same cards that receive XP.
```

## Main routes

```text
#/battle/squad?encounter=:encounterId&squadCardIds=:ids
#/battle/results?encounter=:encounterId&squadCardIds=:ids
```

## Files changed

```text
src/services/battleSquadSelection.js
src/routes/SquadBuilder.js
src/routes/BattleResults.js
src/styles/battle.css
```

## New shared service

Added:

```text
src/services/battleSquadSelection.js
```

Responsibilities:

```text
fetch backend battle inventory
parse squadCardIds from URL state
choose default top-power squad when no squad is selected
build squad/results route hrefs
calculate selected squad power
keep squad selection out of ad-hoc DOM mutation
```

## Squad Builder behavior

`#/battle/squad` now reads:

```text
GET /api/battle-inventory?ownerUserId=sterling
```

It displays battle-eligible backend-owned cards.

Tapping a card updates the URL state:

```text
squadCardIds=row_id_1,row_id_2,row_id_3
```

The selected card row IDs are visible on the screen.

The Start Battle button passes those same IDs to Battle Results.

## Battle Results behavior

`#/battle/results` now reads the selected `squadCardIds` query param and passes it to:

```text
POST /api/battles
```

Request body shape:

```json
{
  "encounterId": "training-yard-goblin",
  "squadCardIds": "row_id_1,row_id_2,row_id_3"
}
```

The real backend response still determines the final result, gold, XP, and level application.

## Guardrails

Phase 7 does not add:

```text
saved squads
drag/drop
stamina
energy
drops
pull tickets
new card grants
auth changes
animations
```

Phase 7 avoids new route-local DOM patching. Selection is URL-state driven.

## Current limitation

The selected squad is not saved yet. It exists only in the current URL.

If there are no selected IDs in the URL, the default backend squad is the highest battlePower eligible owned cards, capped at 3.

## Verification checklist

1. Open `#/battle`.
2. Choose an encounter.
3. On Squad Builder, confirm it says backend-owned cards.
4. Tap cards to add/remove them.
5. Confirm the selected IDs change in the URL.
6. Click Start Battle.
7. Confirm Battle Results shows the same selected IDs.
8. Click Resolve Battle.
9. Confirm XP Applied lists those same selected card names/IDs.
10. Confirm the top gold pill updates immediately.
11. Confirm no drops, tickets, stamina, energy, Vault grants, or auth changes occurred.

## Recommended next phase

```text
Phase 8: saved squad state and duplicate reward hardening
```

Before polish/animation, the next practical system work is preventing accidental duplicate resolves across refreshes or copied URLs and optionally saving a preferred squad.
