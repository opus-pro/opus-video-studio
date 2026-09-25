# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1200x1200, 60 fps, 288 frames. This must be true Three.js space using ThreeCanvas, PerspectiveCamera and equal 2.7x3.5 PlaneGeometry meshes whose scale is always (1,1,1). Camera (0,0,10), fov 40. Put the four editorial poster textures on the loop x=2.9*sin(theta)/sqrt(2), y=2.9*sin(theta)/sqrt(2), z=-1+2.6*cos(theta), theta=i*PI/2-phase. Keep cards as camera-facing billboards; depthTest/depthWrite alone controls occlusion. Advance phase over .9-1.54s, 2.05-2.69s and 3.2-3.84s with cubic-bezier(.22,.85,.2,1). Finish on card four. Deliver spatial-audit.json with geometry, scale, world positions, camera depth and projected bounds at 0/1/2/3/4s.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
