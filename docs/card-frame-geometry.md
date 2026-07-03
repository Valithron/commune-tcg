# Card Frame Geometry

## Current tuned geometry

This geometry was promoted from Card Lab tuner output and rounded for centered production use.

```text
art:       x 3,  y 2,  w 94, h 92
nameplate: x 2,  y 82, w 96, h 16
pills:     x 5,  y 88, w 90, h 5
stats:     x 25, y 75, w 50, h 7
```

Equivalent CSS variables:

```css
--card-art-x: 3%;
--card-art-y: 2%;
--card-art-w: 94%;
--card-art-h: 92%;
--card-nameplate-x: 2%;
--card-nameplate-y: 82%;
--card-nameplate-w: 96%;
--card-nameplate-h: 16%;
--card-pills-x: 5%;
--card-pills-y: 88%;
--card-pills-w: 90%;
--card-pills-h: 5%;
--card-stats-x: 25%;
--card-stats-y: 75%;
--card-stats-w: 50%;
--card-stats-h: 7%;
```

## Standard card override

`src/styles/card-geometry-test.css` currently raises the standard card lower block only:

```css
.tcg-card--standard {
  --card-nameplate-y: 77%;
  --card-pills-y: 83%;
}
```

This is intentionally reversible. Remove the import for `card-geometry-test.css` in `src/main.js` to return standard cards to the shared tuned geometry.

## Title fitting

Card titles are constrained to one line for title-bearing densities.

The current global title target is:

```text
25 characters, including spaces
```

`src/components/cardTitleFit.js` runs after each route render. It measures each non-thumbnail title and sets `--card-title-fit-size` only when the title needs to shrink to fit the available width.

It does not use a polling loop or a persistent observer. It also reruns once after web fonts are ready so title width is measured against the final font.

Thumbnail cards do not show titles and are skipped by the fitter.

## Source tuner values

User-provided source values before rounding:

```json
{
  "art": { "x": 2.9, "y": 1.6, "w": 94.9, "h": 92.4 },
  "nameplate": { "x": 2.1, "y": 81.6, "w": 96.9, "h": 16.4 },
  "pills": { "x": 5.5, "y": 87.6, "w": 90.1, "h": 4.8 },
  "stats": { "x": 24.7, "y": 74.7, "w": 50, "h": 7 }
}
```

## Previous layout

Before this pass, cards used the natural flow layout in `src/styles/cards.css`:

```text
art block
nameplate block
pill row block
centered stat footer at 50% width
```

The previous layout did not have production percentage geometry for art, nameplate, pill row, or stat row. To reverse the tuned pass, revert the commit that introduced this file and the matching `src/styles/cards.css` geometry changes.

## Guardrails

- Geometry values are percentages so they can scale across showcase, standard, and thumbnail densities.
- Pixel measurements in the tuner are visual aids only.
- The Card Lab tuner remains the place to adjust geometry before promoting values to production CSS.
- Title fitting is post-render and one-time per route render, plus one post-font-ready pass.
