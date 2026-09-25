# Task: Headline to Event Pass (`pf-event-pass`)

Build this motion component from scratch in this Remotion project.

## Spec

1080x1350, 60 fps, 288 frames. On #f4f5f1 reveal three 136px lines "I'M / GOING / OUTSIDE." from below with .07s staggering and 8px velocity blur. At .9-1.5s compress and mask-replace them with "FIELD / DAYS / 2026". From 1.6-2.55s shrink this typography into the top of a 670x865 event pass growing behind it. The pass contains a coast image, coral 26 sticker, MIRA CHEN, DESIGNER, OCT 24-25 and SAN FRANCISCO. Settle pass rotation and sticker by 3s; hold cleanly without another CTA.

## Project

- `src/index.tsx` registers composition `pf-event-pass` at 1080x1350, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-event-pass.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
