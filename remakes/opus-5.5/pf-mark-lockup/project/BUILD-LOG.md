# BUILD-LOG: pf-mark-lockup

- Start: Thu Sep 24 16:11:17 PDT 2026
- End: Thu Sep 24 16:24:22 PDT 2026 (about 13 minutes)
- Output: `out/pf-mark-lockup.mp4`, h264 yuv420p, 1920x1080, 60/1 fps, 216 frames (checked with ffprobe)
- Review rounds: 5 (stills plus contact sheets pulled from the MP4, with pixel measurements and frame diffs done in PIL)

## Implementation (`src/`)
- `timing.ts`: all timing and geometry, driven by continuous time in seconds. Intro runs 0 to 0.5s: scale .64 to 1, -12deg to 0, 10px Gaussian blur to 0. The petals start 0.035s apart and the last one lands at exactly 0.5s. The tile moves from 1.1s to 1.8s with `Easing.bezier(0,0,0,1)`: centre y 540 to 370, scale 1 to .52.
- `Tile.tsx`: the tile is one vector SVG, sized by transform, so it stays crisp at any scale. Pieces:
  - A 384px cool-white tile with continuous corners (straight sides joined by quarter-superellipse corners), a vertical gradient and an inner rim light.
  - Two stacked shadows (ambient and contact), offset straight down in screen space.
  - Four coral capsules at 45/135/225/315deg with a 14px gap at the hub. They mask a single gradient in tile space, so the mark is lit as one object, and they cast a soft coral drop shadow.
- `Wordmark.tsx`: FORM is set in Geist 620 at 144px, and the tagline "Make room for ideas." in Geist 420 at 32px. Both are centred on their measured ink, not their advance width, and their baselines snap to whole pixels.
  - Each FORM letter layer draws the whole kerned word, clipped to that glyph's column, so kerning is kept while the letters rise 35ms apart.
  - The rise uses a vertical-only Gaussian with sigma proportional to instantaneous velocity, measured over a trailing half-frame shutter.
- `MarkLockup.tsx`: the tile's motion blur is a directional Gaussian. Its size comes from how far the tile's edges travel (translation, scale spread and rotation) across a trailing 180deg shutter.

## Issues found and fixed
1. Round 1: the first motion blur averaged 10 sub-frame samples with `plus-lighter`. That gave visible hue-tinted banding across the tile gradient, because of 8-bit rounding in each layer. I replaced it with the analytic directional blur, which has no banding and costs one pass.
2. Round 1: the petals were thin and read as a close "X". I made them wider (80) and longer (to r=150) and recomputed the hub radius so the gap stays about 14px. The mark now reads as a four-petal flower.
3. Round 2: the motion blur on the first frames of the move was too heavy. I lowered sigma per px from 0.42 to 0.34, which is closer to the box-smear equivalent.
4. Round 2: the petals stayed soft for about 15 frames because the blur decayed on the same curve as the scale. The blur now decays as (1-a)^1.7, so focus arrives before the settle finishes. It still starts at exactly 10px and reaches 0 at 0.5s. I also softened the settle curve so the landing is visible instead of all happening in 8 frames.
5. Round 3: I checked for a possible clipping artifact in the letter columns by drawing the split lines. The splits sit in the inter-glyph gaps. The bright stems during the rise are what vertical-only blur does to vertical strokes, not a bug.
6. Round 4: the full superellipse (n=5) tile had bulging sides. I replaced it with straight sides and superellipse corners, so the tile looks like an app icon.

## Verification
- Frames 30 through 66 are pixel-identical: the hold is exact, with the tile centred at y 540 and 384px wide.
- Frame 108 matches frame 215 on the tile: the tile spans x 860 to 1059 and y 270 to 469, which is a 199.68px tile centred at (960, 370).
- Frames 118 through 215 are pixel-identical: the lockup is completely static and has no filters applied.
- At rest, FORM's cap top sits 70px below the tile, the tagline sits 38px below FORM's baseline, and both are ink-centred at x=960.
- The background is #151719 (the PNG reads 21,23,25).
- Nothing clips: the shadow filter regions were checked with a contrast-boosted crop, and the text never touches the moving tile. The minimum gap during the move is about 40px.

## Spec deviations / notes
- None known. Two readings of the spec to note:
  - The spec gives no timing for the text reveal. FORM starts at 1.24s with letters staggered 0.035s apart; the tagline starts at 1.44s. Everything is at rest by about frame 118.
  - "Visible tile" is read as fully opaque from frame 0. The petals fade in as they unfurl.
- `cubic-bezier(0,0,0,1)` has infinite starting velocity, so the tile covers about 20% of its travel between frames 66 and 67. The trailing-shutter motion blur leaves frame 66 sharp and smears frame 67.
