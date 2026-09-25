# Task: Live Website Restyle (`template-case-website`)

Build this motion component from scratch in this Remotion project.

## Spec

960x540, 30 fps, 195 frames (6.50 s). Show one editorial webpage undergoing two live theme changes with clear cursor feedback, then move closer to the finished page. Keep the same page structure throughout and use product-relevant imagery within its layout.

## Project

- `src/index.tsx` registers composition `template-case-website` at 960x540, 30 fps, 195 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/`, loaded with `staticFile('<path>')`: `generated-assets/alpine-valley.png`, `generated-assets/evidence-room-attempt-1.png`, `generated-assets/evidence-room.png`, `generated-assets/ridge-meadow.png`, `generated-assets/rowboat-lake.png`, `generated-assets/sandstone-desert.png`.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/template-case-website.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
