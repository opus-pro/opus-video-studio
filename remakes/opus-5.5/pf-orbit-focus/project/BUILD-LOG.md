# BUILD-LOG: pf-orbit-focus (3D Orbit to Hero)

- Start: Thu Sep 24 15:54:01 PDT 2026
- End: Thu Sep 24 16:18:04 PDT 2026 (about 24 min)
- Review rounds: 5. Each round rendered stills or MP4 frames, built contact sheets and inspected them.
- Output: `out/pf-orbit-focus.mp4`. ffprobe: h264, 1920x1080, yuv420p, 60/1 fps, 360 frames, 6.000 s.
- Audit: `spatial-audit.json` (from `node scripts/audit.mjs`). 20/20 checks pass.

## Build

- `src/spatial.ts` is the pure spatial model. It holds the camera, the ellipse, the orbit rotation `Rz(-8deg) * Rx(50deg)`, the timeline, the easing and the state of each card. The renderer and the audit both import it.
- `src/Scene.tsx` is the R3F scene inside `ThreeCanvas`, with a fixed `PerspectiveCamera` at (0,0,12) and fov 54.
  - It holds ten `PlaneGeometry(1.75, 2.15)` meshes. Their scale is always (1,1,1), and `quaternion = camera.quaternion` so every plane faces the camera.
  - Motion blur works by accumulating sub-frames: a 180-degree shutter, 1–64 adaptive samples, half-float linear accumulation and MSAA x4.
  - Each card has rounded corners with analytic anti-aliasing, a hairline edge and a depth cue that darkens far cards.
  - The background is a graded dark field with dithering.
- `src/Overlay.tsx` holds the centred title "SELECTED / FIELD NOTES" in Geist, with a per-glyph blur/rise reveal. Glyphs carry no transform or filter at rest. It also holds the final white copy over the full-frame coast image, with a scrim.
- Timeline:
  - 0–0.8 s: the flat row unfolds into the ring.
  - 0.9–2.8 s: the orbit runs in two C2 quintic beats, with phase 0 → PI/2 at 1.85 s → PI.
  - 2.8–3.2 s: pause. The other cards dim to show the selection.
  - 3.2–4.45 s: the coast card moves to (0,0,11.1), with depth eased in log space. The others recede to z = -12.
  - 4.22–6 s: the final copy appears.

## Issues found and fixed

1. **No WebGL in the provided render script.** `openBrowser('chrome')` with the default GL backend exposes no WebGL context on this machine. I tested the backends one by one: only `angle` and `swangle` work. I changed `scripts/render.mjs` to pass `chromiumOptions: {gl: 'angle'}`. You can override this with `REMOTION_GL=swangle`.
2. **Cards overlapped during the unfold.** Neighbours converged in x before they had split vertically, and the cards coming forward also swelled outward.
   - Fix: y and z now lead x, and x/y are interpolated in view space. I also moved the row to a 2.2 pitch at z = -2.2.
   - Result: overlap beyond the ring's own resting overlap fell from about 112k px² to about 48 px². Side clearance during the unfold rose from 31 px to 146 px.
3. **Title collided with the orbit.** Far cards on the lower left (theta 220–245 deg, raised by the -8 deg roll) pass within about 16 px below centre. I computed the free envelope and resized the title to a two-line 64 px lockup. Its measured clearance to any card while visible is 17.3 px, including the travel of the reveal. The title fades out before the hero reaches it.
4. **Hero full-frame image would be soft.** With a fixed portrait crop, the final frame would show a 606 px slice of the photo upscaled 3.2x. Only the UV mapping of the hero now adapts: whatever part of the card is in frame always maps inside the photo. The final frame is an exact object-fit: cover of the whole 1200x800 photo (1.6x). The plane's geometry, scale and position are unchanged, so its size on screen comes only from perspective: 2060x2532 px at distance 0.9.
5. **Ghosting in fast motion blur.** Tightened the sample spacing to about 1.25 px and raised the cap to 64 samples.
6. **Hero dive was too violent.** Peak zoom rate was 1.57x per 3 frames. A softer depth ease brought it to 1.43x, and the landing is now longer.
7. **Final headline crossed the boat's bow tip.** Reduced it from 108 to 98 px and added a scrim anchored bottom-left.

## Spec notes and deviations

- **Render script changed** (GL backend only, see issue 1). Without this change no ThreeCanvas composition can render on this machine.
- **"Facing the camera"** is implemented as a billboard parallel to the image plane (quaternion = camera quaternion, normal toward the camera). It is not a per-card `lookAt`. The two are identical for the hero at (0,0,11.1).
- **Orbit order:** rotate about world X first, then world Z (three.js `Euler(50deg, 0, -8deg, 'ZYX')`).
- **Title layout:** "SELECTED /" is set as a small eyebrow above "FIELD NOTES". The DOM text reads exactly "SELECTED / FIELD NOTES". The title's centre is at (960, 540).
- **Top margin:** at the orbit's nearest point the top card comes within 23 px of the top edge. That follows directly from the mandated geometry, and nothing clips.
- **Resting overlaps:** at the ring's sides, adjacent cards at theta 0/36 and 180/216 deg overlap by about 24 px when at rest. The mandated ellipse and tilt cause this, and depth order keeps it correct.
- **Files outside the directory:** early in the session two small analysis scripts were written to the session scratchpad (outside this directory). They contained only a projection-math check. All later temp work stayed in `out/tmp` (now removed).
