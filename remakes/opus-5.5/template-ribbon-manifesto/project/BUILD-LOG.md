# BUILD-LOG: template-ribbon-manifesto

- Start: Thu Sep 24 17:06:20 PDT 2026
- End: Thu Sep 24 17:19:21 PDT 2026
- Output: `out/template-ribbon-manifesto.mp4`. ffprobe reports 960x540, 30/1 fps, 240 frames, h264 yuv420p.
- Review rounds: 5 (stills, contact sheets and frames pulled from the MP4 with ffmpeg)

## Implementation
- `src/RibbonManifesto.tsx`: the composition (ribbons, closing, footer). `src/motion.ts`: easings E and S plus the brake integral. `src/measure.ts`: canvas text measurement and one-line fitting.
- Default phrases are "Be heard", "Make noise", "Move people". I chose them so their Arial Bold 87px widths (372.3, 469.0, 526.9 px measured) plus 52 land on the spec's 424/522/580. For the default phrases the spec widths are used exactly. An edited phrase gets measured width + 52, capped at 780, and its type shrinks toward 44px if needed.
- Each text train is a function of the frame: offset = remaining travel. This is constant speed until the row's brake starts at 96/99/102, then an 18-frame brake with v = v0·(1−E(p)), integrated with Simpson's rule. The hero copy lands exactly on center at zero velocity with no phase snap. I checked this numerically: velocity is continuous and the final offset is 0.000. Repeats are generated with index k over the covered span at period textW+82, so no gap can appear.
- Rotation to 0 and the y move to 133/254/375 use S over the same staggered windows (rows end at 114/117/120). The crop runs f108–128 with E. Height goes 102→104 and leftover repeats fade over f120–128. The middle ribbon has the highest z.
- E = bezier(0.3,1,0.6,1) (strong ease-out). S = bezier(0.65,0,0.35,1) (in-out).
- Closing is Georgia bold 78/90 fitted to 810px (min 42), centered in (75,210,810,108). The footer is SVG: the brand is Arial bold 18 at x=96, sharing baseline 490 with the CTA, so its em-box top is about 473.7. The CTA is Arial 15, text-anchor end at 838, baseline 490. The stroked arrow runs from x=853 to 867.

## Issues found and fixed
1. The first easing (quint-out) made the crop snap in about 4 frames and the text brake feel abrupt. I softened E so the crop reads over roughly 10 frames.
2. During the crop, thin hairline slivers of the neighboring repeats flashed at the label edges (around f115–118). A repeat that is cropped below 64px of visible width now dissolves with a smoothstep. The spec's f120–128 leftover fade is still applied on top of that.
3. Frame 0 was too faint. Entrance opacity now starts at 0.5, so f0 already shows the blurred, moving colored bands. It reaches 1 at f5.
4. Polish: the exit adds a soft blur that grows to 2.4px while each label lifts and fades. The closing's full stop is set in the ribbon vermilion to tie the serif sign-off back to the bands.

## Spec notes / deviations
- Brand position "(96,473)" is treated as the text's top-left, with the baseline aligned to the CTA at 490. The em-box top lands at about 473.7, not exactly 473.
- Rotation and y re-orientation use the per-row staggered windows (96/99/102 + 18 frames), all inside f96–120.
- Because E is an ease-out, the leftover repeats have already left the crop before f120. That makes the specified f120–128 fade technically present but invisible. The sliver dissolve described above is what you actually see.
- The exit blur and the vermilion full stop are additions that the spec does not mention.
