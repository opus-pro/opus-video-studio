import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
const A: React.CSSProperties = { position: 'absolute' };
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const move = Easing.bezier(.7, 0, .2, 1), arrive = Easing.bezier(.16, 1, .3, 1);
const progress = (t: number, a: number, b: number, e = move) => e(clamp((t - a) / (b - a)));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
function Pointer({ t }: {
    t: number;
}) { const go = progress(t, .2, .9, arrive), next = progress(t, 1.88, 2.28, arrive); const x = mix(mix(1760, 1570, go), 1550, next), y = mix(mix(770, 493, go), 641, next); const pulse = (at: number) => Math.sin(Math.PI * clamp((t - at) / .15)); return <div style={{ ...A, left: x, top: y, opacity: 1 - progress(t, 2.4, 2.55), transform: `scale(${1 - .13 * Math.max(pulse(1), pulse(2.3))})`, transformOrigin: '0 0' }}><svg width="30" height="36" viewBox="0 0 30 36"><path d="M3 2L26 23L15 24L11 32Z" fill="#4c67e8" stroke="white" strokeWidth="1.6"/></svg></div>; }
function CardIcon({ fill }: {
    fill: boolean;
}) { return <div style={{ width: 116, height: 76, background: '#e9e6de', border: '1px solid #d7d5cd', borderRadius: 3, position: 'relative', overflow: 'hidden' }}><div style={{ ...A, inset: fill ? 0 : '0 0 0 55%', background: '#535b5e' }}/><div style={{ ...A, left: 12, bottom: 16, width: 35, height: 4, background: fill ? '#fff' : '#414849' }}/><div style={{ ...A, left: 12, bottom: 9, width: 26, height: 3, background: fill ? '#fff' : '#414849' }}/></div>; }
export function ContinuityStudy({ bgm = true, extend = false }: {
    bgm?: boolean;
    extend?: boolean;
}) {
    const t = useCurrentFrame() / 60;
    const layout = progress(t, 1.08, 1.82), type = progress(t, 1.18, 1.9), ink = progress(t, 1.5, 1.72, arrive), zoom = progress(t, 2.4, 3.02), out = extend ? progress(t, 6.25, 7) : 0, z = mix(1 + .84 * zoom, 840 / 1060, out);
    const oldZ = mix(1 + .84 * progress(t - 1 / 60, 2.4, 3.02), 840 / 1060, extend ? progress(t - 1 / 60, 6.25, 7) : 0);
    const velocity = Math.abs(z - oldZ) * 1060;
    const blur = Math.min(6, velocity * .12);
    const textInk = (left: number): React.CSSProperties => ({ backgroundImage: `linear-gradient(90deg,#1c2222 ${Math.max(0, 530 * (1 - layout) - left)}px,#f6f4ec ${Math.max(0, 530 * (1 - layout) - left)}px)`, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" });
    return <AbsoluteFill style={{ background: '#eeeee9', fontFamily: 'Geist', color: '#1c2222', overflow: 'hidden' }}><style>{`@font-face{font-family:Geist;src:url('${staticFile('GeistVF.woff2')}') format('woff2');font-weight:100 900}*{box-sizing:border-box}`}</style>
 <div style={{ ...A, inset: 0, transformOrigin: '730px 530px', transform: `translate(${mix(230 * zoom, 290, out)}px,${mix(10 * zoom, -100, out)}px) scale(${z})`, filter: `blur(${blur}px)` }}>
 {/* This physical canvas and its text nodes persist for every frame. */}
 <div style={{ ...A, left: 200, top: 200, width: 1060, height: 660, overflow: 'hidden', background: '#ebe7dd', boxShadow: '0 16px 50px #17202012' }}>
 <div style={{ ...A, inset: 0, clipPath: `inset(0 0 0 ${50 * (1 - layout)}%)` }}><Img src={staticFile('ocean.jpg')} style={{ width: 1060, height: 660, objectFit: 'cover', filter: 'grayscale(1)', transform: `scale(1.045) translateX(${-10 * progress(t, 3.1, 4.8, Easing.linear)}px)` }}/><div style={{ ...A, inset: 0, background: 'linear-gradient(90deg,#10191b99,transparent 75%)', opacity: layout }}/></div>
 <div style={{ ...A, left: 50, top: mix(43, 65, type), fontSize: 36, letterSpacing: -1.7, ...textInk(50) }}>elsewhere<span style={{ fontSize: 13, verticalAlign: 'top' }}>®</span></div>
 <div style={{ ...A, left: mix(50, 60, type), top: mix(228, 385, type), fontFamily: 'Georgia', fontSize: 76, letterSpacing: -3.8, lineHeight: .98, paddingBottom: 16, paddingRight: 12, ...textInk(mix(50, 60, type)) }}>A different<br /><span style={{ fontStyle: 'italic' }}>point of view.</span></div>
 <div style={{ ...A, left: mix(53, 64, type), top: mix(525, 570, type), fontSize: 18, letterSpacing: .3, ...textInk(mix(53, 64, type)) }}>A journal for the curious.</div>
 </div>
 <div style={{ ...A, left: 1370, top: 345, width: 340, padding: 24, display: extend && t >= 5.5 ? 'none' : 'block', background: '#fff', border: '1px solid #dce0d9', borderRadius: 12, boxShadow: '0 10px 28px #18201c08' }}><div style={{ fontSize: 21, marginBottom: 25 }}>Composition</div><div style={{ display: 'flex', gap: 18 }}>{['Split', 'Immersive'].map((v, i) => <div key={v} style={{ padding: 8, border: `1.5px solid ${(t >= 1 ? i === 1 : i === 0) ? '#516ae7' : '#e0e3dc'}`, borderRadius: 7, background: (t >= 1 ? i === 1 : i === 0) ? '#f1f4ff' : 'white' }}><CardIcon fill={i === 1}/><div style={{ fontSize: 17, marginTop: 13, marginBottom: 4 }}>{v}</div></div>)}</div><div style={{ marginTop: 25, paddingTop: 22, borderTop: '1px solid #e6e8e1' }}><div style={{ height: 49, borderRadius: 7, background: t >= 2.3 ? '#354ac1' : '#4c67e8', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 19 }}>Preview　↗</div></div></div>
 <Pointer t={t}/>
 </div>
 {null}
 {null}
 </AbsoluteFill>;
}
