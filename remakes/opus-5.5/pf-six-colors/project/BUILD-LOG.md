# BUILD-LOG: pf-six-colors

- Start: Thu Sep 24 16:34:02 PDT 2026
- End: Thu Sep 24 16:48:42 PDT 2026
- Review rounds: 4 (stills, then MP4 frame pulls, contact sheets, pixel sampling)
- Output: out/pf-six-colors.mp4 (ffprobe: 1920x1080, 60/1 fps, 216 frames, h264 yuv420p)

## What was built
- `src/easing.ts`: an exact CSS cubic-bezier solver (Newton plus bisection). The bands and the push use cubic-bezier(.5,0,0,1).
- `src/font.ts`: loads GeistVF.woff2 through FontFace with delayRender, then measures cap height, descender and the ink box with canvas, so baselines and optical centring are exact.
- `src/SixColors.tsx`:
  - Six 180px bands with the exact hexes (checked by sampling pixels in the final frame), labelled 01-06 PINE/LIME/CORAL/AIR/CHALK/INK.
  - Each band slides its full width from x=1920 to x=0 over 0.45s. Band starts are 4.5 frames (0.075s) apart, offset so bands 01 and 02 are already mid-flight on frame 0 (about 57% and 6% visible) and band 03 leaves on frame 0.
  - FIELD (Geist 700, 270px cap height) sits centred on the frame midline across CORAL/AIR and is revealed letter by letter out of a baseline slot. "A fresh perspective." (Geist 500) is revealed word by word, centred in the CHALK band.
  - The push runs over frames 108-147 (1.8-2.45s). The right-half sheet of band n moves left by (n-1)x180px (0/180/360/540/720/900), which makes a 45-degree stair. On the same clock the lock-up shifts 96px left and settles at scale 0.9.
  - Motion blur uses a 180-degree shutter from analytic per-element velocity. The bands get horizontal-only SVG Gaussian blur, so they never bleed into neighbours; the letters and words get vertical-only blur. The filters are switched off below a threshold, so resting text is unfiltered and crisp.
  - For depth, a contact-shadow layer sits under the stack and only lands on exposed ground. A small seam shadow is scaled by velocity, so it is visible only while a right sheet slides over its left half.

## Issues found and fixed
1. Static seam shadows left five dark creases in the rested frame. The AIR one sat right on the F stem and looked like an artifact. Fix: the seam shadow is now tied to push velocity and fades to zero at rest.
2. The stair read flat against the dark ground. Fix: added a contact-shadow layer under the bands, which also adds depth to the intro's leading edges.
3. After the 0.9 scale about the midline, the tagline drifted off the centre of the CHALK band. Fix: the tagline gets the same shift and scale but pivots on its own line, so it is centred in its band both before and after the settle. FIELD stays on the frame midline.
4. Checked that nothing overlaps: at every push frame FIELD's right edge stays at least 67px inside the AIR step and the tagline at least 112px inside the CHALK step. Labels stay more than 200px clear of the wordmark.

## Spec interpretation / deviations
- "Push the right half of every band left in 180px steps" is read as a stair: band n moves (n-1) steps of 180px, so band 01 is the zero step and does not move. I chose this over n steps (180-1080px) because n steps would push band 06's half past the left edge and run the stair through the wordmark. The 96px brand shift then clears the incoming stair edge.
- The direction of the brand's 96px shift is not given in the spec. It moves left, with the push.
- The spec does not give a per-band slide duration. I chose 0.45s so both lead bands are visibly partial on frame 0.
- The dark ground (#0d1311 radial) and the label ink colours come from me, not the spec.
