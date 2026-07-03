# Phase 4 Verification Checklist

Use this checklist after Phase 4 patches.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Route checks

- `#/submit` renders the static Submit Card screen
- `#/admin` renders the static Admin Dashboard
- `#/library` includes a Submit Card entry point
- `#/home` includes Submit and Admin quick links
- Unknown hashes still fall back to `#/home`

## UI checks

- Submit Card route highlights Library in bottom nav
- Admin route highlights Home in bottom nav
- Submit/Admin screens use `phase4.css`
- Submit form is visibly preview-only
- Admin queue is visibly static/mock

## Architecture checks

- No route imports Cloudflare bindings directly
- No route writes to D1 or R2
- Mock admin data remains isolated in `src/data/mockAdmin.js`
- Backend planning lives in `docs/backend-contracts.md`
- README and route map mention Phase 4 routes
