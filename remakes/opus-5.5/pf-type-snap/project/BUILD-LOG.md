# BUILD-LOG: pf-type-snap

- Start: Thu Sep 24 15:54:04 PDT 2026
- End: Thu Sep 24 16:08:41 PDT 2026 (about 15 min)
- Output: `out/pf-type-snap.mp4`. ffprobe: h264, yuv420p, 1080x1350, 60/1 fps, 288 frames.
- Review rounds: 5 (stills, contact sheets and pixel diffs, then a frame-by-frame strip pulled from the MP4)

## Implementation

- `src/TypeSnap.tsx`: layout, timing, motion blur, and the row and seam masks.
- `src/easing.ts`: a cubic-bezier that allows overshoot, the capped-overshoot travel mapping and the two-phase swap curve.
- `src/font.ts`: loads GeistVF.woff2 through FontFace, with delayRender.
- Layout: background #181b1c. The three 160px rows span y 435–915 and are centred on the canvas. Words are set in Geist 760 at 160px with -0.045em tracking, left margin 72. FIELD DAYS and OCT 24-25 / SAN FRANCISCO stay fixed, with hairline rules and faint row guides.
- Entrance: each word travels in from x+1400 on cubic-bezier(.18,.9,.24,1.13). Words are 0.09s apart and each move lasts 0.62s, so the last word rests at exactly 0.8s (frame 48). Frame 48 is pixel-identical to frame 60.
- Overshoot cap: the raw curve would overshoot about 47px at 1400px. On the way out, the overshoot passes through tanh, which keeps velocity continuous. On the way back it is mapped quadratically, which gives a soft landing. The peak is 23.06px, under the 24px maximum.
- Motion blur: an SVG feGaussianBlur that is horizontal only, plus a scaleX smear of fixed pixel length. Both scale with the word's speed each frame. At rest the code forces them to exactly blur 0 and scaleX 1, with no transform or filter, so the text is crisp.
- Swap: row i runs from 1.85 + 0.07·i s over 0.36s, and the last row lands at exactly 2.35s (frame 141). Frame 141 is pixel-identical to frame 287. Each outgoing and incoming pair rides one 1220px conveyor. The incoming word lands with a 14px overshoot and a cosine settle. ACTION. stays in accent colour throughout.
- Masking: each row is an overflow-hidden 160px window inside the masked row region. During the swap, a moving seam sits midway between the outgoing word's right edge and the incoming word's left edge. The outgoing mask fades to zero 3px before the seam and the incoming mask starts 3px after it, so no pixel column ever shows both phrases.

## Issues found and fixed

1. Overshoot capping first used a tanh fold on both sides of the peak. That gave an accelerating return, about 6px/frame, into a hard stop. I replaced the return side with a quadratic mapping so the word settles softly.
2. The first swap curve (.72,0,.14,1.06) peaked at about 260px/frame and its overshoot was only about 3px. I replaced it with an ease-in-out travel followed by a separate cosine settle.
3. The hard clip-path seam cut the blurred and stretched tails with visible vertical edges. Three changes fixed it: the smear became a fixed pixel length rather than a ratio of word width, the conveyor gap grew (1180 to 1220px), and the seam became two feathered masks that do not overlap.
4. On the landing frame (141), velocity measured from the previous frame left a sub-pixel scaleX that made the text slightly soft. Words now snap to an exact rest state once their rest time arrives. I added a 1e-9 epsilon so t = 2.35 counts as settled.
5. A stray empty file was created one level above the project directory. A mistyped `cat >` redirect in a helper command caused it. I removed it straight away and did not read anything there.

## Spec deviations and interpretations

- The spec does not say how long each swap row takes. I read "1.85-2.35s with .07s row staggering" as: every row's motion happens inside that window, each row taking 0.36s.
- "Max 24px overshoot" is met by folding the curve's overshoot to 24px. The time-to-progress easing is exactly (.18,.9,.24,1.13).
- The only elements beyond the spec are decorative, not text: an accent dot, hairline rules, faint row guides and a light vignette.
