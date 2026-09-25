# BUILD-LOG — pf-camera-campaign

- Start: Thu Sep 24 16:47:17 PDT 2026
- End: Thu Sep 24 17:03:54 PDT 2026 (~17 min)
- Review rounds: 8. Each round rendered stills or contact sheets and I looked at them; the last check pulled frames and per-frame luma from the final MP4.

## Output

`out/pf-camera-campaign.mp4`: h264, yuv420p, 1080x1920, 60/1 fps, 252 frames, 4.200 s (checked with ffprobe `-count_frames`).

## Structure (`src/`)

- `index.tsx`: registers `pf-camera-campaign` (1080x1920, 60 fps, 252 frames).
- `timeline.ts`: all beats, geometry constants, easings, per-shot crop and focus-frame centres.
- `Photos.tsx`: the silver wide, close and detail shots, full bleed (cover, horizontal crop only). Each shot has its own transform: a lean-in on the viewfinder, a punch-and-settle on each burst frame with a 2-frame zoom smear, and a 1 → 1.014 push-in on the final hold with a light grade.
- `CameraChrome.tsx`:
  - Top bar, 140px: flash AUTO, ISO / shutter / aperture, RAW.
  - Bottom bar, 300px: PHOTO label, a 104px shutter that is pressed just before the flash, a thumbnail of the latest capture, and a lens-flip button.
  - Rule-of-thirds grid over the viewfinder area only.
  - 420x340 corner focus frame. It acquires and locks on the face, and re-locks on every cut (on the near eye for the detail shot).
- `Flash.tsx`: the single flash.
- `Copy.tsx`: masked line reveals that sharpen as they land, plus soft top and bottom scrims.
- `LightSweep.tsx`: one faint soft-light band that crosses the hold once ("different light").
- `font.ts`: loads Geist VF with `delayRender`.

## Timing (frames @ 60 fps)

| Beat | Frames | Seconds |
|---|---|---|
| Camera UI over wide shot | 0–41 | 0–0.68 |
| Flash (measured luma, MP4) | 41–45; frame 40 and 46 are clean | 0.683–0.75, inside .68–.76 |
| Burst: close | 42 (cut under the flash peak) | 0.70 |
| Burst: detail | 57 | 0.95 |
| Burst: wide | 73 | 1.22 |
| Settle on close | 89 | 1.483 |
| Grid and focus frame fade | 86–96 | |
| Top bar retracts | 88–100 | |
| Bottom bar retracts | 90–102; chrome unmounted from 102 (1.70 s) | before 1.72 |
| Copy reveals | 100–168 | |
| Hold | to 251, image scale 1 → 1.014 | |

## Copy placement (final close frame)

- **SERA** (top-left) and **OPTICAL COLLECTION 01** (top-right) sit over the hair and background. They are about 250px above the glasses.
- **SILVER CONTOUR**, **"See in a / different light."** and **SERA.STUDIO** form one column at x=492 on the sweater. It is clear of the hand, fingers and wrist by about 80–110px, and clear of the shoulder by about 100px.
- Nothing sits on the eyes, glasses, fingers or joints.
- Text lives on its own layer and is never scaled with the push-in. At rest it has no transform, blur or clipping mask, so it stays crisp in the MP4.

## Issues found and fixed during review

1. **Detail-shot focus frame:** it sat on the nose bridge. I moved it onto the near eye so it reads as eye-AF.
2. **Headline shadow:** the reveal mask would clip the headline's soft shadow at rest. The mask now switches to `overflow: visible` once a line has landed.
3. **Legibility and depth:** added a subtle text shadow and top/bottom scrims. The white copy now reads cleanly on the mid-grey sweater.
4. **Final shot looked like a camera still:** added a gentle grade (contrast +6%, saturation −8%) that eases in with the settle, so the last shot reads as the campaign image rather than the camera preview.
5. **Bar exit:** I staggered it (top leads by two frames) and added a growing blur, so the chrome retracts instead of vanishing.
6. **Headline column:** checked it against the wrist and shoulder with a gridded crop. There was enough clearance, so it stayed where it was.

## Deviations and notes

- No deviations from the numeric spec that I know of.
- Two of about eight full renders exited with an opaque renderer error ("chunk: null"). Re-running the unchanged script succeeded every time, and I could not reproduce the failure, including after deleting the output first. It looks like transient contention on the machine, not something in the composition.
- The spec asked for no extra deliverable, so there is no `spatial-audit.json`.
