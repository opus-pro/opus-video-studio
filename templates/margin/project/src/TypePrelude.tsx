import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Easing, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, } from 'remotion';
import { CompletedFilm, Input } from './CompletedFilm';
const paper = '#eeeee9';
const ink = '#1c2222';
const size = 62;
const prefix = 'Make room for ';
const nouns = ['an idea.', 'a direction.', 'a collection.'];
const sentence = prefix + nouns[0];
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const arrive = Easing.bezier(.16, 1, .3, 1);
const travel = Easing.bezier(.7, 0, .2, 1);
const p = (t: number, a: number, b: number, ease = arrive) => ease(clamp((t - a) / (b - a)));
const mix = (a: number, b: number, q: number) => a + (b - a) * q;
const abs: React.CSSProperties = { position: 'absolute' };
// Measure bundled Geist instead of reusing the reference's Helvetica metrics.
function useGlyphs() {
    const [handle] = useState(() => delayRender('Measure Geist for kinetic typography'));
    const [glyphs, setGlyphs] = useState<Record<string, number>>({});
    useEffect(() => {
        document.fonts.load('400 ' + size + 'px Geist').then(() => {
            const context = document.createElement('canvas').getContext('2d')!;
            context.font = '400 ' + size + 'px Geist';
            context.fontKerning = 'none';
            const values: Record<string, number> = {};
            Array.from(new Set((prefix + nouns.join('')).split(''))).forEach(c => {
                values[c] = context.measureText(c).width;
            });
            setGlyphs(values);
            continueRender(handle);
        }).catch(() => continueRender(handle));
    }, [handle]);
    return glyphs;
}
// Deliberate first letters, fast middle, word pauses, decelerating finish.
const weights = Array.from(sentence).map((c, i) => {
    const q = i / (sentence.length - 1);
    return (q < .15 ? 5.2 : q > .72 ? 2.2 + 8 * (q - .72) : 1.35) + (c === ' ' ? 3.8 : 0);
});
const totalWeight = weights.reduce((a, b) => a + b, 0);
let runningWeight = 0;
const births = weights.map(w => {
    const birth = .12 + 1.04 * runningWeight / totalWeight;
    runningWeight += w;
    return birth;
});
function VelocityFilter({ velocity }: {
    velocity: number;
}) {
    const blur = Math.min(18, Math.abs(velocity) * .48);
    return <svg width={0} height={0} style={abs}><defs>
    <filter id="prelude-motion" x="-30%" y="-80%" width="160%" height="260%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={blur + ' ' + blur * .12}/>
    </filter>
  </defs></svg>;
}
export function TypePrelude() {
    const t = useCurrentFrame() / 60;
    const glyphs = useGlyphs();
    const advance = (c: string) => (glyphs[c] ?? size * .5) - 1.5;
    const width = (text: string) => Array.from(text).reduce((w, c) => w + advance(c), 0);
    const prefixWidth = width(prefix);
    const rollAt = (at: number) => p(at, 1.72, 2.02, travel) + p(at, 2.22, 2.52, travel);
    const totalAt = (at: number) => {
        if (at < 1.55)
            return Array.from(sentence).reduce((w, c, i) => w + advance(c) * p(at, births[i], births[i] + .12), 0);
        return prefixWidth + mix(width(nouns[0]), width(nouns[1]), p(at, 1.72, 2.02, travel))
            + (width(nouns[2]) - width(nouns[1])) * p(at, 2.22, 2.52, travel);
    };
    const zoomAt = (at: number) => 1 + .48 * p(at, .36, .92) * (1 - p(at, 1.17, 1.58, travel));
    const dockAt = (at: number) => p(at, 3, 3.7, travel);
    const scaleAt = (at: number) => mix(zoomAt(at), 33 / size, dockAt(at));
    const leftAt = (at: number) => mix(960 - totalAt(at) * zoomAt(at) / 2 - 45 * p(at, .4, .95) * (1 - p(at, 1.17, 1.58, travel)), 505, dockAt(at));
    const scale = scaleAt(t), dock = dockAt(t), roll = rollAt(t);
    const rightAt = (at: number) => leftAt(at) + totalAt(at) * scaleAt(at);
    const velocity = Math.max(Math.abs(leftAt(t) - leftAt(t - 1 / 60)), Math.abs(rightAt(t) - rightAt(t - 1 / 60)));
    let x = 0;
    return <AbsoluteFill style={{ background: paper, color: ink, fontFamily: 'Geist', fontWeight: 400 }}>
    <VelocityFilter velocity={velocity}/>
    {/* A dialog forms around the sentence and is handed to the existing input. */}
    <div style={{ ...abs, left: mix(960 - (width(prefix + nouns[2]) + 80) / 2, 470, dock), top: mix(466, 395, dock), width: mix(width(prefix + nouns[2]) + 80, 980, dock), height: mix(110, 235, dock), borderRadius: 16, background: 'white', border: '1px solid #dedfd8', boxShadow: '0 20px 58px #1720200c', opacity: p(t, 3, 3.38) }}/>
    <div style={{ ...abs, inset: 0, opacity: p(t, 3.42, 3.72) }}>
      <div style={{ ...abs, left: 505, top: 430, fontSize: 15, letterSpacing: 1.2, color: '#8a908b' }}>NEW DIRECTION</div>
      <div style={{ ...abs, left: 505, top: 581, fontSize: 18, color: '#89908a' }}>＋ Brand brief</div>
      <div style={{ ...abs, left: 1372, top: 554, width: 50, height: 50, borderRadius: 10, background: '#4c67e8', color: 'white', fontSize: 30, textAlign: 'center', lineHeight: '50px' }}>↗</div>
    </div>
    <div style={{ ...abs, left: leftAt(t), top: mix(496, 466, dock), width: totalAt(t) + 40, height: size * 1.25, fontSize: size, lineHeight: 1.25, letterSpacing: -1.5, whiteSpace: 'nowrap', transform: 'scale(' + scale + ')', transformOrigin: '0 0', filter: 'url(#prelude-motion)', opacity: 1 - p(t, 3.72, 3.94) }}>
      {t < 1.55 ? Array.from(sentence).map((c, i) => {
            const offset = x;
            x += advance(c);
            const dxAt = (at: number) => 12 * (1 - p(at, births[i], births[i] + .17));
            const blur = Math.min(5, Math.abs(dxAt(t) - dxAt(t - 1 / 60)) * 1.5);
            return <span key={i} style={{ ...abs, left: offset, opacity: p(t, births[i], births[i] + .065), transform: 'translateX(' + dxAt(t) + 'px)', filter: 'blur(' + blur + 'px)' }}>{c === ' ' ? '\u00a0' : c}</span>;
        }) : <>
        <span style={{ ...abs, left: 0, fontKerning: 'none' }}>{prefix}</span>
        <div style={{ ...abs, left: prefixWidth, top: -18, width: width(nouns[2]) + 35, height: 114, overflow: 'hidden', maskImage: 'linear-gradient(transparent,black 23%,black 77%,transparent)' }}>
          {nouns.map((word, i) => <span key={word} style={{ ...abs, left: 0, top: 18 + (i - roll) * 100, fontKerning: 'none', color: i === 2 ? '#4c67e8' : ink, opacity: Math.max(0, 1 - Math.abs(i - roll) * .75), filter: 'blur(' + Math.min(4, Math.abs(i - roll) * 3) + 'px)' }}>{word}</span>)}
        </div>
      </>}
    </div>
    {t >= 3.94 && <Sequence from={236}><Input preformed/></Sequence>}
  </AbsoluteFill>;
}
export function TypeFilm({ bgm = true }: {
    bgm?: boolean;
}) {
    return <AbsoluteFill style={{ background: paper }}>
    <style>{"@font-face{font-family:Geist;src:url('" + staticFile('GeistVF.woff2') + "') format('woff2');font-weight:100 900}*{box-sizing:border-box}"}</style>
    <Sequence durationInFrames={240} name="Kinetic thought → input"><TypePrelude /></Sequence>
    <Sequence from={240} durationInFrames={960} name="Continuous product film"><CompletedFilm bgm={false} preformed/></Sequence>
    {null}
    null
    null
  </AbsoluteFill>;
}
