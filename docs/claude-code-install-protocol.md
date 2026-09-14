# Opus Video Tools for Claude

Install video, image, audio and local motion tools for the user's coding agent.
Setup is free. Media generation uses Opus credits. Complete the checks below and
report their observed results; installation alone is not a connected MCP session.

The installation guide is public. Opening the main Opus media workspace may
require website sign-in first. Connecting the MCP is a separate authorization
step below; being signed in on the website does not verify the agent connection.

## First identify your host

Before running any commands, identify the current application from the session
context. Only a **local Claude Code terminal session** follows steps 1–5 below.
Shell access, a `claude` executable, or loaded plugin skills alone do not prove
that the current conversation is Claude Code.

In **Claude desktop chat, claude.ai, or Cowork**, stop the plugin-install workflow
and use the custom connector instructions below. Do not install the CLI plugin
into a sandbox or tell the user to type `/mcp` there. If the host is unclear, ask
which interface they are using before installing anything. Claude Code running
on a remote machine does not install local tools on the user's computer.

For a standalone setup conversation, paste:

```text
First identify your current host. Only a local Claude Code terminal session should install the plugin and use /mcp. In Claude desktop chat, Cowork, or claude.ai, stop the plugin workflow and follow the custom connector section of https://labs.opus.pro/opus-video-tools/claude; do not run install commands or suggest /mcp. Shell access alone does not establish that you are Claude Code. If the host is unclear, ask before installing. In the supported local host, install Opus Video Tools using https://labs.opus.pro/opus-video-tools/claude. Complete Opus sign-in, verify the public tools, and start a new Claude Code session directly in the current local workspace with the plugin ready. Use the existing directory; do not create a Git worktree or branch. Do not generate paid media during setup.
```

## Custom connector for Claude chat and Cowork

This is a separate connection path. Local Claude Code has been verified with
the production server. The chat/Cowork path still needs an end-to-end acceptance
record; do not present it as verified just because OAuth metadata is reachable.

1. Open Claude's **Customize → Connectors → Add custom connector**. Depending
   on your interface, Connectors may be under Settings. On Team or Enterprise,
   ask an organization owner to add the connector if this action is unavailable;
   each user then connects their own Opus account. Do not create a duplicate if
   the exact production endpoint is already configured.
2. Name it **Opus Video Tools** and use this remote MCP URL:
   `https://labs.opus.pro/opus-video-tools/mcp`. Use OAuth discovery; no shared
   client secret or manually supplied token is needed.
3. Choose **Connect**, complete Opus sign-in with the intended account and
   organization, then enable the connector in the actual chat or Cowork session
   that will use it. The separate OpusClip connector is a different product.
4. In that session, paste the verification prompt below. A connection badge or
   successful login alone is insufficient. Record the client, date, discovered
   schemas, successful identity check and any sanitized error separately.

```text
Verify the Opus Video Tools remote connector in this Claude chat or Cowork session. Discover its live tool schemas, including deferred tools if supported, and actually call opus_video_tools_whoami. Report the discovered names and count, and whether the intended account and organization were verified; do not expose credentials. The expected public catalog has ten tools. Do not install a CLI plugin, suggest /mcp, create projects, upload assets, transcribe audio or generate paid media during this check. If the connector is absent, ask me to enable it through Customize or Settings → Connectors; if I cannot add it in a team, explain that an organization owner must add it first. Mark missing authentication or unavailable tools as blocked, not passed. Report only checks you actually performed.
```

The connector exposes remote generation, transcription, asset and job tools.
It does **not** automatically install `video-director`, `media-tools`, `motion-ui`
or local Remotion. Do not claim access to local files, a local Studio preview,
or editable local compositions unless those capabilities were separately set up.
Use media URLs or uploads actually supported by the connected tools and host.

Before paid work, show the exact prompt or timed video script, model, inputs,
settings and planned output for review. Explain that Opus credits are consumed;
give a supported estimate when available, and state that reserved credits are an
estimate, not a maximum charge. Obtain authorization for that scope and preserve
existing authorization. Use stable `requestKey` values for retries, check jobs
after an ambiguous submission, and stop a watch window after 45 seconds with
the pending IDs. Do not resubmit an unknown outcome or claim an unfinished job
succeeded. Report authentication, account-access, credit and provider errors
separately without bypassing them.

A regular Opus account must also have access to this product. A successful
employee-account test does not establish availability for all users. If access
is denied after sign-in, report the denial; reinstalling cannot grant access.

See [Claude's custom connector instructions](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

## 1. Check prerequisites and install

Use a local Claude Code terminal with Node.js 22+ and npm. Check:

```sh
claude --version
git ls-remote --heads https://github.com/opus-pro/opus-video-studio.git main
claude plugin list
```

Install the public distribution (no company GitHub membership is needed):

```sh
claude plugin marketplace add opus-pro/opus-video-studio
claude plugin install opus-video-studio@opus-pro
claude plugin details opus-video-studio@opus-pro
```

Verify the plugin is enabled, its version matches the marketplace, and details
lists the three skills `motion-ui`, `media-tools`, `video-director` and one MCP
server, `opus-video-tools`. If an older client lacks `plugin details`, inspect
the installed plugin through the interactive `/plugin` slash command instead.

For an existing installation, use `claude plugin marketplace update opus-pro`
then `claude plugin update opus-video-studio@opus-pro`. Skip reinstalling an
already current, enabled plugin. If the configured `opus-pro` marketplace points
to a different repository, show its source and resolve that conflict with the
user before replacing it. Preserve unrelated plugins, credentials and projects.
Do not manually delete cache directories or add a duplicate standalone MCP server.

## 2. Resolve the installed plugin directory

In all Opus instructions, **plugin root** (also written `<harness-root>`) means
the installed directory containing `.mcp.json`, both plugin manifests, `skills/`
and `scripts/`. It is not the marketplace Git checkout.

Prefer the actual path of a loaded `skills/<name>/SKILL.md`: from its containing
skill directory, go up two directories. Versioned cache directories can end in
a version number. Do not guess a version or search for a literal path suffix.
`AO_HARNESS_ROOT` and `CLAUDE_PLUGIN_ROOT` need not be shell environment variables.

Before skills are loaded, resolve the path from Claude's installation metadata.
This command reads only plugin metadata, not credential stores:

```sh
OPUS_PLUGIN_ROOT="$(node --input-type=module - <<'NODE'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const config = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const metadata = JSON.parse(fs.readFileSync(path.join(config, 'plugins/installed_plugins.json'), 'utf8'));
const entries = metadata.plugins?.['opus-video-studio@opus-pro'] || [];
const local = entries.filter(entry => entry.projectPath && path.resolve(entry.projectPath) === process.cwd());
const candidates = local.length ? local : entries.filter(entry => entry.scope === 'user');
const roots = [...new Set(candidates.map(entry => entry.installPath).filter(Boolean))];
if (roots.length !== 1) throw new Error('No unique installed plugin path. Open /plugin in Claude Code and inspect the enabled installation; do not guess.');
const root = fs.realpathSync(roots[0]);
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin/plugin.json'), 'utf8'));
if (manifest.name !== 'opus-video-studio' || !fs.existsSync(path.join(root, 'scripts/setup-remotion.mjs'))) throw new Error('Incomplete installed plugin; update it before setup.');
console.log(root);
NODE
)"
```

If this lookup fails, stop that step and inspect the enabled installation in
Claude Code. Do not run helpers from a marketplace checkout as a fallback:
that can install a second large runtime while the versioned cache is already ready.

## 3. Verify local Remotion

Read `docs/shared-rules.md` and `docs/local-remotion.md` inside the verified root.
The shared rules are host-neutral and each skill loads them explicitly. Claude
also receives a pointer through the plugin's SessionStart hook; plugin-root AGENTS.md
or CLAUDE.md alone is not an automatic Claude context mechanism.

```sh
node "$OPUS_PLUGIN_ROOT/scripts/setup-remotion.mjs"
```

Expect JSON with `status: "ready"`, the actual runtime directory and Remotion
version. The helper prepares or reuses the pinned runtime. New releases share
dependencies across plugin versions by their content fingerprint; older releases
may already have dependencies in the installed cache. Do not remove client-managed
caches manually. Report missing Node/npm or network access without silently
installing system software or another plugin.

Setup does not create a project, start Studio, upload assets, or generate media.
For subsequent video work, follow `docs/local-remotion.md` to reuse an existing
project or initialize an empty directory. New projects include `.gitignore` so
dependencies, renders and local secrets are not committed.

## 4. Sign in inside a Claude Code session

Open or restart an **interactive Claude Code conversation** in the existing local
workspace. At Claude's prompt, type the **slash command** below and press Enter:

```text
/mcp
```

This is a Claude Code slash command, not a website URL, filesystem path, or shell
command. Select the plugin's `opus-video-tools` server, choose its authentication
action, and finish Opus sign-in in the browser. Return to the same session and
check its connection status. Use the intended Opus account and organization.

Do not use `claude mcp login`, `claude mcp get`, or `claude mcp list` as the plugin
installation or login gate. Their visibility of plugin-provided servers differs
by client/session configuration. A shell message `No MCP servers configured` can
occur while this plugin is correctly installed: check `plugin details` and the
interactive `/mcp` panel instead. Do not respond by creating a duplicate server.

In a headless environment that cannot complete browser authorization, report
OAuth as pending and provide this exact interactive step. Do not claim success.
If the current connection already passes whoami, another login is unnecessary.

The MCP endpoint is `https://labs.opus.pro/opus-video-tools/mcp`. OAuth resource
metadata is discovered through RFC 9728 and dynamic client registration; no shared
client secret or manually configured `oauth_resource` is needed. If sign-in fails,
report the actual sanitized error and step. Do not loop through reinstall/login
or replace unrelated credentials.

## 5. Verify actual readiness

After installing/updating, use a fresh Claude Code session in the same directory.
Paste this prompt into that conversation:

```text
First confirm this is a local Claude Code terminal session. In Claude desktop chat, Cowork, or claude.ai, stop this plugin check and use the custom connector section of https://labs.opus.pro/opus-video-tools/claude; do not suggest /mcp. Shell access alone does not identify the host. In local Claude Code, verify the installed opus-video-studio@opus-pro plugin. Load its motion-ui, media-tools and video-director skills and read docs/shared-rules.md from the actual installed root. Discover the public opus-video-tools catalog and call opus_video_tools_whoami. Verify local Remotion setup from the installed root without starting Studio. Report separate pass/fail/blocked results for package/version, skills, the ten tool schemas, authenticated identity and local runtime. Do not create projects, upload assets, generate media or transcribe audio during setup. Preserve the original user request and existing workspace. If authentication is pending, mark it blocked and explain how to type /mcp at the interactive Claude Code prompt and finish sign-in.
```

The public catalog contains exactly: `opus_video_tools_whoami`, `create_project`,
`import_assets`, `generate_audio`, `transcribe_audio`, `generate_keyframes`,
`generate_video_clips`, `get_status`, `list_jobs`, and `resolve_job`.

Success requires observable evidence: enabled package/version, three available
skills, ten discoverable schemas, a successful whoami with the intended identity,
and local runtime `ready`. Report missing checks separately. A successful install,
configuration record, or connection badge does not substitute for whoami.

After setup, the user can describe the media they want or supply a local file path
or accessible media URL. Attaching or dragging files is optional and only applies
to clients that support it. Final media credits depend on the service's actual
cost; a reservation is an estimate, not a maximum charge.
