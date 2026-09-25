# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1920x1080, 60 fps, 360 frames. Use ThreeCanvas with a fixed PerspectiveCamera(0,0,12), fov54. Ten equal 1.75x2.15 PlaneGeometry cards must keep scale (1,1,1). Place them on local ellipse (7.9*cos(theta),4.6*sin(theta),0), rotate the orbit 50deg about world X and -8deg about world Z, and keep every plane facing the camera. Center the fixed text "SELECTED / FIELD NOTES". Unfold from a flat row during 0-.8s, orbit phase to PI/2 then PI during .9-2.8s, pause, then from 3.2-4.45s move the coast card to (0,0,11.1) while all others recede to z=-12. Its near-camera size must come only from perspective. Add final white copy over the full-frame image and deliver spatial-audit.json.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
