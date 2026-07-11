# Imago Core Phase 1 Release Hardening Work Order

## Canonical Work-mode execution contract

### Repository

`Valithron/commune-tcg`

### Production branch

`main`

### Canonical roadmap

`docs/quality-playability-roadmap.md`

### Work-order path

`docs/phase-1-release-hardening-work-order.md`

### Intended execution branch

`phase/release-hardening`

### Product owner

Sterling Knight-Pinneo

---

# 1. Purpose and authority

This document is the direct execution order for Phase 1 of the Imago Core Quality, Playability, and Interest Roadmap.

The receiving Work-mode thread must execute **Phase 1: Release Hardening only**. It must not begin Phase 2, redesign the daily loop, add onboarding, introduce progression systems, or expand the product merely because related opportunities are discovered.

The governing source remains:

`docs/quality-playability-roadmap.md`

This work order narrows that roadmap into an operational contract. It does not replace the roadmap's principles, severity definitions, testing standards, human-testing rules, or approval gates.

The mission is:

> Establish that the current `main` baseline is operationally trustworthy, that player and economy state are attributed correctly, that core transactions are safe under ordinary failure and repetition, and that future product work can proceed on a verified foundation.

Phase 1 is not a general refactor. It is not a feature sprint. It is not permission to clean up every historical patch. It is a disciplined audit, test, evidence, controlled-fix, and release-confidence program.

---

# 2. Required starting behavior

The receiving thread must begin work immediately after reading this document and the required references.

Do not ask Sterling to restate repository context already present in the documentation.

Do not pause for approval before:

* Reading the repository
* Recording the current baseline
* Creating the phase branch
* Opening an initial draft pull request
* Building inventories and test matrices
* Running non-destructive automated checks
* Auditing code and documentation
* Creating evidence documents
* Reproducing defects safely
* Adding narrowly scoped regression tests
* Correcting verified documentation errors
* Implementing clearly low-risk fixes on the phase branch

Pause only when an approval-gated decision is actually required.

When a decision is required, provide Sterling with:

* Current branch
* Current commit
* Approximate Phase 1 completion percentage
* What has been verified
* The exact decision required
* Options with consequences
* A recommended choice
* Whether safe work can continue elsewhere while waiting

Do not ask broad questions such as “How would you like me to proceed?” when the roadmap already answers the question.

---

# 3. Required reading before changes

Read these files from the latest `main`:

1. `docs/quality-playability-roadmap.md`
2. `docs/developer-guide.md`
3. `docs/architecture.md`
4. `docs/route-map.md`
5. `docs/technical-debt.md`
6. `docs/game-design.md`
7. `docs/battle-design.md`
8. `docs/backend-contracts.md`
9. `docs/card-mechanics-contract.md`
10. `docs/card-frame-design.md`
11. `docs/brand.md`
12. `package.json`
13. `src/main.js`
14. `worker.js`
15. `functions/_shared/auth.js`
16. Pull, resource, shop, Vault, squad, battle, reward, and admin handlers under `functions/`
17. Shared battle configuration and simulation code
18. Existing automated tests
19. Cloudflare, Wrangler, D1, R2, deployment, and environment configuration present in the repository

Also inspect commit history and recent merged pull requests when needed to distinguish current architecture from historical leftovers.

## 3.1 Source interpretation rule

Do not silently resolve contradictions.

Use this distinction:

* Current source code is evidence of what the application does now.
* Current canonical design documents are evidence of intended behavior.
* The roadmap and this work order govern Phase 1 process and scope.
* Explicit Sterling approvals govern unresolved product decisions.
* Historical or contradictory documents are evidence of technical debt, not automatic authority.

When code and intended design disagree, record the conflict and determine whether it is:

* A defect
* An outdated document
* A deliberate compatibility behavior
* An unapproved design change
* An unresolved product decision

---

# 4. Baseline and branch rules

## 4.1 Establish the exact starting point

Before editing application code:

1. Fetch the latest `main`.
2. Record its full commit SHA.
3. Confirm the commit containing this work order is present.
4. Determine which commit is currently deployed to production.
5. Record whether production and `main` match.
6. Record any deployment lag or uncertainty.
7. Create `phase/release-hardening` from the exact latest `main` commit.
8. Open a draft pull request to `main` early in the phase.

Do not create the phase branch from `Gacha`, a historical branch, a local stale checkout, or a remembered commit.

## 4.2 No direct production-branch work

Do not commit directly to `main`.

Do not merge the phase pull request without Sterling's explicit approval.

Do not force-push shared history unless recovery from a verified mistake requires it and Sterling approves.

## 4.3 Commit discipline

Use coherent commits such as:

* Baseline and audit documentation
* Route and API inventory
* Authentication regression tests
* Economy transaction tests
* Recovery fixes
* Telemetry schema documentation
* Low-risk defect fixes
* Final release-hardening report

Avoid one giant commit that combines audit artifacts, tests, behavior changes, and unrelated cleanup.

## 4.4 Scope splitting

If the phase becomes too large for safe review, use narrower implementation branches or pull requests, but preserve one canonical Phase 1 report and one final approval package.

Do not split work merely to avoid documenting cross-cutting effects.

---

# 5. Hard scope boundary

## 5.1 In scope

Phase 1 includes:

* Baseline and deployment verification
* Route and API inventory
* Automated validation
* Coverage-gap analysis
* Authentication and session audit
* Player ownership audit
* Administrator authorization audit
* Economy and transaction integrity audit
* Pull and reward idempotency
* Interruption and recovery testing
* Error-state quality
* Telemetry foundation design
* Approved telemetry implementation
* Controlled low-risk fixes
* Documentation reconciliation
* Preview deployment verification
* Human release-confidence testing
* Final go or no-go recommendation

## 5.2 Explicitly out of scope

Do not use this phase to perform:

* Framework migration
* Full application rewrite
* Broad `app.js` decomposition
* Large database redesign
* Destructive `pow` to `atk` migration
* New PvP mode
* Major battle ability system
* Large content expansion
* New daily-loop feature set
* Onboarding implementation
* Mission or quest systems
* New currencies
* Streak systems
* Duplicate conversion economy
* Evolution systems
* Final progression curves
* Major Home redesign
* Major navigation redesign
* Major brand campaign
* Total visual reskin
* Broad linting cleanup
* Repository-wide formatting churn
* Premature Android optimization
* Phase 2 or Phase 3 work

Findings related to those areas may be recorded as deferred work. They may not be implemented under this order.

---

# 6. Permissions and approval gates

## 6.1 Work that may proceed without per-item approval

The receiving thread may perform the following on the phase branch when supported by evidence:

* Create audit and test documentation
* Add missing regression tests
* Fix broken links
* Fix incorrect labels
* Correct verified documentation errors
* Add missing loading indicators
* Add safe disabled states during pending writes
* Fix obvious button-state defects
* Fix small responsive overflow defects
* Fix clear accessibility defects
* Add missing null guards
* Remove duplicate event listeners
* Correct inaccurate empty-state or error copy when intended behavior is clear
* Fix visual collisions
* Add harmless telemetry plumbing after the telemetry model is approved
* Replace unsafe wrong-user compatibility fallback behavior with authenticated ownership when intended behavior is already unambiguous
* Fix isolated idempotency defects without changing costs, rewards, odds, or progression values
* Add logging needed to reproduce defects, provided private data is excluded

Every implementation must still be recorded, tested, previewed, and presented for final merge approval.

## 6.2 Sterling approval is required before implementing

Pause before implementing any change to:

* Pull odds
* Currency costs
* Gold rewards
* Ticket rewards
* Energy costs
* Energy regeneration
* XP rates
* Level curves
* Battle difficulty
* Battle pacing when it materially changes play
* Reward settlement rules
* Surrender rewards
* First-win rewards
* New missions
* Streak systems
* Unlock requirements
* New currencies
* Duplicate conversion rates
* Evolution requirements
* Destructive migrations
* Production data wipes
* Broad data corrections
* Major navigation
* Major visual hierarchy
* Major error-language strategy
* Features that alter the daily loop
* Telemetry data model
* Telemetry privacy exclusions
* Telemetry retention
* Telemetry administrator presentation

Telemetry is approved in principle, but design approval is required before implementation.

## 6.3 Immediate stop and notification conditions

Notify Sterling promptly when any of these are verified:

* Wrong-user resource mutation
* Authentication bypass
* Ordinary player access to an administrator mutation
* Duplicate charging
* Duplicate reward settlement
* Destructive data loss
* Production outage caused by the phase branch or deployment
* Preview environment writing unexpectedly to production data
* A migration that cannot be safely reversed
* Evidence that current production is not running the expected `main` commit

Stop the dangerous test or mutation path. Preserve evidence. Continue unrelated safe audit work when practical.

---

# 7. Known conflicts to verify during Phase 1

The roadmap review identified the following likely documentation conflicts. Verify each against the latest code before correcting it.

## 7.1 Pull and resource ownership documentation

`docs/backend-contracts.md` has described pull and resource flows as temporary Sterling-owned operations.

Current handlers previously appeared to require authenticated session ownership.

Required result:

* Determine current behavior for every pull, resource, ticket, and reward mutation.
* Prove which player identity is used.
* Correct the document if the old Sterling-owned description is no longer true.
* Record any fallback that can still write as Sterling.

## 7.2 Type matchup values

`docs/card-mechanics-contract.md` has contained an older +15% and -5% Effective Power model.

The current versioned battle configuration previously used +8% and -3% damage modifiers, represented as `1.08` and `0.97`.

Required result:

* Verify the live battle rules and source of truth.
* Correct or classify the old contract.
* Do not change battle values under this phase without approval.

## 7.3 Card-frame and brand history

`docs/card-frame-design.md` has retained historical details including:

* `#/card-lab`
* Cydney color `#f3c93f`
* Type styling derived from rarity color

Current routing and branding previously indicated:

* `#/admin/card-lab`
* Cydney color `#789461`
* Dedicated type colors

Required result:

* Verify current routing and renderer behavior.
* Correct historical guidance or label it clearly as superseded.
* Do not perform a broad visual redesign.

## 7.4 Battle forecast method

`docs/route-map.md` has listed `GET /api/battle-forecast` while the implemented handler previously accepted `POST`.

Required result:

* Verify the actual route contract.
* Correct the route map and any affected tests or callers.

## 7.5 Additional contradictions

Do not limit the audit to these four items. Add every verified contradiction to the documentation ledger.

---

# 8. Required repository artifacts

Create and maintain these Phase 1 artifacts. Equivalent filenames are acceptable only when the structure remains obvious and linked from the final report.

Recommended directory:

`docs/release-hardening/`

Required files:

1. `baseline-and-deployment.md`
2. `route-api-matrix.md`
3. `automated-validation.md`
4. `auth-ownership-audit.md`
5. `economy-transaction-audit.md`
6. `failure-recovery-matrix.md`
7. `telemetry-event-dictionary.md`
8. `telemetry-privacy-retention.md`
9. `defect-friction-ledger.md`
10. `human-test-plan.md`
11. `human-test-results.md`
12. `phase-1-final-report.md`

Also update:

* `docs/quality-playability-roadmap.md` with Phase 1 status and links
* Canonical documents whose verified inaccuracies are corrected
* Existing technical-debt records when a debt is closed, reclassified, or newly proven

Do not claim human testing is complete until actual human results are recorded.

---

# 9. Required automated gate

At minimum, run from a clean install state:

```bash
npm ci
npm test
npm run build
npm run battle:simulate -- --iterations=1000
git diff --check
```

The repository does not currently define a dedicated lint gate. Do not invent a broad linting project inside Phase 1.

For every command, record:

* Command
* Commit SHA
* Environment
* Start and finish time
* Result
* Relevant output
* Failure classification
* Follow-up action

Run the complete gate:

1. At baseline
2. After meaningful test additions
3. After meaningful implementation changes
4. Before preview sign-off
5. Before final merge recommendation

Do not conceal pre-existing failures. Separate:

* Baseline failure
* Newly introduced failure
* Flaky result
* Environment failure
* Confirmed product defect

---

# 10. Execution plan

## Work Package 0: Initialize and report the baseline

### Objective

Create an exact, reproducible starting record.

### Actions

1. Confirm latest `main` SHA.
2. Confirm this work order exists on `main`.
3. Record production deployment SHA if discoverable.
4. Create `phase/release-hardening` from latest `main`.
5. Open a draft pull request.
6. Record repository status and untracked files.
7. Inventory deployment configuration present in source.
8. Identify Cloudflare dashboard facts unavailable from the repository.
9. Document rollback options.
10. Run the baseline automated gate.

### Required evidence

* Starting `main` SHA
* Phase branch SHA
* Production deployment SHA or explicit unknown status
* Cloudflare project identity or explicit unknown status
* D1 binding names
* R2 binding names
* Environment-variable names without secret values
* Domain inventory
* Preview-binding behavior
* Rollback method
* Baseline command log

### Exit condition

The branch and deployment baseline are documented well enough that another developer could identify what was tested and how to return to the prior production state.

---

## Work Package 1: Build the route and API regression inventory

### Objective

Turn every reachable surface into a repeatable test checklist.

### Actions

Enumerate from both documentation and source:

* Signed-out routes
* Signed-in player routes
* Administrator routes
* Diagnostic routes
* Public assets and image paths
* Worker routes
* API endpoints
* Methods
* Authentication requirements
* Administrator requirements
* Request parameters
* Response shapes
* Database bindings
* R2 dependencies
* Client callers

For every player-facing route, test or specify:

* Normal populated state
* Empty state
* Loading state
* Error state
* Direct link
* Refresh
* Browser back and forward
* Unauthorized state
* Missing resource
* Slow response
* Small mobile viewport

### Matrix fields

Use at least:

| ID | Surface | Method | Account | Device | Expected state | Actual state | Result | Evidence | Defect link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

### Device priority

1. Desktop Brave or current Chromium
2. iPhone Safari
3. iPhone Brave
4. Common iPhone responsive widths
5. Older Galaxy Tab A as secondary spot testing when available

Record browser, viewport, account, branch, and commit for every meaningful visual or interaction defect.

### Exit condition

Every route and endpoint is classified as working, defective, undocumented, dead, inaccessible, or unverified with a stated reason.

---

## Work Package 2: Map automated coverage to critical behavior

### Objective

Determine what the existing green test suite actually proves.

### Actions

Map tests to:

* Authentication
* Session persistence
* Logout invalidation
* Player ownership
* Administrator authorization
* Pull resources
* Daily ticket claim
* Mountain Time boundary
* Gold-to-ticket exchange
* Single pull
* Five pull
* Pull history
* Owned-card creation
* Duplicate grouping
* Vault display
* Squad saving and ordering
* Battle creation
* Battle forecast
* Battle playback
* Battle interruption
* Battle finalization
* Victory and defeat rewards
* Surrender
* First daily victory
* Energy debit
* Gold reward
* Card XP
* Card level-up
* Retry and idempotency

Identify:

* Untested critical paths
* Tests using mocks only
* Tests that cannot detect wrong-user writes
* Tests that cannot detect duplicate writes
* Tests with incorrect timezone assumptions
* Browser behavior not represented by unit tests

Add narrow, high-value tests first.

Do not refactor whole modules merely to improve testability unless separately approved.

### Exit condition

The repository contains a coverage-by-domain summary and new regression coverage for the highest-confidence risks that can be tested without broad redesign.

---

## Work Package 3: Audit authentication, ownership, and administrator boundaries

### Objective

Prove that reads and writes are attributed to the correct player and that privileged actions remain privileged.

### Code audit

Trace all identity resolution paths including:

* Login
* Session creation
* Cookie handling
* `getSessionUser`
* Logout
* Session invalidation
* Client-side cached identity
* Local storage
* Session storage
* Default-user constants
* Sterling compatibility fallbacks
* Admin allowlists
* Admin route gates
* Admin API gates
* D1 queries using player identifiers
* R2 paths containing player-specific data

### Behavioral tests

Test with Sterling and Cydney accounts when access is available:

* Login and logout
* Refresh after login
* Refresh after logout
* Account switching
* Multiple browsers
* Multiple tabs
* Stale local state
* Failed authentication
* Expired or invalid session
* Direct admin URL entry
* Direct admin endpoint calls
* Vault isolation
* Resource isolation
* Pull-history isolation
* Battle-history isolation
* Squad isolation
* Reward isolation

### Database evidence

For every ownership-sensitive mutation, identify:

* Source of authenticated user ID
* Tables written
* Rows created or changed
* Whether caller-supplied identity can override session identity
* Whether a missing session triggers a fallback
* Whether the write can occur before authentication resolves

### Required exit gate

Before Phase 1 may close:

* Ownership-sensitive mutations use authenticated identity, or
* Any remaining fallback is proven unreachable in normal production use and explicitly accepted by Sterling as debt.

No wrong-user mutation may remain unexplained.

---

## Work Package 4: Audit economy and transaction integrity

### Objective

Prove that resources, cards, history, and rewards remain internally consistent.

### Transaction scenarios

Create before-and-after evidence for:

* Daily ticket claim
* Claim near the Mountain Time day boundary
* Gold-to-ticket exchange
* Insufficient Gold exchange
* Single pull
* Five pull
* Insufficient tickets
* Repeated pull click
* Double click
* Refresh during pull
* Close tab during pull
* Pull Again
* Battle creation
* Battle surrender
* Battle victory
* Battle defeat
* Battle retry
* Refresh during battle
* Refresh on battle results
* Reward finalization
* First daily victory
* Energy debit
* Gold reward
* Card XP
* Multi-level XP overflow
* Card level-up

### Ledger fields

Use at least:

| ID | Player | Starting state | Action | Expected delta | Actual delta | History rows | Owned-card rows | Ending state | Retry result | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

### Integrity questions

Prove or disprove:

* Gold is taken from the signed-in player.
* Daily claims occur once per Mountain Time day.
* Failed transactions leave state unchanged.
* Repeated input does not duplicate writes.
* A five pull creates exactly five owned instances.
* Pull history remains coherent.
* Refreshing results does not duplicate rewards.
* Interrupted battle playback does not duplicate settlement.
* Surrender follows the intended contract.
* XP overflow carries correctly.
* Displayed balances match database balances.
* Client optimism cannot permanently disagree with server state.

### Real-account safety

Real test accounts may be used, but:

* Do not silently grant or remove resources.
* Record user, amount, reason, date, branch, and operator for every manual adjustment.
* Prefer reversible test grants.
* Preserve before-and-after evidence.
* Do not wipe a collection without explicit approval.
* Determine whether preview writes to production D1 before running destructive cases.

### Exit condition

Every critical transaction has a recorded expected and actual result, and every inconsistency is fixed, approval-gated, or explicitly accepted as remaining risk.

---

## Work Package 5: Test failure, interruption, and recovery

### Objective

Prove that ordinary failures do not trap players, duplicate transactions, or create ambiguous state.

### Failure scenarios

Test or simulate:

* Slow network
* Temporary offline state
* API timeout
* API 500 response
* Unauthorized response
* Missing binding
* Missing R2 image
* Malformed card data
* Refresh during pull reveal
* Closing tab during pull reveal
* Refresh during battle
* Navigating away during battle
* Refresh on battle results
* Browser back during confirmation
* Double-tapping primary actions
* Expired session during a write
* Stale local storage
* Malformed session storage
* Multiple tabs using one account
* Service worker or cache mismatch where applicable

### Recovery questions

For each scenario, determine:

* Was the player charged?
* Was the player rewarded?
* Did the server commit the action?
* Can the client reconstruct the result?
* Is retry safe?
* Is the error specific enough to act on?
* Does the interface remain blocked?
* Can a loading overlay remain permanently?
* Does stale state survive logout or account switching?
* Can Pull Again freeze after interrupted reveal state?
* Can battle playback resume from stored events?

### Error-state requirements

The interface should distinguish at least:

* Offline or unreachable
* Unauthorized or expired session
* Server failure
* Insufficient resources
* Conflict or already completed
* Missing content

Do not expose stack traces, secrets, raw SQL, or private data.

### Exit condition

Critical actions have a documented safe-retry contract, unrecoverable states are listed, and no verified duplicate charge or reward remains.

---

## Work Package 6: Design and approval of telemetry foundation

### Objective

Create a useful evidence stream without building an oversized analytics system.

### Phase A: Design only

Before implementation, create:

* Event dictionary
* Event naming convention
* Required and optional fields
* Privacy exclusions
* Storage design
* Retention proposal
* Deletion or aggregation policy
* Validation rules
* Rate limits or event bounds
* Administrator review or export proposal
* Failure-isolation design

Suggested core events include:

* Session started
* Login succeeded or failed
* Route viewed
* Daily claim attempted and completed
* Ticket exchange attempted and completed
* Pull started
* Pull completed
* Pull abandoned or interrupted
* Vault viewed after pull
* Squad saved
* Battle created
* Battle playback started
* Battle interrupted
* Battle surrendered
* Battle completed
* Reward finalized
* Error displayed
* Retry attempted

Suggested fields include:

* Event ID
* Event name
* Timestamp
* Release commit
* Branch or environment
* Authenticated player identifier
* Session identifier
* Route
* Device category
* Browser category
* Outcome
* Duration where meaningful
* Error category
* Related transaction or battle ID

Exclude:

* Passwords
* Session secrets
* Raw cookies
* Authentication tokens
* Unnecessary message contents
* Unnecessary personal information
* Full database dumps

### Approval checkpoint

Present the telemetry design to Sterling before implementation.

The approval request must clearly state:

* What will be collected
* Why each event matters
* What will never be collected
* Where data will be stored
* How long it will be retained
* How Sterling will inspect it
* How telemetry failure is prevented from blocking gameplay

### Phase B: Implementation after approval

After approval:

1. Implement the smallest durable collection path.
2. Validate event schemas.
3. Prevent duplicate events from rerenders.
4. Keep collection asynchronous and non-blocking.
5. Add bounds or rate limiting.
6. Add an admin inspection surface or export as approved.
7. Verify representative events.
8. Verify gameplay when telemetry storage fails.

### Exit condition

The event model is approved and, if implementation is approved within Phase 1, verified samples can reconstruct the core session without exposing prohibited data.

---

## Work Package 7: Triage defects and implement controlled fixes

### Objective

Convert verified findings into reliability improvements without opening a general redesign.

### Defect process

For every defect:

1. Assign a stable ID.
2. Record observation type.
3. Assign severity.
4. Record reproduction steps.
5. Preserve evidence.
6. Identify root cause.
7. Determine scope and affected accounts.
8. Add a regression test where practical.
9. Implement the smallest reliable correction.
10. Run focused tests.
11. Run the full gate when appropriate.
12. Verify in preview.
13. Record remaining risk.

### Observation labels

Use:

* Observed
* Reproduced
* Inferred
* Proposed
* Approved
* Implemented
* Verified
* Deferred
* Rejected

Do not present inference as fact.

### Severity

#### P0 Critical

* Data corruption
* Wrong-user mutation
* Authentication bypass
* Duplicate charging
* Duplicate reward settlement
* Production unavailable
* Destructive unrecoverable loss

#### P1 High

* Core loop cannot complete
* Login, pulls, battle, or rewards regularly fail
* Major economy exploit
* Common mobile layout is unusable
* Player is trapped
* Important information is materially false

#### P2 Medium

* Serious confusion
* Broken secondary action
* Poor recovery messaging
* Incorrect visual state
* Significant avoidable friction
* Feature requires hidden knowledge

#### P3 Low

* Minor inconsistency
* Cosmetic issue
* Copy improvement
* Non-blocking polish
* Rare edge case with easy workaround

### Anti-patch rule

Before adding a fix, ask:

* Is this the root cause?
* Does shared logic already exist?
* Will this create another route-specific override?
* Does this create a second renderer or source of truth?
* Does it add a compatibility fallback?
* Can it affect another account?
* Is it still a low-risk Phase 1 correction?

Do not stack unexplained patches over symptoms.

### Exit condition

Every implemented fix has evidence, tests where practical, preview verification, and a clear record in the defect ledger.

---

## Work Package 8: Prepare and conduct human release-confidence testing

### Objective

Verify that the hardened build works in real hands and that state changes are understandable.

### Preview prerequisite

Before human testing:

* Automated gate passes or approved baseline exceptions are documented.
* Preview deployment is available.
* Preview bindings and data risk are known.
* Test accounts and starting resources are recorded.
* Known P0 defects are resolved.
* Test scripts do not require technical knowledge from the casual tester.

### Sterling test

Sterling should test:

* Account switching
* Multiple devices or browsers
* Rapid repeated actions
* Pulls
* Vault ownership results
* Squad creation and reordering
* Battle interruption
* Retry behavior
* Administrator surfaces
* Resource consistency
* Unusual navigation

### Cydney test

Give Cydney minimal instruction:

> Open Imago Core and use it as you naturally would. Say what you think each screen is asking you to do. Do not ask Sterling for guidance unless you cannot continue.

Observe:

* First click
* Hesitation
* Misread labels
* Missed actions
* Confusing resources
* Recovery from errors
* Pull completion
* Battle completion
* Reward comprehension

Do not coach her through unclear design. Record where she becomes blocked.

### Ashley test

When available, ask Ashley to open the game after time away without reminding her where systems are located.

Observe whether Home and navigation restore context.

Ashley is useful but should not block all Phase 1 work when unavailable.

### Post-session questions

Ask without leading:

1. What did you think you were supposed to do first?
2. What was confusing?
3. What felt satisfying?
4. Did anything feel broken or untrustworthy?
5. What would you do next?
6. Would you reopen it tomorrow? Why or why not?

### Evidence rule

Keep separate:

* Sterling feedback
* Cydney feedback
* Ashley feedback
* Telemetry
* Code audit findings
* Automated results

Do not collapse these into one generic “users liked it” conclusion.

### Exit condition

Cydney can complete a basic session without technical help, or the remaining blocker is documented and resolved before final merge recommendation.

---

## Work Package 9: Final reconciliation and approval package

### Objective

Present a clear merge decision rather than an undifferentiated pile of findings.

### Final report contents

#### Executive summary

* What was tested
* What was learned
* What changed
* What remains risky
* What human testers said
* Whether Phase 1 should merge

#### Findings grouped by

* Reliability
* Playability
* Clarity
* Visual cohesion
* Economy
* Security and ownership
* Recovery
* Telemetry
* Technical debt

#### Changes

For each change:

* Problem
* Evidence
* Implementation
* Risk
* Test coverage
* Preview result

#### Decisions required

Clearly list:

* Economy values
* Data changes
* Deferred items
* Rejected options
* Accepted debt
* Telemetry decisions
* Merge approval

#### Status report

Include:

* Approximate completion percentage
* Branch
* Commit
* Draft PR link
* Preview URL
* Automated results
* Human testing status
* Blockers
* Recommended next action

### Final recommendation states

Use one:

* **GO:** Phase 1 meets its gates and is recommended for merge.
* **CONDITIONAL GO:** Safe to merge after named conditions are completed or explicitly accepted.
* **NO-GO:** A release-critical risk remains.

Do not merge automatically after issuing a GO recommendation. Wait for Sterling's explicit approval.

---

# 11. Defect and evidence ledgers

## 11.1 Defect and friction ledger

Use at least:

| ID | Area | Observation | Type | Severity | Reproduction | Evidence | Proposed response | Approval | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 11.2 Manual resource adjustment ledger

Use at least:

| Date | Environment | Player | Resource | Amount | Direction | Reason | Operator | Before | After | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 11.3 Deployment ledger

Use at least:

| Environment | Project | Branch | Commit | URL | D1 binding | R2 binding | Deployed at | Result | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 11.4 Automated test ledger

Use at least:

| Date | Commit | Command | Environment | Result | Duration | Failure class | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |

---

# 12. Production and preview safety

## 12.1 Determine binding behavior before mutation testing

Cloudflare preview environments may:

* Use production D1 and R2
* Use separate preview bindings
* Lack bindings
* Use mocked fallbacks
* Behave differently from local development

Do not assume.

Before economy or data-mutating tests, identify where writes go.

If preview uses production data:

* Treat preview tests as production mutations.
* Use controlled real-account tests only.
* Record every change.
* Do not run destructive scenarios without approval.
* Prefer transaction-level tests with reversible grants.

## 12.2 Secrets

Never place secret values in:

* Repository documents
* Pull request bodies
* Test logs
* Screenshots
* Telemetry
* Final reports

Document secret names and purpose only.

## 12.3 Database changes

No destructive migration is authorized.

For any additive schema proposal:

* Document purpose
* Document rollback
* Test against a safe environment
* Confirm compatibility with current production data
* Obtain approval when it materially affects production

## 12.4 Data correction

Do not silently “repair” unexpected player state.

First preserve evidence and explain the transaction path that produced it.

---

# 13. Documentation reconciliation requirements

During Phase 1, documentation must become more trustworthy.

For every verified conflict:

1. Identify the current source behavior.
2. Identify intended behavior.
3. Classify the old text as wrong, historical, ambiguous, or still valid.
4. Correct the canonical document or mark the old section as superseded.
5. Link the change from the Phase 1 report.

Do not rewrite design history unnecessarily. Preserve useful historical context when clearly labeled.

At minimum, resolve or explicitly classify the four known conflicts in Section 7.

---

# 14. Quality gates for Phase 1 completion

Phase 1 may be recommended for merge only when all applicable gates are satisfied.

## Reliability

* Required automated commands pass, or approved baseline exceptions are documented.
* Production build passes.
* Battle simulation passes.
* Preview behavior is verified.
* No unexplained resource mutation remains.
* No wrong-user mutation remains.
* No duplicate charging remains.
* No duplicate settlement remains.
* Recovery behavior is documented.

## Account and security integrity

* Session ownership is traced.
* Player reads and writes are isolated.
* Admin endpoints deny ordinary users.
* Logout and account switching do not preserve stale private state.
* Any compatibility fallback is removed, proven unreachable, or explicitly accepted.

## Economy integrity

* Daily claims respect Mountain Time.
* Failed transactions are atomic.
* Repeated input is idempotent or safely rejected.
* Pull counts, history, card creation, and balances reconcile.
* Battle settlement and rewards reconcile.
* Displayed resources match persisted resources.

## Playability

* Core routes are reachable.
* Primary actions work on release-critical devices.
* Errors do not trap the player.
* Pull and battle flows recover safely.
* Cydney can complete a basic session without technical guidance.

## Telemetry

* Event design is approved.
* Privacy and retention are documented.
* Core events are implemented and verified if approved for this phase.
* Telemetry failure does not block gameplay.

## Product discipline

* No Phase 2 work has been smuggled into Phase 1.
* No broad rewrite has occurred.
* No unapproved economy or progression values changed.
* Remaining risks are explicit.
* Every implementation is reviewable.

---

# 15. Communication cadence for the receiving Work thread

The receiving thread should keep Sterling oriented without requiring constant management.

Provide a status update at meaningful boundaries, approximately:

* After baseline and branch creation
* After route and API inventory
* After automated coverage analysis
* After ownership and economy audits
* At the telemetry approval checkpoint
* Before human preview testing
* At final approval package

Every status update should include:

* Current branch
* Current commit
* Approximate completion percentage
* Work completed
* Important findings
* Current risks
* Next work package
* Any decision required

Report P0 findings immediately rather than waiting for the next scheduled update.

Do not provide invented time estimates.

---

# 16. Definition of done

This work order is complete when:

1. `phase/release-hardening` was created from the latest verified `main`.
2. A draft pull request exists.
3. The production and preview baseline is documented.
4. Route and API matrices are complete.
5. Required automated gates were run and recorded.
6. Critical coverage gaps were addressed or documented.
7. Authentication, ownership, and admin boundaries were audited.
8. Economy transactions were reconciled.
9. Failure and recovery behavior was tested.
10. Telemetry design received an explicit decision.
11. Approved telemetry implementation, if included, was verified.
12. Controlled low-risk fixes were tested.
13. Known documentation conflicts were resolved or classified.
14. A preview was tested on release-critical devices.
15. Sterling and Cydney release-confidence evidence was recorded.
16. Remaining P0 and P1 risks are absent, fixed, or explicitly accepted where acceptance is safe.
17. The final Phase 1 report gives a GO, CONDITIONAL GO, or NO-GO recommendation.
18. Sterling receives a final approval package.
19. The branch remains unmerged until Sterling approves.
20. Phase 2 has not begun.

---

# 17. Final instruction to Work mode

Execute this work order from the latest `main`.

Begin with repository reading, baseline verification, branch creation, the draft pull request, and the baseline automated gate.

Proceed autonomously through safe audit, documentation, testing, and clearly low-risk branch changes.

Use evidence, not assumptions.

Do not confuse passing tests with complete confidence.

Do not fabricate human feedback or Cloudflare dashboard facts.

Do not change economy, progression, or major design behavior without approval.

Do not merge without Sterling's explicit approval.

Do not begin Phase 2.

---

# 18. Ready-to-use Work-mode starter message

Use the following message when handing this order to Work mode:

> Repository: `https://github.com/Valithron/commune-tcg`
>
> Begin Phase 1 Release Hardening from the latest `main` by reading and executing `docs/phase-1-release-hardening-work-order.md`.
>
> Treat `docs/quality-playability-roadmap.md` as the governing program roadmap. Complete Phase 1 only. Create `phase/release-hardening` from the latest verified `main`, open a draft pull request, maintain the required evidence files, and follow every approval gate in the work order.
>
> Proceed autonomously through safe audits, tests, documentation, and low-risk fixes. Pause for Sterling only when the work order requires an approval-gated product, economy, telemetry, data, or merge decision.
>
> When reporting progress or requesting a decision, include the current branch, commit, approximate completion percentage, verified findings, risks, and recommended next action.
>
> Do not merge without explicit approval. Do not begin Phase 2.
