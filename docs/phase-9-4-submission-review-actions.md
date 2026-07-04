# Phase 9.4: Submission Review Actions

## Purpose

Phase 9.4 adds server-owned review actions for submitted cards.

Implemented actions:

```text
approve
needs_changes
reject
```

Approval creates an unowned Library card row in `cards`. Pull eligibility is still deferred.

## Backend endpoint

```text
POST /api/admin/submission-action
```

Accepted JSON body:

```text
id
action
reviewNotes
```

Action results:

```text
approve -> moderation_status: approved, approved_card_id set, cards row inserted
needs_changes -> moderation_status: needs_changes
reject -> moderation_status: rejected
```

Temporary reviewer:

```text
temporary-admin-sterling
```

This is not real admin authorization.

## Library insertion

Approved submissions insert one row into:

```text
cards
```

Inserted fields:

```text
id: approved_SUBMISSION_ID
owner_user_id: null
character_id: submission character
card_json: normalized card payload
created_at
updated_at
```

The approved card can appear in Library because `/api/cards` reads the `cards` table.

The approved card does not enter Vault or pulls.

## UI behavior

The submission detail route now shows review controls when the submission is reviewable:

```text
#/admin/submission/:submissionId
```

Review controls:

```text
Approve to Library
Needs Changes
Reject
Review Notes
```

After an action completes, the route reloads and shows the updated status.

## Guardrails

- No pull engine changes.
- No Vault changes.
- No battle changes.
- No reward changes.
- No CardFrame changes.
- No real admin authorization yet.
- Approved cards enter Library only.

## Verification checklist

After Cloudflare deploys:

1. Open `#/admin`.
2. Open a pending submission detail page.
3. Use Needs Changes on one test submission and confirm status updates.
4. Use Reject on one test submission and confirm status updates to Rejected.
5. Use Approve to Library on one test submission.
6. Confirm the submission status becomes Approved.
7. Confirm `approvedCardId` is set.
8. Open `#/library` after refresh.
9. Confirm the approved card appears in Library.
10. Confirm it does not appear in Vault or Pull results.

## Next phase

Phase 9.5 may add small review hardening, or we can move to Phase 10 Pull engine planning if review actions verify cleanly.
