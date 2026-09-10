# Local Remotion Studio

Use this workflow during plugin setup and when the user wants a local video project, preview,
or further editing. It needs a local agent with filesystem, command, and browser access, Node.js
22+, and npm. A remote MCP connection alone cannot launch an editor on the user's computer.
Do not install another plugin, expose a local server publicly, or extend the public MCP allowlist.

## Initialize once

Resolve the installed plugin root from the current skill path, not a guessed cache version. Run:

```sh
node "<harness-root>/scripts/setup-remotion.mjs"
```

The helper reuses complete plugin-local dependencies, or installs the pinned runtime in the
plugin's persistent data directory (`PLUGIN_DATA` / `CLAUDE_PLUGIN_DATA`, otherwise
`~/.opus-video-tools`). It never installs globally. Claude Code versions that support marketplace
Node.js dependencies can preinstall these packages; older hosts, Codex, partial installs, and
timeouts use the same helper. Installation is not a promise that a lifecycle hook already ran.
Respect host installation permissions. If Node.js/npm or network access is missing, report that
specific prerequisite rather than repeatedly retrying or silently installing a system runtime.

## Open a project

- Existing Remotion project or gallery template: preserve its source, package manager, lockfile,
  and Remotion version. Install its declared dependencies and use its existing Studio script.
  Do not run `init` inside it or replace its dependencies with the bundled versions.
- No project: choose an empty directory in the user's workspace and run:

```sh
node "<harness-root>/scripts/setup-remotion.mjs" init "<project-directory>"
```

The new project includes an editable composition, pinned dependencies, `public/`, and Studio and
render scripts. If installation fails after files are created, fix the reported prerequisite and
run `setup-remotion.mjs install "<project-directory>"`; do not delete or overwrite the project.
Projects are independent of the plugin cache and remain usable after plugin removal.

In the new project, start `npm run studio -- --no-open` in a host-managed terminal. Use the actual
localhost URL printed by Remotion (it selects another port if needed). Open that URL with the
host's browser tool, verify the composition renders, and keep the server available for editing.
Do not stop at an installation command or claim a preview opened without verifying it. When a
host cannot open the browser, return the working URL and state that limitation.
If an interrupted installation leaves `.remotion-install-lock`, confirm that no setup process is
still running before removing that lock and retrying. Never run two installs in the same directory.

## Use generated media

Download the user's chosen, completed MCP results into the project's `public/` directory using
the returned download URLs. Keep durable project/job/asset IDs in the project context, never
OAuth credentials; signed URLs expire. Refresh downloads through `get_status`, not a new paid
generation. Do not upload local project files unless the user requested it.

Set `videoSrc` / `audioSrc` to public-relative file paths in `src/index.tsx`, match the composition's
duration, dimensions, and timing to the actual media, and edit the composition for additional
shots, titles, or music. Verify video playback and audio. A generated MP4 remains a flattened clip;
its embedded text or objects are not editable layers. Preserve local source for new editable layers.

Local setup, preview, and rendering need no MCP generation or credits. Paid generation still
requires the medium-specific review artifact and approval described in `AGENTS.md`; the complete
timed video script applies to managed video clip generation. Do not regenerate media to fix a local preview
error. Only claim an export after the requested local render succeeds.
The first export may download Remotion's rendering browser; respect the host's download permissions
and report network or platform-specific dependency failures separately from successful Studio setup.
