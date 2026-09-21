# Local Remotion Studio

Use this workflow when the user wants a local video project, preview,
or further editing. It needs a local agent with filesystem, command, and browser access, Node.js
22+, and npm. A remote MCP connection alone cannot launch an editor on the user's computer.
Do not install another plugin, expose a local server publicly, or extend the public MCP allowlist.

## Reuse existing template projects first

For a downloaded template or existing Remotion project, skip the bundled runtime
setup below. Preserve its package manager, lockfile and dependencies, and follow
its own README. Only install dependencies when previewing, rendering or editing
requires them, not during a greeting or replacement-brief question.

## Initialize a new project

In this document, `<harness-root>` means the verified **installed plugin root**, not the
marketplace checkout. From `skills/<name>/SKILL.md`, it is two directories above the
skill directory. If the skill path is unavailable, use the installed-record lookup in
the host installation guide. Shell environment variables may be empty; do not guess a
version or run from the marketplace checkout. After resolving it, run:

```sh
node "<harness-root>/scripts/setup-remotion.mjs"
```

The helper installs or reuses the pinned runtime in the
plugin's persistent data directory (`PLUGIN_DATA` or `CLAUDE_PLUGIN_DATA`, otherwise
`~/.opus-video-tools`; `OPUS_VIDEO_TOOLS_DATA_DIR` overrides these locations). It keys the
runtime by dependency contents, so plugin updates with unchanged dependencies reuse it.
Runtime manifests live in `runtime/remotion/` to avoid a dependency installation in each
versioned plugin cache. It never installs globally or deletes old client-managed caches.
Older releases may retain their own dependencies; use the client's supported cache management.
Local projects keep their own dependencies so they remain usable after plugin removal.
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

The new project includes an editable composition, pinned dependencies, `tsconfig.json`, `public/`, a `.gitignore`
that excludes dependencies, generated output and local secrets, and Studio and
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
requires the medium-specific review artifact and approval described in `docs/shared-rules.md`; the complete
timed video script applies to managed video clip generation. Do not regenerate media to fix a local preview
error. Only claim an export after the requested local render succeeds.
The first export may download Remotion's rendering browser; respect the host's download permissions
and report network or platform-specific dependency failures separately from successful Studio setup.
