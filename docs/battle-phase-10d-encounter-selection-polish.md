# Battle Phase 10D: Encounter Selection Polish

## Purpose

Phase 10D makes Choose Encounter feel more like selecting a fight.

Plain-English rule:

```text
The player should understand enemy difficulty, squad readiness, and rewards before choosing an encounter.
```

## Palette note

This phase keeps the Commune visual direction:

```text
navy/dark-blue surfaces
gold accents
existing token colors
```

The layout borrows from the Stitch encounter mockup, but does not switch to the charcoal-gray palette.

## What changed

Files:

```text
src/routes/EncounterSelect.js
src/styles/battle.css
docs/battle-phase-10d-encounter-selection-polish.md
```

## Player-facing Encounter Selection upgrades

Choose Encounter now has:

```text
current squad count
current squad power
polished encounter cards
difficulty pills
enemy type pill
simple portrait panel
recommended power
your squad power
outlook label
real gold reward preview
real squad XP reward preview
clear Select Encounter button
```

## Mechanics unchanged

Phase 10D does not change:

```text
encounter IDs
reward amounts
XP amounts
saved squad behavior
Squad Builder behavior
Battle Results behavior
duplicate-attempt protection
```

Encounter selection still routes into Squad Builder.

## Guardrails

Phase 10D does not add:

```text
stamina
drops
tickets
auth
enemy database management
new reward types
combat engine rewrite
heavy animation system
```

## Verification checklist

1. Open `#/battle/encounters`.
2. Confirm the hero shows current squad count and squad power.
3. Confirm encounter cards show difficulty labels.
4. Confirm encounter cards show recommended power and your power.
5. Confirm encounter cards show Gold and Squad XP rewards.
6. Click Select Encounter.
7. Confirm Squad Builder opens for that encounter.
8. Start Battle.
9. Confirm Battle Results still resolves and claims rewards normally.
10. Confirm no stamina, drops, tickets, or new reward types appear.
