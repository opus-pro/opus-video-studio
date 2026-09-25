# Task: Dithered Event Poster (`pf-pixel-poster`)

Build this motion component from scratch in this Remotion project.

## Spec

1350x1350, 60 fps, 288 frames. On #f0aca2 keep FIELD FORUM and footer information fixed. Set DESIGN / IN MOTION / OCTOBER 24 in a stable three-line layout. Use mountains.jpg in the lower half, downsample to 180 columns and apply a fixed 4x4 Bayer threshold to form a two-color coral/deep-green dither with deterministic 4-7px marks. Reveal the title through a 42px deterministic grid mask over 0-1.05s; once a cell appears it stays. At 1.6-2.25s replace only IN MOTION with IN THE OPEN using the same mask. Move the dither crop just 5% for parallax; never randomize per frame.

## Project

- `src/index.tsx` registers composition `pf-pixel-poster` at 1350x1350, 60 fps, 288 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-pixel-poster.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
