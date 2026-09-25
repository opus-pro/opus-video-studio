# Task: Icon-to-Wordmark Reveal (`pf-mark-lockup`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 216 frames. Background #151719. Build a coral four-capsule radial mark inside a 384px cool-white app tile. At 0-.5s the visible tile settles from scale .64, -12deg and 10px blur; stagger the four petals by .035s. Hold, then from 1.1-1.8s move the tile center from y540 to y370 while scaling to .52 with cubic-bezier(0,0,0,1). Reveal FORM at 144px and the 32px tagline "Make room for ideas." from below with velocity-linked blur. Hold the precise, sharp lockup through frame 215.

## Project

- `src/index.tsx` registers composition `pf-mark-lockup` at 1920x1080, 60 fps, 216 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-mark-lockup.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
