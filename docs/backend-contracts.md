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
| `GET` | `/api/vault-inventory` | Administrator-only Vault ownership inventory |
| `GET` | `/api/vault` | Owned card read model |
| `GET` | `/api/submission-inventory` | Submission inventory |
| `GET` | `/api/submission-review-audit` | Approved submission audit |
| `GET` | `/api/pull-pool` | Pull pool diagnostics |
| `GET` | `/api/pull-simulate?count=1` | No-write pull simulation |
| `GET` | `/api/pull-resources` | Read the signed-in player's tickets, Gold, daily state, and reconciled Energy |
| `GET` | `/api/pull-history` | Read the signed-in player's pull history |
| `POST` | `/api/pulls` | Resolve a live pull for the signed-in player |
| `POST` | `/api/pull-top-up` | Apply a daily ticket claim or configured Gold-to-ticket exchange to the signed-in player |
| `GET` | `/api/battle-encounters` | Canonical versioned encounter registry |
| `GET` | `/api/battle-inventory` | Signed-in user's normalized eligible owned cards |
| `GET`/`POST` | `/api/battle-squad` | Read/save exactly three ordered lane IDs |
| `POST` | `/api/battle-forecast` | Signed-in player's isolated-lane forecast labels; no writes |
| `POST` | `/api/battles` | Create one seeded pending attempt and spend Energy |
| `GET` | `/api/battle-attempt` | Recover a pending or settled attempt |
| `POST` | `/api/battle-finalize` | Finalize stored result or surrender exactly once |
| `GET` | `/api/battle-history` | Read finalized and surrendered battle audit rows |
| `GET` | `/api/submissions` | Submitted card rows |
| `POST` | `/api/submissions` | Create pending-review submission |
| `POST` | `/api/telemetry` | Record one validated event for the signed-in player |
| `GET` | `/api/admin/submissions` | Admin submission queue |
| `GET` | `/api/admin/submission?id=SUBMISSION_ID` | Admin submission detail |
| `POST` | `/api/admin/submission-action` | Admin review action |
| `GET`/`DELETE` | `/api/admin/telemetry` | Admin export or player/date-range deletion with access audit |

## Core tables

### cards

Used by Library, Vault, pull pool, and pull results.

Unowned Library rows use:

```text
owner_user_id = empty string
```

Owned Vault rows use the authenticated player slot ID:

```text
owner_user_id = signed-in user.id
```

Pull eligibility:

```text
cards.owner_user_id is empty
cards.card_json parses cleanly
```

### user_resources

Created for the signed-in player by resource reads, pulls, the ticket shop, or battle setup.

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

Starting pull tickets:

```text
12
```

`GET /api/pull-resources` ensures the signed-in player's row exists, reconciles elapsed Energy, and returns the persisted result with `cache-control: no-store`.

`POST /api/pull-top-up` creates the signed-in player's row if missing, then applies one named offer with guarded resource updates.

Battle creation reconciles Energy before validating the encounter cost, then debits that cost in the same D1 batch that creates the pending attempt. Current maximum and bootstrap Energy are 10. Failed validation or failed attempt creation spends no Energy.

Energy regeneration uses one shared server-side reconciler:

- 1 Energy per completed 30-minute interval
- maximum 10 Energy and 5 hours from empty to full
- the persisted `energy_updated_at` advances only by consumed complete intervals below the cap, preserving any partial interval
- reaching the cap resets the timestamp to the reconciliation time so elapsed time does not accumulate above the cap
- a debit from full Energy starts a fresh interval; a debit below the cap preserves existing partial progress
- missing, malformed, or future timestamps retain the valid Energy value and are backfilled to the current server time without granting Energy
- conditional updates and rereads prevent repeated or concurrent reconciliation from duplicating Energy
- no currency or gameplay modifier changes the 30-minute interval

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

Current server-configured ticket offers are the once-per-Mountain-Time-day free ticket, 5 tickets for 1,000 Gold, and the Founder Cache of 12 tickets for 2,000 Gold. Phase 1 audits these existing values but does not retune them without approval.

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

### telemetry_events

Stores a validated operational event envelope for the authenticated player. The server derives player ID, timestamp, release commit, and environment. Unknown event names and invalid identifiers are rejected. The endpoint does not accept arbitrary metadata, raw bodies, cookies, tokens, PINs, exact IP addresses, or unrestricted URLs.

Event IDs are unique and requests are bounded to 200 accepted events per analytics session and 1,000 per authenticated player per rolling hour. Telemetry failure is isolated from gameplay because browser calls are fire-and-forget and telemetry is never part of a gameplay transaction batch.

### telemetry_daily_aggregates

Stores anonymous daily counts and duration totals grouped by event, environment, route, and outcome. Player identity is not present. Raw events are retained for 30 days and anonymous aggregates for 180 days.

The Worker schedules retention once daily at 09:17 UTC. Administrator export also invokes the same idempotent retention routine defensively.

### telemetry_admin_audit

Records the authenticated administrator slot, action, safe filters, and timestamp for telemetry export and deletion operations.

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

1. Pull and Confirm read the signed-in player's state from `/api/pull-resources`.
2. Confirm blocks the live pull link if tickets are too low.
3. Ticket Shop applies the daily ticket or a configured Gold exchange through `/api/pull-top-up`.
4. Confirmation links to `#/pull/results?count=COUNT&real=1` when affordable.
5. Pull Results posts to `/api/pulls`.
6. Server checks the signed-in player's tickets.
7. Server reads unowned Library cards.
8. Server rolls rarity.
9. Server inserts owned card rows into `cards`.
10. Server decrements tickets.
11. Server records semantic `pull_history` results.
12. Pull Results renders owned cards with Vault links.
13. Pull History displays owner, card title, and rarity from `/api/pull-history`.

## Guardrails

- Pull, resource, Vault, pull-history, squad, battle, reward, and battle-history operations derive ownership from the authenticated session.
- Caller-supplied owner identifiers do not override Vault or battle-history ownership.
- The ticket shop offers are server-configured transactions; they are not a generic administrator top-up API.
- Pull history semantics are text-only and do not add thumbnails or visual redesign.
- Battle results and rewards are server-authoritative and use signed-in ownership.
- Pull odds, tickets, Vault writes, and pull history are server-owned.
- R2 image keys remain stored in D1, not raw public URLs.
