# BUILD-LOG: template-analytics-glow

- Start: Thu Sep 24 17:06:52 PDT 2026
- End: Thu Sep 24 17:17:48 PDT 2026 (about 11 minutes)
- Output: `out/template-analytics-glow.mp4`. ffprobe reports h264, 960x540, 60/1 fps, 180 frames, 3.000 s.
- Review rounds: 5. Each round rendered stills or pulled frames from the MP4 with ffmpeg (zoomed crops and contact sheets), then I read the PNGs.

## What was built

- `src/index.tsx` registers `template-analytics-glow` at 960x540, 60 fps, 180 frames.
- `src/AnalyticsGlow.tsx` is the component. `src/anim.ts` holds pure, fractional-frame-safe helpers: a cubic-bezier solver, an analytic under-damped spring and colour mixing.
- The scene is a small white card (394x326) on an off-white radial ground, with a hairline border, layered low-alpha shadows and a soft contact shadow. It holds seven recessed wells, each with a white capsule inside, so the depth comes from white-on-white inset and outset shadows.
- Timeline:
  - Card rises in (0 to 34).
  - Label, wells and dots stagger in.
  - The capsules grow from dots on a soft spring with about 3% overshoot and a 5-frame stagger.
  - The headline total counts up as the running sum of each column's growth, so the number and the bars move together.
  - Friday warms from white to an amber gradient. A single sheen passes over it and a two-layer blurred glow blooms, overshoots slightly and relaxes. The well tints warm and light spills onto the card.
  - The compact result arrives: a value chip, a "12.4%" delta badge and the quiet line "Friday peaked 39% above your daily average".
  - Everything is at rest by frame about 146, followed by roughly 0.55 s of hold.
- Motion blur: each bar samples its height across a one-frame shutter and feathers the swept leading edge with a mask. Shadows sit on a separate unmasked layer so they never flicker.
- Crisp rest: resting elements get no transform. Text sits on integer positions. Bar targets and the chip position are rounded, and numbers use tabular figures.

## Issues found and fixed

1. **Chip collided with the well top (round 1).** The value chip overlapped the top edge of Friday's well and felt cramped. I lowered the data range so the chip sits inside the well's straight section, and I computed its position from the rounded target height so it lands on whole pixels.
2. **Glow and warm fill were out of step (round 2).** The glow bloomed before the bar turned warm, which left a white bar with an orange halo. I synced the bloom to the fill with the same in-out curve and moved the overshoot later. I also added the sheen and toned down the pale specular spot on the warm capsule.
3. **Count-up ran ahead of the bars (round 3).** The counter hit 4,785 while the bars were still dots, and a static "0" showed briefly. The total is now the sum of per-column progress, and it starts as the value fades in. The daily figures add up to 18,204, and Friday is 39% above the daily mean.
4. **Heavy shadows and an empty entrance (rounds 2 and 4).** I lowered the ground and outer card shadow alpha so the shadows read as restrained. I brought the label and wells in earlier so the card isn't empty for long while it enters.
5. **Motion blur and crispness checks (rounds 4 and 5).**
   - Zoomed MP4 crops at peak growth show a soft leading edge.
   - A 2x nearest-neighbour zoom of the last frame shows sharp text.
   - A frame strip of the highlight phase (frames 92 to 148) shows a smooth warm-up with no pops.

## Spec items not met or interpreted

- Frame 0 is the empty background, with the card entering from frame 1. I chose this so the entrance reads as one move.
- "Compact final result" is my interpretation, because the spec doesn't define it. I made it a value chip, a delta badge and one explanatory line in the card footer.
- There is no WebGL; the whole scene is DOM and CSS.
- No extra deliverables (such as `spatial-audit.json`) were requested, so none were produced.
