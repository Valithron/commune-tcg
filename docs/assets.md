# Asset Inventory

This inventory covers tracked assets and externally loaded presentation dependencies. R2 card art is dynamic and cannot be exhaustively enumerated from the repository.

| Path or source | Purpose | Loading | Owner | Status |
|---|---|---|---|---|
| `src/assets/card-frames/card-frame-common.png` | Common exterior frame | Vite import | `CardFrame.js` | Canonical |
| `src/assets/card-frames/card-frame-uncommon.png` | Uncommon exterior frame | Vite import | `CardFrame.js` | Canonical |
| `src/assets/card-frames/card-frame-rare.png` | Rare exterior frame | Vite import | `CardFrame.js` | Canonical |
| `src/assets/card-frames/card-frame-legendary.png` | Legendary exterior frame | Vite import | `CardFrame.js` | Canonical |
| `src/assets/card-frames/card-frame-mythic.png` | Mythic exterior frame | Vite import | `CardFrame.js` | Canonical |
| `public/assets/commune-card-back.png` | Pull reveal card back | Stable public URL | `PullRevealModal.js` | Canonical asset with historical filename |
| `public/assets/commune-pull-orb.svg` | Pull chamber control | Stable public URL | `Pull.js` | Transitional artwork and historical filename |
| `/api/card-image?key=...` | Dynamic card art | Worker reads `CARD_IMAGES` R2 | `CardFrame.js` and card APIs | Canonical dynamic source |
| Google Fonts CSS | Libre Caslon Text, Sora, Hanken Grotesk, JetBrains Mono | External stylesheet in `index.html` | Global typography | Canonical external dependency |
| `public/manifest.webmanifest` | Installable app identity and colors | Browser manifest | App shell | Canonical |

## Loading rules

- Import bundled frame PNGs through JavaScript so Vite fingerprints them.
- Use `/assets/...` only for intentional stable public files.
- Use R2 keys for card art and resolve them through `/api/card-image`.
- Preserve current crop metadata and avoid baking crop changes into source artwork.
- Do not delete R2 objects automatically when a card row is removed because art may be shared.

## Historical filenames

The two `commune-*` public asset names remain to avoid breaking cached URLs and deployed references. Their filenames are compatibility identifiers; accessible names and active product copy use Imago Core.

## Audit findings

- All five tracked rarity frames are imported by the canonical renderer.
- Both public pull assets have active call sites.
- No tracked image was proven orphaned, so no binary asset was deleted.
- There is no dedicated Imago Core logo, favicon, PWA icon set, or checked-in social preview image yet.
- R2 orphan detection requires a production object inventory and reference comparison; repository search alone is insufficient.

## Next asset work

1. Produce an approved vector Imago Core mark.
2. Export favicon and 192/512 px PWA icon variants.
3. Create an Open Graph preview at the deployed canonical URL.
4. Replace the pull orb only after a final Core/Imprint/Artifact motif is approved.
5. Run a no-delete R2 orphan report before any cleanup operation.
