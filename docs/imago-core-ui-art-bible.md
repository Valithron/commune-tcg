# Imago Core UI Art Bible

**Status:** Living draft 0.1  
**Current lock:** Home screen art direction  
**Current open area:** Pull, Battle, Results, Vault, Library, Card Inspection, Modal, Navigation, and Resource-display philosophy  
**Purpose:** Define screen-level visual direction before implementation work is handed to Codex.

---

## 1. Purpose of this document

This UI Art Bible translates the canonical Imago Core brand guide into actionable screen-level art direction.

It exists to prevent the interface from drifting into a dashboard made of stacked panels. Imago Core is a premium anime character-collection game. Its interface should feel like a designed game space where collectible character artifacts are displayed, claimed, used, and preserved.

The document should guide future visual and implementation decisions without becoming implementation code. It should describe composition, hierarchy, mood, material, color behavior, motion logic, and user-facing screen philosophy.

This is not a Codex work order. It is an art-direction source.

---

## 2. Relationship to the canonical brand guide

This document is subordinate to the canonical **Imago Core Visual Brand Guide**.

The canonical governing concept remains:

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

This UI Art Bible applies those rules to actual game screens.

The brand guide defines what Imago Core should feel like. This document defines how individual screens should present that feeling.

---

## 3. Core UI design doctrine

### 3.1 Desire first, direction second

The user should want to play before they finish reading the screen.

The interface should create immediate desire through art, atmosphere, rarity, identity, and premium material treatment. Functional direction should be obvious, but not visually dominant in a productivity-app way.

Bad hierarchy:

> Task list first, game world second.

Correct hierarchy:

> Game world first, interactive invitations second.

### 3.2 Home is a place, not a dashboard

The Home page should feel like entering the place where the collection lives.

It should not feel like checking a list of chores.

### 3.3 Actions should become landmarks

Important Home actions should be expressed as labeled interactive landmarks within a scene, not as unrelated stacked cards.

Examples:

- Daily Ticket / Shop is a smart claim socket.
- Featured Card is an artifact displayed through the Core machine.
- Battle is a strong lower invitation/gate/banner.
- Future features are dormant or active room sockets.

### 3.4 Premium does not mean crowded

Imago Core should borrow the richness and confidence of premium anime gacha lobbies without copying their worst habit: visual overload.

Richness should come from:

- Art dominance
- Material depth
- Controlled glow
- Strong focal hierarchy
- Rarity accents
- Character-color details
- Core and Imprint motifs
- Deliberate motion

Richness should not come from:

- Too many competing panels
- Constant sparkles everywhere
- Repeated gold borders on everything
- Excessive explanatory text
- Generic fantasy ornament
- Casino-style flashing
- Neon cyberpunk clutter

### 3.5 Cards are the scalable character representation

Home does not require separate chibi avatars or animated character sprites as a foundational system.

The seven Commune members may eventually receive ambient character representations, but the scalable throughline is the card system itself. User-submitted cards will not share a single costume, era, or visual setting. Therefore, the UI should treat cards and card art as the primary carrier of character identity.

---

## 4. Mobile-first composition rules

### 4.1 The mobile screen must have one dominant read

Every major screen should answer, within one second:

1. What is this place?
2. What matters most here?
3. What can I tap now?

For Home, the answer is:

1. This is the Core Commons.
2. The featured card art is active in the central Core machine.
3. Claim, Battle, or use the side feature sockets.

### 4.2 Avoid stacked-panel gravity

A mobile layout naturally tends to become vertical stacks of cards. Imago Core must resist that on spectacle screens.

Stacked panels are acceptable for admin tools, forms, settings, and dense management screens. They are not acceptable as the dominant Home composition.

### 4.3 Preserve open center space

Open space should feel intentional, not accidental.

Bad negative space:

- Empty gaps caused by weak positioning
- Large text blocks floating without visual anchor
- Dead space between unrelated panels

Good negative space:

- Open chamber space around the Core device
- Breathing room around the featured art portal
- Clear separation between hotspots
- Room depth behind the main focal object

### 4.4 Labels must remain obvious

Even when features are expressed as room objects, labels must remain legible. The user should never need to guess what a hotspot does.

The UI can be atmospheric, but interaction must be clear.

---

## 5. Home page art direction

**Lock status:** Locked for current direction.

### 5.1 Home screen purpose

Home is the front lobby, front cover, and first impression of Imago Core.

It should create two immediate feelings:

1. Personal connection to the seven characters.
2. Desire to collect and use their card variants.

Home should make the player feel:

> “I have entered the place where the collection lives.”

Not:

> “Here are my tasks for today.”

### 5.2 Primary metaphor: The Core Commons

The Home page should be built around the idea of **The Core Commons**.

The Core Commons is a front-facing magical-tech chamber with subtle lounge elements. It is not a literal tavern, not a medieval guild hall, not a castle plaza, not a cold sci-fi server room, and not a generic fantasy dashboard.

It should feel like a premium shared chamber where the Commune’s collectible identities are displayed, activated, and sent into battle.

### 5.3 Environmental character

The Core Commons should combine:

- Deep navy architecture
- Dark glass and refined metal
- Cool premium lighting
- Controlled gold accents
- Blue system-lit mechanical details
- A central Core machine
- Sparse lounge warmth
- Subtle evidence of the seven Commune members
- Dim dormant sockets for future features

The lounge elements should be barely present to moderate. The room should not become a couch simulator. It should remain a Core chamber first, with human warmth second.

Possible lounge elements:

- Low seating silhouettes
- Side tables
- shelves or display ledges
- personal objects
- soft practical lights
- subtle fabric or cushion accents
- character-color touches

Possible Commune identity marks:

- Seven small plaques
- Seven color accents
- Initial marks
- personal object silhouettes
- restrained banners or inset symbols
- sevenfold structural marks around the Core

### 5.4 Camera and perspective

Home should use a mostly front-facing camera angle, with at most slight top-down perspective.

Avoid isometric room-map composition.

The composition should feel like a premium mobile game lobby wall/stage: readable, centered, and spatial, but not flattened into a dashboard.

### 5.5 Overall Home layout

The locked composition direction:

```text
[ Glass resource/account rail ]

        [ vertical oval featured-art portal ]
        [ rarity-colored glowing border ]
        [ slow hover / breathing motion ]

             [ rotating Core machine ]
             [ card nameplate / metadata ]

 [ side hotspot ]             [ side hotspot ]
 [ side hotspot ]             [ side hotspot ]
 [ side hotspot ]             [ side hotspot ]

        [ strong Battle gate/banner ]

[ Separate bottom navigation rail ]
```

The center Core device anchors the screen.

The featured portal and Core machine occupy the center top third of the usable screen, beneath the top resource rail and above the lower Battle invitation.

### 5.6 Central Core machine

The Core machine is the Home page’s main symbolic object.

It should feel like a manufactured identity apparatus: dark glass, metallic edges, blue system motion, gold priority accents, and rotating concentric rings.

It should not feel like:

- A magic mirror
- A sun or star
- A zodiac portal
- A casino wheel
- A neon cyberpunk device
- A generic fantasy summoning circle

Preferred forms:

- Rotating concentric circles
- Segmented rings
- Dark-glass lens structure
- Gold central aperture or edge
- Blue system-lit inner mechanics
- Seven restrained notches or divisions
- Imprint-line detailing

### 5.7 Featured Card presentation

The Featured Card should not appear as a large full card frame dominating the page.

Instead, Home should feature the card art inside a vertical oval Imago portal above the Core machine.

Rules:

- The portal shows the card art only.
- The portal border glows in the featured card’s rarity color.
- The portal hovers slowly up and down in a restrained idle animation.
- The full card can be opened from the portal or nameplate interaction.
- The portal should make the character art desirable without turning Home into a card-inspection page.

The Featured Card should make the player feel the value of the collection, learn who the character is, and want to use the card in Battle.

### 5.8 Featured Card nameplate

The featured-art portal should remain visually clean. Card identity information should live as part of the Core machine below it.

The Core machine may carry a compact nameplate with:

- Card title
- Character identity
- Rarity
- Type
- Optional compact stat or level hint

The nameplate should feel attached to the machine, not pasted over the art.

It should use dark glass, compact typography, and restrained rarity/character/type markers.

### 5.9 Home hotspots

Home should support up to six side hotspots, roughly three on each side of the central Core composition.

This gives the room scale and future-proofing while keeping the center clear.

The six planned socket families are:

1. Daily Ticket / Shop
2. Garden
3. Roulette / Prize Wheel
4. Quests / Missions
5. Gift / Inbox
6. Seasonal

Not all sockets need to be active immediately.

Dormant future sockets should appear as dim room objects, inactive plates, unlit devices, covered alcoves, or quiet silhouettes. This makes the world feel expandable without forcing fake functionality.

### 5.10 Hotspot labels

Hotspots should have always-visible labels.

The label style should be short, premium, and readable. Labels should be integrated with the hotspot, not floating randomly.

Preferred label behavior:

- Short action-oriented wording
- High contrast
- Small but clear icon support
- Subtle glow or edge response when active
- Dimmed styling when dormant

Avoid long explanatory copy.

### 5.11 Hotspot visual treatment

The exact hotspot form depends on the final Home scene asset, but the governing principle is:

> Home hotspots may look like world objects, but they must behave like premium mobile buttons.

Possible treatments:

- Smart plaques attached to room objects
- Floating icon plates
- Glass buttons over the scene
- Small mechanical sockets
- Labeled devices embedded into the chamber

The system should remain visually flexible until the illustrated room asset is created.

### 5.12 Daily Ticket / Shop smart socket

Daily Ticket and Shop should share one hotspot location.

Before the daily ticket is claimed, the smart label should read something like:

> **Claim Daily Ticket**

After claim, the socket should become a quieter Shop entry:

> **Shop**

Unclaimed Daily Ticket must clearly call attention to itself.

Approved unclaimed treatment:

- Restrained prismatic glow around the button
- Pulsing rainbow edge
- Small sparkle/glint effect
- Tasteful but unmistakable emphasis

The prismatic effect should be reserved for claimable reward energy. It should not become a normal app accent.

Avoid casino-style flashing, excessive coin noise, or generic RGB gaming hardware aesthetics.

### 5.13 Battle invitation

Battle should use the structural logic of a strong lower-third event banner or gate.

It should not feel like a small utility button.

Battle should feel like the main outgoing invitation from Home: the place where the collection is used.

Possible visual metaphors:

- Battle gate
- Challenge gate
- Venture gate
- Arena entrance
- Activated threshold
- Lower scene banner with art and motion

The user-facing label should likely remain simple and clear, such as:

> **Battle**

or

> **Enter Battle**

The flavor can live in the surrounding art direction rather than replacing the obvious label.

### 5.14 Top resource rail

The top resource/account rail should behave like a glass overlay above the scene.

It should remain compact, readable, and game-like.

It may include:

- Gold
- Tickets
- Energy
- User/account controls
- Logout/menu access

It should not become a heavy header panel that compresses the scene.

### 5.15 Bottom navigation

The bottom navigation rail should feel separate from the room.

It is a persistent game navigation system, not a room object.

It should remain clear, touch-safe, and consistent across screens.

### 5.16 Background asset direction

The governing illustrated Core Commons asset is `public/assets/home-background.png`, served by the app at `/assets/home-background.png`.

Home is implemented as a responsive 9:16 background stage with percentage-positioned HTML/CSS overlays. The source image remains unmodified and supplies the room, portal, Core machine, side sockets, threshold, and safe areas; interactive content is aligned to those structures rather than rebuilding or covering them with panels.

The asset should be designed specifically around the locked composition:

- Center Core machine
- Vertical oval featured-art portal space
- Left and right hotspot sockets
- Lower Battle gate/banner area
- Top rail safe space
- Bottom nav safe space
- Subtle Commune identity marks
- Cool premium navy mood
- Controlled gold accents
- Blue system details
- Sparse lounge warmth

The production overlay map keeps the locked portal, daily socket, Battle gate, and top rail coordinates. The compact machine nameplate begins at `y: 48.5%` with a `10.5%` minimum height instead of the initial `y: 44.5%`, `h: 14.5%` suggestion so the illustrated Core machine remains visible. Vault and Library use two restrained support sockets; the remaining illustrated sockets stay dormant without advertising unimplemented systems.

---

## 6. Pull page art direction

**Lock status:** Not yet locked. Future interview required.

Working hypothesis:

The Pull page should feel like the Core machine from Home expanding into a dedicated reveal apparatus.

Open questions:

- Should Pull be the same Core machine in close-up, or a separate chamber?
- Should the reveal emphasize the Core opening, the card forming, or the art appearing inside an Imprint portal?
- How much spectacle should distinguish single pull from five-pull?
- How should rarity reveals escalate without becoming casino-like?
- How should duplicate, ownership, shard, or level information appear after reveal?

Temporary doctrine:

- Pulls should feel valuable, precise, and personal.
- Avoid slot-machine reels, casino lights, generic starbursts, and galaxy portals.
- Reveal order should reinforce identity, affinity, rarity, then collection consequence.

---

## 7. Battle page art direction

**Lock status:** Not yet locked. Future interview required.

Working hypothesis:

Battle should feel like the place where collectible artifacts become active.

Possible directions to decide:

- Tactical squad setup screen
- Arena/challenge gate
- Card-versus-card duel table
- Mission/encounter preparation screen

Temporary doctrine:

- Battle must remain mechanically clear.
- Squad choices, enemy information, energy cost, and rewards should be readable.
- It should feel more active and dangerous than Vault/Library.
- It should not become a plain form screen.

---

## 8. Battle results and reward art direction

**Lock status:** Not yet locked. Future interview required.

Working hypothesis:

Battle results should provide reward polish without slowing down repeated testing or play.

Open questions:

- Should victory/defeat feel cinematic or fast-functional?
- Should rewards emerge from the Core, from cards, or from the battle gate?
- How much motion should XP, gold, and progression receive?
- Should winning with certain characters create character-color celebration details?

Temporary doctrine:

- Results should be readable first.
- Rewards should feel earned.
- Gold should mark meaningful reward moments.
- The user should be able to proceed quickly.

---

## 9. Vault and Library art direction

**Lock status:** Not yet locked. Future interview required.

Working hypothesis:

Vault and Library should be more functional than Home/Pull/Battle, but still premium.

Vault is ownership. Library is knowledge.

Possible distinction:

- Vault: owned, preserved, valuable, tactile.
- Library: complete index, discovery, catalog, missing cards.

Temporary doctrine:

- Collection grids may use panels, but they should still feel like premium storage/display surfaces.
- Cards should remain the visual heroes.
- Filters and search must be readable and compact.
- Do not overload these screens with Home-level spectacle.

---

## 10. Modal and card inspection art direction

**Lock status:** Not yet locked. Future interview required.

Working hypothesis:

Card inspection should feel like bringing a premium collectible close to the viewer.

Possible directions:

- Holding a premium collectible close-up
- Opening a character dossier
- Viewing a card in a display case
- Reading a battle-ready stat sheet

Temporary doctrine:

- The full card should remain dominant.
- Supporting stats and actions should orbit the card, not bury it.
- Modal chrome should be dark glass, restrained, and readable.
- Inspection should make the card feel owned and valuable.

---

## 11. Navigation and resource display direction

**Lock status:** Partially locked.

### 11.1 Top resource rail

Top resources should behave as compact HUD information.

On Home, the top rail is a glass overlay above the scene.

On functional pages, it may become more standard, but should still avoid feeling like a heavy web-app header.

### 11.2 Bottom navigation

Bottom nav should remain separate, stable, and immediately understandable.

It may use System Blue for active navigation and restrained gold only where a primary prestige action truly deserves it.

### 11.3 Resource colors

- Gold currency may use Core Gold.
- Energy may use System Blue or another approved functional treatment.
- Tickets may use gold or prismatic treatment only when claimable or premium.
- Resource pills should not compete with card rarity colors.

---

## 12. Typography hierarchy

The typography system follows the canonical brand guide.

### 12.1 Libre Caslon Text

Use for human, literary, ceremonial, and mythic moments:

- Major hero titles
- Chapter/event headings
- Victory/defeat moments
- premium collection milestones
- story-flavored labels

### 12.2 Sora

Use for engineered game UI:

- Buttons
- Card titles
- Screen headings
- Battle labels
- Strong numeric displays
- Major action labels

### 12.3 Hanken Grotesk

Use for readable body text:

- Supporting copy
- Ability explanations
- Forms
- Empty states
- System messages

### 12.4 JetBrains Mono

Use for structured values:

- ATK, DEF, SPD
- resource counts
- metadata
- rarity initials
- admin-facing values

### 12.5 Home typography rule

Home should avoid paragraphs.

Use compact labels, short calls to action, card titles, and small metadata. The scene should do the emotional work.

---

## 13. Panel, glass, border, glow, and ornament rules

### 13.1 Glass

Glass is appropriate for:

- Top resource overlay
- card nameplates
- compact hotspot labels
- modal surfaces
- functional overlays

Glass should not become a pile of dashboard cards on Home.

### 13.2 Gold

Gold identifies what matters most right now.

Use gold for:

- Core accents
- primary action emphasis
- major reward states
- Legendary rarity
- premium edges
- selected or completed states

Do not use gold for every heading, every panel border, or ordinary text.

### 13.3 Blue

Blue is the system.

Use blue for:

- interface activity
- system motion
- focus states
- secondary actions
- technical details
- energy or processing cues

Blue should not be the only visible color on Home.

### 13.4 Rarity colors

Rarity color should appear on:

- featured portal border
- card frame/glow
- reveal effects
- rarity badges
- limited accent rules

Rarity should not recolor the whole page.

### 13.5 Character colors

Character colors identify the person.

Use them for subtle Commune identity marks, character chips, filters, and compact identity cues.

Do not use them as general UI theme colors.

### 13.6 Prismatic effects

Prismatic or rainbow effects are allowed only under strict conditions:

- unclaimed Daily Ticket attention state
- Mythic secondary reflection where appropriate
- special reward or reveal moments if deliberately approved

Prismatic effects should be restrained, valuable, and rare.

---

## 14. Motion principles

### 14.1 Home idle motion

Home may have gentle idle motion, but not constant noise.

Approved Home idle concepts:

- featured art portal slowly hovering
- subtle Core ring rotation
- light breathing on active elements
- restrained glint on unclaimed Daily Ticket
- faint blue system motion inside the Core machine

Avoid:

- every hotspot pulsing
- constant particle storms
- large moving backgrounds
- bounce-heavy UI
- casino-style flashing

### 14.2 Interaction motion

Taps should respond quickly and clearly.

Preferred interaction feel:

- quick press scale
- opacity and glow response
- edge light activation
- short material glint
- smooth modal open

### 14.3 Reduced motion

Reduced-motion mode should preserve color, hierarchy, state, and static glow while removing repeated movement.

---

## 15. Do and don’t examples

### 15.1 Home

Do:

- Build Home as a scene with landmarks.
- Center the Core machine.
- Show featured card art in a vertical oval portal.
- Put card nameplate and metadata on the Core machine.
- Use six side sockets as the long-term Home capacity.
- Make Daily Ticket unmistakably claimable when ready.
- Give Battle a strong lower invitation.
- Use dim dormant objects to imply future features.

Do not:

- Stack Daily Ticket, Featured Card, and Battle as ordinary panels.
- Make the Featured Card occupy the whole screen.
- Fill Home with explanatory paragraphs.
- Use a literal medieval tavern skin.
- Make everything blue-and-white with one gold button.
- Make every object glow at the same priority.
- Hide tap targets inside purely decorative art.

### 15.2 Global UI

Do:

- Let card art carry emotional weight.
- Keep mechanics clear.
- Use gold sparingly.
- Use blue for system behavior.
- Keep rarity, type, and character color roles separate.
- Preserve readable faces and card identity.

Do not:

- Collapse rarity, type, and character identity into one color system.
- Use stars, constellations, zodiac rings, or cosmic motifs as default decoration.
- Turn premium artifact framing into generic fantasy filigree.
- Make functional screens sterile.
- Make cinematic screens unreadable.

---

## 16. Codex translation guidance

This document should guide implementation later, but it is not itself an implementation ticket.

When a Codex work order is eventually created, it should translate this document into careful steps without overriding the visual doctrine.

Critical instruction for future implementation:

> Do not implement Home as stacked panels. Implement it as a scene with labeled interactive landmarks.

The illustrated Core Commons asset now exists at `public/assets/home-background.png`. The implemented Home must use that governing stage rather than falling back to a panel layout or a generic layered room approximation.

The asset-led version must preserve:

- central Core machine
- featured vertical art portal
- nameplate integrated with Core machine
- side hotspot sockets
- Daily Ticket / Shop smart state
- Battle lower banner/gate
- glass top resource rail
- separate bottom nav
- no dashboard stacking

---

## 17. Open questions and future design decisions

The Home screen direction is locked enough for future implementation planning.

The following sections still require art-direction interviews:

1. Pull page philosophy
2. Pull reveal sequence
3. Single-pull versus five-pull spectacle
4. Battle setup composition
5. Battle results/reward presentation
6. Card inspection modal philosophy
7. Vault versus Library visual distinction
8. Navigation polish across non-Home routes
9. Resource-display treatment across screens
10. Seasonal/event presentation
11. Garden/farming visual metaphor
12. Roulette/prize-wheel visual metaphor
13. Quest/mission visual metaphor
14. Gift/inbox visual metaphor

Next recommended discussion area:

> Pull page and reveal flow, because it shares the Core machine language with Home and will define the strongest recurring motion/rarity patterns in the app.
