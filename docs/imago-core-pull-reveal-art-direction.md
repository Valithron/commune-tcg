# Imago Core Pull and Reveal Art Direction

**Status:** Supporting implementation supplement 0.3  
**Canonical source:** Section 6 of `docs/imago-core-ui-art-bible.md`  
**Purpose:** Preserve the detailed Pull timing and interaction notes without creating a second visual authority.

If this supplement and the main UI Art Bible ever differ, the main UI Art Bible governs.

---

## 1. Locked experience

The Pull experience creates:

1. Anticipation
2. Discovery

The complete sequence is:

> **Browse banner → select pool → confirm in bottom sheet → six-second Core transition video → deep-navy reveal stage → card materialization → player-triggered reveal**

The Pull system has three responsibilities:

- The Pull page sells each pool.
- The bottom-anchored summon modal handles the transaction.
- The reveal sequence delivers the discovery.

---

## 2. Pull page

The default Pull page is a vertical catalog of full-width landscape banners.

It contains:

- A featured hero occupying roughly the top third
- Secondary event or themed banners below it
- A premium permanent Standard Summon
- Enough visible continuation to encourage scrolling

Pull 1 and Pull 5 controls do not appear on the default page.

All banners use a consistent chassis with stable:

- Aspect ratio
- Corner treatment
- Text-safe zones
- CTA position
- Timer position
- Crop behavior
- Press state

The featured hero may support a carousel later when multiple concurrent events exist. A single featured hero is correct for the current product.

Timed banners show a compact countdown without covering character art.

Standard Summon remains premium, permanent, and free of artificial urgency.

---

## 3. Locked summon modal bottom sheet

Tapping a banner opens the existing bottom-anchored modal sheet.

This behavior is locked.

The sheet:

- Is hidden by default
- Opens only after a banner is tapped
- Slides up from the bottom
- Remains anchored to the bottom edge
- Preserves its existing height and layout behavior
- Preserves backdrop dimming
- Preserves drag-to-close
- Preserves tap-outside and cancel dismissal
- Uses the same structural component for every pool
- Returns the user to the banner catalog when dismissed

Do not move the sheet to the center of the screen or replace it with a full-screen route.

The sheet contains:

- Selected pool identity
- Current Ticket balance
- Pull 1 option
- Pull 5 option
- Exact costs
- Rates control
- Confirm action
- Cancel action

Pull 1 is selected by default. Pull 1 and Pull 5 receive equal area.

The Rates control opens a dedicated rates and pool-details layer.

---

## 4. Six-second Core transition video

The user-created six-second video is required.

The video:

- Begins in the illustrated Core Commons
- Shows the Core machine spinning up
- Opens the portal
- Moves the camera into and through the machine
- Ends on a nearly black deep-navy background
- Hands off to the interactive reveal stage

Implementation must use the supplied video asset. It should not be replaced with a generic CSS zoom, loading screen, or unrelated animation.

If the final video file is not present in the repository, implementation should pause only to obtain the asset path or upload.

During playback:

- Pull input remains locked.
- Page chrome does not compete with the video.
- The video covers the active game stage cleanly.
- The final frame matches the reveal stage closely.
- The reveal payload is prepared without causing a visible gap after playback.

---

## 5. Reveal stage

The post-video reveal stage contains:

- Deep Imago navy, approximately `#070A18`
- Blue-gray mist across the lower third
- Sparse drifting particles
- Faint blue ambient bloom
- Optional subtle Core rings
- One centered card back for a single pull
- Five card backs for a five-pull

The card remains the dominant object.

---

## 6. Card materialization

Recommended single-pull sequence:

1. The navy stage settles.
2. Mist enters or thickens.
3. A short pause builds anticipation.
4. Small gold particles gather at center.
5. A subtle vertical distortion forms.
6. The card back materializes.
7. The card reaches full opacity.
8. A small settling motion completes formation.
9. The card waits for a tap.

---

## 7. Waiting state

The card back remains on screen until the player taps it.

Approved idle motion:

- 6 to 8 px vertical travel
- 5 to 6 second cycle
- Less than 2 degrees of rotational drift
- Subtle breathing glow

No rarity is confirmed before the tap.

---

## 8. Tap response and reveal

Tapping the card triggers:

1. Blue ripple or energy pulse across the card back
2. Core light, particles, or ring response
3. Optional high-rarity tell
4. Card flip
5. Face-up resolution and rarity confirmation

Legendary may use concentrated gold response.

Mythic may use violet-white rupture, restrained prismatic fracture, or an altered sound beat. Violet remains the anchor color.

---

## 9. Five-pull

A five-pull uses one major Core activation and the same six-second video.

After transit:

- Five card backs materialize.
- They form a comfortably spaced pentagon.
- Each card may be revealed in any order.
- Reveal All remains available until every card is face-up.
- Reveal All may flip simultaneously or use a rapid controlled cascade.

The pentagon is a presentation layout.

After all five are revealed, show:

- **View in Vault**
- **Pull Again**

---

## 10. Runtime safety

The cinematic layer must preserve existing Pull contracts:

- One idempotent pull request per confirmation
- No duplicate Ticket spend
- No duplicate ownership rows
- Correct Pull History entry
- Correct reveal payload
- Pull-to-Vault continuity
- Recoverable error handling

The interactive reveal should begin only when the transition requirement and reveal payload are both ready.

If the video ends first, hold the final navy stage briefly.

If the request fails, return the user to a clear error state without replaying or double-spending the pull.

---

## 11. Validation focus

Validate:

- Bottom-sheet position and gestures remain unchanged
- Pull 1 is selected by default
- Rates details open correctly
- Six-second video plays inline on phone browsers
- No visible flash between video and reveal stage
- Single-pull card materialization and tap reveal
- Five-pull spacing at compact widths
- Individual five-pull reveal
- Reveal All behavior
- Pull Again
- View in Vault
- Ticket deduction exactly once
- Pull History accuracy
- Vault ownership continuity
- Reduced-motion fallback
