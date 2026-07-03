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

The Card Lab now builds two sample groups.

Title-length samples:

- shortest title
- 25th percentile title length
- median title length
- 80th percentile title length
- longest title

Rarity samples:

- common
- uncommon
- rare
- legendary
- mythic

Rarity samples prefer real Library cards of each rarity. Missing rarities render as lab-only rarity overrides. If Mythic is missing, the lab first looks for a Legendary card and renders that card as Mythic for frame inspection only.

## Render sizes

Each density renders both sample groups:

- five title-length cards
- five rarity cards

Densities:

- showcase
- standard
- thumbnail

## Verification

After deployment:

- Open `#/card-lab`.
- Confirm each density has a title-length row and a rarity row.
- Confirm title text does not use ellipsis.
- Confirm Common, Uncommon, Rare, Legendary, and Mythic frame treatments render.
- Confirm lab-only rarity overrides do not write to D1.
- Confirm Library cards do not show Locked badges.
- Confirm CardFrame remains the only card renderer.
