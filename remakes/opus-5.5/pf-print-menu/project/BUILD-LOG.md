# BUILD-LOG: pf-print-menu

- Start: Thu Sep 24 16:51:28 PDT 2026
- End: Thu Sep 24 17:06:16 PDT 2026 (about 15 minutes)
- Review rounds: 6 (5 still/contact-sheet rounds, then 1 round on frames pulled from the final MP4)
- Output: `out/pf-print-menu.mp4`. ffprobe reports h264, yuv420p, 1080x1080, 60/1 fps, 336 frames.

## What was built
- `src/index.tsx` registers `pf-print-menu` (1080x1080, 60 fps, 336 frames).
- `src/motion.ts` holds the timing and relay math. The intro is frames 0-33, so the first print is at rest by 0.55s. The relays run over frames 90-132 (1.5-2.2s) and 192-234 (3.2-3.9s).
- `src/PrintMenu.tsx` holds the layout, the framed print and the relayed layers. `src/font.ts` loads GeistVF with delayRender.
- The background is flat #d0e88b. These elements never move: FIELD PRINTS, 2026 EDITION, Format, Paper, the URL (fieldprints.co) and $32. The price is baseline-aligned to the print's bottom edge; the spec column is aligned to its top edge.
- Each print is 440x560 overall: a black frame, a bevelled mat, a photo window, a glazing sheen and a layered green-tinted drop shadow. Prints are centred on (650,620).
- The titles are two rows at 112px: row 1 in weight 720, row 2 in weight 300. They are left-aligned with the print's left edge.
- Travel directions oppose each other: products move leftward, word row 1 moves rightward and word row 2 moves leftward. Row 2 starts 6 frames after row 1 inside each window.
- Blur follows travel speed. A point-symmetric ease is used, so speed peaks exactly on the middle frame of each relay. I checked the values numerically: text blur peaks at exactly 4px and photo blur at exactly 3px.
- Scale-X stretches up to 1.035 at top speed, then settles through a bounded overshoot (minimum 0.985) and lands on exactly 1. The limits are clamped to [0.975, 1.05].
- At rest there is no transform and no filter, so text renders crisp. Print 3 holds from frame 234 to the end.

## Issues found and fixed
1. **Titles clipped at the frame edge.** Row text placed at x=58 was pushed past the canvas edge during leftward travel. I moved the title block onto the print column (x=430), which leaves room to travel both ways.
2. **Title crowded the spec column.** Titles sat too close to the spec column, so I tightened the header, rule and title spacing.
3. **Leaving print ran into the spec text.** It came within reach of the spec text while fading. I cut the travel to 170px and brought the fade-out forward; the closest visible edge is now 312px, and the spec text ends at about 278px.
4. **Mid-relay double exposure.** The arriving print was translucent on top of the leaving one. I reversed the stacking so the leaving print dissolves on top and the arriving one lies solid beneath, like a deck of prints.
5. **Unreadable word overlap mid-relay.** I staggered the fades so the handoff is clean and blurred, and added a shadow lift that grows while a print moves.
6. **Photo trimming and price alignment.** I trimmed a dark strip at the bottom edge of desert.jpg with a 3% crop, and moved the price so its baseline sits on the print's bottom edge.

## Spec deviations / notes
- Blur runs along the travel axis: an SVG feGaussianBlur with stdDeviation "b, 0.12b", where b is the peak value (4px text, 3px photo). It is not an isotropic CSS blur. I chose this so it reads as motion blur.
- For the fixed copy the spec gave only item names, so I wrote the values: "11 × 14 in, framed", "Cotton rag, 310 gsm", fieldprints.co.
- I added a small "01 / 03" plate index in the footer that relays with the prints. The spec did not ask for it.
- At frame 0 only the fixed chrome is visible. The first print and titles enter over the next 33 frames.
