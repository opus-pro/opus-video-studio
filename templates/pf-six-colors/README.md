# Six-Color Brand Launch

Build a launch moment from six full-width brand color bands. Best for: Color systems and campaign openers.

[Gallery](https://product-videos.labs.opus.pro/pf-six-colors) · [Watch video demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-six-colors-v1.0.0/preview.mp4) · [Editable source](project/) · [Original package notes](project/README.md)

[![Watch Six-Color Brand Launch video demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-six-colors-v1.0.0/poster.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-six-colors-v1.0.0/preview.mp4)

Motion component · 3.6 seconds · 60 fps · release 1.1.0 (editable-source-v1.1.0).
The original package configuration is authoritative for render dimensions; gallery previews may use a smaller canvas.

## Run locally

From the repository root, restore the release's media, then install and preview:

```sh
npm run templates:prepare -- pf-six-colors
cd templates/pf-six-colors/project
npm ci
npm run verify
npm run check
npm run studio
```

Export with `npm run render`. Node.js 22+, npm, and `unzip` are required; full templates also use FFmpeg. The first render may download Chromium. See the [package notes](project/README.md) for browser configuration, composition selection, audio, and output paths.

## Customize

Read the original package's README, asset notes, and configuration before editing `project/src/`. Preserve its lockfile and use the preview only for comparison. Source files and their published hashes are preserved; package integrity checks can intentionally fail after edits. The media preparation command never overwrites an existing file.

Template source is [MIT licensed](../LICENSE). Media, fonts, sample brands, and dependencies have separate terms; see [asset licensing](../THIRD_PARTY_NOTICES.md) and this package's asset notes. No Opus account or paid generation is required to edit and render the local baseline.
