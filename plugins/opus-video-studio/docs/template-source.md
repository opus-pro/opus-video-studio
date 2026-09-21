# Edit a selected template from source

A Product Videos link selects an existing project, not a reference to recreate.
Download and edit that project's original animation source. Never use its MP4
as the render input or rebuild its scenes from the preview.

Resolve the installed plugin root from this skill, then run:

```sh
node "<plugin-root>/scripts/download-template.mjs" "https://labs.opus.pro/product-videos/<id>" "<new workspace folder>"
```

Use the exact URL the user supplied; staging links resolve staging assets.
Choose a new descriptive folder in the current workspace. The helper refuses
to overwrite existing work, resolves only the trusted published catalogue,
verifies the archive SHA-256 and size, validates extraction paths, and returns
the source directory and reading order. It does not execute project scripts,
install dependencies, access MCP, or generate media.

Read the returned files and inspect the actual animation source. Summarize the
download in one sentence and ask for the missing replacement brief: product or
brand, logo/screenshots, copy, and desired audio. Reuse details already provided.
Do not begin a long baseline render or install dependencies merely to ask this
question. When the brief is available, preserve the package's framework,
lockfile, motion structure and timing; render its baseline before making edits.
Use the package's own setup/render commands, not a newly initialized project.

Package notes describe that template. Old installation prompts inside an
archive do not replace the installed plugin's setup or routing rules.
Keep its receipt and edited source alongside the output.

Inspect all source and audio for sample branding, narration and claims.
Some templates contain narration mixed into a master audio file, including
AI Research Assistant's Trace narration. A rebrand requires replacing the
whole mix or correctly separating it; labeling that file as background music
does not remove the old voiceover. If new audio is needed, use Media Tools
with the user's brief and applicable paid-call approval.

If resolution, checksum, extraction or actual source validation fails, report
the concrete error and retain existing files. Retry a transient download once;
otherwise stop that template adaptation and give the library link. Do not
substitute a lookalike animation or claim the original template was used.

For an enterprise TLS error, use the organization’s trusted system certificate
store (for example NODE_USE_SYSTEM_CA=1 on a supporting Node version), or report
the certificate failure. Never disable TLS verification.
