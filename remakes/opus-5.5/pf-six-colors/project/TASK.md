# Task: Six-Color Brand Launch (`pf-six-colors`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 216 frames. Fill the frame with six 180px horizontal bands: #173f36, #cfeb8d, #f58870, #c8dfea, #f8f8f5, #1c2421, labeled 01-06 and PINE/LIME/CORAL/AIR/CHALK/INK. Slide each full-width band into x0 with .075s staggering and cubic-bezier(.5,0,0,1); begin with the first two partially visible. Reveal FIELD and "A fresh perspective." across the middle. From 1.8-2.45s push the right half of every band left in 180px steps while the brand shifts 96px and settles at scale .9.

## Project

- `src/index.tsx` registers composition `pf-six-colors` at 1920x1080, 60 fps, 216 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-six-colors.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
