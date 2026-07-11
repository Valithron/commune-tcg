# Imago Core Brand System

## Foundation

**Imago Core** is a premium character-collection digital CCG built around human identity forged into collectible artifacts.

- The person is the treasure.
- The card is the artifact.
- The Core preserves identity across every variant.
- Every card. Every story. One Core.

The experience should feel personal, prestigious, art-forward, clear, collectible, and character-centered. It is not astrology, space fantasy, casino branding, generic fantasy lore, or sterile technical UI.

## Recognition hierarchy

1. Character color says **who** the card represents.
2. Type color says **what affinity** the card uses.
3. Rarity color says **how valuable** the artifact is.

Gold is reserved for prestige and primary actions. Blue is reserved for navigation, system feedback, and secondary actions. Type and identity colors are taxonomic, not master-brand substitutes.

## Master palette

| Role | Token | Hex |
|---|---|---|
| Deep navy | `--color-surface-lowest` | `#070A18` |
| Core navy | `--color-background` | `#090C1D` |
| Surface low | `--color-surface-low` | `#0F1224` |
| Primary surface | `--color-surface` | `#171A2D` |
| Surface high | `--color-surface-high` | `#26293C` |
| Surface highest | `--color-surface-highest` | `#30344C` |
| Imago white | `--color-text` | `#ECE0F2` |
| Identity silver | `--color-text-muted` | `#AEB2CC` |
| Faint record | `--color-text-faint` | `#8C90AA` |
| Core gold | `--color-primary` | `#D4AF37` |
| Core highlight | `--color-primary-highlight` | `#F1D36D` |
| Core shadow | `--color-primary-shadow` | `#9F7F22` |
| System blue | `--color-functional` | `#2D9CDB` |
| Success | `--color-success` | `#7EE0A1` |
| Danger | `--color-danger` | `#FFB4AB` |

## Rarity colors

| Rarity | Hex | Purpose |
|---|---|---|
| Common | `#B8BCC7` | Neutral silver |
| Uncommon | `#60D394` | Growth green |
| Rare | `#2D9CDB` | Refined system blue |
| Legendary | `#D4AF37` | Noble gold |
| Mythic | `#B56CFF` | Arcane violet |

Rarity affects the exterior frame, restrained glow, and rarity chip. It must not recolor all card information.

## Type colors

| Type | Hex |
|---|---|
| Flame | `#E85D4F` |
| Tide | `#2F80ED` |
| Bloom | `#45B36B` |
| Volt | `#F2C94C` |
| Shadow | `#5B3A8E` |
| Radiant | `#F6D77A` |
| Neutral | `#A99A86` |

## Identity colors

| Character | Initials | Hex |
|---|---|---|
| Cydney | CY | `#789461` |
| Sterling | ST | `#C4C5DB` |
| Ryan | RY | `#A98CFF` |
| Gabi | GA | `#8CCDFF` |
| Cooper | CO | `#FF8F70` |
| Kenly | KE | `#73E1C2` |
| Ashley | AS | `#FF9CCF` |
| Unknown | ?? | `#9DA2B7` |

## Typography

| Typeface | Use |
|---|---|
| Libre Caslon Text | Brand, editorial, hero titles, events, and personal mythology |
| Sora | Card titles, buttons, UI headings, and strong statistics |
| Hanken Grotesk | Body copy, descriptions, instructions, and forms |
| JetBrains Mono | ATK, DEF, SPD, counters, metadata, and mechanical labels |

## Shape and spacing

- Cards: 2:3 portrait ratio, 16 px exterior radius, 12 px inner art radius.
- Panels: 24 px radius with glass depth and clear hierarchy.
- Buttons: full pills with a minimum 44 px height.
- Identity and rarity chips: circles.
- Type chips: pills.
- Spacing scale: 4, 8, 12, 16, 20, 24, and 32 px.

The outer interface is rounded and approachable. Information inside the collectible artifact is tighter, technical, and controlled.

## Card construction

- Art dominates the composition.
- Name, identity, type, rarity, and ATK/DEF/SPD remain compact in the lower quarter.
- The exterior frame signals collectible value and should never obscure the person.
- Rarity belongs on the frame, glow, and rarity badge.
- Character and type colors remain distinct from rarity.
- `src/components/CardFrame.js` is the canonical implementation.

## Voice

Use concise, confident language centered on people, stories, artifacts, discovery, and earned collection. Prefer “digital CCG,” “artifact,” “Core,” “Vault,” “Library,” “pull,” and “variant.” Avoid public copy that treats “gacha” as the product name or frames the world as celestial, astrological, or casino-like.
