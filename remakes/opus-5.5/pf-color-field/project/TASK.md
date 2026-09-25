# Task: Flowing Color Field (`pf-color-field`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 336 frames. Build a deterministic full-frame low-frequency procedural color field from coral #ff7f73, ice blue #b6dcee, deep green #144b41 and near-white #f2f7ef. Use broad continuous bands, no orbs, bokeh, gradients loaded from files, or random flicker. Drift the field 160px over the film with grain <=2%. Reveal FIELD and two supporting lines by .6s. At 1.5-2.2s use a widening rectangular mask to turn the hero into FIELD/STUDIO while support copy moves down and scales smaller. At 2.75-3.4s replace line two with "Launching October 24." Add FIELD.STUDIO near the bottom and hold type independently of the moving field.

## Project

- `src/index.tsx` registers composition `pf-color-field` at 1920x1080, 60 fps, 336 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-color-field.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
