# BUILD-LOG: template-manifesto

- Start: Thu Sep 24 17:05:37 PDT 2026
- End: Thu Sep 24 17:24 PDT 2026 (final render at 17:23:01)
- Output: `out/template-manifesto.mp4`. ffprobe: h264, 960x540, 30/1 fps, 270 frames, 9.000 s
- Review rounds: 6 (font probe, first pass, transition retime, motion-blur strobing fix, glow banding and boundary check, final MP4 frame check)

## What it does
The quiet opening line "Say less. Mean more. Make it matter." sets in word by word in 30px Didot italic, with a champagne hairline under it.
- **Push (f57–93):** a true camera zoom carries "Say less." from its place in the sentence to centre at about 186px (6.2x scale). The zoom rate is exponential, so it feels constant, and the rest of the sentence streaks off screen with it.
- **Push-through (f128–147):** "Say less." grows past the camera. "Mean / more." then rises letter by letter out of a dolly-in (0.8 to 1). It is a staggered two-line roman/italic stack.
- **Split (f196–214):** the two lines slide apart. The bold closing "matter." lands from 1.24x, with letters resolving from the centre outward. An italic "Make it" kicker with flanking hairlines sits above it.
- **Corners (f222–256):** four hairline brackets draw in, with tiny tracked Avenir labels.

## Techniques
- **Glossy type:** a custom canvas-measured layout with kerned prefix offsets and absolutely positioned glyphs. The chrome gradient is clipped to each glyph and anchored in px to the cap height and baseline, so the horizon line sits in the same place at every size. A shared specular sheen band is continuous across letters (per-glyph background offset). Pearl is used for the statements and champagne gold for the closing. Drop shadows and glows add depth, and padding keeps italic overhangs from clipping.
- **Motion blur:** real sub-frame blur. 12–16 shutter samples are summed with `plus-lighter` inside an isolated group, which gives an exact average, and it runs only in the motion windows. Resting frames are a single crisp render.
- **Background:** a warm ink stage with a parallax push, blooms that swell on each arrival, a cool rim light, grain under the type and a vignette.

## Issues found and fixed
1. **Muddy crossfades:** in B→C and C→D, old and new statements overlapped. I retimed the exits to clear the centre before the new letters arrive, and cut the closing's landing scale from 1.38 to 1.24 so less of it runs past the frame edge.
2. **Strobed push:** in the first push, "less." showed as discrete ghost copies because the ease peaked at a slope of about 5. I softened the ease to bezier(.6,0,.18,1), made it longer, and raised the samples to 16 in that window.
3. **Banded glow:** a low-alpha glow inside the motion-blur accumulation showed a red/orange contour, from 8-bit precision loss. I scheduled every glow to ramp only outside the blur windows.
4. **Optical centring:** italic advance widths left the lines about 12–15px left of centre, so I added optical offsets.

## Spec deviations / limits
- None known against the numbers (960x540, 30 fps, 270 frames).
- Fonts are macOS system faces (Didot, with Bodoni 72 and Georgia as fallbacks, plus Avenir Next). Another OS would fall back to a different serif.
- Frame 0 shows the opening sentence partway through setting in, by design, so it is not centred at that instant.
