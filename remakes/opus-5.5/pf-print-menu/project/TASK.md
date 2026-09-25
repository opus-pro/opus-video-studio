# Task: Editorial Print Launch (`pf-print-menu`)

Build this motion component from scratch in this Remotion project.

## Spec

1080x1080, 60 fps, 336 frames. On #d0e88b keep FIELD PRINTS, 2026 EDITION, format/paper/URL and $32 fixed. Relay three 440x560 framed photo prints through center (650,620): coast, forest and desert. Pair them with two-line 112px titles COAST/STUDY, GREEN/HOURS and DESERT/LIGHT. Enter the first product by .55s. Cross-relay products and word rows at 1.5-2.2s and 3.2-3.9s, using opposing horizontal travel, constrained scale-X overshoot and blur peaking at 4px for text and 3px for photos. Hold product three through the end.

## Project

- `src/index.tsx` registers composition `pf-print-menu` at 1080x1080, 60 fps, 336 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `hand-phone.png`, `mountains.jpg`, `portrait-front.png`, `portrait-smile.png`, `portrait-turn.png`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-print-menu.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
