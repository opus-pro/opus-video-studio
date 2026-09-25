# BUILD-LOG — pf-brand-clover (Logo Unfold Brand System)

- Start: Thu Sep 24 16:11:24 PDT 2026
- End: Thu Sep 24 16:31:22 PDT 2026 (about 20 min)
- Output: `out/pf-brand-clover.mp4`. ffprobe: h264, 1920x1080, 60/1 fps, 324 frames, 5.4 s, yuv420p.
- Review rounds: 8. Each round rendered stills and/or pulled frames from the MP4, built contact sheets of the unfold, and checked 1:1 crops.

## What was built (`src/`)
- `system.ts`: palette, the mark geometry, the board grid, timing and easing, and the per-frame petal and fifth-region state.
  - The mark: four 240.8x132 capsules on the diagonals, sized so the resting mark is exactly 440x440, with a 22 px inner gap.
  - The board: 1760x920 at (80,80). It is a 12x6 module grid with 16 px gutters.
- `BrandClover.tsx`: the four petal panels, the fifth region, the single wordmark element, directional motion blur, depth shadows and paper grain.
  - Motion blur is a per-element SVG Gaussian driven by frame velocity. It is only applied while an element moves.
  - Panel shadows lift during flight.
- `Contents.tsx`: the content of each region.
  - Ink: primary lockup, headline and labels.
  - Coral: a Geist specimen with a live weight axis.
  - Fifth: photography cycling through all four photos, with Ken Burns motion, a progress bar and a rolling caption.
  - Moss: palette.
  - Ochre: a pattern of clovers that make quarter turns in a wave.
- `Clover.tsx`: the vector mark, used for the lockup and the pattern.
- `font.ts`: the Geist variable font, loaded through FontFace. The render is held with `delayRender` until the font is ready.

## Timing against the spec
- Frame 0: 440 px mark at -45deg and a 104 px FIELD wordmark, both crisp (velocity 0, so no blur).
- Rotation: -45deg to 0 over frames 0–39, reaching 0 at 0.65 s.
- Petals: frames 48–99 (0.8–1.65 s), with a 0–3 frame stagger. Each petal un-rotates from ±45deg, travels on a slight arc, and grows into its region. All land on exact region rects at frame 99.
- Fifth region: grows out of the coral panel's top edge from frame 70 to 99. It is attached to coral's transform, so it rides coral's motion.
- Wordmark: one DOM element for the whole video. It travels a single quadratic Bézier from under the mark into the dark panel lockup over frames 52–99, scaling 1x to 2.25x.
- Content reveal: frames 84–144 (1.4–2.4 s). Every reveal finishes by frame 144.
- Frames 144–323 hold the finished system while it keeps moving: photo wipes, Ken Burns drift, progress bars, a variable-weight "Aa", rotating pattern clovers and a pulsing live dot.

## Issues found and fixed
1. The first layout had the dark panel top-left. The ochre petal's path crossed the wordmark's start spot, so the flying wordmark smeared across moving moss and ochre petals in mid-grey.
   - Fix: re-mapped the board so the dark petal (SW) unfolds under the wordmark. The wordmark now makes a short, clean move into its panel, and no other petal crosses it.
2. As the dark panel swept under the wordmark, ink letters sat on the ink panel and vanished.
   - Fix: while the panel partially covers the word, it is filled with a per-frame SVG background-clip mask of the panel's exact rotated rect. Each letter reads paper-on-ink or ink-on-paper, split exactly at the panel edge. The word is still never duplicated.
3. Motion blur was so strong that panels looked out of focus rather than moving.
   - Fix: lowered the shutter factor, damped the size-change term and capped the blur at 7 px.
4. The wordmark width estimate was wrong, which left a gap of about 90 px in the lockup and let the "Primary lockup" caption collide with the word.
   - Fix: measured the glyph ink box with PIL and corrected the width, cap height and centre offsets. The lockup is now mark, a gap of about 50 px, then the word, with the baseline aligned to the mark at y=944. Removed the caption.
5. The fifth region read as one merged block with coral.
   - Fix: gave it a darker clay base, opened the gutter ahead of the growth, and started the photo wipe at 1.4 s with an ease-out.
6. The lockup mark's colours did not match the hero mark. Fixed.
7. Some reveals (pattern pop-in, hex codes) ran past 2.4 s. Re-timed them to finish by frame 144.
8. The "PHOTOGRAPHY" label and progress bars were low-contrast on bright skies. Strengthened the top scrim and added a soft text shadow.
9. The wordmark was not quite centred at the start. Corrected the glyph offset so it sits centred under the mark.

## Spec notes and deviations
- The spec says "grow a fifth from the coral region". The fifth grows out of coral's edge (upward) and starts coral-tinted (clay) before its photography reveals. It is not a split of coral's own area.
- The hold is kept "living" with continuous ambient motion, so a few elements never fully come to rest after 2.4 s: the Weight readout number, the photo wipes and the pattern turns. All text stays crisp at every frame.
- The spec asks for no extra deliverables, so there is no `spatial-audit.json`.
