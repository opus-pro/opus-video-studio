import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { TypeFilm } from './TypePrelude';
import { Mark } from './Brand';
const paper = '#eeeee9', ink = '#1c2222', blue = '#4c67e8';
const abs: React.CSSProperties = { position: 'absolute' };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const travel = Easing.bezier(.7, 0, .2, 1);
const arrive = Easing.bezier(.16, 1, .3, 1);
const p = (t: number, a: number, b: number, e = travel) => e(clamp((t - a) / (b - a)));
const mix = (a: number, b: number, q: number) => a + (b - a) * q;
const rgb = (a: number[], b: number[], q: number) => 'rgb(' + a.map((v, i) => Math.round(mix(v, b[i], q))).join(',') + ')';
const fonts = "@font-face{font-family:Geist;src:url('" + staticFile('GeistVF.woff2') + "') format('woff2');font-weight:100 900}*{box-sizing:border-box}";
function Pointer({ t }: {
    t: number;
}) {
    const q = p(t, 12.3, 12.6, arrive);
    return <svg width={30} height={36} viewBox="0 0 30 36" style={{ ...abs, left: mix(1830, 1640, q), top: mix(1040, 964, q), opacity: 1 - p(t, 12.9, 13.1), transform: 'scale(' + (1 - .13 * Math.sin(Math.PI * clamp((t - 12.65) / .15))) + ')', transformOrigin: '0 0' }}>
    <path d="M3 2L26 23L15 24L11 32Z" fill={blue} stroke="white" strokeWidth={1.6}/>
  </svg>;
}
function Relay({ t }: {
    t: number;
}) {
    const words = ['Make.', 'It.', 'Yours.'];
    const at = t < 16.75 ? 16 + Math.floor((t - 16) / .25) * .25 : 16.75;
    const word = t < 16.75 ? words[Math.min(2, Math.floor((t - 16) / .25))] : 'Make it yours.';
    const q = p(t, at, at + .105, arrive);
    const i = Math.floor((t - 16) / .25);
    return <div style={{ ...abs, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <div style={{ fontFamily: i === 1 ? 'Georgia' : 'Geist', fontStyle: i === 1 ? 'italic' : 'normal', fontWeight: t >= 16.75 ? 430 : 600, fontSize: t >= 16.75 ? 116 : 236, letterSpacing: t >= 16.75 ? -6 : -12, lineHeight: 1.2, padding: '25px 35px', color: i === 2 ? blue : ink, transform: 'translateY(' + (1 - q) * 12 + 'px)', filter: 'blur(' + ((1 - q) * 2) + 'px)' }}>{word}</div>
  </div>;
}
// Global timing lives on the original 60 fps clock; no timewarps or variable playback speed.
export function FastFinale({ start = 12.5 }: {
    start?: number;
}) {
    const t = useCurrentFrame() / 60 + start;
    const out = p(t, 12.75, 13.5);
    const portrait = p(t, 13.5, 13.72);
    const square = p(t, 14, 14.22);
    const focus = p(t, 14.5, 14.78);
    const late = t >= 16;
    const band = late ? p(t, 17, 17.5) : 0;
    const line = p(t, 18, 18.35);
    const w = late ? mix(680, 1920, band) : mix(1060, 600, portrait) + 150 * square;
    const h = late ? mix(0, 210, p(t, 17, 17.23)) * (1 - line) + 2 * line : mix(660, 750, portrait);
    const zAt = (at: number) => mix(mix(1.84, 840 / 1060, p(at, 12.75, 13.5)), 1.8, p(at, 14.5, 14.78));
    const z = late ? 1 : zAt(t);
    const tx = late ? 0 : mix(mix(230, 290, out) - 60 * portrait, 267, focus);
    const ty = late ? 0 : mix(mix(10, -100, out), -402, focus);
    const velocity = Math.abs(zAt(t) - zAt(t - 1 / 60)) * 1060;
    const blur = late ? 0 : Math.min(6, velocity * .12);
    const typeIndex = t < 14.5 ? 2 : t < 15 ? 0 : t < 15.5 ? 1 : 2;
    const titleTop = mix(385, h - 235, portrait);
    const titleColor = rgb([246, 244, 236], [28, 34, 34], focus);
    const bodyOpacity = late ? 0 : 1;
    const filmImageOpacity = late ? (t >= 17 ? 1 : 0) : 1 - focus;
    const canvasOpacity = late ? (1 - p(t, 18.3, 18.4)) : 1;
    const switchAt = t < 14.5 ? 0 : t < 15 ? 14.5 : t < 15.5 ? 15 : 15.5;
    const titleSettle = t < 14.5 ? 1 : p(t, switchAt, switchAt + .10, arrive);
    return <AbsoluteFill style={{ background: paper, color: ink, fontFamily: 'Geist' }}>
    <style>{fonts}</style>
    <div style={{ ...abs, inset: 0, transformOrigin: late ? '0 0' : '730px 530px', transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')', filter: 'blur(' + blur + 'px)' }}>
      {/* One canvas and photograph survive format changes, type focus and final band. */}
      <div style={{ ...abs, left: late ? 960 - w / 2 : 730 - w / 2, top: late ? 540 - h / 2 : 530 - h / 2, width: w, height: h, overflow: 'hidden', opacity: canvasOpacity, background: rgb([235, 231, 221], [238, 238, 233], focus), boxShadow: late ? 'none' : '0 16px 50px rgba(23,32,32,' + (.071 * (1 - focus)) + ')' }}>
        <div style={{ ...abs, inset: 0, opacity: filmImageOpacity }}>
          <Img src={staticFile('ocean.jpg')} style={{ width: late ? 1920 : w, height: late ? 1080 : h, objectFit: 'cover', filter: 'grayscale(1)', position: 'absolute', left: late ? (w - 1920) / 2 : 0, top: late ? (h - 1080) / 2 : 0, transform: late ? 'scale(1.1) translateX(' + (-10 - 70 * p(t, 17, 18)) + 'px)' : 'scale(1.045) translateX(-10px)' }}/>
          <div style={{ ...abs, inset: 0, background: 'linear-gradient(90deg,#10191b99,transparent 75%)', opacity: late ? .25 : 1 }}/>
        </div>
        <div style={{ ...abs, left: 50, top: 65, fontSize: 36, letterSpacing: -1.7, color: '#f6f4ec', opacity: bodyOpacity * (1 - focus) }}>elsewhere<span style={{ fontSize: 13, verticalAlign: 'top' }}>®</span></div>
        <div style={{ ...abs, left: 60, top: titleTop, fontFamily: typeIndex === 2 ? 'Georgia' : 'Geist', fontWeight: typeIndex === 0 ? 260 : typeIndex === 1 ? 760 : 400, fontSize: 76, letterSpacing: -3.8, lineHeight: .98, paddingBottom: 16, paddingRight: 12, color: titleColor, opacity: bodyOpacity, transform: 'translateY(' + (1 - titleSettle) * 10 + 'px)', clipPath: 'inset(' + (1 - titleSettle) * 12 + '% 0 0 0)' }}>
          A different<br /><span style={{ fontStyle: typeIndex === 2 ? 'italic' : 'normal' }}>point of view.</span>
        </div>
        <div style={{ ...abs, left: 64, top: h - 90, fontSize: 18, letterSpacing: .3, color: '#f6f4ec', opacity: bodyOpacity * (1 - focus) }}>A journal for the curious.</div>
      </div>
    </div>
    {t < 13.4 && <div style={{ ...abs, left: 1490, top: 934, width: 280, height: 64, borderRadius: 10, background: '#fff', border: '1px solid #e0e3dc', fontSize: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: 1 - p(t, 12.75, 13.1, arrive) }}>View formats　↙</div>}
    {t < 13.1 && <Pointer t={t}/>}
    {t >= 16 && t < 17 && <Relay t={t}/>}
    {t >= 18.4 && <div style={{ ...abs, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 132, letterSpacing: -7, opacity: p(t, 18.4, 18.5, arrive), transform: 'translateY(' + (1 - p(t, 18.4, 18.5, arrive)) * 12 + 'px)' }}><Mark size={110}/><span>margin</span></div>}
    {null}
  </AbsoluteFill>;
}
export function FastFilm({ bgm = true }: {
    bgm?: boolean;
}) {
    return <AbsoluteFill style={{ background: paper }}>
    <Sequence durationInFrames={750} name="Accepted opening and product setup"><TypeFilm bgm={false}/></Sequence>
    <Sequence from={750} durationInFrames={450} name="Formats → type → words → ocean band"><FastFinale /></Sequence>
    {null}
  </AbsoluteFill>;
}
