# Phase 1 Economy and Transaction Audit

## Implemented transaction contracts

### Energy

- Maximum: 10.
- Regeneration: 1 per completed 15-minute interval.
- Empty to full: 2 hours 30 minutes.
- Authority: server-side persisted timestamp reconciliation.
- Applied by: resource GET and battle creation before cost validation/debit.
- Partial intervals: retained below cap by advancing only complete intervals.
- At cap: elapsed time does not accumulate; reaching cap records the current reconciliation time, and spending from full starts a fresh interval.
- Missing/malformed/future timestamp: preserve valid Energy, grant nothing, and backfill to current server time.
- Concurrency: compare-and-update plus reread prevents duplicate reconciliation.
- User isolation: reconciliation reads and writes only the authenticated player's `user_resources` row.
- Modifiers: no Gold, ticket, reward, purchase, mission, card, level, item, boost, passive system, or gameplay modifier shortens 15 minutes.

### Pulls

Each client confirmation stores a pending request ID in session storage. The server claims that ID once in `pull_requests`; ticket debit, owned-card inserts, and history insert are guarded by the claim token in one D1 batch. A repeated request ID returns the previously committed owned cards without another debit or grant. Competing request IDs cannot both commit when the balance funds only one.

### Ticket shop

The daily claim uses the America/Denver date and a guarded update. Gold exchanges update tickets and Gold on the authenticated row only and reject insufficient Gold without a state change.

### Battle settlement

Existing attempt and settlement tokens preserve exactly-once Energy debit, Gold, XP, level, daily-victory bonus, and history behavior. Energy is committed at attempt creation; playback does not settle rewards.

## Automated transaction ledger

| ID | Player | Starting state | Action | Expected delta | Actual delta | History rows | Owned-card rows | Ending state | Retry result | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TX-01 | Sterling fixture | Energy 2, timestamp +14:59 | Read/reconcile | 0 Energy | 0 | N/A | N/A | Energy 2, timestamp retained | Same | Energy test |
| TX-02 | Sterling fixture | Energy 2, timestamp +15:00 | Read/reconcile | +1 Energy | +1 | N/A | N/A | Energy 3 | No duplicate | Energy test |
| TX-03 | Sterling fixture | Energy 3, 50 minutes elapsed | Read/reconcile | +3, retain 5 minutes | +3 | N/A | N/A | Energy 6, timestamp +45 minutes | No duplicate | Energy test |
| TX-04 | Sterling fixture | Energy 9, 120 minutes elapsed | Read/reconcile | +1 to cap | +1 | N/A | N/A | Energy 10 | Later read +0 | Energy test |
| TX-05 | Sterling fixture | Energy 4, invalid timestamp | Reconcile | Timestamp only, +0 | +0 | N/A | N/A | Energy 4 | Stable repeat | Energy test |
| TX-06 | Sterling fixture | Energy 0, 20 minutes elapsed | Begin 1-Energy battle | +1 then -1 | 0 net | Pending attempt 1 | 0 | Energy 0; 5-minute partial retained | Attempt ID idempotent | Battle backend test |
| TX-07 | Sterling fixture | 10 tickets | Five-pull, repeat same ID | -5 tickets, +5 cards once | Matches | 1 | 5 | 5 tickets | Same result, no writes | Pull transaction test |
| TX-08 | Sterling fixture | 1 ticket | Two concurrent one-pulls | One commit only | Matches | 1 | 1 | 0 tickets | Other request 409 | Pull transaction test |
| TX-09 | Sterling fixture | Daily unclaimed | Two daily claims | +1 ticket once | Matches | N/A | N/A | 1 ticket | Other request 409 | Economy test |
| TX-10 | Sterling/Cydney fixtures | Each 1,000 Gold | Sterling buys 5 tickets | Sterling +5/-1000; Cydney unchanged | Matches | N/A | N/A | Sterling 5/0; Cydney 0/1000 | Insufficient retry unchanged | Economy test |
| TX-11 | Sterling fixture | Pending battle | Finalize twice | Reward/XP/history once | Matches baseline | 1 | 0 | Stored settlement | Second idempotent | Battle backend test |
| TX-12 | Sterling/Cydney fixtures | Both Energy 0 at same timestamp | Reconcile Sterling only | Sterling +1; Cydney unchanged | Matches | N/A | N/A | Independent balances and timestamps | Reconcile Cydney later remains independent | Energy isolation test |

## Schema change

`migrations/002_pull_requests.sql` adds an idempotency claim table and index. It is additive and contains no destructive statement. Runtime schema creation remains for backward compatibility. Rollback of application code may leave the unused table safely in place; dropping it is neither required nor authorized.

## Real-account ledger

No real-account resource adjustment or mutation test has been run. Preview binding behavior is still unknown, so all current evidence uses isolated in-memory SQLite fixtures.

## Remaining preview scenarios

- Real one- and five-pull with recorded before/after balances.
- Close/refresh during a committed pull, then retry with the stored request ID.
- Exact 15-minute Energy recharge boundary against D1.
- Refresh during battle and on results.
- Multi-tab Energy/resource reads.
- First daily victory and multi-level XP overflow on preview fixtures.
- Displayed balance comparison to D1-backed API responses.
