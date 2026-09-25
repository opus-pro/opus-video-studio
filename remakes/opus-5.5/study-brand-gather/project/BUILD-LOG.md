# Build log: study-brand-gather (Four Blocks Converge)

- Start: Thu Sep 24 17:30:26 PDT 2026
- End: Thu Sep 24 17:38:29 PDT 2026
- Review rounds: 4 (stills, contact sheets, 4x zoom crops, a pixel probe for bounds and colors, and frames pulled from the final MP4)

## What was built

- `src/geometry.ts`: the symbol is a single nonzero-fill path made of four capsules with the same winding, at 0/45/90/135 degrees. They are built from `diameter` (130) and `capsuleWidth` (30): centerline 100, radius 15. Each cap is split into two quarter arcs so the arcs resolve the same way every time. The union has a solid middle and no seams, and the top lobe points up.
- `src/timing.ts`: one house ease `E = bezier(0.45, 0, 0.2, 1)` plus the frame map.
- `src/FourBlocksConverge.tsx`: the scene is paper, then the ink mark, then the coral squares on top. It has sub-frame motion blur and a soft contact shadow under the flying squares.
- The composition stays exactly as specified: 960x540, 30 fps, 66 frames, with the spec's editable defaults as `defaultProps`.

## Checks (pixel probe on the rendered PNGs)

- f0: the four squares are 30x30 at (180,270), (780,270), (480,60) and (480,480), and the mark is a blurred seed at scale .12.
- f22 to f27: exactly one coral square, bbox (465,255,30,30), color #d85548, on top of the complete ink symbol.
- f35 onward: no coral pixels at all.
- f36 to f65: the only non-background pixels are in bbox (415,205,130,130). The fill is exactly #222626, the background exactly #f8f8f6, and there is no filter on those frames, so the edges are sharp.
- Final MP4: `out/study-brand-gather.mp4`, h264 yuv420p, 960x540, 30/1 fps, 66 frames (checked with ffprobe).

## Issues found and fixed

1. **Motion blur showed steps.** With 12 samples over a 180-degree shutter you could see separate ghost copies. Moving to 16-24 samples smoothed it. I also cut the shutter to 0.35 frames so the turning corners are still readable in mid-flight, which the spec requires.
2. **Colors drifted during motion.** The first blur method stacked samples at 1/N opacity with `plus-lighter`. At 8 bits per channel that rounded coral to 220,80,80 instead of 216,85,72, so the color jumped between moving and resting frames. I rewrote the accumulator so each sample is a full opaque copy of the scene, and sample i is stacked at 1/i opacity. That is an exact running mean, and the coral now stays at #d85548 through the whole move.
3. **The start felt sluggish.** The first ease, `bezier(.6,0,.2,1)`, barely moved for about 4 frames and peaked at 44 px/frame. I switched to `bezier(.45,0,.2,1)`: movement starts earlier, the peak drops to 39 px/frame, and the landing is still soft.
4. **Blur halos were clipped.** SVG filters default to a region based on the object's bounding box, which cut off the blur on the small mark. All filters now use a region covering the whole frame in user space.

## Spec notes and deviations

- The spec names the ease "E" but never defines it. I picked one ease-in-out curve and used it for every "E" in the spec, including the blur fade.
- Two additions for polish, both tied to the squares so they are gone by f35:
  - a very soft contact shadow under the squares (ink color at 16% opacity, 3px blur), to show they sit above the symbol;
  - sub-frame motion blur.
- Because vertical travel (210px) is shorter than horizontal travel (300px) and both share one progress curve, the squares close like an aperture. Around f15 a thin sliver of the ink symbol shows between them for about a frame. This comes straight from the spec's geometry.
- `showWordmark` is supported (it fades in the brand name below the mark after f36) but is `false` by default, so no text is rendered, as the spec requires.
