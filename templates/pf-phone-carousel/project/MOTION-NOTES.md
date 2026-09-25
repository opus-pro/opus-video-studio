# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1440x1080, 60 fps, 288 frames. On #eff2ed build three editable 330x720 black phone frames with FIELD hiking screens. Put the center phone at (720,540), side phones at x230/x1210 and scale .78. Screens show three distinct route positions. Open the stack by .5s. Shift all devices one slot left at 1-1.65s and 2.3-2.95s with curve (.8,0,.5,1.18), maximum 24px overshoot and blur 0-4-0. Only recycle an offscreen phone after it fully exits. At 3.4-3.95s move side phones out 25px and settle the hero at 1.03.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
