# Build Log: Evidence-Backed Answer (`template-case-research`)

- **Start:** Thu Sep 24 17:22:01 PDT 2026
- **End:** Thu Sep 24 17:40:21 PDT 2026 (about 18 minutes)
- **Output:** `out/template-case-research.mp4`: h264, 960x540, 30 fps, 252 frames, 8.40 s (checked with ffprobe `-count_frames`)
- **Review rounds:** 6 still or sequence reviews plus a final check of the MP4 motion

## What was built

The code lives in `src/`: `index.tsx`, `Main.tsx`, `Markers.tsx`, `Surface.tsx`, `Proof.tsx`, `Brand.tsx`, `Atmosphere.tsx`, `layout.ts`, `lib.ts`.

Every element is a pure function of the frame number, with rects in `layout.ts`. The marker system uses the same functions, so it frames exactly what is on screen and never needs to be re-synced.

1. **Query, 0–58.** The evidence-room plate sits behind everything, heavily defocused into warm bokeh. Four gold corner markers start wide and are already moving on frame 0. They settle around a cream query pill. The question types in with seeded per-key jitter, then the send button fills amber, gets pressed and throws a ripple.
2. **Answer, 57–124.** The pill's mask grows into the answer card, with width leading height. The query text re-anchors to the live card edge and shrinks into the header. The content then reveals in order:
   - divider and "3 sources" pill
   - ANSWER label
   - serif headline (word stagger, rise plus blur)
   - body with inline citation badges
   - three evidence chips with photo thumbnails
   Chip 1 then highlights and the other chips dim.
3. **Proof, 124–190.**
   - **Shared-element transition:** the chip 1 thumbnail grows into a printed hero photo, gaining a paper border and caption strip. The card pushes back, blurs and fades.
   - **Rack focus:** the room plate racks from 24px blur to about 2px.
   - **Layers:** three more printed photos fly in at different depths, each with its own depth-of-field blur. An out-of-focus foreground document drifts past.
   - **Camera:** a continuous parallax drift plus a slow dolly push, scaled by depth.
   - **Markers:** they set the hero's final frame first, the photo grows into it, and they keep tracking the drifting hero.
   - **Hero details:** a warm verification sweep, a "Still water confirmed" pill, and the caption "Shore photo · 06:42 AM · east bank · Wind 2 mph".
4. **Brand, 188–251.**
   - The photos recede and defocus, and the room goes soft and dim with a warm centre glow.
   - The four markers converge, with a staggered snap, into a 56px reticle that is the logo.
   - A focus dot springs in with an impact ring.
   - The "Casefile" wordmark reveals letter by letter, and a gold light glint crosses it.
   - The tagline "Answers you can check." rises in, and everything rests from about frame 246.

**Atmosphere (on throughout):**
- halation bloom layer from the room plate
- drifting warm light shaft
- two light leaks at the scene changes
- backdrop-blurred frame edges for lens softness
- vignette
- animated film grain

## Issues found and fixed during review

1. **Marker motion blur was stripy.** It rendered as six discrete ghost copies. I replaced it with a dense sub-frame smear of up to 48 samples, whose alpha is scaled by travel distance, so it reads as real motion blur.
2. **The query header outran the card.** At frame 66 it was clipped above the growing card. The header text and icon are now anchored to the live card rect, not the final card.
3. **The chip hand-off crossed body text.** The markers swept diagonally over body text and smeared it. They now go from the card straight to the hero's final frame along the outer edges, and the chip is selected by highlight only.
4. **An empty chip was left behind.** After the thumbnail lifted off, chip 1 stayed as an empty box. It now fades out as the hero lifts.
5. **Frame 0 was a hard fast-start.** The opening ease was too steep. It is now gentler, and the black fade starts lighter so frame 0 reads.
6. **Hero growth blur read as defocus.** I lowered the velocity-to-blur factor and capped it at 2.6px.
7. **The glint was invisible.** It was cream on cream. It is now a warm gold band and ends before the final hold.
8. **Crispness and overlap checks.**
   - Zoomed crops confirm the text is crisp at rest on the answer card (frame 112), the proof caption (frame 170) and the end card (frame 251).
   - Rest states carry no residual transform or blur filter.
   - The side photos were spaced so that the hero markers stay clear of them for the whole drift, parallax included.

## Spec deviations and caveats

- None on the numbers: the 960x540, 30 fps and 252-frame spec is met.
- **Fonts:** the system faces used are Iowan Old Style and SF Pro through system-ui. No font files were bundled, because there are no network installs, so another machine may fall back to Palatino, Georgia or Helvetica.
- **Brand and copy are invented placeholders:** the "Casefile" brand, the tagline and the answer copy.
- **Unused asset:** `evidence-room-attempt-1.png` is not used. The final `evidence-room.png` plate is used instead.
- **Transient clipping:** during their 1-second fly-in, photos briefly extend past the frame edge. This is motion only; nothing clips at rest.
