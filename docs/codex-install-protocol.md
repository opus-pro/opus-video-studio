# Opus Video Tools for Codex

Install video, image, audio and local motion tools for Codex. Setup is free;
media generation uses Opus credits. Your agent should complete the checks below
and report their observed results.

The installation guide is public. Opening the main Opus media workspace may
require website sign-in first. Connecting the MCP is a separate authorization
step below; being signed in on the website does not verify the agent connection.

## Shared guide

This guide supports both Opus Video Tools and Product Videos. Use the current
guide at the supplied Labs URL so setup follows the latest supported steps.

For a standalone setup conversation, paste:

```text
/goal Read this guide and follow the setup instructions for the application I’m currently using: https://labs.opus.pro/opus-video-tools/codex. Do not generate paid media during setup.
```

If the request also includes a Product Videos template, preserve its complete
goal, immutable package URL and checksum, product details, and assets when
starting the fresh task. Finish the read-only setup checks first, then continue
the requested adaptation. Never discard the user's template in a generic setup task.

## Host gate

Run this workflow only in the Codex desktop app on the machine where the plugin should be installed.
Identify the current host before running commands; shell access alone is insufficient.
In Claude chat or Cowork, use the custom connector section of
[the Claude guide](https://labs.opus.pro/opus-video-tools/claude). Do not run a local
plugin installer or suggest `/mcp` in those conversations.
Use the Codex CLI bundled with that app and refer to its quoted absolute path as
`"<BUNDLED_CODEX>"`.
Resolve it from the running desktop application's installation directory. For example,
a macOS installation may use `/Applications/ChatGPT.app/Contents/Resources/codex`.
Verify that the executable exists and the version command below succeeds; application
names and custom installation locations can differ. `which codex` may point to a
separately installed CLI and does not identify the desktop application's bundled CLI.

Verify the CLI and public repository reachability (GitHub membership is not required):

```text
"<BUNDLED_CODEX>" --version
git ls-remote --heads https://github.com/opus-pro/opus-video-studio.git main
```

If either check fails, report the exact failure. Do not use a local checkout or cache directory as
an installation substitute.

## Install, update, or repair

Inspect the bundled CLI's supported commands and the exact installed entry first:

```text
"<BUNDLED_CODEX>" plugin list
"<BUNDLED_CODEX>" plugin remove --help
```

Record the source, enabled state, and installed version from this listing. Its `SOURCE`
column (or `source.path` in `plugin list --json`) identifies the marketplace source
checkout, not the installed plugin cache. Resolve the actual installed path as described
below. Inspect that path before claiming it is missing; an old skill path or a retained `@Opus Video Tools` mention
is not evidence about the current package. Neither `enabled`, a connected badge, nor an
OAuth configuration entry proves that authentication or tool calls work.

For a new marketplace, install from the public repository:

```text
"<BUNDLED_CODEX>" plugin marketplace add https://github.com/opus-pro/opus-video-studio.git --ref main
"<BUNDLED_CODEX>" plugin add opus-video-studio@opus-pro --json
```

On successful installation, save the JSON response's `installedPath` as
`OPUS_PLUGIN_ROOT`. Without `--json`, the same path appears after `Installed plugin root:`.
Use that exact returned path, including its version directory. Do not use the
marketplace root returned by `plugin marketplace add`, or the `SOURCE`/`source.path`
from `plugin list`, as the installed root.

If `opus-pro` already points to that public repository, refresh it first:

```text
"<BUNDLED_CODEX>" plugin marketplace upgrade opus-pro
```

Verify refresh succeeded and the intended release is available before removing an existing
installation. A refresh changes the marketplace snapshot, not the running task's tool set.
If the source points elsewhere, report the exact source and resolve that mismatch before
replacement; do not install from a different checkout or silently switch endpoints.

When an installed plugin needs an update or package repair, perform a clean reinstall through
the supported CLI. This includes missing/incomplete files or stale bundle contents even when
the version string matches. Do not just run `plugin add` over a broken installation:

```text
"<BUNDLED_CODEX>" plugin remove opus-video-studio@opus-pro --json
"<BUNDLED_CODEX>" plugin add opus-video-studio@opus-pro --json
```

Run sequentially and check each result. `plugin remove` is the supported uninstall and local
cache cleanup; do not manually delete all of `~/.codex/plugins`, edit shared config, or remove
unrelated marketplaces, MCP servers, credentials, projects, or media. If uninstall fails or the
reported plugin cache was not removed, stop and record the exact failure instead of layering
another installation over it. If reinstall fails after removal, report that Opus is uninstalled
and setup is incomplete. Preserve healthy OAuth credentials; invalid credentials have a
separate targeted recovery below. Do not log out as a routine package update step.

After reinstalling, replace `OPUS_PLUGIN_ROOT` with `installedPath` from the new
`plugin add --json` response, not the old task's skill path. Verify the enabled entry,
public Git source at `main`, manifest, `.mcp.json`, and public
skill files against the refreshed marketplace package. Version equality alone is insufficient.
Skip reinstallation only when the package is current and complete and the live checks below
pass. Do not repeat clean reinstalls for an OAuth error or an already-open task's stale tools.

The repository is `opus-pro/opus-video-studio`; the installation ID remains
`opus-video-studio@opus-pro`. A marketplace refresh does not change its configured Git URL.

## Prepare local Remotion

Here, `<harness-root>` or `$OPUS_PLUGIN_ROOT` means the verified installed plugin root,
not the marketplace source checkout. For a new installation or reinstall, use the
`installedPath` saved above. For an existing installation, use the actual loaded
`skills/<name>/SKILL.md` path: go up two directories from the containing skill directory
and assign that absolute path to `OPUS_PLUGIN_ROOT`. A host that exposes `skills/list`
can also return these installed skill paths; select the enabled skill belonging to
`opus-video-studio@opus-pro`.

If neither the successful installation output nor a current loaded skill path is
available, defer this check until the fresh task below loads the installed skills.
Do not reinstall a healthy plugin just to obtain its path. `plugin list` is not an
installed-cache lookup; never infer a cache version or run setup from its source path.
Full setup remains pending until the root and runtime checks succeed in that fresh task.

Before running a helper, verify that both plugin manifests name `opus-video-studio`,
and that `.mcp.json`, `scripts/setup-remotion.mjs`, and the three public skill files
exist inside the resolved root. Read its `docs/shared-rules.md` and
`docs/local-remotion.md`. The update helper
prefers the bundled desktop CLI; set `OPUS_VIDEO_STUDIO_CODEX_BIN` to the verified
executable from the preflight when it lives in a different application directory.

```text
node "$OPUS_PLUGIN_ROOT/scripts/setup-remotion.mjs"
```

This prepares the pinned runtime without creating a video project, launching a server, or spending
credits. It requires Node.js 22+ and npm; respect host installation permissions and report missing
prerequisites. Do not install a separate Remotion plugin or assume installation hooks ran. An older
plugin without the helper must be upgraded first; do not claim local setup succeeded.
When the user asks to create or preview a video, the same workflow reuses their existing project
or initializes an empty directory, connects the media, and opens the verified local Studio URL.

## Authenticate and verify

The public MCP server id is `opus-video-tools`. Inspect its registration:

```text
"<BUNDLED_CODEX>" mcp get opus-video-tools --json
```

The endpoint must be `https://labs.opus.pro/opus-video-tools/mcp`. OAuth resource metadata is
discovered with RFC 9728; do not add `oauth_resource` manually. WorkOS Dynamic Client Registration
creates the MCP client without a shared secret. Registration output is not an authenticated
health check. Do not conclude that the service works from `mcp get`, `mcp list`, `plugin list`,
a CLI health check, a successful marketplace refresh, or a UI badge alone.

When the tool is callable, use `opus_video_tools_whoami` to check the current account and
organization. Preserve a working login. For an unauthenticated connection, run:

```text
"<BUNDLED_CODEX>" mcp login opus-video-tools
```

Complete the browser sign-in and wait for both the localhost callback and CLI success. Then
repeat live verification. Do not claim OAuth is healthy merely because credentials are stored.
If tools are not callable in this task, verification remains pending until the fresh task below.

### Recover a rejected refresh token

If the actual MCP startup/refresh error is `invalid_grant`, record it as an authentication
failure. It means the authorization server rejected the grant; it does not establish whether
the reason was expiration, revocation, client mismatch, or refresh-token rotation. Do not label
it a plugin-cache problem or claim the only cause is a stale task.

For an authorized setup/repair, clear only this server's stale login and obtain a new one:

```text
"<BUNDLED_CODEX>" mcp logout opus-video-tools
"<BUNDLED_CODEX>" mcp login opus-video-tools
```

Run only one login recovery at a time. Do not launch competing browser/CLI login attempts or
parallel verification tasks. Preserve all other accounts and never print tokens, authorization
codes, cookies, or credential files. Plugin uninstall/reinstall is not a substitute for clearing
rejected OAuth credentials. Complete callback and CLI success, then use a fresh task to verify
the live tool surface and call `opus_video_tools_whoami` again.

If `invalid_grant` recurs after one completed login recovery, stop the automatic retry loop.
Report the exact failed step and sanitized error with time, host/CLI version, plugin version,
endpoint, and any available request ID. Authentication service/client logs are needed to find
why the new grant was rejected. Do not reset credentials repeatedly or generate paid media to
check access. Do not treat a timeout, 429, 5xx, feature-gate denial, or insufficient credits as
proof of an invalid refresh token; report and handle that specific failure.

### Live readiness gate

In the task that will do the work, discover the host-exposed tools (including supported deferred
tool discovery when available). Verify the live schemas for `create_project`, `import_assets`,
`generate_audio`, `transcribe_audio`, `generate_keyframes`, `generate_video_clips`, `get_status`,
`list_jobs`, `resolve_job`, and `opus_video_tools_whoami`, all from `opus-video-tools`. A list
copied from this guide is not runtime discovery. Then actually call `opus_video_tools_whoami`
and verify the intended account and organization. These are non-generating checks; do not create
a project, upload media, or call generation/transcription merely to test setup.

Keep package installation, tool discovery, authenticated call, and local Remotion setup as
separate results. Only report full setup success when all required checks pass. This verifies
current connectivity and schemas, not that every paid model job will succeed. Missing public
tools, disabled service gates, and other service errors remain setup failures even if login succeeds.
Never extend the allowlist, change gates, or silently switch to another MCP server to pass setup.

If live tools are missing, inspect the actual startup/discovery error before attributing it to a
stale task. Recover authentication errors as above; repair a proven package problem via clean
reinstall; otherwise use the fresh-task check. If that fresh task still has no tools, report the
unresolved registration/discovery error instead of repeatedly creating tasks. If a duplicate Opus
registration exists, identify its exact source before removal and follow the user's authorization.
Do not remove the intended plugin-provided registration or unrelated servers.

Run distribution checks when working from a source checkout:

```text
npm test
```

## Start a fresh task

Create a fresh Codex task after authentication when needed to load the installed plugin's skills
and MCP tools. Installation verification uses the existing local directory; it does not need an
isolated checkout, a new branch, or a Git commit. Preserve the complete user request and any
uncommitted template files or media in that directory.

The standalone setup prompt above explicitly requests the current local workspace. With that
user instruction, select the same saved project with `environment: { "type": "local" }` when
calling the host's task creation tool. A new task does not imply a new worktree. Do not choose
`worktree` just because the host reports `isGitRepository: true`.

Respect the host's task-creation rules and any explicit user choice. If an older setup prompt
omits the local-workspace instruction and the host requires worktrees by default, establish the
local-directory choice before dispatching task creation. Never knowingly queue a worktree that
cannot be created. Before any explicitly requested worktree, check that the repository has a
valid commit and that the selected starting ref resolves (`git rev-parse --verify HEAD` and the
selected ref). A directory can be a Git repository with no commits. Do not create an initial
commit, stage user files, or change repository configuration merely to finish plugin setup.

Wait for the new task to become usable and complete its read-only verification before reporting
success. A queued client task ID alone does not establish successful creation. If creation fails,
report that exact failure and use the authorized local-directory flow; avoid repeated failed
worktree attempts or duplicate verification tasks.

Paste this prompt into the new task:

```text
First confirm this is a local Codex desktop task. Otherwise stop and direct the user to that app; do not install into a remote sandbox. Continue the original user request in this existing local workspace after read-only Opus setup verification. Do not assume an earlier installation or OAuth success is proof of readiness. Verify that opus-video-studio@opus-pro exposes motion-ui, media-tools, and video-director. Discover the live opus-video-tools schemas for create_project, import_assets, generate_audio, transcribe_audio, generate_keyframes, generate_video_clips, get_status, list_jobs, resolve_job, and opus_video_tools_whoami. Actually call opus_video_tools_whoami and verify the intended account and organization. If startup reports invalid_grant, follow the guide's targeted logout/login recovery once; report failure if it recurs. Missing tools remain a failed check, not success. Follow the installed plugin's docs/local-remotion.md to verify local setup without launching a server or generating media. Return separate pass/fail results for package, tools, identity, and local setup. Report success only when package/version, all ten tool schemas, whoami and local runtime checks pass. The user can then describe a video or provide local media paths or accessible URLs. Preserve the user's original task, template URLs/checksums, files and media. For local motion use motion-ui; for direct audio/images/transcription use media-tools; for every new generated video clip use video-director.
```

Use the host's task creation and navigation tools when available. If a required tool fails, give the
user the prompt and report the exact failed step.

Report one outcome:

- Success: show the installed version, three loaded skills, ten discovered schemas,
  authenticated identity check, and local runtime result from the fresh task.
- Recovery: identify the failed check and the recovery task that is handling it.
- Blocked: identify the host, Git, or OAuth check that failed and its actual error.
