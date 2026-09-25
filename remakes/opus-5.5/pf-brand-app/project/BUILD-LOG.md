# BUILD-LOG — pf-brand-app

- Start: Thu Sep 24 16:32:40 PDT 2026
- End: Thu Sep 24 16:46:36 PDT 2026
- Review rounds: 5 (stills, then MP4 frame/contact-sheet checks), plus the final render + ffprobe.
- Output: out/pf-brand-app.mp4 — h264, yuv420p, 1920x1080, 60 fps, 348 frames (5.800 s).

## Build
- src/index.tsx registers `pf-brand-app` (1920x1080, 60 fps, 348 frames). src/Main.tsx loads Geist (FontFace + delayRender) and does
  sub-frame motion blur (180° shutter, 10 samples for frames 44–97, 6 for cursor travel, 1 at rest so resting text stays sharp).
  src/Scene.tsx is a pure function of time, so it can be sampled at fractional frames.
- 0–0.75 s: 640x170 near-white dock, three original 128 px icons (Tide, FIELD, Arch), standard arrow cursor travels in on a curve,
  hover tooltip, press (0.9 scale) and release, running-indicator dot.
- 0.75–1.55 s (f45–93): the FIELD tile's rect is interpolated (centre leads size) straight into the 600x920 coral panel of the
  1760x920 board (80 px margins). The icon glyph scales into the 400 px radial mark. The other four panels start as points at
  the tile's current centre and unfold (width leads height, slight perspective tilt that resolves to 0), staggered to land f88–93.
- Dock fades, blurs and drops out from f46 to f66 (1.1 s). Cursor gone by f58.
- f94–166: coast image wipes in with a scale settle, the mark's dot ring blooms, pattern discs pop in on a diagonal, FIELD letters
  rise with a mask, tagline, three colour bands slide in with name/hex labels, index tags and mark captions. All finished before f168 (2.8 s).
- Through the end: the mark rotates and its rays breathe, the dot ring counter-rotates, pattern blocks turn in sync (discs to pinwheels to stars,
  neighbouring blocks counter-rotating), the image drifts and scales slowly, a faint sheen crosses the bands, and the background glow shifts.

## Issues found and fixed
1. Band content showed early during unfold. Content was clipped only by the moving rect, so off-panel bands were visible. Fixed with a clip at the final rect.
2. Image drift uncovered the panel edge at the end (scale reached 1.0 while translated). Fixed by keeping scale at least 1.035 with a bounded pan.
3. Pattern rotations spilled into neighbouring cells. Fixed with a per-cell clipPath.
4. The random truchet looked noisy. I rebuilt it from 2x2 disc blocks with hand-set colours, and all four quarters of a block now turn in sync, so the pattern keeps 4-fold symmetry and hairline slivers only show briefly mid-turn.
5. Tags, wordmark and tagline were on different left edges. I aligned them to one 37 px inset that matches the pill-tag text.
6. Added depth: a lift shadow and coral glow on the tile in flight, perspective unfold on the panels, a hover tooltip and click indicator.

## Spec gaps / judgement calls
- "Unfold from its center" is read as unfolding from the moving tile's centre. Panels briefly overlap each other in transit, layered behind the coral tile. This is part of the unfold, and nothing overlaps at rest.
- The supplied "coast" photo is a lake and boat scene. It is used as-is for the imagery panel.
- No other deviations: all timings and sizes match the spec.
