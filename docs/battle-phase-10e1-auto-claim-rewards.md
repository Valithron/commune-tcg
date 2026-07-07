# Battle Phase 10E.1: Auto-Claim Battle Rewards

## Purpose

Phase 10E.1 makes battle rewards collect automatically if the player does not click the claim button.

Plain-English rule:

```text
If the battle result page is open and rewards are unclaimed, the app should claim them automatically.
```

## What changed

Files:

```text
src/services/battleRewardClaim.js
src/routes/BattleResults.js
docs/battle-phase-10e1-auto-claim-rewards.md
```

## Implementation

A shared client helper was added:

```text
src/services/battleRewardClaim.js
```

It owns the client-side `POST /api/battles` reward claim call.

Battle Results now uses that helper for both:

```text
manual Claim Now button
automatic claim fallback
```

This avoids having separate one-off fetch logic for manual and automatic claiming.

## Player behavior

When an unresolved Battle Results page opens:

```text
Claim Now is still available
rewards auto-claim shortly after render
if auto-claim succeeds, rewards show as claimed
if auto-claim fails, the player can tap Claim Now to retry
if already claimed, the existing preflight still shows Already Claimed
```

## Duplicate protection

The existing protected attempt system remains the source of truth.

Auto-claim still sends the same protected `attemptId` as manual claim.

The backend still prevents the same attempt from paying rewards twice.

## Guardrails

Phase 10E.1 does not change:

```text
reward math
XP math
level calculation
saved squad behavior
Battle Again behavior
battle_history schema
duplicate-attempt protection
```

Phase 10E.1 does not add:

```text
stamina
drops
tickets
auth
new reward types
combat engine rewrite
```

## Verification checklist

1. Open `#/battle/squad`.
2. Start a battle.
3. On Battle Results, do not click Claim Now.
4. Confirm the page says rewards are auto-claiming.
5. Confirm rewards become claimed automatically.
6. Confirm top-bar gold updates.
7. Refresh the same Battle Results URL.
8. Confirm Already Claimed still appears.
9. Start another battle.
10. Click Claim Now immediately.
11. Confirm manual claim still works.
12. Confirm rewards do not double-claim.
