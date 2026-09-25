# Task: Three-Phone Carousel (`pf-phone-carousel`)

Build this motion component from scratch in this Remotion project.

## Spec

1440x1080, 60 fps, 288 frames. On #eff2ed build three editable 330x720 black phone frames with FIELD hiking screens. Put the center phone at (720,540), side phones at x230/x1210 and scale .78. Screens show three distinct route positions. Open the stack by .5s. Shift all devices one slot left at 1-1.65s and 2.3-2.95s with curve (.8,0,.5,1.18), maximum 24px overshoot and blur 0-4-0. Only recycle an offscreen phone after it fully exits. At 3.4-3.95s move side phones out 25px and settle the hero at 1.03.

## Project

- `src/index.tsx` registers composition `pf-phone-carousel` at 1440x1080, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `hand-phone.png`, `mountains.jpg`, `portrait-front.png`, `portrait-smile.png`, `portrait-turn.png`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-phone-carousel.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
