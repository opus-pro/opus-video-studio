import React from 'react';
import {AbsoluteFill} from 'remotion';
import {inCubic, inOutCubic, inOutSine, lerp, outCubic, outExpo, prog, push, zoom, type Pt} from './anim';
import {BOLD, GOLD, type Gloss, ITALIC, Line, layout, metrics, PEARL, PEARL_SOFT, ROMAN, textWidth} from './text';

const W = 960;
const CX = W / 2;
const CY = 272; // optical centre (a touch below geometric)

// ---- colour helpers -------------------------------------------------------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};
const mixGloss = (a: Gloss, b: Gloss, k: number): Gloss => a.map(([p, c], i) => [lerp(p, b[i][0], k), mixHex(c, b[i][1], k)]);

const sweep = (t: number, a: number, b: number) => (t < a - 1 || t > b + 1 ? null : lerp(-22, 122, inOutCubic(prog(t, a, b))));

// ---- Scene A -> B: the quiet sentence, then a camera push into "Say less." ----
const T1 = 'Say less.';
const T2 = 'Mean more. Make it matter.';
const S0 = 30;

const SceneAB: React.FC<{t: number}> = ({t}) => {
  const w1 = textWidth(T1, ITALIC, S0);
  const wsp = textWidth(' ', ITALIC, S0);
  const w2 = textWidth(T2, ITALIC, S0);
  const left0 = CX - (w1 + wsp + w2) / 2;
  const base0 = 281;
  const mI = metrics(ITALIC);
  const SB = Math.min(186, 800 / layout(T1, ITALIC).width);
  const baseB = CY + ((mI.capH - 0.22) * SB) / 2;
  const s1 = SB / S0;
  const p0: Pt = {x: left0 + w1 / 2, y: base0};
  const p1: Pt = {x: CX + 12, y: baseB}; // optical: italic advance widths sit left
  // zoom centre that carries p0 onto p1 while scaling by s1 (a true camera push)
  const Z1: Pt = {x: (p1.x - p0.x * s1) / (1 - s1), y: (p1.y - p0.y * s1) / (1 - s1)};
  const e = push(prog(t, 57, 93));
  const s = Math.pow(s1, e); // exponential => constant perceived zoom speed
  const drift = 1 + 0.022 * inOutSine(prog(t, 92, 136));
  const kx = inCubic(prog(t, 128, 147));
  const through = Math.pow(2.4, kx);
  const Z2: Pt = {x: CX, y: CY};
  const map = (p: Pt) => zoom(zoom(p, Z1, s), Z2, drift * through);
  const size = S0 * s * drift * through;

  const enter = (w: number) => {
    const st = -10 + w * 3.6;
    const k = outExpo(prog(t, st, st + 24));
    return {opacity: outCubic(prog(t, st, st + 16)), dy: (1 - k) * 12, blur: (1 - k) * 5};
  };
  const cB = map(p0);
  const cR = map({x: left0 + w1 + wsp, y: base0});
  const restFade = 1 - inOutSine(prog(t, 58, 80));
  const outB = 1 - inOutCubic(prog(t, 130, 145));
  const glossB = mixGloss(PEARL_SOFT, PEARL, outCubic(prog(t, 62, 90)));
  // hairline under the sentence rides the same camera
  const hl = map({x: CX, y: base0 + 22});
  const hlW = 56 * outExpo(prog(t, 12, 44)) * s;
  const hlO = (1 - outCubic(prog(t, 54, 66))) * 0.8;

  return (
    <AbsoluteFill>
      {hlO > 0.001 && hlW > 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: hl.x - hlW / 2,
            top: hl.y,
            width: hlW,
            height: 1,
            opacity: hlO,
            background: 'linear-gradient(90deg, rgba(214,186,138,0), rgba(214,186,138,0.9) 50%, rgba(214,186,138,0))',
          }}
        />
      )}
      <Line
        text={T2}
        font={ITALIC}
        size={size}
        x={cR.x}
        baseline={cR.y}
        align="left"
        gloss={PEARL_SOFT}
        opacity={restFade * 0.92}
        blur={Math.min(14, (s - 1) * 2.2)}
        shadow={0.6}
        wordOffset={2}
        letterFx={(_, w) => enter(w)}
      />
      <Line
        text={T1}
        font={ITALIC}
        size={size}
        x={cB.x}
        baseline={cB.y}
        gloss={glossB}
        sheen={sweep(t, 84, 126)}
        opacity={outB * lerp(0.92, 1, e)}
        blur={16 * Math.pow(kx, 1.6)}
        glow={`rgba(255,214,168,${(0.1 * outCubic(prog(t, 93, 112)) * (1 - inOutSine(prog(t, 114, 126)))).toFixed(3)})`}
        letterFx={(_, w) => enter(w)}
      />
    </AbsoluteFill>
  );
};

// ---- Scene C: "Mean / more." rises out of the push-through --------------------
const SceneC: React.FC<{t: number}> = ({t}) => {
  const mR = metrics(ROMAN);
  const mI = metrics(ITALIC);
  const SC = Math.min(212, 470 / Math.max(layout('Mean', ROMAN).width, layout('more.', ITALIC).width));
  const gap = 0.16 * SC;
  const b1 = (2 * CY - gap - mI.xH * SC + mR.capH * SC) / 2;
  const b2 = b1 + gap + mI.xH * SC;
  const off = 0.46 * SC;
  const sC = lerp(0.8, 1, outExpo(prog(t, 142, 182))) * (1 + 0.02 * inOutSine(prog(t, 180, 206)));
  const Z: Pt = {x: CX, y: CY};
  const a1 = zoom({x: CX + 14 - off, y: b1}, Z, sC);
  const a2 = zoom({x: CX + 14 + off, y: b2}, Z, sC);
  const size = SC * sC;
  const eX = inOutCubic(prog(t, 196, 214));
  const outO = 1 - inOutCubic(prog(t, 199, 212));
  const fx = (j: number) => {
    const st = 143 + j * 1.8;
    const k = outExpo(prog(t, st, st + 26));
    return {opacity: outCubic(prog(t, st, st + 14)), dy: (1 - k) * 0.32 * size, blur: (1 - k) * 10};
  };
  const glow = `rgba(255,214,168,${(0.09 * outCubic(prog(t, 167, 184)) * (1 - inOutSine(prog(t, 186, 194)))).toFixed(3)})`;
  return (
    <AbsoluteFill>
      <Line
        text="Mean"
        font={ROMAN}
        size={size}
        x={a1.x - 520 * eX}
        baseline={a1.y}
        tracking={-0.01}
        gloss={PEARL}
        sheen={sweep(t, 166, 204)}
        opacity={outO}
        blur={7 * eX}
        glow={glow}
        letterFx={(i) => fx(i)}
      />
      <Line
        text="more."
        font={ITALIC}
        size={size}
        x={a2.x + 520 * eX}
        baseline={a2.y}
        gloss={PEARL}
        sheen={sweep(t, 170, 208)}
        opacity={outO}
        blur={7 * eX}
        glow={glow}
        letterFx={(i) => fx(i + 4)}
      />
    </AbsoluteFill>
  );
};

// ---- Scene D: bold closing ---------------------------------------------------
const SceneD: React.FC<{t: number}> = ({t}) => {
  const mB = metrics(BOLD);
  const mI = metrics(ITALIC);
  const SD = Math.min(236, 760 / layout('matter.', BOLD).width);
  const SK = 50;
  const gap = 0.2 * SD;
  // block from kicker cap top to main baseline, centred on CY
  const bK = (2 * CY + mI.capH * SK - gap - mB.capH * SD) / 2;
  const bD = bK + gap + mB.capH * SD;
  const land = outExpo(prog(t, 205, 243));
  const sD = lerp(1.24, 1, land) * (1 + 0.012 * inOutSine(prog(t, 242, 270)));
  const Z: Pt = {x: CX, y: CY + 30};
  const aD = zoom({x: CX + 3, y: bD}, Z, sD);
  const aK = zoom({x: CX, y: bK}, Z, sD);
  const size = SD * sD;
  const sizeK = SK * sD;
  const n = 'matter.'.length;
  const fxD = (i: number) => {
    const d = Math.abs(i - (n - 1) / 2);
    const st = 206 + d * 1.7;
    const k = outExpo(prog(t, st, st + 26));
    return {opacity: outCubic(prog(t, st, st + 14)), blur: (1 - k) * 14};
  };
  const kK = outExpo(prog(t, 214, 244));
  const oK = outCubic(prog(t, 214, 232));
  const kickW = textWidth('Make it', ITALIC, sizeK);
  const ruleY = aK.y - mI.xH * sizeK * 0.5;
  const ruleL = 58 * outExpo(prog(t, 224, 254));
  const ruleGap = 18;
  const glowA = 0.16 * outCubic(prog(t, 231, 256));
  return (
    <AbsoluteFill>
      {ruleL > 0.5 &&
        [-1, 1].map((dir) => (
          <div
            key={dir}
            style={{
              position: 'absolute',
              top: ruleY,
              height: 1,
              width: ruleL,
              left: dir < 0 ? CX - kickW / 2 - ruleGap - ruleL : CX + kickW / 2 + ruleGap,
              background: `linear-gradient(${dir < 0 ? 270 : 90}deg, rgba(214,186,138,0.85), rgba(214,186,138,0))`,
              opacity: oK,
            }}
          />
        ))}
      <Line
        text="Make it"
        font={ITALIC}
        size={sizeK}
        x={aK.x}
        baseline={aK.y + (1 - kK) * 16}
        gloss={PEARL_SOFT}
        opacity={oK}
        blur={(1 - kK) * 6}
        shadow={0.7}
      />
      <Line
        text="matter."
        font={BOLD}
        size={size}
        x={aD.x}
        baseline={aD.y}
        tracking={-0.012}
        gloss={GOLD}
        sheen={sweep(t, 234, 266)}
        sheenStrength={0.9}
        glow={`rgba(255,196,120,${glowA.toFixed(3)})`}
        letterFx={(i) => fxD(i)}
      />
    </AbsoluteFill>
  );
};

export const Typography: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    {t < 148 && <SceneAB t={t} />}
    {t >= 140 && t < 216 && <SceneC t={t} />}
    {t >= 202 && <SceneD t={t} />}
  </AbsoluteFill>
);
