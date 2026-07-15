# Imago Core UI Art Bible

**Status:** Living draft 0.2  
**Current locks:** Home screen, Pull page, Pull transition, and Pull reveal art direction  
**Current open areas:** Battle, Battle Results, Vault, Library, Card Inspection, broader modal system, and route-specific navigation polish  
**Purpose:** Define screen-level visual direction before implementation work is handed to Codex.

---

## 1. Purpose of this document

This UI Art Bible translates the canonical Imago Core Visual Brand Guide into actionable screen-level art direction.

It exists to prevent the interface from drifting into a dashboard made of stacked panels. Imago Core is a premium anime character-collection game. Its interface should feel like a designed game space where collectible character artifacts are displayed, claimed, used, and preserved.

This document governs:

- Screen composition
- Visual hierarchy
- Art placement
- Motion hierarchy
- Color behavior
- Material treatment
- Interaction presentation
- Cinematic versus functional balance
- Mobile rhythm
- Codex translation rules

This document is not implementation code and is not a Codex work order. It is the visual authority that later work orders must preserve.

---

## 2. Relationship to the canonical brand guide

This document is subordinate to the canonical **Imago Core Visual Brand Guide**.

The governing brand concept remains:

> **Human identity forged into collectible artifacts.**

The permanent brand doctrine remains:

> **The person is the treasure.**  
> **The card is the artifact.**  
> **The Core preserves identity across every variant.**  
> **Character color identifies the person.**  
> **Type color identifies affinity.**  
> **Rarity color identifies collectible value.**  
> **Gold identifies prestige and priority.**  
> **Blue identifies the system.**  
> **Art dominates. Mechanics remain clear.**  
> **Personal mythology elevates identity without replacing it.**

The brand guide defines what Imago Core should feel like. This UI Art Bible defines how that feeling should appear on actual screens.

---

## 3. Core UI design doctrine

### 3.1 Desire first, direction second

The user should want to play before they finish reading the screen.

The interface should create desire through:

- Character art
- Atmosphere
- Rarity
- Personal identity
- Premium material treatment
- Controlled motion
- Clear reward anticipation

Functional direction must remain obvious, but it should not visually overpower the game world.

The governing sequence is:

> **Desire first, then direction.**

### 3.2 Screens should have distinct jobs

Each major screen should carry one primary responsibility.

- Home establishes the world and central player loop.
- Pull sells the fantasy of each summon pool.
- The summon modal handles the transaction.
- The transition video activates the Core machine.
- The reveal stage delivers anticipation and discovery.
- Vault presents ownership.
- Library presents knowledge and completion.
- Battle activates the collection.
- Results confirm consequence and reward.

Do not force all responsibilities into one screen.

### 3.3 Actions should become invitations

Primary actions should feel like invitations into play rather than ordinary web controls.

Examples:

- Daily Ticket is a claimable smart action.
- Featured Card is an artifact displayed through the Core machine.
- Battle is a strong lower gate or banner.
- Pull banners invite the user into a specific summon pool.
- A card back waiting for a tap gives the player control over the reveal moment.

### 3.4 Premium does not mean crowded

Visual richness should come from:

- Art dominance
- Material depth
- Controlled glow
- Strong focal hierarchy
- Rarity accents
- Character-color details
- Core and Imprint motifs
- Deliberate motion
- Purposeful negative space

Visual richness should not depend on:

- Repeated panels
- Constant sparkles
- Gold borders on every surface
- Excessive explanatory copy
- Competing animations
- Dense icon clusters
- Multiple equally loud calls to action

### 3.5 Cards are the scalable character representation

Cards and card art are the primary scalable carrier of character identity.

The seven Commune members may eventually receive ambient sprites or other representations, but that is not a foundational requirement. User-submitted cards will not share one costume, era, or world. The card system itself must remain the consistent visual throughline.

---

## 4. Mobile-first composition rules

### 4.1 One dominant read

Every major mobile screen should answer within one second:

1. What is this place?
2. What matters most here?
3. What can I tap now?

### 4.2 Preserve readable layers

A strong screen usually has three visual layers:

1. **World or art layer**
2. **Primary interactive layer**
3. **Compact information layer**

Do not merge all three into one dense card stack.

### 4.3 Avoid stacked-panel gravity

Mobile layouts naturally collapse into vertical stacks. That pattern is acceptable for admin tools, forms, settings, and dense management screens.

It should not govern Home, Pull hero presentation, reveal sequences, Battle, or Results.

### 4.4 Negative space must be intentional

Good negative space:

- Frames the featured art portal
- Separates side hotspots
- Gives banners clear visual rhythm
- Leaves room around the waiting card back
- Keeps reward moments legible

Bad negative space:

- Appears because content is weakly positioned
- Separates unrelated blocks without visual purpose
- Expands explanatory copy into empty sections
- Makes a screen feel unfinished

### 4.5 Touch clarity

Every interactive element must remain visibly tappable.

World-integrated objects may carry atmosphere, but labels, states, and hit areas must remain clear.

### 4.6 Mobile rhythm

Use the canonical 4px spacing scale:

- 4px for optical adjustment
- 8px for icon and chip gaps
- 12px for compact groups
- 16px for standard padding
- 20px for comfortable panel padding
- 24px for section separation
- 32px for major composition gaps

---

## 5. Home page art direction

**Lock status:** Locked for current direction.

### 5.1 Home purpose

Home is the front lobby, front cover, and first impression of Imago Core.

It should create two immediate feelings:

1. Personal connection to the seven characters
2. Desire to collect and use their variants

Home should feel like entering the place where the collection lives.

### 5.2 Primary metaphor: The Core Commons

The Home page is **The Core Commons**.

The Core Commons is a front-facing magical-tech chamber with restrained lounge warmth. It is a premium shared environment where the Commune's collectible identities are displayed, activated, and sent into battle.

### 5.3 Environmental character

The Core Commons should combine:

- Deep navy architecture
- Dark glass
- Refined metal
- Cool premium lighting
- Controlled gold accents
- Blue system-lit mechanics
- A central Core machine
- Sparse lounge elements
- Subtle evidence of the seven Commune members
- Dim dormant sockets for future features

Lounge elements should remain barely present to moderate.

Possible elements:

- Low seating silhouettes
- Side tables
- Shelves or display ledges
- Soft practical lights
- Personal objects
- Fabric or cushion accents
- Character-color details

Possible Commune identity marks:

- Seven plaques
- Seven color accents
- Initial marks
- Personal object silhouettes
- Inset symbols
- Sevenfold structural divisions around the Core

### 5.4 Camera and perspective

The Home scene should be mostly front-facing with only slight top-down perspective.

It should read like a premium mobile game lobby stage. It should remain centered, spatial, and easy to understand on a phone.

### 5.5 Locked Home composition

```text
[ Glass resource/account rail ]

        [ vertical oval featured-art portal ]
        [ rarity-colored luminous border ]
        [ slow hover motion ]

             [ rotating Core machine ]
             [ attached nameplate ]

 [ hotspot ]                         [ hotspot ]
 [ hotspot ]                         [ hotspot ]
 [ hotspot ]                         [ hotspot ]

            [ Enter Battle gate ]

[ Separate bottom navigation rail ]
```

The featured portal and Core machine occupy the center top third of the usable screen beneath the resource rail.

### 5.6 Central Core machine

The Core machine is the Home page's main symbolic object.

Its approved visual language:

- Rotating concentric circles
- Segmented rings
- Dark-glass lens structure
- Gold central aperture or edge
- Blue system-lit inner mechanics
- Seven restrained divisions
- Imprint-line detailing

The machine should feel manufactured, active, and premium.

### 5.7 Featured Card presentation

The Featured Card appears as card art inside a vertical oval Imago portal above the Core machine.

Rules:

- Show card art only inside the portal.
- Use the card's rarity color on the portal border and outer glow.
- Keep the rarity edge slightly transparent.
- Add slow vertical hover motion.
- Keep the character face readable.
- Make the portal tappable to open the full card.
- Avoid placing card text over the art.

The Featured Card should communicate collection value and make the player want to use the card in Battle.

### 5.8 Attached nameplate

Card identity information belongs on a compact nameplate attached to the Core machine.

The nameplate may include:

- Card title
- Character identity
- Rarity
- Type
- Optional compact level or stat hint

Use dark glass, compact typography, and restrained identity markers.

### 5.9 Home hotspots

Home supports up to six side hotspots, approximately three per side.

Planned socket families:

1. Daily Ticket / Shop
2. Garden
3. Roulette or prize feature
4. Quests / Missions
5. Gift / Inbox
6. Seasonal

Dormant future sockets should remain visible as dim environmental objects. They imply scale and future progression without pretending unavailable features already work.

### 5.10 Hotspot labels

Hotspots must have always-visible labels.

Labels should be:

- Short
- High contrast
- Integrated with the object
- Supported by a clear icon where useful
- Dimmed when dormant

### 5.11 Daily Ticket / Shop smart socket

Daily Ticket and Shop share one hotspot.

Before claim:

> **Claim Daily Ticket**

Approved attention state:

- Restrained prismatic glow
- Pulsing rainbow edge
- Small sparkle or glint
- Clear visual priority

After claim:

> **Shop**

The prismatic effect disappears after claim.

### 5.12 Battle invitation

Battle is the main outgoing invitation from Home.

Use a strong lower banner, threshold, or gate integrated with the scene.

Preferred user-facing label:

> **Enter Battle**

Battle should be prominent without overpowering the featured portal.

### 5.13 Top resource rail

The top resource and account rail should behave as a compact glass overlay.

It may contain:

- Tickets
- Gold
- Energy
- Account identity
- Menu and logout access

It should preserve scene visibility and avoid compressing Home into a header-heavy layout.

### 5.14 Bottom navigation

The bottom navigation rail remains separate from the room.

It is a persistent game navigation system with clear touch targets and stable placement.

### 5.15 Governing Home asset

The governing illustrated asset is:

`public/assets/home-background.png`

The application path is:

`/assets/home-background.png`

The scene is a responsive 9:16 stage. Interactive overlays align to the illustrated room rather than rebuilding the room with panels.

### 5.16 Locked overlay reference

Current approved percentage-based layout reference:

- `topRail`: x 4, y 1.5, w 92, h 7
- `nameplate`: x 31.5, y 9.4, w 36.8, h 3
- `portal`: x 36.9, y 18.6, w 26.2, h 19.8
- `coreSummon`: x 41.6, y 46.4, w 17, h 9.2
- `daily`: x 79.5, y 19.4, w 13.5, h 9.3
- `library`: x 79.9, y 30.7, w 13.5, h 9.3
- `vault`: x 79.6, y 41.5, w 13.5, h 9.3
- `battle`: centered above the bottom navigation

These values are implementation references, not a replacement for visual review on real phone widths.

---

## 6. Pull page and reveal art direction

**Lock status:** Locked for current direction.

### 6.1 Pull experience purpose

Pull should create:

1. Anticipation
2. Discovery

The Core machine opens a portal to a possible variant of one of the seven Commune members. This suggests a soft multiverse without requiring explicit lore.

The complete visual progression is:

> **Browse banner → select pool → confirm pull → activate Core → pass through portal → form card → tap to reveal**

### 6.2 Separation of responsibilities

The Pull experience has three distinct layers:

1. **Pull page:** sells the fantasy and identity of each pool.
2. **Summon modal bottom sheet:** handles the transaction.
3. **Reveal sequence:** delivers the reward.

Do not place all three layers on the default Pull page.

### 6.3 Default Pull page state

The default Pull page is a vertical catalog of full-width landscape summon banners.

The default page must not display Pull 1 or Pull 5 controls.

The player first browses and selects a banner.

### 6.4 Pull page hierarchy

The page order is:

1. Featured event hero
2. Secondary featured or limited banners
3. Additional themed or seasonal banners
4. Standard Summon

The page is allowed to use a more structured chassis than Home because it functions as a catalog. Its blocks should still feel like premium event graphics rather than ordinary app cards.

### 6.5 Featured hero banner

The featured hero occupies roughly the top third of the mobile screen.

It should:

- Dominate the first view
- Use full-width landscape art
- Show featured cards, character art, or sprites
- Carry the pool name
- Carry a clear CTA
- Show time remaining for limited pools
- Preserve a safe text area
- Leave enough of the next banner visible to signal vertical scrolling

### 6.6 Featured carousel support

The hero area should support multiple concurrent featured events later.

Future carousel behavior:

- Manual swipe or explicit controls remain available.
- Automatic rotation may be added later.
- Auto-rotation pauses during interaction.
- Only the hero area rotates.
- The vertical banner list remains stable beneath it.
- A single featured event is fully valid for the current version.

### 6.7 Secondary banner rhythm

Below the hero, the preferred mobile rhythm is:

- One full secondary banner
- One additional full banner
- A third banner partially visible at the bottom edge

This creates a clear invitation to continue scrolling.

### 6.8 Banner chassis

Every pool uses a consistent structural chassis.

The chassis should define:

- Stable aspect ratio
- Shared corner treatment
- Protected art crop behavior
- Safe title area
- CTA position
- Optional timer position
- Pool badge position
- Border and glow behavior
- Mobile text limits

Artwork changes by pool. The page skeleton remains stable.

### 6.9 Banner information

A banner should communicate the pool fantasy with minimal text.

Always-visible information may include:

- Pool name
- CTA
- Featured status
- Limited-time status
- Countdown where applicable
- Short theme or rate-up label

Detailed odds and pool rules belong in modal layers.

### 6.10 Limited-event timers

Timed banners should show time remaining in a conspicuous but compact position.

The timer may sit on the banner or immediately below it. It must preserve the artwork and remain easy to scan.

### 6.11 Standard Summon

Standard Summon remains premium and permanent.

It should communicate stability through:

- Strong branded art
- Premium framing
- No urgency timer
- Slightly calmer glow than limited events
- Clear always-available language

The existing Standard Summon banner art direction is approved and may be replaced later if better art is created.

### 6.12 Banner selection behavior

Tapping a banner opens the **existing bottom-anchored modal sheet** for that pool.

This behavior is locked.

The sheet:

- Is hidden by default
- Opens only after a banner is tapped
- Slides up from the bottom edge
- Remains anchored to the bottom
- Preserves its current height and layout behavior
- Preserves backdrop dimming
- Preserves drag-to-close behavior
- Preserves tap-outside and cancel dismissal
- Returns the user to the same banner catalog position when closed
- Uses the same structural component for every pool

Do not convert it into a centered dialog, floating middle card, or full-screen route.

### 6.13 Summon modal content

The bottom sheet contains:

- Selected pool identity
- Current Ticket balance
- Pull 1 option
- Pull 5 option
- Cost for each option
- Rates button
- Confirm action
- Cancel action

Pull 1 is selected by default.

Pull 1 and Pull 5 receive equal screen area.

Costs remain explicit and readable.

The sheet may receive limited visual customization for a major event, but its structure and behavior remain consistent.

### 6.14 Rates and pool details

The Rates control opens a dedicated modal or details layer.

That layer may contain:

- Exact rarity odds
- Featured-card odds
- Full pool contents
- Pool-specific rules
- Limited restrictions
- Duplicate handling notes where required

Detailed rate information should not crowd the banner catalog.

### 6.15 Locked pre-reveal flow

```text
Pull page
    ↓
User taps a banner
    ↓
Bottom-anchored summon modal opens
    ↓
Pull 1 is selected by default
    ↓
User may select Pull 5 or inspect Rates
    ↓
User confirms
    ↓
Six-second Core transition video plays
    ↓
Deep-navy reveal stage appears
    ↓
Card back or five card backs materialize
    ↓
Player taps to reveal
```

### 6.16 Six-second transition video

A user-created six-second video is the required bridge from pull confirmation into the reveal stage.

The video:

- Begins in the Home Core Commons background
- Shows the central Core machine spinning up
- Opens the portal
- Moves the camera into the machine
- Carries the camera through the portal
- Ends on a nearly black deep-navy background
- Hands off cleanly to the interactive card materialization sequence

This video is a core part of the summon experience and should be treated as the first phase of the pull animation.

Implementation must use the supplied video asset. Do not replace it with a generic CSS zoom or an unrelated loading animation. If the video file is not yet present in the repository, the implementation thread should pause only to obtain the final asset path or upload.

### 6.17 Transition behavior

During the video:

- Pull input is locked.
- The transition should play without page chrome competing for attention.
- The video should cover the active game stage cleanly.
- The final frame should visually match the reveal background closely enough to avoid a visible cut.
- The reveal stage should initialize before or during the final portion of playback so the handoff feels immediate.

### 6.18 Reveal stage composition

After the video ends, the reveal space contains:

- Deep Imago navy background, approximately `#070A18`
- Low translucent blue-gray mist across the lower third
- Sparse drifting particles
- Faint blue ambient bloom
- Optional extremely subtle Core-ring presence behind the card
- One centered card back for a single pull
- Five card backs for a five-pull

The background should communicate depth while preserving a clean silhouette around the cards.

### 6.19 Card-back materialization

Recommended single-pull sequence:

1. The navy stage settles.
2. Mist enters or thickens across the lower third.
3. A short pause creates anticipation.
4. Small gold particles gather toward the center.
5. A subtle vertical distortion forms.
6. The card back materializes into the distortion.
7. The card reaches full opacity.
8. A small settling motion completes formation.
9. The card waits for player input.

The materialization should feel like a possible variant resolving into a collectible artifact.

### 6.20 Waiting state

The card back remains on screen until tapped.

Approved idle motion:

- Approximately 6 to 8 px of vertical travel
- Approximately 5 to 6 second idle cycle
- Less than 2 degrees of rotational drift
- Subtle breathing glow

The player controls the reveal moment.

No rarity is confirmed before the tap.

### 6.21 Tap response

Tapping the card triggers a short response before the flip:

1. A blue ripple or energy pulse crosses the card back.
2. The Core responds with light, particles, or a restrained ring reaction.
3. A high-rarity tell may occur.
4. The card begins its flip.
5. Rarity is confirmed when the card fully resolves face-up.

### 6.22 Rarity tells

Rarity remains hidden until the card resolves.

Legendary and Mythic pulls may receive a brief tell immediately before the flip.

Approved direction:

- **Legendary:** concentrated gold flash, stronger metallic ring response, or heavier gold particle convergence
- **Mythic:** violet-white rupture, restrained prismatic fracture, altered sound beat, or abnormal Core response

Violet remains the Mythic anchor. Prismatic color is secondary.

### 6.23 Single-pull pacing

The single-pull reveal should be moderately cinematic.

The six-second video provides the major camera movement. The interactive stage should then move efficiently from materialization to player tap to face-up resolution.

The reveal should feel valuable without becoming slow during repeated play.

### 6.24 Five-pull formation

A five-pull uses one major Core activation and the same six-second transition video.

After portal transit:

- Five card backs materialize.
- They arrange into a well-spaced pentagon presentation.
- The pentagon is a layout, not a lore symbol.
- Each card may be revealed individually in any order.
- A visible **Reveal All** control reveals the remaining cards.
- Reveal All may use a simultaneous flip or a rapid controlled cascade.

Spacing must be tested at compact phone widths.

### 6.25 Five-pull agency

The player should retain control over reveal pacing.

Before all cards are revealed:

- Individual card taps remain available.
- Reveal All remains visible.

After all cards are revealed:

- Reveal controls retire.
- Result actions appear.

### 6.26 Post-reveal direction

The exact final result layout remains open, but the current direction should preserve:

- Full card readability
- Clear `NEW` or duplicate status
- Ownership consequence
- Pull Again access
- View in Vault access
- Fast continuation after the user has inspected the result

For five-pulls, the established direction remains:

- Reveal cards in the pentagon
- Allow individual reveal or Reveal All
- Show **View in Vault** and **Pull Again** after all five are revealed

### 6.27 Pull motion hierarchy

Pull motion follows this priority:

1. Six-second transition video
2. Mist and atmospheric motion
3. Card materialization
4. Card waiting motion
5. Tap response
6. Rarity tell
7. Card flip
8. Stable face-up inspection

Only one major event should command attention at a time.

---

## 7. Battle page art direction

**Lock status:** Open for interview.

Working purpose:

> Battle is where collectible artifacts become active.

Battle must communicate:

- Squad readiness
- Enemy or encounter identity
- Energy cost
- Reward stakes
- Tactical clarity
- Active danger

Possible directions to resolve:

- Tactical squad setup
- Arena or challenge gate
- Card-versus-card duel stage
- Mission preparation screen

Battle should feel more active than Vault and Library while remaining mechanically readable.

---

## 8. Battle Results and reward art direction

**Lock status:** Open for interview.

Working purpose:

> Results confirm consequence, reward, and progression.

Temporary rules:

- Results are readable first.
- Rewards feel earned.
- Gold marks meaningful reward moments.
- Progression should be visible.
- The player can proceed quickly.
- Victory and defeat need distinct emotional treatment.

Open decisions:

- Cinematic versus fast-functional balance
- MVP presentation
- Reward animation
- XP and level-up treatment
- Defeat recovery flow

---

## 9. Vault and Library art direction

**Lock status:** Open for interview.

Working distinction:

- **Vault:** ownership, preservation, tactile value
- **Library:** knowledge, catalog, completion, missing entries

Temporary rules:

- Cards remain the visual heroes.
- Filters and search stay compact.
- Collection grids may use structured surfaces.
- These routes should be more functional than Home and Pull.
- Functional structure should still feel premium.

---

## 10. Modal and card inspection art direction

**Lock status:** Partially locked.

### 10.1 Modal principle

A modal should isolate one decision or one object.

Modal content should remain focused and visually subordinate to the card, action, or decision being presented.

### 10.2 Pull modal exception

The summon confirmation control is specifically a **bottom-anchored modal sheet**.

Its existing position, drag behavior, backdrop, and dismissal pattern are locked under Section 6.

### 10.3 Card inspection

Working purpose:

> Card inspection should feel like bringing a premium collectible close to the viewer.

Temporary rules:

- The full card remains dominant.
- Supporting stats orbit the card.
- Actions remain clear.
- Modal chrome uses dark glass.
- Inspection should communicate ownership and value.

---

## 11. Navigation and resource display direction

### 11.1 Top resources

Top resources behave as compact HUD information.

On Home, they appear as a glass overlay above the illustrated scene.

On functional pages, they may use a more standard arrangement while avoiding a heavy web-app header.

### 11.2 Bottom navigation

Bottom navigation remains stable, separate, and immediately understandable.

System Blue may identify the active route. Gold should appear only when a prestige action genuinely requires it.

### 11.3 Resource color roles

- Gold currency may use Core Gold.
- Energy should use a functional system treatment.
- Tickets may use gold or prismatic emphasis only in special claimable or premium states.
- Resource pills should not compete with rarity colors.

---

## 12. Typography hierarchy

Typography follows the canonical brand guide.

### 12.1 Libre Caslon Text

Use for:

- Major hero titles
- Event headings
- Victory and defeat moments
- Collection milestones
- Human and literary emphasis

### 12.2 Sora

Use for:

- Buttons
- Card titles
- Screen headings
- Battle labels
- Major statistics
- Strong action labels

### 12.3 Hanken Grotesk

Use for:

- Body copy
- Ability explanations
- Forms
- Empty states
- System messages

### 12.4 JetBrains Mono

Use for:

- ATK, DEF, SPD, and PWR
- Resource counts
- Rates
- Metadata
- Rarity initials
- Technical labels

### 12.5 Spectacle-screen copy rule

Home, Pull hero banners, reveals, and Results should avoid paragraphs.

Use short titles, compact labels, concise CTA copy, and small metadata.

---

## 13. Panel, glass, border, glow, and ornament rules

### 13.1 Glass

Glass is appropriate for:

- Top resource overlays
- Nameplates
- Compact hotspot labels
- Modal surfaces
- Functional overlays

Glass should not become the default answer for every Home or Pull element.

### 13.2 Gold

Gold identifies what matters most right now.

Use gold for:

- Core accents
- Primary action emphasis
- Major reward states
- Legendary rarity
- Premium edges
- Selected or completed states

### 13.3 Blue

Blue identifies system behavior.

Use blue for:

- Interface activity
- Processing
- Focus states
- Technical details
- Secondary actions
- Tap response on the card back

### 13.4 Rarity colors

Rarity color belongs on:

- Featured portal borders
- Card frames
- Reveal effects
- Rarity badges
- Limited accent rules

Rarity color should not recolor whole screens.

### 13.5 Character colors

Character colors identify the person.

Use them for:

- Identity chips
- Filters
- Collection summaries
- Subtle Commune marks
- Compact progression cues

### 13.6 Prismatic effects

Prismatic treatment is reserved for:

- Unclaimed Daily Ticket attention state
- Mythic secondary reflection
- Deliberately approved special reward moments

It should remain rare and valuable.

---

## 14. Motion principles

### 14.1 Standard interaction motion

Use fast, restrained response for normal controls:

- Press scale
- Opacity response
- Edge light
- Short glint
- Smooth modal movement

### 14.2 Home idle motion

Approved Home idle motion:

- Featured art portal hover
- Slow Core ring rotation
- Faint blue system movement
- Restrained Daily Ticket glint

### 14.3 Pull motion

Pull is one of the game's primary cinematic moments.

Its major motion comes from the six-second transition video. The interactive reveal stage should then narrow attention through mist, materialization, waiting, tap response, and card flip.

### 14.4 Reduced motion

Reduced-motion presentation should preserve:

- Color
- State
- Hierarchy
- Static glow
- Reveal order

It should reduce or remove:

- Camera motion
- Repeated hovering
- Traveling particles
- Parallax
- Repeated shimmer

A reduced-motion alternative for the six-second video remains an implementation decision. It should preserve the transition from Core activation to reveal stage without requiring full camera movement.

---

## 15. Do and don't examples

### 15.1 Home

Do:

- Build Home as a scene with landmarks.
- Center the Core machine.
- Display featured art in the oval portal.
- Use six side sockets as long-term capacity.
- Make Daily Ticket unmistakable when claimable.
- Give Battle a strong lower invitation.

Don't:

- Stack Home actions as ordinary cards.
- Let the Featured Card occupy the whole screen.
- Fill Home with explanatory copy.
- Make every object glow at the same priority.
- Hide tap targets inside decorative art.

### 15.2 Pull page

Do:

- Use a dominant featured hero.
- Use a vertical list of full-width landscape banners.
- Keep a consistent chassis.
- Make Standard Summon feel permanent and premium.
- Show limited timers clearly.
- Open the summon bottom sheet only after banner selection.

Don't:

- Show Pull 1 or Pull 5 controls on the default page.
- Turn the page into a store grid.
- Give every banner equal visual priority.
- Move the summon sheet to the center of the screen.
- Replace the supplied transition video with a generic loading effect.

### 15.3 Reveal

Do:

- Use the six-second Core transition video.
- End on a matching deep-navy stage.
- Let the card back materialize through mist and particles.
- Wait for the player's tap.
- Keep rarity hidden until resolution.
- Preserve individual and Reveal All control for five-pulls.

Don't:

- Confirm rarity before the card resolves.
- Fill the reveal stage with UI chrome.
- Let multiple effects compete at once.
- Rush past the waiting card back.
- Use the pentagon as a mystical symbol.

### 15.4 Global UI

Do:

- Let art carry emotional weight.
- Keep mechanics clear.
- Keep gold scarce.
- Use blue for system behavior.
- Preserve separate rarity, type, and character color roles.
- Protect faces and identity.

Don't:

- Collapse all color systems into one theme.
- Use generic cosmic decoration as the default.
- Turn premium framing into visual clutter.
- Make functional screens sterile.
- Make cinematic screens unreadable.

---

## 16. Codex translation guidance

This document guides later implementation. It does not replace a scoped work order.

### 16.1 Home implementation rule

> **Implement Home as an illustrated scene with labeled interactive landmarks.**

Preserve:

- Governing Home background asset
- Central Core machine
- Featured oval portal
- Attached nameplate
- Side hotspot sockets
- Daily Ticket / Shop smart state
- Enter Battle gate
- Glass top rail
- Separate bottom navigation

### 16.2 Pull implementation rule

> **Implement Pull as a banner catalog, a locked bottom-anchored summon modal, and a separate cinematic reveal sequence.**

Preserve:

- Featured hero at the top
- Vertical full-width banner list
- Consistent banner chassis
- Premium Standard Summon
- Hidden-by-default pull controls
- Existing bottom-sheet anchoring and dismissal behavior
- Pull 1 default selection
- Rates details layer
- Six-second user-created transition video
- Deep-navy mist reveal stage
- Tap-to-reveal card back
- Five-card pentagon with individual reveal and Reveal All

### 16.3 Scope discipline

Codex should avoid broad refactors while implementing visual direction.

Preserve:

- Pull API behavior
- Ticket costs
- Pool odds
- Idempotency
- Ownership persistence
- Pull history
- Existing telemetry contracts
- Existing authentication and resource ownership

### 16.4 Validation expectations

Every Home or Pull implementation should be checked on:

- Compact mobile width
- Typical phone width
- Desktop shell
- Touch interaction
- Keyboard focus where applicable
- Reduced motion
- Authenticated preview data
- Pull-to-Vault ownership continuity

---

## 17. Open questions and future design decisions

Home and Pull are locked enough for implementation.

Remaining major art-direction interviews:

1. Battle setup composition
2. Battle arena presentation
3. Battle Results and MVP treatment
4. Reward animation and progression feedback
5. Vault ownership presentation
6. Library completion presentation
7. Card inspection layout
8. Global modal family beyond the locked summon sheet
9. Seasonal Home socket treatment
10. Garden visual metaphor
11. Roulette visual metaphor
12. Quest and mission presentation
13. Gift and inbox presentation
14. Pull post-reveal result layout
15. Exact Legendary and Mythic sound and haptic language
16. Reduced-motion replacement for the six-second Pull video

Next recommended discussion area:

> **Battle page philosophy and battle setup composition.**
