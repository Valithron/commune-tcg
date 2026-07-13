# Phase 1 Human Test Results

> **Status: Practical alpha human gate passed; final telemetry reconciliation pending.** Sterling completed an exploratory desktop and real-iPhone pass, and Cydney completed an uncoached exploratory attempt. The formal controlled-usability script was not completed and is not claimed.

## Public browser preparation

On 2026-07-11, the public signed-out preview at commit `8ca094bbcb062e25bd606f37bba521c9fccac205` was inspected in Chrome on Linux at a 1363 by 936 viewport. The page rendered all seven canonical player slots, username input, PIN and PIN-confirmation inputs, and the Create Vault action without clipping or an application console error. One browser-extension metadata error was excluded as environment noise because its source URL was the browser extension rather than the application.

This evidence covers the desktop signed-out setup surface only. No credentials were entered and no form was submitted during this preparation check. The later human report supplies the real-phone evidence.

On 2026-07-12, after the corrected authenticated harness completed, the public preview was inspected again in Chrome. `P1Sterling` and `P1Cydney` rendered as ready, Ryan, Gabi, Cooper, Kenly, and Ashley remained in setup state, and the PIN entry action rendered without an application console error. The only error-level log came from the browser extension URL and was classified as environment noise. No PIN was entered.

## Technical authenticated preparation

The corrected API harness completed its success-only cleanup path after `005_phase1_retry_reset.sql` restored the approved fixture baseline. It verified two-account login and isolation, a second Sterling session, the 420,000 ms Energy contract, pull retry idempotency, one-ticket debit and one-card grant, Vault and pull-history isolation, squad persistence, cross-owner squad rejection, battle create/recovery/finalize/surrender behavior, rewards and XP, telemetry authorization/deduplication/deletion/failure isolation, and logout invalidation.

The runner did not return the final redacted JSON even though the harness reached its success-only secret-deletion step. Future runs write the redacted harness report to `/tmp/commune-phase1-preview-validation-report.json` before deleting temporary secrets.

Sterling executed `006_phase1_post_validation_verify.sql` through the Cloudflare D1 dashboard and confirmed the exact expected final totals: 2 claimed slots, 3 active sessions, 2 resource rows, 5 Library templates, 7 owned cards, 1 pull request, 1 pull-history row, 2 squads, 2 battle attempts, 2 battle-history rows, 1 remaining telemetry event, and 2 telemetry administrator-audit rows. The recorded dynamic pull card is `owned_1783870862375_0a727e9d`; its request and history ID is `pull_phase1_0c89811897c64dddbafa857d949f9db2`. No cleanup was executed.

## Human execution format and limitation

Sterling reported a practical exploratory Phase 1 pass against `https://phase-release-hardening.commune-tcg.pages.dev` using desktop Chrome, iPhone Safari, and iPhone Chrome. Cydney attempted an uncoached exploratory session. The written test parameters confused her enough that the attempt did not produce clean controlled-usability-study data. Her reactions remain valid alpha feedback.

The device was identified as an iPhone, but the model, viewport, orientation coverage, display zoom, and text-scaling settings were not recorded. Multiple-tab, administrator-surface, and every scripted post-session prompt were not separately attested. This evidence therefore clears the practical alpha human gate but does not satisfy or replace a formal controlled usability study.

Sterling tested `P1Sterling`; Cydney tested `P1Cydney` and briefly used her main account for comparison or context. No PIN was included in the report. The report identifies the isolated preview URL as the test target; it does not provide enough detail to classify the brief main-account comparison further, so no broader environment claim is inferred from it.

## Verified human outcomes

The testers reported:

- login worked after the preview credential reset;
- real-phone testing completed in both Safari and Chrome on iPhone;
- exactly 1 Energy returned after the 7-minute interval;
- no duplicate ticket spend, pull, reward, or battle settlement was observed;
- no account-data mixing was observed between Sterling and Cydney;
- both testers completed a pull;
- Sterling interrupted a battle and resumed it correctly;
- Cydney completed or surrendered a battle; and
- battle behavior was technically sound from a functional and recovery perspective.

The preview credential reset was test-setup friction following the earlier harness attempt, not a reproduced authentication ownership defect. The report identifies no Phase 1 blocker in account isolation, login, Energy, pulls, Vault updates, battle recovery or settlement, rewards, XP, or data integrity.

## Alpha usability findings

Cydney was not naturally led through the app and did not clearly understand its purpose, although she completed a pull and completed or surrendered a battle. Visual distinction, particularly enemy portraits and combat-state readability, materially affected comprehension. Sterling also found navigation, action hierarchy, mobile vertical density, card inspection, squad editing, battle feedback, and terminology in need of refinement.

These observations are logged in the defect and friction ledger as non-blocking Phase 2 carry-forward candidates. No Phase 2 implementation or balance change has begun.

## Ashley

Pending and non-blocking when unavailable.

## Telemetry

The Phase 1 design and minimal implementation were approved by Sterling on 2026-07-11. Deployed preview checks passed for event capture, deduplication, query stripping, non-admin denial, administrator export, player deletion, audit recording, and invalid-event isolation from gameplay. The post-validation inventory confirmed one remaining Sterling `route.viewed` event for `/vault`, related to pulled card `owned_1783870862375_0a727e9d`, plus one Sterling export audit row and one Sterling delete audit row targeting Cydney telemetry.

`007_phase1_human_telemetry_verify.sql` is the final read-only reconciliation for events after the authenticated harness cutoff. It inventories routes, device/browser sessions, pull completion, Vault follow-through, battle creation/interruption/completion/surrender, reward finalization, errors, retries, duplicate completion signals, and matching D1 transaction rows. Human telemetry conclusions remain pending until Sterling returns its result sets.

## Human gate recommendation

Sterling's human judgment is **GO for Phase 1 release hardening, assuming the final telemetry reconciliation reveals no hidden technical defect**. The evidence record adopts a **conditional GO** until `007_phase1_human_telemetry_verify.sql` is reviewed. No merge is authorized by this result.
