# Phase 9.3: Submission Review Detail

## Purpose

Phase 9.3 adds a read-only detail page for submitted cards.

It does not move cards into Library, pulls, Vault, battles, or rewards.

## Backend endpoint

```text
GET /api/admin/submission?id=SUBMISSION_ID
```

This reads one row from:

```text
card_submissions
```

## App route

```text
#/admin/submission/:submissionId
```

The route shows:

- submitted card preview
- submitted image
- submitter name
- status
- character
- type
- rarity suggestion
- POW, DEF, SPD
- flavor text
- ability text
- image key
- original filename
- MIME type
- image size
- timestamps

## Admin queue change

Backend queue rows now link to the detail route.

Mock fallback rows remain static.

## Guardrails

- Read-only detail only.
- No Library insertion.
- No Pull changes.
- No Vault changes.
- No Battle changes.
- No reward changes.
- No CardFrame changes.
- Real admin authorization is still deferred.

## Verification checklist

After Cloudflare deploys:

1. Open `#/admin`.
2. Confirm backend submission rows still appear.
3. Tap a submitted card row.
4. Confirm the detail route opens.
5. Confirm the card preview displays the submitted image.
6. Confirm the detail list shows the submitted fields.
7. Confirm the submitted card still does not appear in Library or pulls.

## Next phase

Phase 9.4 should define the review-action workflow before any submitted card can become a Library card.
