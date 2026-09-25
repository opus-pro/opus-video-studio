# Task: Trail Recap Data Reveal (`pf-trail-recap`)

Build this motion component from scratch in this Remotion project.

## Spec

1080x1350, 60 fps, 324 frames. Use mountains.jpg full bleed with a dark lower gradient. Draw a light-green route from (150,850) through (340,520), (620,680) to (850,260) while the image decelerates from scale 1.13 to 1.03. Reveal "Trail / complete." at 124px, then move it upward and reduce to 80px. From 2-2.75s reveal a borderless 2x2 metric grid: Distance 12.4 km, Time 1:24:36, Elevation 680 m, Pace 6:49 /km. Count only distance, draw three faint track outlines, then hold a readable result. Mark numbers as fictional sample data.

## Project

- `src/index.tsx` registers composition `pf-trail-recap` at 1080x1350, 60 fps, 324 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `hand-phone.png`, `mountains.jpg`, `portrait-front.png`, `portrait-smile.png`, `portrait-turn.png`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-trail-recap.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
