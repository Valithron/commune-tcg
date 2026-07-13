# Imago Core Quality, Playability, and Interest Roadmap

> **Program status:** Phase 1 completed in squash commit `5f2219afbffa2c7f6fbc4a8bb933f16914ae421d`. Phase 2 is governed by [`docs/phase-2/phase-2-roadmap.md`](phase-2/phase-2-roadmap.md), which overrides this document where the delivery sequence or approval model differs. Phase 2A began on `phase-2a-daily-loop-collection-clarity`.

## Canonical execution handoff

### Repository

`Valithron/commune-tcg`

### Production branch

`main`

### Canonical roadmap path

`docs/quality-playability-roadmap.md`

### Purpose

This document directs a three-phase quality, playability, and product-interest program for Imago Core:

1. Release hardening
2. Daily player loop
3. Onboarding and progression

This is not merely a bug hunt. It is an organized effort to determine whether Imago Core:

* Works reliably
* Communicates clearly
* Feels satisfying to operate
* Gives players meaningful goals
* Encourages another session
* Is developing into a coherent game rather than remaining a collection of technical systems

The current application has a legitimate production baseline, a live player base, working collection and battle systems, and a broad route surface spanning Home, pulls, Vault, Library, shop, squads, battles, rewards, submission, and administration.

The objective of these phases is not to pretend the game is finished. The objective is to turn the existing framework into a stronger functional body:

* Reliable internal systems
* Clear connective tissue
* Better visual and tactile feedback
* Meaningful player motivation
* Stronger progression signals
* Greater confidence that future features are being built on healthy foundations

Do not jump ahead into superficial finish merely to create the appearance of progress. The work should produce real structural improvement.

---

# 1. Governing principles

## 1.1 Production stability comes first

`main` is the canonical production branch. No phase work should be committed directly to `main`.

Use the following sequence:

1. Begin from the latest verified `main`.
2. Create a dedicated phase branch.
3. Perform audits, tests, documentation, and approved implementation there.
4. Use Cloudflare preview deployments.
5. Conduct human testing against the preview whenever bindings and data access permit.
6. Run automated validation.
7. Present findings and changes for Sterling’s approval.
8. Merge only after approval.
9. Verify the resulting production deployment.

The repository’s own developer guidance defines `main` as canonical and recommends branching new work rather than treating historical branches as active development lines.

Recommended branches:

* `docs/quality-playability-roadmap`
* `phase/release-hardening`
* `phase/daily-player-loop`
* `phase/onboarding-progression`

If one phase becomes too large to review safely, split implementation into narrower branches while keeping the phase report in the canonical roadmap.

## 1.2 Audit before redesign

Do not assume that every frustration requires a new feature.

For each problem:

1. Establish what currently happens.
2. Reproduce it.
3. Determine whether it is a defect, unclear communication, missing feedback, weak pacing, or a genuinely missing system.
4. Identify the smallest credible correction.
5. Test the correction.
6. Compare the new experience with the old one.

Avoid rewriting a whole screen because one button lacks hierarchy.

Avoid creating a new currency because an existing reward is poorly explained.

Avoid adding more content to compensate for an unclear loop.

## 1.3 Distinguish observation from interpretation

All findings should be labeled as one of the following:

* **Observed:** Directly seen in code, telemetry, a test, or a player session.
* **Reproduced:** Reliably repeated under stated conditions.
* **Inferred:** A likely explanation that has not been directly proven.
* **Proposed:** A design or implementation option.
* **Approved:** Explicitly accepted by Sterling.
* **Implemented:** Present on the phase branch.
* **Verified:** Retested after implementation.
* **Deferred:** Valuable but outside the current phase.
* **Rejected:** Considered and intentionally declined.

Do not present AI speculation as user research.

Do not present one tester’s reaction as universal proof.

## 1.4 Human judgment is required for game feel

AI and automated testing are strong at:

* Code inspection
* Contract checking
* Mathematical analysis
* State-transition auditing
* Detecting inconsistent labels
* Identifying missing error handling
* Enumerating edge cases
* Comparing implementation with documentation
* Running simulations
* Finding probable regression points

They are weak at independently determining:

* Whether a reveal feels exciting
* Whether a battle drags
* Whether a screen feels intimidating
* Whether a reward feels emotionally meaningful
* Whether a player understands what to do without being told
* Whether a card feels desirable
* Whether the game creates an urge to return

Human testing is mandatory for those judgments.

## 1.5 Build for the actual test group

The current human test group is:

### Sterling

Role:

* Builder
* Product owner
* Experienced user
* Strategic and systems-oriented tester
* Likely to notice missing depth, awkward mechanics, and implementation inconsistencies

Bias:

* Deep familiarity with the application
* Knows where features are located
* Can unintentionally compensate for poor discoverability
* May tolerate complexity that a casual player would not

Use Sterling for:

* Edge cases
* Strategic depth
* System coherence
* Visual direction
* Feature approval
* Economy judgment
* Break testing

### Cydney

Role:

* Casual-side target player
* Did not build the application
* Best current benchmark for readability, clarity, discoverability, and emotional appeal

Testing rule:

Cydney should be allowed to use the application without Sterling explaining where to click or what a system is supposed to mean.

Use Cydney for:

* Unguided navigation
* First-session clarity
* Casual comprehension
* Visual appeal
* Reward satisfaction
* Whether the next action is obvious
* Whether the game feels worth reopening

### Ashley

Role:

* Intermittent tester
* Less frequently available
* Useful for evaluating whether the game remains understandable after time away

Use Ashley for:

* Cold-return testing
* Memory and recognition
* Whether the Home page restores context
* Whether changes remain comprehensible to someone not following daily development

### Ryan

Ryan is not part of these three phases’ primary test group.

Bring Ryan in later for:

* More demanding strategic assessment
* Battle difficulty
* Optimization
* Android testing
* Advanced systems

Do not delay these phases waiting for Ryan.

## 1.6 Device priorities

Release-critical targets:

1. Desktop Brave or another Chromium browser
2. iPhone Safari
3. iPhone Brave
4. Responsive mobile layouts at common iPhone widths

Secondary target:

* Older Galaxy Tab A for limited Android/Chrome spot testing

Full Android validation can happen later when Ryan joins testing.

Record the device, browser, viewport, login account, branch, and commit for every meaningful defect.

## 1.7 Real accounts may be used, but changes must be traceable

Sterling, Cydney, and Ashley understand that Imago Core remains in alpha or beta.

Testing may use:

* Real player accounts
* Real production-like card collections
* Injected Gold, tickets, or Energy
* Reset tutorial flags
* Controlled data corrections
* Test pulls and battles

However:

* Do not silently wipe data.
* Do not silently grant or remove resources.
* Do not make destructive schema changes without approval.
* Record any manual resource injection.
* Record the user, amount, reason, date, branch, and operator.
* Prefer reversible operations.
* Preserve evidence when testing economy defects.

The willingness of testers to lose data is not permission for careless data handling.

## 1.8 Small fixes versus approval-gated changes

Low-risk fixes may be implemented on the phase branch when clearly justified.

Examples:

* Broken links
* Incorrect labels
* Missing loading indicators
* Obvious button-state bugs
* Small responsive overflow defects
* Clear accessibility defects
* Missing null guards
* Duplicate event listeners
* Incorrect empty-state copy
* Visual collisions
* Harmless telemetry instrumentation

Require Sterling’s approval before implementing:

* Pull-odds changes
* Currency costs
* Gold rewards
* Ticket rewards
* Energy costs or regeneration
* XP rates
* Level curves
* Battle difficulty changes
* New missions
* Streak systems
* Unlock requirements
* New currencies
* Duplicate conversion rates
* Evolution requirements
* Destructive migrations
* Production data wipes
* Major navigation changes
* Major visual redesigns
* Features that substantially change the daily loop

Telemetry is approved in principle, but its data model, privacy boundaries, retention, and dashboard design must be documented before implementation.

## 1.9 Required automated gates

At minimum, run:

```bash
npm ci
npm test
npm run build
npm run battle:simulate -- --iterations=1000
git diff --check
```

The repository currently uses build and tests as its automated gate and does not yet have a dedicated lint command.

Do not introduce a broad linting cleanup during one of these phases unless separately approved. Existing technical debt already identifies tooling and broad modularization as independent work that should not be mixed casually into product hardening.

---

# 2. Evidence and reporting requirements

Every phase must produce:

* An audit report
* A test matrix
* A bug and friction ledger
* Screenshots or recordings for visual defects
* Reproduction steps
* Telemetry findings where available
* Human feedback separated by tester
* Proposed changes
* Approval decisions
* Implemented changes
* Automated validation results
* Preview deployment link
* Remaining risks
* A go or no-go recommendation

Use a ledger with these fields:

| ID | Area | Observation | Type | Severity | Reproduction | Evidence | Proposed response | Approval | Status |
| -- | ---- | ----------- | ---- | -------- | ------------ | -------- | ----------------- | -------- | ------ |

Severity definitions:

### P0: Critical

* Data corruption
* Wrong-user resource mutation
* Authentication bypass
* Duplicate charging
* Duplicate reward settlement
* Production unavailable
* Destructive loss with no recovery

### P1: High

* A core loop cannot be completed
* Pulls, battles, rewards, or login regularly fail
* Major economy exploit
* Common mobile layout is unusable
* Player is trapped with no recovery
* Important information is materially false

### P2: Medium

* Serious confusion
* Broken secondary action
* Poor recovery messaging
* Incorrect visual state
* Noticeable but avoidable friction
* Feature works only through hidden knowledge

### P3: Low

* Minor inconsistency
* Cosmetic defect
* Copy improvement
* Non-blocking polish
* Rare edge case with an easy workaround

---

# 3. Telemetry foundation

Because the test group is small, telemetry will not produce statistically robust product analytics. It will still provide valuable timelines and behavioral evidence.

Treat results as case studies, not population-level proof.

## 3.1 Telemetry goals

Telemetry should help answer:

* Where do players begin?
* What do they click first?
* Where do they stop?
* How long does a full session take?
* Do they open the Vault after a pull?
* Do they modify their squad before battling?
* Do they complete battles?
* Do they skip rewards?
* Do they know what to do after rewards?
* Which errors occur in actual use?
* Do they return on a later day?
* Which features are ignored?

## 3.2 Suggested events

At minimum:

* `session_started`
* `session_ended`
* `route_viewed`
* `home_action_selected`
* `daily_claim_started`
* `daily_claim_completed`
* `daily_claim_failed`
* `ticket_purchase_started`
* `ticket_purchase_completed`
* `ticket_purchase_failed`
* `pull_started`
* `pull_completed`
* `pull_failed`
* `pull_reveal_started`
* `pull_reveal_completed`
* `pull_reveal_skipped`
* `pull_results_viewed`
* `vault_viewed`
* `vault_card_viewed`
* `vault_viewed_after_pull`
* `squad_builder_viewed`
* `squad_saved`
* `battle_started`
* `battle_interrupted`
* `battle_surrendered`
* `battle_completed`
* `battle_results_viewed`
* `reward_sequence_completed`
* `reward_sequence_skipped`
* `card_level_up`
* `tutorial_started`
* `tutorial_step_viewed`
* `tutorial_step_completed`
* `tutorial_abandoned`
* `error_displayed`

## 3.3 Suggested fields

* Event ID
* Timestamp
* User slot ID
* Session ID
* Event name
* Current route
* Previous route
* Outcome
* Duration where relevant
* Branch or release identifier
* Device category
* Browser category
* Approved metadata object
* Stable error code
* Non-sensitive failure reason

Never record:

* PINs
* Session cookies
* Raw authorization headers
* Full request bodies
* Sensitive database rows
* Private image data
* Unrestricted arbitrary browser text
* Stack traces containing secrets

## 3.4 Telemetry review

Create a simple way for an administrator to review:

* Sessions by player
* Core-loop completion
* Errors
* Abandoned flows
* Average step duration
* Repeated button attempts
* Battle interruptions
* Tutorial abandonment
* Daily return activity

Do not build an elaborate analytics platform before proving the event schema is useful.

---

# Phase 1: Release hardening

## Mission

Establish that the new `main` baseline is operationally trustworthy.

This phase covers:

* Smoke testing
* Bug capture
* Economy integrity
* Account isolation
* Deployment confidence
* Error recovery
* Telemetry
* Controlled low-risk fixes

The repository already identifies player-ownership fallbacks and thinner pull/economy test coverage as high-risk debt. These areas must receive direct attention rather than being hidden behind a passing build.

---

## Phase 1, Step 1: Establish and preserve the release baseline

### Objective

Create a precise record of what is being tested before any changes begin.

### Work

1. Record the current `main` commit.
2. Confirm the latest production deployment commit.
3. Create `phase/release-hardening` from that exact `main`.
4. Record Cloudflare production and preview configuration.
5. Confirm the Worker or Pages project identity.
6. Confirm D1 and R2 binding names.
7. Confirm production domains.
8. Confirm environment variables and secrets required by the application.
9. Confirm rollback options.
10. Create a release-hardening section in the canonical roadmap.

### Questions to answer

* Which commit is currently live?
* Does Cloudflare preview receive the same bindings as production?
* Does a preview branch use production D1 and R2, separate resources, or no bindings?
* Is the custom domain attached to the correct project?
* Can a previous deployment be restored quickly?
* Are environment variables documented anywhere outside Cloudflare?
* Can the deployment process be reproduced without dashboard guesswork?

### What this accomplishes

This prevents testing the wrong code, confusing preview behavior with production behavior, or making changes without a known rollback point.

### Challenges

Cloudflare preview environments can differ from production in ways that are not visible from the repository. Do not assume that a successful Vite preview proves D1 or R2 integration.

### Human input

Sterling may need to confirm dashboard-only settings. This is factual operational input, not a subjective playtest.

### Exit evidence

* Baseline commit recorded
* Branch created
* Binding inventory recorded
* Production and preview deployment behavior documented
* Rollback procedure documented

---

## Phase 1, Step 2: Build a complete route and API test matrix

### Objective

Turn the application surface into a testable checklist.

### Work

Use the canonical route map and source to enumerate:

* Signed-out routes
* Signed-in player routes
* Administrator routes
* API endpoints
* Empty states
* Loading states
* Error states
* Direct-link behavior
* Refresh behavior
* Back and forward navigation
* Unauthorized behavior
* Missing-resource behavior

The current route map contains player flows from Home through pulls, Vault, Library, shop, squads, battle, results, and submission, plus administrator and diagnostic surfaces.

Create a matrix including:

| Surface | Account | Device | Expected state | Actual state | Result | Evidence |
| ------- | ------- | ------ | -------------- | ------------ | ------ | -------- |

### Questions to answer

* Is every documented route reachable?
* Are there routes that exist in code but not documentation?
* Are there documented routes that no longer work?
* Does every route have a credible loading state?
* Does every route have a credible empty state?
* Does every route show actionable errors?
* Do unknown routes recover safely?
* Can browser navigation create stale or duplicated initialization?

### What this accomplishes

This gives the project a reusable regression map rather than relying on memory.

### Challenges

A route can appear to work while using cached or mock data. Confirm whether the state is genuinely live.

### AI versus human

AI can construct the route inventory and inspect initialization contracts.

Humans should verify whether each state is understandable and visually credible.

### Exit evidence

* Complete route matrix
* Complete API matrix
* Missing-state list
* Dead or undocumented surface list
* Prioritized regression candidates

---

## Phase 1, Step 3: Run automated validation and identify coverage gaps

### Objective

Determine what passing tests actually prove and what remains unprotected.

### Work

1. Run all required commands.
2. Record results and duration.
3. Inspect existing tests by domain.
4. Map tests to:

   * Authentication
   * Player ownership
   * Pull resources
   * Daily claim
   * Ticket exchange
   * Single pull
   * Five pull
   * Duplicate creation
   * Vault grouping
   * Squad saving
   * Battle creation
   * Battle playback
   * Battle finalization
   * Rewards
   * Admin authorization
5. Identify untested transactional and browser behaviors.
6. Add narrowly scoped tests where the risk is clear.
7. Do not refactor whole modules just to make a test easier.

### Questions to answer

* Which critical behaviors have no automated coverage?
* Which tests rely entirely on mocks?
* Can a passing test miss a wrong-user write?
* Are daily-boundary tests using Mountain Time?
* Are pull and reward writes tested for idempotency?
* Are double-submit cases represented?
* Are five-pull ownership and history counts verified?
* Does battle testing cover recovery after refresh?

### What this accomplishes

This converts test count into meaningful confidence rather than treating green output as sufficient evidence.

### Challenges

The repository’s battle coverage is stronger than pull and economy coverage. Do not spend the entire phase adding more battle tests while leaving resource mutations exposed.

### Human input

Minimal human feedback is needed here, except when deciding whether a behavior reflects intended design.

### Exit evidence

* Automated results log
* Coverage-by-domain summary
* New high-value tests
* Explicit list of unautomated risks

---

## Phase 1, Step 4: Audit authentication, player ownership, and administrative boundaries

### Objective

Ensure actions affect the correct player and privileged actions remain privileged.

### Work

Test with Sterling and Cydney accounts:

* Login
* Logout
* Refresh
* Session persistence
* Session expiration behavior where practical
* Account switching
* Multiple browsers
* Multiple devices
* Failed authentication
* Direct administrator URL entry
* Direct administrator API calls
* User-specific Vault contents
* User-specific resources
* User-specific pull history
* User-specific battle history
* User-specific squad
* User-specific rewards

Specifically inspect any path that can fall back to Sterling when session resolution fails.

### Questions to answer

* Can Cydney ever receive Sterling’s resources or cards?
* Can Sterling’s fallback identity activate after a failed session check?
* Can a write happen before authenticated ownership is resolved?
* Can an ordinary player call an admin API directly?
* Are admin denials visible and logged?
* Does logout invalidate the server session?
* Can stale client state remain visible after switching users?
* Do caches survive account changes?

### What this accomplishes

This addresses one of the most serious possible classes of defects: actions being attributed to the wrong person.

### Challenges

Compatibility fallbacks may appear harmless because Sterling is the most-used account. That makes them more dangerous, not less, because wrong-user writes may look plausible.

### Human input

Human testers can verify whether the visible account identity and data feel consistent. The actual security and ownership determination must come from code inspection and database evidence.

### Exit gate

Before Phase 1 closes:

* Ownership-sensitive mutation paths must use authenticated identity, or
* Any remaining fallback must be proven unreachable in normal production use and explicitly accepted as debt.

---

## Phase 1, Step 5: Perform an economy and transaction integrity audit

### Objective

Prove that Gold, tickets, Energy, pulls, history, cards, and rewards remain internally consistent.

### Work

Create before-and-after transaction records for:

* Daily ticket claim
* Gold-to-ticket exchange
* Single pull
* Five pull
* Failed pull with insufficient tickets
* Repeated pull click
* Double click
* Refresh during pull
* Pull Again
* Battle creation
* Battle surrender
* Battle victory
* Battle defeat
* Battle retry
* Reward finalization
* First daily victory
* Card XP
* Card level-up
* Energy debit
* Gold reward

For each test, record:

* Player
* Starting resources
* Action
* Expected delta
* Actual delta
* History rows
* Owned-card rows
* Ending resources
* Whether retrying repeated the transaction

### Questions to answer

* Is Gold taken from the correct player?
* Is a daily claim available only once per Mountain Time day?
* Does a failed transaction leave resources unchanged?
* Can rapid repeated input create multiple writes?
* Does a five pull create exactly five owned instances and one coherent history event?
* Does refreshing results create duplicate rewards?
* Can interrupted battle playback duplicate settlement?
* Does surrender use the intended reward contract?
* Does XP overflow carry correctly through levels?
* Do displayed balances match database balances?

### What this accomplishes

This establishes trust. A collection game becomes unplayable when players cannot trust its resource ledger.

### Challenges

Testing real accounts may consume resources. Resource grants are allowed, but every injection must be logged. Avoid “fixing” unexpected values until the transaction trail explains them.

### AI versus human

AI can verify arithmetic, database writes, idempotency, and timestamps.

Humans must verify whether costs and rewards are understandable and whether actions feel trustworthy.

### Exit evidence

* Economy transaction ledger
* Daily-boundary evidence
* Idempotency test results
* Wrong-user mutation results
* List of values that work technically but may require design changes later

---

## Phase 1, Step 6: Test interruption, failure, and recovery behavior

### Objective

Ensure the game remains safe and understandable when ordinary things go wrong.

### Work

Test:

* Slow network
* Temporary offline state
* API 500 response
* API timeout
* Missing R2 image
* Malformed card data
* Refresh during pull reveal
* Closing the tab during pull reveal
* Refresh during battle
* Navigating away during battle
* Refresh on battle results
* Browser back during confirmation
* Double-tapping primary actions
* Expired session during a write
* Preview environment missing a binding
* Stale local storage
* Malformed session storage
* Multiple tabs using the same account

### Questions to answer

* Does failure cause duplicate charging?
* Does failure cause duplicate rewards?
* Can the player resume?
* Is the action’s state clear?
* Is a retry safe?
* Does the app distinguish offline, unauthorized, and server failure?
* Are mock fallbacks visibly identified?
* Does a loading overlay block the interface permanently?
* Can stale reveal state freeze Pull Again?
* Can battle playback recover from stored events?

### What this accomplishes

It proves that the application is resilient, not merely functional under perfect conditions.

### Challenges

Failure simulation can produce misleading results if service workers, browser caches, or preview bindings are not understood.

### Human input

Human feedback is important for error copy:

* Did the player understand what happened?
* Did they know whether resources were spent?
* Did they know whether it was safe to retry?
* Did the error feel alarming, vague, or dismissive?

### Exit evidence

* Recovery matrix
* Screenshots of major errors
* Safe retry confirmation
* Unrecoverable-state list
* Recommended recovery improvements

---

## Phase 1, Step 7: Implement the telemetry foundation

### Objective

Create a durable evidence stream for later playability and retention work.

### Work

1. Define the event schema.
2. Define privacy exclusions.
3. Decide storage and retention.
4. Add server-side or client-to-server event collection.
5. Add event validation.
6. Add rate limits or bounds.
7. Add an administrator inspection surface or export.
8. Instrument the core loop.
9. Test event accuracy.
10. Ensure telemetry failure cannot block gameplay.

### Questions to answer

* Are events recorded once or multiple times?
* Can route rerenders inflate counts?
* Can event payloads expose private information?
* Does telemetry distinguish completion from mere page view?
* Can an interrupted battle be distinguished from a deliberate surrender?
* Can session duration be reconstructed?
* Can administrators filter by player and release?
* What is the retention period?
* How will old events be deleted or summarized?

### What this accomplishes

It reduces dependence on memory and permits later phases to compare intended behavior with actual behavior.

### Challenges

Telemetry can become noisy faster than it becomes useful. Track important state transitions rather than every cursor movement.

### Human input

Sterling should approve the final event dictionary and administrative presentation. Cydney and Ashley do not need to interact with telemetry directly.

### Exit evidence

* Event dictionary
* Privacy statement
* Storage model
* Verified event samples
* Administrator review method
* Confirmation that gameplay still works if telemetry fails

---

## Phase 1, Step 8: Triage defects and apply controlled low-risk fixes

### Objective

Correct clear defects without allowing the phase to become an unbounded redesign.

### Work

For each defect:

1. Reproduce it.
2. Assign severity.
3. Identify root cause.
4. Determine whether it is isolated.
5. Add a regression test where practical.
6. Apply the smallest reliable fix.
7. Run relevant tests.
8. Run the full automated gate.
9. Preview test.
10. Record the result.

### Questions to answer

* Is this the actual cause or another patch over a symptom?
* Does the fix duplicate existing logic?
* Does it add another compatibility fallback?
* Does it create a second renderer, resolver, or source of truth?
* Can it affect another account?
* Can it affect production resources?
* Is it still a small fix?
* Should it become a separate approved task?

### What this accomplishes

It turns audit findings into practical reliability gains while preserving scope discipline.

### Challenges

The app grew through many historical patches. Avoid adding more route-specific overrides when a shared behavior is clearly responsible.

### Human input

Human confirmation is needed when a fix changes:

* Visual hierarchy
* Timing
* Interaction
* Error language
* Battle pacing
* Pull presentation

### Exit evidence

* Closed defect list
* Regression tests
* Preview confirmation
* Remaining defect list
* No hidden “temporary” fixes without documentation

---

## Phase 1, Step 9: Conduct human release-confidence sessions

### Objective

Confirm that the hardened application works in real hands.

### Sterling session

Ask Sterling to:

* Switch between accounts and devices
* Attempt rapid repeated actions
* Perform pulls
* Inspect Vault results
* Build and reorder squads
* Interrupt battles
* Retry actions
* Use administrator surfaces
* Look for inconsistent resource changes
* Attempt unusual navigation

### Cydney session

Give Cydney minimal instruction:

> Open Imago Core and use it as you naturally would. Please say what you think each screen is asking you to do. Do not ask Sterling for guidance unless you cannot continue.

Observe:

* First click
* Hesitation
* Misread labels
* Missed buttons
* Confusing resources
* Whether errors feel recoverable
* Whether she completes a pull and battle
* Whether she understands the rewards

### Ashley session

When available:

* Ask her to open the game after time away.
* Do not remind her where features are.
* Observe whether Home restores context.

### Post-session questions

Ask without leading:

1. What did you think you were supposed to do first?
2. What was confusing?
3. What felt satisfying?
4. Did anything feel broken or untrustworthy?
5. What would you do next?
6. Would you reopen it tomorrow? Why or why not?

### Exit gate

Phase 1 may close when:

* No unresolved production-blocking P0 issue remains
* Core actions do not create inconsistent resources
* Account ownership is trustworthy
* Pull and battle settlement are safe under repetition and refresh
* Major routes work on desktop Brave and iPhone Safari
* Telemetry records the core loop
* Cydney can complete a basic session without technical help
* Remaining risks are documented and accepted

---

# Phase 2: Daily player loop

## Mission

Make the existing sequence feel like one coherent game:

1. Arrive
2. Understand today’s opportunity
3. Pull or acquire resources
4. Inspect what changed
5. Adjust a squad
6. Battle
7. Receive rewards
8. Understand what to do next

This phase is where the application should begin losing the feeling of a test skeleton.

The goal is not final cosmetic luxury. The goal is functional cohesion:

* Clear hierarchy
* Strong action feedback
* Connected screens
* Visible consequences
* Motivating rewards
* Better pacing
* Better tactile response

---

## Phase 2, Step 1: Map the current daily journey

### Objective

Measure the current loop before changing it.

### Work

For each tester, record:

* Entry route
* First selected action
* Number of clicks to reach a pull
* Number of clicks to reach battle
* Time to first reward
* Time to complete a session
* Routes visited
* Routes abandoned
* Errors
* Repeated actions
* Confusion
* Final action
* Whether a next action was apparent

Create a journey map:

| Stage | Player goal | Current route | Required knowledge | Friction | Emotional result | Opportunity |
| ----- | ----------- | ------------- | ------------------ | -------- | ---------------- | ----------- |

### Questions to answer

* Does Home clearly present today’s priorities?
* Can a player complete the loop in 5 to 10 minutes?
* Where does the loop fracture into disconnected tools?
* Which screen assumes knowledge from another screen?
* Which action creates the strongest positive response?
* Which action feels like administration?
* Does the session naturally end?
* Is there a reason to continue after the expected loop?

### What this accomplishes

It prevents redesign based solely on screenshots. The game is evaluated as a sequence.

### Challenges

Sterling’s familiarity will reduce apparent friction. Weight Cydney’s unguided route more heavily for discoverability.

### Exit evidence

* Journey map
* Timed baseline
* Telemetry baseline
* Highest-friction transitions
* Highest-interest moments

---

## Phase 2, Step 2: Rebuild Home as the daily command center

### Objective

Make Home immediately answer:

* What is available?
* What should I do?
* What changed?
* What is my next meaningful action?

### Work

Audit:

* Featured or strongest card
* Daily pull state
* Battle availability
* Gold
* Tickets
* Energy
* Recent rewards
* Current squad
* Progress signals
* Disabled actions
* Notifications
* Navigation hierarchy
* Mobile composition

Prototype improvements such as:

* Clear daily-action hierarchy
* Completed versus available states
* One strong primary action
* One meaningful secondary action
* Better resource explanations
* Compact squad readiness
* Recent acquisition or progress highlight
* Next-action messaging
* Cleaner card and button balance
* Stronger pressed, loading, and completed states

### Questions to answer

* What should the player click first?
* Does the screen communicate that without explanation?
* Is the featured card useful or merely decorative?
* Can the player tell whether the daily pull is available?
* Can the player tell whether they have enough Energy to battle?
* Does Home celebrate progress?
* Does Home feel alive when there is no daily claim?
* Does it overwhelm casual players?
* Does it give strategic players enough useful information?

### What this accomplishes

Home becomes connective tissue rather than a launch pad full of unrelated links.

### Challenges

Do not overload Home with every system. A command center requires hierarchy, not density.

### Human feedback

Cydney’s first click is the strongest evidence.

Ask:

* What do you think is most important here?
* What do you think is available today?
* What would you click next?
* Which information do you ignore?

### Exit evidence

* Before-and-after hierarchy comparison
* Mobile and desktop previews
* Reduced hesitation
* Improved first-action clarity
* No loss of important functionality

---

## Phase 2, Step 3: Audit and strengthen the pull journey

### Objective

Make acquiring a card understandable, reliable, and emotionally worthwhile without becoming casino-like.

### Work

Audit the full chain:

1. Ticket availability
2. Daily claim or ticket purchase
3. Pull selection
4. Confirmation
5. Resource deduction
6. Reveal
7. Multi-reveal pacing
8. Skip behavior
9. Results
10. Pull Again
11. History
12. Vault follow-through

Evaluate:

* Anticipation
* Timing
* Visual hierarchy
* Card recognition
* Rarity communication
* Duplicate communication
* Type communication
* Ownership consequence
* Recovery from interruption

### Questions to answer

* Does the player know what a pull costs?
* Does the player know whether it is free or paid?
* Is the confirmation useful or tedious?
* Does a Common still feel like a real collectible?
* Can the player identify character, type, and rarity?
* Does a duplicate feel confusing or disappointing?
* Does the result screen explain what changed?
* Is Pull Again safe and responsive?
* Does the player naturally want to inspect the card?
* Does the sequence feel premium rather than casino-like?

### What this accomplishes

It makes the primary collection action carry emotional weight and clear consequences.

### Challenges

More animation is not automatically more excitement. Delays can reduce satisfaction when repeated daily.

### AI versus human

AI can evaluate state safety, skip logic, and information hierarchy.

Humans must judge:

* Anticipation
* Delight
* Repetition fatigue
* Card desirability
* Reveal pacing

### Exit evidence

* Timed reveal analysis
* Human pacing feedback
* Clear duplicate handling
* Reliable Pull Again
* Strong path into Vault or card detail

---

## Phase 2, Step 4: Connect pulls to Vault ownership

### Objective

Ensure a newly pulled card feels acquired, placed, and worth inspecting.

### Work

Audit:

* Post-pull Vault navigation
* Recently pulled sorting
* Duplicate grouping
* Card detail
* Level and XP
* Type
* Rarity
* Stats
* Creator
* Card line or set
* Copy identity
* Filters
* Search
* Favorite or lock concepts
* Collection completion signals

Prototype or recommend:

* “New” state
* Recently acquired section or filter
* Clear duplicate count
* Direct View in Vault action
* Acquisition timestamp
* Collection-line context
* Character collection progress
* Better detail hierarchy
* Strong ownership language

### Questions to answer

* Can the player find the card they just pulled?
* Does the Vault feel like a trophy room or a database?
* Can a casual player understand duplicate counts?
* Can the player tell why two copies differ?
* Does card detail explain why the card matters?
* Is there a reason to favorite or preserve a card?
* Can the player pursue a character or line?
* Is the newest card visible without searching?

### What this accomplishes

It closes the emotional gap between reveal spectacle and collection ownership.

### Challenges

Do not turn the Vault into an overloaded spreadsheet. The card art and collection fantasy remain primary.

### Human feedback

Ask Cydney:

* Which cards feel special?
* Can you find the one you just pulled?
* What does the duplicate number mean?
* What would make you care about completing a group?

Ask Sterling:

* Are filters and sorting sufficient?
* Can strong or unusual copies be located?
* Does the Vault support strategic squad decisions?

### Exit evidence

* Reliable post-pull discovery
* Clear duplicate presentation
* Stronger card-detail value
* New acquisition feels persistent

---

## Phase 2, Step 5: Improve squad creation and battle readiness

### Objective

Make squad construction understandable to casual players and meaningful to strategic players.

### Work

Audit:

* Entry into squad builder
* Available cards
* Selected cards
* Card order
* Lane meaning
* Power
* Type matchups
* Forecasts
* Enemy presentation
* Save state
* Invalid squad state
* Recommended squad possibilities
* Returning to battle
* Mobile drag, tap, and reorder behavior

### Questions to answer

* Does the player know they need three cards?
* Does order matter, and is that clear?
* Does the player understand Power?
* Does the player understand ATK, DEF, and SPD?
* Does the player understand type advantage?
* Can a casual player build a valid squad without studying a chart?
* Can a strategic player see enough information to make a meaningful decision?
* Does the game explain why a lane is favorable or unfavorable?
* Does saving feel confirmed?
* Can a stale or invalid card remain in the squad?

### What this accomplishes

It makes the bridge between collection and combat intentional.

### Challenges

Too much forecast detail can intimidate casual players. Too little information makes strategy feel fake.

### Human feedback

Cydney should build a squad without explanation.

Observe:

* Whether she chooses favorites or stats
* Whether she notices type indicators
* Whether she understands lane order
* Whether forecasts help or confuse

Sterling should test:

* Optimization
* Type manipulation
* Weak-card viability
* Squad persistence
* Edge cases involving duplicates and leveled cards

### Exit evidence

* Casual-valid squad creation
* Strategic information remains available
* Reliable saved order
* Clear battle readiness
* No dead-end formation state

---

## Phase 2, Step 6: Evaluate battle readability, pacing, and control

### Objective

Determine whether battles are understandable, satisfying, and appropriately short.

### Work

Review:

* Arena entry
* Card visibility
* Enemy visibility
* Lane identity
* Turn order
* Damage display
* Type advantage display
* Critical hits
* Double-Strikes
* Defeat states
* Pause
* Card inspection
* Speed controls
* Reduced motion
* Skip to results
* Surrender
* Playback recovery
* Result transition

Record:

* Battle duration at each speed
* Moments of confusion
* Moments of dead time
* Information missed
* Controls used
* Controls ignored
* Interrupted-playback frequency
* Whether outcome feels earned or random

### Questions to answer

* Can the player tell who is attacking?
* Can the player tell why damage differs?
* Can the player tell which lane is winning?
* Is the battle too fast to understand?
* Is normal speed too slow for repetition?
* Does pause preserve card inspection?
* Does the battle need more agency, or is light strategy sufficient?
* Do repeated battles become tedious?
* Does the result feel connected to squad decisions?
* Are defeat and surrender clearly different?

### What this accomplishes

It tests the game’s primary interactive payoff rather than assuming the battle engine’s correctness guarantees player interest.

### Challenges

A deterministic and technically correct battle can still feel unreadable or emotionally flat.

### AI versus human

AI can inspect event order and verify deterministic playback.

Humans must judge:

* Clarity
* Tension
* Satisfaction
* Repetition tolerance
* Whether strategy feels meaningful

### Exit evidence

* Battle-duration measurements
* Playback and control findings
* Human comprehension results
* Proposed pacing adjustments
* No settlement regressions

---

## Phase 2, Step 7: Strengthen rewards and immediate progression

### Objective

Make battle completion visibly change something the player values.

### Work

Audit the reward sequence:

* Victory or defeat presentation
* Gold
* XP
* First daily victory
* MVP
* Level-up
* Card growth
* Skipping
* Queue pacing
* Retry
* Vault
* Home
* Next battle
* Updated top-bar resources

### Questions to answer

* Does the player know what was earned?
* Can the player tell which cards gained XP?
* Does a level-up feel meaningful?
* Does the player see changed stats?
* Does the result screen explain MVP?
* Are defeat rewards clear?
* Does skipping preserve understanding?
* Is the next action obvious?
* Does the player feel stronger?
* Does refreshing repeat settlement?

### What this accomplishes

It converts battle from a detached spectacle into progression.

### Challenges

Reward queues can become slow and repetitive. The solution may be stronger information design rather than more animation.

### Human feedback

Ask:

* What did you earn?
* Which card improved?
* Did the reward feel worth the battle?
* What would you do next?
* Did you understand why that card was MVP?

### Exit evidence

* Correct resource updates
* Clear XP and level changes
* Satisfying but skippable reward sequence
* Working next actions
* No duplicate settlement

---

## Phase 2, Step 8: Design “always something to do” without punishment

### Objective

Provide useful activity after the free pull or Energy-limited battle loop ends.

### Work

Audit what remains available when:

* Daily claim is used
* Tickets are exhausted
* Gold is insufficient
* Energy is exhausted
* The player does not want to submit a card

Develop and compare a small number of concepts such as:

* No-cost training battle
* Daily collection prompt
* Vault organization goal
* Character showcase
* Card-line progress
* Light mission
* Battle practice without rewards
* Rotating card inspection challenge
* Free tactical forecast
* Small passive collection interaction

Do not implement all concepts.

### Questions to answer

* Is the app effectively over when Energy is empty?
* What activity supports the collection fantasy?
* What activity can be meaningful without becoming grind?
* Can a player make progress without being punished for missing a day?
* Does the game need a no-cost battle mode?
* Can Vault goals create activity?
* Which idea requires the least new economy complexity?
* Which idea makes players curious rather than obligated?

### What this accomplishes

It supports the approved hybrid-retention philosophy:

* Something available each day
* No streak punishment
* No shame for missed days
* Optional additional engagement

### Challenges

Adding permanent rewards creates economic consequences. Prototype first and require approval for reward values.

### Human feedback

Ask each tester which option they would genuinely use. Do not ask only which one “sounds coolest.”

### Exit evidence

* Compared concepts
* Cost and economy implications
* Recommended minimal addition
* Sterling approval decision
* Prototype evidence where appropriate

---

## Phase 2, Step 9: Perform a visual and tactile cohesion pass

### Objective

Make the interface feel like one product rather than multiple independently patched screens.

### Work

Audit shared behavior across the daily loop:

* Page headers
* Section hierarchy
* Primary actions
* Secondary actions
* Disabled states
* Loading states
* Pressed states
* Success states
* Errors
* Empty states
* Cards
* Resource counters
* Filters
* Modal spacing
* Mobile safe areas
* Transitions
* Scroll restoration
* Feedback after writes

Prioritize:

* Reusable patterns
* Stronger spacing
* Consistent status presentation
* Better information hierarchy
* Responsive touch targets
* Visible interaction feedback
* Elimination of dead visual zones
* Better connection between screen purpose and primary action

### Questions to answer

* Does every major action respond immediately?
* Are disabled controls visibly disabled?
* Do loading states look intentional?
* Does success feel complete?
* Do errors look distinct from empty states?
* Are gold and blue used consistently?
* Does mobile spacing feel cramped or wasteful?
* Do cards remain the visual focus?
* Does each screen have one clear purpose?
* Are there obvious test-harness artifacts still visible?

### What this accomplishes

It builds the “neurons, muscles, and organs” of the product shell without pretending to apply final luxury finish.

### Challenges

Avoid one-off CSS patches. Prefer shared tokens and components where the patterns are truly shared.

### Human feedback

Visual appeal must be reviewed in actual devices, not only desktop screenshots.

### Exit evidence

* Shared-state inventory
* Before-and-after captures
* Improved touch feedback
* Better mobile hierarchy
* No broad visual regression

---

## Phase 2, Step 10: Conduct integrated daily-loop playtests

### Objective

Test the entire session as one experience.

### Cydney test

Begin on Home with no instructions.

Observe whether she:

1. Identifies an available action
2. Claims or obtains a ticket
3. Performs a pull
4. Understands the reveal
5. Inspects or locates the new card
6. Builds or confirms a squad
7. Starts a battle
8. Understands the battle
9. Understands rewards
10. Identifies a next action

Do not rescue her from confusion immediately. Record the point of hesitation first.

### Sterling test

Ask Sterling to:

* Optimize the loop
* Test alternate navigation
* Compare strong and weak squads
* Attempt repeated pulls or battles
* Inspect all resulting data
* Identify whether strategy feels worthwhile
* Judge whether the visual direction feels more alive and cohesive

### Ashley test

When available:

* Ask Ashley to complete whatever she thinks the game offers today.
* Do not tell her the intended order.
* Observe whether the loop remains legible after absence.

### Exit gate

Phase 2 may close when:

* The daily loop can be completed without verbal guidance
* Home communicates available actions
* Pull results connect naturally to Vault ownership
* Squad construction is valid and understandable
* Battle outcomes are readable
* Rewards produce visible progression
* The player has an understandable next action
* The shell feels more cohesive
* No Phase 1 reliability guarantee has regressed

---

# Phase 3: Onboarding and progression

## Mission

Teach players how Imago Core works, clarify why progress matters, and create goals that support return play without punishing missed days.

This phase may design and prototype new systems.

Permanent economy and progression implementation still requires Sterling’s approval.

---

## Phase 3, Step 1: Define player competencies and the first three sessions

### Objective

Specify what a player should understand and accomplish over time.

### Work

Define learning milestones for:

### First five minutes

The player should understand:

* Who they are signed in as
* What Home is
* What Gold is
* What tickets are
* How to obtain or use a pull
* What a card is

### First session

The player should understand:

* Character
* Type
* Rarity
* Vault ownership
* Three-card squad
* Battle entry
* Basic rewards

### Second session

The player should understand:

* Energy
* Card level and XP
* Power
* Type advantage
* Daily availability
* Recent progress

### Third session

The player should understand:

* Collection goals
* Duplicate significance
* Squad improvement
* Longer-term progression
* What they personally want to pursue

### Questions to answer

* What knowledge is required before the first pull?
* What knowledge can wait?
* Which concepts are naturally learned through action?
* Which concepts require explanation?
* Does the game overload the player with all seven types too early?
* Should the player battle immediately?
* What should the player be excited about by the end of session one?

### What this accomplishes

It prevents onboarding from becoming a tour of every feature.

### Challenges

The builder’s instinct is to explain systems fully. Good onboarding teaches only what the next decision requires.

### Exit evidence

* Competency map
* Session-one objective
* Session-two objective
* Session-three objective
* Deferred-concept list

---

## Phase 3, Step 2: Design a persistent and resettable onboarding state

### Objective

Create onboarding that can be resumed, skipped, replayed, and tested.

### Work

Design:

* Per-player onboarding state
* Current step
* Completed steps
* Optional steps
* Skipped state
* Replay option
* Administrator reset
* Version number
* Migration behavior when onboarding changes
* Cross-device persistence
* Failure recovery

### Questions to answer

* Is onboarding state stored on the server or device?
* What happens when a player switches devices?
* Can a player resume after closing the app?
* Can Sterling reset Cydney’s onboarding for a test?
* Can onboarding be updated without trapping existing players?
* Can experienced players skip it?
* Can individual help prompts be replayed?
* Does onboarding state interfere with real account progress?

### What this accomplishes

It makes onboarding testable and maintainable rather than a one-time brittle overlay.

### Challenges

Local-only tutorial state is easy but unreliable across devices. Server-side state adds schema and migration work.

### Human input

Sterling should approve the data model and reset behavior before implementation.

### Exit evidence

* Onboarding-state contract
* Reset method
* Versioning design
* Approved persistence decision

---

## Phase 3, Step 3: Prototype the guided first-session path

### Objective

Guide the player through meaningful actions rather than passive explanation.

### Recommended first-session sequence

1. Sign in
2. See Home
3. Understand today’s free pull
4. Claim or use the pull
5. Reveal a card
6. Open the new card in Vault
7. Understand character, rarity, and type
8. Add or confirm a three-card squad
9. Start the first battle
10. Receive rewards
11. Return to Home
12. See a longer-term goal

### Instruction style

Prefer:

* Contextual prompts
* Highlighted action
* Short explanations
* Learning through action
* Optional detail
* Skip and replay
* Progressive disclosure

Avoid:

* Long opening text
* Ten-step modal tours
* Explaining systems before they matter
* Preventing all navigation
* Making the player memorize type charts
* Repeated congratulatory interruptions

### Questions to answer

* Is the first pull guaranteed or dependent on current resources?
* Does every new account begin with a valid battle squad?
* Can the tutorial fail because the user has no cards?
* Should the first battle use a curated encounter?
* Should the first reward guarantee a level-up?
* How much freedom should the player retain?
* Can onboarding recover if the player navigates elsewhere?

### What this accomplishes

It creates a playable introduction rather than an instruction manual.

### Challenges

Real existing accounts may not match first-user assumptions. The tutorial must handle established Vaults as well as fresh accounts.

### Human feedback

Cydney should perform the guided flow with no Sterling intervention.

Record every time she:

* Reads past a prompt without understanding
* Tries the wrong control
* Wants to leave
* Asks what a word means
* Predicts the next action incorrectly

### Exit evidence

* Interactive prototype
* Completed first-session script
* Recovery rules
* Casual-player test results

---

## Phase 3, Step 4: Audit terminology and level clarity

### Objective

Ensure players understand the game’s core language.

### Terms to test

* Gold
* Pull ticket
* Energy
* Card
* Character
* Type
* Rarity
* ATK
* DEF
* SPD
* Power
* Squad Power
* Level
* XP
* Duplicate
* Native rarity
* Current rarity
* MVP
* Daily victory
* Vault
* Library

### Work

For each term:

1. Identify where it first appears.
2. Identify whether it is explained.
3. Identify whether labels are consistent.
4. Determine whether the player needs the concept at that point.
5. Create concise contextual help.
6. Avoid duplicating full explanations on every screen.

Possible tools:

* Tap-to-explain terms
* Short info panels
* Contextual tooltip
* Help sheet
* Battle glossary
* Card detail explanation
* First-use prompt
* “Why?” links

### Questions to answer

* Does the player confuse Library cards with owned Vault cards?
* Does Power mean the same thing everywhere?
* Can the player distinguish ATK from total Power?
* Is rarity understood as collectible value rather than human worth?
* Does the player understand that type affects matchup?
* Does the player understand what level changes?
* Does a duplicate look like an error?
* Does the player know why Energy exists?

### What this accomplishes

It reduces hidden complexity without flattening strategy.

### Challenges

Definitions must remain brief. A glossary cannot rescue bad screen hierarchy.

### Human feedback

Ask Cydney to define each term in her own words after playing. Her incorrect explanations are more useful than asking whether the labels “make sense.”

### Exit evidence

* Terminology map
* Inconsistency fixes
* Contextual-help proposal
* Player comprehension results

---

## Phase 3, Step 5: Audit progression pacing and mathematical consequences

### Objective

Determine whether card growth is visible, attainable, and worth pursuing.

The current design uses:

* A hybrid XP curve
* Different maximum levels by rarity
* Full squad XP
* Configurable victory and defeat awards
* Greater long-term rarity power through growth and level caps rather than enormous Level 1 gaps.

### Work

Model:

* Battles needed for early levels
* Battles needed for middle levels
* Battles needed to max each rarity
* First-day progression
* First-week progression
* First-month progression
* Victory versus defeat progress
* First-daily-victory impact
* Relative value of leveling Common, Rare, Legendary, and Mythic cards
* Effects of Energy limits
* Effects of future missions
* Effects of casual missed days

Run simulations and create readable tables.

### Questions to answer

* How soon does a player see the first level-up?
* Is early progression fast enough to teach its value?
* Does a Mythic feel like a long-term project or an impossible grind?
* Can a favorite Common remain emotionally worthwhile?
* Does defeat still feel productive?
* Is first-daily-victory XP noticeable?
* Do level-ups change battle outcomes enough to matter?
* Does every squad member receiving full XP encourage or reduce experimentation?
* Is there a point where progress becomes invisible?

### What this accomplishes

It prevents progression from being designed by intuition alone.

### Challenges

Fast early progression can create later expectations. Slow early progression can make the system appear irrelevant.

### Human versus AI

AI and simulation should calculate pace.

Human testers should judge:

* Whether progress feels visible
* Whether the reward is exciting
* Whether the next level feels reachable
* Whether a favorite card feels worth investing in

### Exit evidence

* Progression simulation
* Current pace assessment
* Recommended values
* Explicit approval request for any numerical changes

---

## Phase 3, Step 6: Design the minimum viable goals and mission system

### Objective

Give players a reason to act today and a reason to return without creating punishment.

### Candidate goal families

#### Daily goals

Examples:

* Complete one pull
* View a newly pulled card
* Complete one battle
* Win one battle
* Adjust a squad
* Use a specific type
* Use a specific character
* Inspect progress

#### Weekly goals

Examples:

* Complete several battles
* Use multiple types
* Level a card
* Pull several cards
* Use different characters
* Complete a small collection objective

#### Evergreen goals

Examples:

* Own three cards of one character
* Collect a complete mini line
* Reach a card level
* Win with each type
* Build three different squads
* Complete a character milestone

### Design principles

* No lost streak progress
* No punishment for missed days
* No shame messaging
* No excessive daily checklist
* Progress should accumulate naturally
* Goals should introduce systems
* Rewards should not destabilize the economy
* A player should usually have something available
* Goals should support collecting favorites, not only optimal play

### Questions to answer

* How many daily goals are enough?
* Should all daily goals be completable in one normal session?
* Should one goal always be collection-focused?
* Should one goal always be battle-focused?
* What reward is meaningful without inflating the economy?
* Should missed weekly progress carry?
* Should goals rotate by player or globally?
* Can casual players ignore goals without falling permanently behind?
* Can goals encourage experimentation without forcing disliked cards?

### What this accomplishes

It begins transforming isolated actions into intentional play.

### Challenges

Missions can become chores. The best mission often rewards behavior players already enjoy while introducing one small variation.

### Human feedback

Give testers examples and ask:

* Which would you do naturally?
* Which feels like homework?
* Which would make you try something new?
* Which reward would matter?
* Which goal would you ignore?

### Exit evidence

* Compared mission models
* Recommended minimum system
* Reward implications
* Mockups or prototype
* Sterling approval before permanent implementation

---

## Phase 3, Step 7: Design unlocks without withholding the game

### Objective

Use progression to create anticipation without hiding essential features.

### Possible unlock candidates

* Advanced battle forecasts
* Additional squad presets
* Profile badges
* Card backs
* Vault display modes
* Character mastery views
* Line-completion tracking
* Cosmetic frames
* Additional challenge encounters
* Detailed statistics
* Optional advanced filters

### Features that should probably remain immediately available

* Pulling
* Vault
* Basic squad building
* First battle
* Core rewards
* Basic card details
* Essential resource information

### Questions to answer

* Which systems are overwhelming on first contact?
* Which systems become more satisfying when earned?
* Are unlocks functional or cosmetic?
* Does locking a feature make onboarding easier or merely frustrate?
* What level or milestone triggers the unlock?
* Can existing players be grandfathered correctly?
* Can the player preview what is coming?
* Are unlock conditions understandable?
* Do unlocks create new goals without creating grind?

### What this accomplishes

It creates forward anticipation while protecting the core fantasy.

### Challenges

Locking existing features may feel like regression to current testers. Prototype before removing immediate access.

### Human feedback

Ask Cydney which features felt premature.

Ask Sterling which systems require early access for strategy.

### Exit evidence

* Unlock-candidate list
* Keep-open list
* Proposed unlock order
* Backward-compatibility plan
* Approval decisions

---

## Phase 3, Step 8: Resolve the emotional problem of duplicates

### Objective

Ensure duplicate pulls contribute to progress rather than feeling wasted.

The design already proposes a hierarchy involving exact duplicates, same-character shards, and universal dust, but the permanent implementation remains open.

### Work

Compare models such as:

* Exact duplicates as upgrade material
* Same-character shards
* Universal dust
* Duplicate-based evolution
* Copy merging
* Limit break
* Cosmetic refinement
* Duplicate collection milestones
* Choice between preserving and converting copies

For each model, specify:

* Player explanation
* Data requirements
* Economy implications
* Reversibility
* Special-copy protection
* Locked or favorited behavior
* User-interface requirements
* Effect on pull excitement

### Questions to answer

* Should duplicates convert automatically?
* Should players choose which copy to keep?
* How are special copies protected?
* Can exact duplicates remain more valuable than general material?
* Does duplicate use make lower-rarity cards worthwhile?
* Does the system pressure players to destroy cards they like?
* How many duplicates are needed before a meaningful upgrade?
* Can the system be understood without a tutorial lecture?
* Does a duplicate still feel like a disappointing reveal?

### What this accomplishes

It gives repeated pulls long-term value and supports collection progression.

### Challenges

Duplicate systems can become one of the game’s largest economies. Do not implement exchange rates casually.

### Human feedback

Show testers several duplicate outcomes and ask which one feels:

* Fairest
* Most understandable
* Most exciting
* Least wasteful
* Least manipulative

### Exit evidence

* Model comparison
* Recommended system
* Data and interface requirements
* Economy simulation
* Sterling approval decision

---

## Phase 3, Step 9: Design character and line progression

### Objective

Support Imago Core’s strongest identity: collecting particular versions of people the player cares about.

Potential systems include:

* Character mastery
* Character collection badges
* Character-specific milestones
* Line-completion tracking
* Profile titles
* Card backs
* Vault frames
* Small cosmetic rewards
* Carefully controlled material rewards

### Questions to answer

* Does collecting three, five, or seven cards of one character feel meaningful?
* Should mastery come from ownership, battle use, or both?
* Does using multiple versions of the same character create interesting goals?
* How should partial card lines be displayed?
* Should a completed line grant a cosmetic or functional reward?
* Can a favorite-character player progress without using the strongest cards?
* Do rewards encourage identity-based collection rather than pure rarity chasing?
* How are future lines added without rewriting the system?

### What this accomplishes

It turns the game’s character-collection thesis into actual progression rather than leaving it as branding alone.

### Challenges

Functional bonuses can create pressure to collect specific people. Cosmetics and recognition may better preserve freedom.

### Human feedback

Ask each tester:

* Which character would you intentionally collect?
* Would a badge matter?
* Would a card back matter?
* Would you use weaker cards to earn character mastery?
* Does line completion feel satisfying?

### Exit evidence

* Character-progression proposal
* Line-progression proposal
* Reward categories
* Prototype screens
* Approved implementation scope

---

## Phase 3, Step 10: Build a gentle return loop

### Objective

Make returning feel rewarding without punishing absence.

### Approved philosophy

Hybrid retention leaning gentle:

* Daily opportunities
* No broken streak shame
* No major penalty for missed days
* Evergreen goals remain available
* Players can return after absence without feeling permanently behind
* There should usually be something meaningful to do

### Potential components

* Daily free pull
* First daily victory
* Daily goals
* Weekly cumulative goals
* Unclaimed-goal grace period
* Welcome-back summary
* Recent changes summary
* Small catch-up objective
* Evergreen collection goals
* Rotating encounter
* Optional practice activity
* No-stakes Vault management

### Questions to answer

* What changes at Mountain Time midnight?
* Does missing one day destroy anything?
* Does the player see what is available today?
* Is there an activity after Energy is spent?
* Can a returning player understand what changed?
* Should goals accumulate for a short grace period?
* Is a welcome-back reward useful or exploitable?
* Can the loop work without push notifications?
* What behavior indicates genuine interest rather than compliance?

### What this accomplishes

It creates healthy reasons to return.

### Challenges

With only three testers, return behavior is qualitative. Do not claim product-market proof from a handful of sessions.

### Human feedback

Track whether testers reopen the app without being reminded.

That voluntary behavior is more meaningful than asking whether they “would theoretically play again.”

### Exit evidence

* Return-loop design
* Daily and weekly reset rules
* No-punishment policy
* Telemetry measures
* Approved prototype

---

## Phase 3, Step 11: Conduct unguided onboarding and retention testing

### Objective

Determine whether the new-player and progression concepts work outside the designer’s head.

### Test preparation

Provide:

* Resettable onboarding state
* Known account starting condition
* Recorded starting resources
* Recorded Vault state
* Screen recording where permitted
* Telemetry enabled
* No verbal coaching

### Cydney test

Ask Cydney to:

* Enter the game
* Complete what she believes the game wants
* Explain her decisions aloud
* Stop when she feels the session is complete

Do not tell her:

* Which route to choose
* What Power means
* Which cards to select
* Which reward she should value
* What feature comes next

### Ashley test

When available:

* Use either a reset onboarding state or a cold-return flow.
* Observe what she remembers.
* Observe whether Home reorients her.
* Observe whether she understands goals after absence.

### Sterling test

Sterling should:

* Attempt to skip onboarding
* Replay onboarding
* Reset onboarding
* Break progression states
* Complete steps out of order
* Test established accounts
* Test advanced comprehension
* Review whether proposed systems fit the product vision

### Post-test questions

1. What did you think the game was about?
2. What did you think you were trying to accomplish?
3. Which card mattered most to you?
4. What did level or XP mean to you?
5. What would you work toward next?
6. Was anything explained too early?
7. Was anything never explained?
8. Would you return tomorrow?
9. What would make you excited to return?
10. What felt like a chore?

### Exit gate

Phase 3 may close when:

* A player can complete the first meaningful session without coaching
* Core terms are understood well enough for decisions
* Early progression is visible
* Longer-term goals are identifiable
* The retention design does not punish missed days
* Proposed new systems have explicit approval status
* Telemetry shows where onboarding succeeds or fails
* Existing production functionality remains intact

---

# 4. Cross-phase quality gates

No phase should be merged merely because its planned tasks were completed.

A phase is ready only when:

## Reliability

* Automated tests pass
* Production build passes
* Relevant simulations pass
* No unexplained resource mutation remains
* No wrong-user mutation remains
* Preview behavior is verified
* Recovery behavior is documented

## Playability

* A tester can complete the intended flow
* Primary actions are visible
* Important state changes are apparent
* Errors are recoverable
* Mobile controls are usable
* Navigation does not trap the player

## Comprehension

* Cydney can explain what she did
* Core resources are distinguishable
* Rewards are understood
* The player can identify a next action
* Strategic information does not overwhelm casual play

## Interest

* Pulls produce curiosity
* Cards feel owned
* Squads feel consequential
* Battles feel readable
* Rewards feel connected to growth
* Goals create interest rather than obligation
* At least one tester voluntarily returns without being prompted

## Product cohesion

* Screens share consistent states and hierarchy
* Visual improvements support function
* No test-harness language remains on player surfaces
* New systems connect to existing systems
* No feature exists solely to create the appearance of progress

---

# 5. Approval package required at the end of each phase

Present Sterling with:

## 5.1 Executive summary

* What was tested
* What was learned
* What changed
* What remains risky
* What human testers said
* Whether the phase should merge

## 5.2 Findings

Group by:

* Reliability
* Playability
* Clarity
* Visual cohesion
* Interest
* Economy
* Progression
* Technical debt

## 5.3 Human evidence

Keep separate:

* Sterling feedback
* Cydney feedback
* Ashley feedback
* Telemetry
* AI/code audit findings

Do not merge the voices into one generic conclusion.

## 5.4 Changes

For each change:

* Problem
* Evidence
* Implementation
* Risk
* Test coverage
* Preview result

## 5.5 Decisions required

Clearly identify:

* Economy values
* Progression values
* New feature scope
* Deferred items
* Rejected options
* Data changes
* Merge approval

## 5.6 Status report

Include:

* Approximate phase completion percentage
* Current branch
* Current commit
* Preview URL
* Automated results
* Human testing complete or pending
* Blockers
* Recommended next action

---

# 6. Final program deliverables

At the conclusion of all three phases, the repository should contain or reference:

1. This canonical roadmap
2. Release-hardening report
3. Route and API regression matrix
4. Economy transaction audit
5. Telemetry event dictionary
6. Telemetry privacy and retention rules
7. Daily-loop journey map
8. Human playtest scripts
9. Human feedback records
10. Onboarding competency map
11. Progression simulation
12. Mission and goal proposals
13. Duplicate-system proposal
14. Character and line progression proposal
15. Retention philosophy and reset rules
16. Approved implementation decisions
17. Remaining technical debt
18. Final merge and production verification reports

---

# 7. Explicit non-goals

Do not use these phases as justification for:

* Framework migration
* Complete application rewrite
* Large database redesign
* Destructive `pow` to `atk` migration
* New PvP mode
* Major ability system
* Large-scale content expansion
* Final logo and total brand campaign
* Full cosmetic skinning of every route
* Premature Android optimization beyond available testing
* Manipulative streak mechanics
* New currencies without demonstrated need
* Replacing stable systems merely because they are not elegant

The current architecture documentation explicitly recommends preserving the working structure and extracting domains only in a deliberate order rather than performing an incidental rewrite.

---

# 8. Final instruction to the receiving thread

Begin by reading:

* `docs/game-design.md`
* `docs/battle-design.md`
* `docs/developer-guide.md`
* `docs/architecture.md`
* `docs/route-map.md`
* `docs/technical-debt.md`
* `docs/brand.md`
* `docs/backend-contracts.md`
* `docs/card-mechanics-contract.md`
* `docs/card-frame-design.md`

Then:

1. Create `docs/quality-playability-roadmap.md` on a dedicated documentation branch using this document.
2. Verify the roadmap against current code and documentation.
3. Do not compress away detail.
4. Present any conflict or outdated assumption to Sterling.
5. Merge the roadmap only after approval.
6. Start Phase 1 from the latest `main`.
7. Keep the roadmap updated as a living record.
8. Distinguish audits, proposals, approvals, implementation, and verification.
9. Use preview branches for all implementation.
10. Do not merge a phase until Sterling approves it.
11. Do not begin the next phase until the previous phase’s production deployment has been verified.
12. Report progress, branch, commit, test state, and remaining risks whenever pausing for a decision.

The standard is not “more features were added.”

The standard is:

> Imago Core is more trustworthy, more understandable, more cohesive, and more exciting to play than it was before the phase began.
