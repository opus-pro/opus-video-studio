# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1920x1080, 60 fps, 348 frames. Use ThreeCanvas and PerspectiveCamera(0,0,12), fov48. Twelve equal 2x2 PlaneGeometry image cards keep scale (1,1,1) and cycle coast/forest/desert/mountains textures. For u=fract(i/12+travel), set z=-22+31*u, angle=2*PI*(1.5*u+i/12)+.3*(travel/.1), x=3.8*cos(angle), y=3.8*sin(angle). Ease travel from 0 to .46 over 0-4.6s and hold; recycle only once a near card has fully left frame. Center fixed "A wider / perspective." and FIELD NOTES, then replace with "Find your / perspective." at 3.7-4.35s. Protect the text with a softly feathered local opacity reduction, never a rectangle. Deliver spatial-audit.json.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
