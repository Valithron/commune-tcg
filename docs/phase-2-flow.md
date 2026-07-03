# Phase 2 Flow Notes

## Scope

Phase 2 creates the static front-end shape of the core gacha loop without connecting to the backend.

## Mock pull flow

```text
#/pull
  -> #/pull/confirm?count=1
  -> #/pull/results?count=1

#/pull
  -> #/pull/confirm?count=5
  -> #/pull/results?count=5
```

The confirmation screen shows ticket cost, current mock tickets, and mock rarity odds. It does not spend tickets.

The results screen shows deterministic card results. It does not write to the Vault.

## Mock detail flow

```text
#/vault
  -> #/vault/card/:cardId

#/library
  -> #/library/card/:cardId
```

Vault detail is for player-specific state such as ownership, copies, levels, future upgrades, and future XP.

Library detail is for global card-template information such as rarity, category, stats, flavor, pull eligibility, and future submission metadata.

## Implementation guardrails

- Pull logic stays in `src/data/mockPull.js` until a real backend contract exists.
- Ticket Shop offers stay in `src/data/mockShop.js` until economy rules are designed.
- `src/components/CardFrame.js` remains the canonical card renderer.
- `src/components/CardDetailPanel.js` owns shared detail layout for Vault and Library detail routes.
- Route files should compose components and should not become data engines.
