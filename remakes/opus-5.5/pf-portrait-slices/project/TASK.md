# Task: Portrait Slice Assembly (`pf-portrait-slices`)

Build this motion component from scratch in this Remotion project.

## Spec

1080x1920, 60 fps, 252 frames. Use the supplied sunset wide, turn and macro fashion photographs full bleed. Open on the environmental wide portrait with small AFTER HOURS and SERA corner type. From .6-1.3s slide four fixed 1080x480 horizontal windows in from alternating sides, each with a distinct crop: turn hair/glasses, macro eye/lens, wide shoulder/chain, turn profile. At 1.6-2.22s expand the second strip continuously to the full 9:16 frame while the others retreat, preserving the same macro image and interpolating its crop without a swap. Add small "A closer / point of view.", collection and URL copy, avoiding the eye and glasses; hold with a subtle push-in.

## Project

- `src/index.tsx` registers composition `pf-portrait-slices` at 1080x1920, 60 fps, 252 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `editorial-silver-close.png`, `editorial-silver-detail.png`, `editorial-silver-wide.png`, `editorial-sunset-macro.png`, `editorial-sunset-turn.png`, `editorial-sunset-wide.png`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-portrait-slices.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
