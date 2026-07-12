# Phase 1 Failure and Recovery Matrix

| ID | Scenario | Charged or rewarded? | Server commit | Client recovery | Retry contract | Current result |
| --- | --- | --- | --- | --- | --- | --- |
| FR-01 | Pull double-tap | Once at most | One `pull_requests` claim | Confirm button disables | Same stored request ID returns result | Automated pass |
| FR-02 | Network loss after pull commit | Once | Request row, cards, and history commit atomically | Pending request ID remains in session storage | Retry returns committed owned cards | Automated backend; browser preview pending |
| FR-03 | Refresh during reveal | Already committed; no new charge | Unchanged | Reveal payload is session-backed; Vault/history retain truth | New POST uses stored pending ID only until success | Source pass; preview pending |
| FR-04 | Competing pulls with one ticket | One succeeds | One claim only | Failed request receives 409 | Safe with a new request after resources change | Automated pass |
| FR-05 | Daily claim double request | One ticket once | Guarded date update | 409 explains already claimed | Safe next Mountain Time day | Automated pass |
| FR-06 | Insufficient Gold | No change | No update | Actionable 409 | Safe after balance increases | Automated pass |
| FR-07 | Energy read before interval | No grant | No write | Current balance returned | Repeat safe | Automated pass |
| FR-08 | Energy read after interval | Exact completed intervals | Conditional timestamp/energy update | Reconciled balance returned | Repeat safe | Automated pass |
| FR-09 | Missing/malformed/future Energy timestamp | No grant | Timestamp backfill only | Valid Energy preserved | Repeat stable | Automated pass |
| FR-10 | Battle at exact recharge boundary | One point reconciled then cost debited | Pending attempt and debit batch | Arena uses stored attempt | Attempt ID repeat safe | Automated at completed interval; live preview pending |
| FR-11 | Refresh/navigation during battle | Energy already committed; no reward yet | Pending event log remains | GET attempt/checkpoint can reconstruct | Finalize once or surrender once | Automated lifecycle; browser preview pending |
| FR-12 | Duplicate finalize/surrender | Reward once | Status/token guard | Stored settlement returned | Idempotent | Automated pass |
| FR-13 | Unauthorized/expired session during write | No intended write | Handler returns 401/403 before domain mutation | Sign-in required | Safe after reauthentication | Source pass; preview pending |
| FR-14 | Missing D1 binding | No write | Handler returns 503 | Route error state | Retry after service restoration | Source pass; preview pending |
| FR-15 | Missing R2 card image | No economy effect | 404 | Browser fallback quality | Safe repeat | Preview pending |
| FR-16 | Submission R2 succeeds, D1 fails | No Library grant | Best-effort R2 delete | Error returned | Retry creates new submission ID | Source pass; binding preview pending |
| FR-17 | Malformed reveal/session storage | No new charge | Existing server state retained | Store clears malformed payload; Vault/history recover truth | Safe | Source pass |
| FR-18 | Stale account cache after logout/switch | Must show no prior private state | Session is server authority | Auth/Vault caches require browser verification | Re-login | Preview pending |
| FR-19 | API 500/timeout/slow response | Depends on transaction ID | Server truth authoritative | Loading/error state must release controls | Pull and battle IDs make retry safe | Preview pending |
| FR-20 | Preview shares production D1/R2 | Potential real mutation | Unknown | Do not run destructive cases | Verify bindings first | Blocked pending dashboard fact |
| FR-21 | Telemetry request fails, times out, or is rate-limited | No economy effect | Gameplay transaction remains authoritative | Fire-and-forget client absorbs telemetry failure | Later gameplay actions proceed without telemetry retry blocking | Automated client contract pass; preview failure injection pending |

## Error categories

Active endpoints distinguish missing binding (503), unauthorized/expired (401), administrator denial (403), invalid input (400), missing content (404), insufficient/already-completed conflict (409), and server failure (500). Browser copy and permanent-loading-overlay behavior still require slow/offline preview testing.

No stack trace, secret, raw SQL, cookie, token, or PIN should be presented to players or stored in Phase 1 evidence.
