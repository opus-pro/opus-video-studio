# BUILD-LOG: pf-cart-checkout

- Start: Thu Sep 24 17:05:34 PDT 2026
- End: Thu Sep 24 17:25:19 PDT 2026 (about 20 minutes)
- Review rounds: 8 still/contact-sheet rounds plus 2 MP4 frame-extraction passes, with pixel measurements taken from both stills and MP4 frames.
- Output: `out/pf-cart-checkout.mp4`, h264 yuv420p, 1600x1200, 60 fps, 324 frames (5.40 s), checked with ffprobe.

## Implementation

- `src/index.tsx` registers `pf-cart-checkout` (1600x1200, 60 fps, 324 frames).
- `src/CartCheckout.tsx` holds the scene: the product stage, the print, the details column, the button morph and the confirmation line.
- `src/Cursor.tsx` draws a standard arrow cursor on a quadratic path. Motion blur comes from 6 trailing sub-frame samples over a 0.9-frame shutter.
- `src/icons.tsx` holds the cart glyph and the stroke-drawn check.
- `src/timing.ts` holds the spec beats in frames and the easing helpers.
- Geist is loaded from `GeistVF.woff2` with the FontFace API, and rendering waits on it through delayRender. The print uses `coast.jpg` through `<Img>`.

### Button morph

All three shapes (a centre rounded rect and two side circles) sit in one SVG group with a goo filter: a Gaussian blur, then an alpha threshold, then SourceGraphic composited over the result. The pill therefore splits and re-merges like a liquid, and shape edges stay exact.

## Spec compliance

| Spec | Implementation | Verified |
|---|---|---|
| 420x100 #cde993 "Add to cart" pill visible | Present from frame 0 | Sampled (205,233,147); 420x100 measured (x 900-1319, y 774-873) |
| Product and title entered by 0.55 s | Every entrance ends at frame 33 | Stills |
| Cursor moves in and presses at 1.10-1.35 s | Cursor moves in over frames 34-66. Press is frames 66-81: cursor scales to 0.86, pill to 0.965 and darkens | Stills |
| 1.35-2.05 s: pill becomes three 100px circles | Frames 81-123. The label blurs out; the pill gathers 10px, then pinches into three blobs. Colour floods each side circle from its centre (dark green left, coral right). The side circles spring out to 170px from centre and settle at 160 | Circles measured at exactly 100px. Overshoot measured at 10px (<=12). The trio spans the pill's 420px footprint |
| Circle content | Check (drawn on) left, cart centre, quantity "1" right; all finished by frame 123 | Stills |
| "Added to your bag" | Fades up at 1.85-2.22 s and holds to the end | Stills |
| 3.10-3.80 s: side circles return, centre widens into "View cart · 1" | Frames 186-228. Side icons fade, colour drains back to lime, and the side circles slide home and merge into the centre. The centre widens monotonically from 100 to 420 while the cart icon and label ride into place as one row, revealed by the pill edge. The only extra motion is a small cart tilt (-9deg, +3deg, 0) | Frame 228 matches the rest pill at 420x100 |
| Truthful end state | Hold on "View cart · 1" and "Added to your bag". Nothing implies checkout or payment | Last frame |

## Main issues found and fixed

1. The first split looked like a hard cut. The side circles shot out from inside the pill, so no liquid neck was visible. Fix: the side circles now start as the pill's own end caps, gather 10px, then spring out, and the goo blur went from 9 to 12. A clear pinch now shows at about 1.55-1.6 s.
2. The colour change went through muddy olive and khaki. A straight RGB crossfade from lime to green or coral causes this. Fix: a colour disc now floods from each circle's centre after pinch-off, and on return the colour drains back the same way.
3. The first return showed dark green and coral crescents poking out from behind the widening pill. Fix: the return now mirrors the split: drain, then merge as lime.
4. The label mid-animation overlapped the travelling cart icon. A clip-path attempt then showed chopped text ("iew cart"). Fix: the icon and label are one row that translates as a unit, so the pill edge reveals the text naturally.
5. The goo threshold shrank the circles to 98px. Fix: composite SourceGraphic *over* the goo instead of *atop* it, which gives exactly 100px while keeping the necks.
6. The press ripple read as a vertical light band inside the pill. Fix: removed it. The press is now a scale plus darken plus tighter shadow.
7. Smaller fixes:
   - Moved the cursor exit earlier so it clears the circles before the icons pop in.
   - Softened the entrance easing, which had settled in about 10 frames.
   - Added a round-cap guard so the check does not start as a stray dot.
   - Thickened the cart stroke to match the label weight.
   - Removed transforms at rest so text rasterises crisply.

## Deviations and caveats

- None known against the numeric spec.
- For about 3-4 frames during merge and split (around 1.53 s and 3.40 s) the pill's top edge shows a faint liquid ripple where the shapes join. This is intentional goo behaviour but slightly visible.
- Format copy ("Archival matte print · 12 × 16 in") and the plate caption ("FIELD PRINTS · 01") are invented product details, because the spec only says "format".
