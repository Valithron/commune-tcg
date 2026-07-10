# Phase 9.1: Submission Upload Pipeline Inventory

## Purpose

Phase 9.1 defines the submission upload pipeline before any write-enabled upload, D1 insert, admin moderation, or approval logic exists.

This phase is inventory and contract only.

## Current route review

### Submit Card route

```text
src/routes/SubmitCard.js
```

Current state:

- static form shape
- read-only fields
- upload placeholder only
- no R2 writes
- no D1 writes
- no validation endpoint
- no draft saving

Current fields shown:

- Card Name
- Category
- Rarity Suggestion
- Flavor Text
- ATK
- DEF
- SPD
- Card Art Upload Placeholder

### Admin route

```text
src/routes/AdminDashboard.js
```

Current state:

- static admin overview
- mock moderation queue
- mock checklist
- no real permissions
- no real moderation queue reads
- no approve/reject writes
- no image moderation writes

## New read-only diagnostic endpoint

```text
/api/submission-inventory
```

This endpoint performs targeted read-only probes only.

It checks:

- candidate submission table names
- sample columns and row counts where accessible
- field categories for identity, submitter, card, image, moderation, and timestamps
- R2 key prefixes and extensions from CARD_IMAGES
- submission-like R2 keys
- proposed D1 submission record shape
- proposed moderation statuses
- proposed R2 key strategy
- readiness status for Phase 9.2

It performs no writes and does not upload files.

## Planned D1 table

Canonical table:

```text
card_submissions
```

Planned fields:

```text
id
submitter_user_id
submitter_display_name
card_name
character_id
card_type
rarity_suggestion
pow
def
spd
flavor_text
ability_text
image_key
image_original_name
image_mime_type
image_size_bytes
crop_json
moderation_status
review_notes
approved_card_id
created_at
updated_at
reviewed_at
reviewed_by
```

## Moderation statuses

```text
draft
uploaded
pending_review
needs_changes
approved
rejected
archived
```

## R2 key strategy

R2 binding:

```text
CARD_IMAGES
```

Original submission image:

```text
submissions/SUBMISSION_ID/original.EXT
```

Derived/cropped submission image:

```text
submissions/SUBMISSION_ID/derived/card-art.EXT
```

Thumbnail image:

```text
submissions/SUBMISSION_ID/derived/thumb.EXT
```

Approved Library art:

```text
cards/CARD_ID/art.EXT
```

## Upload safety rules

- Browser filenames are metadata only, never object keys.
- Server creates the final R2 key.
- MIME type and extension must be validated server-side.
- Image size must be capped before write.
- Crop data must be stored in D1 as structured JSON.
- Submission status controls whether the card can enter Library or pulls.
- Approval requires admin authorization.

## Safe future write flow

Phase 9.2 should use a staged process:

1. Validate submitter/auth boundary.
2. Validate text and stat fields.
3. Create a D1 submission row.
4. Generate server-owned R2 key from submission id.
5. Store image in R2.
6. Update submission row with image metadata and crop data.
7. Keep status at `pending_review` until admin moderation.
8. Admin approval creates or updates the approved card data.
9. Only approved cards enter Library and future pull pools.

## Verification checklist

After Cloudflare deploys:

1. Open `#/inventory`.
2. Open Submission Inventory.
3. Confirm `/api/submission-inventory` returns `ok: true`.
4. Record `readiness.status`.
5. Record candidate tables with `exists: true`.
6. Record whether CARD_IMAGES is available.
7. Record top R2 prefixes and allowed extensions.
8. Do not proceed to writes until auth and moderation decisions are explicit.

## Guardrails

- No writes.
- No uploads.
- No UI redesign.
- No Submit Card behavior changes.
- No Admin behavior changes.
- No CardFrame changes.
- No Library/Vault route changes.
- No pull, battle, reward, or approval changes.
