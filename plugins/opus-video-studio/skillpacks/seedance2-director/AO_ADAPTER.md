# Seedance 2.0 Director AO Adapter

Use this skillpack for `generate_video_clips` work or explicit Seedance prompt planning.
Do not load it for local UI animation, code-generated video, or standalone media tool calls.
For prompt-only planning, skip backend setup and generation calls below.

## Load Order

1. Read `upstream/SKILL.md`.
2. Follow its instruction to read the relevant files under `upstream/references/`. Read
   `upstream/references/style-presets.md` only when Seedance Director itself needs to choose or
   apply a preset style.
3. Apply this adapter when turning the upstream prompt output into AO MCP calls.

## AO Integration

- Use the upstream skill for creative method, mode detection, genre detection, camera language,
  prompt format, and examples.
- Use the authenticated organization's backend project as the generation/storage target.
  Follow the public entrypoint's explicit project and retry-key contract. Local
  inputs may return `awaiting_upload`: PUT the original bytes to the returned signed URL, then
  finalize with `import_assets` using the same project and returned `assetId`. Do not generate
  from pending uploads or reuse references from a different organization.
- Use the public Opus MCP tools for project setup, asset import, video/audio generation,
  transcription, status polling, and recovery: `create_project`, `import_assets`, `generate_audio`,
  `transcribe_audio`, `generate_keyframes`, `generate_video_clips`, `get_status`, `list_jobs`, and
  `resolve_job`.
- Use `generate_audio` with `audioType: "speech"` for voiceover or a Seed Audio premix and with
  `audioType: "music"` for instrumental BGM through Lyria. Do not claim separate assets were mixed.
- For local assembly, preview, and requested export, follow `docs/local-remotion.md`. These are
  local Remotion operations, not managed generation calls. Do not publish results without approval.
- If the generation route is unclear, describe the creative intent and reference roles in the
  review payload; the v2 server chooses the valid provider route behind `generate_video_clips`.
- Before any paid AO generation, write the complete Seedance production script and show it to the
  user. Use a readable timed table or equivalent shot-by-shot layout with at least: time range,
  picture/action, camera/motion, voiceover/dialogue, on-screen text, music/SFX, and reference role.
  The rows must cover the full requested runtime; for multi-clip work, mark every clip boundary and
  make continuity between clips explicit. Write `None` for intentionally absent dialogue, text, or
  music so silence is reviewable rather than ambiguous.
- Open the plan-review/paid-approval gate only after that complete script is visible in conversation.
  The approval ask may follow the script, but cannot replace or precede it. The exact paste-ready
  Seedance prompt may remain an implementation detail only when it faithfully implements the shown
  script; the visible script still needs enough detail for the user to judge every generated beat.
- If duration or another script-affecting field changes, regenerate and show the complete revised
  timed script before asking for a new approval. Never respond with only an updated duration, clip
  count, or opening/middle/ending summary.
- If an upstream format has multiple `SHOT` blocks, treat them as prompt structure inside one
  planned clip unless the user or approved plan explicitly asks for multiple paid clips.
- Resolve the actual Seedance model version before calculating clip count. Use the minimum clip
  count that model supports: Seedance 2.5 supports one clip up to and including 30 seconds;
  Seedance 2.0 supports one clip up to and including 15 seconds. Therefore a 30-second Seedance 2.5
  request is one paid clip, while the same duration on Seedance 2.0 requires two clips. Do not apply
  the Seedance 2.0 15-second ceiling to Seedance 2.5.
- For durations above the selected model's single-clip limit, use the smallest required number of
  clips. Split below that limit only when the user explicitly requests separate clips or the
  approved creative/technical plan explains why. Show the selected model/version, per-clip
  duration, total clip count, and resulting paid request count in the visible script gate.
- For reference-image work, inspect uploads first and track every input as used-HOW or unused-WHY.
- If generated or selected anchors are needed, show them in a gate before paid video.
- Seedance Director's preset styles belong to this skillpack. Do not load a separate
  `cinematic-style-presets` helper. If the user names a style such as `premium-minimal` or
  `modern-saas` inside the Seedance Director workflow, read `upstream/references/style-presets.md`
  and merge the selected preset's full prompt layer into the Seedance prompt.
- Real brand identity, style intake, and realistic-human constraints are triggered automatically or
  explicitly through `helpers/brand/HELPER.md`, `helpers/style/HELPER.md`, and
  `helpers/human-realism/HELPER.md`. Those helpers only enrich affected assets/shots and do not
  change Seedance Director's generation route.

## Output Mapping

- Upstream "paste-ready prompt" becomes the `prompt` for the selected AO video tool.
- No reference media or keyframe maps to `generate_video_clips` with `workflow: "reference2video"`
  and no `referenceAssets`.
- A literal first frame, optionally with a literal last frame, maps to `generate_video_clips` with
  `workflow: "first_last_frame"`.
- `@image1` / `@image2` references and inspected media paths map to `generate_video_clips` with
  `workflow: "reference2video"`. Do not combine these loose references with `firstFrame` or
  `lastFrame`; literal frame constraints use the separate `first_last_frame` workflow.
- Upstream Director's Note belongs in the plan artifact or preview notes, not in the model prompt
  unless it is explicitly part of the intended generated video.
