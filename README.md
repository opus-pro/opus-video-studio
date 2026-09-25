<p align="center">
  <a href="https://labs.opus.pro">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/opus-labs-wordmark-white.svg">
      <img alt="Opus Labs" src=".github/assets/opus-labs-wordmark-black.svg" height="34">
    </picture>
  </a>
</p>

<h1 align="center">Opus Video Tools</h1>

<p align="center">
  Create videos, images, voiceovers, and music with Opus tools in Codex and Claude Code.<br>
  Use a local Remotion Studio project to preview and assemble your results.
</p>

<p align="center">
  <a href="https://labs.opus.pro"><b>labs.opus.pro</b></a> ·
  <a href="https://product-videos.labs.opus.pro/">Template gallery</a> ·
  <a href="templates/README.md">43 open-source templates</a> ·
  <a href="remakes/opus-5.5/README.md">Claude Opus 5.5 remakes</a> ·
  <a href="#install">Install</a>
</p>

<p align="center">
  <a href="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/launch-film/launch-film-16x9.mp4"><img alt="Watch the launch film" src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/launch-film/poster.jpg" width="820"></a><br>
  <sub>The launch film, made by Claude Opus 5.5 with this repository. <a href="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/opus-5.5/v1/launch-film/launch-film-9x16.mp4">Vertical cut</a></sub>
</p>

## Open-source video templates

**9 full video templates and 34 motion components** from Product Videos are now
available as [editable source in this repository](templates/), under the
[MIT License](templates/LICENSE).

[Browse the gallery](https://product-videos.labs.opus.pro/) ·
[Explore all templates and video demos](templates/README.md) ·
[Watch the AI Coding Agent demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/preview.mp4)

[![Watch the AI Coding Agent video demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/poster.jpg)](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/preview.mp4)

Each template includes its original animation source, configuration, locked
dependencies, and asset notes. Download only the selected template's media:

```sh
git clone https://github.com/opus-pro/opus-video-studio.git
cd opus-video-studio
npm run templates:prepare -- ai-research
cd templates/ai-research/project
npm ci
npm run studio
# Export the video:
npm run render
```

See the [template guide](templates/README.md) for prerequisites and all 43 examples.
Local template editing and rendering need no Opus account or paid generation.
The hosted gallery may require sign-in; source and video demo links are public.

## Claude Opus 5.5 remakes

Each of the 34 motion components also comes as a **blind remake by Claude Opus 5.5**, placed next to the original.
Claude Opus 5.5 received only the component's written spec, the same assets and an empty Remotion
project. It never saw the original source or video demo, and it worked without human feedback.
Every remake keeps the exact prompt (`TASK.md`) and the model's own `BUILD-LOG.md`.

```sh
npm run remakes:prepare -- pf-brand-clover
cd remakes/opus-5.5/pf-brand-clover/project
npm ci
npm run studio
```

See the [remake guide](remakes/opus-5.5/README.md) for the protocol and all 34 side-by-side comparisons.
Remakes reuse the original release's media, so preparation downloads and verifies the same files.

## Install

In **Claude Code**, run:

```text
/plugin marketplace add opus-pro/opus-video-studio
/plugin install opus-video-studio@opus-pro
```

In **Codex**, run:

```sh
codex plugin marketplace add https://github.com/opus-pro/opus-video-studio.git --ref main
codex plugin add opus-video-studio@opus-pro
```

Or ask your agent to *"install Opus Video Tools by following the guide at
https://github.com/opus-pro/opus-video-studio/blob/main/docs/claude-code-install-protocol.md"*
(swap in `codex-install-protocol.md` for Codex). The guides also cover upgrades, Desktop and MCP sign-in.

- [Codex installation guide](docs/codex-install-protocol.md)
- [Claude Code installation guide](docs/claude-code-install-protocol.md)
- [Publishing and verifying the shared website guides](docs/guide-publication.md)

The Product Videos website currently offers Codex onboarding. The plugin keeps
both client distributions and shares its source-template and media workflows.

The repository is public; managed generation still requires an authorized Opus account,
product access, and sufficient credits. Installing the plugin does not grant service access.
Local Remotion setup and preview do not spend Opus generation credits.

## Included

- [Get started](plugins/opus-video-studio/skills/get-started/SKILL.md): choose a template or generated media. Browse the [template library](https://product-videos.labs.opus.pro/) or start from the [open-source templates](templates/).

- [Motion UI](plugins/opus-video-studio/skills/motion-ui/SKILL.md): editable UI animation and code-driven product videos, with real-UI fidelity, kinetic typography, deliberate easing, and optional Opus audio.
- [Media Tools](plugins/opus-video-studio/skills/media-tools/SKILL.md): standalone audio, images/keyframes, transcription, asset import, and job status/recovery.
- [Video Director](plugins/opus-video-studio/skills/video-director/SKILL.md): directing and prompt optimization for every new AI video generation, including direct model requests. It supports whichever video models the public tools expose; the bundled Seedance pack is loaded only for Seedance.
- The `opus-video-tools` MCP connection at `https://labs.opus.pro/opus-video-tools/mcp`.
- Pinned local Remotion dependencies, a setup helper, and an editable starter composition.

Video Director planning and the complete timed script apply to managed video clips. Local
animation and code-generated video use the chosen framework; standalone media calls review the
requested text, audio brief, or image prompt without a video storyboard. Paid generation still
requires approval of the exact request. The plugin
tracks asynchronous jobs and reuses request keys for identical retries. It contains no provider
credentials or backend service implementation.

## Names

| Setting | Value | Defined in |
|---|---|---|
| Public repository | `opus-pro/opus-video-studio` | GitHub and installation guides |
| Display name | `Opus Video Tools` | Codex plugin manifest |
| Plugin installation ID | `opus-video-studio@opus-pro` | Codex and Claude marketplace manifests |
| MCP server ID | `opus-video-tools` | Plugin `.mcp.json` |

The installation ID is stable so existing clients can upgrade. Repository names, plugin IDs,
display names, and OAuth resource addresses are separate settings.

## Validate

Run `npm test` with Node.js 22 or newer. These local checks do not prove live OAuth, generation,
or billing availability. The installation guides include connection checks.

## License

Opus-authored template source and tooling in [`templates/`](templates/) and the
remake source in [`remakes/`](remakes/) are [MIT licensed](templates/LICENSE). Media, fonts,
trademarks, and dependencies retain their own terms; see the
[asset notices](templates/THIRD_PARTY_NOTICES.md).
The plugin outside `templates/` and `remakes/` retains its existing proprietary license designation.

---

<p align="center">
  <a href="https://labs.opus.pro">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/opus-labs-wordmark-white.svg">
      <img alt="Opus Labs" src=".github/assets/opus-labs-wordmark-black.svg" height="20">
    </picture>
  </a><br>
  <sub>Built by <a href="https://labs.opus.pro">Opus Labs</a> at <a href="https://www.opus.pro">OpusClip</a>.</sub>
</p>
