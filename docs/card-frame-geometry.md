# Card Frame Geometry

## Density stylesheet structure

Card geometry now has one shared foundation plus one explicit density stylesheet per size:

```text
src/styles/cards.css              shared card foundation
src/styles/card-showcase.css      large/showcase overrides
src/styles/card-standard.css      standard overrides
src/styles/card-thumbnail.css     thumbnail overrides
```

`src/styles/card-geometry-test.css` was removed to avoid ambiguous override behavior.

## Shared tuned geometry

The shared fallback geometry in `cards.css` is:

```text
art:       x 3,  y 2,  w 94, h 92
nameplate: x 2,  y 82, w 96, h 16
pills:     x 5,  y 88, w 90, h 5
stats:     x 25, y 75, w 50, h 7
```

Equivalent shared CSS variables:

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

## Standard card geometry

The current standard geometry is promoted from the standard Card Lab tuner and lives in `src/styles/card-standard.css`.

Current values:

```text
art:       x 3,  y 2,    w 94, h 92
nameplate: x 4,  y 75.1, w 94, h 16
pills:     x 5,  y 85,   w 90, h 5
stats:     x 26, y 67,   w 50, h 8.5
```

Equivalent standard CSS variables:

```css
.tcg-card--standard {
  --card-art-x: 3%;
  --card-art-y: 2%;
  --card-art-w: 94%;
  --card-art-h: 92%;
  --card-nameplate-x: 4%;
  --card-nameplate-y: 75.1%;
  --card-nameplate-w: 94%;
  --card-nameplate-h: 16%;
  --card-pills-x: 5%;
  --card-pills-y: 85%;
  --card-pills-w: 90%;
  --card-pills-h: 5%;
  --card-stats-x: 26%;
  --card-stats-y: 67%;
  --card-stats-w: 50%;
  --card-stats-h: 8.5%;
}
```

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

Original large-card source values before rounding:

```json
{
  "art": { "x": 2.9, "y": 1.6, "w": 94.9, "h": 92.4 },
  "nameplate": { "x": 2.1, "y": 81.6, "w": 96.9, "h": 16.4 },
  "pills": { "x": 5.5, "y": 87.6, "w": 90.1, "h": 4.8 },
  "stats": { "x": 24.7, "y": 74.7, "w": 50, "h": 7 }
}
```

Standard-card source values before latest promotion:

```json
{
  "art": { "x": 3, "y": 2, "w": 94, "h": 92 },
  "nameplate": { "x": 4, "y": 75.1, "w": 94, "h": 16 },
  "pills": { "x": 5, "y": 85, "w": 90, "h": 5 },
  "stats": { "x": 26, "y": 67, "w": 50, "h": 8.5 }
}
```

## Previous layout

Before percentage geometry, cards used the natural flow layout in `src/styles/cards.css`:

```text
art block
nameplate block
pill row block
centered stat footer at 50% width
```

## Guardrails

- Geometry values are percentages so they can scale across densities.
- Pixel measurements in the tuner are visual aids only.
- The Card Lab tuner remains the place to adjust geometry before promoting values to production CSS.
- Title fitting is post-render and one-time per route render, plus one post-font-ready pass.
- Density-specific production changes should go in the relevant density stylesheet, not in `card-lab.css`.
