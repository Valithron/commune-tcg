# Phase 7 Flow Notes

## Scope

Phase 7 adds the first real read model for the Library. The front end now prefers read-only card data from D1 through `/api/cards` and falls back to local mock data if the deployed database is unavailable or unmapped.

No gameplay writes are implemented.

## Front-end flow

```text
#/library
  -> src/data/libraryData.js
  -> GET /api/cards
  -> fallback to src/data/mockCards.js if needed
```

`#/library/card/:cardId` uses the same Library data source so backend-loaded cards can open in the detail view.

## API endpoints

```text
GET /api/cards
GET /api/card-image?key=<r2-object-key>
```

### `/api/cards`

Reads D1 metadata, picks a likely card table, reads up to 200 rows, and normalizes those rows into the `CardFrame.js` shape.

The endpoint looks for common column names such as:

- name/title/card_name
- rarity/tier
- category/type/class/faction
- pow/power/attack
- def/defense/health
- spd/speed/agility
- flavor/flavor_text/description/lore
- image_key/image_path/object_key/r2_key

### `/api/card-image`

Serves an R2 object by key for card art display. It is read-only and never uploads, deletes, or mutates objects.

## Guardrails

- No D1 writes.
- No R2 writes.
- No ownership data is read yet.
- No pull results are generated.
- No card approval is performed.
- If D1 cannot be mapped, the Library remains usable through mock fallback.

## Next phase dependency

Before Phase 8, confirm whether there are existing ownership tables or account/user tables. Phase 8 should not invent Vault schema if the deployed database already has one.
