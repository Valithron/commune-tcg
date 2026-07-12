# Phase 1 Human Test Results

> **Status: Ready for human execution.** The isolated preview schema, fixtures, corrected authenticated harness, and public desktop login-state check pass. Sterling and Cydney human completion and a true mobile-browser pass are not yet claimed.

## Public browser preparation

On 2026-07-11, the public signed-out preview at commit `8ca094bbcb062e25bd606f37bba521c9fccac205` was inspected in Chrome on Linux at a 1363 by 936 viewport. The page rendered all seven canonical player slots, username input, PIN and PIN-confirmation inputs, and the Create Vault action without clipping or an application console error. One browser-extension metadata error was excluded as environment noise because its source URL was the browser extension rather than the application.

This evidence covers the desktop signed-out setup surface only. The available browser did not expose viewport resizing, so common iPhone widths remain pending a true mobile-browser session. No credentials were entered and no form was submitted.

On 2026-07-12, after the corrected authenticated harness completed, the public preview was inspected again in Chrome. `P1Sterling` and `P1Cydney` rendered as ready, Ryan, Gabi, Cooper, Kenly, and Ashley remained in setup state, and the PIN entry action rendered without an application console error. The only error-level log came from the browser extension URL and was classified as environment noise. No PIN was entered.

## Technical authenticated preparation

The corrected API harness completed its success-only cleanup path after `005_phase1_retry_reset.sql` restored the approved fixture baseline. It verified two-account login and isolation, a second Sterling session, the 420,000 ms Energy contract, pull retry idempotency, one-ticket debit and one-card grant, Vault and pull-history isolation, squad persistence, cross-owner squad rejection, battle create/recovery/finalize/surrender behavior, rewards and XP, telemetry authorization/deduplication/deletion/failure isolation, and logout invalidation.

The runner did not return the final redacted JSON even though the harness reached its success-only secret-deletion step. `006_phase1_post_validation_verify.sql` is the required read-only inventory for exact dynamic IDs and final D1 row states. Future runs also write the redacted harness report to `/tmp/commune-phase1-preview-validation-report.json` before deleting temporary secrets.

## Sterling

Ready for the human core-loop checklist at `https://phase-release-hardening.commune-tcg.pages.dev`. Technical validation is complete; do not use production domains or production resources.

## Cydney

Ready after Sterling completes the human technical-owner pass. Cydney should verify login clarity, pull/Vault/squad/battle/results comprehension, interruption recovery, and mobile presentation without being given Sterling's PIN.

## Ashley

Pending and non-blocking when unavailable.

## Telemetry

The Phase 1 design and minimal implementation were approved by Sterling on 2026-07-11. Deployed preview checks passed for event capture, deduplication, query stripping, non-admin denial, administrator export, player deletion, audit recording, and invalid-event isolation from gameplay. Exact remaining event and audit row IDs are pending the read-only post-validation inventory.
