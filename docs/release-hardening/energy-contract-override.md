# Energy Contract Override, 2026-07-11

Sterling explicitly set the current Imago Core Energy contract as follows:

- Maximum Energy: 10.
- Regeneration: 1 Energy per completed 7-minute interval.
- Empty-to-full time: 70 minutes.
- Authority: server-side elapsed-time reconciliation against the authenticated player's persisted `user_resources` row.
- Recharge begins immediately when Energy is spent from the cap.
- Spending while already below the cap preserves partial progress toward the next Energy point.
- Resource reads and battle creation reconcile elapsed Energy before returning or validating the battle cost.
- Regeneration stops at 10 and does not bank elapsed time above the cap.
- Missing, malformed, or future timestamps preserve the valid balance and are safely backfilled without granting Energy.
- Conditional row updates prevent repeated or concurrent requests from duplicating regenerated Energy.

This final same-day value supersedes the initial 30-minute Phase 1 value and the intermediate 15-minute hotfix value. The 7-minute implementation and focused regression tests are authoritative. The cap, ownership, timestamp, partial-interval, and no-modifier rules are unchanged.
