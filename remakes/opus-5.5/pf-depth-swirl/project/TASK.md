# Task: 3D Depth Spiral (`pf-depth-swirl`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 348 frames. Use ThreeCanvas and PerspectiveCamera(0,0,12), fov48. Twelve equal 2x2 PlaneGeometry image cards keep scale (1,1,1) and cycle coast/forest/desert/mountains textures. For u=fract(i/12+travel), set z=-22+31*u, angle=2*PI*(1.5*u+i/12)+.3*(travel/.1), x=3.8*cos(angle), y=3.8*sin(angle). Ease travel from 0 to .46 over 0-4.6s and hold; recycle only once a near card has fully left frame. Center fixed "A wider / perspective." and FIELD NOTES, then replace with "Find your / perspective." at 3.7-4.35s. Protect the text with a softly feathered local opacity reduction, never a rectangle. Deliver spatial-audit.json.

## Project

- `src/index.tsx` registers composition `pf-depth-swirl` at 1920x1080, 60 fps, 348 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-depth-swirl.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
