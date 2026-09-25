# Motion reference

Adapt the supplied implementation. The following describes its original visual intent and example content; it does not authorize replacing the source with a fresh implementation.

## Composition
1200x1200, 60 fps, 288 frames. On #ebeeeb, create four 560x720 editorial posters with an image top (538px) and solid 182px footer. Use coast.jpg, forest.jpg, desert.jpg and mountains.jpg with footer colors #cce789, #184c3a, #f4876e and #dae5ef. Titles: "Along the coast.", "Into the green.", "A little further.", "Above it all." Keep the hero at (600,600), neighbors 690px apart, scale 1 versus .78. Start with poster one visible. Advance at .9-1.54s, 2.05-2.69s and 3.2-3.84s using cubic-bezier(.22,.85,.2,1), motion blur peaking at 5px and fully clearing before each settle.

## Verification
Render the real composition, inspect the first frame, every transition boundary and the final hold, and compare decoded MP4 frames with source PNG frames for color and structural integrity. Return the editable source, preview.mp4, poster image and a short render report. The preview must be produced by this prompt and these declared assets only.
