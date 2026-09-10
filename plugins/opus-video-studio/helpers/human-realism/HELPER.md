# Human Realism Auto Helper

Use this helper for realistic person image assets, person anchors, model sheets, first/last frames,
hands, skin, hair, realistic human motion, and natural human speech cues. It can be triggered
automatically by the router or explicitly with `+human-realism`.

It is a cross-cutting helper, not a primary workflow. For creator videos, product-review selfies,
talking-head clips, and smartphone selfie ads, keep the Seedance Director workflow; this helper
only improves realistic-person assets and shots.

## Load Order

1. Read `upstream/SKILL.md`.
2. Use this helper to map the upstream human-realism rules to the current primary workflow's AO MCP
   tools and gates.
3. When a person, product, or voice recurs across clips, reuse the approved references and record
   continuity constraints in the Seedance Director plan. Do not load an additional skillpack.

## Automatic Trigger

Enable this helper when the request or selected plan includes:

- realistic people, ordinary people, real avatars, or believable synthetic human identity
- person anchor images, model sheets, first frames, last frames, or product-hold frames
- faces, skin, hair, hands, body motion, natural speech, or room-recorded dialogue as central
  person-quality constraints
- creator voice personality, natural blinks, micro-expressions, restrained mouth movement, or
  non-announcer UGC delivery as central constraints
- requests for realistic, natural, authentic, less AI-looking, unretouched, phone-shot, or
  non-polished human output

Do not auto-enable it for clearly non-realistic styles such as LEGO, clay, anime, illustration,
abstract characters, distant background crowds, or an explicitly polished fashion/editorial look.
Do not use it to choose UGC beat structure, dialogue timing, audio route, or video-generation mode;
those decisions belong to Seedance Director.

## Auto Helper Mode

- Preserve the primary workflow's scene order, asset library, voice strategy, gate order, output
  schema, timeline placement, and tool mapping.
- Apply realism prompt blocks, negative constraints, anchor/model-sheet strategy, and preview
  checks only to person-related assets and shots.
- The plan gate must state why this helper was enabled and which anchors, first/last frames, or
  video shots it affects.
- If person anchors, model sheets, product-hold frames, first frames, or last frames are generated
  or selected, open an anchor/reference gate before paid video.

## AO Integration

- Inspect every uploaded person/product/scene reference before planning.
- Use Codex's own image/video viewing and reasoning to extract identity, wardrobe, lighting, camera,
  and product details from references.
- Use AO `generate_keyframes` for approved person anchors, model sheets, product-hold frames, first
  frames, and optional last frames.
- Open an anchor/reference gate before any paid video when new human anchors or product-hold frames
  were generated or selected.
- Add the upstream realism prompt block and negative constraints to the primary workflow's image or
  video prompts when they affect a realistic person.
- Do not select the video mode, clip count, audio route, or render path. The primary skillpack owns
  those choices.

## Plan Gate Additions

The plan gate must disclose:

- identity source: user reference, generated anchor, or synthetic original
- anchor/model-sheet stills to create or reuse
- first-frame and last-frame strategy for person fidelity when relevant
- which shots or assets receive human-realism constraints
- realism risks: beauty smoothing, facial drift, hand/product deformation, stiff body motion,
  overacted delivery, lip-sync mismatch, or synthetic testimonial concerns

## Output Mapping

- Upstream still prompts become AO `generate_keyframes` prompts.
- Upstream prompt blocks are merged into the selected primary workflow's still or video prompts.
- Preview notes must mention whether the result preserved unretouched skin texture, small hair
  details, natural hands, natural motion, micro-expressions/blinks, restrained mouth shape, and
  conversational voice when voice is in scope.
