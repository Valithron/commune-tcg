# Battle Phase 10A: Player Presentation Cleanup

## Purpose

Phase 10A removes backend and debug wording from the normal player Battle flow.

Plain-English rule:

```text
Player screens should feel like game screens. Admin screens can keep the technical details.
```

## What changed

Player-facing battle screens were cleaned up:

```text
src/routes/SquadBuilder.js
src/routes/BattleResults.js
src/styles/battle.css
```

## Squad Builder cleanup

Removed visible technical presentation such as:

```text
Backend Selection
backend-owned cards
selection source status codes
saved IDs
selected IDs
row ID display
```

Player-facing language now focuses on:

```text
Your Squad
Available Cards
Save Squad
Start Battle
Enemy Power
Squad Power
Outlook
Tap to add
Tap to remove
```

The hidden mechanics are unchanged:

```text
saved squad loading still works
route squad selection still works
Save Squad still writes the preferred lineup
Start Battle still passes selected card IDs into Battle Results
```

## Battle Results cleanup

Removed visible technical presentation such as:

```text
attempt ID
battle ID
selected IDs
writes
backend result language
API wording
```

Player-facing language now focuses on:

```text
Victory or Defeat
Claim Rewards
Already Claimed
Gold Earned
Squad XP
Cards that gained XP
Your Squad
Combat Summary
```

The hidden mechanics are unchanged:

```text
attempt status preflight still works
Claim Rewards still sends the protected attempt ID
rewards still apply once
already-claimed attempts stay blocked
```

## Guardrails

Phase 10A does not add:

```text
stamina
drops
tickets
auth
multiple squad slots
combat engine rewrite
new reward types
heavy animation system
```

Admin diagnostics are not removed.

## Verification checklist

1. Open `#/battle/squad`.
2. Confirm the page says Your Squad and Available Cards.
3. Confirm visible row IDs and backend/debug labels are gone from the player page.
4. Select cards and click Save Squad.
5. Confirm the save message is player-friendly.
6. Click Start Battle.
7. Confirm Battle Results says Victory or Defeat.
8. Confirm the button says Claim Rewards.
9. Confirm reward cards show Gold and Squad XP.
10. Claim rewards.
11. Confirm the result changes to claimed language.
12. Refresh the same result URL.
13. Confirm it says Already Claimed without showing technical IDs.
14. Confirm admin diagnostic pages still show technical endpoint information.
