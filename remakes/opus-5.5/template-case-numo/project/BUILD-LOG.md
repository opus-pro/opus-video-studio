# BUILD-LOG — template-case-numo (Anomaly to Action)

- Start: Thu Sep 24 17:12:30 PDT 2026
- End:   Thu Sep 24 17:32:28 PDT 2026 (~20 min wall clock)
- Output: `out/template-case-numo.mp4`. ffprobe reports 960x540, 60/1 fps, 612 frames, 10.20 s, h264 yuv420p.
- Review rounds: 8. Each round rendered stills, tiled them into contact sheets with ffmpeg, and checked them by eye, with extra passes on transition boundary frames.

## Structure (global frames @ 60 fps)
| Frames | Beat |
|---|---|
| 0–116 | **Detect.** A dense revenue dashboard: KPI row, a 24h conversion chart with a forecast band, 6 sparklines, a region×hour heatmap and a signals feed. A scan cursor draws the line, and the anomaly point is flagged with pulses and a callout. Everything else dims, and the camera accelerates into the point. |
| 90–186 | **Interstitial 1.** The anomaly dot grows into a full-frame vermilion circle wipe with an oversized "−23.4%" (masked per-character reveal). Then the vermilion plane collapses into the EU-West bar of the next view. |
| 156–304 | **Evidence 01 (Where).** Region delta bars (they re-sort so EU-West rises to the top), step-conversion funnel with a 7-day ghost baseline, and an impact list. |
| 282–366 | **Interstitial 2.** The red Checkout→Paid column expands into a paper full-frame showing an oversized "14:02" and a timeline ruler. It then collapses into the deploy marker line of the next chart. |
| 342–474 | **Evidence 02 (When/Why).** Conversion vs payment-error chart split at the 14:02 marker, a scatter (r = −0.94) with a fit line, and a change log whose deploy row is flagged "Likely cause". |
| 452–532 | **Interstitial 3.** The flagged log row expands (red→mint) into an oversized "Roll back." Then the mint plane collapses into the primary button. |
| 504–611 | **Act.** Recommendation card (title, rationale, 94% confidence, projected recovery). Three supporting-evidence cards are wired to it with drawn connectors and flowing dots. The cursor clicks the button, which goes "Rolling back…" and then "Rollback started". |

Focus is carried by one continuous shape grammar, so the eye never has to re-find the subject: dot → circle → bar → column → plane → marker line → row → plane → button.

## Issues found and fixed during review
1. The S1 chart title overlapped its meta label. The anomaly callout covered the chart line, so I moved it below the line and added a leader line.
2. Morph-rect motion blur was also blurring the interstitial type that entered while the shape was still expanding. I split it into a blurred color layer plus a sharp content layer clipped by the same shape, and reduced the blur gain and cap.
3. T2 "14:02" started entering while the paper plane was still small (a blurred glyph blob inside the rect). I delayed its entry.
4. The T2 and T3 giant type barely rested before exiting. I retimed them (T2 collapse moved 338→344, S3 start 342, marker handoff 366; T3 stagger tightened) so each holds crisp for about 10+ frames. Content cutoffs now come after the last character's exit, so nothing pops.
5. The T3 background arc retracted into a round-capped blob; it now fades instead.
6. The S3 deploy chip collided with the "errors ×9.1" label. I shortened the chip and moved the label.
7. The cursor's resting tip covered the button label; it now rests on the button's right side.
8. The T1 numeral sat off-center, and the "%" was clipped by the character mask: the last glyph's negative tracking plus flex-shrink. Fixed with `flexShrink: 0`, right padding on the mask and an offset container.
9. Frame 0 was too empty. KPI count-ups now start at 86%, the heatmap and sparklines start partly drawn, and small mono labels went from 7.5–8.5 px to 8–9 px.
10. Handoffs between the morph shape and the real UI element apply the scene's drift transform to the target rect, so there is no one-frame jump at 186, 366 or 532.

## Spec deviations / limitations
- None against the numbers: 960x540, 60 fps, 612 frames, composition id unchanged.
- Motion blur is hand-built: a directional SVG gaussian driven by per-frame velocity, plus uniform blur on the final zoom. There is no true multi-sample shutter, because no motion-blur package is installed.
- It uses system fonts only (SF Pro / SF Mono, with Menlo as the fallback). The smallest heatmap axis labels are 8 px. That is legible but dense, which is intended for the "dense data view".
- The paper and mint planes each show about 4–6 frames of empty color between the type exit and the collapse. I left this as a breath.
