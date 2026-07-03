# Phase 6 Verification Checklist

Use this checklist after Phase 6 patches.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Static route checks

- `#/inventory` renders the Resource Inventory screen
- `#/backend` links to Resource Inventory
- Unknown hashes still fall back to `#/home`

## Cloudflare endpoint checks

After deploying to Cloudflare Pages, open:

```text
/api/health
/api/schema
/api/schema-details
/api/images
/api/images-summary
```

Expected behavior:

- `/api/health` returns JSON and reports whether `DB` and `CARD_IMAGES` are present.
- `/api/schema` returns table names from D1 or a clear JSON error.
- `/api/schema-details` returns table columns and index metadata or a clear JSON error.
- `/api/images` returns a small object listing from R2 or a clear JSON error.
- `/api/images-summary` returns sampled extension and prefix counts or a clear JSON error.

## Documentation checks

- `docs/cloudflare-resource-inventory.md` exists.
- Inventory findings are pasted into that document before Phase 7 begins.
- `docs/backend-contracts.md` is updated if actual resource shapes differ from expected contracts.

## Safety checks

- No endpoint writes to D1.
- No endpoint uploads to R2.
- No endpoint deletes from R2.
- No gameplay rewards or account state are mutated.
