# BUILD-LOG: study-brand-bloom (Logo Bloom)

- Start: Thu Sep 24 17:25:08 PDT 2026
- End: Thu Sep 24 17:32:50 PDT 2026 (about 8 minutes)
- Review rounds: 3 (each round rendered stills or the MP4, tiled contact sheets, pixel-level checks)

## Implementation

- `src/index.tsx`: registers `study-brand-bloom` at 960x540, 30 fps, 66 frames. The spec's editable defaults are passed as `defaultProps`.
- `src/geometry.ts`: the symbol uses the spec's equivalent construction: four centerline segments of length `diameter - capsuleWidth` (100) at 0/45/90/135 degrees, each with a round stroke of radius `capsuleWidth/2` (15). It is drawn as an exact signed-distance union, so it is one solid shape with no seams, no hole and a filled middle.
- `src/LogoBloom.tsx`: timing and rendering.
  - Scale goes from 0.12 to 1 over f0-19 and rotation from -95 to 0 degrees over f0-21. Both use E = `bezier(0.25, 0.4, 0.05, 1)`: a short acceleration out of the seed, peak speed around f2-3, then a long deceleration with no overshoot. Scale is clamped so it never goes above 1, and it is exactly 1 from f19 on.
  - The blur runs from 7px to 0 over f0-15 with a focus-pull curve. It is applied to an untransformed full-frame layer so the value is in screen pixels.
  - Motion blur uses a trailing 180-degree shutter with 16 time samples, averaged as true area coverage. It is on only while the smear at the lobe tips is over 0.02px. Because the shutter trails, f0 and the whole hold come out exact.
  - The mark is rasterized analytically into a canvas that maps 1:1 onto the frame, using 4x4 supersampling on edge pixels. The fill is ink throughout. The accent color is kept as a prop but never drawn. `showWordmark` (off by default) adds an optional "forma" wordmark under the mark. I checked that it renders, but it is not visible in this variant.

## Verification

- Final frame bounds, measured from pixels: (415, 205, 130, 130), exactly as specified. The top lobe points straight up.
- I compared the frame against the four-capsule SDF. All 9,836 interior pixels are exactly #28232c, no pixel outside the shape is tinted, and the background is exactly #faf8fa.
- Frames f22, f43 and f65 are bit-identical, and f21 is identical to f22, so the hold is completely stationary.
- `ffprobe` on `out/study-brand-bloom.mp4` gives h264, 960x540, 30/1 fps, 66 frames (2.2s), yuv420p.

## Issues found and fixed

1. Round 1: my first build drew an SVG vector for static frames and switched to a motion-blur canvas while moving. At the switch (f21 to f22) about 5 edge pixels jumped by up to 30 levels. I fixed this by choosing the renderer from the actual smear amount instead of a fixed frame number.
2. Round 2: pixel histograms showed that the GPU (ANGLE) vector rasterizer gives only quarter-step antialiasing (3 in-between levels), so the resting edges were slightly stair-stepped. It also showed 1-frame jumps of about 107 levels on tiny sub-degree rotations. I replaced both render paths with one deterministic analytic SDF rasterizer. Resting edges now have 41 smooth levels, the concave corners stay sharp, and the late settle frames change smoothly.
3. Round 3: I confirmed the motion-blurred frames are smooth and free of banding, and re-ran all the exactness checks on the final MP4 and stills.

## Spec deviations

- None known. The spec's "E" easing is not defined anywhere in the task, so I chose my own curve for it (above). It has no overshoot, stays within the frame windows, and lands exactly at f19 for scale and f21 for angle.
