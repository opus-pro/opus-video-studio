# Idea to Shared World

Turn one prompt into a finished, shareable creative result. Best for: AI companions and creation products.

[Gallery](https://product-videos.labs.opus.pro/template-case-companion) · [Watch video demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-companion-v1.0.0/preview.mp4) · [Editable source](project/) · [Original package notes](project/README.md)

[![Watch Idea to Shared World video demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-companion-v1.0.0/poster.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-companion-v1.0.0/preview.mp4)

Motion component · 10.5333 seconds · 30 fps · release 1.1.0 (editable-source-v1.1.0).
The original package configuration is authoritative for render dimensions; gallery previews may use a smaller canvas.

## Run locally

From the repository root, restore the release's media, then install and preview:

```sh
npm run templates:prepare -- template-case-companion
cd templates/template-case-companion/project
npm ci
npm run verify
npm run check
npm run studio
```

Export with `npm run render`. Node.js 22+, npm, and `unzip` are required; full templates also use FFmpeg. The first render may download Chromium. See the [package notes](project/README.md) for browser configuration, composition selection, audio, and output paths.

## Customize

Read the original package's README, asset notes, and configuration before editing `project/src/`. Preserve its lockfile and use the preview only for comparison. Source files and their published hashes are preserved; package integrity checks can intentionally fail after edits. The media preparation command never overwrites an existing file.

Template source is [MIT licensed](../LICENSE). Media, fonts, sample brands, and dependencies have separate terms; see [asset licensing](../THIRD_PARTY_NOTICES.md) and this package's asset notes. No Opus account or paid generation is required to edit and render the local baseline.
