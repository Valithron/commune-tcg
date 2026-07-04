# Phase 10.3: Live Pulls

## Purpose

Phase 10.3 adds the first live pull flow for the temporary Sterling owner.

It spends pull tickets, writes owned card rows, and records pull history.

## New backend helper

```text
functions/_shared/pull-engine.js
```

Responsibilities:

```text
ensure user_resources exists
ensure pull_history exists
read Sterling ticket balance
read pull pool
roll rarity
create owned card rows
write pull history
return owned results
```

## New endpoint

```text
POST /api/pulls
```

Accepted JSON body:

```text
count: 1 or 5
```

Response includes:

```text
writesPerformed: true
pullId
userId
count
ticketCost
ticketsBefore
ticketsAfter
results
poolSummary
```

## Temporary owner

```text
sterling
```

Starting tickets are bootstrapped to:

```text
12
```

This is still not real authentication.

## D1 tables created if missing

```text
user_resources
pull_history
```

## Owned card grants

Live pulls insert owned rows into:

```text
cards
```

Owned rows use:

```text
owner_user_id = sterling
```

That makes them visible in the existing Vault endpoint and Vault route.

## UI behavior

`#/pull/confirm?count=1` and `#/pull/confirm?count=5` now link to:

```text
#/pull/results?count=COUNT&real=1
```

The results route posts to `/api/pulls` only when `real=1` is present.

Manual result links without `real=1` still use simulation fallback.

## Guardrails

- Uses temporary Sterling owner only.
- Battle unchanged.
- Rewards unchanged.
- Auth unchanged.
- Card visuals unchanged.
- Pull odds remain server-owned.
- Pull grants are written server-side.

## Verification checklist

After Cloudflare deploys:

1. Open `#/pull/confirm?count=1`.
2. Click Resolve Pull.
3. Confirm result source says Real Pull.
4. Confirm tickets decrease by 1.
5. Confirm the result card links to Vault detail.
6. Open `#/vault`.
7. Confirm the pulled card appears in Sterling Vault.
8. Test `#/pull/confirm?count=5` if enough tickets remain.
9. Confirm no battle or reward behavior changed.

## Next phase

Phase 10.4 should harden live pulls before moving to Battle:

```text
resource read endpoint
pull history read endpoint
insufficient-ticket UX
optional shop/top-up contract
```
