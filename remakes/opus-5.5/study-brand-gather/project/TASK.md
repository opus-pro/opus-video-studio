# Task: Four Blocks Converge (`study-brand-gather`)

Build this motion component from scratch in this Remotion project.

## Spec

## Editable defaults
```json
{"brand":"forma","background":"#f8f8f6","ink":"#222626","accent":"#d85548","symbol":{"construction":"four-capsule-union","diameter":130,"capsuleWidth":30},"showWordmark":false}
```
## Eight-petal symbol: complete geometry
The mark is a solid union of four identical capsules, with no central hole, outline, gradient or separate petal gaps. In a 130x130 SVG viewBox, center is (65,65). Draw a rounded rectangle x=0, y=50, width=130, height=30, rx=15, ry=15, then identical copies rotated 45, 90 and 135 degrees around (65,65), all the same fill. Equivalent construction: four centerline segments of length 100 centered at the origin with a round stroke of width 30, at those four angles. Their union has eight round-ended lobes and a filled middle. Keep the top lobe pointing straight up in the final frame. Scale the whole union uniformly to the specified size. All geometry is authored from these numbers; no logo asset is needed.

## Layout and timing
Center symbol (480,270), final130x130, ink fill. Four coral squares each30x30, corner radius2, begin at centers (180,270),(780,270),(480,60),(480,480). The squares are above the symbol in the layer stack; they do not morph into its lobes. No text appears; brand is editable metadata only.
f0-19: center mark grows from scale.12 to1 using E, opacity1 throughout, blur6 to0 by f14. It does not rotate.
f0-22: each square translates directly toward (480,270) with E, without curved flight paths. All four begin together; horizontal travel is300px, vertical210px. Rotate each square from0 to90 degrees with the same progress so mid-flight corners visibly turn. By f22 all four coincide as one coral30px square at center, above the fully formed ink symbol.
f23-27: briefly hold the small coral square at the center. f28-35: shrink square scale1 to.72 and fade opacity1 to0 using E, leaving no coral central patch by f36.
f36-65: hold only the130px symbol, bounds(415,205,130,130), fully sharp against the plain paper-white field.
## Acceptance
The four-direction travel and coral-to-ink reveal are visible, but the final mark is exactly the same solid eight-petal union described above. No residual blocks, outlines, background objects or brand text. No generated or external asset is required.

## Project

- `src/index.tsx` registers composition `study-brand-gather` at 960x540, 30 fps, 66 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- No asset files are provided: draw everything in code, and use system fonts unless the spec names another.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/study-brand-gather.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
