# BUILD-LOG — pf-color-field

- Start: Thu Sep 24 16:52:40 PDT 2026
- End:   Thu Sep 24 17:11:53 PDT 2026 (final render verified at 17:11:03)
- Review rounds: 10 (still renders + MP4 frame pulls, crops and contact sheets)

## Output
`out/pf-color-field.mp4` — h264, 1920x1080, yuv420p, 60/1 fps, 336 frames (5.600 s), confirmed with ffprobe.

## Implementation
- `src/field-shader.ts` / `src/FieldCanvas.tsx`: a raw WebGL fragment shader (no extra deps) draws the
  full-frame field every frame. Domain-warped diagonal band coordinate (all wavelengths >= ~0.6 frame
  heights) mapped through a 6-stop ramp of the four brand colors, blended in OKLab so transitions stay
  luminous. Very soft "silk" shading from the ramp's lightness slope. No orbs, bokeh, image gradients or
  random terms; pure function of pixel, frame and drift.
- Drift: linear, exactly 160 px (vector (-155, -40) px scaled by frame/335) over the film. Internal band
  "breathing" was slowed so it stays under ~20 px and the drift remains the dominant motion.
- Grain: static screen-locked triangular hash noise, max deviation 1.2% (<= 2%), no temporal flicker
  (frame-to-frame luma diff during the hold averages 0.14/255).
- Type (`src/ColorField.tsx`), Geist variable font loaded via FontFace + delayRender, hero widths measured
  from the real glyph layout:
  - 0.03–0.60 s: FIELD letters rise through a baseline mask (3-frame stagger, expo-out); both support
    lines fade/rise with velocity-scaled vertical blur. Everything is settled by frame 36.
  - 1.5–2.2 s (frames 90–132): a hard-edged rectangular mask widens from the end of FIELD to reveal
    "/STUDIO"; the lockup stays centred, FIELD eases from 1.22x to lockup size (pull-back), a thin ink
    rule marks the travelling mask edge and fades out, horizontal motion blur is scaled to velocity.
    Support block moves down 62 px and scales to 0.8 over the same window.
  - 2.75–3.4 s (frames 165–204): line two ("Four tones. One flowing field.") exits up with blur, then
    "Launching October 24." (heavier weight) rises in — sequential, no overlap.
  - 3.57–4.2 s: FIELD.STUDIO wordmark (near-white, coral dot) resolves near the bottom on the deep-green
    band with tightening tracking; hold to the end. All type is static at rest while the field drifts.

## Issues found and fixed
1. Motion blur on the hero slide was far too heavy (sigma 9) — reduced to a velocity-scaled cap of 4.5.
2. Suffix parallax + left clip turned the slash into an apostrophe ("FIELD'S") mid-wipe — removed the
   parallax; the reveal is now a pure widening mask.
3. The mask clipped the right side of the D at rest (negative tracking pushes ink past the advance) —
   the mask now lives only on the "/STUDIO" span, with bleed that opens as the mask completes (O verified
   unclipped too).
4. Leading-edge rule touched the D at the start and sat on the O at the end — offset it and made it fade
   out earlier.
5. Line-swap crossfade briefly overlapped old and new line two — made it strictly sequential.
6. Field read as a full-width top/bottom letterbox of deep green after adding band swelling — rebalanced
   slope/swell/ramp so deep green is a top-left and bottom-right accent and the text zone stays light
   (deep-green type on white/ice/coral; footer always on solid green).
7. Hero shadow added for depth, softened (11% alpha) after it looked muddy on coral; its clip is only
   relaxed after the rise mask is done so nothing pops.

## Spec deviations / notes
- None known. Copy for the two supporting lines (not specified) was written as
  "Continuous color, generated in motion." / "Four tones. One flowing field."
- The hero also scales (1.22x -> 1x) during the 1.5–2.2 s mask widening; this is additive to the spec's
  mask transform, not a replacement for it.
