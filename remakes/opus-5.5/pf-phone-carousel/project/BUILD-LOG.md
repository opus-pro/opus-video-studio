# BUILD-LOG: pf-phone-carousel

- Start: Thu Sep 24 16:47:12 PDT 2026
- End: Thu Sep 24 17:02:24 PDT 2026
- Review rounds: 4 (stills round 1, motion contact sheet round 2, full-MP4 boundary frames round 3, intro easing round 4 + final MP4 check)

## Output
- `out/pf-phone-carousel.mp4`: h264, yuv420p, 1440x1080, 60 fps, 288 frames (ffprobe verified).
- `spatial-audit.json` (from `node scripts/audit.mjs`): max overshoot, blur peak, recycle events and keyframe positions, computed from the same `src/motion.ts` the composition uses.

## Structure
- `src/motion.ts`: pure timeline math (bezier solver, slots, shifts, blur, recycling). `src/map.ts`: height-field contours (marching squares), route arc length, elevation profile.
- `src/data.ts`: editable props for the three FIELD screens, plus trail, accent and background (composition `defaultProps`).
- `src/Phone.tsx`: the 330x720 black frame. `src/FieldScreen.tsx`: the hiking UI. `src/PhoneCarousel.tsx`: composition.

## Spec numbers as built
- Background #eff2ed. Hero centered at (720,540), scale 1. Sides at x=230 and x=1210, scale 0.78.
- Stack opens over frames 0-30: sides fan out from behind the hero (they start rotated 7 degrees, which settles to 0). The motion eases from rest and has speed-matched blur of up to 3px.
- Shifts run over frames 60-99 and 138-177 on cubic-bezier(.8,0,.5,1.18). The curve's natural overshoot on a 490px slot move is 9.1px, under the 24px cap. A limiter would scale overshoot down if it ever went over 24px, but here it never engages.
- Motion blur is horizontal only (SVG feGaussianBlur, stdDeviation "x 0" in screen px). It follows speed: 0 at rest, exactly 4px on the fastest rendered frame, then tapering back to 0 on landing. At rest no filter is applied, so text stays crisp.
- Recycling uses a pool of 4 phones: 3 in view and 1 parked off-screen right at x=1700. A phone that leaves the left edge is rebound to the right slot (new screen content) only on the shift's final frame. By then it is parked at x of about -264 (right edge -135px), so it is fully off-screen even counting its shadow. The audit confirms both recycle events (frames 99 and 177) are fully off-screen.
- Over frames 204-237 the sides move out 25px (to 205 and 1235) and the hero settles at scale 1.03.
- Screens show one route at three distinct positions: 22% (Pine Hollow), 58% (Glacier Saddle) and 90% (Emerald Lake). The hero walks A to B to C.

## Issues found and fixed
1. The "On route" pill had low contrast over the bright forest mist. Switched it to a dark glass background and strengthened the top gradient.
2. The spacing around the "Next · km" chip separator was uneven. Split it into separate spans with an even gap.
3. Blur peaked at 3.99px because of continuous-time normalization. Normalized on the rendered frames instead, so the peak is 4.00.
4. The intro started at full velocity (a big jump on frame 1). Changed it to ease from rest with speed-matched blur.
5. Duplicate SVG gradient ids across phones. Made them unique per phone.
6. TS typing for `document.fonts.add`. Fixed. Geist is loaded through the FontFace API with delayRender.

## Deviations / notes
- Four phone elements exist, not three. The staged fourth phone is needed so the right slot can fill during a shift without teleporting a visible phone. At rest exactly three phones are on screen. During a shift, the phone entering on the right shows the same screen as the one leaving on the left (there are only three screens). That duplicate is only visible for a few blurred frames at opposite edges.
- The spec gave no easing for the intro or the 3.4s settle. I chose cubic-bezier(.5,0,.2,1) for the intro and (.25,.9,.3,1) for the settle.
