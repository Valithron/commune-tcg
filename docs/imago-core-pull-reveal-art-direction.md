# Imago Core Pull and Reveal Art Direction

**Status:** Living draft 0.2  
**Relationship:** Canonical extension of Section 6 in `docs/imago-core-ui-art-bible.md` until the Pull section is consolidated into the main UI Art Bible.

---

## 1. Pull experience doctrine

The Pull experience should create two primary feelings:

1. Anticipation
2. Discovery

The Core machine opens a portal to a possible variant of one of the seven Commune members. This implies a soft multiverse without requiring explicit lore or exposition.

The full visual progression is:

> Browse pool → select banner → choose pull in modal sheet → activate Core → portal transit → reveal space → forming card → player-triggered reveal

The Pull system has three separate responsibilities:

> **The Pull page sells the fantasy of each pool.**  
> **The modal bottom sheet handles the transaction.**  
> **The reveal sequence delivers the discovery.**

These responsibilities should remain visually and functionally distinct.

---

## 2. Pull page purpose

The Pull page is a premium vertical summon catalog.

It should let the player browse active pools, understand which pool is featured, recognize limited-time availability, and select a summon opportunity without exposing transaction controls by default.

The default Pull page does not show Pull 1 or Pull 5 controls.

Those controls appear only after the player selects a banner and the modal bottom sheet opens.

The page may be more structured and block-like than Home because it is a catalog. Its banners should still feel like premium game content rather than ordinary application cards.

---

## 3. Pull page hierarchy

The governing order is:

1. Featured event hero
2. Secondary event banners
3. Standard Summon
4. Banner-selection modal bottom sheet
5. Rates and pool-details modal

The initial mobile viewport should show:

- The featured hero occupying roughly the top third
- One full secondary banner beneath it
- A second full banner where space permits
- The beginning of another banner at the lower edge, clearly signaling that the page continues

The page should invite vertical scrolling without making the first screen feel unfinished.

---

## 4. Featured event hero

The featured event hero is the dominant pre-pull visual.

It should use full-width landscape art and may include:

- Featured character art
- Featured card art
- Event or pool title
- Short pool tagline
- Clear call to action
- Limited-time status
- Time remaining
- Rate-up or event badge where applicable

The hero should occupy approximately the top third of the mobile screen. It should dominate the opening view while leaving enough of the next banner visible to communicate the vertical catalog below.

### 4.1 Concurrent featured events

The featured hero area should support a future carousel when multiple concurrent event pools exist.

Future carousel behavior should include:

- Automatic rotation between featured events
- Manual swipe or explicit pagination control
- Rotation pausing while the user interacts
- One featured hero visible at a time
- Each featured event also remaining discoverable in the vertical catalog

The current product may display only one featured hero without simulating additional events.

---

## 5. Secondary banner list

Secondary pools should appear as full-width landscape banners in a vertical list.

Each banner should feel visually complete and clearly tappable.

The list may include:

- Other limited events
- Character-focused pools
- Themed card sets
- Rate-up pools
- Seasonal pools
- Standard Summon

The banners should use consistent spacing, aspect ratio, corner treatment, and interaction behavior.

The artwork changes between pools. The chassis remains stable.

---

## 6. Banner chassis

Every pool banner should share a consistent structural system.

The chassis should define:

- Fixed or tightly controlled landscape aspect ratio
- Stable corner radius
- Border and shadow treatment
- Text-safe zones
- CTA location
- Timer location
- Pool-status or event badge location
- Predictable crop behavior
- Consistent press and selected states

A shared chassis allows new banner art to be created without redesigning the page.

The featured hero may use a more elaborate version of the same chassis while preserving the same underlying structure.

### 6.1 Banner hierarchy

Limited-event banners may use stronger animation, richer highlights, or event-specific accent treatment.

Standard Summon should feel premium and permanent. It should carry the same production quality and structural confidence as event banners while using calmer urgency and no countdown.

Standard Summon is foundational content, not leftover content.

---

## 7. Banner content rules

The banner itself should prioritize:

- Pool identity
- Character or card art
- CTA
- Limited-time status where applicable
- Time remaining where applicable

Detailed odds, complete pool contents, and long rules should not occupy the banner face.

Timed banners should show time remaining in smaller but conspicuous text placed in a protected area that does not obscure character art.

The banner should remain legible at mobile width and under common image crops.

---

## 8. Banner selection and modal bottom sheet

Tapping a banner opens a modal bottom sheet.

The bottom sheet is not displayed by default and is not part of the normal page layout.

The interaction flow is:

```text
Pull page
  ↓
Browse banners
  ↓
Tap a banner
  ↓
Modal bottom sheet opens
  ↓
Review pool and costs
  ↓
Choose Pull 1 or Pull 5
  ↓
Confirm Pull
  ↓
Six-second Core transition video
  ↓
Reveal space
```

The existing bottom-sheet structure and interaction should be preserved unless a later design decision explicitly changes it.

### 8.1 Bottom-sheet purpose

The bottom sheet handles the transaction.

It may display:

- Selected pool name
- Current ticket balance
- Current gold balance
- Pull 1 option
- Pull 5 option
- Exact costs
- Time remaining
- Rates button
- Pool-details access
- Featured cards or compact pool summary
- Pool-specific rules where necessary

Pull 1 should be selected by default.

Pull 1 and Pull 5 should receive equal screen area.

Cost clarity should remain strong.

### 8.2 Bottom-sheet visual treatment

The sheet should remain mostly functional.

A featured event may receive modest custom accents, a small header treatment, or a compact strip of event art, but the sheet skeleton should remain consistent across pools.

The selected banner and page behind the sheet should preserve the existing modal behavior.

---

## 9. Rates and pool details

Exact rates should open through a dedicated Rates control from the modal bottom sheet.

The Rates modal may include:

- Rarity rates
- Featured-card rates
- Complete pool contents
- Pool restrictions
- Time limits
- Duplicate behavior
- Pool-specific rules

This information should be precise and readable without forcing dense odds data onto the main Pull page.

The main page sells the pool. The Rates modal documents it.

---

## 10. Transition into the reveal space

A six-second transition video bridges the player from confirming a Pull into the card reveal.

The video begins in the illustrated Core Commons used on Home. The Core machine activates, the camera moves into the opened portal, and the room gives way to a nearly black navy-blue reveal background.

This establishes spatial continuity between Home and Pull. The player is using the machine already present in the Commons.

The transition video ends on a blank deep-navy stage ready for the interactive card sequence.

---

## 11. Reveal-space composition

The post-transition reveal space should be sparse and focused.

Primary elements:

- Deep Imago navy background, approximately `#070A18`
- Low translucent blue-gray mist across the lower third
- Sparse drifting particles
- Faint blue ambient bloom
- Optional extremely subtle concentric Core-ring presence behind the card
- One card back centered as the dominant object

The space should communicate depth while preserving a clean silhouette around the card.

---

## 12. Card-back materialization

After the transition ends, hold the empty navy stage briefly before the card appears.

Recommended sequence:

1. The navy reveal stage settles.
2. Mist enters or thickens across the lower third.
3. A short pause creates anticipation.
4. Small gold particles gather toward the center.
5. A subtle vertical distortion forms.
6. The card back materializes into the distortion.
7. The card reaches full opacity and gives a small settling motion.
8. The card waits for player input.

The materialization should feel like the variant has resolved into a collectible artifact.

---

## 13. Waiting state

The player must tap the card back to reveal it.

While waiting, the card should float with restrained motion:

- Approximately 6–8 px of vertical travel
- Approximately 5–6 second idle cycle
- Less than 2 degrees of rotational drift
- Subtle breathing glow

The waiting state should remain calm enough that the player controls the moment of revelation.

No rarity information is confirmed before the tap.

---

## 14. Tap response and reveal handoff

Tapping the card should trigger a short response before the flip:

1. A blue ripple or energy pulse crosses the card back.
2. The Core responds through light, particles, or a brief ring reaction.
3. A high-rarity tell may occur.
4. The card begins its flip.
5. Rarity is confirmed only when the card fully resolves face-up.

The complete single-pull sequence should feel moderately cinematic. The interactive reveal portion after the transition should remain concise, with the full result resolving quickly after the user taps.

---

## 15. Rarity tells

Rarity should remain hidden until the card resolves, but Legendary and Mythic pulls may receive a brief tell immediately before the flip.

The tell should create a clear spike of excitement without displaying the rarity outright.

Possible treatments:

- Legendary: concentrated gold flash, stronger metallic ring response, or heavier gold particle convergence
- Mythic: violet-white rupture, restrained prismatic fracture, altered sound beat, or a momentary abnormal Core response

Mythic prismatic treatment remains secondary to violet as required by the canonical brand guide.

---

## 16. Five-pull formation

A five-pull uses one major Core activation.

After portal transit, five card backs form and arrange into a pentagon presentation around the center of the reveal stage.

Rules:

- The cards should have comfortable spacing at mobile width.
- The arrangement is a presentation layout.
- Each card can be revealed individually.
- A clearly visible **Reveal All** control reveals the remaining cards.
- The player should retain agency over reveal pacing.
- Reveal All may use a simultaneous flip or a rapid controlled cascade.

The existing pentagon concept is retained, with spacing and balance refined.

---

## 17. Motion hierarchy

Pull motion should follow a clear hierarchy:

1. Banner motion supports browsing and event identity.
2. Modal motion confirms selection and transaction state.
3. Transition video provides the major camera movement.
4. Mist and particles provide restrained atmospheric motion.
5. Card materialization provides the focal event.
6. Card idle motion maintains anticipation.
7. Tap response initiates the rarity tell and flip.
8. Face-up resolution becomes stable enough for inspection.

Only one major event should command attention at a time.

---

## 18. Locked decisions

The following decisions are locked for the current direction:

### Pull page

- The Pull page is a vertical catalog of summon banners.
- The default page does not display Pull 1 or Pull 5 controls.
- The featured hero occupies roughly the top third.
- The featured hero uses full-width landscape art.
- Future concurrent featured events may rotate through a carousel.
- Secondary pools appear as full-width landscape banners.
- The page should show one to two full banners beneath the hero and part of another to encourage scrolling.
- All banners use a consistent chassis.
- Standard Summon remains premium and permanent.
- Detailed rates open through a separate modal.
- Timed banners show time remaining without obscuring art.

### Modal transaction flow

- Tapping a banner opens a modal bottom sheet.
- The bottom sheet is hidden by default.
- The current bottom-sheet interaction is retained.
- Pull 1 is selected by default.
- Pull 1 and Pull 5 receive equal area.
- Costs remain prominent and clear.
- The sheet remains mostly functional, with limited event-specific customization.

### Reveal flow

- Pull creates anticipation and discovery.
- The Home Core machine transitions into Pull operation.
- A six-second video carries the player from the Commons through the portal.
- The reveal begins on a blank deep-navy screen.
- Mist appears across the lower third.
- The card back materializes and waits for a tap.
- The card floats slowly while waiting.
- Tap triggers a Core response before the flip.
- Rarity is confirmed only when the card fully resolves.
- High rarities may receive a brief pre-flip tell.
- Single pulls are moderately cinematic.
- Five pulls form as five card backs in a pentagon.
- Cards may be revealed individually or through Reveal All.

---

## 19. Open Pull decisions

The following questions remain open:

1. Exact featured-banner text-safe-zone rules
2. Exact carousel pagination treatment
3. Exact banner CTA treatment
4. Exact timing from card materialization through face-up resolution
5. Exact Legendary and Mythic tell language
6. Reveal All behavior: simultaneous flip or rapid cascade
7. Post-reveal result layout
8. Placement and timing of `NEW`, duplicate count, ownership, level, or shard information
9. Pull-again control placement
10. Audio and haptic direction
11. Reduced-motion version of the sequence
