# Agent guide

This repository ships the **Opus Video Studio** plugin for Codex and Claude Code (with the managed
Opus Video Tools MCP connection), plus open-source Remotion video templates and their Claude Opus 5.5 remakes.

## Install the plugin for a user

Follow the protocol for the client you are running in. Don't treat this checkout as an installed plugin:
the skills resolve their plugin root from the installed package path.

- Claude Code (terminal or Desktop Code): [docs/claude-code-install-protocol.md](docs/claude-code-install-protocol.md)
- Codex: [docs/codex-install-protocol.md](docs/codex-install-protocol.md)

Once installed, the entry points are the plugin skills: `get-started`, `motion-ui` for templates and
local motion, `media-tools`, and `video-director`.

## Work with templates in this checkout

- Catalogue: [templates/README.md](templates/README.md) and `templates/catalog.json` (9 full templates, 34 components).
- Restore one template's media, then install and preview it:
  `npm run templates:prepare -- <id>`, then `cd templates/<id>/project && npm ci && npm run studio`.
- Claude Opus 5.5 remakes of every component: [remakes/opus-5.5/README.md](remakes/opus-5.5/README.md).
  Run `npm run remakes:prepare -- <id>`, then `cd remakes/opus-5.5/<id>/project && npm ci && npm run studio`.
- To adapt a template for a user's product, copy the prepared project into the user's workspace and follow
  [plugins/opus-video-studio/docs/template-source.md](plugins/opus-video-studio/docs/template-source.md).
  Keep the lockfile and use only real brand assets.

## Before you commit

Run `npm test` (Node.js 22+). Never commit restored media. Files that `templates:prepare` or `remakes:prepare`
restore are recorded as `"storage": "download"` in their catalogue and must stay out of Git.
