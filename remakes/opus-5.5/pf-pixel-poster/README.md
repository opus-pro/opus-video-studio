# Dithered Event Poster: Claude Opus 5.5 remake

A blind remake of [Dithered Event Poster](../../../templates/pf-pixel-poster/) by Claude Opus 5.5 in Claude Code. The only input was [`project/TASK.md`](project/TASK.md): the written spec, the same assets and an empty Remotion project. There was no access to the original source or video demo, and no human feedback.

[![GPT-6 v1 (left) vs Claude Opus 5.5 (right)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-pixel-poster/compare.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-pixel-poster/compare.mp4)

[Watch side by side](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-pixel-poster/compare.mp4) · [Watch the remake](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-pixel-poster/remake.mp4) · [Original template](../../../templates/pf-pixel-poster/) · [Build log](project/BUILD-LOG.md)

1350×1350 · 60 fps · 288 frames · silent · precise spec · 16 min · 5 review rounds

## Run locally

From the repository root, restore the media (the same files as the original release), then install and preview:

```sh
npm run remakes:prepare -- pf-pixel-poster
cd remakes/opus-5.5/pf-pixel-poster/project
npm ci
npm run studio
```

`npm run render` writes `out/pf-pixel-poster.mp4`. `npm run stills` writes frames 0, ⅓, ⅔ and last. Node.js 22+, npm and `unzip` are required.
