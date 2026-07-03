# Phase 7.5 Card Lab

## Scope

Phase 7.5 adds a card-frame inspection route before the production overlay shape is fully finalized.

No gameplay systems are added.

## Route

```text
#/card-lab
```

The route is linked from the Library screen.

## Live data

The Card Lab uses the same read-only Library data source as the Library route:

```text
src/data/libraryData.js
GET /api/cards
```

If backend data fails, it uses the existing mock fallback.

## Sample selection

The Card Lab sorts loaded cards by title length and chooses five samples:

- shortest title
- 25th percentile title length
- median title length
- 80th percentile title length
- longest title

## Render sizes

Each sample renders in three densities from the canonical CardFrame renderer:

- showcase
- standard
- thumbnail

## Verification

After deployment:

- Open `#/card-lab`.
- Confirm five title-length samples load.
- Confirm all three rows render live cards.
- Confirm title text does not use ellipsis.
- Confirm Library cards do not show Locked badges.
- Confirm CardFrame remains the only card renderer.
