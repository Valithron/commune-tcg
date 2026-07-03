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

## Detail preview

Before the density rows, Card Lab renders a detail/stat sheet preview:

- one showcase-size card
- title and flavor/description copy outside the card face
- expanded POW / DEF / SPD panels
- identity fields
- creator and provenance fields
- art fields
- gameplay fields
- economy fields
- ownership and progression fields
- text and lore fields
- moderation and visibility fields
- data and debug fields

This tests how card metadata will appear without cluttering the card face itself.

Unknown or not-yet-exposed fields display as `Not mapped yet`.

## Frame tuners

Card Lab has two editable card makers:

- large/detail card tuner
- standard-size card tuner

Each tuner provides draggable and resizable boxes for:

- art
- nameplate
- pill row
- stat row

The pill row is independent from the nameplate so those regions can be tuned separately.

The tuner adds:

- pixel readout flags on each editable box
- a whole-card pixel readout
- card, art, nameplate, pill row, and stat row size chips in the control panel
- horizontal and vertical center guide lines
- centered-state labels when a box is aligned near center

The pixel numbers are only visual aids. The final implementation should use the percentage ratios emitted by the tuner.

The tuners write no backend data. Each tuner stores its own local preview values in browser `localStorage` and displays copyable CSS variables plus JSON for later promotion into the canonical card CSS.

Thumbnail cards are intentionally not editable here because the current thumbnail size is approved.

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
- Confirm the detail/stat sheet preview appears before all card rows.
- Confirm the large detail card has draggable/resizable boxes for art, nameplate, pill row, and stat row.
- Confirm the standard-size card maker appears below the detail preview.
- Confirm the standard-size card maker has its own controls and output.
- Confirm the pill row moves independently from the nameplate in both tuners.
- Confirm each editable box displays pixel width and height.
- Confirm each control panel displays card, art, nameplate, pill, and stat dimensions.
- Confirm center guide lines render.
- Confirm each tuner output updates as boxes move.
- Confirm reset, copy CSS, and copy JSON controls work for both tuners.
- Confirm the stat sheet includes identity, creator, art, gameplay, economy, progression, lore, moderation, and debug groups.
- Confirm unknown fields display as `Not mapped yet`.
- Confirm each density has a title-length row and a rarity row.
- Confirm title text does not use ellipsis.
- Confirm Common, Uncommon, Rare, Legendary, and Mythic frame treatments render.
- Confirm lab-only rarity overrides do not write to D1.
- Confirm Library cards do not show Locked badges.
- Confirm CardFrame remains the only card renderer.
