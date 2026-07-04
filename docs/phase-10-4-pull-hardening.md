# Phase 10.4: Pull Hardening

## Purpose

Phase 10.4 hardens live pulls before moving toward Battle work.

It adds live ticket/resource reads, pull history reads, and clearer insufficient-ticket handling.

## New endpoints

```text
GET /api/pull-resources
GET /api/pull-history
```

Both endpoints are read-only.

## Pull resources

`/api/pull-resources` returns temporary Sterling resources.

If `user_resources` does not exist yet, it reports starter values without creating rows.

Expected fields:

```text
userId
pullTickets
gold
bootstrapped
tableExists
createdAt
updatedAt
note
```

## Pull history

`/api/pull-history` returns recent temporary Sterling pull history.

If `pull_history` does not exist yet, it returns an empty history without creating rows.

Expected fields:

```text
tableExists
totalReturned
pulls
```

Each pull includes:

```text
id
userId
pullCount
ticketCost
results
createdAt
```

## UI changes

Updated routes:

```text
#/pull
#/pull/confirm
#/pull/results
#/backend
#/inventory
```

Changes:

```text
Pull route shows live or starter ticket count.
Confirm route checks live tickets before showing Resolve Pull.
Confirm route blocks Resolve Pull when tickets are too low.
Results route shows a clear failed-pull state for failed live pulls.
Backend and Inventory link resource/history diagnostics.
```

## Guardrails

- No Battle changes.
- No reward changes.
- No auth changes.
- No card visual changes.
- Resource and history endpoints are read-only.
- Live pulls still use temporary Sterling owner.

## Verification checklist

After Cloudflare deploys:

1. Open `/api/pull-resources`.
2. Confirm `ok: true` and `readOnly: true`.
3. Open `/api/pull-history`.
4. Confirm `ok: true` and `readOnly: true`.
5. Open `#/pull` and confirm ticket count displays.
6. Open `#/pull/confirm?count=1` and confirm live ticket count displays.
7. Resolve a pull if tickets are available.
8. Confirm `/api/pull-resources` shows fewer tickets.
9. Confirm `/api/pull-history` includes the pull.
10. Spend down tickets only if intentionally testing insufficient-ticket state.
11. Confirm low tickets show Not Enough Tickets on Confirm.
12. Confirm Battle and rewards are unchanged.

## Next phase

Recommended next is a short Phase 10.5 or direct Phase 11 planning.

Phase 10.5 option:

```text
admin/debug ticket top-up endpoint or shop contract
pull-history display route
clean current-user/auth boundary docs
```

Phase 11 option:

```text
Battle engine inventory and read-only battle pool diagnostics
```
