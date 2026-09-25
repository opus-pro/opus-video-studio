# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
Three flat, opaque rectangular text ribbons cross a pale off-white field. No rounded ends, shadows, paper curls or floating decorative shapes. Each ribbon starts at width 1480, height 102, centered at x=480. Center y values are 121,270,403; rotations are -5 degrees,+4 degrees,-4 degrees respectively. The middle ribbon is in front where edges approach. All three are clipped only by the 960x540 viewport. Text is Arial bold 87px with line-height 102px, minimum 44px. Repeat each phrase with 82px gaps along its ribbon. Do not introduce bullets or separators. On the diagonal ribbons partial words at the left and right viewport edges are intentional.
Final compact strips keep their own colors and exact rectangular edges: centers (480,133),(480,254),(480,375), height 104; widths 424,522,580 for the default phrases. Single phrases centered with 26px horizontal padding; if edited, size width to measured text plus 52px within 780px, reduce type down to 44px if necessary. Keep type on one line.
Closing is bold Georgia, 78px/90px, minimum 42px, centered in (75,210,810,108); it must fit one line by reducing font if necessary. Footer brand is Arial bold 18px at (96,473), CTA Arial 15px with right edge 838, baseline 490; a 14px geometric right arrow at x=853.
## Frame timeline and motion
- f0-11: ribbons enter from x offsets -180,+180,-180 using E; opacity reaches 1 by f5; local blur falls from 7 to 0. At f0 already show the moving edge of each colored ribbon, rather than an empty opening.
- f0-96: repeated text flows continuously in opposite directions: row1 moves left 3.6px/frame, row2 right 4.2px/frame, row3 left 3.9px/frame. Wrap the repeat phase deterministically so no gap occurs. The colored strip itself stays spatially stable after its entrance.
- f96-120: decelerate each text train so one complete phrase is centered. Integrate an E-based velocity reduction, ending at zero; do not snap the phase. Start rows 0,3,6 frames apart. During the same interval, rotate each entire ribbon toward 0 degrees and interpolate center y to 133/254/375. f108-128: crop ribbon width from 1480 to its compact width with E, keeping the centered phrase and smoothly fading the leftover repeats over the last 8 frames. The result is three simple colored labels stacked in space, not a new scene.
- f129-165: hold all three labels sharp, horizontal, with consistent 17px vertical gaps.
- f166-181: row1 then row2 then row3, staggered by 3 frames, move upward 58px and fade out with S; no horizontal exit. During f179-195 the closing sentence enters from y+22, blur 8 to 0 and opacity 0 to 1 with E.
- f201-213: brand and CTA enter with 8px upward travel and fading; f214-239 hold. Keep the same pale background throughout.
## Acceptance
Before f100 the three huge diagonal bands occupy most of the frame and their text moves in opposing directions. At f145 three horizontal blocks form one compact typographic object. The closing remains serif and the band type remains bold sans. Asset generation is not required; all elements are text and basic geometry.

