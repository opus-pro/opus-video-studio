# Opus Video Tools

Create videos, images, voiceovers, and music with Opus tools in Codex and Claude Code.
Use a local Remotion Studio project to preview and assemble your results.

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

## Install

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

Opus-authored template source and tooling in [`templates/`](templates/) are
[MIT licensed](templates/LICENSE). Media, fonts, trademarks, and dependencies
retain their own terms; see the [asset notices](templates/THIRD_PARTY_NOTICES.md).
The plugin outside `templates/` retains its existing proprietary license designation.
