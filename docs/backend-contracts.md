# Backend Contracts Draft

This document tracks the live Imago Core backend contracts, including the authoritative battle-attempt lifecycle.

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
| `GET` | `/api/pull-resources` | Read temporary Sterling tickets and gold |
| `GET` | `/api/pull-history` | Read temporary Sterling pull history |
| `POST` | `/api/pulls` | Live pull for temporary Sterling owner |
| `POST` | `/api/pull-top-up` | Temporary Sterling ticket top-up for testing |
| `GET` | `/api/battle-encounters` | Canonical versioned encounter registry |
| `GET` | `/api/battle-inventory` | Signed-in user's normalized eligible owned cards |
| `GET`/`POST` | `/api/battle-squad` | Read/save exactly three ordered lane IDs |
| `POST` | `/api/battle-forecast` | Isolated-lane forecast labels; no writes |
| `POST` | `/api/battles` | Create one seeded pending attempt and spend Energy |
| `GET` | `/api/battle-attempt` | Recover a pending or settled attempt |
| `POST` | `/api/battle-finalize` | Finalize stored result or surrender exactly once |
| `GET` | `/api/battle-history` | Read finalized and surrendered battle audit rows |
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

Created by live pull or temporary shop top-up.

Fields:

```text
user_id
pull_tickets
gold
created_at
updated_at
energy
energy_updated_at
```

Temporary user:

```text
sterling
```

Starting pull tickets:

```text
12
```

`GET /api/pull-resources` reads this table if it exists and otherwise reports starter values without creating rows.

`POST /api/pull-top-up` creates the row if missing, then adds an allowed amount of tickets.

Battle creation debits the canonical encounter Energy cost in the same D1 batch that creates the pending attempt. Current bootstrap Energy is 10. Failed validation or failed attempt creation spends no Energy.

### battle_attempts

Stores the server-selected seed and complete resolved battle before animation.

```text
attempt_id (primary key)
user_id
status: pending | settling | finalized | surrendered
encounter_id / encounter_version
rules_version / mvp_version
seed
ordered_card_ids
result_json
settlement_json
settlement_token
energy_spent
surrender
created_at / finalized_at
```

Creation is idempotent by `attempt_id`. Finalization uses a unique settlement token and status-guarded D1 batch so duplicate requests cannot duplicate Gold, XP, levels, or history.

### battle_daily_victories

Unique `(user_id, encounter_id, local_date)` records protect the first daily victory bonus using the encounter's `America/Denver` reset zone.

### battle_history

Finalized and surrendered attempts write one audit row keyed by a unique user/attempt index. `result_json` contains rules and encounter versions, snapshots, event log, outcome, MVP, applied reward, and XP applications.

Allowed test top-ups:

```text
1
5
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

Future `result_json` rows include semantic fields:

```text
ownerUserId
ownerDisplayName
cardTitle
actualRarity
selectedRarity
characterId
sourceCardId
sourceRowId
ownedCardId
```

Older rows are hydrated by `/api/pull-history` from `ownedCardId` when the owned card row is still present.

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

1. Pull and Confirm read `/api/pull-resources`.
2. Confirm blocks the live pull link if tickets are too low.
3. Ticket Shop can add temporary testing tickets through `/api/pull-top-up`.
4. Confirmation links to `#/pull/results?count=COUNT&real=1` when affordable.
5. Pull Results posts to `/api/pulls`.
6. Server checks Sterling tickets.
7. Server reads unowned Library cards.
8. Server rolls rarity.
9. Server inserts owned card rows into `cards`.
10. Server decrements tickets.
11. Server records semantic `pull_history` results.
12. Pull Results renders owned cards with Vault links.
13. Pull History displays owner, card title, and rarity from `/api/pull-history`.

## Guardrails

- Phase 10.6 uses temporary Sterling ownership.
- Ticket top-up is a testing tool, not a real purchase flow.
- Pull history semantics are text-only and do not add thumbnails or visual redesign.
- Battle results and rewards are server-authoritative and use signed-in ownership.
- Pull odds, tickets, Vault writes, and pull history are server-owned.
- R2 image keys remain stored in D1, not raw public URLs.
