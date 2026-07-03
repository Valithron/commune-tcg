# Cloudflare Resource Inventory

Phase 7 has begun the read-only Library read model. Fill this document with deployed endpoint output before implementing real Vault reads.

## Inventory endpoints

Open these after Cloudflare deploy:

```text
/api/health
/api/schema
/api/schema-details
/api/images
/api/images-summary
/api/cards
/api/card-image?key=<known-r2-object-key>
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

## Library read model check

Record `/api/cards` findings here.

| Field | Value |
|---|---|
| Selected card table | Pending |
| Returned card count | Pending |
| Warning output | Pending |
| Correct table selected? | Pending |
| Image key column detected? | Pending |

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
| Image serving via `/api/card-image` | Pending | Pending |

## Questions before Phase 8

- Are there existing ownership records for Vault cards?
- Is there any existing account/user table that should be respected?
- Which ownership table maps users to card templates?
- Are old card stats compatible with `pow`, `def`, and `spd`?
- Does the Library endpoint choose the correct card table, or does it need a fixed table name?
- Does the card image endpoint serve the expected art from R2 keys?

## Phase 8 readiness criteria

Do not start Phase 8 until this is known:

- Actual ownership/user table name, if one exists
- Actual card-template foreign key for ownership rows
- Minimum fields needed by Vault-specific card state
- Safe read-only query for owned cards
- Whether identity/auth exists or needs a temporary test-user strategy
