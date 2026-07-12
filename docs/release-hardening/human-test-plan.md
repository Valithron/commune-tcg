# Phase 1 Human Release-Confidence Test Plan

> The automated, isolation, schema, fixture, authenticated harness, and post-validation inventory gates pass. Human testing is authorized against the isolated preview only. Do not use production domains.

## Authorized target and starting state

| Item | Value |
| --- | --- |
| Preview | `https://phase-release-hardening.commune-tcg.pages.dev` |
| Branch | `phase/release-hardening` |
| D1 | `com-tcg-db-preview`, UUID `4fb86e2a-59f9-4f3c-aa34-af4b64973f38` |
| R2 | `com-tcg-images-preview` |
| Sterling account | `P1Sterling`, 12 tickets, 0 Gold, 9 Energy, 4 owned cards, 1 saved squad |
| Cydney account | `P1Cydney`, 12 tickets, 0 Gold, 9 Energy, 3 owned cards, 1 saved squad |
| Starting battles | Sterling finalized defeat; Cydney surrendered defeat; both against `crossroads-patrol` |
| R2 test objects | None |

Do not record or exchange either PIN in this document, screenshots, chat, or the pull request. Record any additional pull ID, owned-card ID, battle attempt ID, or R2 object key created during human testing so cleanup can be reconciled.

## Test record header

Record tester, date, browser, device, viewport, branch, commit, preview URL, account, starting tickets/Gold/Energy, starting Vault count, and whether screen recording is permitted.

## Sterling session

Run once on desktop and once on a real phone. The phone pass must record device, browser, orientation, and whether browser text scaling or display zoom is non-default.

1. Login as `P1Sterling`, refresh, open a second tab, close and reopen the site, then logout and log back in.
2. Confirm the top resources match the recorded starting state or explain every expected change.
3. Open the Energy modal, record whether the countdown updates live, spend 1 Energy in battle, and verify exactly 1 Energy returns after a completed 7-minute interval.
4. Perform a one-pull. Rapidly tap only after the first confirmation, interrupt navigation once, then verify one ticket debit, one new Vault card, and one matching history entry.
5. Confirm Cydney's fixture cards never appear in Sterling's Vault, squad picker, pull history, or battle history.
6. Reorder Sterling's squad, save it, refresh, open the second tab, and confirm the saved order persists.
7. Start a battle, interrupt playback with refresh or navigation, recover it, and verify settlement appears once with internally consistent Energy, reward, XP, and history values.
8. Exercise back/forward navigation, direct routes, missing fixture art, narrow portrait scrolling, landscape rotation, and the phone keyboard.
9. Inspect administrator surfaces without running destructive repair actions. Confirm a non-admin session cannot access the same diagnostics.
10. Record every hesitation, clipped control, unreadable label, stale balance, duplicate action, unexpected logout, or state mismatch.

## Cydney session

Instruction only:

> Open Imago Core and use it as you naturally would. Say what you think each screen is asking you to do. Do not ask Sterling for guidance unless you cannot continue.

Observe first click, hesitation, resource interpretation, pull completion, Vault follow-through, squad selection, battle completion, reward comprehension, error recovery, and whether any action feels untrustworthy. Do not coach unclear design.

Use a real phone for at least one Cydney session. Record device, browser, portrait and landscape behavior, keyboard obstruction, horizontal overflow, bottom-navigation reachability, card readability, modal dismissal, and whether any required action is hidden below or behind another control.

Do not give Cydney Sterling's PIN or explain the expected navigation. If she becomes blocked, record the screen, her words, what she expected, and the minimum help eventually required.

## Ashley session

When available, ask Ashley to return without a reminder of feature locations. Observe whether Home and navigation restore context. Ashley's absence does not block other Phase 1 work.

## Post-session questions

1. What did you think you were supposed to do first?
2. What was confusing?
3. What felt satisfying?
4. Did anything feel broken or untrustworthy?
5. What would you do next?
6. Would you reopen it tomorrow? Why or why not?

Record Sterling, Cydney, and Ashley separately from automated findings and telemetry.
