# BUILD-LOG: pf-orbit-fan (Fan Deck Showcase)

- Start: Thu Sep 24 16:34:06 PDT 2026
- End: Thu Sep 24 16:51:47 PDT 2026 (about 18 min)
- Output: `out/pf-orbit-fan.mp4`. ffprobe: h264, yuv420p, 1440x1080, 60/1 fps, 288 frames.
- Review rounds: 5 (stills, then contact sheets, crops and zooms pulled from the MP4 with ffmpeg)

## What was built

- `src/motion.ts` holds the geometry and timeline constants. The pivot is at (720,1500) and each card centre sits 940px from it. Cards are 340x500 with a 180px footer. Timeline: open 0-36f, rotation 1 54-99f, rotation 2 120-165f, select 186-219f. It also holds the easing curves and the motion blur, which is based on velocity.
- `src/deck.ts` holds the poster data: photo crop, title, place, coordinates and footer colours.
- `src/OrbitFan.tsx` renders the scene. It loads the Geist variable font through FontFace + delayRender. Photos load with `<Img>`. It draws the cards, the blur filters, the ground shadow and the hero lift.
- Opening: angles go from j*4deg to j*17deg over 0.6s, starting from rest and easing out.
- Rotations: the whole fan turns one 17deg position at 0.9-1.65s and again at 2.0-2.75s, with `bezier(0.25,0,0,1)`: a short wind-up, then a fast deceleration. The blur follows angular speed, so it is exactly 0 at both ends and peaks at exactly 3px on the fastest frame. It is a tangential SVG Gaussian blur (3px along the direction of travel, 0.66px across it). The rotation direction is counter-clockwise (cards travel right to left).
- Select: over 3.1-3.65s the centre card scales to exactly 1.12 and every other card moves another 5deg outward. The easing has no overshoot. Non-hero cards dim slightly.
- Background: flat warm neutral with a very soft radial lift, plus a faint ground shadow. No stage and no canvas headline.

## Issues found and fixed

1. **Round 1: text hidden by neighbours.** With the centre card on top of the stack, the cards on the right had their left-aligned titles covered by the card nearer the centre ("Dune" showed only "e", "Glacier" showed "ier"). Fix: stack the cards like a hand of cards, each one on top of its left neighbour. Every title is now readable at every rest pose. As a bonus, the stacking order never changes while the fan opens or rotates, so nothing pops.
2. **Rotation with only seven cards.** Turning a fixed set of seven cards by 34deg would leave one side of the fan empty. Fix: I used nine posters. Slots 4 and 5 wait offscreen at opacity 0 and fade in as they rotate from 68deg to 51deg, while slots -3 and -2 fade out on the way from -51deg to -68deg. Every rest pose shows exactly seven cards at j*17deg, j=-3..3.
3. **Round 2: hero cross-fade looked ghostly.** The hero has to rise above its right neighbour. I first did this with a 50% dissolve, which ghosted the neighbour's text through the hero's footer. Fix: a copy of the hero sits on top of the stack and is revealed by a feathered wipe that runs parallel to the neighbour's inner edge. The copy matches the hero pixel for pixel, so only the overlap changes, and it reads as the neighbour sliding under the hero while it yields.
4. **Round 4: orange fringe on the hero edge.** A 1px line of footer colour showed along the hero's right edge. It came from the card background bleeding through the anti-aliased rounded clip, and both hero copies were affected. Fix: the card itself has no background, and the photo and footer layers extend 1px past the clip.
5. **Separating the lifted hero.** The lifted hero did not stand out enough from its neighbour, so I added a soft ambient shadow that grows with the lift. Shadow offsets are counter-rotated so the light stays straight overhead on every card.
6. Smaller fixes:
   - Two cards used the same boat crop; I re-cropped one to show the lake and peaks instead.
   - Titles went from 40px to 36px, and right-aligned footer labels were removed, so nothing sits where a neighbour covers it.
   - An arrow badge was added to balance the hero footer.
   - The photos drift slightly inside their windows as cards travel (parallax).

## Spec deviations and limits

- Nine posters exist in total. The fan holds exactly seven at every rest pose; the other two enter and leave from offscreen during the rotations, as described in fix 2.
- The blur is directional (tangential) rather than an isotropic CSS `blur()`. Its peak follows the fastest frame of each rotation, not the middle of the time window. The fan opening gets the same velocity-based blur, capped at 3px, which the spec does not mention.
- The spec geometry puts the ±3 cards (±51deg) partly past the frame edge, and adjacent cards overlap near their bottoms. Both are intentional.
- The centre card only goes above its right neighbour during the select. In the final hold, the scaled hero covers the first letters of its right neighbour's title ("Canopy" shows as "nopy"). This is a deliberate layering choice, and that neighbour is dimmed, but its title is cut off.
