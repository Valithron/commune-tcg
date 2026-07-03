# Phase 5 Verification Checklist

Use this checklist after Phase 5 patches.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Static route checks

- `#/backend` renders the Backend Status screen
- `#/admin` links to Backend Status
- Unknown hashes still fall back to `#/home`

## Cloudflare endpoint checks

After deploying to Cloudflare Pages, open:

```text
/api/health
/api/schema
/api/images
```

Expected behavior:

- `/api/health` returns JSON and reports whether `DB` and `CARD_IMAGES` are present.
- `/api/schema` returns table names from D1 or a clear 503/500 JSON error.
- `/api/images` returns a small object listing from R2 or a clear 503/500 JSON error.

## Safety checks

- No endpoint writes to D1.
- No endpoint uploads to R2.
- No endpoint deletes from R2.
- No endpoint grants cards, tickets, gold, XP, or rewards.
- No admin approval endpoint exists yet.
