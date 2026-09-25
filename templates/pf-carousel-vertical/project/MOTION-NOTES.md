# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1200x1200, 60 fps, 288 frames. Use the same four 560x720 editorial posters and colors as Horizontal Portfolio Relay, but arrange their centers vertically 690px apart. The hero is scale 1 and side items .78. Start with card one visible; move the group down one slot at .9-1.54s, 2.05-2.69s and 3.2-3.84s. Use cubic-bezier(.22,.85,.2,1), no 3D tilt, and local motion blur that peaks at 5px and clears by 85% of each move. Hold card four through the end.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
