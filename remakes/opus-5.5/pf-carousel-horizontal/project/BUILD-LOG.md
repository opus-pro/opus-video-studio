# Build log: pf-carousel-horizontal

- Start: Thu Sep 24 16:11:20 PDT 2026
- End: Thu Sep 24 16:20:17 PDT 2026
- Review rounds: 5 (4 rounds of stills plus 1 contact-sheet pass on the final MP4)

## What was built

- `src/index.tsx` registers `pf-carousel-horizontal` at 1200x1200, 60 fps, 288 frames.
- `src/Relay.tsx` is the carousel. The page is #ebeeeb. There are four 560x720 posters, each with a 538px photo on top and a solid 182px footer (#cce789, #184c3a, #f4876e, #dae5ef), titled in Geist. The hero sits at (600,600), neighbors sit ±690px from it at scale .78, and the z-order follows distance from the hero slot.
- `src/timing.ts` holds the relay position, which is the sum of three eased steps: 0.9–1.54s, 2.05–2.69s and 3.2–3.84s, all using `Easing.bezier(.22,.85,.2,1)`. It also holds the motion-blur envelope.
- Motion blur is a horizontal-only SVG `feGaussianBlur` with stdDeviation `b 0`. It is applied to an unscaled wrapper so the value is in screen pixels. The envelope follows eased velocity, ramps in over about 3.5 frames so it never pops, and cuts to 0 below 10% of peak speed. The rendered peak is exactly 5.00px (frames 57, 126, 195). Blur reaches 0 by frames 72, 141 and 210, about 20 frames before each settle at 92.4, 161.4 and 230.4. On resting frames the filter is removed entirely, so text rasterizes cleanly.
- Polish:
  - Photo parallax inside each frame: 64px of drift per step.
  - Layered soft shadow that fades with distance from the hero.
  - A 12% page-colored wash on the neighbors for atmospheric depth.
  - A 1px inset hairline so the pale footers stay crisp against the page.
  - Each footer shows a tabular index (`01 / 04`) and a 50px/620-weight title.
  - The Geist font loads through FontFace plus `delayRender`.

## Issues found and fixed

1. **Lime hairline along the poster edges.** The poster background showed through the anti-aliased rounded or scaled edges. Fix: the poster no longer has a background of its own, and the photo runs 2px under the footer so no seam can open.
2. **Scan junk at the bottom of `desert.jpg`.** A dark and white strip in the last ~12 source rows showed at the photo/footer boundary. Fix: a `cropBottom` of 20px hides it under the footer.
3. **Blur peak landed at 4.86px.** The continuous peak fell between frames. Fix: the envelope is now normalized against the frame-aligned samples, which are identical for all three windows because each starts on a whole frame. It is also capped at 5.
4. **Footer meta row read as two unrelated labels.** `01` and `/ 04` were split to opposite corners. Fix: they are now grouped. The title was raised from 46 to 50px and its tracking tuned.
5. **Depth.** Neighbors got a subtle page-colored wash and a lighter shadow so the hero reads as the front plane.

## Verification

`ffprobe` on `out/pf-carousel-horizontal.mp4` reports h264, yuv420p, 1200x1200, 60/1 fps, 288 frames. I measured the blur edge on frame 57: the 10–90% transition is about 12px, which matches σ≈4.8–5.

## Spec deviations

- None known.
- Neighbors are cut off by the canvas edge. That is inherent to the 690px spacing, since neighbor edges land at x≈128 and x≈1072.
- The `01 / 04` index and the neighbor wash are additions for polish that the spec does not mention.
