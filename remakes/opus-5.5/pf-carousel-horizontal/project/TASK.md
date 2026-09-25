# Task: Horizontal Portfolio Relay (`pf-carousel-horizontal`)

Build this motion component from scratch in this Remotion project.

## Spec

1200x1200, 60 fps, 288 frames. On #ebeeeb, create four 560x720 editorial posters with an image top (538px) and solid 182px footer. Use coast.jpg, forest.jpg, desert.jpg and mountains.jpg with footer colors #cce789, #184c3a, #f4876e and #dae5ef. Titles: "Along the coast.", "Into the green.", "A little further.", "Above it all." Keep the hero at (600,600), neighbors 690px apart, scale 1 versus .78. Start with poster one visible. Advance at .9-1.54s, 2.05-2.69s and 3.2-3.84s using cubic-bezier(.22,.85,.2,1), motion blur peaking at 5px and fully clearing before each settle.

## Project

- `src/index.tsx` registers composition `pf-carousel-horizontal` at 1200x1200, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-carousel-horizontal.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
