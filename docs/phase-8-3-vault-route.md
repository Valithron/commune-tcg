# Phase 8.3: Vault Route Wiring

## Purpose

Phase 8.3 wires the existing `#/vault` and `#/vault/card/:cardId` routes to the read-only Phase 8.2 Vault endpoint.

The temporary active owner is:

```text
sterling
```

This is a temporary owner strategy only. It is not real authentication.

## Data flow

```text
#/vault
  -> /api/vault?ownerUserId=sterling
  -> cards.owner_user_id + cards.card_json
  -> CardFrame cards
```

```text
#/vault/card/:cardId
  -> /api/vault?ownerUserId=sterling
  -> find matching owned card
  -> CardDetailPanel
```

## Fallback behavior

If the endpoint is unavailable or returns an unusable payload, the route falls back to local mock owned cards.

The page displays a source note:

```text
Source: Live Vault · sterling
```

or:

```text
Source: Mock Vault fallback
```

## Guardrails

- No D1 writes.
- No auth claims.
- No pull resolution.
- No rewards.
- No battle changes.
- No submission changes.
- No CardFrame changes.
- No card visual redesign.

## Verification checklist

After Cloudflare deploys:

1. Open `#/vault`.
2. Confirm the source note says `Live Vault · sterling`.
3. Confirm the owned count matches Sterling's returned cards from `/api/vault?ownerUserId=sterling`.
4. Tap a Vault card.
5. Confirm the detail page opens and stacks correctly.
6. Confirm card visuals match the current standard/showcase card design.
7. Confirm `/api/vault` remains read-only.

## Next step

Phase 8.4 can clean up duplicated Vault loading logic or wait until the real auth/owner strategy is chosen. Phase 9 should not begin until Vault route behavior is visually verified.
