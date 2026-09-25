# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1350x1350, 60 fps, 288 frames. On #f0aca2 keep FIELD FORUM and footer information fixed. Set DESIGN / IN MOTION / OCTOBER 24 in a stable three-line layout. Use mountains.jpg in the lower half, downsample to 180 columns and apply a fixed 4x4 Bayer threshold to form a two-color coral/deep-green dither with deterministic 4-7px marks. Reveal the title through a 42px deterministic grid mask over 0-1.05s; once a cell appears it stays. At 1.6-2.25s replace only IN MOTION with IN THE OPEN using the same mask. Move the dither crop just 5% for parallax; never randomize per frame.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
