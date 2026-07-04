# Backend Contracts Draft

This document tracks the live backend contracts for the Gacha branch. Phase 10.2 adds no-write pull simulation before ticket spend, card grants, or pull history writes exist.

## Existing Cloudflare bindings

| Binding | Type | Resource |
|---|---|---|
| `env.DB` | D1 database | `com-tcg-db` |
| `env.CARD_IMAGES` | R2 bucket | `com-tcg-images` |

## Implemented endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Confirm Pages Function runtime and binding availability |
| `GET` | `/api/schema` | List D1 table names from `sqlite_master` |
| `GET` | `/api/schema-details` | List D1 table columns and indexes using PRAGMA metadata |
| `GET` | `/api/images` | List a small sample of R2 object metadata |
| `GET` | `/api/images-summary` | Summarize sampled R2 key prefixes and file extensions |
| `GET` | `/api/cards` | Read and normalize Library card rows from D1 |
| `GET` | `/api/card-image?key=...` | Read one R2 card-art object by key |
| `GET` | `/api/vault-inventory` | Inspect owned-card data candidates for the future Vault read model |
| `GET` | `/api/vault` | Read and normalize owned card rows from `cards.owner_user_id` |
| `GET` | `/api/submission-inventory` | Inspect submission-table candidates and R2 image-key readiness |
| `GET` | `/api/submission-review-audit` | Audit approved submissions against unowned Library card rows |
| `GET` | `/api/pull-pool` | Read pull-eligible unowned Library cards and odds contract |
| `GET` | `/api/pull-simulate?count=1` | Resolve no-write simulated pull results from the pull pool |
| `GET` | `/api/submissions` | Read submitted card rows from `card_submissions` |
| `POST` | `/api/submissions` | Create a pending-review card submission and upload original art to R2 |
| `GET` | `/api/admin/submissions` | Read the admin moderation queue from `card_submissions` |
| `GET` | `/api/admin/submission?id=SUBMISSION_ID` | Read one submitted card for review detail |
| `POST` | `/api/admin/submission-action` | Apply approve, needs_changes, or reject review action |

## Core tables

### cards

Actual Phase 7 discovered D1 table used by the current Library read model and Phase 8 Vault endpoint.

Observed fields from targeted probing:

- `id`
- `owner_user_id`
- `character_id`
- `card_json`
- `created_at`
- `updated_at`

Approved submissions create an unowned `cards` row with:

```text
owner_user_id = empty string
character_id = submission.character_id
card_json = normalized approved card payload
```

The empty owner value keeps approved Library cards out of the current Vault read model.

Phase 10 pull eligibility:

```text
cards.owner_user_id is empty
cards.card_json parses cleanly
```

Optional Vault query:

```text
/api/vault?ownerUserId=OWNER_ID
```

### card_submissions

Canonical table for user-created card submissions before review into Library/pull pool.

Fields:

- `id`
- `submitter_user_id`
- `submitter_display_name`
- `card_name`
- `character_id`
- `card_type`
- `rarity_suggestion`
- `pow`
- `def`
- `spd`
- `flavor_text`
- `ability_text`
- `image_key`
- `image_original_name`
- `image_mime_type`
- `image_size_bytes`
- `crop_json`
- `moderation_status`
- `review_notes`
- `approved_card_id`
- `created_at`
- `updated_at`
- `reviewed_at`
- `reviewed_by`

Implemented statuses:

- `pending_review`
- `needs_changes`
- `approved`
- `rejected`

Reserved statuses:

- `draft`
- `uploaded`
- `archived`

### card_templates

Earlier expected global approved Library cards table. The current live Gacha branch uses `cards` instead.

### user_vault_cards

Earlier expected player-owned card instance table. The current live Gacha branch maps Vault from `cards.owner_user_id` instead.

### pull_history

Future auditable record of pull outcomes. No pull history writes exist in Phase 10.2.

### battle_history

Future resolved battle outcomes.

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

Phase 10.2 simulates results from this contract. It does not spend tickets, grant cards, or write history.

## Pull simulation flow

1. Client opens `#/pull/results?count=1` or `#/pull/results?count=5`.
2. Pull Results calls `/api/pull-simulate?count=COUNT`.
3. Server reads the pull pool from `cards`.
4. Server rolls rarity using the configured weights.
5. Server selects a matching card from the chosen rarity bucket.
6. If a rarity bucket is empty, server falls back to the wider eligible pool and marks `fallbackUsed`.
7. Server returns simulated results only.

## R2 image key strategy

Submission uploads go into `CARD_IMAGES` using stable, server-owned keys.

Implemented original upload key:

```text
submissions/SUBMISSION_ID/original.EXT
```

Reserved derived/cropped keys:

```text
submissions/SUBMISSION_ID/derived/card-art.EXT
submissions/SUBMISSION_ID/derived/thumb.EXT
```

Reserved post-review Library key:

```text
cards/CARD_ID/art.EXT
```

Rules:

- Browser filenames are metadata only, never object keys.
- Server creates the final R2 key.
- MIME type and extension are validated server-side.
- Image size is capped at 8 MB.
- D1 stores submission status and image key.
- Review must happen before a card enters Library or pull results.

## Implemented submission flow

1. Submit Card form posts multipart data to `/api/submissions`.
2. Server validates text fields, stats, rarity, character, type, and image.
3. Server generates a submission id.
4. Server writes original image to `CARD_IMAGES`.
5. Server inserts a `card_submissions` row with `moderation_status = pending_review`.
6. Admin dashboard reads `/api/admin/submissions`.
7. Admin queue rows link to `#/admin/submission/:submissionId`.
8. Submission detail reads `/api/admin/submission?id=SUBMISSION_ID` and renders a card preview.
9. Review actions post to `/api/admin/submission-action`.
10. Approve writes or updates an unowned Library card row into `cards` and marks the submission approved.
11. Submission review audit verifies approved submission output before Pull engine work.
12. Pull pool diagnostics read unowned Library cards from `cards`.
13. Pull simulation reads that pool and returns no-write results.

## Future endpoint sketch

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/pulls` | Spend tickets and resolve pull results |
| `POST` | `/api/battles` | Resolve a battle and write rewards |

## Guardrails

- Server owns pull odds, ticket spending, and rewards.
- Server owns battle resolution and reward writes.
- Server owns submission validation, R2 key generation, and moderation status transitions.
- Client may preview forms and squads, but cannot be trusted to grant currency.
- R2 image keys are stored in D1, not raw public URLs.
- Admin authorization is still a temporary placeholder.
- Phase 10.2 does not spend tickets, grant cards, or write pull history.
- A submitted card does not enter Vault, battles, or rewards through Phase 10.2.
- The Vault route should not present `/api/vault` as a current-user endpoint until owner strategy and auth boundaries are explicit.
