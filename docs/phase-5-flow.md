# Phase 5 Flow Notes

## Scope

Phase 5 adds read-only backend bridge scaffolding. It does not implement gameplay persistence, card approval, image uploads, ticket spending, rewards, or account state writes.

## Front-end route

```text
#/admin
  -> #/backend
```

The Backend Status screen links to safe diagnostic endpoints so Cloudflare bindings can be verified after deployment.

## API endpoints

```text
GET /api/health
GET /api/schema
GET /api/images
```

### `/api/health`

Reports whether the expected Cloudflare bindings exist in the runtime environment.

### `/api/schema`

Reads D1 `sqlite_master` to list table names. This is schema discovery only and does not assume the existing database structure.

### `/api/images`

Lists a small sample of objects from `CARD_IMAGES`. This is read-only and does not upload, delete, or transform objects.

## Guardrails

- No endpoint mutates D1.
- No endpoint mutates R2.
- No endpoint grants currency, XP, cards, or rewards.
- No endpoint approves submitted cards.
- No route trusts client-provided game outcomes.

## Next backend step

Use `/api/schema` and `/api/images` to inspect the existing production resources, then map the current D1 table names and R2 object keys before implementing real read models.
