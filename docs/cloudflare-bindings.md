# Cloudflare Bindings

These bindings already exist in the Cloudflare Pages project and should be used when the backend phase begins.

## Current bindings

| Type | Binding name | Resource value | Intended use |
|---|---|---|---|
| D1 database | `DB` | `com-tcg-db` | Card data, user state, pulls, battle records, admin data |
| R2 bucket | `CARD_IMAGES` | `com-tcg-images` | Uploaded card art and future generated image assets |

## Code access pattern

Cloudflare Pages Functions should access these as:

```js
env.DB
env.CARD_IMAGES
```

## Phase note

Phase 2 does not connect to either binding. This document exists so the future backend phase does not rediscover or rename already-provisioned infrastructure.
