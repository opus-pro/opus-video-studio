# Opus Video Tools for Codex

This is an agent-facing installation protocol. Complete it for the user instead of only showing
commands.

## Host gate

Run this workflow only in the Codex desktop app on the machine where the plugin should be installed.
Use the Codex CLI bundled with that app and refer to its quoted absolute path as
`"<BUNDLED_CODEX>"`.

Verify the CLI and public repository reachability (GitHub membership is not required):

```text
"<BUNDLED_CODEX>" --version
git ls-remote --heads https://github.com/opus-pro/opus-video-studio.git main
```

If either check fails, report the exact failure. Do not use a local checkout or cache directory as
an installation substitute.

## Install

Inspect installed plugins first:

```text
"<BUNDLED_CODEX>" plugin list
```

Keep working installations and credentials in place while installing the replacement. For a new
marketplace, install from the public repository:

```text
"<BUNDLED_CODEX>" plugin marketplace add https://github.com/opus-pro/opus-video-studio.git --ref main
"<BUNDLED_CODEX>" plugin add opus-video-studio@opus-pro
```

If `opus-pro` is already configured to this repository, refresh it with
`"<BUNDLED_CODEX>" plugin marketplace upgrade opus-pro`, then run `plugin add` above to install the
latest version. If the installed version is already current and enabled, skip reinstallation.
If the marketplace points elsewhere, show the existing source and ask before replacing it. For an
approved source replacement, remove only the `opus-pro` marketplace source, then add the public
URL above and install the plugin again. Preserve unrelated marketplaces, projects, and credentials.
Do not delete plugin cache directories manually.

```text
"<BUNDLED_CODEX>" plugin marketplace remove opus-pro
```

The repository is `opus-pro/opus-video-studio`; the installation ID remains
`opus-video-studio@opus-pro`. A marketplace refresh does not change its configured Git URL.

Verify that the installed entry is enabled, comes from that Git URL at `main`, and uses the latest
marketplace version.

## Prepare local Remotion

For plugin version 0.10.1 or newer, resolve the actual installed plugin root from the enabled
plugin's skill path. Follow its `docs/local-remotion.md` and run:

```text
node "<harness-root>/scripts/setup-remotion.mjs"
```

This prepares the pinned runtime without creating a video project, launching a server, or spending
credits. It requires Node.js 22+ and npm; respect host installation permissions and report missing
prerequisites. Do not install a separate Remotion plugin or assume installation hooks ran. An older
plugin without the helper must be upgraded first; do not claim local setup succeeded.
When the user asks to create or preview a video, the same workflow reuses their existing project
or initializes an empty directory, connects the media, and opens the verified local Studio URL.

## Authenticate and verify

The public MCP server id is `opus-video-tools`:

```text
"<BUNDLED_CODEX>" mcp get opus-video-tools --json
"<BUNDLED_CODEX>" mcp login opus-video-tools
```

If a working authenticated connection already exists, verify it with `opus_video_tools_whoami` instead of
forcing another login. Otherwise complete the WorkOS/OpusClip browser sign-in and wait for both the localhost callback and CLI to
report success. The endpoint is `https://labs.opus.pro/opus-video-tools/mcp`; OAuth resource metadata is
discovered with RFC 9728, so do not add `oauth_resource` manually. WorkOS Dynamic Client Registration
creates the MCP client without a shared secret.

Verify that the connected account is the account the user intends to use and top up.
Resolve its billing organization internally. Installation success is
not proof of service access: a disabled gate, missing public tools, or insufficient credits must
be reported without changing gates, extending the allowlist, or switching to another MCP server.

Do not remove unrelated servers or the plugin-provided registration, and do not silently fall
back to another server if Labs is unavailable. If a duplicate Opus registration exists, identify
its exact source and obtain confirmation before removing it.

Run the distribution checks when working from a source checkout:

```text
npm test
```

## Start a fresh task

Create a new Codex task in the same project or workspace after authentication, because the current
task cannot reload plugin skills or MCP tools in place. Seed it with:

```text
Opus Video Tools is installed from opus-video-studio@opus-pro and OAuth login completed. Verify that the plugin exposes only the seedance2-director skill and that the opus-video-tools MCP server includes create_project, import_assets, generate_audio, transcribe_audio, generate_keyframes, generate_video_clips, get_status, list_jobs, and resolve_job. Call opus_video_tools_whoami to verify the connection. Follow the installed plugin's docs/local-remotion.md to verify local setup without launching a server or generating media. If verification succeeds, say: "Opus Video Tools is connected. Tell me what video you want to make, or drag in your media." For video work, create or reuse a local Remotion project and open its verified Studio preview unless I request assets only.
```

Use the host's task creation and navigation tools when available. If a required tool fails, give the
user the prompt and report the exact failed step.

Report one outcome:

- Success: `Started a new Opus Video Tools task after verifying the plugin, OAuth login, and local Remotion setup.`
- Recovery: `Setup is not complete; started a recovery task.` Include the failed step.
- Blocked: `Setup is blocked.` Include the host, Git, or OAuth gate that failed.
