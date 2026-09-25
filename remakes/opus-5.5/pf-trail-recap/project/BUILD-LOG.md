# BUILD-LOG: pf-trail-recap

- Start: Thu Sep 24 15:54:06 PDT 2026
- End: Thu Sep 24 16:07:59 PDT 2026 (about 14 minutes)
- Review rounds: 4 (stills, then fixes, then a full-MP4 contact sheet, then a final contact sheet plus a last-frame check)
- Output: `out/pf-trail-recap.mp4`. ffprobe: h264, yuv420p, 1080x1350, 60/1 fps, 324 frames, 5.400 s

## What was built (src/)
- `index.tsx`: registers `pf-trail-recap` at 1080x1350, 60 fps, 324 frames.
- `font.ts`: loads GeistVF.woff2 through the FontFace API, with delayRender.
- `route.ts`: Catmull-Rom trail through (150,850), (340,520), (620,680) and (850,260). It is sampled into a dense polyline, so partial draws, the drawing head and arc length are deterministic. A small GPS-like meander is added, and it fades to 0 at every knot, so the route still passes exactly through the spec points.
- `TrailRecap.tsx`: the composition. Timeline, in frames at 60 fps:
  - 0-156: mountains.jpg full bleed. Scale goes from 1.13 to 1.03 on a decelerating bezier.
  - 6-90: the light-green route draws, with a glowing head. Start and finish markers are added, and the finish pops and pulses at 86.
  - 30-74: "Trail / complete." at 124px, shown by a masked line rise at the bottom.
  - 94-138: the headline moves up to the top-left and its font size animates from 124 to 80px, so it rests at a true 80px. It uses real temporal motion blur: sub-frame copies are averaged additively inside an isolated group, with the sample count scaled to speed. At rest a single crisp copy is drawn.
  - 120-165 (2.00-2.75 s): a borderless 2x2 grid. Distance 12.4 km, Time 1:24:36, Elevation 680 m, Pace 6:49 /km. The cells are staggered and rise out of a blur. Only Distance counts (0.0 to 12.4, tabular digits).
  - 150-172: a "Fictional sample data" caption appears.
  - 170-236: three faint track outlines draw along the route, staggered.
  - 230: a soft closing pulse. 236-323: the result holds, readable.
- Depth and color: a dark lower gradient under the grid, a top scrim and local shade behind the headline, a cool grade and vignette, a drop shadow and glow under the route.

## Issues found and fixed
1. At frame 0, glyph tops of the hidden headline showed through the bottom padding of the reveal mask. Fixed by translating 142% and setting opacity to 0 before the reveal.
2. Metric digits nearly touched (letter-spacing was -0.035em) and units sat too tight. Fixed with -0.012em tracking and a 12px unit gap.
3. "complete." had weak contrast over bright cloud at rest. Fixed with a stronger top scrim, a radial shade behind the headline, and text raised from 58% to 70% white.
4. Motion blur on the headline move showed stepped copies at peak speed. Fixed with a sample count that scales with velocity (up to 48 samples) and a longer, softer move (94-138).
5. With the counter aligned to a reserved width, a large gap opened between number and unit below 10.0. Switched to natural flow: the unit shifts once, at 9.9 to 10.0, during the fast part of the count.
6. The route looked too mathematical. Added the subtle meander, still exact at the knots.

## Spec interpretation / deviations
- "Three faint track outlines" was ambiguous. I drew them as three concentric contour outlines hugging the route (buffer widths 52, 100 and 148 px, at 30%, 20% and 12% opacity). Each one draws on along the route after the count.
- The spec names only a dark lower gradient. I added a top scrim as well, so the resting 80px headline stays readable over the clouds.
- The headline rests at the top-left, 72px from the left and 92px from the top. On its way up it crosses the route for about 10 frames (roughly 108-118), under motion blur. This overlap happens only in transit; nothing overlaps at rest.
- The route overlay stays in canvas coordinates, so the spec points are exact. It does not scale with the photo.
- One `node scripts/render.mjs` run failed once with a truncated Node error. An immediate rerun with no code change succeeded, and every render after that was clean.
