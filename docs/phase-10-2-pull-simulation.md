# Phase 10.2: Pull Simulation

## Purpose

Phase 10.2 adds no-write pull simulation.

It uses the Phase 10.1 pull pool and rarity odds to generate simulated results without changing player state.

## New shared reader

```text
functions/_shared/pull-pool-store.js
```

Used by:

```text
/api/pull-pool
/api/pull-simulate
```

This keeps pull eligibility consistent.

## New endpoint

```text
GET /api/pull-simulate?count=1
GET /api/pull-simulate?count=5
```

Response includes:

```text
simulationOnly: true
writesPerformed: false
count
ticketCost
rarityOdds
poolSummary
fallbackCount
results
```

Each result includes:

```text
index
selectedRarity
actualRarity
fallbackUsed
card
```

## Selection behavior

1. Clamp count to 1 or 5.
2. Read the eligible pull pool from `cards`.
3. Roll rarity using configured weights.
4. Pick a random eligible card from that rarity bucket.
5. If the bucket is empty, pick from the full eligible pool and set `fallbackUsed: true`.

## UI behavior

`#/pull/results?count=1` and `#/pull/results?count=5` now call `/api/pull-simulate`.

If the backend call fails, the route falls back to deterministic mock results.

## Guardrails

- No ticket spend.
- No Vault grant.
- No pull history write.
- No Battle changes.
- No reward changes.
- No CardFrame changes.
- No auth changes.

## Verification checklist

After Cloudflare deploys:

1. Open `/api/pull-simulate?count=1`.
2. Confirm `ok: true`.
3. Confirm `simulationOnly: true`.
4. Confirm `writesPerformed: false`.
5. Open `/api/pull-simulate?count=5`.
6. Confirm 5 result objects return.
7. Open `#/pull/results?count=5`.
8. Confirm simulated cards render.
9. Confirm tickets are unchanged.
10. Confirm Vault is unchanged.

## Next phase

Phase 10.3 should implement the first write-enabled pull endpoint only after simulation verifies cleanly.

That endpoint must spend tickets, grant owned card rows, and write pull history server-side.
