import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { ContinuityStudy } from './ContinuityStudy';
import { Mark } from './Brand';
const A: React.CSSProperties = { position: 'absolute' };
const blue = '#4c67e8', ink = '#1c2222', paper = '#eeeee9';
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const arrive = Easing.bezier(.16, 1, .3, 1), travel = Easing.bezier(.7, 0, .2, 1);
const p = (t: number, a: number, b: number, e = arrive) => e(clamp((t - a) / (b - a)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function Cursor({ x, y, t, at }: {
    x: number;
    y: number;
    t: number;
    at: number;
}) { return <svg style={{ ...A, left: x, top: y, transform: `scale(${1 - .13 * Math.sin(Math.PI * clamp((t - at) / .15))})`, transformOrigin: '0 0' }} width="30" height="36" viewBox="0 0 30 36"><path d="M3 2L26 23L15 24L11 32Z" fill={blue} stroke="white" strokeWidth="1.6"/></svg>; }
export function Input({ preformed = false }: {
    preformed?: boolean;
}) { const t = useCurrentFrame() / 60; const text = 'An editorial launch for Elsewhere.'; const chars = Math.floor(interpolate(t, [.1, .4, .9, 1.4, 1.65], [0, 3, 18, 29, text.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })); return <AbsoluteFill style={{ background: paper }}><div style={{ ...A, left: 470, top: 395, width: 980, height: 235, border: '1px solid #dedfd8', borderRadius: 16, background: 'white', boxShadow: '0 20px 58px #1720200c', padding: 34, opacity: preformed ? 1 : p(t, 0, .2), transform: `translateY(${preformed ? 0 : (1 - p(t, 0, .4)) * 22}px)` }}><div style={{ fontSize: 15, letterSpacing: 1.2, color: '#8a908b', marginBottom: 19 }}>NEW DIRECTION</div><div style={{ fontSize: 33, letterSpacing: -1 }}>{text.slice(0, chars)}<span style={{ opacity: t < 1.7 ? 1 : 0, color: '#9aa09b' }}>│</span></div><div style={{ ...A, left: 34, bottom: 27, fontSize: 18, color: '#89908a' }}>＋ Brand brief</div><div style={{ ...A, right: 27, bottom: 25, width: 50, height: 50, borderRadius: 10, background: blue, color: 'white', fontSize: 30, textAlign: 'center', lineHeight: '50px', transform: `scale(${1 - .07 * Math.sin(Math.PI * clamp((t - 2) / .2))})` }}>{t > 2.18 ? '✓' : '↗'}</div></div>{t > 1.5 && <Cursor x={mix(1600, 1400, p(t, 1.5, 1.95))} y={mix(730, 588, p(t, 1.5, 1.95))} t={t} at={2}/>}</AbsoluteFill>; }
function Derived({ w, h, square = false }: {
    w: number;
    h: number;
    square?: boolean;
}) { return <div style={{ ...A, inset: 0, overflow: 'hidden', background: ink }}><Img src={staticFile('ocean.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }}/><div style={{ ...A, inset: 0, background: 'linear-gradient(0deg,#10191bcc,transparent 85%)' }}/><div style={{ ...A, left: 23, top: 25, fontSize: 22, letterSpacing: -1, color: '#f6f4ec' }}>elsewhere®</div><div style={{ ...A, left: 23, right: 20, bottom: square ? 50 : 85, fontFamily: 'Georgia', fontSize: square ? 40 : 46, letterSpacing: -2, lineHeight: .98, color: '#f6f4ec' }}>A different<br /><span style={{ fontStyle: 'italic' }}>point of view.</span></div><div style={{ ...A, left: 24, bottom: 26, fontSize: 12, color: '#e8e9e1' }}>A journal for the curious.</div></div>; }
function Output() {
    const t = useCurrentFrame() / 60;
    const reveal = p(t, 8.05, 8.4), retreat = p(t, 8.75, 9.5, travel), exported = t >= 12.8;
    return <AbsoluteFill style={{ pointerEvents: 'none' }}>
 {t < 9.4 && <div style={{ ...A, left: 1490, top: 934, width: 280, height: 64, borderRadius: 10, background: '#fff', border: '1px solid #e0e3dc', fontSize: 23, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: reveal * (1 - p(t, 8.75, 9.1)), transform: `translateY(${(1 - reveal) * 15}px)` }}>View formats　↙</div>}
 {[false, true].map((square, i) => { const q = p(t, 9.05 + i * .13, 9.6 + i * .13, travel); return <div key={i} style={{ ...A, left: mix(i ? 1350 : 350, i ? 1510 : 160, q), top: mix(240, i ? 295 : 225, q), width: i ? 300 : 360, height: i ? 300 : 450, opacity: q, transform: `translateY(${(1 - q) * 28}px)`, boxShadow: '0 14px 40px #1720200b' }}><Derived w={i ? 300 : 360} h={i ? 300 : 450} square={square}/></div>; })}
 <div style={{ ...A, left: 600, top: 733, width: 840, display: 'flex', justifyContent: 'space-between', color: '#8b928b', fontSize: 18, opacity: p(t, 9.4, 9.7) }}><span>Elsewhere / Launch collection</span><span>3 formats</span></div>
 <div style={{ ...A, left: 830, top: 834, width: 380, height: 68, borderRadius: 10, background: exported ? '#304c41' : blue, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontSize: 24, opacity: p(t, 10, 10.35), transform: `translateY(${(1 - p(t, 10, 10.35)) * 16}px)` }}>{exported ? '✓　Collection exported' : 'Export collection　↗'}</div>
 {t > 8.3 && t < 9.1 && <Cursor x={mix(1830, 1640, p(t, 8.3, 8.6))} y={mix(1040, 964, p(t, 8.3, 8.6))} t={t} at={8.65}/>}
 {t > 11.9 && t < 13.15 && <Cursor x={mix(1350, 1120, p(t, 11.9, 12.45))} y={mix(980, 865, p(t, 11.9, 12.45))} t={t} at={12.5}/>}
 </AbsoluteFill>;
}
export function CompletedFilm({ bgm = true, preformed = false }: {
    bgm?: boolean;
    preformed?: boolean;
}) { const frame = useCurrentFrame(), t = frame / 60; const ending = p(t, 14, 14.35); return <AbsoluteFill style={{ background: paper, color: ink, fontFamily: 'Geist' }}><style>{`@font-face{font-family:Geist;src:url('${staticFile('GeistVF.woff2')}') format('woff2');font-weight:100 900}*{box-sizing:border-box}`}</style><div style={{ ...A, inset: 0, opacity: 1 - ending }}><Sequence durationInFrames={150}><Input preformed={preformed}/></Sequence><Sequence from={150}><ContinuityStudy bgm={false} extend/></Sequence>{t >= 8 && <Output />}</div>{t >= 14 && <div style={{ ...A, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 132, letterSpacing: -7, opacity: ending, transform: `translateY(${(1 - p(t, 14, 14.55)) * 18}px)` }}><Mark size={110}/><span>margin</span></div>}{null}{null}</AbsoluteFill>; }
