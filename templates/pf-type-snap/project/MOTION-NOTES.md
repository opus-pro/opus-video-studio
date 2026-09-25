# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1080x1350, 60 fps, 288 frames. On #181b1c keep FIELD DAYS and OCT 24-25 / SAN FRANCISCO fixed. Use three 160px rows. Stagger complete words MAKE / SOMETHING / MATTER. from x+1400 during 0-.8s with curve (.18,.9,.24,1.13), max 24px overshoot, scaleX 1 and blur clearing at rest; accent MATTER. #c9ef8a. At 1.85-2.35s move set one left while IDEAS / INTO / ACTION. enters from the right with .07s row staggering. Mask the row region so both phrases never remain superimposed. Hold ACTION. in accent color.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
