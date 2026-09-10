# Opus Video Tools for Claude Code

This is an agent-facing installation protocol. Complete it for the user instead of only showing
commands.

## Preflight

Verify the Claude Code version and public repository reachability (GitHub membership is not required):

```text
claude --version
git ls-remote --heads https://github.com/opus-pro/opus-video-studio.git main
```

Do not install from a local checkout, cache directory, or another marketplace.

## Install

Inspect existing plugins with `claude plugin list`. Keep any working installation until its
replacement is verified, then install the standalone marketplace version:

```text
claude plugin marketplace add opus-pro/opus-video-studio
claude plugin install opus-video-studio@opus-pro
```

Verify that `opus-video-studio@opus-pro` is enabled at the latest marketplace version.
For an existing installation from this repository, use `claude plugin marketplace update opus-pro`
and `claude plugin update opus-video-studio@opus-pro`. Skip reinstalling an already current, enabled
plugin. If `opus-pro` points to a different repository, show its source and ask before replacing
it. After approval, remove only that marketplace source and rerun the add/install commands:

```text
claude plugin marketplace remove opus-pro
```

Preserve unrelated marketplaces, projects, and credentials. Do not delete cache directories
manually. The repository is `opus-pro/opus-video-studio`, while the installation ID remains
`opus-video-studio@opus-pro`. Refreshing a marketplace does not change its configured Git URL.

## Prepare local Remotion

For plugin version 0.10.1 or newer, resolve the actual installed plugin root from the enabled
plugin's skill path. Follow its `docs/local-remotion.md` and run:

```text
node "<harness-root>/scripts/setup-remotion.mjs"
```

Supported Claude Code versions install the plugin's pinned npm dependencies while caching it.
The helper checks the result and prepares a persistent runtime if that install was skipped,
incomplete, or timed out. Node.js 22+ and npm are required. Respect host installation permissions;
report missing prerequisites, and do not install a separate Remotion plugin. An older plugin
without the helper must be upgraded first; do not claim local setup succeeded.
Setup does not create a video project, launch a server, or spend credits. For video work, follow
the same workflow to reuse an existing project or initialize an empty directory and open Studio.

## Authenticate

The MCP server is shown as `opus-video-tools`. In a real terminal, open `/mcp`, select that
server, and complete the WorkOS/OpusClip sign-in. Claude Code 2.1.186 or newer can authenticate from
a shell:

```text
claude mcp login plugin:opus-video-studio:opus-video-tools
```

Use `--no-browser` when the host cannot open a browser. Wait for the CLI to report success.
An already authenticated connection can be verified with `opus_video_tools_whoami` without another login.
Verify that the connected account is the account the user intends to use and top up; resolve
its billing organization internally. Only remove a confirmed duplicate Opus registration with
the user's approval after the replacement is verified; preserve unrelated MCP servers.
WorkOS Dynamic Client Registration creates the MCP client without a shared client secret.

The endpoint is `https://labs.opus.pro/opus-video-tools/mcp`; OAuth resource metadata is discovered through
RFC 9728. Do not add `oauth_resource` manually or silently fall back to another server if Labs
is unavailable. Moving the repository does not change the MCP resource or grant service access.

## Verify in a fresh session

Start a new Claude Code session after authentication and run:

```text
claude mcp get opus-video-tools
```

Configuration alone is not enough. The fresh session must discover
`opus_video_tools_whoami`, `create_project`, `import_assets`, `generate_audio`, `transcribe_audio`,
`generate_keyframes`, `generate_video_clips`, `get_status`, `list_jobs`, and `resolve_job`.
Only these managed tools belong to the public workflow.

Seed the new session with:

```text
Opus Video Tools is installed from opus-video-studio@opus-pro and OAuth login completed. Verify the motion-ui, media-tools, and video-director skills and the public opus-video-tools MCP catalog, then call opus_video_tools_whoami. Follow the installed plugin's docs/local-remotion.md to verify local setup without launching a server or generating media. If verification succeeds, say: "Opus Video Tools is connected. Tell me what video you want to make, or drag in your media." For local motion work, use motion-ui in my chosen framework. When using Remotion, create or reuse a project and open its verified Studio preview unless I request assets only.
```

Report one outcome:

- Success: `Started a new Opus Video Tools session after verifying the plugin, OAuth login, and local Remotion setup.`
- Recovery: `Setup is not complete; started a recovery session.` Include the failed step.
- Blocked: `Setup is blocked.` Include the Git, host, or OAuth gate that failed.
