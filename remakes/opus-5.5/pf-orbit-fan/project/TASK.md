# Task: Fan Deck Showcase (`pf-orbit-fan`)

Build this motion component from scratch in this Remotion project.

## Spec

1440x1080, 60 fps, 288 frames. Ground seven 340x500 poster cards on an offscreen pivot at (720,1500), radius 940, angles j*17deg for j=-3..3. Use full-bleed photos with 180px colored footers. Open the fan from j*4deg to j*17deg in .6s. Rotate one 17deg position at .9-1.65s and again at 2-2.75s, using a fast decelerating curve and blur 0-3-0. At 3.1-3.65s scale the selected center card to 1.12 while others yield another 5deg. Include only a faint ground shadow, no stage or canvas headline.

## Project

- `src/index.tsx` registers composition `pf-orbit-fan` at 1440x1080, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-orbit-fan.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
