# BUILD-LOG: pf-phone-hand (In-Hand App Scroll)

- Start: Thu Sep 24 16:46:05 PDT 2026
- End: Thu Sep 24 17:05:43 PDT 2026 (about 20 min)
- Output: `out/pf-phone-hand.mp4`. ffprobe reports h264, yuv420p, 1200x1200, 60/1 fps, 276 frames.
- Review rounds: 7 (stills, zoomed crops, and frames pulled from the MP4 each round)

## What was built
- `src/PhoneHand.tsx`: `hand-phone.png` is fixed full-frame. The UI lives in source-photo pixel
  space (the 1254 px plate) at x438..793 and y187..936 inclusive (356x750 logical px), scaled to
  canvas by 1200/1254.
- `src/FieldApp.tsx`: the FIELD hiking app.
  - Fixed status bar with a dynamic island.
  - Fixed header: brand mark, bell, avatar, and a Coast / Forest / Mountain segmented control that follows the section in view.
  - Fixed bottom navigation with a Record button and home indicator.
  - Scrollable body: greeting, a weekly-distance card, then Coast (featured), Forest and Mountain route cards, then a trail-conditions card.
- `src/timing.ts`: scroll keyframes, motion blur, scroll indicator and scroll-spy timing.
  - Scroll hits 0 → -420 over frames 27–87, → -620 over frames 123–168, and → -100 over frames 174–225, exactly at segment ends.
  - Each segment uses an ease-in/ease-out bezier with a quick pickup and a long glide.
  - Blur is a vertical-only SVG `feGaussianBlur` on the scroll body only. σ comes from scroll velocity through a smoothstep, capped at 1.2 logical px (≈1.15 canvas px). It is exactly 0 at rest, where the filter is removed.
- Geist variable font is loaded through the `FontFace` API and gated with `delayRender`.

## Issues found and fixed
1. **Green fringe at the screen edge.** A 1-row anti-aliased green line at y=186 and green at all four corners showed through. Fixes:
   - Measured the real green boundary at sub-pixel precision: 438.65..793.44 x 186.17..936.82.
   - Fitted each corner's radius: TL 36.8, TR 36.9, BR 37.5, BL 39.2.
   - Gave the UI clip matching per-corner elliptical radii.
   - Added a near-bezel-black despill plate under the UI. It is grown 1.2 px so its anti-aliased edge sits on the bezel instead of on the green (anti-aliased edges at the same spot let green leak through).

   A pixel audit of the ±6 px band around the screen edge now finds 0 green-spill pixels (max G−max(R,B) = 8, which is the bezel's own tint).
2. **Awkward framings at rest.** At -420 only a 10 px sliver of photo showed at the top. Made the coast card a larger "Top pick" card (186 px photo) and the other two 132 px, so each rest reads cleanly:
   - At 0: the coast card is cut in whitespace below its location line.
   - At -100: the top edge falls in the gap above the week card.
   - At -420: a 46 px photo slice with its rating shows at the top.
   - At -620: the mountain card is fully visible, with 10 px of air above the nav.
3. **Easing too peaky.** The first curves peaked at 3.3–3.7x average speed; the swipe back reached 34 px/frame. Softened to peaks of about 2.6–2.9x.
4. **Segmented pill was dragged 1:1 by the scroll.** It crossed a whole segment in about 3 frames during flicks. Replaced with discrete scroll-spy thresholds plus an 18-frame eased glide of its own. Label and icon colors now interpolate instead of snapping at 50%.
5. **Hard cuts under the fixed chrome.** Added 10 px soft scroll edges under the header and above the nav. Added a scroll-dependent header hairline and shadow, and an iOS-style scroll indicator that fades in with each drag and lingers after it.

## Spec deviations / notes
- I read "x438..793, y187..936" as inclusive pixel ranges, so the UI box is 356x750 source px.
  - The measured green actually starts at y≈186.2, so the 0.8 px row above the box is covered by the bezel-black despill plate, not by UI pixels.
  - On the left and right the box overhangs the green by about 0.6 px. That lands on the bezel's inner edge and cannot be seen.
- The despill plate reaches about 1.2 source px past the green edge in bezel-matched black (#090c0d). At 1200 px it is visually identical to the bezel.
- No other spec items were missed.
