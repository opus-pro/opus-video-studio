# Task: Logo Unfold Brand System (`pf-brand-clover`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 324 frames. Begin with a 440px four-capsule FIELD mark and a 104px FIELD wordmark. Resolve the mark from -45deg to zero by .65s. From .8-1.65s move its four petals into four rectangular regions and grow a fifth from the coral region, creating the same 1760x920 modular identity board. Move the original wordmark into the dark panel along one continuous path; do not duplicate it. Reveal content from 1.4-2.4s and hold the complete living system.

## Project

- `src/index.tsx` registers composition `pf-brand-clover` at 1920x1080, 60 fps, 324 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-brand-clover.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
