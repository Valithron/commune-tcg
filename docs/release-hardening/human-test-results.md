# Phase 1 Human Test Results

> **Status: Ready for human execution.** The isolated preview schema, fixtures, corrected authenticated harness, and public desktop login-state check pass. Sterling and Cydney human completion and a true mobile-browser pass are not yet claimed.

## Public browser preparation

On 2026-07-11, the public signed-out preview at commit `8ca094bbcb062e25bd606f37bba521c9fccac205` was inspected in Chrome on Linux at a 1363 by 936 viewport. The page rendered all seven canonical player slots, username input, PIN and PIN-confirmation inputs, and the Create Vault action without clipping or an application console error. One browser-extension metadata error was excluded as environment noise because its source URL was the browser extension rather than the application.

This evidence covers the desktop signed-out setup surface only. The available browser did not expose viewport resizing, so common iPhone widths remain pending a true mobile-browser session. No credentials were entered and no form was submitted.

On 2026-07-12, after the corrected authenticated harness completed, the public preview was inspected again in Chrome. `P1Sterling` and `P1Cydney` rendered as ready, Ryan, Gabi, Cooper, Kenly, and Ashley remained in setup state, and the PIN entry action rendered without an application console error. The only error-level log came from the browser extension URL and was classified as environment noise. No PIN was entered.

## Technical authenticated preparation

The corrected API harness completed its success-only cleanup path after `005_phase1_retry_reset.sql` restored the approved fixture baseline. It verified two-account login and isolation, a second Sterling session, the 420,000 ms Energy contract, pull retry idempotency, one-ticket debit and one-card grant, Vault and pull-history isolation, squad persistence, cross-owner squad rejection, battle create/recovery/finalize/surrender behavior, rewards and XP, telemetry authorization/deduplication/deletion/failure isolation, and logout invalidation.

The runner did not return the final redacted JSON even though the harness reached its success-only secret-deletion step. Future runs write the redacted harness report to `/tmp/commune-phase1-preview-validation-report.json` before deleting temporary secrets.

Sterling executed `006_phase1_post_validation_verify.sql` through the Cloudflare D1 dashboard and confirmed the exact expected final totals: 2 claimed slots, 3 active sessions, 2 resource rows, 5 Library templates, 7 owned cards, 1 pull request, 1 pull-history row, 2 squads, 2 battle attempts, 2 battle-history rows, 1 remaining telemetry event, and 2 telemetry administrator-audit rows. The recorded dynamic pull card is `owned_1783870862375_0a727e9d`; its request and history ID is `pull_phase1_0c89811897c64dddbafa857d949f9db2`. No cleanup was executed.

## Sterling

Pending actual results. The human core-loop checklist is authorized at `https://phase-release-hardening.commune-tcg.pages.dev`. Technical validation and starting-state inventory are complete; do not use production domains or production resources.

Record: date/time, desktop browser, phone model/browser, portrait/landscape, account switching, multiple-tab behavior, rapid-action result, pull interruption/recovery, Vault isolation, squad persistence, battle interruption/recovery, Energy countdown/recharge, administrator surfaces, resource consistency, unusual navigation, new dynamic IDs, defects, and overall pass/block decision.

## Cydney

Pending actual results after Sterling's technical-owner pass. Cydney should verify login clarity, pull/Vault/squad/battle/results comprehension, interruption recovery, and mobile presentation without being given Sterling's PIN.

Record separately: date/time, phone model/browser, first click, spoken interpretation of each screen, hesitations, missed actions, resource understanding, pull completion, Vault follow-through, squad selection, battle completion, reward comprehension, error recovery, keyboard/overflow/navigation issues, help required, post-session answers, defects, and overall pass/block decision.

## Ashley

Pending and non-blocking when unavailable.

## Telemetry

The Phase 1 design and minimal implementation were approved by Sterling on 2026-07-11. Deployed preview checks passed for event capture, deduplication, query stripping, non-admin denial, administrator export, player deletion, audit recording, and invalid-event isolation from gameplay. The post-validation inventory confirmed one remaining Sterling `route.viewed` event for `/vault`, related to pulled card `owned_1783870862375_0a727e9d`, plus one Sterling export audit row and one Sterling delete audit row targeting Cydney telemetry.
