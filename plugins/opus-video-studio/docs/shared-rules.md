# Opus Video Tools Agent

Use Opus Video Tools in Codex or Claude Code. Use the public skills to select the requested
workflow, and the managed `opus-video-tools` MCP server for asset import, video and audio
generation, transcription, and job status.

## Core Contract

- Use `skills/motion-ui/SKILL.md` for local UI animation, motion graphics, and code-driven product videos.
- Use `skills/media-tools/SKILL.md` for standalone audio, images/keyframes, transcription, asset
  import, and existing-job status/recovery.
- Use `skills/video-director/SKILL.md` for every new AI video generation request, including a
  direct call to a named video model, and for video prompt planning or optimization.
- Video Director handles all supported video models. Load the bundled Seedance skillpack only
  when the selected model is Seedance; never apply its syntax or limits to other models.
  Local code animation and non-video tools do not need Director's creative workflow.
- Upstream skillpacks own production behavior. Root files own routing, adaptation, approval discipline, and local contracts.
- The live MCP `tools/list` response is authoritative; this file records invariants, not parameter schemas.
- Do not call provider scripts, private keys, private endpoints, or locally fabricated tool results.

## Plugin Root

The plugin root contains .codex-plugin/plugin.json or .claude-plugin/plugin.json,
plus .mcp.json, skills/ and scripts/.
From an installed skills/<name>/SKILL.md, go up two directories from its containing
skill directory. Validate the manifest name is opus-video-studio. Do not guess a
cache version or use the marketplace checkout as the installed root. Host-provided
roots such as CLAUDE_PLUGIN_ROOT must pass the same validation and may not be
exported as shell environment variables.

## Setup only when needed

A greeting, workflow choice, library lookup or template download does not need
an updater, account check or local runtime installation. Route welcomes through
skills/get-started/SKILL.md and selected templates through docs/template-source.md.

Use the loaded plugin. Check for updates only for an explicit install/update request
or a diagnosed incompatibility; scripts/ensure-latest-plugin.mjs is a repair helper,
not a per-task preflight. This updater is Codex-specific; never run it from Claude
Code. If an update changes loaded skills, use the host's supported reload action
(Continue in Codex when available). Request a new task only if the host cannot reload, preserving
the original brief and source paths. Never create a task without user authorization.

## Connection Recovery

- Installation/enabled state, stored OAuth configuration, UI connection badges, and marketplace
  refresh success are not live readiness checks. Discover the host-exposed `opus-video-tools`
  schemas and actually call `opus_video_tools_whoami` before claiming managed tools are connected.
- If MCP startup or token refresh reports `invalid_grant`, treat it as rejected authentication,
  not proof of corrupt plugin files or a stale task. In an authorized Codex repair, use the bundled
  CLI's `mcp logout opus-video-tools` followed by `mcp login opus-video-tools` once, sequentially.
  Wait for browser callback and CLI success, then recheck tools and whoami in the same conversation.
  Preserve unrelated credentials; never read or print token stores. Do not run parallel logins.
- If a completed login recovery still returns `invalid_grant`, stop automatic retries and report
  the sanitized error and failed step. Do not infer the underlying token lifecycle cause without
  evidence. Timeouts, gate denials, and insufficient credits need their own diagnosis.
- For an authorized Codex package update/repair, follow the current installation guide at
  `https://labs.opus.pro/opus-video-tools/codex`: verify the refreshed public source, uninstall only
  `opus-video-studio@opus-pro` through `plugin remove`, then install it again with `plugin add`.
  The supported uninstaller cleans its local cache. Do not manually wipe shared plugin/config
  directories. Equal version strings do not prove identical or complete package contents.
- Claude Code uses its own plugin update and interactive /mcp flow, documented in
  the repository's docs/claude-code-install-protocol.md. Do not run Codex CLI commands
  in Claude Code or assume remote Claude chat has local plugin capabilities.
- After installation, use the host reload/Continue action and recheck the required tools.
  If this host cannot reload, explain the specific limitation before suggesting a new task.
  Do not loop through reinstalls or use paid generation as a setup probe.

## Public Surface

- Before managed media work, use `create_project` to bind an explicit backend generation/storage target.
  Local animation, code-generated video, preview, and rendering do not require authentication,
  a backend project, or paid generation. Existing-job status and recovery use the original project.
- Verify `opus_video_tools_whoami` before project creation. Keep the returned organization, project ID, request
  keys, job IDs, and durable asset references in the task's project context. After switching
  organizations, do not reuse the previous organization's project or assets.
- Pass `projectId` and `requestKey` when exposed by the live schema. A request key identifies one
  exact operation, not a whole conversation: preserve it across identical retries and use a new
  UUID for new work. Separate projects and separate batch items are separate generation charges.
- Public workflows may use only `create_project`, `import_assets`, `generate_audio`,
  `transcribe_audio`, `generate_keyframes`, `generate_video_clips`, `get_status`, `list_jobs`, and
  `resolve_job`.
- The allowlist above and `opus_video_tools_whoami` are the entire managed tool surface. Do not
  discover or use additional tools from another server to extend it.
- Return generated assets in chat. Claim local preview or export only after verifying it.

## Local Remotion Studio

- When a requested preview, render or edit needs Remotion, follow `docs/local-remotion.md`.
  Reuse a downloaded project's own dependencies; initialize the pinned runtime only for a new project.
  Do not install a runtime during plugin setup, a greeting or the replacement-brief question.
- For local Remotion projects or assembly of generated video clips, offer a working Remotion
  Studio preview without requiring a gallery template. Reuse an existing project; otherwise initialize an empty project directory.
  Honor requests for assets-only output or no preview, and do not launch a server during setup alone.
- Keep editable source and downloaded media in the user's project, not the plugin cache. Opening
  Studio is a local process/browser action, independent of the managed generation tools.
- A local preview failure must not trigger another paid generation. Preserve completed media.

## Tool And Approval Rules

- Construct tool arguments from the current schema. If a field is unclear, rediscover the tool surface before calling it.
- Before requesting approval for managed video clip generation, finish and show the user the complete
  production script in conversation. The script is the review artifact, not an internal draft or a
  short creative summary. It must cover the full requested duration and show, for every timed beat
  or shot, the picture/action plus exact voiceover, dialogue, on-screen text, music, and sound cues
  (write `None` where a layer is intentionally absent). Also show clip boundaries, aspect ratio,
  reference usage, and the number of paid generation requests. Only after that user-visible script
  may the response ask for approval.
- A concept paragraph, opening/middle/ending summary, prompt synopsis, or list of visual motifs does
  not satisfy the script gate. Do not expose hidden chain-of-thought; expose the actual production
  artifact the user is being asked to approve.
- For that video script, if the user changes duration, script, shot order, narration, references,
  aspect ratio, output labels, or generation semantics, revise and show the complete affected script before requesting a
  new approval. A field-level summary alone is insufficient for script-affecting changes.
- For standalone media calls, show the planned output being approved: exact text and voice for
  speech, a brief and duration for music/SFX, or a prompt and references for images. Do not require
  a video storyboard, camera directions, or absent visual layers. For transcription and import,
  identify the input and intended operation. Apply paid approval when the operation is chargeable.
- Paid model calls, external publishing, sensitive brand/human generation, and user-asset uploads require user authorization. Use the host's native approval surface when available; otherwise show the exact request and obtain explicit approval in conversation. Never invent an approval tool, token, or payload hash that the host does not expose.
- Use the Codex host approval surface for paid calls whenever it is available; do not replace it with a text-only approval ritual.
- Review and approval must identify the actual canonical request: prompt, duration, aspect, media references, output labels, and cost class.
- After approval, execute only the reviewed request; the native approval does not cover nearby variants.
- a changed paid call needs a new bound approval. Any prompt, duration, reference, voice, output label, or edit-semantic change is a new bound approval.
- Explain that reserved credits are an estimate, not a price cap. Final credits can increase when actual Egress cost is known. Do not invent an exact quote or submit if the user requires a hard budget the live tools cannot enforce.
- The approval surface must make purpose, risk, cost/irreversibility, and user choices visible.

## Media And Storage

- Use `import_assets` for project asset registration. It accepts inputs according to the live
  schema; complete any returned upload/finalization steps before using the durable asset.
- `generate_video_clips` stages Seedance reference assets before provider submission. Use the
  durable managed project asset in the request. This transport does not prove licensing or
  bypass provider copyright or safety policy.
- After generation or upload, record the durable managed asset reference and reuse it in previews
  and retries. Completed jobs with downloadable results are deliverable immediately. Download
  selected results into the local project's `public/` directory for Remotion playback.
- Preserve the natural-language voice description and bind script, speaker, voice, and timing to traceable assets.
- Delivered previews must include auditable media references, not just temporary provider URLs.
- Generation tools are async submissions. After any public `generate_audio`, `transcribe_audio`,
  `generate_keyframes`, or `generate_video_clips` call returns job ids, call `get_status` with
  `watch: true`. Keep each watch window at or below 45 seconds (`timeoutSeconds` of 45 or
  less), or use plain repeated `get_status` polling; longer watch calls can be killed by MCP
  client timeouts before they return. If it returns `timedOut: true`, wait the returned
  `nextPollAfterSeconds` when practical and call `get_status` again. Continue without asking
  the user until every submitted job is `completed`, `failed`, or `submission_unknown`; never
  retry the paid generation just because a watcher window elapsed.
- If a job remains `submission_unknown` after `get_status`, do not close or retry it automatically.
  Explain that the original provider request may still have run and billed. Call `resolve_job` with
  `acknowledgeDuplicateRisk: true` only after the user explicitly accepts that duplicate-spend risk.

## Public Default Workflow

The sequence below applies to managed video clip generation. For local animation or code-generated
video, use `skills/motion-ui/SKILL.md` in the user's chosen framework; follow
`docs/local-remotion.md` when using Remotion.
For standalone media or job recovery, follow only the relevant tool steps in
`skills/media-tools/SKILL.md`, using the shared identity, approval, storage, and retry rules above. Do not add video generation or
a Remotion project to a standalone media request.

1. Parse goal, audience, output shape, duration, aspect, language, assets, and delivery target.
2. Follow `skills/video-director/SKILL.md`; load model-specific guidance only for the selected model.
3. For managed generation, verify identity and create an explicit backend project target.
4. Import and inspect only the reference assets needed by the brief.
5. For low-risk gaps, use Default ordinary; ask one concise setup question, and use separate questions / human gates only for paid calls, human identity, brand consistency, external publishing, or irreversible overwrites.
6. Generate and show the complete timed production script; use it as the user-visible review
   artifact and resolve requested revisions before asking for paid approval.
7. Request approval for the exact canonical paid payload only after the visible script gate passes.
8. Execute the approved video and requested voiceover/BGM generation, then poll job status.
9. Connect completed media to the local Remotion project and open its verified preview unless the
   user requested assets-only output. Return references and report only what actually completed.

## Keep Out Of AGENTS

- Keep detailed tool parameters, provider prompt syntax, model style tables, phase internals, and long failure cases in the relevant skillpack, helper, or docs.
- Keep this file short, stable, and always-on; it stores only rules every AO task must obey.
