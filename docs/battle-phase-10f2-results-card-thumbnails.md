# Battle Phase 10F.2: Battle Results Card Thumbnails

## Purpose

Phase 10F.2 carries the Squad Builder thumbnail treatment into Battle Results.

Plain-English rule:

```text
When showing battle participants, use card visuals, not just text rows.
```

## What changed

Files:

```text
src/routes/BattleResults.js
src/styles/battle-squad-thumbnails.css
docs/battle-phase-10f2-results-card-thumbnails.md
```

## Player-facing changes

Battle Results now shows thumbnail card frames in:

```text
Lead Card
Cards in this battle
```

The thumbnails use the canonical `renderCardFrame` component, matching the Squad Builder row implementation.

## Mechanics unchanged

Phase 10F.2 does not change:

```text
battle result calculation
reward settlement
reward reveal
XP application
gold application
level calculation
Battle Again behavior
saved squad behavior
```

## Guardrails

Phase 10F.2 does not add:

```text
new reward types
new combat logic
new card data model
drag/drop
stamina
drops
tickets
auth
```

## Verification checklist

1. Start a battle from `#/battle/squad`.
2. Open Battle Results.
3. Confirm the Lead Card panel has a thumbnail-size card image.
4. Confirm Cards in this battle rows have thumbnails on the left.
5. Confirm reward settlement still happens in the background.
6. Click Reveal Rewards.
7. Confirm rewards reveal normally.
8. Confirm Battle Again still works.
