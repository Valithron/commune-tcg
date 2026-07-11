# Cloudflare Bindings

These live bindings support Imago Core. Branch promotion must preserve them and must not create replacement data resources.

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

## Deployment note

The checked-in `wrangler.toml` declares the Worker asset binding but does not contain D1 database IDs or R2 bucket configuration. The resources may be connected through the existing Cloudflare project/deployment environment. Verify `DB` and `CARD_IMAGES` on the target Worker before any production deploy from a new branch. Do not guess resource IDs, create new databases, or deploy a configuration that would detach the live bindings.

The Worker identifier remains `commune-tcg-gacha` for infrastructure compatibility. This is a historical deployment ID; the product is Imago Core.
