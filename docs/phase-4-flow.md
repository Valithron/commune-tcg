# Phase 4 Flow Notes

## Scope

Phase 4 creates static front-end screens for card submission and admin moderation. It also drafts backend contracts for the future D1/R2 implementation.

## Submit flow

```text
#/library
  -> #/submit
```

The Submit Card screen shows the future form shape:

- Card name
- Category
- Rarity suggestion
- Flavor text
- POW / DEF / SPD
- Art upload placeholder

No data is submitted in Phase 4. The submit button is intentionally a preview-only link.

## Admin flow

```text
#/home
  -> #/admin
```

The Admin Dashboard shows:

- Static Library/pending/encounter counts
- Static submission moderation queue
- Approval checklist
- Future Cloudflare binding references

No moderation action is implemented in Phase 4.

## Implementation guardrails

- No route calls `env.DB` or `env.CARD_IMAGES` yet.
- `src/data/mockAdmin.js` is the only source for admin queue mock data.
- `src/routes/SubmitCard.js` and `src/routes/AdminDashboard.js` are layout-only screens.
- `src/styles/phase4.css` owns Submit/Admin layout.
- Backend contracts are documented before implementation in `docs/backend-contracts.md`.

## Future backend concerns

Before coding real writes, define:

- Authentication and admin authorization
- D1 table schema and migrations
- R2 image upload constraints
- Image size, crop, and moderation rules
- Card approval workflow
- Pull-pool eligibility rules
- Audit trail for admin changes
