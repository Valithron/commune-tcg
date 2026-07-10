# Phase 9.2: Submission Upload and Write Pipeline

## Purpose

Phase 9.2 creates the first write-enabled submission flow.

A submitted card now creates:

```text
D1 row: card_submissions
R2 object: CARD_IMAGES/submissions/SUBMISSION_ID/original.EXT
```

The submitted card does not enter Library, Vault, pulls, battles, or rewards.

## Implemented endpoints

```text
GET /api/submissions
POST /api/submissions
GET /api/admin/submissions
```

### POST /api/submissions

Accepts multipart form data:

```text
card_name
character_id
card_type
rarity_suggestion
pow
def
spd
flavor_text
ability_text
crop_json
image
```

Writes:

```text
CARD_IMAGES: submissions/SUBMISSION_ID/original.EXT
D1: card_submissions row with moderation_status = pending_review
```

Temporary submitter identity:

```text
submitter_user_id: temporary-sterling
submitter_display_name: Sterling
```

This is not real authentication.

### GET /api/submissions

Reads submission rows from `card_submissions`.

Optional query params:

```text
status
limit
```

### GET /api/admin/submissions

Reads the moderation queue from `card_submissions`.

It is read-only in this phase.

## Schema behavior

The shared submission store helper creates the canonical table if missing:

```text
card_submissions
```

It also creates indexes for:

```text
moderation_status
created_at
```

## Validation rules

- Card name required, max 25 characters.
- Flavor text required, max 220 characters.
- Ability text optional, max 220 characters.
- ATK, DEF, and SPD are clamped from 1 to 10.
- Rarity must be one of common, uncommon, rare, legendary, mythic.
- Character must be one of the seven commune characters.
- Card type must be one of the allowed type list.
- Image is required.
- Image must be PNG, JPG, or WEBP.
- Image must be 8 MB or smaller.

## UI behavior

### Submit Card

```text
#/submit
```

Now submits to:

```text
POST /api/submissions
```

The form reports success or error in-place.

### Admin

```text
#/admin
```

Now reads from:

```text
GET /api/admin/submissions
```

If the endpoint fails, Admin falls back to mock rows.

## Guardrails

- No review action endpoint exists yet.
- No submitted card enters Library yet.
- No submitted card enters Pull results yet.
- No submitted card enters Vault yet.
- No Battle changes.
- No reward changes.
- No real auth claims.
- No real admin authorization yet.

## Verification checklist

After Cloudflare deploys:

1. Open `#/submit`.
2. Fill the form with a short card name.
3. Upload a small PNG, JPG, or WEBP image.
4. Submit.
5. Confirm the success message appears.
6. Open `#/admin`.
7. Confirm the new card appears in the moderation queue.
8. Open `/api/submissions`.
9. Confirm the new row has `moderationStatus: pending_review`.
10. Confirm `imageKey` begins with `submissions/`.
11. Confirm the card does not appear in Library or Pull results.

## Next phase

Phase 9.3 should add review-action planning or a read-only detail view for submissions before any Library insertion endpoint is built.
