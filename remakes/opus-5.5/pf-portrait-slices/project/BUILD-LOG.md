# Build log: pf-portrait-slices

- Start: Thu Sep 24 16:49:11 PDT 2026
- End: Thu Sep 24 17:04:29 PDT 2026 (about 15 minutes)
- Review rounds: 4 (stills round 1, stills round 2, frames pulled from the MP4 in round 3, grain and final MP4 check in round 4)
- Output: `out/pf-portrait-slices.mp4`. ffprobe reports h264, yuv420p, 1080x1920, 60/1 fps, 252 frames, 4.200 s.

## Implementation (src/)

- `index.tsx` registers `pf-portrait-slices` at 1080x1920, 60 fps, 252 frames.
- `PortraitSlices.tsx` holds the whole timeline:
  - **0 to 0.6 s:** the sunset wide fills the frame with a cover crop and a slow push. AFTER HOURS sits in the top-left corner and SERA in the top-right, both in Geist 22 px caps with 0.24em tracking.
  - **Strip entry, 0.6 to 1.3 s:** four fixed 1080x480 windows tile the 9:16 frame. They enter from the left, right, left and right, starting at 0.6, 0.7, 0.8 and 0.9 s. Each slide takes 0.4 s on an expo-out curve, so the last window lands at exactly 1.3 s.
    - Crops: turn (hair and glasses), macro (eye and upper lens), wide (shoulder and chain), turn (profile: nose, lips, jaw).
    - The content lags each window slightly (parallax), then drifts slowly while it rests.
    - Motion blur follows each window's speed. It uses a horizontal SVG `feGaussianBlur` sized from the position change across a 180-degree shutter.
    - The wide background dims and softens (depth of field) as the windows cover it.
  - **Expansion, 1.6 to 2.22 s:** the second window grows continuously from y 480-960 to the full frame on an ease-in-out curve.
    - It is the same `<Img>` element throughout. Its scale and offset interpolate in frame space from the strip crop (s 1.12) to the full cover crop (s 1.25), so there is no swap.
    - The eye stays within about 45 px of its position throughout.
    - A check confirms the image covers the window at every step of the expansion.
    - The other windows are pushed out by the moving edges. They also recede: they scale down 8.5%, dim 72%, drift back toward the side they came from and get vertical motion blur. The expanding window casts a shadow over them.
  - **Hold, 2.22 to 4.2 s:** a subtle push-in (1.00 to 1.07) runs from 1.95 s to 4.6 s and is anchored on the eye, so it is still moving slowly on the last frame.
  - **Copy:** "AW26 Collection · The Sunset Edit", the headline "A closer / point of view." and a hairline rule above `sera.studio/after-hours` and "02 / 04".
    - The block sits bottom-left, under a warm bottom scrim, about 115 px below the lens rim, so it stays clear of the eye and glasses.
    - It animates in with mask and fade reveals between 2.1 and 3.0 s. Transforms are removed once it settles so the text renders crisp.
- `font.ts` loads GeistVF.woff2 through the FontFace API, wrapped in `delayRender`.
- `Grain.tsx` adds a seeded, deterministic grain tile that shifts each frame. It sits below the type (overlay blend, 9% opacity).

## Issues found and fixed

1. Round 1: the small strip index labels ("01 Hair / Frame" and so on) sat on the glasses and on bright window areas, where they were hard to read. I removed them.
2. Round 1: the turn hair/glasses crop cut through the lens bottoms, the profile strip showed a lens sliver along its top edge, and the shoulder/chain strip cut the chin at its top edge. I re-cropped all three.
3. Round 1: the retreating strips had too much vertical motion blur. I lowered its gain to 0.3, compared with 0.42 for horizontal blur.
4. Round 2: the strips did not separate enough from the wide shot behind them. I added progressive blur and dimming to the background during the entry.
5. Round 3: the first full render failed. The font `delayRender` waited on `document.fonts.ready`, which sometimes never resolved in a render tab (28 s timeout at frame 227). Now `continueRender` is called straight after the FontFace loads. Every later full render completed.

## Spec deviations

- None known. All timings are computed in seconds, so the expansion ends at 2.22 s, which falls between frames 133 and 134.
- The spec gives no collection name or URL, so "AW26 Collection · The Sunset Edit" and `sera.studio/after-hours` are copy I wrote.
- The macro frame is upscaled about 1.34x from its 1024x1536 source, so the skin looks slightly soft at full frame. Grain makes this less noticeable.
