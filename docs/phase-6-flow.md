# Phase 6 Flow Notes

## Scope

Phase 6 expands the read-only diagnostics from Phase 5 into a proper Cloudflare resource inventory pass.

No writes are implemented.

## Front-end route

```text
#/backend
  -> #/inventory
```

The Resource Inventory screen links to D1 and R2 inventory endpoints and explains what must be captured before Phase 7.

## API endpoints

```text
GET /api/schema-details
GET /api/images-summary
```

These are added alongside the existing Phase 5 endpoints:

```text
GET /api/health
GET /api/schema
GET /api/images
```

### `/api/schema-details`

Reads D1 table names, column metadata, and index metadata using SQLite metadata queries and pragma calls.

### `/api/images-summary`

Samples up to 200 R2 objects and summarizes object extensions and top-level prefixes.

## Documentation output

Use the endpoint output to fill:

```text
docs/cloudflare-resource-inventory.md
```

## Guardrails

- No endpoint mutates D1.
- No endpoint mutates R2.
- No endpoint exposes write behavior.
- No endpoint grants cards, tickets, gold, XP, or rewards.
- No real Library/Vault read model should be implemented until inventory findings are documented.
