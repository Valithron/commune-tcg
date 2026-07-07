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

## 10D.1 compact-card cleanup

After visual review, the first vertical card version was too tall and cramped on mobile.

10D.1 tightens the design:

```text
removes encounter flavor descriptions from player cards
uses compact fight-card layout
keeps portrait, name, tags, power comparison, rewards, and CTA
adds a narrow override stylesheet instead of rewriting shared battle CSS
```

## What changed

Files:

```text
src/routes/EncounterSelect.js
src/styles/battle.css
src/styles/battle-encounter-compact.css
src/main.js
docs/battle-phase-10d-encounter-selection-polish.md
```

## Player-facing Encounter Selection upgrades

Choose Encounter now has:

```text
current squad count
current squad power
compact encounter cards
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
3. Confirm encounter cards are compact and not tall poster cards.
4. Confirm encounter flavor descriptions are not shown on the player cards.
5. Confirm encounter cards show difficulty labels.
6. Confirm encounter cards show recommended power and your power.
7. Confirm encounter cards show Gold and Squad XP rewards.
8. Click Select Encounter.
9. Confirm Squad Builder opens for that encounter.
10. Start Battle.
11. Confirm Battle Results still resolves and claims rewards normally.
12. Confirm no stamina, drops, tickets, or new reward types appear.
