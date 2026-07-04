# Backend Contracts Draft

This document tracks the live backend contracts for the Gacha branch. Phase 9.3 adds read-only submission review detail while review actions and Library insertion remain deferred.

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
| `GET` | `/api/submissions` | Read submitted card rows from `card_submissions` |
| `POST` | `/api/submissions` | Create a pending-review card submission and upload original art to R2 |
| `GET` | `/api/admin/submissions` | Read the admin moderation queue from `card_submissions` |
| `GET` | `/api/admin/submission?id=SUBMISSION_ID` | Read one submitted card for review detail |

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

Phase 8.1 confirmed the Vault can likely be mapped from `owner_user_id` and `card_json` without a separate ownership table.

Phase 8.2 exposes `/api/vault` as a read-only normalized endpoint. Because authentication is not defined yet, `/api/vault` is a mapping endpoint, not a final current-user Vault contract.

Optional query:

```text
/api/vault?ownerUserId=OWNER_ID
```

### card_submissions

Canonical table for user-created card submissions before review into Library/pull pool.

Phase 9.2 bootstraps this table with `CREATE TABLE IF NOT EXISTS` when submission endpoints are used.

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

Implemented status:

- `pending_review`

Reserved statuses:

- `draft`
- `uploaded`
- `needs_changes`
- `approved`
- `rejected`
- `archived`

### card_templates

Earlier expected global approved Library cards table. The current live Gacha branch uses `cards` instead.

### user_vault_cards

Earlier expected player-owned card instance table. The current live Gacha branch maps Vault from `cards.owner_user_id` instead.

### pull_history

Future auditable record of pull outcomes.

### battle_history

Future resolved battle outcomes.

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
8. Submission detail reads `/api/admin/submission?id=SUBMISSION_ID` and renders a read-only card preview.

## Future endpoint sketch

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/admin/submissions/:id/approve` | Review a submitted card into Library |
| `POST` | `/api/admin/submissions/:id/needs-changes` | Mark a submission for edits |
| `POST` | `/api/admin/submissions/:id/reject` | Close a submission without Library insertion |
| `POST` | `/api/pulls` | Spend tickets and resolve pull results |
| `POST` | `/api/battles` | Resolve a battle and write rewards |

## Guardrails

- Server owns pull odds, ticket spending, and rewards.
- Server owns battle resolution and reward writes.
- Server owns submission validation, R2 key generation, and moderation status transitions.
- Client may preview forms and squads, but cannot be trusted to review cards or grant currency.
- R2 image keys are stored in D1, not raw public URLs.
- Admin review routes need authentication and authorization before any review action exists.
- A pending-review submission does not enter Library, Vault, pulls, battles, or rewards.
- The Vault route should not present `/api/vault` as a current-user endpoint until owner strategy and auth boundaries are explicit.
