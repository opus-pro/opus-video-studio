# Task: 3D Diagonal Portfolio Relay (`pf-carousel-diagonal`)

Build this motion component from scratch in this Remotion project.

## Spec

1200x1200, 60 fps, 288 frames. This must be true Three.js space using ThreeCanvas, PerspectiveCamera and equal 2.7x3.5 PlaneGeometry meshes whose scale is always (1,1,1). Camera (0,0,10), fov 40. Put the four editorial poster textures on the loop x=2.9*sin(theta)/sqrt(2), y=2.9*sin(theta)/sqrt(2), z=-1+2.6*cos(theta), theta=i*PI/2-phase. Keep cards as camera-facing billboards; depthTest/depthWrite alone controls occlusion. Advance phase over .9-1.54s, 2.05-2.69s and 3.2-3.84s with cubic-bezier(.22,.85,.2,1). Finish on card four. Deliver spatial-audit.json with geometry, scale, world positions, camera depth and projected bounds at 0/1/2/3/4s.

## Project

- `src/index.tsx` registers composition `pf-carousel-diagonal` at 1200x1200, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-carousel-diagonal.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
