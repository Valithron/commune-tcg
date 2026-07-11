# Changelog

All notable release-level changes are recorded here. Historical phase-by-phase implementation details remain under `docs/`.

## Imago Core Beta - 2026-07-11

### Added

- Imago Core product identity, metadata, install manifest, brand guide, and canonical palette tokens
- Server-enforced administrator allowlist with browser route policy and authorization tests
- Current developer guide, architecture map, asset inventory, technical-debt register, and beta release notes
- Branding contract tests for primary product surfaces and PWA metadata

### Changed

- Promoted the modern character-collection CCG identity from the historical Commune TCG/Gacha naming
- Updated player, sign-in, pull, admin, Worker error, health, and submission copy to Imago Core
- Aligned shared type presentation colors with the approved seven-type palette
- Corrected Cydney's authentication identity color to `#789461`
- Declared `main` as the canonical development and release branch

### Preserved for compatibility

- Internal `pow` storage while displaying ATK
- Cloudflare Worker name `commune-tcg-gacha`
- Repository slug `commune-tcg`
- Existing `commune-*` browser storage keys, battle seeds, cookies, and public asset filenames
- Production D1 and R2 data without reset, reseed, or destructive migration

### Security

- Restricted card, card-mechanics, submission-list, submission-detail, and submission-review admin APIs to authenticated administrator sessions

### Deployment verification

- Added a documentation-only commit directly to `main` after Cloudflare production was switched from `Gacha` to `main`, providing a clean deployment trigger and confirming the canonical release path.

### Deferred

- Full role/audit authorization model
- Versioned migration coverage for all runtime-created D1 tables
- Full modularization or framework migration
- Final Imago Core logo, favicon, PWA icon set, and social preview artwork
