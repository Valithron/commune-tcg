# Stitch Design Intake

Phase 1 is based on the two uploaded Stitch ZIP segments for the mobile gacha redesign.

## Canonical interpretation

The Stitch export contains multiple single-screen HTML mockups. These are design references, not production files. The production app should extract their useful patterns into reusable components and route renderers.

## Source systems

Two design systems were present in the export:

### Celestial Archive

Used as the app-wide shell reference.

Key traits:

- Dark mobile-first interface
- Glassmorphic panels
- Gold primary call-to-action treatment
- Blue functional accent
- Premium collector-vault mood
- Bottom-third thumb-friendly actions

### Commune TCG Design System

Used as the card-face reference.

Key traits:

- Card rarity frame system
- Sora card titles and stat values
- JetBrains Mono metadata labels
- Hanken Grotesk body copy
- Strict 2:3 card aspect ratio
- Rarity glow based on card tier

## Canonical labels

Updated-label screens are preferred over older wording.

| Preferred | Avoid unless intentionally restored |
|---|---|
| Pull | Summon |
| Pull Tickets | Summon currency |
| Vault | Inventory, owned library |
| Library | Global collection |
| Squad | Deck when referring to battle team |

## Phase 1 extracted patterns

- Deep dark shell with soft lavender-white text
- Gold primary CTA
- Glass panels with subtle borders
- Four-route mobile bottom nav
- Mock user resources in the top bar
- Centralized reusable card renderer
- Rarity chips and card glow classes

## Deferred screens

The following Stitch screens are intentionally deferred:

- Pull confirmation
- Pull results
- Legendary reveal
- Vault card detail
- Library card detail
- Ticket shop
- Battle hub
- Encounter selection
- Squad selection
- Battle results
- Submit Card
- Admin dashboard

These will be implemented in later phases after the Phase 1 component foundation is verified.
