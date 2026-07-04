# Phase 9.5: Submission Review Hardening

## Purpose

Phase 9.5 hardens the submission review flow before Pull engine work begins.

This phase adds read-only audit checks and documentation updates only.

## New endpoint

```text
GET /api/submission-review-audit
```

The endpoint checks:

- total submission count
- submission status counts
- approved submission count
- whether approved submissions have approvedCardId
- whether approvedCardId exists in cards
- whether approved card_json parses cleanly
- whether approved cards have an empty owner value
- whether the approved card image key matches the submission image key

## Readiness statuses

```text
ready-for-pull-planning
review-output-needs-attention
no-approved-submissions-yet
```

## Expected approved card shape

Approved submissions create rows in:

```text
cards
```

Expected owner behavior:

```text
owner_user_id = empty string
```

This keeps approved cards visible to Library and excluded from Vault.

## UI and diagnostics updates

Updated:

```text
src/services/apiClient.js
src/routes/BackendStatus.js
src/routes/ResourceInventory.js
docs/backend-contracts.md
```

## Guardrails

- No Pull engine work.
- No Vault changes.
- No Battle changes.
- No reward changes.
- No CardFrame changes.
- No auth changes.
- No new review write behavior.

## Verification checklist

After Cloudflare deploys:

1. Open `/api/submission-review-audit`.
2. Confirm `ok: true`.
3. Confirm `readOnly: true`.
4. If at least one approved submission exists, confirm `readiness.status` is `ready-for-pull-planning`.
5. Confirm `findings.missingApprovedCards` is empty.
6. Confirm `findings.ownedApprovedCards` is empty.
7. Confirm `findings.invalidCardJson` is empty.
8. Open `#/library` and confirm approved cards are visible.
9. Open `#/vault` and confirm approved unowned cards are not visible.

## Next phase

Phase 10 should begin with Pull engine planning and a read-only pull-pool diagnostic before spending tickets or writing pull results.
