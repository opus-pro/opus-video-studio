# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1920x1080, 60 fps, 216 frames. Background #151719. Build a coral four-capsule radial mark inside a 384px cool-white app tile. At 0-.5s the visible tile settles from scale .64, -12deg and 10px blur; stagger the four petals by .035s. Hold, then from 1.1-1.8s move the tile center from y540 to y370 while scaling to .52 with cubic-bezier(0,0,0,1). Reveal FORM at 144px and the 32px tagline "Make room for ideas." from below with velocity-linked blur. Hold the precise, sharp lockup through frame 215.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
