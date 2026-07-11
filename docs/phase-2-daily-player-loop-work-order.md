# Imago Core Phase 2 Daily Player Loop Work Order

## Provisional Work-mode execution contract

### Repository

`Valithron/commune-tcg`

### Production branch

`main`

### Governing roadmap

`docs/quality-playability-roadmap.md`

### Phase 1 execution contract

`docs/phase-1-release-hardening-work-order.md`

### Work-order path

`docs/phase-2-daily-player-loop-work-order.md`

### Intended execution branch

`phase/daily-player-loop`

### Product owner

Sterling Knight-Pinneo

### Draft status

This work order is intentionally provisional until Phase 1 Release Hardening is complete, merged, and reconciled into this document.

---

# 1. Purpose and authority

This document is the direct execution order for Phase 2 of the Imago Core Quality, Playability, and Interest Roadmap.

The receiving Work-mode thread must execute **Phase 2: Daily Player Loop only**.

The purpose of Phase 2 is to make the existing Imago Core sequence feel like one coherent game:

1. Arrive.
2. Understand today’s opportunity.
3. Pull or acquire resources.
4. Inspect what changed.
5. Adjust or confirm a squad.
6. Battle.
7. Receive rewards.
8. Understand what to do next.

Phase 2 should reduce the feeling that Imago Core is a collection of test tools and patched screens. It should create functional cohesion across the existing loop without pretending that final onboarding, progression, missions, or long-term retention systems are already designed.

The governing source remains:

`docs/quality-playability-roadmap.md`

This work order narrows the roadmap into a bounded operational contract. It does not replace Phase 1 reliability guarantees, canonical game design, battle design, brand rules, or explicit Sterling approvals.

The mission is:

> Turn the current stable product foundation into a clear, satisfying, connected daily session while preserving every Phase 1 reliability, ownership, economy, recovery, and telemetry guarantee.

Phase 2 is not a full application redesign. It is not a permission slip for broad refactoring. It is not Phase 3 onboarding or progression. It is a measured sequence of journey analysis, design choices, controlled implementation, and human playtesting.

---

# 2. Mandatory dependency on Phase 1

## 2.1 Phase 2 may not begin from the pre-Phase-1 baseline

The Phase 2 implementation branch must not be created until:

1. Phase 1 has completed its final report.
2. Phase 1 has received a GO or an explicitly accepted CONDITIONAL GO.
3. The approved Phase 1 implementation pull request has been merged to `main`.
4. Production and `main` are confirmed to be in the expected state.
5. The Phase 2 work order has been reconciled against Phase 1 findings.
6. Sterling has authorized Phase 2 to begin.

The same Work-mode conversation may continue from Phase 1 into Phase 2, but it must treat Phase 2 as a new execution stage with a new branch, new draft pull request, new baseline, and new approval gates.

## 2.2 Required Phase 1 reconciliation

Before creating `phase/daily-player-loop`, Work mode must read:

* The Phase 1 final report
* The Phase 1 defect and friction ledger
* The Phase 1 route and API matrix
* The Phase 1 ownership and economy audits
* The Phase 1 failure and recovery matrix
* The Phase 1 human-test results
* The approved telemetry event dictionary
* The final Phase 1 pull request and merge commit
* Any canonical documents updated during Phase 1

Work mode must create:

`docs/daily-loop/phase-1-readiness-review.md`

That file must state:

* Phase 1 merge commit
* Production commit at Phase 2 start
* Remaining accepted debt
* Remaining P1 and P2 defects relevant to Phase 2
* Routes or APIs that changed during Phase 1
* Economy behavior that changed during Phase 1
* Energy behavior after the Phase 1 fix
* Telemetry events available for Phase 2
* Recovery guarantees that Phase 2 must preserve
* Human-testing findings that alter Phase 2 priorities
* Any sections of this work order that need amendment

Do not silently carry forward assumptions that Phase 1 disproved.

## 2.3 Stop condition

Do not begin Phase 2 implementation when Phase 1 ends in NO-GO.

Do not begin Phase 2 implementation when a remaining Phase 1 risk makes daily-loop changes unsafe, including:

* Wrong-user mutation
* Duplicate charging
* Duplicate settlement
* Unresolved authentication bypass
* Uncontrolled preview writes to production
* Unrecoverable pull or battle state
* Unknown production baseline
* Telemetry that blocks gameplay
* Energy accounting that remains inconsistent

Record the blocker and return to Phase 1 remediation.

---

# 3. Required starting behavior

After the Phase 1 start gate is satisfied, the receiving Work-mode thread must begin Phase 2 without asking Sterling to restate repository context already present in the documents.

Do not pause for approval before:

* Reading the required references
* Creating the Phase 1 readiness review
* Recording the new baseline
* Creating `phase/daily-player-loop`
* Opening an initial draft pull request
* Building journey and screen inventories
* Reading Phase 1 telemetry
* Running non-destructive automated checks
* Running baseline timing and click-count observations
* Producing design audits and alternatives
* Correcting verified documentation errors
* Adding narrow regression tests
* Implementing clearly low-risk UI-state and navigation fixes
* Building prototypes that do not alter production data or economy values

Pause only when a defined approval gate is reached.

When requesting a decision, report:

* Current branch
* Current commit
* Approximate Phase 2 completion percentage
* What has been measured or verified
* The exact decision required
* Two or three realistic options
* Consequences of each option
* Recommended choice
* Whether safe work can continue elsewhere

Do not ask broad questions when this work order already defines the process.

---

# 4. Required reading before changes

Read these files from the latest post-Phase-1 `main`:

1. `docs/quality-playability-roadmap.md`
2. `docs/phase-1-release-hardening-work-order.md`
3. `docs/release-hardening/phase-1-final-report.md`
4. `docs/release-hardening/defect-friction-ledger.md`
5. `docs/release-hardening/human-test-results.md`
6. `docs/release-hardening/telemetry-event-dictionary.md`
7. `docs/release-hardening/telemetry-privacy-retention.md`
8. `docs/game-design.md`
9. `docs/battle-design.md`
10. `docs/brand.md`
11. `docs/card-frame-design.md`
12. `docs/architecture.md`
13. `docs/developer-guide.md`
14. `docs/route-map.md`
15. `docs/technical-debt.md`
16. `package.json`
17. `src/main.js`
18. `src/routes/Home.js`
19. `src/routes/Pull.js`
20. `src/routes/PullConfirm.js`
21. `src/routes/PullReveal.js`
22. `src/routes/PullResults.js`
23. `src/routes/PullHistory.js`
24. `src/routes/Vault.js`
25. `src/routes/VaultCardDetail.js`
26. `src/routes/BattleHub.js`
27. `src/routes/EncounterSelect.js`
28. `src/routes/SquadBuilder.js`
29. `src/routes/BattleArena.js`
30. `src/routes/BattleResults.js`
31. Shared shell, navigation, top-bar, card-rendering, filter, modal, feedback, and responsive utilities
32. Pull, resource, Vault, squad, battle, reward, and telemetry handlers
33. Existing tests for the complete daily loop
34. Recent commits and merged pull requests relevant to Phase 1

Also inspect the current production deployment and preview-binding behavior established by Phase 1.

## 4.1 Source interpretation rule

Use this hierarchy:

* Current code proves current behavior.
* Canonical design documents define intended product behavior.
* The roadmap and this work order define Phase 2 process and scope.
* The Phase 1 final report defines the reliability baseline.
* Explicit Sterling approvals resolve product decisions.
* Human tests and telemetry provide evidence, not automatic authority.
* Historical documents and screenshots are context, not current truth.

When evidence conflicts, record the conflict and classify it before changing behavior.

---

# 5. Baseline and branch rules

## 5.1 Establish the exact starting point

Before editing application code:

1. Fetch the latest `main`.
2. Record its full commit SHA.
3. Confirm the Phase 1 merge is present.
4. Confirm the Phase 2 work order is present.
5. Determine the production deployment SHA.
6. Record whether production and `main` match.
7. Record any deployment lag.
8. Create `phase/daily-player-loop` from the exact latest `main`.
9. Open a draft pull request to `main`.
10. Link the Phase 1 final report and Phase 2 work order in the PR body.
11. Run the baseline automated gate.
12. Capture the current daily journey before changing it.

Do not create the Phase 2 branch from:

* `Gacha`
* `phase/release-hardening`
* A stale local checkout
* The documentation drafting branch
* An unmerged Phase 1 commit
* A remembered commit

## 5.2 No direct work on `main`

Do not commit directly to `main`.

Do not merge the Phase 2 pull request without Sterling’s explicit approval.

Do not force-push shared history unless recovery from a verified mistake requires it and Sterling approves.

## 5.3 Commit discipline

Use coherent commits such as:

* Phase 1 readiness and journey baseline
* Home hierarchy
* Pull journey
* Vault ownership flow
* Squad and battle readiness
* Battle readability
* Reward feedback
* Optional-activity prototype
* Shared interaction states
* Integrated testing evidence
* Final Phase 2 report

Avoid a single commit that combines every screen, economy change, animation change, and test artifact.

## 5.4 Scope splitting

Split implementation into narrower pull requests when review safety requires it, but maintain:

* One canonical Phase 2 branch or integration branch
* One canonical daily-loop evidence set
* One final Phase 2 report
* One explicit final merge decision

Do not split the work in a way that hides end-to-end regressions.

---

# 6. Phase 2 experience targets

Phase 2 should optimize the existing daily session toward these targets.

## 6.1 Session shape

A normal daily session should generally take about 5 to 10 minutes, with optional longer play.

The expected loop is:

1. Home shows what is available.
2. The player claims or uses a pull opportunity.
3. The player understands the pulled card.
4. The player can locate the card in the Vault.
5. The player confirms or changes a valid three-card squad.
6. The player completes a battle.
7. The player understands rewards and progress.
8. The player sees a sensible next action.

## 6.2 Casual clarity

A casual player should be able to:

* Identify the primary action on Home
* Understand whether a pull is available
* Understand whether Energy is available
* Complete a pull
* Recognize character, rarity, and type
* Find the newly pulled card
* Build or confirm a valid squad
* Start a battle
* Understand the broad battle outcome
* Understand what was earned
* Know what to do next

This must be possible without Sterling coaching the player through the interface.

## 6.3 Strategic usefulness

A more strategic player should retain access to:

* ATK, DEF, SPD, and Power
* Type matchups
* Lane order
* Forecasts
* Card level and XP
* Squad persistence
* Battle speed and logs
* Card inspection
* Reward details
* Vault filters and sorting

Casual simplification must not reduce strategy to decoration.

## 6.4 Product feel

The product should feel:

* Connected
* Responsive
* Clear
* Premium
* Collectible
* Character-focused
* Tactile
* Calm rather than casino-like
* Rewarding without manipulative urgency

---

# 7. Hard scope boundary

## 7.1 In scope

Phase 2 includes:

* Phase 1 readiness reconciliation
* Current daily-journey mapping
* Telemetry baseline analysis
* Home hierarchy and daily-action clarity
* Pull journey cohesion
* Pull-to-Vault ownership continuity
* Vault discovery of newly acquired cards
* Squad and battle-readiness clarity
* Battle readability and pacing
* Reward comprehension
* Immediate visible progression
* Next-action clarity
* Comparison of minimal optional activities
* One approved minimal optional activity or prototype, when separately approved
* Shared loading, disabled, pressed, success, error, and empty states
* Mobile hierarchy and touch feedback
* Shared visual and tactile cohesion
* Integrated daily-loop testing
* Regression protection for Phase 1 guarantees
* Documentation reconciliation
* Final Phase 2 merge recommendation

## 7.2 Explicitly out of scope

Do not use Phase 2 to implement:

* Phase 3 onboarding
* Tutorial state
* New-account guided flows
* Mission systems without separate approval
* Quest systems without separate approval
* Streaks
* Missed-day penalties
* New currencies
* Duplicate conversion economy
* Shard economy
* Evolution
* Character mastery
* Line-completion reward systems
* Deep collection achievements
* PvP
* Trading
* Card abilities
* Equipment
* Deep status systems
* Physical or Mystic damage categories
* Large encounter expansion
* Final progression curves
* Large database redesign
* Destructive migrations
* Full application rewrite
* Framework migration
* Broad `app.js` decomposition
* Total visual reskin
* New brand direction
* Broad repository formatting
* Large accessibility rewrite unrelated to the daily loop
* Phase 3 implementation

Findings may be recorded for later phases. They may not be smuggled into Phase 2.

---

# 8. Permissions and approval gates

## 8.1 Work that may proceed without per-item approval

Work mode may implement the following on the Phase 2 branch when supported by evidence:

* Correct broken route links
* Correct stale labels
* Remove visible test-harness language
* Improve loading states
* Improve disabled states
* Improve pressed and active states
* Improve completed-state clarity
* Improve safe success and error feedback
* Fix obvious mobile spacing defects
* Fix touch-target defects
* Fix scroll-restoration defects
* Fix safe-area defects
* Fix minor visual collisions
* Improve direct navigation between existing routes
* Add a safe “View in Vault” link after pull results
* Add a recently acquired sort or filter using existing data
* Improve duplicate-count explanation without changing duplicate economics
* Improve card-detail hierarchy using existing fields
* Improve Home display using already available resources and state
* Improve squad save confirmation
* Improve invalid-squad messaging
* Improve next-action links after battle results
* Add narrow telemetry events consistent with the approved Phase 1 schema and privacy rules
* Add regression tests
* Consolidate genuinely shared interaction-state styling when the change is narrow and reviewable
* Correct verified documentation errors
* Remove duplicate event listeners
* Add missing null guards
* Fix deterministic playback presentation defects that do not change combat rules

Every implementation must still be tested, previewed, recorded, and included in the final approval package.

## 8.2 Design checkpoint required before broad Home implementation

Work mode may audit Home, create alternatives, and build non-production prototypes without approval.

Before implementing a major Home hierarchy change, present:

* Current Home problems
* Telemetry and human evidence
* Proposed daily-action hierarchy
* Primary and secondary actions
* Resource presentation
* Current-squad treatment
* Recent-progress treatment
* Mobile and desktop mockups or prototypes
* Information removed or demoted
* Risks
* Recommended option

Sterling must approve the direction before a broad Home restructuring is implemented.

Small corrections to labels, state display, spacing, and broken actions do not require this checkpoint.

## 8.3 Pull-presentation approval gate

Pause before materially changing:

* Reveal duration
* Multi-reveal order
* Skip behavior
* Confirmation structure
* Rarity staging
* Sound strategy
* Major animation
* Pull Again behavior beyond bug fixes
* Casino-like visual language
* Duplicate celebration or consolation treatment

Present measured baseline timing, repetition concerns, casual feedback, and a recommended pacing package.

## 8.4 Economy and progression approval gate

Pause before changing:

* Pull odds
* Pull costs
* Gold costs
* Gold rewards
* Ticket rewards
* Energy costs
* Energy cap
* Energy regeneration
* Purchasable Energy
* Battle XP
* First-win XP
* Defeat XP
* Level curves
* Card stat growth
* Reward settlement
* Surrender rewards
* MVP rewards
* New reward types
* Free reward frequency
* Duplicate value

Phase 2 may improve how existing rewards are displayed without changing their values.

## 8.5 Optional-activity approval gate

The “always something to do” package is evidence and comparison first.

Work mode must not implement a new permanent activity until Sterling approves:

* The selected concept
* Reward or no-reward status
* Economy implications
* Data requirements
* UI placement
* Repeatability
* Abuse prevention
* Scope

No-cost practice or collection-oriented concepts should be preferred over new reward-generating systems when evidence is otherwise equal.

## 8.6 Battle-rule approval gate

Pause before changing:

* Damage formulas
* Type modifiers
* Targeting
* Turn order
* Crit rules
* Double-Strike rules
* Reinforcement rules
* Forecast math
* Encounter difficulty
* Enemy stats
* Battle rewards
* Battle Energy costs
* Victory or defeat settlement
* Surrender behavior

Phase 2 may change battle presentation and pacing only when the authoritative stored result remains unchanged.

## 8.7 Data and schema approval gate

Pause before:

* Adding persistent player-state tables
* Adding new currency columns
* Changing ownership identifiers
* Destructive migrations
* Backfilling player data broadly
* Wiping accounts
* Creating new permanent progression state
* Changing telemetry retention or privacy rules

Additive fields that support an approved Phase 2 feature still require a documented migration and rollback plan.

## 8.8 Immediate stop and notification conditions

Notify Sterling immediately when any of these are verified:

* A Phase 1 reliability guarantee regressed
* Wrong-user data is displayed or mutated
* Duplicate charging
* Duplicate reward settlement
* Pull or battle results become unrecoverable
* Energy accounting becomes inconsistent
* Preview writes unexpectedly reach production
* Production becomes unavailable
* A migration cannot be safely reversed
* A new loop design hides or misstates resource costs
* Telemetry captures prohibited data
* Human testing reveals a core loop blocker

Stop the dangerous path, preserve evidence, and continue unrelated safe work where practical.

---

# 9. Required repository artifacts

Create and maintain these Phase 2 artifacts.

Recommended directory:

`docs/daily-loop/`

Required files:

1. `phase-1-readiness-review.md`
2. `current-journey-baseline.md`
3. `daily-loop-metrics.md`
4. `home-command-center.md`
5. `pull-journey-audit.md`
6. `vault-ownership-flow.md`
7. `squad-battle-readiness.md`
8. `battle-readability-pacing.md`
9. `rewards-progression-feedback.md`
10. `optional-activity-concept-comparison.md`
11. `visual-tactile-cohesion.md`
12. `defect-friction-ledger.md`
13. `integrated-test-plan.md`
14. `integrated-test-results.md`
15. `phase-2-final-report.md`

Also update:

* `docs/quality-playability-roadmap.md` with Phase 2 status and links
* Canonical documents whose verified inaccuracies are corrected
* `docs/technical-debt.md` when debt is created, closed, or reclassified
* Route documentation when navigation changes
* Brand or component documentation when a shared approved pattern changes

Do not claim human testing or product improvement without recorded evidence.

---

# 10. Required automated and evidence gates

At minimum, run from a clean install state:

```bash
npm ci
npm test
npm run build
npm run battle:simulate -- --iterations=1000
git diff --check
```

Run the full gate:

1. At Phase 2 baseline
2. After route or shared-shell changes
3. After pull-flow changes
4. After battle or reward presentation changes
5. Before human preview testing
6. Before final merge recommendation

Also add focused tests for changed behavior, including:

* Home state rendering
* Daily pull availability
* Energy display
* Pull navigation
* Reveal recovery
* Pull Again
* New-card Vault discovery
* Recently acquired sorting
* Duplicate grouping
* Squad persistence
* Invalid squad state
* Battle-result navigation
* Reward display
* Skip behavior
* Scroll restoration
* Loading and disabled states
* Telemetry event uniqueness

For every command, record:

* Command
* Commit SHA
* Environment
* Start and finish time
* Result
* Relevant output
* Failure classification
* Follow-up action

Separate baseline failures from Phase 2 regressions.

---

# 11. Execution plan

## Work Package 0: Reconcile Phase 1 and initialize Phase 2

### Objective

Start Phase 2 from the verified hardened product rather than the earlier roadmap snapshot.

### Actions

1. Read the complete Phase 1 package.
2. Create `phase-1-readiness-review.md`.
3. Identify Phase 2 assumptions changed by Phase 1.
4. Update this work order on the execution branch when necessary.
5. Confirm latest `main`.
6. Confirm production deployment.
7. Create `phase/daily-player-loop`.
8. Open a draft pull request.
9. Run the automated baseline.
10. Record rollback and preview behavior.

### Required evidence

* Phase 1 merge SHA
* Phase 2 starting SHA
* Production SHA
* Draft PR
* Accepted Phase 1 debt
* Phase 2 constraint changes
* Baseline command results
* Preview data-binding status

### Exit condition

The Phase 2 branch is rooted in the approved Phase 1 result, and every inherited risk is explicit.

---

## Work Package 1: Map the current daily journey

### Objective

Measure the current loop before changing it.

### Actions

For Sterling, Cydney, and Ashley when available, record:

* Entry route
* First selected action
* Number of clicks to pull
* Number of clicks to battle
* Time to first meaningful action
* Time to first reward
* Time to complete a session
* Routes visited
* Routes abandoned
* Errors
* Repeated actions
* Confusion
* Final action
* Whether the next action was apparent

Create a journey map using at least:

| Stage | Player goal | Current route | Required knowledge | Friction | Emotional result | Opportunity |
| --- | --- | --- | --- | --- | --- | --- |

Use telemetry to distinguish:

* Route view
* Action attempt
* Action completion
* Abandonment
* Error
* Retry
* Session end

### Questions to answer

* Does Home clearly present today’s priorities?
* Can a player complete the loop in 5 to 10 minutes?
* Where does the loop fracture?
* Which screen assumes hidden knowledge?
* Which action creates the strongest response?
* Which action feels administrative?
* Does the session end naturally?
* Is another action apparent?
* Is optional longer play available?
* Does Energy exhaustion make the app feel finished?

### Human weighting

Sterling’s familiarity makes him useful for efficiency and edge cases.

Cydney’s unguided path carries more weight for discoverability.

Ashley’s returning-player path carries more weight for remembered context.

### Exit condition

The current journey is timed, mapped, and ranked before any major redesign is approved.

---

## Work Package 2: Rebuild Home as the daily command center

### Objective

Make Home immediately answer:

* What is available?
* What should I do?
* What changed?
* What is my next meaningful action?

### Audit

Review:

* Signed-in identity
* Featured or strongest card
* Daily pull state
* Ticket state
* Gold
* Energy and recharge
* Battle availability
* Current squad
* Recent rewards
* Recent pull
* Card progress
* Disabled actions
* Notifications
* Navigation hierarchy
* Mobile composition
* Empty and completed states

### Design requirements

Home should generally provide:

* One clear primary action
* One meaningful secondary action
* Available versus completed daily state
* Understandable resource state
* Current squad readiness
* Recent progress or acquisition
* A next-action message
* Clear loading and error behavior
* A useful state when the daily claim is already used
* A useful state when Energy is empty

Do not place every system on Home.

### Prototype alternatives

Create at least two realistic hierarchy options.

For each option, document:

* Primary action
* Secondary action
* Resource prominence
* Featured-card role
* Squad visibility
* Recent-progress treatment
* Completed-day treatment
* Mobile order
* Desktop order
* Accessibility
* Information removed or deferred

### Approval checkpoint

Present the evidence and recommended Home direction to Sterling before broad implementation.

### Exit condition

Home produces a clear first action, accurately reflects availability, and does not become a dense dashboard.

---

## Work Package 3: Audit and strengthen the pull journey

### Objective

Make acquiring a card reliable, understandable, repeatable, and emotionally worthwhile without becoming casino-like.

### Actions

Audit the full chain:

1. Ticket availability
2. Daily claim or purchase
3. Pull selection
4. Confirmation
5. Resource deduction
6. Reveal
7. Multi-reveal pacing
8. Skip
9. Results
10. Pull Again
11. History
12. Vault follow-through

Measure:

* Time from action to first reveal
* Time for one-card reveal
* Time for five-card reveal
* Time with and without skip
* Repeated-session fatigue
* Loading delays
* Failure recovery
* Rarity recognition
* Character recognition
* Type recognition
* Duplicate comprehension
* Resource comprehension
* Pull Again reliability

### Required behavior

* Cost is visible before commitment.
* Free and paid states are distinct.
* Resource deduction remains server-authoritative.
* A Common remains a real collectible.
* A duplicate is clearly explained.
* Skip never changes the result.
* Refresh never changes the result.
* Pull Again cannot freeze.
* Results connect directly to ownership.
* The language remains premium and collectible, not casino-like.

### Approval checkpoint

Present material timing, staging, and animation changes before implementation.

### Exit condition

A player can complete and repeat a pull safely, understand what was acquired, and continue naturally to the Vault.

---

## Work Package 4: Connect pulls to Vault ownership

### Objective

Make a newly pulled card feel acquired, placed, and worth inspecting.

### Actions

Audit:

* Post-pull Vault navigation
* Recently pulled sorting
* “New” state
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
* Acquisition timestamp
* Collection completion context
* Favorite or lock concepts
* Mobile card detail

Implement or prototype, when supported:

* Direct “View in Vault”
* Recently acquired sort or filter
* Clear duplicate count
* Acquisition timestamp
* Strong ownership language
* Better detail hierarchy
* Line or character context using existing data
* Safe “new” treatment that does not require fragile local-only state

Do not implement favorite, lock, mastery, or collection-reward systems merely because the UI references them.

### Questions to answer

* Can the player find the card they just pulled?
* Does the Vault feel like a trophy room?
* Can a casual player understand duplicates?
* Can the player tell why copies differ?
* Is the newest card visible without search?
* Does detail explain why the card matters?
* Can strategic players find useful copies?

### Exit condition

The player can reliably locate and understand the newest acquisition, and the reveal consequence persists beyond the results screen.

---

## Work Package 5: Improve squad creation and battle readiness

### Objective

Make squad construction understandable to casual players and meaningful to strategic players.

### Actions

Audit:

* Entry into squad builder
* Available cards
* Selected cards
* Exactly-three requirement
* Lane order
* Power
* ATK, DEF, and SPD
* Type matchups
* Forecasts
* Enemy presentation
* Save state
* Invalid squad state
* Stale card state
* Returning to battle
* Mobile tap, drag, and reorder behavior
* Duplicate and leveled-card handling

### Requirements

* The player knows that three cards are required.
* Lane order is visible.
* Saving is confirmed.
* Invalid state is actionable.
* A stale or ineligible card cannot silently remain.
* Casual players can form a valid squad without memorizing a chart.
* Strategic players can inspect useful detail.
* Forecast language is understandable.
* Power remains distinct from temporary matchup estimates.
* The route back to encounter start is clear.

### Recommended-squad boundary

Do not implement a new recommendation algorithm without approval.

A simple deterministic helper based on already approved rules may be proposed, but must include:

* Inputs
* Tie handling
* Type behavior
* Level behavior
* Duplicate behavior
* Explanation shown to players
* Risk of making strategy feel pointless

### Exit condition

Cydney can create or confirm a valid squad without coaching, and Sterling can still make meaningful optimizations.

---

## Work Package 6: Evaluate battle readability, pacing, and control

### Objective

Make battles understandable, satisfying, and appropriately short without changing authoritative combat rules.

### Actions

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
* Reduced Motion
* Skip to Results
* Surrender
* Playback recovery
* Result transition

Record:

* Battle duration at each speed
* Moments of confusion
* Dead time
* Information missed
* Controls used
* Controls ignored
* Playback interruptions
* Whether outcomes feel earned
* Whether repeated battles become tedious
* Whether favorites remain emotionally viable

### Guardrails

* Do not change combat results for presentation reasons.
* Do not reroll after refresh.
* Do not let animation control rewards.
* Do not hide surrender consequences.
* Do not cover cards with pause UI.
* Do not make inspection pause combat unless separately approved.
* Do not use color alone for matchup or danger.
* Do not create elaborate effects for every ordinary hit.
* Preserve reduced-motion behavior.
* Preserve readable 2x speed.

### Approval checkpoint

Material pacing changes require:

* Baseline durations
* Human comprehension results
* Repetition findings
* Recommended timing
* Regression risk

### Exit condition

Players can understand who acted, what happened, why the result broadly occurred, and how to proceed.

---

## Work Package 7: Strengthen rewards and immediate progression

### Objective

Make battle completion visibly change something the player values.

### Actions

Audit:

* Victory and defeat presentation
* Gold
* XP
* First daily victory
* MVP
* Level-up
* Changed stats
* Card growth
* Reward queue
* Tap-to-advance
* Skip All
* Retry
* Vault
* Home
* Next battle
* Updated top-bar resources
* Refresh safety

### Requirements

* The player knows what was earned.
* The player knows which cards gained XP.
* Level-ups show meaningful change.
* MVP is explained enough to feel earned.
* Defeat rewards are clear.
* Skip preserves understanding.
* Results provide a clear next action.
* Displayed resources match persisted resources.
* Refresh cannot duplicate settlement.
* Presentation never controls whether rewards are applied.

### Numerical boundary

Do not change reward values or progression math without explicit approval.

When current values feel weak or excessive, report:

* Current value
* Observed player response
* Simulation consequence
* Alternative values
* Economy effect
* Recommendation

### Exit condition

A completed battle produces understandable, visible, safe progression and a clear next action.

---

## Work Package 8: Design “always something to do” without punishment

### Objective

Identify one minimal activity that remains meaningful when the normal pull or Energy-limited loop is exhausted.

### Candidate concepts

Compare a small number of concepts such as:

* No-cost training battle
* Battle practice without rewards
* Daily collection prompt
* Vault organization goal
* Character showcase
* Card-line progress view
* Rotating card inspection challenge
* Free tactical forecast
* Small passive collection interaction
* Light mission concept

Do not implement all concepts.

### Comparison matrix

Use at least:

| Concept | Player fantasy | Daily value | Reward impact | Data need | Abuse risk | Build scope | Repeat fatigue | Phase fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

### Principles

* No streak punishment.
* No shame for missed days.
* No manipulative urgency.
* No new currency without approval.
* No hidden resource cost.
* Prefer collection fantasy.
* Prefer no-cost practice when reward complexity is unnecessary.
* Prefer curiosity over obligation.
* Prefer a narrow feature that can be removed safely.

### Approval checkpoint

Present the comparison and recommend:

* Implement one
* Prototype one only
* Defer all
* Improve existing Vault or battle activity instead

Do not implement a permanent activity before approval.

### Exit condition

Sterling receives a clear, evidence-based decision rather than a bundle of undeveloped feature ideas.

---

## Work Package 9: Perform a visual and tactile cohesion pass

### Objective

Make the daily loop feel like one product rather than independently patched screens.

### Audit

Review shared behavior for:

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
* Modals
* Mobile safe areas
* Transitions
* Scroll restoration
* Feedback after writes
* Top-bar consistency
* Gold and blue usage
* Brand tokens
* Test-harness remnants

### Priorities

* Reusable patterns
* Strong spacing
* Clear hierarchy
* Responsive touch targets
* Visible feedback
* Consistent status presentation
* Elimination of dead visual zones
* Clear screen purpose
* Cards remain the visual focus
* No celestial or casino-like drift
* No generic dashboard aesthetic

### Anti-patch rule

Before adding CSS or a runtime fix, ask:

* Is this shared or route-specific?
* Does a canonical token already exist?
* Will this override another patch?
* Does this create a second component?
* Does this affect card rendering?
* Does this affect mobile?
* Is the fix testable?
* Is this still Phase 2?

Do not use “cohesion” as justification for a broad rewrite.

### Exit condition

Core screens share intentional interaction states and hierarchy without broad visual regression.

---

## Work Package 10: Conduct integrated daily-loop playtests

### Objective

Test the full session as one experience rather than validating screens independently.

### Cydney test

Start on Home with no instructions.

Observe whether she:

1. Identifies an available action.
2. Claims or obtains a ticket.
3. Performs a pull.
4. Understands the reveal.
5. Locates the new card.
6. Builds or confirms a squad.
7. Starts a battle.
8. Understands the battle.
9. Understands rewards.
10. Identifies a next action.

Do not rescue her immediately. Record hesitation before assistance.

Record:

* First click
* Time to pull
* Time to battle
* Misread labels
* Missed controls
* Resource misunderstandings
* Duplicate misunderstandings
* Squad misunderstandings
* Battle misunderstandings
* Reward misunderstandings
* Final action
* Willingness to reopen

### Sterling test

Ask Sterling to:

* Optimize the loop
* Test alternate navigation
* Compare strong and weak squads
* Attempt repeated pulls and battles
* Test account switching
* Test interruptions
* Inspect persisted data
* Test mobile and desktop
* Judge strategy value
* Judge visual cohesion
* Test Energy exhaustion
* Test next-action paths

### Ashley test

When available:

* Ask Ashley to complete whatever she thinks the game offers today.
* Do not tell her the intended order.
* Observe whether context survives absence.
* Record what she remembers incorrectly.
* Record whether Home restores orientation.

Ashley’s availability should not block all work, but missing Ashley evidence must be stated.

### Post-session questions

Ask without leading:

1. What did you think you were supposed to do first?
2. What changed after the pull?
3. Where did the new card go?
4. Why did you choose those squad cards?
5. What happened in battle?
6. What did you earn?
7. What would you do next?
8. What felt satisfying?
9. What felt like work?
10. Would you reopen tomorrow? Why?

### Exit condition

The integrated session is understandable without verbal guidance and no Phase 1 guarantee regresses.

---

## Work Package 11: Final reconciliation and approval package

### Objective

Provide a clear merge decision with evidence.

### Final report contents

#### Executive summary

* What was measured
* What changed
* What improved
* What did not improve
* What human testers did
* What telemetry showed
* What remains risky
* Whether Phase 2 should merge

#### Journey result

Report:

* First action
* Time to first action
* Time to pull
* Time to battle
* Time to reward
* Total session duration
* Completion rate
* Abandonment points
* Next-action comprehension

#### Changes by area

* Home
* Pull
* Vault
* Squad
* Battle
* Rewards
* Optional activity
* Shared interaction states
* Mobile
* Documentation

For each change, include:

* Problem
* Evidence
* Decision
* Implementation
* Risk
* Tests
* Preview result
* Human result

#### Remaining decisions

List:

* Deferred Home ideas
* Deferred pull presentation
* Deferred economy changes
* Deferred progression changes
* Optional-activity decision
* Accepted debt
* Phase 3 candidates
* Merge approval

### Final recommendation states

Use one:

* **GO:** Phase 2 meets its gates and is recommended for merge.
* **CONDITIONAL GO:** Safe to merge after named conditions are completed or accepted.
* **NO-GO:** A core-loop or reliability risk remains.

Do not merge automatically after a GO recommendation.

---

# 12. Metrics and evidence standards

## 12.1 Baseline and comparison

Record before and after values for:

* Clicks from Home to pull
* Clicks from Home to battle
* Time to first meaningful action
* Time to first reward
* Time to locate the newest card
* Time to form a valid squad
* Battle duration at each speed
* Time spent on results
* Total daily-loop duration
* Number of visible loading states
* Number of unclear disabled states
* Error recovery success
* Next-action comprehension
* Cydney hesitation points
* Route abandonment
* Pull interruption
* Battle interruption

Do not invent a percentage improvement target before baseline measurement.

## 12.2 Evidence types

Label evidence as:

* Observed
* Reproduced
* Measured
* Telemetry-derived
* Human-reported
* Inferred
* Proposed
* Approved
* Implemented
* Verified
* Deferred
* Rejected

Do not combine these labels into a vague “improved” claim.

## 12.3 Screenshot and recording discipline

For meaningful visual changes, record:

* Branch
* Commit
* Route
* Account
* Device
* Browser
* Viewport
* Data state
* Before
* After

Do not rely on one desktop screenshot for mobile approval.

---

# 13. Defect and decision ledgers

## 13.1 Defect and friction ledger

Use at least:

| ID | Stage | Observation | Evidence type | Severity | Reproduction | Player impact | Proposed response | Approval | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 13.2 Design decision ledger

Use at least:

| Date | Area | Decision | Evidence | Options considered | Approved by | Implementation status | Revisit trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |

## 13.3 Timing ledger

Use at least:

| Commit | Tester | Device | Loop stage | Start | End | Duration | Errors | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 13.4 Human-test ledger

Use at least:

| Tester | Account | Device | Script | Assistance given | Completion | Blocker | Quote or paraphrase | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 13.5 Deployment ledger

Use at least:

| Environment | Branch | Commit | URL | Data binding | Deployed at | Result | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |

---

# 14. Phase 1 regression protection

Phase 2 may not weaken the hardened foundation.

Before final approval, prove:

* Authentication still works.
* Account switching clears stale private state.
* Player ownership remains isolated.
* Admin boundaries remain enforced.
* Pull costs remain exactly once.
* Pull results remain exactly once.
* Battle Energy remains exactly once.
* Energy regeneration remains correct.
* Battle settlement remains exactly once.
* Refresh remains safe.
* Playback failure remains recoverable.
* Daily reset remains Mountain Time.
* Displayed balances match persisted balances.
* Telemetry failure does not block play.
* Privacy exclusions remain enforced.
* Preview binding behavior remains understood.
* No production secret appears in evidence.

A visually improved loop that regresses trust is a failed Phase 2.

---

# 15. Telemetry requirements

Use the approved Phase 1 telemetry model.

Phase 2 should be able to reconstruct:

* Session start
* Home view
* Primary action selected
* Ticket claim or purchase
* Pull started
* Pull completed
* Pull interrupted
* Pull result viewed
* Vault viewed after pull
* New card detail viewed
* Squad builder viewed
* Squad save attempted
* Squad save completed
* Battle started
* Battle playback started
* Battle interrupted
* Battle completed
* Results viewed
* Reward finalized
* Next action selected
* Session end or inactivity boundary
* Error displayed
* Retry attempted

Do not add:

* Raw cookies
* PINs
* Tokens
* Message contents
* Unnecessary personal information
* Full card payload dumps
* Full database rows
* Fine-grained pointer tracking
* Keystroke tracking

New event names consistent with the approved schema may be added and documented without a new privacy approval.

New personal fields, retention changes, or storage changes require approval.

Telemetry must remain asynchronous and non-blocking.

---

# 16. Production and preview safety

Before human or mutation testing:

1. Confirm where preview writes go.
2. Confirm whether preview uses production D1.
3. Confirm whether preview uses production R2.
4. Confirm test accounts.
5. Record starting resources.
6. Record Energy.
7. Record pending pull or battle state.
8. Record rollback options.

When preview uses production data:

* Treat every write as production.
* Use controlled real accounts.
* Record resource changes.
* Do not fabricate large grants.
* Do not wipe collections.
* Do not reset progress without approval.
* Do not create permanent economy state for a prototype.
* Prefer no-write prototypes for unapproved concepts.

---

# 17. Documentation reconciliation

During Phase 2, update documentation when implementation changes:

* Home purpose
* Route behavior
* Pull flow
* Vault sorting
* Duplicate presentation
* Squad behavior
* Battle controls
* Reward sequence
* Energy display
* Shared interaction states
* Optional activity
* Telemetry events
* Known technical debt

Do not allow the work order to become the only record of current behavior.

Preserve design history when clearly labeled as historical.

---

# 18. Quality gates for Phase 2 completion

Phase 2 may be recommended for merge only when all applicable gates are satisfied.

## Phase dependency

* Phase 1 is merged.
* Phase 1 readiness review is complete.
* No Phase 1 NO-GO condition remains.
* The Phase 2 branch began from the approved post-Phase-1 `main`.

## Reliability

* Required automated commands pass or approved exceptions are documented.
* Build passes.
* Battle simulation passes.
* Preview is verified.
* No duplicate charge or settlement exists.
* Recovery behavior remains safe.
* Energy behavior remains correct.
* Account ownership remains correct.

## Daily-loop clarity

* Home communicates an available action.
* The primary action is identifiable.
* Pull availability is understandable.
* Energy availability is understandable.
* Pull results explain acquisition.
* The newest card can be found.
* A valid squad can be created.
* Battle is readable.
* Rewards are understandable.
* A next action is apparent.

## Human evidence

* Cydney completes the core session without technical coaching.
* Sterling completes edge-case and strategic testing.
* Ashley evidence is recorded when available, or its absence is explicit.
* Human findings are not replaced by AI judgment.
* Remaining blockers are resolved or accepted.

## Product cohesion

* Loading, disabled, pressed, success, error, and empty states are intentional.
* Mobile and desktop are both reviewed.
* Cards remain visually central.
* The product does not drift into casino language.
* Shared patterns replace unnecessary one-off patches.
* No broad visual regression remains.

## Product discipline

* No Phase 3 onboarding was implemented.
* No unapproved economy value changed.
* No unapproved battle rule changed.
* No new currency was added.
* No streak punishment was added.
* No broad rewrite occurred.
* Optional activity stayed within its approval.
* Remaining risks are explicit.

---

# 19. Communication cadence

Provide a status update at meaningful boundaries:

* After Phase 1 reconciliation
* After branch and baseline creation
* After current-journey mapping
* At the Home design checkpoint
* At the pull-pacing checkpoint
* After Vault and squad work
* After battle and reward evaluation
* At the optional-activity decision
* Before integrated human testing
* At final approval package

Every status update should include:

* Current branch
* Current commit
* Approximate Phase 2 completion percentage
* Work completed
* Measured findings
* Human findings
* Telemetry findings
* Current risks
* Next package
* Decision required

Report Phase 1 regressions immediately.

Do not provide invented time estimates.

---

# 20. Definition of done

This work order is complete when:

1. Phase 1 has merged and received an acceptable final state.
2. The Phase 1 readiness review exists.
3. `phase/daily-player-loop` was created from the latest post-Phase-1 `main`.
4. A draft pull request exists.
5. The current journey baseline is measured.
6. Phase 2 metrics are recorded.
7. Home direction received approval before broad restructuring.
8. Pull timing changes received approval when material.
9. Pull-to-Vault ownership flow is verified.
10. Squad construction is understandable and reliable.
11. Battle presentation remains authoritative and recoverable.
12. Reward presentation is clear and exactly once.
13. Optional activities were compared.
14. Any implemented optional activity received approval.
15. Shared interaction states are more cohesive.
16. Desktop and mobile previews are verified.
17. Required automated gates pass.
18. Phase 1 guarantees remain intact.
19. Cydney completes the core loop without technical coaching.
20. Sterling completes strategic and edge-case testing.
21. Ashley results are recorded when available, or absence is stated.
22. Documentation reflects implemented behavior.
23. The final report provides GO, CONDITIONAL GO, or NO-GO.
24. Sterling receives the final approval package.
25. The branch remains unmerged until Sterling approves.
26. Phase 3 has not begun.

---

# 21. Final instruction to Work mode

Execute this work order only after Phase 1 is complete, approved, and merged.

Begin by reading the Phase 1 final package and creating the Phase 1 readiness review.

Then create `phase/daily-player-loop` from the latest verified `main`, open a draft pull request, record the baseline, and map the current journey.

Proceed autonomously through safe measurement, audits, tests, documentation, prototypes, and clearly low-risk fixes.

Use evidence rather than assumptions.

Use telemetry to support human observation, not replace it.

Do not change economy values, progression math, battle rules, major Home hierarchy, major pull pacing, persistent data models, or optional activities without the defined approval.

Do not weaken Phase 1 guarantees.

Do not merge without Sterling’s explicit approval.

Do not begin Phase 3.

---

# 22. Ready-to-use continuation message for the existing Work thread

Use the following message after Phase 1 is complete, reviewed, approved, and merged:

> Phase 1 Release Hardening is complete and merged.
>
> Continue in this same Work thread with Phase 2 Daily Player Loop.
>
> Repository: `https://github.com/Valithron/commune-tcg`
>
> Fetch the latest `main` and read:
>
> * `docs/phase-2-daily-player-loop-work-order.md`
> * `docs/quality-playability-roadmap.md`
> * `docs/release-hardening/phase-1-final-report.md`
> * The complete Phase 1 evidence package
>
> Begin by creating `docs/daily-loop/phase-1-readiness-review.md`.
>
> Do not create the Phase 2 implementation branch until you have reconciled the work order with Phase 1 findings.
>
> After reconciliation, create `phase/daily-player-loop` from the latest verified `main`, open a draft pull request, record the baseline, and execute Phase 2 only.
>
> Proceed autonomously through safe audits, measurements, tests, documentation, prototypes, and low-risk fixes.
>
> Pause at every approval gate defined in the work order.
>
> When reporting progress or requesting a decision, include the current branch, commit, approximate completion percentage, measured findings, human findings, risks, and recommended next action.
>
> Do not merge without Sterling’s explicit approval.
>
> Do not begin Phase 3.
