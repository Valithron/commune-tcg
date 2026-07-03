# Backend Contracts Draft

This document is a planning draft. Phase 5 adds read-only diagnostic endpoints only.

## Existing Cloudflare bindings

| Binding | Type | Resource |
|---|---|---|
| `env.DB` | D1 database | `com-tcg-db` |
| `env.CARD_IMAGES` | R2 bucket | `com-tcg-images` |

## Phase 5 diagnostic endpoints

These endpoints are implemented as Cloudflare Pages Functions and are intentionally read-only.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Confirm Pages Function runtime and binding availability |
| `GET` | `/api/schema` | List D1 table names from `sqlite_master` |
| `GET` | `/api/images` | List a small sample of R2 object metadata |

## Core tables to confirm before implementation

### card_templates

Global approved Library cards.

Expected fields:

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

### card_submissions

Pending user-created card drafts before approval.

Expected fields:

- `id`
- `submitter_id`
- `name`
- `category`
- `rarity_suggestion`
- `pow`
- `def`
- `spd`
- `flavor_text`
- `image_key`
- `moderation_status`
- `review_notes`
- `created_at`
- `updated_at`

### user_vault_cards

Player-owned card instances or ownership records.

Expected fields:

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

## Future endpoint sketch

These are route contracts to design before coding real writes.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/cards` | Read approved Library cards |
| `GET` | `/api/vault` | Read current user's Vault |
| `POST` | `/api/pulls` | Spend tickets and resolve pull results |
| `POST` | `/api/submissions` | Create a card submission and store image metadata |
| `POST` | `/api/images/upload-url` | Prepare image upload flow for R2 |
| `GET` | `/api/admin/submissions` | Read moderation queue |
| `POST` | `/api/admin/submissions/:id/approve` | Approve a submitted card into Library |
| `POST` | `/api/battles` | Resolve a battle and write rewards |

## Guardrails

- Server owns pull odds, ticket spending, and rewards.
- Server owns battle resolution and reward writes.
- Client may preview forms and squads, but cannot be trusted to approve cards or grant currency.
- R2 image keys should be stored in D1, not raw public URLs.
- Admin routes need authentication and authorization before any real writes exist.
- Diagnostic endpoints must stay read-only until schema and auth are explicit.
