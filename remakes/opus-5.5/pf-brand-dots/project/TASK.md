# Task: Five-Point Brand System (`pf-brand-dots`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 336 frames. Start with five 72px color points at y540. Between .7-1.45s morph them continuously into a 1760x920 five-panel FIELD identity board with 12px seams and no rounded floating cards. Panels: moving monochrome mark pattern; coast photo with caption; coral hero mark; dark wordmark/tagline; and three labeled color bands. Reveal contents in A/C/B/E/D order. Keep a pattern drift, photo push-in, one 90deg mark turn, two staggered text lines, and three staggered bands so the result remains alive rather than becoming a slide.

## Project

- `src/index.tsx` registers composition `pf-brand-dots` at 1920x1080, 60 fps, 336 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-brand-dots.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
