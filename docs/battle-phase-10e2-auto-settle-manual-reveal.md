# Battle Phase 10E.2: Auto-Settle, Manual Reveal

## Purpose

Phase 10E.2 corrects Phase 10E.1 by separating backend reward safety from the player-facing reward reveal.

Plain-English rule:

```text
The player should not lose rewards by leaving the result screen, but the reward reveal should still be a player moment.
```

## Product distinction

There are now two separate concepts:

```text
settlement = backend safety
reveal = player-facing payoff
```

Settlement protects the rewards.

Reveal shows the rewards.

## What changed

Files:

```text
src/routes/BattleResults.js
docs/battle-phase-10e2-auto-settle-manual-reveal.md
```

The shared helper from Phase 10E.1 remains:

```text
src/services/battleRewardClaim.js
```

## Player behavior

When an unresolved Battle Results page opens:

```text
rewards begin settling in the background
the reward reveal stays hidden
the button says Reveal Rewards
once settlement succeeds, the page says Rewards secured
player taps Reveal Rewards to show gold, XP, and card progression
```

If settlement fails:

```text
Reveal Rewards remains available
clicking it retries settlement and then reveals on success
```

If the attempt was already settled:

```text
Battle Results shows rewards secured
Reveal Rewards fetches the settled reward details and reveals them
```

## Local reveal memory

The page stores a local reveal flag per attempt ID:

```text
commune-tcg-battle-reveal:<attemptId>
```

This is cosmetic only.

The backend battle attempt remains the source of truth for whether rewards were actually settled.

## Mechanics unchanged

Phase 10E.2 does not change:

```text
reward math
XP math
level calculation
saved squad behavior
Battle Again behavior
battle_history schema
duplicate-attempt protection
```

## Guardrails

Phase 10E.2 does not add:

```text
stamina
drops
tickets
auth
new reward types
combat engine rewrite
```

## Verification checklist

1. Start a battle.
2. On Battle Results, do not click Reveal Rewards immediately.
3. Confirm the page says rewards are being secured.
4. Confirm it changes to Rewards secured without revealing the XP rows.
5. Click Reveal Rewards.
6. Confirm gold, XP, and squad progression reveal.
7. Confirm top-bar gold updates after reveal.
8. Refresh the same result URL.
9. Confirm the attempt is still safe and does not pay twice.
10. Start another battle and click Reveal Rewards immediately.
11. Confirm the manual path settles and reveals correctly.
