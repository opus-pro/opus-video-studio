# BUILD-LOG — pf-brand-dots (Five-Point Brand System)

- Start: Thu Sep 24 16:25:30 PDT 2026
- End: Thu Sep 24 16:42:42 PDT 2026
- Review rounds: 6. Each round rendered stills or pulled frame sheets from the MP4, then fixed what they showed.
- Output: `out/pf-brand-dots.mp4`. ffprobe: h264, yuv420p, 1920x1080, 60/1 fps, 336 frames.
- Extra: `spatial-audit.json`, generated from the same geometry the renderer uses (board, panels, seams, dots, timings).

## What was built
- `src/motion.ts` holds the pure math: cubic-bezier easing, board geometry, the dot-to-panel morph, and the reveal schedule. It can be checked from node.
- `src/BrandDots.tsx` holds the composition and the five panels. `src/Mark.tsx` holds the FIELD mark: a quarter-field plus a point, with a pie-sweep path.
- Board: 1760x920 at (80,80) with 12px seams and square corners. There are no per-panel shadows. A single soft contact shadow sits under the whole board and settles into the seams.
- Frame 0 shows five 72px points at y540, centred on x 672…1248. A counting pulse runs left to right and returns to 72px by frame ~36.
- Morph runs from frame 42 to 87 (0.70–1.45s). It starts with an inhale: the points gather and squash. Then they fly outward along paths that never cross. They stay liquid (fully round), then square off and land exactly on the panel rects with radius 0.
- Reveals go A 88, C 98, B 108, E 118, D 128:
  - A: the mark pattern pops in as a diagonal wave. The pattern drifts continuously (0.46, 0.22 px/frame).
  - C: the hero mark pie-sweeps in, the point pops, and the mark makes one 90° turn at frames 204–240 with wind-up and overshoot.
  - B: the photo opens in a circular aperture (the "point" motif). It pushes in steadily from 1.02 to 1.16 and is still moving on the last frame. The caption has two staggered lines.
  - E: three labeled bands (Coral, Lake, Bone) wipe up, staggered 8 frames apart.
  - D: the FIELD letters rise through masks, staggered. Then the two tagline lines follow, 10 frames apart.
- Motion blur is true sub-frame accumulation: 12 samples with a 180° shutter, on both the morph and the mark turn.

## Issues found and fixed
1. The first blur method stacked additive plus-lighter layers at 1/N opacity. This shifted colours by 8-bit rounding: ink turned olive and bone turned grey mid-morph. I replaced it with opaque running-average layers: every layer carries its own background and layer k is drawn at opacity 1/(k+1). Blurred frames now keep the palette exactly.
2. The hero mark came to rest rotated away from the canonical mark used in the D icon and in the pattern. It now starts at -90° and turns into the canonical orientation.
3. Mid-flight gaps between the stacked pairs (A/D, B/E) shrank to about 4px and looked like they were touching. I split the position easing per axis so vertical separation leads, and checked numerically that the minimum gap during the morph is at least 9.3px.
4. The photo zoomed out and then back in because a settle-scale fought the push-in. It now uses one monotonic push-in.
5. The anticipation squash originally started before 0.70s. I moved it inside the morph window so the points stay exact 72px dots until the morph.
6. I removed a meaningless "01 / 05" label, tightened the reveal stagger to 10 frames, and added a photo vignette and scrim so the caption reads cleanly.

## Spec compliance / deviations
- Every number in the spec is met exactly: 1920x1080, 60fps, 336 frames, 72px points at y540, the morph in 0.70–1.45s, a 1760x920 board, 12px seams, radius 0, A/C/B/E/D reveal order, and one 90° turn.
- Soft deviations:
  - The pulse before the morph briefly scales the points up to about 7.5% before they return to 72px.
  - The inhale during the morph briefly shrinks them to 90%.
  - Before the bands arrive, panel E shows as flat sand (the E point's colour).
- Nothing in the spec was left unmet.
