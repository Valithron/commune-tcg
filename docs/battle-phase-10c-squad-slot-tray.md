# Battle Phase 10C: Squad Slot Tray

## Purpose

Phase 10C makes Squad Builder feel more like assembling a battle team.

Plain-English rule:

```text
The player should see three squad slots before choosing cards.
```

## Palette note

This phase keeps the Commune visual direction:

```text
navy/dark-blue surfaces
gold accents
existing token colors
```

The layout borrows from the Stitch squad mockup, but does not switch to the charcoal-gray palette.

## What changed

Files:

```text
src/routes/SquadBuilder.js
src/styles/battle.css
docs/battle-phase-10c-squad-slot-tray.md
```

## Player-facing Squad Builder upgrades

Squad Builder now has:

```text
three visible squad slots
filled slot cards
empty slot prompts
remove-by-tapping filled slots
Available Cards list below the tray
same Save Squad button
same Start Battle button
```

## Mechanics unchanged

Phase 10C does not change:

```text
saved squad loading
route-based squad selection
battle reward targets
Start Battle behavior
Save Squad behavior
card eligibility rules
battle mechanics
```

## Guardrails

Phase 10C does not add:

```text
multiple squad slots
squad names
drag/drop
stamina
drops
tickets
auth
new reward types
combat engine rewrite
```

## Verification checklist

1. Open `#/battle/squad`.
2. Confirm three squad slots are visible.
3. Confirm empty slots say to tap a card below.
4. Tap a card from Available Cards.
5. Confirm it fills a squad slot.
6. Tap the filled slot.
7. Confirm the card is removed from the squad.
8. Fill up to three slots.
9. Confirm extra cards are marked Squad full.
10. Click Save Squad.
11. Confirm the saved squad still loads on return.
12. Click Start Battle.
13. Confirm Battle Results uses the selected squad.
