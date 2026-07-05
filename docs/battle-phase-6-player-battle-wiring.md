# Battle Phase 6: Player Battle Backend Wiring

## Purpose

Battle Phase 6 connects the normal player Battle Results screen to the real Phase 5 battle reward endpoint.

Plain-English rule:

```text
The player can now resolve a battle from the normal Battle flow and receive real gold and XP rewards.
```

## Route changed

Updated route:

```text
#/battle/results?encounter=:encounterId
```

File:

```text
src/routes/BattleResults.js
```

## Safety behavior

The page does not write rewards automatically.

The player must click:

```text
Resolve Battle
```

Only then does the page call:

```text
POST /api/battles
```

This prevents refreshes or accidental route visits from repeatedly awarding battle rewards.

After a successful resolve, the button is disabled on that page view.

## What the player sees

The results screen now has two sections:

```text
Preview
Live Result
```

Preview shows the existing prototype matchup values.

Live Result shows the backend response after the battle is resolved:

```text
battleId
encounter
victory/loss
gold applied
total XP applied
writes
XP applied by card
```

## Current limitation

Real squad selection is not built yet.

Until squad selection is wired to backend-owned cards, the battle endpoint uses its default eligible owned squad when no squadCardIds are supplied.

That means the old visual preview squad may not always match the exact backend-owned cards that receive XP.

The applied XP section is the source of truth.

## Writes performed by the backend

Phase 6 does not add new write types. It uses the Phase 5 write path.

Writes remain limited to:

```text
battle_history
user_resources.gold
cards.card_json.xp
cards.card_json.level
cards.updated_at
```

Still deferred:

```text
drops
pull tickets
stamina
energy
Vault grants
new card grants
auth changes
```

## Files changed

```text
src/routes/BattleResults.js
src/main.js
src/routes/BattleHub.js
src/routes/EncounterSelect.js
src/routes/SquadBuilder.js
docs/battle-phase-6-player-battle-wiring.md
```

## Verification checklist

1. Open `#/battle`.
2. Choose an encounter.
3. Review the squad.
4. Start battle.
5. On `#/battle/results`, confirm the page does not auto-resolve.
6. Click `Resolve Battle`.
7. Confirm Live Result shows a battle ID.
8. Confirm Live Result shows gold applied.
9. Confirm Live Result shows XP applied by card.
10. Confirm writes include:

```text
battle_history
user_resources.gold
cards.card_json.xp_level
```

11. Confirm the button disables after success.
12. Confirm no drops, tickets, stamina, energy, Vault grants, or auth writes are shown.

## Recommended next phase

```text
Battle Phase 7: real squad selection from owned backend cards
```

That phase should make the visible selected squad and the backend reward target exactly match.
