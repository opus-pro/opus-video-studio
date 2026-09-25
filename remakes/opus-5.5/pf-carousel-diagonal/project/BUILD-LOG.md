# BUILD-LOG — pf-carousel-diagonal

- Start: Thu Sep 24 16:21:01 PDT 2026
- End: Thu Sep 24 16:37:21 PDT 2026 (~16.5 min wall clock)
- Review rounds: 4 (stills -> fixes -> stills/crops -> full MP4 contact sheets -> final polish)

## What was built
- `src/motion.ts` — single source of truth: 1200x1200 / 60 fps / 288 frames, camera (0,0,10) fov 40,
  2.7x3.5 plane, loop `x=y=2.9 sin(theta)/sqrt2, z=-1+2.6 cos(theta)`, `theta=i*PI/2-phase`,
  phase steps of PI/2 over 0.9-1.54 s, 2.05-2.69 s, 3.2-3.84 s with a hand-rolled
  cubic-bezier(.22,.85,.2,1) solver. Final phase 3PI/2 -> card four (index 3) in front.
- `src/Scene.tsx` — ThreeCanvas + R3F PerspectiveCamera; four meshes share one PlaneGeometry, scale is
  always (1,1,1), quaternion copies the camera (camera-facing billboards). Opaque MeshBasicMaterial with
  depthTest/depthWrite; no renderOrder or sorting. Custom render loop (useFrame priority 1):
  up to 72 shutter samples per frame (8x MSAA, half-float, linear) accumulated with a Hann-weighted
  0.8-frame shutter (same temporal spread as a 180deg box shutter, softer trails). A depth pass feeds
  depth-aware soft contact shadows (key light upper-left). Backdrop, sRGB conversion and dithering in a
  final composite shader; backdrop takes a faint cast of the front card's accent.
- `src/posters.ts` — four editorial poster plates drawn to canvas in Geist at exactly 2x the resting
  hero size (1060x1374), so mip level 1 lands 1:1 on the front card: crisp type at rest.
- `src/Overlay.tsx` — DOM typography (Geist): masthead top-left, relay counter / title / colophon
  bottom-right, masked rollers staggered 0/50/100 ms on the same easing, progress ticks.
- `scripts/spatial-audit.mjs` -> `spatial-audit.json` — built from the same motion module with three.js:
  geometry, scale, quaternion, world positions, camera depth (view-space z, distance, NDC z) and
  projected pixel bounds for every card at 0/1/2/3/4 s, plus a whole-timeline extents sweep.

## Issues found and fixed
1. Background "relay diagonal" glow was hidden behind the cards -> replaced with an accent-tinted radial
   backdrop; first tint (7.5%) read as a green/brown wash -> reduced to 2.8%.
2. No depth separation between overlapping plates -> added depth-buffer-driven soft shadows that fade
   in with the depth gap (no popping as cards cross).
3. Mid-roll text rows showed two half-cut labels at once -> outgoing label fades by 45%, incoming
   resolves late.
4. Box-shutter blur produced hard "slab" edges on fast frames -> Hann-weighted shutter.
5. "/ 04" sat ~10 px above the numeral's baseline -> aligned.
6. Added a faint baked key-light gradient on plates consistent with the shadow direction.

## Spec items not fully met / notes
- With the mandated camera, fov, loop and plate size, a card edge reaches up to ~0.8 px past the
  top/bottom frame edge for a few frames mid hand-off (theta ~ +/-65deg, at speed, motion-blurred).
  This is geometric and cannot be removed without changing spec numbers; every rest pose sits >= 30 px
  inside the frame. Recorded in `spatial-audit.json` -> `timelineExtremesPx`.
- "Camera-facing billboard" implemented as screen-aligned (copy camera quaternion); with the fixed
  camera this is identity rotation and gives keystone-free rectangles.

## Output
- `out/pf-carousel-diagonal.mp4` — h264, 1200x1200, 60/1 fps, 288 frames, 4.8 s (ffprobe verified).
