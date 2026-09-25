# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1200x1200, 60 fps, 276 frames. Keep hand-phone.png fixed full-frame. Precisely mask editable app UI inside the photographed screen boundary x438..793, y187..936 in the 1254px source, scaled to canvas; cover the original green without covering the black bezel or hand. Build a FIELD hiking app with fixed status/header/bottom navigation and a scrollable body using coast, forest and mountain routes. Scroll body 0 to -420 logical px at .45-1.45s, then to -620 at 2.05-2.8s, then back to -100 at 2.9-3.75s. Apply at most 1.2px blur only to moving content.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
