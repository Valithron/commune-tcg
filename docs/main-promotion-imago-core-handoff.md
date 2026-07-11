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

This task has three connected objectives:

1. Make the approved `Gacha` state the canonical contents of `main`.
2. Complete the active product naming transition to **Imago Core**.
3. Establish the promoted branch as a cleaner, documented, production-quality release baseline.

This is not a conventional merge between two branches containing equally valuable product work. The owner has confirmed that essentially nothing in the current `main` application needs to be retained. The old version is preserved elsewhere.

> **Treat `Gacha` as authoritative and current `main` as replaceable legacy state.**

Do not reintroduce obsolete application code, layouts, assumptions, or branding merely because they exist on `main`.

The release-hardening work in this handoff is intentionally broader than a simple branch pointer change. Use the Work run efficiently by completing safe, high-confidence repository cleanup and documentation while preserving current behavior.

---

# 2. Governing decisions

These decisions are approved and should not be reopened unless a genuine technical blocker appears.

## 2.1 Branch authority

- `Gacha` is the source of truth.
- Final `main` must match the approved release state derived from `Gacha`.
- Existing `main` product code does not need reconciliation.
- The verified legacy branch or tag is the preservation point for the old application.
- Future work should branch from the new `main`.
- Keep `Gacha` temporarily after promotion for verification. Do not delete it during the initial promotion unless explicitly instructed.

## 2.2 Canonical product identity

The product is:

> **Imago Core**

Approved compact abbreviation:

> **IC**

Obsolete active product names include:

- Commune TCG
- TCG Commune
- Commune Cards
- Gacha App
- Gacha Game, when used as the product name
- Other placeholder names referring to the application as a whole

The word `gacha` may remain when it accurately describes a mechanic, genre concept, technical implementation, or historical branch. It must not remain as the current product name.

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

Permanent brand principles:

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

> **Leave the repository cleaner, clearer, and easier to continue than it was before the promotion.**

This does not authorize a wholesale rewrite. It authorizes safe cleanup, deduplication, documentation, formatting, lint correction, and removal of verified obsolete material.

---

# 3. Required execution order

Perform the work in this order:

1. Orient to the repository and identify exact branch heads.
2. Verify legacy preservation and create a safety reference only if needed.
3. Inventory the `Gacha` branch and map the active application.
4. Compare `main` and `Gacha` for repository-level infrastructure only.
5. Complete the Imago Core naming migration.
6. Perform the controlled release-hardening and cleanup pass defined below.
7. Generate or update canonical repository documentation.
8. Validate the candidate release on `Gacha` from a clean checkout.
9. Promote the approved state to `main`.
10. Revalidate the new `main` from a clean checkout.
11. Verify deployment, caches, metadata, and branch configuration.
12. Deliver the required final report.

Do not promote first and clean up afterward unless branch protections or workflow constraints make that unavoidable. The preferred result is for `main` to receive an already validated release candidate.

---

# 4. Explicit non-goals

Do not turn this task into any of the following:

- A complete architecture rewrite
- A full modularization of the approximately 19,000-line `app.js`
- A framework migration
- A database redesign
- A destructive data migration
- A `pow` to `atk` storage-field migration
- A battle-system redesign
- Card-stat or progression rebalancing
- New gameplay features
- A home, pull, vault, library, admin, or battle redesign
- Replacement of approved card frames
- A rewrite of all internal historical identifiers
- Unnecessary Git-history rewriting
- Speculative removal of compatibility logic

The large `app.js` should be analyzed and documented, but splitting it is a separate future project.

---

# 5. Branch replacement strategy

## 5.1 Verify preservation

Before changing `main`:

- Identify the actual legacy branch or tag containing the old application.
- Record its name and commit SHA.
- Confirm it is remotely available.

If no adequate legacy reference exists, create one from the current `main` before replacement. This is a safety measure only and does not mean old `main` code belongs in the new product.

Possible safety references:

- `legacy/pre-imago-main`
- `archive/main-before-imago-core`
- `pre-imago-core-main` tag

Do not create redundant backups if a verified legacy reference already exists.

## 5.2 Required final branch state

```text
main == approved Imago Core release candidate derived from Gacha
```

A normal merge commit is acceptable only if the resulting tree exactly preserves the approved `Gacha` release state and does not reintroduce obsolete `main` code.

A reset or reference replacement is acceptable and may be preferable.

Conceptual direct method:

```bash
git fetch origin
git checkout main
git reset --hard <approved-gacha-release-commit>
git push --force-with-lease origin main
```

Use `--force-with-lease`, never an unguarded force push.

If branch protection requires a PR, create a promotion PR whose resulting tree matches the approved release candidate. Resolve conflicts in favor of the modern application, not obsolete `main` behavior.

## 5.3 Post-promotion branch handling

- Confirm GitHub's default branch is `main`.
- Restore or establish intentional branch protection after any temporary changes.
- Keep `Gacha` until the new `main` is built, launched, and deployed successfully.
- Recommend whether `Gacha` should later be archived or deleted.

---

# 6. Repository inventory and mapping

Before editing, inventory at minimum:

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

Identify generated files and vendor output. Edit sources and regenerate output through the established build process rather than editing generated bundles manually.

## 6.1 Compare `main` only for operational infrastructure

Check whether `main` contains useful repository-level infrastructure absent from `Gacha`, such as:

- Deployment workflows
- Security policy
- Dependabot configuration
- License
- CODEOWNERS
- Required CI files
- Hosting configuration

Preserve such files only if they remain valid and do not conflict with the modern application.

Do not preserve obsolete application code merely because it differs.

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

## 7.1 Required active surfaces

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
- Current README
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

For historical handoffs and records, either preserve terminology with a historical note or archive them clearly. Do not rewrite history so aggressively that old documents become misleading.

Recommended note:

> Historical note: Commune TCG was renamed Imago Core. This document preserves terminology used when it was written.

Active documentation must identify `main` as canonical after promotion.

---

# 8. Controlled release-hardening and cleanup pass

This phase is required, not optional. Perform it carefully and preserve behavior.

## 8.1 Remove verified dead code

Remove, when confirmed unused:

- Obsolete code paths
- Superseded implementations
- Commented-out legacy implementations
- Unused helper functions
- Unused variables and imports
- Unreachable branches
- Temporary debugging code
- Temporary console logging
- Test banners accidentally left enabled
- Feature flags whose alternate path no longer exists and whose enabled behavior is now permanent
- Superseded patch files
- Dead branding constants
- Obsolete logo or favicon imports
- Broken references to removed files

Prefer deletion over leaving dead code “just in case,” but verify call sites before removal.

Do not remove code solely because it looks old.

## 8.2 Consolidate duplicated code

Identify and safely consolidate:

- Duplicate helper functions
- Duplicate constants
- Repeated formatting utilities
- Repeated card-stat calculations
- Repeated DOM or UI setup patterns
- Repeated CSS declarations
- Duplicate event-listener registration
- Repeated branding strings
- Duplicate route-state logic

Consolidate only where behavior is demonstrably equivalent. Do not convert this into broad architecture redesign.

## 8.3 Lint and static cleanup

Run existing lint or static-analysis commands. Fix safe issues such as:

- Unused imports
- Unused variables
- Duplicate declarations
- Unreachable code
- Accidental fallthrough
- Obvious shadowing errors
- Invalid syntax
- Broken references
- Simple inconsistent formatting

If no lint system exists, do not impose a highly opinionated or disruptive lint migration. A minimal configuration may be added only when it fits the current project and does not create large unrelated churn.

Document remaining lint warnings rather than hiding or disabling them indiscriminately.

## 8.4 Normalize formatting

Apply the repository’s established style consistently to files touched by this migration.

Normalize where safe:

- Indentation
- Quote usage
- Semicolon convention
- Import ordering
- Trailing whitespace
- End-of-file newlines
- Markdown heading structure
- Consistent terminology

Avoid a repository-wide formatting commit that obscures meaningful changes unless automated formatting is already canonical and low risk.

## 8.5 Remove obsolete branding artifacts

Remove or archive verified obsolete material such as:

- Old product logos
- Outdated splash art
- Dead branded icons
- Obsolete screenshots presented as current
- Old placeholder copy
- Superseded brand documents that conflict with canon
- Dead metadata
- Old descriptions
- Obsolete celestial master-brand language

Do not delete historical records that still provide useful development context. Mark or archive them appropriately.

## 8.6 Asset audit and orphan cleanup

Inventory active assets and identify orphaned files.

Delete only assets verified as unused through code search, manifest inspection, runtime mapping, or build analysis.

Review:

- PNG, JPEG, WebP, SVG, and icon files
- Card frames
- Rarity assets
- Type assets
- Character markers
- Backgrounds
- Fonts
- Audio and sound effects
- PWA icons
- Favicons
- Loading assets

Exercise caution with dynamically constructed asset paths.

## 8.7 Comment and TODO discipline

Remove stale, misleading, or redundant comments.

Add concise comments only where they clarify:

- Intentional compatibility behavior
- Historical internal identifiers
- Non-obvious data contracts
- Known constraints that could cause future regressions

Create TODOs only for concrete, actionable deferred work. Avoid vague TODO clutter.

## 8.8 Cleanup boundaries

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

The repository grew organically. Apparent duplication may still be active.

---

# 9. Required documentation deliverables

Use this release to establish a documented baseline.

## 9.1 `README.md`

Update or rewrite the README so it accurately presents Imago Core.

Include, where applicable:

- Imago Core title and concise description
- Digital CCG positioning
- Feature overview
- Setup instructions
- Run and build commands
- Environment requirements
- Current canonical branch
- Links to current design documents
- Architecture-document link
- Historical terminology note
- Screenshots only if current and already available

Do not let the README continue presenting the project as an experimental gacha branch.

## 9.2 `CHANGELOG.md`

Create or update a changelog containing a clear Imago Core release entry.

Include major systems now represented in the modern branch, such as applicable:

- Imago Core rebrand
- Card-frame system
- Pull-flow improvements
- Vault improvements
- Library improvements
- Home redesign
- Battle system
- Battle rewards and progression
- Admin improvements
- ATK and Power terminology migration
- Bug fixes and stability work

Do not invent implementation claims. Derive the changelog from the actual repository and commit history where available.

## 9.3 `docs/architecture.md`

Create a practical architecture map of the current application, not an idealized future architecture.

Document:

- Entry points
- Major files and responsibilities
- `app.js` responsibility map
- Route or screen structure
- State management
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
- Persistence and storage
- API and database boundaries
- CSS and theme organization
- Asset loading
- Patch/fix loading order
- Build and deployment path

Clearly distinguish current reality from future recommendations.

## 9.4 `docs/technical-debt.md`

Create or update a prioritized technical-debt inventory.

Include:

- Oversized files and functions
- `app.js` modularization candidates
- Scattered patch/fix files
- Duplicate logic
- Global-state risks
- Repeated event listeners
- Fragile route transitions
- Unclear CSS ownership
- Dynamic asset-path risks
- Missing tests
- Compatibility-sensitive identifiers
- Dead-code uncertainty
- Suggested module boundaries
- Recommended refactoring sequence
- Risk and estimated impact categories

Do not perform the full refactor during this job.

## 9.5 `docs/assets.md`

Create an asset inventory documenting:

- File or directory
- Asset category
- Active usage
- Referencing system or screen
- Dynamic-path notes
- Rarity assets
- Type assets
- Character assets
- Card frames
- Fonts
- Sounds
- PWA and browser icons
- Suspected unused assets that were retained because usage could not be proven

## 9.6 Terminology documentation

Add a central note to the README or game design document:

> Imago Core is the current product name. Older documents and internal identifiers may refer to Commune TCG, TCG Commune, or the Gacha branch. Those names are historical unless explicitly noted otherwise.

---

# 10. Brand implementation guardrails

Preserve the approved visual system while renaming.

## 10.1 Core palette

### Primary and surfaces

- Core Gold: `#D4AF37`
- Core Highlight: `#F1D36D`
- Core Shadow: `#9F7F22`
- Core Navy: `#090C1D`
- Deep Navy: `#070A18`
- Primary Surface: `#171A2D`

### Text

- Imago White: `#E0E0F2`
- Identity Silver: `#AEB2CC`
- Faint Record: `#8C90AA`

### Functional

- System Blue: `#2D9CDB`
- Success: `#7EE0A1`
- Danger: `#FFB4AB`

### Rarity

- Common: `#B8BCC7`
- Uncommon: `#60D394`
- Rare: `#2D9CDB`
- Legendary: `#D4AF37`
- Mythic: `#B56CFF`

### Types

- Flame: `#E85D4F`
- Tide: `#2F80ED`
- Bloom: `#45B36B`
- Volt: `#F2C94C`
- Shadow: `#5B3A8E`
- Radiant: `#F6D77A`
- Neutral: `#A99A86`

## 10.2 Typography

Preserve established use of:

- Libre Caslon Text
- Sora
- Hanken Grotesk
- JetBrains Mono

## 10.3 Celestial legacy

Remove active master-brand copy framing Imago Core as celestial, astral, cosmic, zodiacal, constellation-based, observatory-based, or planetary.

Individual cards may use those themes. Controlled radial light and geometry may remain. This is not a visual purge.

---

# 11. Validation requirements

Git success is not enough. Validate the product.

## 11.1 Clean-checkout validation

From a clean checkout of the candidate release:

1. Install dependencies using the canonical package manager.
2. Run the normal build command.
3. Run linting if configured.
4. Run automated tests if configured.
5. Start the application locally.
6. Confirm no required file exists only as an ignored local dependency.
7. Confirm no import or asset URL depends on the `Gacha` branch name.

Repeat essential validation after promotion from a clean checkout of `main`.

## 11.2 Critical smoke tests

Test all actual primary flows, including applicable:

- Authentication and user entry
- Home
- Pull
- Single pull
- Five-card pull
- Pull again
- Daily pull state
- Ticket purchase
- Vault
- Library
- Search and filters
- Card detail modal
- Squad selection
- Battle entry
- Battle playback
- Pause
- Card inspection during pause
- Exit
- Skip to results
- Battle results
- Reward queue
- Card XP and level-up presentation
- Admin page
- Card lab
- Submission approval
- Card editing
- Creator editing
- Type-probability controls

Do not invent routes. Adapt the test list to the actual implementation.

## 11.3 Known regression targets

Pay particular attention to:

- Pull-page buttons remain clickable.
- Five-pull “Pull again” does not freeze.
- Daily ticket cannot be claimed infinitely.
- Daily reset follows intended Mountain Time behavior.
- Ticket purchase deducts from the correct user bank.
- Vault displays duplicates correctly.
- Duplicate count does not conflict with card level.
- Vault and library filters work.
- Home strongest-card selection works.
- Daily-pull availability controls the rainbow border correctly.
- Battle playback does not falsely report interruption.
- End-of-battle buttons navigate correctly.
- Battle remains full-screen as designed.
- Pause does not block intended card inspection.
- Skip-to-results and reward sequencing work.
- Admin creator controls remain present.
- Type-probability controls remain functional where implemented.

These are regression tests, not redesign requests.

## 11.4 Error inspection

Inspect and triage:

- Browser console errors
- Unhandled promise rejections
- Failed network requests
- Missing assets
- Duplicate event handlers
- Server startup errors
- Database connection errors
- Service-worker errors
- Cache-version conflicts
- Build warnings
- Lint warnings

Do not claim success while significant errors remain unexplained.

---

# 12. Deployment and environment review

## 12.1 Deployment branch

Identify any hosting or CI service deploying specifically from `Gacha`.

Update production deployment to `main` where appropriate, sequencing the change so the working application remains deployable.

Potential systems include Vercel, Netlify, Render, Railway, GitHub Pages, Cloudflare Pages, Fly.io, or custom CI.

## 12.2 Environment variables

Do not commit secrets.

Inspect historical names such as `COMMUNE_TCG_*` or `GACHA_*`.

Rename only when external hosting configuration can be updated and verified in the same execution. Otherwise preserve the working identifier and document it.

## 12.3 Service worker and caches

Ensure users are not trapped on obsolete branded assets or incompatible bundles.

Consider:

- Cache-version bump
- Asset-manifest invalidation
- PWA metadata refresh
- Old service-worker cleanup
- Verification that old cached JavaScript does not conflict

## 12.4 Production data

Do not reset, reseed, or alter production data merely because the canonical branch changes.

Any schema or seed operation requires independent justification and verification.

---

# 13. Repository presentation

Where permissions allow:

- Confirm default branch is `main`.
- Update repository description to Imago Core language.
- Add accurate topics such as `collectible-card-game`, `ccg`, `card-game`, `gacha`, and `game-development` where appropriate.
- Restore intentional branch protection.
- Do not rename the repository without separate owner approval.

Suggested description:

> Imago Core, a premium character-collection digital CCG centered on recognizable people, personal mythology, progression, and battle.

---

# 14. Acceptance criteria

## Branch state

- [ ] Legacy application is recoverable from a verified branch or tag.
- [ ] Exact starting `main` and `Gacha` SHAs are recorded.
- [ ] `main` contains the approved Imago Core release state.
- [ ] Obsolete `main` application code was not reintroduced.
- [ ] Remote `main` points to the intended commit.
- [ ] GitHub default branch is `main`.
- [ ] Branch protection is intentional.

## Product naming

- [ ] Primary displayed product name is Imago Core.
- [ ] Browser title, header, loading states, metadata, and active documentation use Imago Core.
- [ ] Current product copy does not present Commune TCG or TCG Commune as current.
- [ ] Historical references are marked or intentionally preserved.
- [ ] Product descriptions prefer CCG or collectible card game.
- [ ] `Gacha` remains only where mechanically, technically, or historically appropriate.

## Terminology and compatibility

- [ ] `ATK`, `DEF`, `SPD`, and `Power` remain consistent.
- [ ] Internal `pow` storage was not destructively migrated.
- [ ] Compatibility-sensitive identifiers were preserved or safely migrated.
- [ ] Residual historical identifiers are documented.

## Release cleanup

- [ ] Verified dead code and debug code were removed.
- [ ] Safe duplicate logic was consolidated.
- [ ] Unused imports and variables were addressed.
- [ ] Formatting is consistent in touched files.
- [ ] Obsolete active branding assets were removed or archived.
- [ ] Orphan assets were deleted only when non-use was verified.
- [ ] Important compatibility code was not removed speculatively.

## Documentation

- [ ] README accurately presents Imago Core.
- [ ] CHANGELOG contains the Imago Core release entry.
- [ ] `docs/architecture.md` maps the current application.
- [ ] `docs/technical-debt.md` prioritizes future cleanup.
- [ ] `docs/assets.md` inventories active and uncertain assets.
- [ ] Active branch instructions point to `main`.

## Brand integrity

- [ ] Approved palette and typography remain intact.
- [ ] Rarity, type, and character colors remain distinct.
- [ ] Master brand is not presented as celestial or astrological.
- [ ] Card presentation was not redesigned during migration.

## Build and behavior

- [ ] Dependencies install from a clean checkout.
- [ ] Production build succeeds.
- [ ] Lint passes or residual issues are documented.
- [ ] Tests pass or missing coverage is documented.
- [ ] Application launches from new `main`.
- [ ] Critical routes and flows work.
- [ ] Pull, vault, library, battle, and admin regression targets pass.
- [ ] No critical browser, server, asset, or service-worker errors remain unexplained.

## Deployment

- [ ] Deployment uses `main` or an intentionally documented source.
- [ ] Environment configuration remains functional.
- [ ] No secrets were committed.
- [ ] Cache and service-worker behavior was reviewed.
- [ ] Production data was not damaged.

---

# 15. Required final report from Work

Provide a structured final report.

## 15.1 Branch promotion

- Previous `main` SHA
- Source `Gacha` SHA
- Approved release-candidate SHA
- Final `main` SHA
- Promotion method
- Verified legacy branch or tag
- Whether force-with-lease was used
- Branch-protection changes

## 15.2 Naming migration

Summarize changes to:

- UI
- Metadata
- Manifests
- Package information
- Assets
- Documentation
- Deployment configuration

## 15.3 Cleanup performed

Report:

- Dead files removed
- Dead code removed
- Duplicate logic consolidated
- Debug code removed
- Lint issues fixed
- Formatting changes
- Assets deleted or archived
- Comments and TODOs changed

For significant deletions, state how non-use was verified.

## 15.4 Documentation delivered

Report the state of:

- `README.md`
- `CHANGELOG.md`
- `docs/architecture.md`
- `docs/technical-debt.md`
- `docs/assets.md`
- Canonical terminology note

## 15.5 Residual historical identifiers

List meaningful remaining occurrences of:

- Commune TCG
- TCG Commune
- `commune-tcg`
- Gacha
- Historical package names
- Storage keys
- Environment variables
- Database fields

State why each remains.

## 15.6 Validation

Report:

- Install command and result
- Build command and result
- Lint command and result
- Test command and result
- Manual routes tested
- Browser or device used
- Console findings
- Server-log findings
- Known regressions checked

## 15.7 Deployment

Report:

- Provider
- Deployment branch
- Preview or production status
- Environment changes
- Cache or service-worker action

## 15.8 Deferred work

List technical debt deliberately not addressed, especially:

- `app.js` modularization
- High-risk patch consolidation
- Database or storage migrations
- Missing automated tests
- Architectural recommendations

## 15.9 Final recommendation

State whether:

- `Gacha` should remain temporarily
- `Gacha` is safe to archive or delete
- A release tag should be created
- A new development branch convention should be adopted
- The application is ready for the next refactoring phase

---

# 16. Post-promotion branch convention

Use:

- `main` as the stable canonical branch
- Short-lived feature branches from `main`
- Pull requests into `main` for substantial changes

Recommended patterns:

```text
feature/<name>
fix/<name>
chore/<name>
docs/<name>
refactor/<name>
```

Do not allow another long-lived catch-all branch to become the real product while `main` goes stale.

---

# 17. Release tag recommendation

After successful promotion and verification, recommend an appropriate tag based on actual maturity.

Possible examples:

- `imago-core-beta`
- `imago-core-2026-07`
- `v1.0.0-imago-core`, only if the product is genuinely ready for that designation

Do not create ceremonial semantic-version claims unsupported by product maturity.

---

# 18. Final directive

Before:

```text
Gacha = actual modern product
main = obsolete historical product
```

After:

```text
main = canonical Imago Core product
legacy branch = preserved old product
Gacha = temporary verification reference, then optional archival or deletion
```

Central implementation rule:

> **Promote the modern product. Do not blend it back into the obsolete one.**

Central naming rule:

> **The game is Imago Core.**

Central release rule:

> **Use this promotion to establish a clean, documented, production-quality baseline.**

Central scope rule:

> **Stabilize, rename, clean, document, validate, and promote. Do not turn this into the full architecture refactor.**
