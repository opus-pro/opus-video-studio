# Task: Camera to Fashion Campaign (`pf-camera-campaign`)

Build this motion component from scratch in this Remotion project.

## Spec

1080x1920, 60 fps, 252 frames. Use the supplied silver wide, close and detail fashion photographs full bleed, preserving the fictional adult model and eyewear. Begin with a restrained camera UI over the wide shot: 140px top bar, 300px bottom bar, rule-of-thirds grid, 420x340 corner focus frame, PHOTO label and 104px shutter. Create one flash at .68-.76s and cut close/detail/wide through 1.48s. Remove all camera chrome by 1.72s and settle on the close photograph. Add small SERA, SILVER CONTOUR, "See in a / different light.", OPTICAL COLLECTION 01 and SERA.STUDIO copy away from eyes, glasses, fingers and joints. Hold with a subtle 1 to 1.014 push-in.

## Project

- `src/index.tsx` registers composition `pf-camera-campaign` at 1080x1920, 60 fps, 252 frames. Keep those exactly; put the implementation in `src/` (any number of files).
- Use only the installed dependencies: remotion 4.0.484, @remotion/cli 4.0.484, @remotion/renderer 4.0.484, @remotion/bundler 4.0.484, react 19.2.7, react-dom 19.2.7. No network installs.
- Assets in `public/assets/`, loaded with `staticFile('assets/<file>')`: `GeistVF.woff2`, `editorial-silver-close.png`, `editorial-silver-detail.png`, `editorial-silver-wide.png`, `editorial-sunset-macro.png`, `editorial-sunset-turn.png`, `editorial-sunset-wide.png`. `GeistVF.woff2` is the Geist variable font.
- Review loop: `node scripts/render.mjs --stills` renders frames 0, 1/3, 2/3 and the last frame to `out/`; `node scripts/render.mjs --frames=0,45,90` renders any frames you choose. Look at the PNGs and iterate.
- Final: `node scripts/render.mjs` renders `out/pf-camera-campaign.mp4`.
- Put any extra deliverable the spec asks for (for example `spatial-audit.json`) at the project root.

## Bar

This is a launch-video motion component. Hit every number in the spec, then make it look as good as you can: easing, motion blur, typography, depth, composition, color. Text must be crisp and readable when it rests. Nothing may clip or overlap unintentionally.

## Rules

Work only inside this directory. Do not read other folders on this machine, search the web for this component, or install packages.
