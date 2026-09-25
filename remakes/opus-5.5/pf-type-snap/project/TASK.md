# Task: Multi-Line Headline Snap (`pf-type-snap`)

Build this motion component from scratch in this Remotion project.

## Spec

1080x1350, 60 fps, 288 frames. On #181b1c keep FIELD DAYS and OCT 24-25 / SAN FRANCISCO fixed. Use three 160px rows. Stagger complete words MAKE / SOMETHING / MATTER. from x+1400 during 0-.8s with curve (.18,.9,.24,1.13), max 24px overshoot, scaleX 1 and blur clearing at rest; accent MATTER. #c9ef8a. At 1.85-2.35s move set one left while IDEAS / INTO / ACTION. enters from the right with .07s row staggering. Mask the row region so both phrases never remain superimposed. Hold ACTION. in accent color.

## Project

- `src/index.tsx` registers composition `pf-type-snap` at 1080x1350, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-type-snap.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
