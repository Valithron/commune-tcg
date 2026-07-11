# Imago Core Main Branch Promotion and Product Renaming Handoff

## Status

**Ready for execution by Work.**

## Repository

- Repository: `Valithron/commune-tcg`
- Current authoritative development branch: `Gacha`
- Target canonical branch: `main`
- Legacy preservation: already handled by a separate legacy branch

## Purpose of this handoff

The `Gacha` branch is no longer an experimental side branch. It now contains the active, substantially rebuilt version of the game and should become the canonical product codebase.

This task has two connected objectives:

1. Replace the current contents and history position of `main` with the intended state of `Gacha`.
2. Complete the product-level naming transition from **Commune TCG**, **TCG Commune**, and related temporary names to **Imago Core**.

This is not a conventional feature merge in which both branches contain valuable parallel work that must be reconciled. The owner has confirmed that there is essentially nothing on the current `main` branch that needs to be retained. The old version of the game has already been preserved on a separate legacy branch.

Therefore:

> **Treat `Gacha` as the source of truth and `main` as the branch being replaced.**

Do not spend time preserving obsolete implementation choices from `main`. Do not reintroduce old layouts, old systems, old data assumptions, or old branding merely because they exist on `main`.

---

# 1. Governing decisions

The following decisions are already approved and should not be reopened unless execution reveals a genuine technical blocker.

## 1.1 Branch authority

- `Gacha` is authoritative.
- `main` should become equivalent to the approved final state of `Gacha`.
- Existing `main` code does not need to be merged into `Gacha` for product preservation.
- The separate legacy branch is the preservation point for the old application.
- After promotion, all normal development should branch from the new `main`.

## 1.2 Product name

The canonical product name is:

> **Imago Core**

The approved compact abbreviation is:

> **IC**

The following names are obsolete as active product branding:

- Commune TCG
- TCG Commune
- Commune Cards
- Gacha app
- Gacha game, when used as the product name
- Any other placeholder name that refers to the application as a whole

The word “gacha” may remain where it accurately describes a mechanic, implementation concept, historical branch name, or genre concept. It should not remain as the public product name.

## 1.3 Product category language

Imago Core is best described as a **digital collectible card game**, or **CCG**, rather than a player-to-player trading card game.

Preferred public descriptions:

- Collectible card game
- Digital collectible card game
- Character collection card game
- Premium character-collection CCG

Avoid presenting the product primarily as a TCG unless a context specifically requires historical terminology.

## 1.4 Branding concept

The canonical brand concept is:

> **Human identity forged into collectible artifacts.**

The product should not be reframed as a celestial, astrological, or generic space-fantasy game.

Relevant established brand principles include:

- The person is the treasure.
- The card is the artifact.
- The Core preserves identity across every variant.
- Character color identifies the person.
- Type color identifies affinity.
- Rarity color identifies collectible value.
- Gold identifies prestige and priority.
- Blue identifies the system.
- Art dominates while mechanics remain clear.

This task is not a visual redesign. Preserve the current approved visual system unless a stale name or obsolete brand artifact must be changed.

---

# 2. Scope summary

Work should perform the following broad sequence:

1. Inspect and inventory the current `Gacha` branch.
2. Establish a clean safety point before branch replacement.
3. Complete the Imago Core naming migration throughout active product surfaces and documentation.
4. Validate the application from a clean checkout.
5. Replace or reset `main` so that it points to the approved `Gacha` state.
6. Push the new `main` safely.
7. Revalidate the new canonical branch.
8. Update branch-facing documentation and repository metadata where possible.
9. Report exactly what changed, what was intentionally left unchanged, and any residual legacy naming.

Do not begin major architecture refactoring as part of this task.

The repository is currently in an inventory and mapping phase. The large `app.js` and scattered patch/fix files should be documented where relevant, but this branch promotion must not expand into a risky full rewrite.

---

# 3. Non-goals

The following are explicitly outside the primary scope unless required to make the promoted branch build and run correctly:

- Rewriting the entire application architecture
- Splitting the approximately 19,000-line `app.js` into a new module system
- Redesigning the database schema
- Renaming every internal variable solely for aesthetic consistency
- Changing persisted production data without a verified migration plan
- Rebuilding the battle system
- Rebalancing card stats or progression systems
- Redesigning the home, pull, vault, library, admin, or battle layouts
- Replacing approved card frames
- Introducing new features
- Removing functional compatibility layers merely because they look old
- Rewriting Git history unnecessarily

A small amount of cleanup is appropriate when it is directly connected to stale naming, broken imports, duplicate branding constants, dead references, or release safety.

---

# 4. Safety and branch strategy

## 4.1 Confirm the legacy preservation branch

Before replacing `main`, confirm that the repository contains the intended legacy branch or another immutable reference to the old application.

Do not assume a branch name. Identify and record the actual branch or tag used for legacy preservation.

If the legacy branch exists and points to the intended old version, proceed.

If no legacy reference can be verified, create a safety tag or backup branch from the current `main` before replacement. This is a repository safety measure only, not an indication that current `main` code should be merged back into the product.

Suggested temporary safety names if needed:

- `legacy/pre-imago-main`
- `archive/main-before-imago-core`
- tag: `pre-imago-core-main`

Do not create redundant backups if an adequate legacy branch already exists.

## 4.2 Preferred promotion model

The desired final state is:

```text
main == approved Gacha commit
```

A normal merge commit is acceptable only if it produces that exact effective code state without reintroducing obsolete `main` content.

A hard reset or branch reference replacement may be cleaner because `main` is not being treated as an independent source of valuable changes.

The implementation method should be chosen based on repository protections and available permissions:

### Option A: Reset `main` to `Gacha`

Use when force updates are permitted and branch protection can be handled safely.

Conceptually:

```bash
git fetch origin
git checkout main
git reset --hard origin/Gacha
git push --force-with-lease origin main
```

Use `--force-with-lease`, not an unguarded `--force`.

### Option B: Replace through a pull request

Use when branch protection requires PR review or direct force updates are blocked.

The PR should make the resulting tree match `Gacha`. Do not resolve conflicts by restoring obsolete `main` behavior.

### Option C: Temporarily adjust branch protection

Use only when repository ownership and permissions allow it, and restore protection afterward.

## 4.3 Do not delete `Gacha` immediately

After promotion:

- Keep `Gacha` temporarily as a verification reference.
- Confirm the new `main` builds, launches, and deploys correctly.
- Confirm no deployment target still points specifically at `Gacha`.
- Only then consider deleting or archiving `Gacha`.

Deletion of `Gacha` is not required for this task unless explicitly requested after verification.

---

# 5. Pre-promotion repository audit

Before changing names or branch pointers, inspect the current `Gacha` branch and produce a compact execution inventory.

## 5.1 Required inventory areas

Inspect at minimum:

- Root files
- Application entry points
- `app.js`
- Build scripts
- Package manifests and lockfiles
- Environment templates
- Deployment configuration
- Static HTML templates
- CSS and theme files
- JavaScript and TypeScript files
- Server or API code
- Database or migration files
- Seed data
- Documentation under `docs/`
- README files
- GitHub Actions workflows
- Hosting configuration
- Public manifests
- Browser metadata
- PWA metadata, if present
- Image alt text
- Open Graph and social metadata
- Admin interface labels
- Emails or notifications generated by the app
- Tests
- Fixtures and snapshots

## 5.2 Identify generated and vendor files

Do not manually edit generated bundles, minified artifacts, dependency directories, or build output unless the repository intentionally commits those files.

Prefer changing the source and regenerating output through the project’s established build process.

## 5.3 Record branch drift

Compare `main` and `Gacha` enough to confirm that replacing `main` will not discard a required infrastructure file, secret-independent deployment configuration, or repository-level automation that exists only on `main`.

This comparison is for operational safety, not product code reconciliation.

If a useful repository-level file exists only on `main`, evaluate it independently. Examples include:

- A working production deployment workflow
- Security policy
- Dependabot configuration
- License
- Repository ownership file
- Required CI configuration

Preserve such files only when they remain valid and do not conflict with the current application.

Do not preserve obsolete application code merely because it differs.

---

# 6. Canonical naming migration

Perform a repository-wide naming audit on the active `Gacha` codebase before promotion.

## 6.1 Replace active product-facing names

Replace active references to old product names with **Imago Core** wherever the text identifies the current application.

Search case-insensitively for at least:

```text
Commune TCG
COMMUNE TCG
commune tcg
TCG Commune
TCG COMMUNE
tcg commune
Commune Cards
Gacha App
Gacha Game
```

Also search for concatenated, slugged, abbreviated, and identifier forms such as:

```text
commune-tcg
commune_tcg
communeTCG
tcg-commune
tcg_commune
TCG
Gacha
```

Do not blindly replace every occurrence of `TCG`, `Gacha`, or `Commune`. Evaluate context.

## 6.2 Required public-facing surfaces

Update the name on all applicable active surfaces:

- Browser page title
- Main logo text
- Header branding
- Login and account screens
- Home screen
- Loading screen
- Empty states
- Error states
- Pull flow
- Vault
- Library
- Battle interface
- Results screens
- Admin pages
- Submission tools
- Modals
- Toasts
- Confirmation messages
- Share text
- Social metadata
- PWA manifest
- Installable app name and short name
- Favicon or icon metadata where text is embedded
- README title and introduction
- Current design documents
- Current handoff documents
- Current setup instructions
- Production descriptions
- Package description fields
- Public-facing API response text
- Seeded announcements or system messages

## 6.3 Repository name and URL

The repository currently remains `commune-tcg` unless the owner separately approves a repository rename.

Do not rename the GitHub repository as part of this task unless explicitly authorized.

Because the repository name may remain historical, links and import paths containing `commune-tcg` may remain where required for correctness.

Document the distinction:

- Product name: **Imago Core**
- Repository slug: may remain `commune-tcg`

## 6.4 Package and application identifiers

Inspect identifiers such as:

- `package.json` name
- App IDs
- PWA IDs
- Cache namespaces
- Local storage keys
- Database names
- Cookie names
- OAuth callback identifiers
- Hosting project IDs
- Environment variable prefixes
- Analytics properties
- Service worker cache names

Use this rule:

> Rename user-visible and low-risk internal identifiers now. Preserve compatibility-sensitive identifiers unless there is a verified migration path.

For example, changing a display name is expected. Changing a local storage key may silently log users out or discard settings. Changing a database name may disconnect production data. Changing a cache name may be safe but should be intentional.

Do not perform destructive identifier migrations casually.

## 6.5 Internal code terminology

Internal symbols may retain historical names when renaming them would create disproportionate risk and provide no player-facing benefit.

Examples that may remain temporarily:

- `pow` as the stored offensive stat, where the UI displays `ATK`
- Historical database column names
- Stable API field names
- Existing storage keys
- Branch name references in archived documentation

When an internal historical name remains:

- Ensure the player-facing label is correct.
- Add a concise comment only where future confusion is likely.
- Record it in the final residual legacy-name report.

Do not undertake a destructive `pow` to `atk` data migration as part of this handoff.

---

# 7. Documentation migration

Documentation must distinguish between active canon and historical material.

## 7.1 Active documentation

Update active documents to refer to the product as Imago Core.

Likely active documents include:

- `README.md`
- `docs/game-design.md`
- `docs/battle-design.md`
- Current work handoffs
- Setup documentation
- Deployment documentation
- Contributor instructions
- Admin documentation
- Branding documentation

Use judgment based on whether the document is still intended to guide current development.

## 7.2 Historical handoffs and records

Do not rewrite historical documents so aggressively that they become misleading records of what happened at the time.

For historical documents, choose one of these approaches:

1. Leave the historical wording intact and add a header note:

   > Historical note: Commune TCG was renamed Imago Core. This document preserves terminology used when it was written.

2. Update only the title and add a terminology note.

3. Move clearly obsolete material into an archive folder if that matches current documentation organization.

Do not allow obsolete handoff documents to appear canonical when they conflict with current design.

## 7.3 Canonical terminology note

Add a concise terminology section to an appropriate central document, preferably the README or game design document:

```text
Imago Core is the current product name. Older documents and internal identifiers may refer to Commune TCG, TCG Commune, or the Gacha branch. Those names are historical unless explicitly noted otherwise.
```

## 7.4 Branch references

Update active instructions that tell developers or Work to use `Gacha` as the primary branch.

After promotion, active instructions should say:

- Canonical branch: `main`
- New work branches from: `main`
- `Gacha` is historical or transitional

Do not alter archived records where the old branch reference is necessary to understand past work.

---

# 8. Brand implementation requirements

This task should preserve and correctly label the established Imago Core identity.

## 8.1 Canonical palette

Do not unintentionally change these established systems while renaming the product.

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

## 8.2 Typography

Preserve current approved use of:

- Libre Caslon Text
- Sora
- Hanken Grotesk
- JetBrains Mono

Do not replace the typography system during the rename.

## 8.3 Celestial legacy cleanup

Search for active product copy that frames the entire game as:

- Celestial
- Astral
- Cosmic
- Zodiac
- Constellation-based
- Observatory-based
- Planetary

Individual cards may use these concepts. The master brand should not.

Do not remove visual radial geometry or controlled light merely because it could resemble celestial imagery. Remove only explicit obsolete master-brand framing.

---

# 9. Functional regression requirements

The branch promotion must not be considered complete solely because Git operations succeed.

Validate the application as a product.

## 9.1 Clean environment validation

From a clean checkout of the candidate new `main`:

1. Install dependencies using the repository’s canonical package manager.
2. Run the normal build command.
3. Run linting if configured.
4. Run automated tests if configured.
5. Start the app locally.
6. Confirm there are no missing files, branch-relative imports, or uncommitted dependencies.

Do not rely on local ignored files unless they are documented environment requirements.

## 9.2 Critical route smoke test

Test all primary routes and navigation paths that currently exist, including at minimum:

- Authentication or user entry
- Home
- Pull
- Single pull
- Five-card pull
- Pull again
- Daily pull state
- Ticket purchase
- Vault
- Library
- Card detail modal
- Squad or deck selection
- Battle entry
- Battle playback
- Pause behavior
- Exit behavior
- Battle results
- Reward presentation
- Admin page
- Card lab
- Submission approval
- Card editing

Adjust this list to the actual route structure. Do not invent routes.

## 9.3 Known high-risk behaviors

Pay particular attention to areas that have recently required fixes:

- Pull-page buttons remain clickable.
- Pull again after a five-card pull does not freeze.
- Daily ticket cannot be claimed infinitely.
- Daily reset uses the intended Mountain Time behavior.
- Buying tickets deducts currency from the correct user bank.
- Vault displays multiple duplicates correctly.
- Duplicate count does not collide with card level.
- Vault and library filtering work.
- Home page strongest-card display works.
- Daily pull availability controls the rainbow border correctly.
- Battle playback does not incorrectly report interruption.
- End-of-battle buttons navigate correctly.
- Pause screen does not prevent intended card inspection.
- Battle occupies the intended full-screen experience.
- Skip-to-results and reward queue behavior remain functional.
- Admin creator fields remain visible and editable.
- Card type probability controls remain present where implemented.

These are regression targets, not invitations to redesign the systems.

## 9.4 Browser console and server logs

Inspect:

- Browser console errors
- Unhandled promise rejections
- Failed network requests
- Missing assets
- Server startup errors
- Database connection errors
- Service worker errors
- Cache version issues

Warnings should be triaged. Do not claim success while important errors remain unexplained.

---

# 10. Build, deployment, and environment review

## 10.1 Branch-connected deployments

Identify any hosting or CI service configured to deploy specifically from `Gacha`.

Potential examples:

- Vercel
- Netlify
- Render
- Railway
- GitHub Pages
- Cloudflare Pages
- Fly.io
- Custom CI/CD

After promotion, update production deployment to use `main` where appropriate.

Do not break a working deployment merely to normalize the branch name. Sequence the change so that the application remains deployable.

## 10.2 Environment variables

Do not commit secrets.

Review environment documentation for obsolete names such as `COMMUNE_TCG_*` or `GACHA_*`.

Renaming environment variables may require updates in hosting configuration. Only rename them when the corresponding external configuration can be updated in the same execution.

Otherwise:

- Preserve the working variable.
- Document it as a historical internal identifier.
- Consider a future compatibility migration.

## 10.3 Cache and service worker behavior

If the product uses a service worker or persistent browser cache, ensure users do not remain trapped on obsolete branded assets or incompatible bundles.

Consider:

- Bumping cache versions
- Invalidating old asset manifests
- Ensuring new icons and titles load
- Confirming old cached JavaScript does not conflict with new `main`

## 10.4 Production data safety

Do not reset, reseed, or migrate production data merely because the canonical branch changes.

Any schema or seed operation must be reviewed independently.

---

# 11. Repository metadata and presentation

Where permissions allow, update repository-facing presentation to reflect the product transition.

## 11.1 README

The README should clearly state:

- Product name: Imago Core
- Product category: digital collectible card game / CCG
- Current canonical branch: `main`
- Basic setup and run instructions
- Relevant current design documents
- Historical terminology note

Avoid leading with “Commune TCG” except in a historical note.

## 11.2 Repository description

If repository metadata editing is available and approved, update the description to something like:

> Imago Core, a premium character-collection digital CCG centered on recognizable people, personal mythology, progression, and battle.

Do not rename the repository itself without separate approval.

## 11.3 Topics

Reasonable topics may include:

- collectible-card-game
- ccg
- card-game
- gacha
- javascript, if accurate
- game-development

Use only topics that accurately describe the repository.

## 11.4 Default branch

Confirm that GitHub’s default branch is `main` after promotion.

## 11.5 Branch protection

Restore or establish appropriate protection for `main` after any required force update.

At minimum, consider:

- Prevent accidental force pushes after migration
- Require status checks if useful checks exist
- Require PRs for future major work

Do not add protections that block the owner’s current workflow without documenting them.

---

# 12. Cleanup boundaries

A limited cleanup pass is appropriate before promoting `Gacha`, but it must remain controlled.

## 12.1 Safe cleanup targets

Safe candidates include:

- Dead branding constants
- Duplicate old title strings
- Obsolete logo imports
- Unused old favicons
- Stale comments claiming the product is Commune TCG
- Temporary debug logging
- Test-only banners accidentally left enabled
- Obviously unused renamed assets
- Branch-specific instructions that are no longer true
- Broken links to old docs
- Duplicate documentation superseded by current canon

## 12.2 Cleanup requiring caution

Do not casually remove:

- Patch files whose runtime loading has not been mapped
- Compatibility wrappers
- Old CSS selectors still referenced dynamically
- Database fallback behavior
- Duplicate-looking functions without call-site analysis
- Legacy storage keys
- Feature flags
- Error recovery code
- Service worker compatibility logic

The repository’s organic growth means apparently redundant code may still be active.

## 12.3 Technical debt report

Rather than refactoring aggressively, create or update a technical debt inventory that records:

- Oversized `app.js`
- Scattered patch/fix files
- Duplicate systems
- Unclear ownership of styles
- Global state risks
- Repeated event listeners
- Fragile route transitions
- Areas lacking tests
- Internal legacy terminology

This promotion should establish a stable baseline for later refactoring.

---

# 13. Recommended execution phases

## Phase 1: Orient and protect

- Fetch all branches and tags.
- Confirm current `Gacha` head.
- Confirm current `main` head.
- Identify the legacy preservation branch or tag.
- Inspect branch protection and deployment dependencies.
- Compare branch-level repository infrastructure.
- Record the exact starting commit SHAs.

### Exit condition

The old version is safely recoverable, and the exact source and target commits are known.

## Phase 2: Naming inventory

- Run repository-wide searches for obsolete names.
- Classify each match as:
  - Active public branding
  - Active internal identifier
  - Historical documentation
  - Repository URL or slug
  - Third-party configuration
  - False positive
- Produce a concrete edit plan.

### Exit condition

Every meaningful old-name occurrence has a planned disposition.

## Phase 3: Implement Imago Core naming

- Update public UI text.
- Update metadata and manifests.
- Update active documentation.
- Add historical notes where appropriate.
- Update low-risk internal identifiers.
- Preserve compatibility-sensitive identifiers where necessary.
- Remove obsolete master-brand celestial language.

### Exit condition

The active product consistently presents itself as Imago Core.

## Phase 4: Candidate validation on `Gacha`

- Clean install.
- Build.
- Lint.
- Test.
- Launch.
- Smoke-test critical flows.
- Check console and logs.
- Fix migration-caused regressions.

### Exit condition

`Gacha` is release-ready and self-contained.

## Phase 5: Promote to `main`

- Create a final promotion checkpoint.
- Replace or reset `main` to the approved `Gacha` commit.
- Push using the safest method permitted by repository protection.
- Confirm remote `main` points to the intended commit.
- Confirm GitHub default branch remains or becomes `main`.

### Exit condition

Remote `main` contains the approved Imago Core codebase.

## Phase 6: Post-promotion verification

- Fresh-clone or fresh-checkout `main`.
- Repeat build and smoke tests.
- Verify deployment source.
- Verify production or preview deployment.
- Confirm no active documentation instructs developers to begin from `Gacha`.
- Confirm no critical asset paths were tied to branch URLs.

### Exit condition

The new `main` is operational and canonical.

## Phase 7: Closeout

- Report final commit SHAs.
- Report promotion method.
- Report tests performed.
- Report deployment status.
- List intentional residual legacy identifiers.
- List technical debt deferred.
- Recommend whether and when to delete `Gacha`.

---

# 14. Acceptance criteria

The task is complete only when all applicable criteria below are satisfied.

## Branch state

- [ ] The old application is recoverable from the verified legacy branch or tag.
- [ ] `main` contains the approved state originating from `Gacha`.
- [ ] Obsolete `main` application code was not reintroduced.
- [ ] Remote `main` points to the intended commit.
- [ ] GitHub default branch is `main`.
- [ ] Branch protection is in an intentional final state.

## Product naming

- [ ] The application’s primary displayed name is Imago Core.
- [ ] Browser title uses Imago Core.
- [ ] Header or logo text uses Imago Core.
- [ ] Current loading and error states use Imago Core where the product is named.
- [ ] Public metadata uses Imago Core.
- [ ] PWA or install metadata uses Imago Core where applicable.
- [ ] Current README and active docs use Imago Core.
- [ ] Active product copy does not present Commune TCG or TCG Commune as the current name.
- [ ] Historical references are clearly marked or intentionally preserved.

## Terminology

- [ ] Current product descriptions prefer CCG or collectible card game.
- [ ] `ATK`, `DEF`, `SPD`, and `Power` terminology remains consistent with current design.
- [ ] Internal `pow` storage is not destructively migrated without a separate plan.
- [ ] “Gacha” remains only where mechanically or historically appropriate.

## Brand integrity

- [ ] Existing approved palette remains intact.
- [ ] Rarity, type, and character color systems remain distinct.
- [ ] The master brand is not framed as celestial or astrological.
- [ ] Current card presentation remains unchanged except for required naming cleanup.

## Build and functionality

- [ ] Dependencies install from a clean checkout.
- [ ] Production build succeeds.
- [ ] Lint passes or all remaining issues are documented.
- [ ] Automated tests pass or missing coverage is documented.
- [ ] App launches from the new `main`.
- [ ] Critical routes load.
- [ ] Pull flows work.
- [ ] Vault and library work.
- [ ] Battle entry, playback, pause, and results work.
- [ ] Admin tools load and retain current capabilities.
- [ ] No critical console or server errors remain unexplained.

## Deployment

- [ ] Deployment source uses `main` or an intentionally documented source.
- [ ] Environment configuration remains functional.
- [ ] No secrets were committed.
- [ ] Cache or service-worker behavior was reviewed.
- [ ] Production data was not reset or damaged.

## Documentation and closeout

- [ ] Active branch instructions now point to `main`.
- [ ] A residual legacy-name report is provided.
- [ ] Deferred technical debt is recorded.
- [ ] Work reports the exact commits and promotion method.

---

# 15. Required final report from Work

At completion, provide a structured report with these sections.

## 15.1 Branch promotion

- Previous `main` commit
- Source `Gacha` commit
- Final `main` commit
- Promotion method used
- Legacy branch or tag verified
- Whether force-with-lease was used
- Whether branch protection changed

## 15.2 Naming changes

Summarize updates to:

- UI
- Metadata
- Documentation
- Manifests
- Package information
- Assets
- Deployment configuration

## 15.3 Residual historical identifiers

List every meaningful remaining occurrence of:

- Commune TCG
- TCG Commune
- `commune-tcg`
- Gacha
- Old package or storage names

For each, state why it remains.

## 15.4 Validation performed

Report:

- Install command
- Build command and result
- Lint command and result
- Test command and result
- Manual routes tested
- Browser or device used
- Console or log findings

## 15.5 Deployment state

- Deployment provider
- Deployment branch
- Preview or production URL status
- Environment changes made
- Cache or service worker action taken

## 15.6 Deferred work

List technical debt or follow-up tasks that were deliberately not included.

## 15.7 Final recommendation

State whether:

- `Gacha` should remain temporarily
- `Gacha` is safe to delete
- A release tag should be created
- A new development branch convention should be adopted

---

# 16. Recommended post-promotion branch convention

After this migration, use:

- `main` as the stable canonical branch
- Short-lived feature branches from `main`
- Pull requests back into `main` for substantial work

Possible branch naming patterns:

```text
feature/<name>
fix/<name>
chore/<name>
docs/<name>
refactor/<name>
```

Do not recreate a long-lived catch-all branch that becomes the true product while `main` becomes stale again.

If a long-lived integration branch is later desired, define its purpose and deployment relationship explicitly.

---

# 17. Release naming recommendation

After successful promotion and verification, consider creating a release tag.

Possible tags:

- `imago-core-v1.0.0`
- `v1.0.0-imago-core`
- `imago-core-beta`

Choose a tag based on the actual product maturity. Do not call it a stable `v1.0.0` merely for ceremony if major systems are still in active beta.

A practical choice may be:

```text
imago-core-beta
```

or a dated release:

```text
imago-core-2026-07
```

Tag creation is optional unless separately approved.

---

# 18. Final directive

This migration should leave no uncertainty about the repository’s center of gravity.

Before the task:

```text
Gacha = actual modern product
main = obsolete historical product
```

After the task:

```text
main = canonical Imago Core product
legacy branch = preserved old product
Gacha = temporary migration reference, then optional removal
```

The central implementation rule is:

> **Promote the modern product. Do not blend it back into the obsolete one.**

The central naming rule is:

> **The game is Imago Core.**

The central scope rule is:

> **Stabilize, rename, validate, and promote. Do not turn this into the full architecture refactor.**
