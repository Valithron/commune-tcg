# Phase 10.1: Pull Pool Diagnostics

## Purpose

Phase 10.1 starts the Pull engine safely with read-only pool diagnostics.

This phase does not spend tickets, grant cards, randomize pull results, or write pull history.

## New shared config

```text
functions/_shared/pull-config.js
```

Defines:

```text
pullOptions
rarityOdds
```

Pull options:

```text
1-Pull costs 1 ticket
5-Pull costs 5 tickets
```

Rarity odds:

```text
Common 55%
Uncommon 25%
Rare 14%
Legendary 5%
Mythic 1%
```

## New endpoint

```text
GET /api/pull-pool
```

The endpoint reads from:

```text
cards
```

A card is pull-eligible when:

```text
owner_user_id is empty
card_json parses cleanly
```

This includes approved submissions because approval creates an unowned Library card row in `cards`.

This excludes owned Vault cards because owned rows have `owner_user_id` set.

## Endpoint response includes

```text
pullOptions
rarityOdds
totalCardsScanned
eligibleCount
ownedRowsExcluded
invalidRowsExcluded
approvedSubmissionCount
byRarity
cards
sampleExcludedOwnedCards
readiness
pullResultContract
```

## Readiness statuses

```text
ready-for-pull-simulation
pool-ready-with-rarity-gaps
no-pull-pool-cards
```

## UI links

Updated:

```text
#/pull
#/backend
#/inventory
```

These pages now link to `/api/pull-pool`.

## Guardrails

- No ticket spend.
- No card grant.
- No pull history write.
- No Vault changes.
- No battle changes.
- No reward changes.
- No CardFrame changes.
- No auth changes.

## Verification checklist

After Cloudflare deploys:

1. Open `/api/pull-pool`.
2. Confirm `ok: true`.
3. Confirm `readOnly: true`.
4. Confirm `eligibleCount` is greater than zero if approved Library cards exist.
5. Confirm `approvedSubmissionCount` includes approved submissions.
6. Confirm `ownedRowsExcluded` is greater than zero if Vault cards exist.
7. Confirm `byRarity` counts the pool by rarity.
8. Confirm no tickets are spent and no Vault rows are created.

## Next phase

Phase 10.2 should add a no-write pull simulation endpoint. It can use the pull pool and rarity odds to generate sample pull results without spending tickets or granting cards.
