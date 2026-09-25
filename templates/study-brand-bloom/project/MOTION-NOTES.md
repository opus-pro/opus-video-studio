# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Editable defaults
```json
{"brand":"forma","background":"#faf8fa","ink":"#28232c","accent":"#ad3870","symbol":{"construction":"four-capsule-union","diameter":130,"capsuleWidth":30},"showWordmark":false}
```
## Eight-petal symbol: complete geometry
The mark is a solid union of four identical capsules, with no central hole, outline, gradient or separate petal gaps. In a 130x130 SVG viewBox, center is (65,65). Draw a rounded rectangle x=0, y=50, width=130, height=30, rx=15, ry=15, then identical copies rotated 45, 90 and 135 degrees around (65,65), all the same fill. Equivalent construction: four centerline segments of length 100 centered at the origin with a round stroke of width 30, at those four angles. Their union has eight round-ended lobes and a filled middle. Keep the top lobe pointing straight up in the final frame. Scale the whole union uniformly to the specified size. All geometry is authored from these numbers; no logo asset is needed.

## Layout and timing
Only one flat eight-petal symbol appears, center (480,270), final size130x130. The brand prop is editable metadata but is not visible in this variant. The mark fill is ink throughout; the magenta accent is available as an editable color but is not a visible decoration.
f0: scale .12, rotation -95 degrees, opacity1 and blur7px. f0-19: scale to1 with E; rotate -95 to0 degrees with E, settling angle by f21. Fade blur7 to0 during f0-15. All four capsules move as one solid object. This is a brisk expanding bloom, without separating petals or changing the silhouette. No overshoot above scale1.02; use exact scale1 from f22 onward.
f22-65: completely stationary, crystal-clear hold of the130px symbol. Its bounds are (415,205,130,130). The frame is otherwise empty.
## Acceptance
The motion is concentrated in the first0.7 seconds, followed by a calm1.5-second hold. No text, borders, glow, shadows, particles or new shapes. No generated or external asset is required.

