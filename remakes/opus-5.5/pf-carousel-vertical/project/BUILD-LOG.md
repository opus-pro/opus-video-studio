# BUILD-LOG: pf-carousel-vertical

- Start: Thu Sep 24 16:21:04 PDT 2026
- End: Thu Sep 24 16:32:37 PDT 2026 (final render and probe). The log was written right after.
- Review rounds: 6 (stills and MP4 frame pulls, each checked in the Read tool)
- Output: `out/pf-carousel-vertical.mp4`. ffprobe reports 1200x1200, 60/1 fps, 288 frames.

## Implementation

- `src/motion.ts` holds the timing, the easing and the blur envelope.
  - Slot spacing is 690px.
  - The group moves down one slot in each of three windows: 0.9–1.54s, 2.05–2.69s and 3.2–3.84s, all eased with `Easing.bezier(.22,.85,.2,1)`.
  - The group offset is the sum of the three eased window progresses, so rest positions are exact integers: the hero sits at top 240, left 320, scale 1.
  - Scale is interpolated by distance from centre, 1 at centre down to .78 at one slot or more. There is no 3D tilt.
- Motion blur is local to each card.
  - It is an SVG `feGaussianBlur stdDeviation="0 σ"`, so it blurs vertically only, along the direction of motion.
  - The filter sits on a wrapper outside the scale transform, so σ is measured in screen pixels.
  - σ follows the eased velocity: a quick sine attack peaks at exactly 5.000px two frames into each move (frames 56, 125 and 194), close to the velocity maximum. It then decays with velocity and reaches 0 at 85% of the move.
  - The last blurred frames are 86, 155 and 224, just before the 85% points at 86.64, 155.64 and 224.64. After that the filter is removed entirely, so resting text is never resampled.
  - The filter region is enlarged (-20%/-30%) so the card shadow is not clipped while blurred.
- `src/Poster.tsx` builds each 560x720 editorial poster:
  - a coloured paper stock with a sheen gradient
  - a "N° 0x" / category header
  - an inset photo
  - a 64px Geist title, a caption, a hairline rule and a footer
  - Geist is loaded through the FontFace API with `delayRender`.
- `src/VerticalRelay.tsx` builds the stage:
  - a near-black stage with a radial glow tinted by the active poster, interpolated continuously with group position
  - a vignette, and an edge falloff so the peeking neighbours read as a continuing stack
  - side cards dimmed by up to 46% for depth
  - a left numeral counter and a right index list with a sliding marker, both driven by the same eased offset and kept clear of the card column (x 320–880)

## Issues found and fixed

1. The blur peak measured 4.994px because the analytic velocity maximum falls between frame samples. I pinned the peak to the frame-aligned sample 2 frames into the move, which is within 0.3% of the true velocity maximum. The rendered peak is now exactly 5px.
2. Counter roll, first version: a masked odometer in a 120px window showed both numerals crowded together mid-roll, and the mask faded the top of the resting numeral.
   - Second version: a larger window and a longer roll distance removed the crowding, but numeral fragments still jammed against the "PORTFOLIO" and "OF 04" labels.
   - Third version: a simultaneous slide and cross-fade stacked two ghosted numerals.
   - Final version: a sequential hand-off. The outgoing numeral clears in the first 30% of the eased move and the incoming one resolves over the rest, with a short 32px drift. Two numerals never stack, and nothing touches the labels.
3. The forest poster almost disappeared as a dimmed side card (a dark photo on dark green). I lightened its paper stock and reduced the side dimming from 50% to 46%.
4. The stage glow was too faint to register, so I enlarged and strengthened it.
5. The title tracking at -0.045em was slightly cramped, so I opened it to -0.04em. I checked resting text crispness with a 2x crop.

## Spec notes and deviations

- The spec says to reuse the posters and colours of "Horizontal Portfolio Relay". That component is not in this directory, and the rules forbid reading other folders, so I designed the four 560x720 posters and their palette from scratch. Teal (coast), terracotta (desert), moss (forest) and cobalt (mountains) are my own choices, not a copy of the horizontal version. The titles and captions are invented, generic copy.
- The spec asks for only four cards and no looping. So at the start there is empty space below card one, and at the end there is empty space above card four. The neighbour peeks at the frame edges are intentional crops of the stack.
- The counter and index side elements are additions for composition. They are not in the spec. Motion blur is applied only to the cards, as "local" blur.
