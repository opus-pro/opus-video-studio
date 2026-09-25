# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1920x1080, 60 fps, 336 frames. Build a deterministic full-frame low-frequency procedural color field from coral #ff7f73, ice blue #b6dcee, deep green #144b41 and near-white #f2f7ef. Use broad continuous bands, no orbs, bokeh, gradients loaded from files, or random flicker. Drift the field 160px over the film with grain <=2%. Reveal FIELD and two supporting lines by .6s. At 1.5-2.2s use a widening rectangular mask to turn the hero into FIELD/STUDIO while support copy moves down and scales smaller. At 2.75-3.4s replace line two with "Launching October 24." Add FIELD.STUDIO near the bottom and hold type independently of the moving field.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
