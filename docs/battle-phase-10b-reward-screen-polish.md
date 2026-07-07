# Battle Phase 10B: Reward Screen Polish

## Purpose

Phase 10B makes the Battle Results screen feel more like a game reward screen.

Plain-English rule:

```text
The battle result should feel like payoff, not a receipt.
```

## Palette note

This phase keeps the Commune visual direction:

```text
navy/dark-blue surfaces
gold accents
existing token colors
```

The update borrows layout cues from the Stitch mockup, but does not switch to the mockup charcoal-gray palette.

## What changed

Files:

```text
src/routes/BattleResults.js
src/styles/battle.css
docs/battle-phase-10b-reward-screen-polish.md
```

## Player-facing result upgrades

Battle Results now has:

```text
large Victory or Defeat title
Lead Card panel
Rewards Acquired section
Gold and Squad XP reward cards
Squad Progress section
card-by-card XP rows
Level Up callouts
XP progress bars
Battle Again button
Already Claimed state
```

## Mechanics unchanged

Phase 10B does not change:

```text
battle resolution math
reward amounts
XP amounts
level calculation
saved squads
duplicate-attempt protection
attempt status preflight
gold update behavior
```

## Battle Again behavior

The Battle Again button creates a fresh protected Battle Results route for the same encounter and selected squad.

It still uses the existing attempt system. It does not bypass duplicate protection.

## Guardrails

Phase 10B does not add:

```text
stamina
drops
tickets
auth
multiple squad slots
new reward types
combat engine rewrite
heavy animation system
```

## Verification checklist

1. Open `#/battle/squad`.
2. Start a battle with selected cards.
3. Confirm Battle Results has a large Victory or Defeat heading.
4. Confirm the Lead Card panel appears.
5. Confirm Rewards Acquired shows Gold and Squad XP.
6. Click Claim Rewards.
7. Confirm the rewards change to claimed state.
8. Confirm Squad Progress shows card-by-card XP rows.
9. Confirm level-up rows have a clear callout when applicable.
10. Confirm top-bar gold still updates after claiming.
11. Refresh the same result URL.
12. Confirm Already Claimed still works.
13. Click Battle Again.
14. Confirm a new unclaimed result page opens for the same squad and encounter.
