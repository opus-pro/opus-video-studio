# BUILD-LOG: study-brand-lockup (Symbol to Wordmark)

- Start: Thu Sep 24 17:25:04 PDT 2026
- End: Thu Sep 24 17:31:20 PDT 2026 (about 6.5 min wall clock)
- Output: `out/study-brand-lockup.mp4`. ffprobe reports 960x540, 30/1 fps, 66 frames, h264 yuv420p.
- Review rounds: 3

## Implementation
- `src/geometry.ts` holds every spec number (mark and word boxes, frame ranges, blur and shift values) and the shared ease `E = bezier(0.45, 0, 0.15, 1)`.
- `src/BrandLockup.tsx` holds the component and the editable default props (brand, background, ink, accent, symbol, showWordmark).
- Mark: four `<rect x=0 y=50 w=130 h=30 rx=ry=15>` in a 130-unit space, rotated 0/45/90/135 about (65,65), all filled with ink. They sit in one full-canvas SVG, so the geometry is rasterized as vectors at its final size on every frame. Blur is a `feGaussianBlur` on an untransformed group with a canvas-sized filter region, so its radius is in screen pixels and does not get clipped at small scale.
- Motion: scale .20 to 1 over f0-18 with E. Focus blur 5px to 0 over f0-12. Hold f19-24. Travel from 480 to 370 over f25-40 with E, with directional motion blur equal to a 180-degree shutter's box smear (sigma = smear/sqrt 12, peak about 3px). Word over f27-42: opacity 0 to 1, blur 12px to 0 and translateX 18px to 0, all with E. f42-65 is pixel-identical (checked by PNG hash); so is f18-24.
- Wordmark: Arial Bold 48px, line-height 62px, in the fixed box (455,239,300,62). It is a single line, and a fit step shrinks it proportionally to a 25px minimum when a longer word would overflow. A test with "formafoundation" shrank to fit inside the box.
- "Never under the mark": while the word reveals, a soft mask follows the mark's right lobe tip (tip + 8px, feathered over 20px). The word emerges from behind the icon as the icon moves away. The mask is dropped once the word settles, and its edge (438) never reaches the settled word (455).

## Measured final frame (thresholded ink bounds)
- Mark bbox: (330,230,80,80), center (370,270), top lobe straight up.
- Word: ink starts at x455, visible width 138px, ink spans y251-287 (center about 269).
- Background: #eaf2f5 flat. It decodes as 233,241,246 in the MP4 because of yuv420p rounding.

## Issues found and fixed
1. Round 1: with plain Arial Bold 48px, the default word's visible width measured 132px against the spec's "about 138". I added light +0.03em tracking, which gives exactly 138px at 48px. The fit step includes the tracking.
2. Round 1: by the numbers, the mark's right lobe is still over x470 at f30 while the word begins at x473 with its 12px blur halo. That would have put a faint blurred word under the mark. I fixed it with the tip-following reveal mask.
3. Round 2: the motion-blur and text-blur thresholds could leave sub-0.05px filters active on the settle frames. I raised the cutoffs so the resting frames render with no filter at all (fully sharp).
4. Round 3: checked the 3x zoom of the rest frame (no seams in the capsule union, crisp text), the in-between frames pulled from the MP4, the hold-frame hashes and the long-word fit.

## Spec deviations / notes
- The 0.03em letter-spacing is not named in the spec. I added it only to meet the stated ~138px visible width while keeping Arial Bold 48px.
- The reveal mask and the directional motion blur are additions. Neither changes a specified value.
- The spec does not name a curve for "E", so I chose one ease-in-out bezier and used it for every move.
- The accent color is kept as a prop but deliberately unused, as the spec requires.
- If `showWordmark` is false, the mark stays centered and does not travel.
