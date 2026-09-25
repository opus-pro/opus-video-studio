# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1920x1080, 60 fps, 216 frames. Fill the frame with six 180px horizontal bands: #173f36, #cfeb8d, #f58870, #c8dfea, #f8f8f5, #1c2421, labeled 01-06 and PINE/LIME/CORAL/AIR/CHALK/INK. Slide each full-width band into x0 with .075s staggering and cubic-bezier(.5,0,0,1); begin with the first two partially visible. Reveal FIELD and "A fresh perspective." across the middle. From 1.8-2.45s push the right half of every band left in 180px steps while the brand shifts 96px and settles at scale .9.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
