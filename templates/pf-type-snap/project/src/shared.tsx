import React, {CSSProperties, useEffect, useLayoutEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const settle = Easing.bezier(0.16, 1, 0.3, 1);
export const snap = Easing.bezier(0.18, 0.9, 0.24, 1.13);
export const progress = (time: number, start: number, end: number, easing = settle) => interpolate(time, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
export const linear = (time: number, start: number, end: number) => progress(time, start, end, Easing.linear);
export const useTime = () => {const frame = useCurrentFrame(); const {fps} = useVideoConfig(); return frame / fps;};
let fontReady: Promise<void> | undefined;
export const Scene: React.FC<{children: React.ReactNode; background: string; color?: string}> = ({children, background, color = '#f6f8f4'}) => {
  const [handle] = useState(() => delayRender('Load bundled Geist font'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!fontReady) fontReady = (async () => {
      try {
        const font = new FontFace('Geist', `url(${staticFile('assets/GeistVF.woff2')})`, {weight: '100 900'});
        (document.fonts as FontFaceSet & {add: (font: FontFace) => void}).add(await font.load());
        await document.fonts.ready;
      } catch { await document.fonts.ready; }
    })();
    fontReady.then(() => {setReady(true); continueRender(handle);});
  }, [handle]);
  return <AbsoluteFill style={{background, color, fontFamily: 'Geist, Arial, sans-serif', letterSpacing: 0, overflow: 'hidden'}}>{ready ? children : null}</AbsoluteFill>;
};

export const useFittedSize = (text: string, max: number, width: number, weight = 600) => {
  const [size, setSize] = useState(max);
  useLayoutEffect(() => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${weight} ${max}px Geist, Arial, sans-serif`;
    const measured = context.measureText(text).width;
    setSize(Math.min(max, max * width / Math.max(measured, 1)));
  }, [text, max, width, weight]);
  return size;
};
export const TextLine: React.FC<{text: string; size: number; width: number; weight?: number; style?: CSSProperties}> = ({text, size, width, weight = 600, style}) => {
  const fitted = useFittedSize(text, size, width, weight);
  return <div style={{fontSize: fitted, fontWeight: weight, whiteSpace: 'nowrap', width, lineHeight: 1.1, ...style}}>{text}</div>;
};
export const CartIcon: React.FC<{size?: number; style?: CSSProperties}> = ({size = 28, style}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M3 3h2l2.4 11.5a2 2 0 0 0 2 1.5h8.2a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>;
export const CheckIcon = () => <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg>;
export const Pointer = () => <svg width="32" height="39" viewBox="0 0 32 39" fill="#fff" stroke="#17221d" strokeWidth="2" strokeLinejoin="round"><path d="M3 2v29l8-8 6 13 6-3-6-12h12z"/></svg>;
