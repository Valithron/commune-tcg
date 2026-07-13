# Imago Core Phase 2 Roadmap

Status: Governing Phase 2 reference
Baseline: Phase 1 squash commit `5f2219afbffa2c7f6fbc4a8bb933f16914ae421d`
Scope owner: Sterling

## Purpose

Phase 2 improves the clarity, compactness, and reward feel of the existing daily player loop without changing its approved economy, battle balance, or Phase 1 safety contracts. Work is split into three independently reviewable pull requests.

This roadmap overrides older Phase 2 drafts when they conflict. In particular, `docs/phase-2-daily-player-loop-work-order.md` and its pull request are reference material only because they predate the Phase 1 closeout.

## Non-negotiable Phase 1 guarantees

Every Phase 2 change must preserve:

- account isolation;
- authenticated, user-specific resources;
- pull idempotency and persistence;
- Vault ownership correctness;
- Squad persistence;
- battle recovery and settlement integrity;
- rewards and XP settlement integrity;
- logout and session behavior;
- Energy regeneration;
- telemetry privacy;
- preview D1 and R2 isolation; and
- production data integrity.

## Operating model

Implementation proceeds autonomously through approved scope. Routine decisions about layout, copy, CSS, modals, components, documentation, telemetry, and low-risk implementation do not require an approval pause.

Approval is required before:

- destructive data changes, preview cleanup, or production data reset;
- major economy or battle-balance changes;
- pull odds, ticket pricing, Gold or XP curves, or Energy changes;
- public account expansion;
- onboarding, tutorial, or mascot implementation;
- generated or canonical enemy or character assets;
- admin or content-management cleanup;
- broad refactors;
- new systems outside this roadmap; or
- major brand departures.

Admin and content-management cleanup is reserved for Phase 2.5. Preview evidence from Phase 1 remains intact until Sterling explicitly approves cleanup.

## Delivery sequence

### Phase 2A: Daily loop and collection clarity

Branch and pull request: `phase-2a-daily-loop-collection-clarity`

Deliver:

- a Home smart button that leads to the next useful daily-loop action;
- clearer daily claim, Tickets, and Pull state;
- Pull page cleanup without odds or price changes;
- Ticket Shop cleanup without pricing changes;
- centered inspection modals for Pull, Vault, and Library;
- consistent Vault and Library terminology;
- compact mobile layouts;
- account identity tucked into navigation or an account menu;
- minimal daily, pull, and inspection telemetry; and
- documentation updates.

Acceptance focus:

- the next daily action is obvious;
- resource requirements and failure states are readable before action;
- a completed pull leads naturally to the owned card in Vault;
- inspection uses a consistent centered interaction on desktop and mobile;
- authenticated ownership and idempotency contracts remain unchanged; and
- telemetry remains minimal, privacy-safe, and failure-tolerant.

### Phase 2B: Battle clarity and reward feel

Branch and pull request: `phase-2b-battle-clarity-reward-feel`

Deliver:

- retain the term Squad and improve Squad-editing clarity;
- simplify encounter selection;
- improve battle readability while keeping card Types and titles visible;
- larger, longer-lived damage numbers;
- clearer attacker and target distinction;
- clearer Type interaction feedback;
- a light Gold reward animation;
- a visible card XP-bar increase;
- a small level-up flash, grow, or shake when low risk;
- balance analysis only, with no unapproved balance changes;
- minimal battle and reward telemetry; and
- documentation updates.

Enemy portraits are not required and must not be generated for Phase 2.

### Phase 2C: Validation, documentation, and follow-up

Branch and pull request: `phase-2c-validation-docs-followup`

Deliver:

- validate Phase 2A and Phase 2B behavior;
- reconcile canonical documents;
- record automated, browser, and human evidence;
- document deferred items;
- fix only small, low-risk follow-up polish issues; and
- explicitly verify that Phase 1 guarantees remain intact.

## Excluded scope

Phase 2 does not include:

- broad refactoring;
- production data reset or preview cleanup;
- onboarding, tutorials, mascots, or public accounts;
- missions, shards, crafting, trading, monetization, or multiple saved Squads;
- major economy or battle-balance changes;
- pull-odds, ticket-price, Gold, XP, or Energy contract changes; or
- admin and content-management cleanup.

## Validation expectations

Each pull request must include proportionate automated coverage, a production build, static or formatting checks already used by the repository, targeted browser validation, telemetry verification where applicable, and an evidence-oriented documentation update. Phase 2C performs the final cross-PR reconciliation and release recommendation.
