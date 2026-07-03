# Cloudflare Resource Inventory

Phase 6 is a read-only inventory pass. Fill this document with deployed endpoint output before implementing real Library or Vault reads.

## Inventory endpoints

Open these after Cloudflare deploy:

```text
/api/health
/api/schema
/api/schema-details
/api/images
/api/images-summary
```

## Binding check

Record `/api/health` output here.

```json
{
  "pending": true
}
```

## D1 table inventory

Record `/api/schema` and `/api/schema-details` findings here.

| Table | Primary key | Important columns | Notes |
|---|---|---|---|
| Pending | Pending | Pending | Pending |

## D1 gaps against expected contracts

Compare actual D1 tables against `docs/backend-contracts.md`.

| Expected model | Actual table/columns | Gap |
|---|---|---|
| `card_templates` | Pending | Pending |
| `card_submissions` | Pending | Pending |
| `user_vault_cards` | Pending | Pending |
| `pull_history` | Pending | Pending |
| `battle_history` | Pending | Pending |

## R2 image inventory

Record `/api/images` and `/api/images-summary` findings here.

| Pattern | Example | Notes |
|---|---|---|
| Top-level prefix | Pending | Pending |
| Extension | Pending | Pending |
| Key-to-card mapping | Pending | Pending |

## Questions before Phase 7

- Which D1 table represents approved cards in the Library?
- Which D1 column stores the R2 image key?
- Are images stored by card id, random object id, or upload path?
- Are there existing ownership records for Vault cards?
- Is there any existing account/user table that should be respected?
- Are old card stats compatible with `pow`, `def`, and `spd`?

## Phase 7 readiness criteria

Do not start Phase 7 until this is known:

- Actual approved-card table name
- Actual image-key mapping
- Minimum fields needed by `CardFrame.js`
- Safe read-only query for approved Library cards
- Image serving strategy for R2 objects
