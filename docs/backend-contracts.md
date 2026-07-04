# Backend Contracts Draft

This document tracks the live backend contracts for the Gacha branch. Phase 10.3 adds the first live pull endpoint for the temporary Sterling owner.

## Existing Cloudflare bindings

| Binding | Type | Resource |
|---|---|---|
| `env.DB` | D1 database | `com-tcg-db` |
| `env.CARD_IMAGES` | R2 bucket | `com-tcg-images` |

## Implemented endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Runtime and binding check |
| `GET` | `/api/schema` | D1 table list |
| `GET` | `/api/schema-details` | D1 detail diagnostics |
| `GET` | `/api/images` | R2 object sample |
| `GET` | `/api/images-summary` | R2 prefix and extension summary |
| `GET` | `/api/cards` | Library card read model |
| `GET` | `/api/card-image?key=...` | R2 card image read |
| `GET` | `/api/vault-inventory` | Vault ownership inventory |
| `GET` | `/api/vault` | Owned card read model |
| `GET` | `/api/submission-inventory` | Submission inventory |
| `GET` | `/api/submission-review-audit` | Approved submission audit |
| `GET` | `/api/pull-pool` | Pull pool diagnostics |
| `GET` | `/api/pull-simulate?count=1` | No-write pull simulation |
| `POST` | `/api/pulls` | Live pull for temporary Sterling owner |
| `GET` | `/api/submissions` | Submitted card rows |
| `POST` | `/api/submissions` | Create pending-review submission |
| `GET` | `/api/admin/submissions` | Admin submission queue |
| `GET` | `/api/admin/submission?id=SUBMISSION_ID` | Admin submission detail |
| `POST` | `/api/admin/submission-action` | Admin review action |

## Core tables

### cards

Used by Library, Vault, pull pool, and pull results.

Unowned Library rows use:

```text
owner_user_id = empty string
```

Owned Vault rows use:

```text
owner_user_id = sterling
```

Pull eligibility:

```text
cards.owner_user_id is empty
cards.card_json parses cleanly
```

### user_resources

Created by Phase 10.3 on first live pull.

Fields:

```text
user_id
pull_tickets
gold
created_at
updated_at
```

Temporary user:

```text
sterling
```

Starting pull tickets:

```text
12
```

### pull_history

Created by Phase 10.3 on first live pull.

Fields:

```text
id
user_id
pull_count
ticket_cost
result_json
created_at
```

### card_submissions

Canonical table for submitted card review.

Statuses currently used:

```text
pending_review
needs_changes
approved
rejected
```

## Pull odds contract

| Rarity | Weight | Percent |
|---|---:|---:|
| Common | 55 | 55% |
| Uncommon | 25 | 25% |
| Rare | 14 | 14% |
| Legendary | 5 | 5% |
| Mythic | 1 | 1% |

Pull options:

| Pull | Ticket Cost |
|---|---:|
| 1-Pull | 1 |
| 5-Pull | 5 |

## Live pull flow

1. Confirmation links to `#/pull/results?count=COUNT&real=1`.
2. Pull Results posts to `/api/pulls`.
3. Server checks Sterling tickets.
4. Server reads unowned Library cards.
5. Server rolls rarity.
6. Server inserts owned card rows into `cards`.
7. Server decrements tickets.
8. Server records `pull_history`.
9. Pull Results renders owned cards with Vault links.

## Guardrails

- Phase 10.3 uses temporary Sterling ownership.
- Battle and rewards are unchanged.
- Auth is still deferred.
- Pull odds, tickets, Vault writes, and pull history are server-owned.
- R2 image keys remain stored in D1, not raw public URLs.
