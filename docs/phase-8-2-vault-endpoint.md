# Phase 8.2: Read-only Vault Endpoint

## Purpose

Phase 8.2 creates the first read-only Vault endpoint from the existing `cards` table.

This phase does not wire the `#/vault` route yet. It only exposes normalized owned-card data so the next phase can connect the UI safely.

## Endpoint

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/vault` | Read owned cards from `cards.owner_user_id` |

Optional owner filter:

```text
/api/vault?ownerUserId=OWNER_ID
```

## Source table

The endpoint reads from `cards`.

Required source fields:

```text
id
owner_user_id
character_id
card_json
created_at
updated_at
```

Only rows where `owner_user_id` is non-empty are treated as Vault rows.

## Normalized card shape

Each returned card is normalized for the same card-rendering shape used by Library cards, plus Vault-specific fields:

```text
owned: true
ownerUserId
sourceRowId
sourceTable: cards
level
xp
copies
progressionMapped
createdAt
updatedAt
```

If `level`, `xp`, or `copies` are missing from the source row or `card_json`, safe placeholders are applied:

```text
level: 1
xp: 0
copies: 1
progressionMapped: false
```

## Current auth boundary

There is no real authentication boundary yet.

That means `/api/vault` is currently a read-only mapping endpoint, not a final current-user Vault contract.

- Without `ownerUserId`, it returns up to 500 owned rows across owners.
- With `ownerUserId`, it returns rows for that owner only.
- Future auth must decide how the app identifies the active owner.

## Verification checklist

After Cloudflare deploys, open `/api/vault` and check:

- `ok` is `true`
- `readOnly` is `true`
- `table` is `cards`
- `totalReturned` is greater than zero
- returned cards have `owned: true`
- returned cards have `ownerUserId`
- image keys resolve through `/api/card-image`
- warnings correctly mention placeholder progression if source data lacks progression fields

Also test owner filtering with one owner from `ownerUserIds`:

```text
/api/vault?ownerUserId=OWNER_ID
```

## Guardrails

- No writes.
- No pulls.
- No rewards.
- No auth claims.
- No Vault UI wiring.
- No CardFrame changes.
- No Card Lab changes.
- No visual redesign.

## Next phase

Phase 8.3 should wire the `#/vault` route to `/api/vault` only after choosing the temporary owner strategy or authentication boundary.
