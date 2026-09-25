# Product Videos templates

**9 full video templates and 34 motion components**, with editable Remotion source, pinned dependencies, asset provenance, and video demos.

[Browse the live gallery](https://product-videos.labs.opus.pro/) · [Watch a full video demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/preview.mp4) · [MIT source license](LICENSE)

The live gallery may ask you to sign in. Source and linked video demos are publicly accessible without an Opus account.

## Quick start

```sh
git clone https://github.com/opus-pro/opus-video-studio.git
cd opus-video-studio
npm run templates:prepare -- ai-research
cd templates/ai-research/project
npm ci
npm run check
npm run studio
# Export the complete video:
npm run render
```

Requirements: Node.js 22+, npm, `unzip`, and FFmpeg for the full-video templates. Remotion downloads Chromium on first render unless the package supports a supplied browser. Follow the selected template's README for details.

All animation source, configurations, lockfiles, and original license/asset notes are in Git. Large images, fonts, audio, and reference MP4s are restored on demand from the selected immutable public release. The preparation command verifies its byte size and SHA-256, then verifies every restored file; it never overwrites existing files or installs packages. This keeps plugin installs small. After preparation and dependency/browser setup, baseline rendering uses local assets and needs no Opus login or paid generation.

To prepare from an already downloaded ZIP, run `npm run templates:prepare -- <id> /absolute/path/to/release.zip`; the same published checksum is required.

## Full video templates

| Preview (click to play) | Template | Duration | Links |
|---|---|---|---|
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/ai-research-motion-template-lite-v5-1.0.0/poster.jpg" alt="AI Research Assistant" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/ai-research-motion-template-lite-v5-1.0.0/preview.mp4) | **[AI Research Assistant](ai-research/)**<br>Research and evidence workflows | 19.2s | [Source](ai-research/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/ai-research-motion-template-lite-v5-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/ai-research) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/margin-motion-template-lite-fast20-1.0.0/poster.jpg" alt="AI Writing Assistant" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/margin-motion-template-lite-fast20-1.0.0/preview.mp4) | **[AI Writing Assistant](margin/)**<br>Writing and document workflows | 20s | [Source](margin/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/margin-motion-template-lite-fast20-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/margin) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/poster.jpg" alt="AI Coding Agent" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/preview.mp4) | **[AI Coding Agent](aiagent/)**<br>Ideas to software with fluid UI motion | 28.1333s | [Source](aiagent/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/aiagent-motion-template-lite-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/aiagent) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/agent-opus-motion-template-lite-v19.10-1.1.0/poster-4.9s.jpg" alt="AI Video Generator" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/agent-opus-motion-template-lite-v19.10-1.1.0/preview.mp4) | **[AI Video Generator](agent-opus/)**<br>AI video creation | 40.8s | [Source](agent-opus/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/agent-opus-motion-template-lite-v19.10-1.1.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/agent-opus) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/ai-companion-motion-template-lite-v12-1.0.0/poster.jpg" alt="AI Companion" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/ai-companion-motion-template-lite-v12-1.0.0/preview.mp4) | **[AI Companion](ai-companion/)**<br>Character chat and personal assistants | 30s | [Source](ai-companion/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/ai-companion-motion-template-lite-v12-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/ai-companion) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/creative-search-motion-template-lite-v8-1.0.0/poster.jpg" alt="Creative Search" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/creative-search-motion-template-lite-v8-1.0.0/preview.mp4) | **[Creative Search](creative-search/)**<br>Creative file search | 22.6167s | [Source](creative-search/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/creative-search-motion-template-lite-v8-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/creative-search) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/website-builder-motion-template-lite-v3-1.0.0/poster.jpg" alt="Website Builder" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/website-builder-motion-template-lite-v3-1.0.0/preview.mp4) | **[Website Builder](website-builder/)**<br>Website and visual editors | 52s | [Source](website-builder/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/website-builder-motion-template-lite-v3-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/website-builder) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/tovo-motion-template-lite-1.0.0/poster.jpg" alt="AI Meeting Assistant" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/tovo-motion-template-lite-1.0.0/preview.mp4) | **[AI Meeting Assistant](tovo/)**<br>Meeting notes and action items | 15s | [Source](tovo/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/tovo-motion-template-lite-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/tovo) |
| [<img src="https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/numo-motion-template-lite-1.0.0/poster.jpg" alt="Analytics Dashboard" width="220">](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/numo-motion-template-lite-1.0.0/preview.mp4) | **[Analytics Dashboard](numo/)**<br>Data analytics | 15s | [Source](numo/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/numo-motion-template-lite-1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/numo) |

## Motion components

### Brand intros

| Component | What it does | Duration | Links |
|---|---|---|---|
| [Icon-to-Wordmark Reveal](pf-mark-lockup/) | Move a centered app mark aside and reveal a complete wordmark lockup. | 3.6s | [Source](pf-mark-lockup/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-mark-lockup-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-mark-lockup) |
| [Five-Point Brand System](pf-brand-dots/) | Turn five color points into a living modular identity board. | 5.6s | [Source](pf-brand-dots/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-brand-dots-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-brand-dots) |
| [App Icon to Brand System](pf-brand-app/) | Open an app icon into a complete five-panel identity system. | 5.8s | [Source](pf-brand-app/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-brand-app-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-brand-app) |
| [Logo Unfold Brand System](pf-brand-clover/) | Unfold a four-part mark into a complete modular brand world. | 5.4s | [Source](pf-brand-clover/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-brand-clover-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-brand-clover) |
| [Six-Color Brand Launch](pf-six-colors/) | Build a launch moment from six full-width brand color bands. | 3.6s | [Source](pf-six-colors/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-six-colors-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-six-colors) |
| [Symbol to Wordmark](study-brand-lockup/) | Shrink a centered symbol and reveal its brand name. | 2.2s | [Source](study-brand-lockup/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-study-brand-lockup-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/study-brand-lockup) |
| [Logo Bloom](study-brand-bloom/) | Rotate and unfold a compact mark into its final silhouette. | 2.2s | [Source](study-brand-bloom/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-study-brand-bloom-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/study-brand-bloom) |
| [Logo Half Turn](study-brand-spin/) | Resolve a symbol with one controlled half-turn. | 2.2s | [Source](study-brand-spin/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-study-brand-spin-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/study-brand-spin) |
| [Four Blocks Converge](study-brand-gather/) | Gather four moving blocks into one central mark. | 2.2s | [Source](study-brand-gather/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-study-brand-gather-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/study-brand-gather) |

### Titles and announcements

| Component | What it does | Duration | Links |
|---|---|---|---|
| [Headline to Event Pass](pf-event-pass/) | Transform a three-line announcement into a finished event credential. | 4.8s | [Source](pf-event-pass/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-event-pass-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-event-pass) |
| [Multi-Line Headline Snap](pf-type-snap/) | Snap complete headline rows in and switch to a second statement. | 4.8s | [Source](pf-type-snap/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-type-snap-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-type-snap) |
| [Flowing Color Field](pf-color-field/) | Reveal and replace brand lines over a continuous procedural color field. | 5.6s | [Source](pf-color-field/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-color-field-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-color-field) |
| [Dithered Event Poster](pf-pixel-poster/) | Resolve a multi-line title through a deterministic pixel mask. | 4.8s | [Source](pf-pixel-poster/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-pixel-poster-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-pixel-poster) |
| [Glossy Serif Manifesto](template-manifesto/) | Expand one quiet sentence into a polished multi-line brand manifesto. | 9s | [Source](template-manifesto/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-manifesto-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-manifesto) |
| [Three-Ribbon Campaign](template-ribbon-manifesto/) | Set three opposing type ribbons into a compact campaign lockup. | 8s | [Source](template-ribbon-manifesto/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-ribbon-manifesto-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-ribbon-manifesto) |

### Showcase and portfolio

| Component | What it does | Duration | Links |
|---|---|---|---|
| [Horizontal Portfolio Relay](pf-carousel-horizontal/) | Pass four editorial posters through one horizontal hero position. | 4.8s | [Source](pf-carousel-horizontal/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-carousel-horizontal-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-carousel-horizontal) |
| [3D Diagonal Portfolio Relay](pf-carousel-diagonal/) | Move equal-size poster planes around a true diagonal 3D loop. | 4.8s | [Source](pf-carousel-diagonal/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-carousel-diagonal-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-carousel-diagonal) |
| [Vertical Portfolio Relay](pf-carousel-vertical/) | Pass four editorial posters through one vertical hero position. | 4.8s | [Source](pf-carousel-vertical/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-carousel-vertical-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-carousel-vertical) |
| [Fan Deck Showcase](pf-orbit-fan/) | Rotate a grounded fan of posters and promote one work at a time. | 4.8s | [Source](pf-orbit-fan/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-orbit-fan-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-orbit-fan) |
| [3D Orbit to Hero](pf-orbit-focus/) | Orbit equal-size images around a statement, then bring one through camera. | 6s | [Source](pf-orbit-focus/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-orbit-focus-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-orbit-focus) |
| [Camera to Fashion Campaign](pf-camera-campaign/) | Move from a camera capture sequence into a restrained fashion campaign. | 4.2s | [Source](pf-camera-campaign/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-camera-campaign-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-camera-campaign) |
| [Portrait Slice Assembly](pf-portrait-slices/) | Assemble four cinematic portrait slices into one macro campaign image. | 4.2s | [Source](pf-portrait-slices/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-portrait-slices-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-portrait-slices) |
| [Editorial Print Launch](pf-print-menu/) | Relay three art prints through one graphic product-launch composition. | 5.6s | [Source](pf-print-menu/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-print-menu-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-print-menu) |
| [3D Depth Spiral](pf-depth-swirl/) | Drive equal-size image planes through a true perspective spiral tunnel. | 5.8s | [Source](pf-depth-swirl/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-depth-swirl-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-depth-swirl) |

### Product and UI demos

| Component | What it does | Duration | Links |
|---|---|---|---|
| [In-Hand App Scroll](pf-phone-hand/) | Place an editable product flow precisely inside a photographed phone. | 4.6s | [Source](pf-phone-hand/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-phone-hand-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-phone-hand) |
| [Three-Phone Carousel](pf-phone-carousel/) | Rotate three complete phone states through the central product position. | 4.8s | [Source](pf-phone-carousel/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-phone-carousel-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-phone-carousel) |
| [Add-to-Cart Transformation](pf-cart-checkout/) | Transform one product CTA into a clear, complete added-to-cart state. | 5.4s | [Source](pf-cart-checkout/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-cart-checkout-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-cart-checkout) |
| [Creative Search Selection](template-case-search/) | Stack creative work, select one result, and open it into focus. | 9.83333s | [Source](template-case-search/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-search-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-case-search) |
| [Live Website Restyle](template-case-website/) | Change one color control and let the entire page respond. | 6.5s | [Source](template-case-website/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-website-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-case-website) |
| [Idea to Shared World](template-case-companion/) | Turn one prompt into a finished, shareable creative result. | 10.5333s | [Source](template-case-companion/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-companion-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-case-companion) |

### Data and results

| Component | What it does | Duration | Links |
|---|---|---|---|
| [Trail Recap Data Reveal](pf-trail-recap/) | Turn a landscape into a route trace and a clean performance recap. | 5.4s | [Source](pf-trail-recap/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-pf-trail-recap-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/pf-trail-recap) |
| [Growing Analytics Capsules](template-analytics-glow/) | Grow luminous data capsules into a compact analytics result. | 3s | [Source](template-analytics-glow/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-analytics-glow-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-analytics-glow) |
| [Anomaly to Action](template-case-numo/) | Trace one data anomaly into an understandable recommendation. | 10.2s | [Source](template-case-numo/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-numo-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-case-numo) |
| [Evidence-Backed Answer](template-case-research/) | Ask a question and reveal an answer with visible source evidence. | 8.4s | [Source](template-case-research/project/) · [Demo](https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/motion-component-template-case-research-v1.0.0/preview.mp4) · [Gallery](https://product-videos.labs.opus.pro/template-case-research) |

## Source integrity and updates

This is a snapshot of all 43 published gallery entries on September 24, 2026. [catalog.json](catalog.json) records release URLs, archive checksums, original file hashes, reading order, and preview links. Project files are copied byte for byte from those verified releases. Related compositions can share a source batch; select the composition named in the package README.

Run `npm run templates:check` from the repository root to validate the committed source snapshot and any restored media. This checks release integrity, not render quality, and intentionally reports differences after customization. Use each package's own check/render commands to validate your edits. `npm test` includes the catalogue integrity check and preparation safety tests without downloading media.

For a catalogue update, verify the new published archive, review source and asset notices, update the affected project and file records, and run the checks before submitting a PR. Keep source, demo links, and release checksums together. Never include credentials, environment files, installed dependencies, or private backend code.

## License and contributions

Opus-authored template code, configuration, documentation, and preparation tools in this directory are released under the [MIT License](LICENSE). Third-party notices are preserved. Media assets, fonts, trademarks, and dependencies are not relicensed by this grant; consult [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and each project's asset records. Remotion's own license applies to Remotion separately.

For a new brand, replace example logos, screenshots, claims, and audio with material you can use. Some full templates include narration in their master soundtrack. Open a pull request with a description, a reproducible render command, and a preview of any visual change.
