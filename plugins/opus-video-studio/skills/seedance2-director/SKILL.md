---
name: seedance2-director
description: Use Opus Video Tools for managed media generation and job recovery; apply Seedance Director only to generated video clips and Seedance prompt planning. Use motion-ui for local UI animation and code-driven product videos.
---

# Seedance 2.0 Director

This is the managed-media entrypoint in Opus Video Tools.

For local UI animation or code-generated product video, follow `skills/motion-ui/SKILL.md`
relative to the harness root, without loading the Director skillpack. In mixed tasks, use it
for the local motion portion. For plugin initialization or local Remotion creation, setup,
preview, rendering, or further editing, follow
`docs/local-remotion.md` relative to the harness root. Run its setup helper on first local use;
reuse existing projects or create a minimal project in an empty directory. Local creation, setup,
preview, and rendering alone do not require authentication, a backend project, or paid generation.
For those requests, skip the generation steps below. Honor assets-only requests; do not install another plugin or skill pack.

For standalone audio, images/keyframes, transcription, import, or job recovery, skip steps 2-3
and use only the requested tools in steps 4-6. Do not add video generation, a storyboard, or a
Remotion project. In mixed tasks, apply Director only to the generated video clips. For explicit
Seedance prompt planning without generation, use steps 1-3 without backend setup or paid calls.

1. Resolve the harness root from `AO_HARNESS_ROOT` when it is set and valid; otherwise infer it
   from this shortcut's `<harness-root>/skills/<id>/SKILL.md` path. Use the current working
   directory only when it contains `skillpacks/seedance2-director`.
2. Only for managed video clip generation or explicit Seedance prompt planning, load
   `skillpacks/seedance2-director/skillpack.json`,
   `skillpacks/seedance2-director/AO_ADAPTER.md`, and
   `skillpacks/seedance2-director/upstream/SKILL.md`.
3. Within that Director workflow, when the user names or requests a preset style, read
   `skillpacks/seedance2-director/upstream/references/style-presets.md`.
4. Use only the tools visible from the `opus-video-tools` MCP server. Start a new backend target
   with `create_project` for generation/storage context.
   First verify the connection with `opus_video_tools_whoami` and confirm its organization with the user if
   it is not the intended one. If authentication is missing, complete the host's MCP sign-in.
   Save the returned `projectId` and pass it explicitly wherever the live schema accepts it.
   Do not infer a project from the last browser tab or from another task. For status/recovery,
   verify identity and use the original job/project context instead of creating a new project.
5. Use only the tools needed by the request: `import_assets` for reference media,
   `generate_keyframes` for requested images or needed anchor frames,
   `generate_video_clips` for the approved Seedance request, and `generate_audio` for
   requested speech, music, or sound effects. Use `transcribe_audio` when supplied audio needs timing or text.
   Poll `get_status` until every submitted job reaches a terminal state; use `list_jobs` and
   `resolve_job` only for recovery.
6. Before a paid call, show the review artifact for the requested medium and request approval
   for the exact payload as required by `AGENTS.md`. The complete timed video script and adapter
   requirements apply to managed video clip generation; standalone media uses its own review artifact.
   When the live schema exposes `requestKey`, generate a UUID for project creation and each
   generation/transcription operation. Save it with the exact arguments before submitting; reuse
   it only for an identical retry. Use unique shot/clip IDs within each batch. A changed request
   needs a new key and, for paid work, new approval. Never resubmit simply because polling timed out.
7. For requested local assembly or generated video clip previews, follow `docs/local-remotion.md`
   to connect completed media to a local composition and open its verified Remotion Studio preview, unless the user requested assets-only output. Return generated
   references and report only verified results. A local preview error is not a reason to regenerate.
