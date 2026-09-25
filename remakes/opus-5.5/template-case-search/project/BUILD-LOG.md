# Build log: template-case-search

- Start: Thu Sep 24 17:18:52 PDT 2026
- End: Thu Sep 24 17:43:08 PDT 2026 (about 24 min)
- Output: `out/template-case-search.mp4`, h264 yuv420p, 960x540, 60 fps, 590 frames (9.833 s), checked with ffprobe
- Review rounds: 7 still/contact-sheet rounds, plus 2 passes over frames pulled from the full MP4 (a motion sheet of every 6th frame, and frames 196–232 of the flight)

## What it does

1. **Quiet space (0–100):** 13 small creative objects sit on a light paper field with a faint dot grid. There are 4 posters drawn in canvas, 4 chrome forms rendered in WebGL (sphere, torus, capsule, torus knot) and 5 ink line glyphs. They stagger in and drift very slightly. The centre is left empty for the hero.
2. **Search (70–124):** a search field types "ring" with an accent caret, and "⌘K" gives way to "3 results". Non-matches dim and go grey. The three matches get the labels Surface, Form and Line.
3. **Select (114–190):** a cursor glides in and hovers, which shows a focus ring and lifts the card. It clicks with a white ripple.
4. **Hero focus (190–248):** the poster flies to centre on an eased path with a small arc and tilt. A directional SVG blur, aligned to its velocity, applies only to the moving card. It peaks around frames 208–216 and is gone by 220. The background pushes outward, shrinks and blurs for depth of field. The DOM poster then hands off to an identical WebGL poster. Both use the same canvas, and the shader outputs the unlit texture exactly, so the swap can't be seen.
5. **Continuous transformation (250–524):** one mesh with 129x221 vertices. The poster rolls into a tube and the tube bends into a torus. Normals are analytic (finite differences), so there are no seams. The material slides from vivid print, through glossy print and rose-tinted metal, to chrome under a custom studio environment built with PMREM. The tube radius then shrinks on a log curve to a 2.4 px line while the ring turns face-on and fades to flat ink. The 3D line is swapped for a crisp SVG circle of the same radius (checked to be within about 1 px).
6. **Rest (524–589):** an ink ring with a vermilion marker that settles on it. A stepper (Surface / Form / Line) tracks the stages throughout, and its connecting hairlines fill in as a "line" motif.

## Issues found and fixed

- The first chrome environment was almost all white, so the torus read as white ceramic. I rebuilt it with a dark floor, a sharp horizon, softbox strips and a faint warm card. I then lowered the horizon so the small spheres did not read as black glass.
- The rolled-poster stage washed out to pastel pink. Metalness and the removal of the texture tint started too early, and the white metal tint was mixing in. I delayed metal, removed the texture colour after the metalness change, kept the flat-colour mix longer and raised the env intensity during the dielectric stage.
- The small chrome objects drawn as SVG gradients looked flat. I replaced them with a second WebGL canvas, with per-object opacity and blur on the whole layer, and added soft contact shadows.
- The placeholder caret overlapped the "S" of "Search". It now sits in the flow before the placeholder.
- The stepper spacing was uneven because the invisible active-dots took up layout space. The dots are now absolutely positioned.
- The flight arc swept up over the chrome sphere. I flattened it into a slight dip through the empty centre.
- The click ripple was invisible on the orange card. It is now a white ring with a hairline edge.
- The speed blur lasted too long, because card growth was counted as directional speed. I reduced the growth weight and the cap, so the blur is now brief.
- Background objects behind the hero were too present at rest. I lowered their receded opacity, and objects inside the hero zone fade out completely.
- The torus hold felt static. I increased the orientation drift.

## Spec gaps / notes

- None known against the numbers: 960x540, 60 fps and 590 frames are exact.
- Frame 0 is the empty quiet field. The objects build in over the first ~0.7 s, which is deliberate.
- Speed blur is used once, on the selection flight. The morph itself has no speed blur because nothing in it moves fast.
- Everything is drawn in code with system fonts. The only dependencies are the installed Remotion and Three packages.
