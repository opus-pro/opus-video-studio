# BUILD-LOG: pf-event-pass

- Start: Thu Sep 24 16:38:09 PDT 2026
- End: Thu Sep 24 16:50:42 PDT 2026
- Review rounds: 6 (stills, contact sheets, and frames pulled from the MP4 with ffmpeg)

## What was built

- `src/index.tsx`: registers `pf-event-pass`, 1080x1350, 60 fps, 288 frames.
- `src/font.ts`: loads the Geist variable font through `FontFace` + `delayRender`.
- `src/motion.ts`: easing curves, a damped `settle()` that lands on exactly 1 at t = 1, and a normalised-speed helper that drives the velocity blur.
- `src/EventPass.tsx`: the component.

Timeline at 60 fps:

- 0–0.9s: "I'M / GOING / OUTSIDE." at 136px Geist, each line rising from below inside its own mask. The lines start 0.07s (4.2 frames) apart. Each line gets a vertical-only blur (SVG `feGaussianBlur` with stdDeviation `0 σ`). σ is 8px times the curve's normalised speed, so it peaks at 8px and reaches 0 at rest.
- 0.9–1.5s: each line is mask-replaced, still 0.07s apart. The incoming "FIELD / DAYS / 2026" pushes the old line up while the old line compresses to 50% height and fades. The same 8px speed-scaled blur applies. The last line lands on frame 90 (1.5s).
- 1.6–2.55s: the pass starts as a half-size card centred behind the headline and grows to 670x865. The headline shrinks from 136px to 95px and docks at the top of the pass on frame 153. It picks up the pass's rotation as it docks.
- The coast image wipes up from the bottom. Its top edge is clamped to the moving headline, so the photo never overlaps the type. The perforation line draws on. MIRA CHEN / DESIGNER / OCT 24–25 / SAN FRANCISCO rise in on a stagger. The coral "26" sticker lands from 1.45x scale and settles with a damped overshoot.
- Pass rotation goes from -8° to 0° with one soft overshoot. It settles, along with the sticker, on frame 180 (3.0s). Frames 180 and 287 are pixel-identical (checked with an ffmpeg difference blend), so the hold is clean, with no CTA.

## Issues found and fixed

1. The old line squashed to scaleY 0 and left a thin line that looked like an underline. Fixed: it now compresses to 50% while being pushed out, fades as 1 - p², and runs slightly ahead of the incoming line.
2. The pass grew from 8% scale at canvas centre, which looked like a stray white patch behind the type. Fixed: it now starts as a half-size tilted card centred on the headline and grows out from behind it.
3. The coast image revealed underneath "2026" while the type was still docking. Fixed: the reveal edge is clamped to the headline's caps bottom plus 22px, in card-local space.
4. The zero-length perforation line drew a stray round-cap dot before it started animating. Fixed: the line is not rendered until it has length.
5. The sticker was inside the masked card and would have been clipped at 1.45x. Fixed: moved it outside the mask. I also enlarged it slightly and moved it up to balance the empty space right of the header.
6. The dock ease was too slow at the start while the card grew quickly. Fixed: retimed it (bezier 0.5,0,0.15,1).

## Spec deviations

- None known. "OCT 24-25" is set with an en dash ("OCT 24–25").
- I added a few small non-text graphic details: a lanyard slot, a perforation line, and side notches.
- The final pass rotation is 0°, which I read as "settle".
