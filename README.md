# Opus Video Tools

Create videos, images, voiceovers, and music with Opus tools in Codex or Claude Code.
Use a local Remotion Studio project to preview and assemble your results.

## Install

- [Codex installation guide](docs/codex-install-protocol.md)
- [Claude Code installation guide](docs/claude-code-install-protocol.md)

The repository is public; managed generation still requires an authorized Opus account,
product access, and sufficient credits. Installing the plugin does not grant service access.
Local Remotion setup and preview do not spend Opus generation credits.

## Included

- One public skill: Seedance Director, with its referenced creative guides and helpers.
- The `opus-video-tools` MCP connection at `https://labs.opus.pro/opus-video-tools/mcp`.
- Pinned local Remotion dependencies, a setup helper, and an editable starter composition.

Paid generation requires approval of the complete timed script and exact request. The plugin
tracks asynchronous jobs and reuses request keys for identical retries. It contains no provider
credentials or backend service implementation.

## Names

| Setting | Value | Defined in |
|---|---|---|
| Public repository | `opus-pro/opus-video-tools` | GitHub and installation guides |
| Display name | `Opus Video Tools` | Codex plugin manifest |
| Plugin installation ID | `opus-video-studio@opus-pro` | Both marketplace manifests |
| MCP server ID | `opus-video-tools` | Plugin `.mcp.json` |

The installation ID is stable so existing clients can upgrade. Repository names, plugin IDs,
display names, and OAuth resource addresses are separate settings.

## Validate

Run `npm test` with Node.js 22 or newer. These local checks do not prove live OAuth, generation,
or billing availability. The installation guides include connection checks.

Public availability does not change the existing proprietary license designation. Dependencies
retain their own licenses; Remotion's license terms apply separately.
