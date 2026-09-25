# BUILD-LOG: template-case-companion ("Idea to Shared World")

- Start: Thu Sep 24 17:25:00 PDT 2026
- End: Thu Sep 24 17:49:36 PDT 2026 (about 25 min)
- Output: `out/template-case-companion.mp4`. ffprobe reports 960x540, 30/1 fps, 316 frames, 10.533 s.
- Review rounds: 12. Each round rendered stills or pulled frames from the MP4, assembled them into contact sheets or crops, and checked them.

## What was built
- The whole scene is CSS 3D planes under one shared perspective (1100px). There are no image assets: the illustrations are SVG, the phone, panel and cards are DOM, and text uses the system SF font. A small pose library (`src/math.ts`) handles camera transforms, keyframe tracks and projecting local points to world space. That projection is what lets each handoff land exactly on its target plane.
- Beats:
  1. A studio cyc with soft key light. The input panel rises and the prompt types in with an irregular cadence and a caret.
  2. A camera dolly into the Create button. The cursor clicks, the button presses with a glow, the text is swept into the button, and a glowing idea orb comes out of it.
  3. The camera pulls back while the orb arcs in depth into the screen of an incoming phone. The phone has a thick metallic edge. The orb lands with a ring and a spark burst, the image blooms out from the landing point, the skeleton UI resolves into real content, and a "Ready to share" toast appears. Then Share is tapped.
  4. The same image element lifts out of the phone. It is one continuous element with no crossfade. The phone drops away while the image docks into a frosted glass card (backdrop blur, gradient rim, sheen sweep, "Shared" chip). Six related creations fly in around it at different depths, with glossy props and a slow camera orbit.
- Motion blur is temporal sub-frame sampling, where copies of an element are rendered at shutter offsets. It applies to the orb, the phone entrance, the image lift and the related cards' fly-in. The number of copies adapts to screen speed, so nothing is blurred once it comes to rest.

## Issues found and fixed
- The phone was visible from frame 0 and during the close-up. It now starts far off-screen and enters with a softer ease, timed to the camera pull-back.
- The phone entrance composition was cramped because the phone arrived while the camera was still close in. Fixed by retiming the phone and the orb and lowering the orb's arc.
- The first blur pass showed double images, because it used too few samples. Samples are now denser, and a copy is only added once the smear exceeds about 1.5 px.
- Blurred copies of the phone turned the screen grey, because each copy's back layers were painted over the previous copy's face. Now all back layers render first, then all faces.
- During the lift, the image first dipped down with the dropping phone. The lift now starts from the phone-slot pose frozen at the moment the lift begins.
- The glass card body appeared before the image arrived. Its fade is now timed so it forms around the docking image.
- The glass barely read as glass. A test render without backdrop-filter showed the filter works but was too heavy. Blur went from 16 px to 7 px, the fill is thinner, and a coral sphere now sits behind the card corner so the frosting is visible.
- There were overlaps and edge clipping in the final layout: Aurora Keep over the Tide Houses label, Windmill Rise clipped on the left, the Tide Houses card touching the right edge during the orbit, and a sphere over Sky Orchard's like count. Fixed by moving and shrinking the far cards, reducing the orbit to -4° to +3°, and moving the props.
- Frame 0 was an empty backdrop. The panel now starts at 45% opacity, rising.

## Spec items not fully met or worth noting
- "Glass-like" is done with CSS backdrop-filter plus rim and sheen. There is no true refraction.
- The far related cards rest at about 9.5 px text size. They are crisp but small, because they are deliberately the deepest layer.
- No extra deliverables were required, so no audit JSON was produced.
