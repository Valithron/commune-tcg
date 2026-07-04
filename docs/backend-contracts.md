# Backend Contracts Draft

This document is a planning draft. Phase 9.1 defines the submission upload pipeline contract before upload, moderation, or database writes exist.

## Existing Cloudflare bindings

| Binding | Type | Resource |
|---|---|---|
| `env.DB` | D1 database | `com-tcg-db` |
| `env.CARD_IMAGES` | R2 bucket | `com-tcg-images` |

## Implemented read-only endpoints

These endpoints are implemented as Cloudflare Pages Functions and are intentionally read-only.

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

## Core tables to confirm before implementation

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

Canonical planned table for user-created card submissions before approval into Library/pull pool.

Planned fields:

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

Planned moderation statuses:

- `draft`
- `uploaded`
- `pending_review`
- `needs_changes`
- `approved`
- `rejected`
- `archived`

### card_templates

Earlier expected global approved Library cards table. The current live Gacha branch uses `cards` instead.

Expected fields if later introduced:

- `id`
- `name`
- `category`
- `rarity`
- `pow`
- `def`
- `spd`
- `flavor_text`
- `image_key`
- `status`
- `created_at`
- `updated_at`

### user_vault_cards

Earlier expected player-owned card instance table. The current live Gacha branch maps Vault from `cards.owner_user_id` instead.

Expected fields if later introduced:

- `id`
- `user_id`
- `card_template_id`
- `level`
- `xp`
- `copies`
- `equipped`
- `created_at`
- `updated_at`

### pull_history

Auditable record of pull outcomes.

Expected fields:

- `id`
- `user_id`
- `pull_count`
- `ticket_cost`
- `result_card_ids`
- `created_at`

### battle_history

Resolved battle outcomes.

Expected fields:

- `id`
- `user_id`
- `encounter_id`
- `squad_card_ids`
- `result`
- `reward_gold`
- `reward_xp`
- `created_at`

## R2 image key strategy

Submission uploads should go into `CARD_IMAGES` using stable, non-user-controlled keys.

Planned original upload key:

```text
submissions/SUBMISSION_ID/original.EXT
```

Planned derived/cropped keys:

```text
submissions/SUBMISSION_ID/derived/card-art.EXT
submissions/SUBMISSION_ID/derived/thumb.EXT
```

Planned post-approval Library key:

```text
cards/CARD_ID/art.EXT
```

Rules:

- Never trust the browser-provided filename as the object key.
- Store original filename only as metadata.
- Validate MIME type and extension server-side.
- Enforce max size before writing.
- Keep the D1 submission row as the source of truth for status and image key.
- Approval should create/update the canonical Library card row only after moderation passes.

## Safe upload flow sketch

Phase 9.2 should not jump straight to a broad write endpoint. Use a staged flow:

1. Validate submitter/auth boundary.
2. Create a D1 `card_submissions` row with `moderation_status = draft` or `pending_review`.
3. Generate a server-owned R2 key using the submission id.
4. Upload the original image to R2.
5. Store `image_key`, MIME type, size, and crop data in D1.
6. Keep the submission out of Library and Pull results until approved.
7. Admin approval creates or updates the canonical approved card data.

## Future endpoint sketch

These are route contracts to design before coding real writes.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/submissions` | Create a card submission and store validated metadata |
| `POST` | `/api/images/upload-url` | Prepare image upload flow for R2 if direct upload flow is chosen |
| `GET` | `/api/admin/submissions` | Read moderation queue |
| `POST` | `/api/admin/submissions/:id/approve` | Approve a submitted card into Library |
| `POST` | `/api/pulls` | Spend tickets and resolve pull results |
| `POST` | `/api/battles` | Resolve a battle and write rewards |

## Guardrails

- Server owns pull odds, ticket spending, and rewards.
- Server owns battle resolution and reward writes.
- Server owns submission validation, R2 key generation, and moderation status transitions.
- Client may preview forms and squads, but cannot be trusted to approve cards or grant currency.
- R2 image keys should be stored in D1, not raw public URLs.
- Admin routes need authentication and authorization before any real writes exist.
- Diagnostic, inventory, Library read, Vault inventory, Vault read, and submission inventory endpoints must stay read-only until schema and auth are explicit.
- The Vault route should not present `/api/vault` as a current-user endpoint until owner strategy and auth boundaries are explicit.
