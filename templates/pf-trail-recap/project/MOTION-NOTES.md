# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1080x1350, 60 fps, 324 frames. Use mountains.jpg full bleed with a dark lower gradient. Draw a light-green route from (150,850) through (340,520), (620,680) to (850,260) while the image decelerates from scale 1.13 to 1.03. Reveal "Trail / complete." at 124px, then move it upward and reduce to 80px. From 2-2.75s reveal a borderless 2x2 metric grid: Distance 12.4 km, Time 1:24:36, Elevation 680 m, Pace 6:49 /km. Count only distance, draw three faint track outlines, then hold a readable result. Mark numbers as fictional sample data.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
