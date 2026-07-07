# Battle Phase 10F.1: Squad Builder Card Thumbnails

## Purpose

Phase 10F.1 makes the Squad Builder available-card list feel more like choosing cards and less like reading a text roster.

Plain-English rule:

```text
When choosing a squad, the player should see the card art beside the card name and stats.
```

## What changed

Files:

```text
functions/api/battle-inventory.js
src/routes/SquadBuilder.js
src/styles/battle-squad-thumbnails.css
src/main.js
docs/battle-phase-10f1-squad-card-thumbnails.md
```

## API normalization

`/api/battle-inventory` now includes normalized image fields on battle cards:

```text
imageKey
imageUrl
```

This uses the same basic pattern as the Vault endpoint:

```text
image key -> /api/card-image?key=...
full URL -> use as-is
```

The endpoint remains read-only.

## Player-facing UI change

On `#/battle/squad`, the Available Cards list now renders:

```text
left: compact card-frame thumbnail
middle: rarity, category, card name, level, XP
right: stats, battle power, selection state
```

The thumbnail uses the canonical `renderCardFrame` component instead of a one-off image implementation.

## Mechanics unchanged

Phase 10F.1 does not change:

```text
card selection
saved squad loading
saved squad writes
Start Battle behavior
battle reward targeting
reward settlement
reward reveal
battle math
```

## Guardrails

Phase 10F.1 does not add:

```text
drag/drop
multiple squad slots
new card data model
new reward types
stamina
drops
tickets
auth
```

## Verification checklist

1. Open `#/battle/squad`.
2. Look at the Available Cards section.
3. Confirm each card row has a compact thumbnail on the left.
4. Confirm the text appears to the right of the thumbnail.
5. Tap a card row.
6. Confirm the card still adds to the squad.
7. Tap a selected card row.
8. Confirm the card still removes from the squad.
9. Fill three slots.
10. Confirm other rows still show Squad full.
11. Click Start Battle.
12. Confirm Battle Results still uses the selected squad.
