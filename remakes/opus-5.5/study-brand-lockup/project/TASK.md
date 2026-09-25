# Task: Symbol to Wordmark (`study-brand-lockup`)

Build this motion component from scratch in this Remotion project.

## Spec

## Editable defaults
```json
{"brand":"forma","background":"#eaf2f5","ink":"#17272f","accent":"#246b99","symbol":{"construction":"four-capsule-union","diameter":130,"capsuleWidth":30},"showWordmark":true}
```
## Eight-petal symbol: complete geometry
The mark is a solid union of four identical capsules, with no central hole, outline, gradient or separate petal gaps. In a 130x130 SVG viewBox, center is (65,65). Draw a rounded rectangle x=0, y=50, width=130, height=30, rx=15, ry=15, then identical copies rotated 45, 90 and 135 degrees around (65,65), all the same fill. Equivalent construction: four centerline segments of length 100 centered at the origin with a round stroke of width 30, at those four angles. Their union has eight round-ended lobes and a filled middle. Keep the top lobe pointing straight up in the final frame. Scale the whole union uniformly to the specified size. All geometry is authored from these numbers; no logo asset is needed.

## Layout and timing
Only the eight-petal symbol and the lowercase word "forma" appear. This is a very small centered brand lockup with extensive empty space.
The mark is rendered at nominal size 80x80. At f0 its center is (480,270) and its scale is .20. f0-18: scale .20 to 1.00 with E; blur 5px to 0 over f0-12. Opacity is already 1 at f0. No independent petal animation. f19-24: hold at the center.
f25-40: translate the same mark center from (480,270) to (370,270) with E. Preserve the 80px diameter during this travel. The effect is an icon making space for a wordmark; the visual scale stays restrained throughout.
The wordmark has a fixed box (455,239,300,62), Arial bold 48px, minimum 25px, line-height 62px; single line, ink fill, vertically centered around y=270. For the default word its actual visible width is about 138px. f27-42: reveal word from opacity0, blur12px, translateX18px to opacity1, blur0, translateX0 with E. Text appears to the right as the mark moves away; do not center the word itself on the whole canvas.
f43-65: freeze both objects fully sharp. No footer, tagline, outline or accent-color object. The mark fill is the ink color, not the blue accent. The settled icon bounding box is (330,230,80,80), and the word starts at x455.
## Acceptance
The first half establishes a single small symbol. The second half leaves a modest symbol-word lockup near center, on the same unbroken ice-white field. The words never appear under the mark. No generated or external asset is required.

## Project

- `src/index.tsx` registers composition `study-brand-lockup` at 960x540, 30 fps, 66 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- No asset files are provided: draw everything in code, and use system fonts unless the spec names another.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/study-brand-lockup.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
