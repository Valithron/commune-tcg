# Card Frame Design Notes

Phase 7.5 introduces the Card Lab so card-frame decisions can be tested against real Library data before Vault, Pull, and Battle depend on more card state.

## Current target

The current target is the Stitch card chassis:

- 2:3 aspect ratio
- art-forward card body
- compact title bar
- fixed stat footer
- identity pill row inside the lower nameplate
- rarity-specific border and glow treatment
- one canonical renderer in `src/components/CardFrame.js`

## Visible card-face data

The card face should show only card-relevant information:

- art
- title at showcase and standard densities
- rarity initial
- character abbreviation
- type
- ability icon placeholder
- stats when enabled
- future ownership/progression state only in owned-card contexts

The card face should not show route/source labels such as Library, Vault, database table names, or other location metadata.

Thumbnail density intentionally hides titles to avoid visual overload.

## Identity pill row

The lower nameplate identity row is:

```text
[rarity initial] [character abbreviation] [type] [ability icon]
```

Rarity uses one initial only:

```text
C U R L M
```

Character abbreviation colors use the canonical Imago Core identity assignments:

| Character | Abbreviation | Color |
|---|---:|---|
| Cydney | CY | `#789461` |
| Sterling | ST | `#c4c5db` |
| Ryan | RY | `#a98cff` |
| Gabi | GA | `#8ccdff` |
| Cooper | CO | `#ff8f70` |
| Kenly | KE | `#73e1c2` |
| Ashley | AS | `#ff9ccf` |

Type uses the dedicated canonical type colors in `docs/brand.md` and `src/styles/tokens.css`. Type color identifies affinity and remains independent from rarity and character identity colors.

Ability uses a placeholder icon until the ability system is defined.

## Title rules

No card title ellipsis is allowed.

Titles should render on one line at title-bearing densities. The one-time title fitter may shrink showcase and standard titles after render to preserve a single line.

Current minting target:

```text
25 characters, including spaces
```

This limit should be enforced when the real submission/minting pipeline is implemented.

## Densities

`CardFrame.js` supports these density variants:

| Density | Purpose |
|---|---|
| `showcase` | Large inspection/detail size |
| `standard` | Normal mobile collection size |
| `thumbnail` | Small compressed collection/result size with no visible card title |

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
#/admin/card-lab
```

The administrator-only Card Lab loads live Library cards and selects five cards by title length:

- shortest
- 25th percentile
- median
- 80th percentile
- longest

The same five cards render at showcase, standard, and thumbnail sizes.

## Guardrails

- Do not create route-specific card markup.
- Do not add one-off badge overlays in route files.
- Do not use title ellipsis.
- Do not show route/source labels on the card face.
- Keep card styling centralized in `src/styles/cards.css`.
- Use the Card Lab before broad card-frame production changes.
