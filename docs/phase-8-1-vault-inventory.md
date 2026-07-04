# Phase 8.1: Vault Ownership Inventory

## Purpose

Phase 8.1 is a read-only mapping pass before the real Vault read model. It does not create, edit, delete, approve, pull, reward, equip, or mutate anything.

The goal is to answer one narrow question:

Can the current database already tell us which cards belong in a player's Vault?

## New endpoint

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/vault-inventory` | Inspect owned-card data candidates for the future Vault read model |

## What it checks

The endpoint uses targeted SELECT queries only. It intentionally avoids `sqlite_master` and PRAGMA introspection because D1 rejected those during the earlier resource inventory work.

It checks the known `cards` table for:

- visible sampled columns
- total row count
- `owner_user_id` presence
- owned row count where `owner_user_id` is non-empty
- unowned row count
- unique owner count
- owner count distribution
- owned sample rows with parsed `card_json` summaries
- whether owned samples appear usable for the future Vault read model

It also probes likely ownership table names:

- `user_vault_cards`
- `vault_cards`
- `user_cards`
- `player_cards`
- `owned_cards`
- `card_ownership`
- `inventory_cards`
- `user_inventory`
- `collections`

For each candidate table it reports whether a targeted SELECT succeeded, the row count, sample columns, ownership-like columns, and a small sample row set.

## Readiness statuses

The endpoint returns a `readiness` object with one of these statuses:

- `likely-ready-from-cards-owner-user-id`
- `needs-ownership-table-mapping`
- `not-ready`

## How to verify

After Cloudflare deploys, open:

```text
/api/vault-inventory
```

Or use the Resource Inventory route:

```text
#/inventory
```

Capture these findings before Phase 8.2:

- whether `cards.owner_user_id` has owned rows
- how many unique owners exist
- whether owned samples have valid names, rarity, image keys, and stats
- whether any separate ownership table exists and has rows
- what the endpoint recommends as the next step

## Guardrails

- Read-only only.
- No authentication assumptions yet.
- No Vault route wiring yet.
- No UI redesign.
- No CardFrame, Card Lab, title fitting, or tuner changes.
- No production game writes.
