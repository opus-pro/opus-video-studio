# BUILD LOG — pf-pixel-poster

- Start: Thu Sep 24 17:05:33 PDT 2026
- End: Thu Sep 24 17:21:11 PDT 2026 (about 16 min)
- Review rounds: 5 (the first full-layout stills, two tone-curve passes on the dither, a check of the reveal and swap frames against the MP4, and a final pass on boundary frames and the tail)

## What was built

- `src/index.tsx` registers `pf-pixel-poster` at 1350x1350, 60 fps, 288 frames.
- `src/theme.ts` holds one grid for everything: a 45px margin, a 42px mask cell and a 7px dither pitch (1260 = 30 x 42 = 180 x 7).
- `src/dither.ts` crops `mountains.jpg` to 1/1.05 of its width and averages each of the 180 x 72 cells over its exact footprint, using a summed-area table. It applies a fixed 4x4 Bayer threshold anchored to the output grid and draws deep-green square marks (4, 5, 6 or 7px, sized by darkness) on the coral field. The crop moves exactly 5% of its width over the clip on an eased bezier. Nothing is random.
- `src/title.ts` draws each title line (DESIGN / IN MOTION / IN THE OPEN / OCTOBER 24) to its own canvas layer. The cap height is exactly 3 mask cells (126px) and the line pitch is 4 cells (168px), so the three lines sit in a stable, grid-locked stack. Each 42px cell gets one deterministic rank: a left-to-right sweep plus a hash, spread on an ease-in-out density curve.
  - Intro: cells appear from frame 0 to 59 and pass through 14px, then 7px, then crisp stages. Every cell is crisp by frame 63 (1.05s), and a cell never disappears once it has appeared.
  - Swap: the same ranks are remapped to frames 96–131 and every cell is crisp by frame 135 (2.25s). Only the line-2 layers change (IN MOTION hides, IN THE OPEN resolves in). Lines 1 and 3 are never touched.
- The FIELD FORUM header, the descriptor, the rules and the four-column footer are static DOM text in Geist and never move.

## Issues found and fixed

1. **Dither crushed to solid green.** The first tone curve and size mapping turned the lower 40% of the block into a flat mass. Adding local contrast (each cell against a 5x5-cell surround), a gentler levels curve and a 4→7px size ramp keeps texture in the shadows. 7px marks now appear only in the deepest shadows.
2. **Snow and sky merged.** The blue-weighted grey made the sky as light as the snow, so the peaks vanished. Switching to Rec.601 luma puts the sky in the mid-tones, so ridgelines and snow read as clean coral shapes.
3. **Edge darkening.** At the photo's edges the surround box ran past the image and was divided by an area it didn't cover. The box is now clamped and divided by its real area.
4. **Stray dots under the title.** Isolated Bayer-lattice dots sat in the first dither rows. Rows 0–1 are now kept clear, and a 20-row smooth fade dissolves the block into the field.
5. **TypeScript typing gap.** `FontFaceSet.add` isn't in this lib config. Fixed with a cast.

## Verification

- `ffprobe`: h264, 1350x1350, 60/1 fps, 288 frames.
- The background pixel samples exactly `#f0aca2`.
- Frames 62/63 show a fully resolved IN MOTION title, and frame 135 a fully resolved IN THE OPEN.
- Between consecutive frames at peak pan speed, about 0.7% of dither-block pixels change. That reads as a slow, deterministic crawl, not shimmer.
- The resting text in the MP4 is crisp, with no overlaps or clipping.

## Spec deviations and notes

- No motion blur. Cell reveals are instant, stepped state changes by design, and the pan peaks at about 0.3px/frame, so there's nothing to blur.
- "Deterministic 4–7px marks": the mark size is a fixed function of cell darkness, so it isn't hashed per cell. That's still deterministic and never randomized per frame.
- The descriptor line ("A one-day forum…") and the footer copy (date, time, place, tickets) are invented placeholder event info. Oct 24, 2026 is correctly labelled a Saturday.
- No extra deliverable (such as a spatial audit) was requested, so none was produced.
