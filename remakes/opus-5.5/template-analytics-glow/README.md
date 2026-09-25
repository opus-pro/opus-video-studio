# Growing Analytics Capsules: Claude Opus 5.5 remake

A blind remake of [Growing Analytics Capsules](../../../templates/template-analytics-glow/) by Claude Opus 5.5 in Claude Code. The only input was [`project/TASK.md`](project/TASK.md): the written spec, the same assets and an empty Remotion project. There was no access to the original source or video demo, and no human feedback.

[![GPT-6 v1 (left) vs Claude Opus 5.5 (right)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/template-analytics-glow/compare.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/template-analytics-glow/compare.mp4)

[Watch side by side](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/template-analytics-glow/compare.mp4) · [Watch the remake](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/template-analytics-glow/remake.mp4) · [Original template](../../../templates/template-analytics-glow/) · [Build log](project/BUILD-LOG.md)

960×540 · 60 fps · 180 frames · silent · one-paragraph brief · 11 min · 5 review rounds

## Run locally

From the repository root, restore the media (the same files as the original release), then install and preview:

```sh
npm run remakes:prepare -- template-analytics-glow
cd remakes/opus-5.5/template-analytics-glow/project
npm ci
npm run studio
```

`npm run render` writes `out/template-analytics-glow.mp4`. `npm run stills` writes frames 0, ⅓, ⅔ and last. Node.js 22+, npm and `unzip` are required.
