# Icon-to-Wordmark Reveal: Claude Opus 5.5 remake

A blind remake of [Icon-to-Wordmark Reveal](../../../templates/pf-mark-lockup/) by Claude Opus 5.5 in Claude Code. The only input was [`project/TASK.md`](project/TASK.md): the written spec, the same assets and an empty Remotion project. There was no access to the original source or video demo, and no human feedback.

[![GPT-6 v1 (left) vs Claude Opus 5.5 (right)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-mark-lockup/compare.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-mark-lockup/compare.mp4)

[Watch side by side](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-mark-lockup/compare.mp4) · [Watch the remake](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/pf-mark-lockup/remake.mp4) · [Original template](../../../templates/pf-mark-lockup/) · [Build log](project/BUILD-LOG.md)

1920×1080 · 60 fps · 216 frames · silent · precise spec · 13 min · 5 review rounds

## Run locally

From the repository root, restore the media (the same files as the original release), then install and preview:

```sh
npm run remakes:prepare -- pf-mark-lockup
cd remakes/opus-5.5/pf-mark-lockup/project
npm ci
npm run studio
```

`npm run render` writes `out/pf-mark-lockup.mp4`. `npm run stills` writes frames 0, ⅓, ⅔ and last. Node.js 22+, npm and `unzip` are required.
