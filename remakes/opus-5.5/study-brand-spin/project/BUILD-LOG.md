# BUILD-LOG: study-brand-spin (Logo Half Turn)

- Start: Thu Sep 24 17:25:49 PDT 2026
- End: Thu Sep 24 17:29:50 PDT 2026
- Review rounds: 3 (keyframe strip, then a full 0-25 strip after retiming, then frames pulled from the final MP4 plus a zoomed check of motion blur and final crispness)

## Implementation
- `src/BrandSpin.tsx`: one full-frame SVG. The mark is four identical `rect`s (x=0, y=50, 130x30, rx=ry=15), rotated 0/45/90/135 degrees about (65,65), all filled with ink. It is placed with `translate(480 270) rotate(r) scale(s) translate(-65 -65)`, so the geometry stays vector-sharp at every scale.
- Timing: scale 0.12 to 1 over f0-20 and rotation -180 to 0 degrees over f0-24, both on the same ease E = `bezier(0.33, 0.55, 0.25, 1)`. Blur 7px to 0 over f0-15 (quad-out) is applied as a CSS blur in screen space on the unscaled SVG, so it is a true 7px. From f24 on there is a single exact copy at scale 1 and angle 0.
- Motion blur: a 16-sample trailing shutter (0.75 frame) while the mark moves. The samples are running-average composited (sample k at opacity 1/k), so the union stays solid and f0 is exactly the seed state. It turns off from f24.
- `showWordmark` (default false) optionally renders the brand below the mark. `brand` and `accent` are metadata only; the accent is never drawn.

## Issues found and fixed
1. The first ease, `bezier(0.2, 0.8, 0.25, 1)`, peaked at about 30 degrees per frame. With the mark's 45-degree symmetry, that risks a wagon-wheel effect (the turn reading backwards or not at all). I retimed to a peak of 17.6 degrees per frame, so the half-turn visibly moves through intermediate angles from f6 to f20.
2. A centered shutter would have averaged f0 with later poses. I switched to a trailing shutter, so f0 is exactly scale 0.12, -180 degrees, blur 7.
3. A typo in a shell command created an empty file one level above the benchmark folder. I deleted it immediately. No other paths were read or written.

## Verification
- Final frame (f25 and f65) pixel scan: ink bounding box is exactly (415, 205, 130, 130). Background is exactly #f7f8fa and the solid ink is exactly #151619. The ink covers about 2% of the frame. The top lobe is centered on x=480.
- MP4 (ffprobe): h264, 960x540, yuv420p, 30/1 fps, 66 frames.

## Spec deviations
- None known. "E" is not defined in the spec, so the curve above is my interpretation.
