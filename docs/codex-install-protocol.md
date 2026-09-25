# Install Opus Video Tools in Codex

Install the plugin, then help the user start creating in the same conversation.
Setup and template downloads are free. Generated media uses Opus credits.

## Reuse an available plugin

If this conversation already exposes the current Opus Video Tools skills
(`get-started`, `motion-ui`, `media-tools`, `video-director`), proceed to the
welcome below. Do not run shell setup, a runtime installer, an updater or an
account check just to greet the user. An explicit update/repair request still
uses the installation path below.

If Codex displays an install/connect card for the plugin mention, use that
native flow and Continue in this conversation. Do not create another task.

## First installation or requested update

This public repository is the source:
https://github.com/opus-pro/opus-video-studio.git

The stable install ID is `opus-video-studio@opus-pro`. Install on the local
machine running Codex desktop. A cloud sandbox cannot install into the user's
computer. Find the CLI bundled with the running desktop app and use its quoted
absolute path as `<CODEX>` below; do not assume a separately installed CLI is
that executable.

Inspect the supported commands and current entry:

```sh
"<CODEX>" plugin --help
"<CODEX>" plugin list --json
"<CODEX>" plugin marketplace list
```

If the public marketplace is absent:

```sh
"<CODEX>" plugin marketplace add https://github.com/opus-pro/opus-video-studio.git --ref main
```

If already registered to this public Git repository, refresh its snapshot with
`"<CODEX>" plugin marketplace upgrade opus-pro`. If the plugin is absent,
install it after adding or refreshing the marketplace:

```sh
"<CODEX>" plugin add opus-video-studio@opus-pro --json
```

Reuse a current, complete, enabled installation. If an older or incomplete
package needs replacement, verify the
refresh succeeded before running these sequentially:

```sh
"<CODEX>" plugin remove opus-video-studio@opus-pro --json
"<CODEX>" plugin add opus-video-studio@opus-pro --json
```

Keep the returned `installedPath`. Verify its `.codex-plugin/plugin.json`,
`.mcp.json` and four skill files. The `SOURCE` in plugin list points to the
marketplace checkout, not the installed package. If the configured marketplace
points elsewhere, explain the mismatch before replacing it. Never delete shared
configuration, unrelated plugins or OAuth credentials to repair this package.
If any command fails, report the actual error; do not claim installation succeeded.
If this desktop version does not support the listed commands, use its native
plugin installer or report the client update needed; do not substitute a random
CLI executable. A disabled installation must be enabled through the host's
supported plugin controls before claiming its skills are available.

A CLI installation does not prove that this conversation loaded the new skills
or MCP tools. If Codex exposes a native reload/Continue action, use it. Otherwise
report activation as pending and ask the user to enable the installed plugin in
the app's plugin controls, then continue here. Do not invent a website button or
promise that a follow-up message reloads tools. If this client explicitly requires
a restart or another session, explain that limitation and preserve the user's
brief and template link; let the user initiate it. Do not create another task
automatically, repeat setup to force
missing tools to appear, or report MCP verification as complete.
Never require a new session when the skills are already available here.

## Welcome

Briefly ask, in the user's language, whether they want to:

1. Edit a motion video from the [template library](https://product-videos.labs.opus.pro/).
   They can paste a template link and describe what to change.
2. Generate video, voiceover, music, images or sound effects.

If the original request already contains a template link, skip this choice.
Use the installed `motion-ui` skill and `docs/template-source.md` to download
and verify the original source, then ask what branding, screens, copy and audio
to replace. Preserve the downloaded project's code and lockfile.

## Set up capabilities when needed

- Local templates: no MCP login or paid generation. Follow the downloaded
  project's README when dependencies or a render are needed. Do not initialize a
  replacement project or run `setup-remotion.mjs` just for the welcome.
- A new local project: follow `docs/local-remotion.md` in the installed plugin.
- Managed media: use the relevant installed skill. Discover the needed live
  schemas and call `opus_video_tools_whoami` before claiming a connection works.
  Authenticate through the native connect flow if needed. The managed endpoint is
  https://labs.opus.pro/opus-video-tools/mcp and needs no personal API key.

For an explicit connection check, discover the public `opus-video-tools` tools,
including deferred tools, and actually call `opus_video_tools_whoami`. If the
host supports CLI OAuth, use `"<CODEX>" mcp login opus-video-tools` and wait for
the browser callback. A successful OAuth callback still requires a real whoami
in the conversation to prove tool access. Do not read credential stores or
print tokens. Website sign-in alone does not authenticate the MCP session.

Report installation/version, the four skills, live tool discovery and whoami
separately as passed, failed, pending or not requested. The ten public tools are
`opus_video_tools_whoami`, `create_project`, `import_assets`, `generate_audio`,
`transcribe_audio`, `generate_keyframes`, `generate_video_clips`, `get_status`,
`list_jobs` and `resolve_job`. Namespaces may be added by the host. Tools from
another plugin do not prove that this server loaded. A missing tool is not a
reason to generate media or silently install a duplicate MCP server.

Keep the final setup message short and in plain language, like this (in the
user's language; no tables, and no user, org or token IDs):

```text
Setup is complete.
- Plugin: Opus Video Studio <version>
- Skills: all four loaded
- Tools: all 10 available
- Account: signed in (<plan> plan)
Nothing was generated and no credits were used.

Next, paste a motion template link to edit, or ask me to generate video,
voiceover, music, images or sound effects.
```

Link "motion template" to https://product-videos.labs.opus.pro/. Add the
account email or organization name only when whoami returns one. For a
failed or pending check, replace its line with what is missing and the single
action the user needs to take. Do not list account identity as pending just
because whoami returns only IDs.

An installation that still names the old `aao` server is stale: refresh the
public marketplace and replace only this plugin using the steps above. Inspect
the installed `.mcp.json` again before troubleshooting OAuth. Both production
and staging guide pages install the same public production plugin; do not change
its URL to a staging endpoint, the product root `/mcp`, or `/mcp-v2`.

For a failed MCP login, inspect the actual error. A rejected refresh token
(`invalid_grant`) permits one targeted sequential `mcp logout opus-video-tools`
then `mcp login opus-video-tools` recovery. Wait for the browser callback and
recheck whoami. Preserve healthy credentials and unrelated connections. If the
error recurs, stop and report it; reinstalling the package is not an OAuth fix.
Never call generation, create a media project, or spend credits as a setup test.
