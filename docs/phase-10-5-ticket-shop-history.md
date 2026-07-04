# Phase 10.5: Ticket Shop and Pull History

## Purpose

Phase 10.5 adds a temporary testing top-up flow and an in-app pull history page.

This keeps pull testing usable after live tickets run low.

## New endpoint

```text
POST /api/pull-top-up
```

Accepted body:

```text
amount: 1, 5, or 12
```

Response includes:

```text
amount
ticketsBefore
ticketsAfter
resources
```

This endpoint is temporary and uses the Sterling test owner.

It is not a real payment or purchase flow.

## Updated Ticket Shop

`#/shop` now:

```text
reads live or starter tickets
shows testing top-up offers
posts to /api/pull-top-up
refreshes after a successful top-up
```

## New Pull History route

```text
#/pull/history
```

It reads:

```text
/api/pull-history
```

And displays recent pull records inside the app.

## Updated Pull route

`#/pull` now links to:

```text
#/pull/history
```

rather than only exposing raw JSON.

## Guardrails

- No Battle changes.
- No reward changes.
- No auth changes.
- No card visual changes.
- Top-up is temporary testing support only.
- Pull resolution remains server-owned.

## Verification checklist

After Cloudflare deploys:

1. Open `#/shop`.
2. Confirm current live/starter tickets display.
3. Click Add Tickets on a testing offer.
4. Confirm the status shows tickets increasing.
5. Confirm the top bar ticket pill updates after refresh.
6. Open `#/pull`.
7. Open `#/pull/history`.
8. Confirm recent pulls display if any exist.
9. Confirm live pulls still spend tickets and add Vault cards.
10. Confirm Battle and rewards are unchanged.

## Next phase

Recommended next step is Phase 11.1:

```text
Battle engine inventory and read-only battle diagnostics
```

Do not write battle results until the battle pool, owned-card eligibility, and reward contract are mapped.
