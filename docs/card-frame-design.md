# Card Frame Design Notes

Phase 7.5 introduces the Card Lab so card-frame decisions can be tested against real Library data before Vault, Pull, and Battle depend on more card state.

## Current target

The current target is the Stitch card chassis:

- 2:3 aspect ratio
- art-forward card body
- compact title bar
- fixed stat footer
- rarity chip inside the lower nameplate
- rarity-specific border and glow treatment
- one canonical renderer in `src/components/CardFrame.js`

## Visible card-face data

The card face should show only card-relevant information:

- art
- title
- rarity
- stats when enabled
- future ownership/progression state only in owned-card contexts

The card face should not show route/source labels such as Library, Vault, database table names, or other location metadata.

## Title rules

No card title ellipsis is allowed.

Titles should use a fixed size per density, not dynamic per card. Each density reserves enough title space for the accepted title length.

Current minting target:

```text
28 characters, including spaces
```

This limit should be enforced when the real submission/minting pipeline is implemented.

## Densities

`CardFrame.js` supports these density variants:

| Density | Purpose |
|---|---|
| `showcase` | Large inspection/detail size |
| `standard` | Normal mobile collection size |
| `thumbnail` | Small compressed collection/result size |

## Contexts

`CardFrame.js` supports a context class so future state can be centralized rather than patched by route.

Current contexts:

| Context | Purpose |
|---|---|
| `library` | Global template view, no ownership badge |
| `vault` | Future owned-card state |
| `pull` | Future reveal/result state |
| `battle` | Future selection/combat state |

## Card Lab

Route:

```text
#/card-lab
```

The Card Lab loads live Library cards and selects five cards by title length:

- shortest
- 25th percentile
- median
- 80th percentile
- longest

The same five cards render at showcase, standard, and thumbnail sizes.

## Guardrails

- Do not create route-specific card markup.
- Do not add one-off badge overlays in route files.
- Do not use per-card dynamic title shrinking.
- Do not use title ellipsis.
- Do not show route/source labels on the card face.
- Keep card styling centralized in `src/styles/cards.css`.
- Use the Card Lab before broad card-frame production changes.
