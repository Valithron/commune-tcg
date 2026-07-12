# Energy Contract Override — 2026-07-11

Sterling explicitly set the current Imago Core Energy contract as follows:

- Maximum Energy: 10.
- Regeneration: 1 Energy per completed 15-minute interval.
- Empty-to-full time: 2 hours 30 minutes.
- Authority: server-side elapsed-time reconciliation against the authenticated player's persisted `user_resources` row.
- Recharge begins immediately when Energy is spent from the cap.
- Spending while already below the cap preserves partial progress toward the next Energy point.
- Resource reads and battle creation reconcile elapsed Energy before returning or validating the battle cost.
- Regeneration stops at 10 and does not bank elapsed time above the cap.
- Missing, malformed, or future timestamps preserve the valid balance and are safely backfilled without granting Energy.
- Conditional row updates prevent repeated or concurrent requests from duplicating regenerated Energy.

This contract supersedes any remaining 30-minute or 5-hour Energy references elsewhere in the Phase 1 documentation. The implementation and focused regression tests are authoritative until those larger narrative documents are normalized in a later documentation pass.
