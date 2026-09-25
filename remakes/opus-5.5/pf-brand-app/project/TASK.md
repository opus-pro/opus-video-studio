# Task: App Icon to Brand System (`pf-brand-app`)

Build this motion component from scratch in this Remotion project.

## Spec

1920x1080, 60 fps, 348 frames. Begin with a 640x170 near-white dock containing three original 128px icons and a standard cursor. Click the coral FIELD icon. From .75-1.55s expand that tile continuously into the coral panel of a five-part, 1760x920 identity board while the other four rectangular panels unfold from its center. Fade the dock away by 1.1s. Reveal the moving pattern, coast image, radial mark, FIELD wordmark/tagline and three brand bands by 2.8s; retain subtle internal motion through the finish.

## Project

- `src/index.tsx` registers composition `pf-brand-app` at 1920x1080, 60 fps, 348 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `coast.jpg`, `desert.jpg`, `forest.jpg`, `mountains.jpg`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-brand-app.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
