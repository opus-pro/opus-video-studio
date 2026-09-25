# Horizontal Portfolio Relay: Claude Opus 5.5 remake

A blind remake of [Horizontal Portfolio Relay](../../../templates/pf-carousel-horizontal/) by Claude Opus 5.5 in Claude Code. The only input was [`project/TASK.md`](project/TASK.md): the written spec, the same assets and an empty Remotion project. There was no access to the original source or video demo, and no human feedback.

[![GPT-6 v1 (left) vs Claude Opus 5.5 (right)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-carousel-horizontal/compare.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-carousel-horizontal/compare.mp4)

[Watch side by side](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-carousel-horizontal/compare.mp4) · [Watch the remake](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-carousel-horizontal/remake.mp4) · [Original template](../../../templates/pf-carousel-horizontal/) · [Build log](project/BUILD-LOG.md)

1200×1200 · 60 fps · 288 frames · silent · precise spec · 9 min · 5 review rounds

## Run locally

From the repository root, restore the media (the same files as the original release), then install and preview:

```sh
npm run remakes:prepare -- pf-carousel-horizontal
cd remakes/opus-5.5/pf-carousel-horizontal/project
npm ci
npm run studio
```

`npm run render` writes `out/pf-carousel-horizontal.mp4`. `npm run stills` writes frames 0, ⅓, ⅔ and last. Node.js 22+, npm and `unzip` are required.
