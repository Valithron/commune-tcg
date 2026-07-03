# Phase 3 Flow Notes

## Scope

Phase 3 creates the static front-end shape of the battle loop without connecting to the backend.

## Mock battle flow

```text
#/battle
  -> #/battle/encounters
  -> #/battle/squad?encounter=training-yard-goblin
  -> #/battle/results?encounter=training-yard-goblin
```

The battle hub summarizes readiness and links into the encounter loop.

The encounter screen lists deterministic mock enemies from `src/data/mockBattle.js`.

The squad screen reviews a locked mock squad from the owned card data. It does not support drag/drop, saved squads, slot validation, or server writes yet.

The results screen resolves a deterministic mock outcome using squad power compared against encounter power. It does not write rewards, XP, battle history, or card progress.

## Implementation guardrails

- Battle data stays in `src/data/mockBattle.js` until a backend battle contract exists.
- Battle route files compose mock data and reusable components only.
- `src/components/CardFrame.js` remains the only card-face renderer.
- Battle-specific layout lives in `src/styles/battle.css`.
- No battle route should write to account state in Phase 3.

## Future backend concerns

Later phases should define contracts for:

- Energy or stamina balance
- Encounter availability and unlocks
- Squad validation
- Battle simulation or deterministic server resolution
- XP and currency rewards
- Loot drops
- Battle history
- Anti-tamper validation
