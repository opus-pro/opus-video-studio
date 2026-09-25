# Task: Logo Half Turn (`study-brand-spin`)

Build this motion component from scratch in this Remotion project.

## Spec

## Editable defaults
```json
{"brand":"forma","background":"#f7f8fa","ink":"#151619","accent":"#3455db","symbol":{"construction":"four-capsule-union","diameter":130,"capsuleWidth":30},"showWordmark":false}
```
## Eight-petal symbol: complete geometry
The mark is a solid union of four identical capsules, with no central hole, outline, gradient or separate petal gaps. In a 130x130 SVG viewBox, center is (65,65). Draw a rounded rectangle x=0, y=50, width=130, height=30, rx=15, ry=15, then identical copies rotated 45, 90 and 135 degrees around (65,65), all the same fill. Equivalent construction: four centerline segments of length 100 centered at the origin with a round stroke of width 30, at those four angles. Their union has eight round-ended lobes and a filled middle. Keep the top lobe pointing straight up in the final frame. Scale the whole union uniformly to the specified size. All geometry is authored from these numbers; no logo asset is needed.

## Layout and timing
Only one flat eight-petal symbol appears, center (480,270), final size130x130. The brand prop is editable metadata but is not visible. Mark fill is ink; the blue accent is not rendered.
f0: scale .12, rotation -180 degrees, opacity1, blur7px. f0-20: scale .12 to1.00 with E, and rotate -180 to0 degrees with E across f0-24. Use continuous rotation, not an orientation swap; the eightfold symmetry must still visibly turn through intermediate angles. Blur7 to0 during f0-15. Never rotate the background or scatter petals.
f25-65: hold scale1 and angle0 exactly, no slow endless spin. Final bounds (415,205,130,130). All other space is the plain background.
## Acceptance
A clear half-turn and growth happen before the long sharp hold. Keep the shape, color and tiny share of frame area defined here; do not embellish the logo. No generated or external asset is required.

## Project

- `src/index.tsx` registers composition `study-brand-spin` at 960x540, 30 fps, 66 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- No asset files are provided: draw everything in code, and use system fonts unless the spec names another.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/study-brand-spin.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
