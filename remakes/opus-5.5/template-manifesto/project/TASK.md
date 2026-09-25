# Task: Glossy Serif Manifesto (`template-manifesto`)

Build this motion component from scratch in this Remotion project.

## Spec

960x540, 30 fps, 270 frames (9.00 s). Expand a quiet opening sentence into oversized serif statements, then resolve into a bold closing with restrained corner details. Preserve the glossy type treatment, strong scale changes, clear hierarchy and smooth text transitions.

## Project

- `src/index.tsx` registers composition `template-manifesto` at 960x540, 30 fps, 270 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7, @remotion/three 4.0.484, @react-three/fiber 9.3.0, three 0.180.0. No network installs.
- No asset files are provided: draw everything in code, and use system fonts unless the spec names another.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/template-manifesto.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
