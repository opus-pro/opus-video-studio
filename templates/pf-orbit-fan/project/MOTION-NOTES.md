# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1440x1080, 60 fps, 288 frames. Ground seven 340x500 poster cards on an offscreen pivot at (720,1500), radius 940, angles j*17deg for j=-3..3. Use full-bleed photos with 180px colored footers. Open the fan from j*4deg to j*17deg in .6s. Rotate one 17deg position at .9-1.65s and again at 2-2.75s, using a fast decelerating curve and blur 0-3-0. At 3.1-3.65s scale the selected center card to 1.12 while others yield another 5deg. Include only a faint ground shadow, no stage or canvas headline.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
