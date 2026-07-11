# Imago Core Main Branch Promotion, Product Renaming, and Release Hardening Handoff

## Status

**Ready for execution by Work.**

## Repository

- Repository: `Valithron/commune-tcg`
- Authoritative development branch: `Gacha`
- Target canonical branch: `main`
- Legacy preservation: already handled by a separate legacy branch
- Canonical product name: **Imago Core**
- Preferred category: **digital collectible card game** or **CCG**

---

# 1. Mission

The `Gacha` branch is no longer an experiment. It contains the active, substantially rebuilt game and is the source of truth for the modern product.

This task has four connected objectives:

1. Make the approved `Gacha` state the canonical contents of `main`.
2. Complete the active product naming transition to **Imago Core**.
3. Establish the promoted branch as a clean, documented, production-quality release baseline.
4. Produce the technical maps and developer documentation needed to reduce future Work rediscovery and refactoring cost.

This is not a conventional merge between two equally valuable branches. The owner has confirmed that essentially nothing in the current `main` application needs to be retained. The old version is already preserved elsewhere.

> **Treat `Gacha` as authoritative and current `main` as replaceable legacy state.**

Do not reintroduce obsolete application code, layouts, assumptions, or branding merely because they exist on `main`.

The release-hardening work below is required, not optional. Use the Work run efficiently by completing safe, high-confidence cleanup and documentation while preserving current behavior.

---

# 2. Governing decisions

## 2.1 Branch authority

- `Gacha` is the source of truth.
- Final `main` must match the approved release state derived from `Gacha`.
- Existing `main` product code does not need reconciliation.
- The verified legacy branch or tag is the preservation point for the old application.
- Future work should branch from the new `main`.
- Keep `Gacha` temporarily after promotion for verification.

## 2.2 Product identity

The product is:

> **Imago Core**

Approved abbreviation:

> **IC**

Obsolete active names include:

- Commune TCG
- TCG Commune
- Commune Cards
- Gacha App
- Gacha Game, when used as the product name

The word `gacha` may remain where it accurately describes a mechanic, genre concept, technical implementation, or historical branch. It must not remain as the current public product name.

## 2.3 Product category

Prefer:

- Digital collectible card game
- Collectible card game
- Character-collection CCG
- Premium character-collection CCG

Do not describe the product primarily as a TCG unless historical or technical context requires it.

## 2.4 Brand concept

Canonical concept:

> **Human identity forged into collectible artifacts.**

Permanent principles:

- The person is the treasure.
- The card is the artifact.
- The Core preserves identity across variants.
- Character color identifies the person.
- Type color identifies affinity.
- Rarity color identifies collectible value.
- Gold identifies prestige and priority.
- Blue identifies the system.
- Art dominates while mechanics remain clear.

Do not reposition the master brand as celestial, astrological, or generic space fantasy.

## 2.5 Release posture

Treat the resulting branch as the first clean canonical baseline of the Imago Core era.

> **Leave the repository cleaner, clearer, better documented, and easier to continue than it was before promotion.**

---

# 3. Required execution order

1. Record exact `Gacha`, `main`, and legacy branch or tag commit SHAs.
2. Verify the old application is recoverable.
3. Inventory the active `Gacha` repository.
4. Compare `main` and `Gacha` only for valid repository-level infrastructure.
5. Complete the Imago Core naming migration.
6. Perform the controlled release-hardening and cleanup pass.
7. Produce all required documentation and maps.
8. Validate the release candidate on `Gacha` from a clean checkout.
9. Promote the approved state to `main`.
10. Revalidate `main` from a clean checkout.
11. Verify deployment, cache, metadata, default branch, and protection settings.
12. Deliver the final execution report.

Prefer promoting an already validated release candidate rather than cleaning directly on `main` after promotion.

---

# 4. Explicit non-goals

Do not turn this task into:

- A complete architecture rewrite
- Full modularization of the large `app.js`
- A framework migration
- A database redesign
- A destructive data migration
- A `pow` to `atk` storage migration
- A battle redesign
- Card-stat or progression rebalancing
- New gameplay features
- A route or screen redesign
- Replacement of approved card frames
- A rewrite of every historical identifier
- Speculative deletion of compatibility logic
- Unnecessary Git-history rewriting

Analyze and document the future modularization of `app.js`, but do not perform the large refactor in this work order.

---

# 5. Branch replacement strategy

## 5.1 Verify preservation

Before changing `main`:

- Identify the actual legacy branch or tag.
- Record its commit SHA.
- Confirm it is remotely available.

If no adequate preservation reference exists, create one from current `main` before replacement. This is a safety measure only.

## 5.2 Required final state

```text
main == approved Imago Core release candidate derived from Gacha
```

A normal merge commit is acceptable only if the resulting tree preserves the approved `Gacha` state without reintroducing obsolete `main` code.

A reset or branch-reference replacement is acceptable and may be cleaner.

Use `--force-with-lease`, never an unguarded force push.

If branch protection requires a PR, create a promotion PR whose resulting tree matches the approved release candidate. Resolve conflicts in favor of the modern application.

## 5.3 Post-promotion handling

- Confirm GitHub default branch is `main`.
- Restore or establish intentional branch protection.
- Confirm deployment uses `main` where appropriate.
- Keep `Gacha` until the new `main` is built, launched, and deployed successfully.
- Recommend whether `Gacha` should later be archived or deleted.

---

# 6. Repository inventory and mapping

Inspect at minimum:

- Root files
- Application entry points
- `app.js`
- Patch and fix files
- JavaScript and TypeScript files
- CSS and theme files
- Static HTML
- Package manifests and lockfiles
- Build scripts
- Tests, fixtures, and snapshots
- Server and API code
- Database, schema, seed, and migration files
- Environment templates
- Deployment and hosting configuration
- GitHub Actions workflows
- Public manifests and PWA configuration
- Service worker and cache code
- Assets, icons, frames, images, sounds, and fonts
- Documentation under `docs/`
- README files
- Admin tools
- Generated notifications or emails

Identify generated files and vendor output. Edit source files and regenerate through the established build process rather than editing generated bundles directly.

## 6.1 Infrastructure-only comparison with `main`

Check whether `main` contains useful repository-level infrastructure absent from `Gacha`, such as:

- Deployment workflows
- Security policy
- Dependabot configuration
- License
- CODEOWNERS
- Required CI files
- Hosting configuration

Preserve only valid infrastructure that does not conflict with the modern application. Do not preserve obsolete product code merely because it differs.

---

# 7. Imago Core naming migration

Perform a case-insensitive repository-wide audit for:

```text
Commune TCG
TCG Commune
Commune Cards
Gacha App
Gacha Game
commune-tcg
commune_tcg
communeTCG
tcg-commune
tcg_commune
TCG
Gacha
```

Evaluate context. Do not blindly replace generic uses of `Commune`, `TCG`, or `Gacha`.

## 7.1 Active surfaces to update

Update applicable active surfaces:

- Browser title
- Main logo text
- Header branding
- Login and account screens
- Loading and splash screens
- Home
- Pull flow
- Vault
- Library
- Card details
- Squad selection
- Battle entry, playback, pause, and results
- Reward presentation
- Admin and submission tools
- Modals
- Toasts
- Empty states
- Error states
- Confirmation messages
- Share copy
- Open Graph and social metadata
- PWA manifest
- Installable app name and short name
- Package descriptions
- README
- Active design documents
- Setup and deployment documentation
- Current handoffs
- Public API response text
- Seeded announcements

## 7.2 Repository slug

The repository may remain `commune-tcg` unless the owner separately approves a repository rename.

Document the distinction:

- Product: **Imago Core**
- Repository slug: historical and may remain `commune-tcg`

## 7.3 Compatibility-sensitive identifiers

Inspect, but do not casually rename:

- Local-storage keys
- Database names and columns
- Cookie names
- OAuth identifiers
- Hosting project IDs
- Environment-variable prefixes
- Analytics properties
- App IDs
- Cache namespaces
- Stable API fields

Rule:

> Rename user-visible and low-risk identifiers now. Preserve compatibility-sensitive identifiers unless they can be migrated and verified safely in the same execution.

Internal `pow` may remain the stored offensive-stat field while the player-facing label is `ATK`.

Do not perform a destructive `pow` to `atk` migration.

## 7.4 Historical documentation

Historical handoffs may preserve old terminology with a note:

> Historical note: Commune TCG was renamed Imago Core. This document preserves terminology used when it was written.

Active documentation must identify `main` as canonical after promotion.

---

# 8. Controlled release-hardening and cleanup

## 8.1 Remove verified dead code

Remove only when confirmed unused:

- Obsolete code paths
- Superseded implementations
- Commented-out legacy implementations
- Unused helpers, variables, and imports
- Unreachable branches
- Temporary debugging code
- Temporary console logging
- Test banners accidentally enabled
- Feature flags whose alternate path no longer exists
- Superseded patch files
- Dead branding constants
- Obsolete logo or favicon imports
- Broken references to removed files

Prefer deletion over indefinite preservation, but verify call sites first.

## 8.2 Consolidate demonstrably duplicate code

Safely consolidate:

- Duplicate helper functions
- Duplicate constants
- Repeated formatting utilities
- Repeated card-stat calculations
- Repeated UI setup patterns
- Repeated CSS declarations
- Duplicate event-listener registration
- Repeated branding strings
- Duplicate route-state logic

Consolidate only when behavior is demonstrably equivalent.

## 8.3 Lint and static cleanup

Run existing lint or static-analysis commands. Fix safe issues such as:

- Unused imports and variables
- Duplicate declarations
- Unreachable code
- Accidental fallthrough
- Obvious shadowing errors
- Invalid syntax
- Broken references
- Simple formatting inconsistencies

If no lint system exists, do not impose a disruptive configuration. Document unresolved warnings rather than suppressing them indiscriminately.

## 8.4 Normalize formatting

Apply the established style consistently to files touched in this migration. Avoid a repository-wide cosmetic rewrite that obscures meaningful changes.

## 8.5 Remove obsolete branding artifacts

Remove or archive verified obsolete:

- Product logos
- Splash art
- Branded icons
- Outdated screenshots presented as current
- Placeholder copy
- Conflicting brand documents
- Dead metadata
- Obsolete celestial master-brand language

Preserve useful historical records with clear labeling.

## 8.6 Asset audit and orphan cleanup

Inventory active assets and identify orphaned files. Delete only assets verified as unused through code search, runtime mapping, manifests, or build analysis.

Exercise caution with dynamically constructed asset paths.

## 8.7 Comment and TODO discipline

- Remove stale or misleading comments.
- Remove TODOs for work already completed.
- Retain TODOs only when concrete and actionable.
- Add comments only where they explain compatibility behavior, historical identifiers, non-obvious data contracts, or known constraints.

## 8.8 Silent failure audit

Search for and review:

```text
catch {}
catch (e) {}
.catch(() => {})
void promiseCall()
unawaited promises
empty returns after errors
console.error without recovery or user feedback
```

Do not convert every recoverable failure into a crash. Ensure failures are intentional, observable where appropriate, and documented.

## 8.9 Logging audit

Classify each active log statement as:

- Required operational error logging
- Useful development logging
- Temporary debugging output
- Sensitive-data risk
- Redundant noise

Remove temporary noise and sensitive output. Standardize remaining logging conventions where feasible without introducing a new logging framework.

## 8.10 Debug and admin exposure audit

Verify that normal users cannot access unintended:

- Debug routes
- Test cards
- Cheat controls
- Admin shortcuts
- Battle simulators
- Schema diagnostics
- Resource inventories
- Internal test endpoints
- Privileged mutation endpoints

Confirm authorization exists server-side where needed. Hiding a link in the UI is not sufficient access control.

## 8.11 Cleanup boundaries

Do not casually remove:

- Compatibility wrappers
- Patch files whose loading is not mapped
- Dynamic CSS selectors
- Database fallbacks
- Error-recovery code
- Service-worker compatibility logic
- Storage-key compatibility
- Feature flags with active alternate behavior
- Duplicate-looking functions without call-site analysis

---

# 9. Single-source-of-truth audit

Verify whether the following are defined in more than one active place:

- Rarity names and colors
- Type names and colors
- Character identity colors
- Card dimensions and frame geometry
- Battle constants and matchup modifiers
- XP tables and level curves
- Card Power calculations
- Pull odds and pity logic
- Ticket prices and economy values
- Daily reset timing
- Reward values
- Route names
- Product name and branding constants

For each duplicated definition:

1. Identify all active copies.
2. Determine the true canonical source.
3. Consolidate only when safe.
4. Document compatibility copies that must remain.
5. Add a focused test or validation where consolidation could alter gameplay.

Do not create a broad configuration rewrite solely for aesthetic purity.

---

# 10. Global-state and ownership inventory

Create a current-state map of major global or shared state, including where applicable:

- Authentication and current user
- Player resources
- Vault and owned-card state
- Library and card catalog state
- Pull state and reveal queues
- Squad selection
- Battle attempt, playback, and results state
- Reward settlement
- Admin state
- UI route and modal state
- Settings and persistent browser state

For each state area, document:

- Source of truth
- Initialization path
- Readers
- Writers
- Persistence boundary
- Reset or invalidation behavior
- Known race or duplication risks

Do not redesign state management in this task.

---

# 11. Dependency and flow maps

Document practical dependency maps for the major systems:

- Authentication
- Home
- Pull and ticket economy
- Vault
- Library
- Card rendering
- Squad builder
- Battle forecast and simulation
- Battle playback
- Rewards and progression
- Admin and submission review

For each system, record:

- UI entry points
- Services and helpers
- API endpoints
- Shared contracts
- Storage or database dependencies
- Cross-system dependencies
- Critical side effects
- Known fragility

Text diagrams or Mermaid diagrams are acceptable if they remain accurate and readable.

---

# 12. Required documentation deliverables

## 12.1 `README.md`

Update or rewrite the README to include:

- Imago Core title and concise description
- Digital CCG positioning
- Feature overview
- Setup instructions
- Run, build, lint, and test commands
- Environment requirements
- Canonical branch
- Links to current design and architecture documents
- Historical terminology note
- Current screenshots only if already available and accurate

## 12.2 `CHANGELOG.md`

Create or update a changelog with an Imago Core release entry based on actual repository history and implemented systems.

## 12.3 `docs/releases/imago-core-beta.md`

Create release notes containing:

- Release identity and date
- Major features
- Important fixes
- Notable technical changes
- Compatibility notes
- Known issues
- Deferred work
- Recommended next milestones

Do not invent claims or mark unfinished systems as complete.

## 12.4 `docs/architecture.md`

Create or update a map of current reality:

- Entry points
- Major files and responsibilities
- Route structure
- State ownership
- Data flow
- Authentication
- Pull system
- Vault
- Library
- Card rendering
- Squad selection
- Battle system
- Rewards and progression
- Admin tools
- API and database boundaries
- CSS organization
- Asset loading
- Patch or fix loading order
- Build and deployment path

Clearly separate current architecture from recommended future architecture.

## 12.5 `docs/technical-debt.md`

Create or update a prioritized debt inventory covering:

- Oversized files
- Duplicate helpers and constants
- Scattered patch or fix files
- Global state risks
- Repeated event listeners
- Fragile route transitions
- Silent failures
- Missing tests
- Naming inconsistencies
- Legacy internal identifiers
- Security or authorization concerns
- Asset sprawl
- Documentation gaps

Classify each item by severity, risk, effort, and recommended sequence.

## 12.6 `docs/assets.md`

Inventory active:

- Card frames
- Logos
- App icons and favicons
- Character, type, and rarity assets
- Backgrounds
- Pull and reveal assets
- Sounds
- Fonts
- PWA assets

Record path, purpose, loading method, owner system, and whether the asset appears canonical, transitional, historical, or orphaned.

## 12.7 `docs/developer-guide.md`

Create a practical Developer Guide that future Work sessions should read first.

Include:

- Product and repository overview
- Canonical branch and branch conventions
- Folder layout
- Setup and environment instructions
- Build, lint, and test commands
- Deployment overview
- Route map
- Data-flow overview
- Global-state ownership
- Authentication flow
- Pull and ticket economy
- Vault and library behavior
- Card rendering and frame system
- Battle architecture
- Reward and progression flow
- Admin and submission architecture
- API overview
- Database and persistence boundaries
- Asset conventions
- Coding conventions
- Logging and error-handling conventions
- How to add a card
- How to add or change a rarity
- How to add or change a type
- How to add a route
- How to add an API endpoint
- How to modify battle constants safely
- How to test pull and economy changes
- Common pitfalls and known regressions
- Links to canonical design and technical documents

This document should reduce rediscovery work in future Work orders.

## 12.8 Naming consistency report

Create a section in the developer guide or technical-debt document identifying competing names for the same concept, such as:

- `playerCards`
- `ownedCards`
- `vaultCards`
- `cards`

For each cluster, identify the preferred term, historical alternatives, and whether normalization is safe now or deferred.

## 12.9 Future modularization map

Document a recommended future module structure without implementing it.

At minimum consider responsibilities such as:

```text
app-shell/
auth/
users/
cards/
card-rendering/
pull/
economy/
vault/
library/
squads/
battle/
rewards/
admin/
routing/
state/
api/
shared/
styles/
assets/
```

For each proposed module, identify:

- Current code locations
- Intended responsibilities
- Public interfaces
- Dependencies
- Migration order
- Major risks
- Suggested extraction boundaries

The output should be concrete enough to seed a later dedicated refactor Work order.

---

# 13. Functional regression requirements

Validate from a clean checkout.

At minimum test:

- Authentication or user entry
- Home
- Single pull
- Five-card pull
- Pull again
- Daily pull state
- Ticket purchase
- Vault duplicates
- Vault and library filters
- Card detail
- Squad selection
- Battle entry
- Battle playback
- Pause and exit behavior
- Battle results
- Reward presentation and settlement
- Admin page
- Card lab
- Submission approval
- Card editing

Pay particular attention to recent regression areas:

- Pull buttons remain clickable.
- Pull again after five cards does not freeze.
- Daily ticket cannot be claimed infinitely.
- Daily reset uses intended Mountain Time behavior.
- Ticket purchases deduct from the correct user bank.
- Vault displays duplicates correctly.
- Duplicate count does not collide with card level.
- Home strongest-card display works.
- Daily pull availability controls the rainbow border.
- Battle playback does not incorrectly report interruption.
- End-of-battle buttons navigate correctly.
- Pause preserves intended card inspection.
- Battle uses the intended full-screen experience.
- Skip-to-results and reward queues work.
- Admin creator fields remain editable.
- Type-probability controls remain present where implemented.

Inspect browser console, network failures, unhandled promise rejections, server logs, missing assets, service worker issues, and cache-version problems.

---

# 14. Build, deployment, and data safety

- Install dependencies from a clean checkout.
- Run canonical build, lint, and test commands.
- Launch the app locally.
- Confirm no branch-relative imports or ignored local dependencies.
- Identify any deployment configured specifically for `Gacha`.
- Move the deployment source to `main` where appropriate.
- Do not commit secrets.
- Preserve working environment variables unless they can be migrated safely in the same execution.
- Review service-worker and cache invalidation so users do not remain trapped on obsolete assets.
- Do not reset, reseed, or migrate production data merely because the branch changes.

---

# 15. Acceptance criteria

## Branch and release state

- [ ] Legacy application is recoverable from a verified branch or tag.
- [ ] `main` contains the approved Imago Core state derived from `Gacha`.
- [ ] Obsolete `main` product code was not reintroduced.
- [ ] GitHub default branch is `main`.
- [ ] Branch protection is intentional.
- [ ] Deployment source is correct.

## Naming and brand

- [ ] Active product surfaces use Imago Core.
- [ ] Current public descriptions prefer CCG terminology.
- [ ] Historical terminology is clearly marked where retained.
- [ ] Compatibility-sensitive identifiers are documented.
- [ ] Internal `pow` was not destructively migrated.
- [ ] Master-brand celestial language is removed where obsolete.

## Cleanup and hardening

- [ ] Verified dead code and obsolete artifacts are removed.
- [ ] Duplicate logic was consolidated only where proven safe.
- [ ] Lint or static-analysis findings were resolved or documented.
- [ ] Silent failures were audited.
- [ ] Logging was audited.
- [ ] Debug and admin exposure was audited.
- [ ] Orphaned assets were audited.
- [ ] Completed TODOs and stale comments were removed.

## Documentation

- [ ] `README.md` is current.
- [ ] `CHANGELOG.md` exists or is updated.
- [ ] `docs/releases/imago-core-beta.md` exists.
- [ ] `docs/architecture.md` is current.
- [ ] `docs/technical-debt.md` exists or is updated.
- [ ] `docs/assets.md` exists.
- [ ] `docs/developer-guide.md` exists.
- [ ] Global-state ownership is documented.
- [ ] Major dependency and flow maps are documented.
- [ ] Naming consistency is documented.
- [ ] Future modularization is mapped without being executed.
- [ ] Single-source-of-truth audit is documented.

## Functionality

- [ ] Clean dependency install succeeds.
- [ ] Production build succeeds.
- [ ] Lint passes or remaining issues are documented.
- [ ] Tests pass or missing coverage is documented.
- [ ] App launches from new `main`.
- [ ] Critical routes work.
- [ ] Pull, vault, library, battle, reward, and admin flows work.
- [ ] No critical console or server errors remain unexplained.
- [ ] Production data remains intact.

---

# 16. Required final report from Work

Provide a structured report containing:

## 16.1 Branch promotion

- Previous `main` commit
- Source `Gacha` commit
- Final `main` commit
- Promotion method
- Legacy reference verified
- Whether force-with-lease was used
- Branch-protection changes

## 16.2 Naming changes

Summarize changes to UI, metadata, docs, manifests, package fields, assets, and deployment configuration.

## 16.3 Cleanup results

List:

- Files deleted
- Patch files removed or retained
- Duplicate logic consolidated
- Logs removed or retained
- TODOs removed or retained
- Silent failures fixed or documented
- Orphaned assets removed or retained
- Any major deletion and the evidence used to prove it was safe

## 16.4 Residual historical identifiers

List every meaningful remaining occurrence of old product names, branch names, repository slug, old package names, storage keys, database names, and internal fields. State why each remains.

## 16.5 Validation

Report:

- Install command and result
- Build command and result
- Lint command and result
- Test command and result
- Manual routes tested
- Browsers or devices used
- Console, network, and server-log findings

## 16.6 Documentation delivered

List every document created or updated and summarize its purpose.

## 16.7 Deployment state

- Provider
- Deployment branch
- Preview or production status
- Environment changes
- Cache or service-worker action

## 16.8 Deferred work

List technical debt deliberately excluded, especially the full modularization of `app.js`.

## 16.9 Final recommendation

State whether:

- `Gacha` should remain temporarily
- `Gacha` is safe to archive or delete
- A release tag should be created
- A new branch convention should be adopted
- The next dedicated refactor should begin with the proposed modularization map

---

# 17. Recommended post-promotion branch convention

Use:

```text
main
feature/<name>
fix/<name>
chore/<name>
docs/<name>
refactor/<name>
```

Do not recreate a long-lived catch-all branch that becomes the true product while `main` becomes stale again.

---

# 18. Release tag recommendation

After successful promotion and verification, consider:

```text
imago-core-beta
```

or a dated tag such as:

```text
imago-core-2026-07
```

Choose a tag that reflects actual maturity.

---

# 19. Final directive

Before:

```text
Gacha = modern product
main = obsolete product
```

After:

```text
main = canonical Imago Core product
legacy branch = preserved old product
Gacha = temporary verification reference
```

Central implementation rule:

> **Promote the modern product. Do not blend it back into the obsolete one.**

Central naming rule:

> **The game is Imago Core.**

Central scope rule:

> **Stabilize, clean, document, validate, and promote. Do not turn this into the full architecture refactor.**
