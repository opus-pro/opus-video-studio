# Opus Video Tools for Claude

Install or update the public plugin in a supported Claude Code session, then
continue the user's request. Setup is free; media generation uses Opus credits.
Do not generate media, transcribe audio, upload assets or create a media project
as an installation test. Website sign-in and MCP authorization are separate.

## Identify the current host

Use actual session context, not the presence of a shell or `claude` executable.

- **Local Claude Code terminal:** use the plugin commands below.
- **Claude Desktop, Code mode, local session:** use the plugin too. Open the
  **+ → Plugins** menu by the prompt box to add/manage it, or use the supported
  local CLI commands below. Desktop Code is not ordinary desktop Chat.
- **Claude Chat (desktop or claude.ai) and Cowork:** use the remote connector
  section below. Installing a CLI plugin in a sandbox does not install this
  local package for that conversation. Do not suggest `/mcp` there.
- **Remote/SSH/cloud session:** a shell installs on that session's machine,
  not on the user's computer. Identify the intended host before installing.
  Follow that client's supported plugin/connector controls; do not claim local
  file or preview access from a remote installation.

If the host cannot be established, ask which mode and machine the user means.
Do not require another conversation when the four skills are already loaded.
For a greeting or template request, use the current plugin without repeating
installation, authentication or runtime setup. An explicit repair/update or
connection-check request still uses the relevant checks below.

## Install or upgrade the local plugin

The public source is https://github.com/opus-pro/opus-video-studio.git and the
stable install ID is `opus-video-studio@opus-pro`. No company GitHub access is
required. Use the actual local Claude Code installation. Inspect supported
commands and current state:

```sh
claude --version
claude plugin --help
claude plugin marketplace list --json
claude plugin list --json
```

If `opus-pro` is absent, add it:

```sh
claude plugin marketplace add opus-pro/opus-video-studio
```

If it already points to the public repository above, refresh it:

```sh
claude plugin marketplace update opus-pro
```

Wait for refresh success. A stale cached marketplace can otherwise keep an old
plugin even when installation reports success. If its source is a different
repository, explain the conflict before replacing it. Never delete unrelated
plugins, shared configuration, projects or OAuth credentials.

If the plugin is absent, install it:

```sh
claude plugin install opus-video-studio@opus-pro
```

For an existing installation, update it after refreshing the marketplace:

```sh
claude plugin update opus-video-studio@opus-pro
claude plugin list --json
```

Use the installation's existing scope; inspect `--help` for `--scope` if it is
project/local rather than user-scoped. Skip reinstalling a current, complete,
enabled package. Enable a disabled package through `/plugin` or Desktop Code's
Plugins controls. Use the Installed/Errors views for load failures. Do not depend
on `claude plugin details`: it is not a supported command in every client.
A command failure or stale-source warning is a pending/failed check, not success.

An old installation can still contain the `aao` server and an old endpoint.
After the supported update, verify that the installed package contains just
`opus-video-tools` at `https://labs.opus.pro/opus-video-tools/mcp`. Do not add a
duplicate standalone MCP server to compensate for an old plugin.

## Verify the installed package and activate it

Use `installPath` from `claude plugin list --json`, the enabled plugin's details
in `/plugin`, or a loaded skill's actual path. The plugin root contains
`.claude-plugin/plugin.json`, `.mcp.json`, `skills/` and `scripts/`; it is not the
marketplace checkout. Do not guess a versioned cache path. If multiple scopes
are installed, inspect the one enabled for this workspace before running helpers.

Confirm the manifest version matches the refreshed public marketplace and all
four skill files exist: `get-started`, `motion-ui`, `media-tools`, `video-director`.
Read `docs/shared-rules.md` from that root. The SessionStart hook runs Node to
point Claude to these rules; local Claude Code needs Node.js 22+ on its PATH.
Check `node --version` if the hook fails. This is separate from installing the
Remotion runtime and does not justify a large dependency install during setup.

Claude Code loads a plugin's MCP server when a session starts or plugins are
reloaded. A plugin installed during this conversation has no `opus-video-tools`
tools yet. The agent cannot run slash commands, so before asking for a reload,
sign in from the shell (see below) when managed tools will be needed. Then ask
the user to type `/reload-plugins` once; the server connects already signed in.
Desktop Code's Plugins controls and activation behavior vary by client version;
follow the actual status and inspect loaded skills/tools. If the client
explicitly requires restart, explain the pending activation and preserve the
user's brief and local workspace for their resume. Do not automatically create
another task or session, or claim that an installation command loaded tools
into the current session.

## Connect and verify managed tools

Local template downloads and editing do not require MCP login. When managed
media is requested, or the user explicitly asks to verify setup, discover the
live plugin tool schemas and call `opus_video_tools_whoami`. Start the sign-in
yourself; send the user to `/mcp` only as a fallback.

**Server loaded, sign-in needed.** When the plugin server needs authentication,
Claude Code exposes an `authenticate` tool for it (for example
`mcp__plugin_opus-video-studio_opus-video-tools__authenticate`; discover it
among deferred tools). Call it and open the returned authorization URL. The
server's real tools then load into the current session without a reload.

Do not end the turn asking the user to reply when they have approved. Tell them
in one line that an Opus sign-in tab is open (with the link in case it did not
open), then wait for the connection yourself with a background command:

```sh
for i in $(seq 150); do claude mcp get plugin:opus-video-studio:opus-video-tools 2>/dev/null | grep -q 'Connected' && echo connected && exit 0; sleep 2; done; echo timeout
```

On `connected`, call `opus_video_tools_whoami` and report. On `timeout`, say
sign-in is still pending and offer the link again.

**Plugin just installed, or no `authenticate` tool.** First confirm the CLI sees
the plugin server:

```sh
claude mcp get plugin:opus-video-studio:opus-video-tools
```

If it is listed, sign in from the shell. `claude mcp login` requires a terminal,
and the agent's shell has none, so wrap it in a pseudo-terminal on macOS:

```sh
script -q /dev/null claude mcp login plugin:opus-video-studio:opus-video-tools
```

Run it in the background, tell the user in one line that a browser tab is
opening, and wait for its `Authenticated` output rather than asking the user to
reply. On Linux use `script -qc "<command>" /dev/null`. On SSH or
headless hosts, use `--no-browser` and have the user paste the redirect URL.
The token is saved for the plugin server, but a running session does not pick it
up: ask the user to type `/reload-plugins`, then call `opus_video_tools_whoami`.

**Fallback.** If the server is not listed (`No MCP servers configured` can occur
while the plugin is correctly installed), the login fails, or the shell cannot
open a browser, use the client's controls. In a **Claude Code terminal**, the
user types `/mcp` at Claude's prompt, selects the plugin's `opus-video-tools`
server and completes its browser authentication action. `/mcp` is a slash
command, not a URL, filesystem path or shell command. In **local Desktop Code**,
use the server's connection/authentication controls; **+ → Connectors** or
Settings → Connectors manages connections. If the client offers no auth action
for the plugin server, report that exact limitation. Do not create a second
server when the plugin already registered this endpoint.

Use the intended Opus account and organization. If browser sign-in selects the
wrong account, switch accounts on the Opus authorization page before granting
access; do not infer the MCP identity from the account shown elsewhere.
A browser callback, `Authenticated` message or connection badge is not proof
that a tool works; only a successful whoami is. `claude mcp list` and
`claude mcp get` are not installation gates. Do not read credential stores,
print tokens, run parallel logins, or loop through reinstallation/login after a
recurring OAuth error.

The stable managed endpoint is `https://labs.opus.pro/opus-video-tools/mcp`.
It uses OAuth discovery; no shared client secret, API key or manual resource
parameter is needed. Staging guide pages also install this production plugin.
Do not substitute a staging URL, the product root `/mcp`, or `/mcp-v2`.

## Remote connector for Claude Chat and Cowork

1. Open **Customize → Connectors → Add custom connector**, or the Connectors
   section of Settings in clients that use that layout. Reuse an existing
   connector for the exact endpoint. If an organization restricts connector
   creation, its owner must make it available before the user can connect.
2. Name it **Opus Video Tools** and enter
   `https://labs.opus.pro/opus-video-tools/mcp`. Use OAuth discovery without
   supplying shared credentials. The separate OpusClip connector is a different
   product.
3. Choose **Connect**, finish Opus authorization, and enable the connector in
   the actual conversation that will use it. Discover live tools (including
   deferred tools) and call `opus_video_tools_whoami` there.
4. Report missing tools, authorization or product access honestly. Reinstalling
   cannot grant account access. A successful employee-account check does not
   establish access for all accounts.

This remote connection does not install the local plugin's four skills or
Remotion. Do not claim local file access or a local preview from connector
installation alone. Use only media inputs and tools actually supported by the
host. Before paid work, follow `docs/shared-rules.md`: present the planned scope
and supported estimate, obtain authorization, preserve existing authorization,
and use stable request keys for retries. Reservations are estimates, not caps.

## Report only observed checks and continue

Separate package/version, four loaded skills, live tool discovery and whoami as
passed, failed, pending or not applicable to the host. For an explicit setup
verification, the public catalog has ten tools (the host may namespace them):
`opus_video_tools_whoami`, `create_project`, `import_assets`, `generate_audio`,
`transcribe_audio`, `generate_keyframes`, `generate_video_clips`, `get_status`,
`list_jobs` and `resolve_job`. Do not substitute another server's similarly
named tool. Only a successful whoami establishes authenticated tool access.

Keep the report short and plain: one line per check, then the next step. A
successful whoami completes the account check; do not list account identity as
pending because it returns only IDs. Mention a check as pending only when the
user has something to do, and name that one action.

Continue the original request in this conversation when capabilities are loaded.
For a welcome, offer the template library or media generation briefly. Follow
`motion-ui` and `docs/template-source.md` for a selected template; preserve its
original source and lockfile. Defer local dependencies until editing/previewing
needs them. `scripts/setup-remotion.mjs` and `docs/local-remotion.md` inside the
verified plugin root are for a new local project, not an installation smoke test.

Client references: [Desktop Code](https://code.claude.com/docs/en/desktop),
[plugin installation and activation](https://code.claude.com/docs/en/discover-plugins),
[custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).
