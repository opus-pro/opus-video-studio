# Four Blocks Converge — editable source 1.1.0

Download and modify this source project. The published animation source is preserved byte for byte from its original code archive; the portable installation and rendering wrapper is new. Do not rebuild the animation from the preview.

## Run

Node.js 22 or later and npm are required. Install the locked dependencies:

```sh
npm ci
npm run verify
npm run check
npm run studio
npm run render
```

Select `study-brand-gather` in Studio. `npm run render` renders only this composition to `out/study-brand-gather.mp4`: 960×540, 30 fps, 66 frames. This component is intentionally silent. `npm run render -- --preview` uses the gallery preview dimensions. `npm run stills` renders four inspection frames; stills alone are not full-video review.

The first render may download Remotion's Chromium. A preinstalled browser can be selected with `REMOTION_BROWSER_EXECUTABLE`. All creative assets are local; no plugin, MCP, paid generation, parent project or private file is needed to render the baseline.

## Edit the original composition

Read `template.json`, `src/index.tsx`, its imported source files, `MOTION-NOTES.md`, and `ASSETS.md`. Find the Composition whose id is `study-brand-gather` and edit its defaultProps and component implementation. Related compositions remain in the recovered batch source so shared helpers and geometry are preserved; the render script selects only this template. Do not substitute another composition.

Preserve the package versions and lockfile. Run `npm run verify` before edits to check the downloaded release; it intentionally fails after source changes. Use `npm run check` and `npm run render` to validate adaptations. If the user requests a new duration or resolution, update both the composition and `template.json`, then inspect all affected timing and layout.

Use the preview for comparison only. The MP4 is not render input. Keep official logos and product imagery distinct from placeholders. Play the complete adapted MP4 and inspect transition boundaries, readable holds, brand correctness and ending before calling it finished. Record any review the current host cannot perform.

## Provenance

`manifest.json` records every packaged file and the original source hashes. The gallery preview is copied unchanged from the published release. This packaging repair restores existing source; it does not claim a new animation or a second independent creative generation.
