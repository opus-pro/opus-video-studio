# Style Auto Helper

This helper performs style intake: collecting, clarifying, extracting, and constraining style
inputs. It is not a global style preset library and does not replace the selected primary
skillpack's own style references.

## Trigger

Enable this helper when:

- the user mentions style, look, visual language, aesthetic, mood, tone, `@style`, a preset, or
  "like this style"
- the user uploads a screenshot, image, video, or webpage link that is clearly a style reference
- the user asks to reference the look, edit rhythm, material quality, or motion language of a video,
  page, or image
- style choice materially affects the output and the brief does not provide enough direction

If the user explicitly writes `+style`, enable this helper too.

## Workflow

1. First decide whether the style is already clear enough. If it is, compress it into a style brief
   without interrupting.
2. If style is a key choice but unclear, ask the user for one input route: choose a local preset
   owned by the current primary, describe the style in text, upload a screenshot/image, provide a
   video link, or provide a webpage link.
3. If the user names a preset, resolve it only inside the current primary skillpack's local style
   reference. For example, Seedance Director reads
   `skillpacks/seedance2-director/upstream/references/style-presets.md`.
4. If the user provides an image, screenshot, video, or webpage link, inspect visible content before
   planning and save usable references under `refs/` using names like `style_<slug>_*`.
5. Extract transferable style constraints: palette, lighting, lens/camera, composition, texture,
   typography, motion rhythm, transition grammar, and audio mood. Do not copy the reference's
   brand, person, logo, proprietary UI, or concrete subject matter unless `brand` or another
   identity helper handles it.
6. In the plan gate, disclose the style source, adopted/rejected references, style brief, affected
   assets/shots, and any copyright, identity, or feasibility risks.

## Boundaries

- Do not maintain global shared style presets here.
- Do not override the primary workflow's style schema, shot schema, or gate order.
- Do not ask about style merely because the user omitted it; ask only when style materially affects
  the result and cannot be reasonably inferred.
- Use `brand` when the user only needs brand accuracy. Use `human-realism` when the user only needs
  natural-looking people.
