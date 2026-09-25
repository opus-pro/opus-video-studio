# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1920x1080, 60 fps, 336 frames. Start with five 72px color points at y540. Between .7-1.45s morph them continuously into a 1760x920 five-panel FIELD identity board with 12px seams and no rounded floating cards. Panels: moving monochrome mark pattern; coast photo with caption; coral hero mark; dark wordmark/tagline; and three labeled color bands. Reveal contents in A/C/B/E/D order. Keep a pattern drift, photo push-in, one 90deg mark turn, two staggered text lines, and three staggered bands so the result remains alive rather than becoming a slide.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
