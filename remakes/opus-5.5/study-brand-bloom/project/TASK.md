# Task: Logo Bloom (`study-brand-bloom`)

Build this motion component from scratch in this Remotion project.

## Spec

## Editable defaults
```json
{"brand":"forma","background":"#faf8fa","ink":"#28232c","accent":"#ad3870","symbol":{"construction":"four-capsule-union","diameter":130,"capsuleWidth":30},"showWordmark":false}
```
## Eight-petal symbol: complete geometry
The mark is a solid union of four identical capsules, with no central hole, outline, gradient or separate petal gaps. In a 130x130 SVG viewBox, center is (65,65). Draw a rounded rectangle x=0, y=50, width=130, height=30, rx=15, ry=15, then identical copies rotated 45, 90 and 135 degrees around (65,65), all the same fill. Equivalent construction: four centerline segments of length 100 centered at the origin with a round stroke of width 30, at those four angles. Their union has eight round-ended lobes and a filled middle. Keep the top lobe pointing straight up in the final frame. Scale the whole union uniformly to the specified size. All geometry is authored from these numbers; no logo asset is needed.

## Layout and timing
Only one flat eight-petal symbol appears, center (480,270), final size130x130. The brand prop is editable metadata but is not visible in this variant. The mark fill is ink throughout; the magenta accent is available as an editable color but is not a visible decoration.
f0: scale .12, rotation -95 degrees, opacity1 and blur7px. f0-19: scale to1 with E; rotate -95 to0 degrees with E, settling angle by f21. Fade blur7 to0 during f0-15. All four capsules move as one solid object. This is a brisk expanding bloom, without separating petals or changing the silhouette. No overshoot above scale1.02; use exact scale1 from f22 onward.
f22-65: completely stationary, crystal-clear hold of the130px symbol. Its bounds are (415,205,130,130). The frame is otherwise empty.
## Acceptance
The motion is concentrated in the first0.7 seconds, followed by a calm1.5-second hold. No text, borders, glow, shadows, particles or new shapes. No generated or external asset is required.

## Project

- `src/index.tsx` registers composition `study-brand-bloom` at 960x540, 30 fps, 66 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- No asset files are provided: draw everything in code, and use system fonts unless the spec names another.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/study-brand-bloom.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
