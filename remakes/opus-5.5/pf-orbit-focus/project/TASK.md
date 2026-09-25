# Task: 3D Orbit to Hero (`pf-orbit-focus`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 360 frames. Use ThreeCanvas with a fixed PerspectiveCamera(0,0,12), fov54. Ten equal 1.75x2.15 PlaneGeometry cards must keep scale (1,1,1). Place them on local ellipse (7.9*cos(theta),4.6*sin(theta),0), rotate the orbit 50deg about world X and -8deg about world Z, and keep every plane facing the camera. Center the fixed text "SELECTED / FIELD NOTES". Unfold from a flat row during 0-.8s, orbit phase to PI/2 then PI during .9-2.8s, pause, then from 3.2-4.45s move the coast card to (0,0,11.1) while all others recede to z=-12. Its near-camera size must come only from perspective. Add final white copy over the full-frame image and deliver spatial-audit.json.

## Project

- `src/index.tsx` registers composition `pf-orbit-focus` at 1920x1080, 60 fps, 360 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-orbit-focus.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
