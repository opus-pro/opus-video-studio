# Task: Add-to-Cart Transformation (`pf-cart-checkout`)

Build this motion component from scratch in this Remotion project.

## Spec

1600x1200, 60 fps, 324 frames. Present a coast art print at left and COASTAL/STUDY, FIELD PRINTS, format and $32 at right. Keep a 420x100 #cde993 Add to cart pill visible. Enter product and title by .55s. Move a standard cursor in and press at 1.1-1.35s. From 1.35-2.05s transform the pill into three 100px circles: left dark-green check, center cart, right coral quantity 1, with <=12px overshoot. Show "Added to your bag". From 3.1-3.8s return the side circles and continuously widen the center into "View cart · 1", adding only a small cart-icon swing. Hold the truthful completed state; do not imply payment.

## Project

- `src/index.tsx` registers composition `pf-cart-checkout` at 1600x1200, 60 fps, 324 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-cart-checkout.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
