# Phase 3 Verification Checklist

Use this checklist after Phase 3 patches.

## Install and build

- `npm install` completes
- `npm run build` completes
- App opens locally with `npm run dev`

## Route checks

- `#/battle` renders the battle hub
- `#/battle/encounters` renders the encounter list
- `#/battle/squad?encounter=training-yard-goblin` renders squad review
- `#/battle/squad?encounter=calendar-hydra` renders the medium encounter review
- `#/battle/results?encounter=training-yard-goblin` renders battle results
- Unknown hashes still fall back to `#/home`

## UI checks

- Bottom nav includes Battle and highlights it on all battle subroutes
- Encounter cards show difficulty, enemy power, energy cost, and reward preview
- Squad Builder uses `CardFrame.js` for active squad cards
- Battle Results uses `CardFrame.js` for participant cards
- Battle-specific layout comes from `src/styles/battle.css`

## Architecture checks

- No battle route mutates mock user resources
- No route defines a second card renderer
- Battle data remains isolated in `src/data/mockBattle.js`
- README and route map mention Phase 3 routes
- No backend binding is used yet
