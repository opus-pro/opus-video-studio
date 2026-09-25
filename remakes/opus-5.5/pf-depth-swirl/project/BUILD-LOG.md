# BUILD-LOG — pf-depth-swirl

- Start: Thu Sep 24 16:11:32 PDT 2026
- End: Thu Sep 24 16:32:58 PDT 2026
- Review rounds: 4 (stills plus MP4 contact sheets and frame crops each round)

## What was built
- `src/spiral.ts`: the spatial model, shared by the renderer and the audit. It covers the spec formulas, the travel ease (cubic-bezier 0.4,0,0.14,1 over frames 0-276, then held at 0.46), card projection, and the recycle rule.
- `src/SwirlScene.tsx`: ThreeCanvas with the default PerspectiveCamera at (0,0,12), fov 48. It draws twelve PlaneGeometry(2,2) meshes at scale (1,1,1), textured coast/forest/desert/mountains in turn, with each photo centre-cropped to the square card rather than stretched. The card ShaderMaterial adds rounded corners (AA via fwidth), depth haze, a far-end fade-in, and the text protection. Motion blur is true shutter accumulation: 8-48 adaptive sub-frame samples, a ~200° tent shutter, and 4x MSAA half-float targets in linear light. The background is a gradient with vignette and dither, and sRGB encoding happens once in the composite pass.
- `src/Headline.tsx` and `src/swap.ts`: the screen-fixed, centred Geist type. The eyebrow is FIELD NOTES; the headline is "A wider / perspective." (lead line weight 300, key word weight 640). The swap is word by word: the old words rise, blur and fade from f222; the new words rise into place from f237 and are at rest by f260, inside the 3.7-4.35s window. "perspective." and FIELD NOTES stay fixed. When the type is at rest it has no transform or filter, so it stays crisp.
- `scripts/audit.mjs` writes `spatial-audit.json`. It covers camera, cards, formulas, travel, every frame's card state and screen rect, recycle events with edge clearance, a 64x sub-frame recycle sweep, per-word ink boxes measured in the browser for 48 frames (including every frame of the swap), protection-mask values at each ink point, and a coarse grid of the mask at rest. All checks pass.

## Issues found and fixed
1. **Recycling.** Using fract() on its own recycles card 10 while it is still on screen: at u=1 (z=9) its corner is in frame, at about f78. The fix: after the wrap, a card keeps moving past z=9 until its projected rect clears every frame edge by 8px, and only then recycles. For card 10 that costs about 1 frame. The other wraps (cards 11, 9, 8, 7) were already off screen. Recycled cards come back at the far end with fade ~0.
2. **Protection too weak at the line ends.** A single ellipse left the ends of "perspective." barely protected. It is now a smooth union of three capsules, one per line, each fitted to the measured text width, with a 190px smoothstep feather and minimum card opacity 0.1. There are no straight edges and it is never a rectangle. I checked the mask in a debug render.
3. **Stepping in the motion blur.** A fixed 16 samples left visible copies on the fastest near cards. The sample count now adapts to on-screen travel (about 1.1px per sample, capped at 48).
4. **Messy swap.** The outgoing and incoming words overlapped mid-swap. I made the outgoing words exit faster, started the incoming words a little later, and cut their entry offset to 0.18em. Their opacity also lags their movement, so the descender of "your" never touches "perspective." (the audit checks visible-ink overlap on every swap frame).
5. **Off-centre text.** Trailing tracking pulled the text off centre: 4px on the eyebrow and about 3px on the headline. Both are compensated, and the measured ink is centred to within 3px.

## Spec deviations and limits
- While a near card is still leaving frame after its nominal wrap, u runs slightly past 1 (card 10, about 1 frame). Recycling only after a card has fully left frame requires this; every other frame uses u = fract(i/12+travel) exactly.
- The spec doesn't say whether FIELD NOTES is replaced along with the headline. I read "replace" as applying to the headline, so FIELD NOTES stays on screen the whole time.
- The styling choices are mine: rounded card corners, haze, and the far-end fade. The geometry is still PlaneGeometry(2,2) at scale (1,1,1).
- At rest, the positions set by the spec leave one near card cropped by the bottom frame edge. That is the spec's layout, not an accidental clip.
- The audit script opens Chrome with gl=angle, because the default GL backend could not create a WebGL context in that script. `scripts/render.mjs` is unchanged and renders fine.
