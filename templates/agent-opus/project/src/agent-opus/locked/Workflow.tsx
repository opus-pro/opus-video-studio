import { chatExpansion, ConversationIntro, RevisionChat } from "../directed/Conversation";
import { previewPlayback, previewFocusWeights } from "../directed/PreviewMotion";
import { handoffPanel, outputHandoff } from "../directed/OutputHandoff";
import template from "../../template";
import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, OffthreadVideo, staticFile } from "remotion";
import samples from "../directed/workflow-wave.json";
const A: React.CSSProperties = { position: "absolute" };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = Easing.bezier(0.38, 0, 0.16, 1);
// Keep every action's start/end frame. Only its velocity distribution changes.
const travel = Easing.bezier(0.64, 0, 0.18, 1);
const unfold = Easing.bezier(0.58, 0, 0.16, 1);
const trim = Easing.bezier(0.78, 0, 0.4, 1);
const q = (f: number, a: number, b: number) => {
  const curve =
    a === 377
      ? unfold
      : [418, 442, 554, 579, 607].includes(a)
        ? travel
        : a === 590
          ? trim
          : ease;
  return curve(clamp((f - a) / (b - a)));
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const serif: React.CSSProperties = {
  fontFamily: "Fraunces",
  fontWeight: 450,
  letterSpacing: "-.045em",
  fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1',
};
const photo = (i: number) => staticFile(template.media.workflowImages[i]);
type Point = { f: number; x: number; y: number };
function track(f: number, points: Point[]) {
  let p = points[0];
  for (const next of points.slice(1)) {
    if (f < next.f) {
      const t = q(f, p.f, next.f);
      return { x: lerp(p.x, next.x, t), y: lerp(p.y, next.y, t) };
    }
    p = next;
  }
  return p;
}
function Cursor({
  x,
  y,
  color,
  opacity = 1,
  click = 0,
}: {
  x: number;
  y: number;
  color: string;
  opacity?: number;
  click?: number;
}) {
  return (
    <div
      style={{
        ...A,
        left: x,
        top: y,
        opacity,
        filter: "drop-shadow(0 5px 4px #35213925)",
        zIndex: 8,
      }}
    >
      {click > 0 && click < 1 && (
        <div
          style={{
            ...A,
            left: -25,
            top: -25,
            width: 50,
            height: 50,
            border: `2px solid ${color}`,
            borderRadius: "50%",
            transform: `scale(${0.3 + click * 1.7})`,
            opacity: 1 - click,
          }}
        />
      )}
      <svg
        width="51"
        height="61"
        viewBox="0 0 51 61"
        style={{ overflow: "visible" }}
      >
        <path
          d="M5 4L45 34L27 37L19 54Z"
          fill={color}
          stroke="white"
          strokeWidth="3.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
function Sketch({ i, draw }: { i: number; draw: number }) {
  return (
    <svg
      viewBox="0 0 500 325"
      style={{ width: "100%", height: "100%", opacity: 0.72 }}
      fill="none"
      stroke="#afa0bb"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id={`draw-${i}`}>
          <rect width={500 * draw} height="325" />
        </clipPath>
      </defs>
      <g clipPath={`url(#draw-${i})`}>
        {i === 0 ? (
          <>
            <path d="M220 65Q250 57 281 65L289 252Q250 263 213 252Z" />
            <ellipse cx="250" cy="64" rx="31" ry="8" />
            <path d="M222 239Q251 246 283 238M244 98L252 207M233 101L240 204M258 98L267 204" />
            <path d="M158 279Q244 263 342 281M191 89L155 101M301 93L337 102" />
          </>
        ) : i === 1 ? (
          <>
            <path d="M209 158Q226 129 248 141Q274 151 258 180Q239 195 213 176Z" />
            <path d="M210 186L177 253L285 253L258 181M219 193L263 214M258 182L292 123M211 186L181 153" />
            <path d="M286 66Q311 60 330 69L333 160Q308 168 286 158Z" />
            <path d="M194 254L181 296M264 254L279 296M155 298H315" />
          </>
        ) : (
          <>
            <path d="M130 215Q189 184 213 170M212 170L246 210L296 180M234 192L210 244L270 275M246 210L301 239L326 293" />
            <circle cx="226" cy="139" r="22" />
            <path d="M143 237H103M160 270H124M144 189H117M299 160L327 115" />
            <path d="M315 80Q336 75 350 82L353 156Q332 164 315 156Z" />
          </>
        )}
      </g>
    </svg>
  );
}

/** The same working document goes from conversation to storyboard, assets, sound and revision.
 * Finished results and output categories are reserved for the next section. */
export function LockedWorkflow({ frame: f }: { frame: number }) {
  const cameraX = 0;
  const handoff = outputHandoff(f - 24);
  const panel = handoffPanel(f - 24);
  const introMorph = chatExpansion(f - 312);
  // Source clock = film frame + 24. Preview focus is fully released before
  // the existing output transition, so the later edit anchors stay untouched.
  const previewFocus = q(f, 610, 621) * (1 - q(f, 686, 698));
  const run = previewPlayback(f);
  const focusWeights = previewFocusWeights(run);
  const previewStarts = [610, 638, 662];
  const playheadOnTrack = 1 - q(f, 686, 698);
  const compact = q(f, 568, 582),
    pullback = q(f, 621, 716);
  const cameraPullback = pullback * (1 - previewFocus);
  const cameraScale = 1 + 0.18 * cameraPullback;
  const boardY = lerp(242, 312, compact),
    cardH = lerp(510, 375, compact),
    imageH = lerp(334, 252, compact);
  const shorten = q(f, 590, 604),
    widths = [500 - shorten * 154, 500, 500].map((width, i) => lerp(width, 343 + 317 * focusWeights[i], previewFocus));
  const xs = [165, 165 + widths[0] + 45, 165 + widths[0] + widths[1] + 90];
  const fills = [q(f, 513, 514), q(f, 522, 530), q(f, 538, 546)];
  const cues = template.copy.storyboardCaptions,
    writeStarts = [466, 479, 492];
  const choose = q(f, 497, 500),
    carry = q(f, 500, 514);
  const dragX = lerp(1980, xs[0], carry),
    dragY = lerp(208, boardY, carry) - Math.sin(Math.PI * carry) * 84;
  const dragW = lerp(330, widths[0], carry),
    dragH = lerp(256, imageH, carry);
  const audio = q(f, 535, 550),
    trackY = lerp(lerp(826, 738, compact), 880, previewFocus),
    trackW = widths.reduce((a, b) => a + b, 0) + 90;
  const playX = xs[0] + trackW * run,
    ghostDrag = choose > 0 && carry < 1;
  const playedFraction = clamp((playX - xs[0]) / trackW);
  const p1 = track(f, [
    { f: 392, x: 590, y: 790 },
    { f: 397, x: 535, y: 656 },
    { f: 400, x: 652, y: 657 },
    { f: 406, x: 1125, y: 657 },
    { f: 413, x: 1653, y: 657 },
    { f: 420, x: 1720, y: 890 },
    { f: 553, x: 1720, y: 890 },
    { f: 568, x: 520, y: 540 },
    { f: 584, x: 661, y: 641 },
    { f: 590, x: 661, y: 641 },
    { f: 604, x: 507, y: 641 },
    { f: 613, x: 630, y: 886 },
  ]);
  const p2 = track(f, [
    { f: 499, x: 2250, y: 355 },
    { f: 514, x: 530, y: 450 },
    { f: 522, x: 988, y: 378 },
    { f: 538, x: 1537, y: 383 },
    { f: 550, x: 1778, y: 804 },
  ]);
  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        overflow: "hidden",
        fontFamily: "Geist",
        color: "#302439",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 15% 80%,#d9edf0aa,transparent 48%),radial-gradient(ellipse at 75% 15%,#e1cef0bb,transparent 54%),radial-gradient(ellipse at 92% 82%,#ffe0cb88,transparent 40%),#f8f4ef",
          opacity: 1 - handoff.background,
        }}
      />
      <AbsoluteFill>
        {f < 464 && <ConversationIntro frame={f - 312} />}
        <div
          style={{
            ...A,
            left: 0,
            top: 0,
            width: 3100,
            height: 1080,
            transform: `translate(${cameraX + cameraPullback * 90}px,${-cameraPullback * 30}px) scale(${cameraScale})`,
            transformOrigin: "960px 540px",
          }}
        >
          {f >= 446 &&
            [0, 1, 2].map((i) => {
              const emerge = q(f, 448 + i * 2, 460 + i * 2),
                filled = fills[i],
                typed = q(f, writeStarts[i], writeStarts[i] + 9);
              const weight = focusWeights[i];
              const previewY = lerp(boardY, 320 - 150 * weight, previewFocus);
              const previewH = lerp(cardH, 360 + 300 * weight, previewFocus);
              const previewImageH = lerp(imageH, 240 + 290 * weight, previewFocus);
              const clip = template.media.workflowPreviewClips[i];
              const clipSeconds = Math.min(clip.endSeconds, clip.startSeconds + Math.max(0, f - previewStarts[i]) / 30 * clip.playbackRate);
              return (
                <div
                  key={i}
                  style={{
                    ...A,
                    left: lerp(205 + i * ((1330 - 90) / 3 + 45), xs[i], introMorph),
                    top: lerp(830, previewY, introMorph),
                    width: lerp((1330 - 90) / 3, widths[i], introMorph),
                    height: lerp(137, previewH, introMorph),
                    borderRadius: 25,
                    background: "#fff",
                    border: "2px solid #fff",
                    boxShadow: "0 17px 47px #63477115",
                    overflow: "hidden",
                    opacity: emerge * (1 - handoff.cards),
                    translate: `0 ${-handoff.cards * 70}px`,
                    scale: 1 - handoff.cards * 0.04,
                  }}
                >
                  <div
                    style={{
                      ...A,
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: previewImageH,
                      overflow: "hidden",
                      background: ["#ece7f0", "#eee9f1", "#ede8f0"][i],
                    }}
                  >
                    <Sketch i={i} draw={q(f, 460 + i * 12, 473 + i * 12)} />
                    {filled > 0 && (
                      <div
                        style={{
                          ...A,
                          inset: 0,
                          clipPath: `inset(0 ${(1 - filled) * 100}% 0 0)`,
                        }}
                      >
                        <Img
                          src={photo([0, 3, 5][i])}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: ["50% 31%", "50% 18%", "50% 20%"][
                              i
                            ],
                          }}
                        />
                      </div>
                    )}
                    {f >= previewStarts[i] && f < 739 && <div style={{...A,inset:0,opacity:q(f,previewStarts[i],previewStarts[i]+4)}}>
                      <Freeze frame={Math.round(clipSeconds * 30)}>
                        <OffthreadVideo muted src={staticFile(clip.file)} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:["50% 31%","50% 18%","50% 20%"][i]}}/>
                      </Freeze>
                    </div>}
                    {f >= 629 && (
                      <div
                        style={{
                          ...A,
                          inset: 0,
                          background: "#47324e",
                          opacity: lerp(run > i / 3 && run < (i + 1) / 3 ? 0 : 0.15, 0.13 * (1-weight), previewFocus),
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      ...A,
                      left: compact * 3 + 28,
                      top: previewImageH + 17,
                      right: 23,
                      overflow: "hidden",
                      height: 145,
                      clipPath: `inset(0 ${(1 - typed) * 100}% 0 0)`,
                    }}
                  >
                    <div style={{fontFamily:"Geist", fontSize: lerp(lerp(28, 23, compact), 20 + 4 * weight, previewFocus), fontWeight: 550, letterSpacing:"-.025em", color:"#9973b0", marginBottom:10}}>Scene {i + 1}</div>
                    <div
                      style={{
                        ...serif,
                        fontSize: lerp(lerp(54, 43, compact), 36 + 16 * weight, previewFocus),
                        lineHeight: 1.05,
                        maxWidth: i === 0 ? 300 : 430,
                      }}
                    >
                      {cues[i]}
                    </div>
                  </div>
                  {i === 0 && f >= 584 && f < 612 && (
                    <div
                      style={{
                        ...A,
                        right: 0,
                        top: 0,
                        height: "100%",
                        width: 11,
                        borderRadius: 10,
                        background: "#9866c4",
                      }}
                    />
                  )}
                </div>
              );
            })}
          {ghostDrag && (
            <div
              style={{
                ...A,
                left: dragX,
                top: dragY,
                width: dragW,
                height: dragH,
                borderRadius: 23,
                overflow: "hidden",
                boxShadow: "0 25px 60px #42214e33",
                transform: `rotate(${-Math.sin(Math.PI * carry) * 3.5}deg)`,
                filter: `blur(${Math.min(4.8, Math.abs(carry - q(f - 1, 500, 514)) * 32)}px)`,
                zIndex: 4,
              }}
            >
              <Img
                src={photo(0)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "50% 31%",
                }}
              />
            </div>
          )}
          {f >= 535 && (
            <div
              style={{
                ...A,
                left: handoff.morph > 0 ? (panel.left - 960 - cameraPullback * 90) / cameraScale + 960 : xs[0],
                top: handoff.morph > 0 ? (panel.top - 540 + cameraPullback * 30) / cameraScale + 540 : trackY,
                width: handoff.morph > 0 ? panel.width / cameraScale : trackW,
                height: handoff.morph > 0 ? panel.height / cameraScale : 108,
                borderRadius: lerp(19, 100 / cameraScale, handoff.morph),
                background: `linear-gradient(110deg,rgb(${lerp(218,255,handoff.morph)},${lerp(200,255,handoff.morph)},${lerp(238,255,handoff.morph)}),rgb(${lerp(218,251,handoff.morph)},${lerp(200,253,handoff.morph)},${lerp(238,253,handoff.morph)}))`,
                opacity: 1 - handoff.prompt,
                border: "2px solid #fff9",
                boxShadow: "0 10px 34px #66407710",
                overflow: "hidden",
                clipPath: `inset(0 ${(1 - audio) * 100}% 0 0)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "14px 23px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: 1 - handoff.waveform,
                }}
              >
                {samples.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      width: 5,
                      borderRadius: 3,
                      height: 8 + Math.sqrt(v) * 62,
                      background: f >= 610 ? (i / samples.length <= playedFraction ? "#754396" : "#b89dcc") : "#9368b4",
                      opacity: 0.75,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {f >= 554 && f < 620 && <RevisionChat frame={f} />}
          {f >= 610 && f < 722 && (
            <>
              <div
                style={{
                  ...A,
                  left: playX,
                  top: lerp(boardY - 22, trackY - 6, playheadOnTrack),
                  width: 4,
                  height: lerp(trackY - boardY + 139, 120, playheadOnTrack),
                  opacity: q(f,610,615) * (1 - handoff.indicator),
                  background: "#8050a6",
                  boxShadow: "0 0 0 1px #fff8",
                }}
              >
                <div
                  style={{
                    ...A,
                    left: -7,
                    top: -2,
                    width: 18,
                    height: 17,
                    borderRadius: "4px 4px 6px 6px",
                    background: "#8050a6",
                  }}
                />
              </div>
              <div
                style={{
                  ...A,
                  left: xs[0] - 65,
                  top: trackY + 30,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 3px 18px #67447f19",
                  display: "grid",
                  placeItems: "center",
                  color: "#8b5daf",
                  opacity: 1 - handoff.indicator,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="currentColor"
                >
                  <path d="M7 5H10V17H7ZM13 5H16V17H13Z" />
                </svg>
              </div>
            </>
          )}
          <Cursor
            {...p1}
            color="#9866c4"
            opacity={
              q(f, 564, 569) * (1 - q(f, 608, 616))
            }
            click={clamp((f - 592) / 9)}
          />
          <Cursor
            {...(ghostDrag
              ? { x: dragX + dragW * 0.72, y: dragY + dragH * 0.57 }
              : p2)}
            color="#f19b65"
            opacity={q(f, 499, 505) * (1 - q(f, 550, 556))}
            click={clamp((f - (f < 522 ? 514 : f < 538 ? 522 : 538)) / 8)}
          />

        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
