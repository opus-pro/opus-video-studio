# Task: In-Hand App Scroll (`pf-phone-hand`)

Build this motion component from scratch in this Remotion project.

## Spec

1200x1200, 60 fps, 276 frames. Keep hand-phone.png fixed full-frame. Precisely mask editable app UI inside the photographed screen boundary x438..793, y187..936 in the 1254px source, scaled to canvas; cover the original green without covering the black bezel or hand. Build a FIELD hiking app with fixed status/header/bottom navigation and a scrollable body using coast, forest and mountain routes. Scroll body 0 to -420 logical px at .45-1.45s, then to -620 at 2.05-2.8s, then back to -100 at 2.9-3.75s. Apply at most 1.2px blur only to moving content.

## Project

- `src/index.tsx` registers composition `pf-phone-hand` at 1200x1200, 60 fps, 276 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `hand-phone.png`, `mountains.jpg`, `portrait-front.png`, `portrait-smile.png`, `portrait-turn.png`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-phone-hand.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
