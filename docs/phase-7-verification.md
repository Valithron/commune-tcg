# Phase 7 Verification Checklist

Use this checklist after Phase 7 patches.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Static route checks

- `#/library` renders with either backend cards or mock fallback
- `#/library/card/:cardId` renders backend-loaded cards when available
- `#/inventory` links to `/api/cards`
- Unknown hashes still fall back to `#/home`

## Cloudflare endpoint checks

After deploying to Cloudflare Pages, open:

```text
/api/cards
/api/card-image?key=<known-r2-object-key>
```

Expected behavior:

- `/api/cards` returns JSON with `ok`, `source`, `table`, `cards`, `columns`, and `warnings`.
- `/api/cards` does not mutate D1.
- `/api/card-image` returns an image for a valid key or a clear 400/404/503 response.
- Library cards with image keys display image art in `CardFrame.js`.

## Fallback checks

- If D1 is unavailable, `#/library` shows mock cards and a source note.
- If `/api/cards` cannot map the schema, `#/library` shows mock cards and a source note.
- Mock pulls, Vault, Battle, Submit, and Admin still load.

## Safety checks

- No endpoint writes to D1.
- No endpoint uploads to R2.
- No endpoint deletes from R2.
- No endpoint grants cards, tickets, gold, XP, or rewards.
