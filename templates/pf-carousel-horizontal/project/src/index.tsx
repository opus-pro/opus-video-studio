import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Composition, Easing, Img, continueRender, delayRender,
  interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const CAROUSEL = Easing.bezier(0.22, 0.85, 0.2, 1);
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const progress = (time: number, start: number, end: number, easing = OUT) =>
  interpolate(time, [start, end], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });

let fontPromise: Promise<void> | undefined;
const loadFont = () => {
  if (!fontPromise) {
    fontPromise = (async () => {
      try {
        const font = new FontFace('Geist', `url("${staticFile('assets/GeistVF.woff2')}")`, {
          weight: '100 900', style: 'normal',
        });
        document.fonts.add(await font.load());
        await document.fonts.ready;
      } catch (error) {
        console.warn('Geist failed to load; using Arial.', error);
        await document.fonts.ready;
      }
    })();
  }
  return fontPromise;
};

const FontReady: React.FC<React.PropsWithChildren> = ({children}) => {
  const [handle] = useState(() => delayRender('Wait for Geist and document.fonts.ready'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    loadFont().then(() => {
      if (mounted) setReady(true);
      continueRender(handle);
    });
    return () => {mounted = false;};
  }, [handle]);
  return ready ? <>{children}</> : null;
};

const measureText = (text: string, size: number, weight = 600) => {
  if (typeof document === 'undefined') return text.length * size * 0.57;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return text.length * size * 0.57;
  context.font = `${weight} ${size}px Geist, Arial, sans-serif`;
  return context.measureText(text).width;
};

const fitSingleLine = (text: string, maxWidth: number, preferred: number, weight = 600) =>
  Math.min(preferred, preferred * maxWidth / Math.max(1, measureText(text, preferred, weight)));

const fitTitle = (text: string) => {
  if (measureText(text, 50) <= 488) return {size: 50, lines: [text]};
  const words = text.split(/\s+/);
  let best = [text];
  let width = Infinity;
  for (let index = 1; index < words.length; index++) {
    const lines = [words.slice(0, index).join(' '), words.slice(index).join(' ')];
    const candidate = Math.max(...lines.map((line) => measureText(line, 42)));
    if (candidate < width) {best = lines; width = candidate;}
  }
  if (best.length === 1) width = measureText(text, 42);
  return {size: Math.min(42, 42 * 488 / Math.max(width, 1)), lines: best};
};

export type LogoOutline = {
  petalWidth: number;
  petalHeight: number;
  innerGap: number;
  cornerRadius: number;
  angles: number[];
  customPath: string | null;
};
export type MarkProps = {
  brand: string;
  tagline: string;
  accent: string;
  tileColor: string;
  background: string;
  logo: LogoOutline;
};
export const markDefaults: MarkProps = {
  brand: 'FORM', tagline: 'Make room for ideas.', accent: '#ff8069',
  tileColor: '#f1f3f0', background: '#151719',
  logo: {
    petalWidth: 60, petalHeight: 132, innerGap: 34, cornerRadius: 30,
    angles: [0, 90, 180, 270], customPath: null,
  },
};

const MarkScene: React.FC<MarkProps> = ({brand, tagline, accent, tileColor, background, logo}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const time = frame / fps;
  const enter = progress(time, 0, 0.5);
  const retreat = progress(time, 1.1, 1.8, Easing.bezier(0, 0, 0, 1));
  const word = progress(time, 1.25, 1.7);
  const subline = progress(time, 1.62, 1.95);
  return <AbsoluteFill style={{background, overflow: 'hidden', fontFamily: 'Geist, Arial, sans-serif', letterSpacing: 0}}>
    <div data-element="app-tile" style={{
      position: 'absolute', left: width / 2 - 192, top: height / 2 - 192 - 170 * retreat,
      width: 384, height: 384, borderRadius: 72, background: tileColor,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
      transform: `scale(${(0.64 + 0.36 * enter) * (1 - 0.48 * retreat)}) rotate(${-12 * (1 - enter)}deg)`,
      opacity: 0.25 + 0.75 * enter, filter: `blur(${10 * (1 - enter)}px)`,
    }}>
      <svg width="384" height="384" viewBox="0 0 384 384" fill={accent}>
        {logo.customPath ? <path d={logo.customPath}/> : logo.angles.map((angle, index) => {
          const petal = progress(time, index * 0.035, index * 0.035 + 0.32);
          const centerY = -(logo.innerGap + logo.petalHeight / 2);
          return <g key={index} transform={`translate(192 192) rotate(${angle})`}>
            <g transform={`translate(0 ${centerY}) scale(${0.7 + 0.3 * petal})`}>
              <rect x={-logo.petalWidth / 2} y={-logo.petalHeight / 2}
                width={logo.petalWidth} height={logo.petalHeight} rx={logo.cornerRadius}/>
            </g>
          </g>;
        })}
      </svg>
    </div>
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <text data-element="brand" x={width / 2} y={660 + 40 * (1 - word)} textAnchor="middle"
        fill="#f1f3f0" fontSize={fitSingleLine(brand, 900, 144)} fontWeight={600}
        style={{opacity: word, filter: `blur(${8 * (1 - word)}px)`}}>{brand}</text>
      <text data-element="tagline" x={width / 2} y={740 + 16 * (1 - subline)} textAnchor="middle"
        fill="#b5bbb6" fontSize={fitSingleLine(tagline, 1000, 32, 400)} fontWeight={400}
        style={{opacity: subline, filter: `blur(${5 * (1 - subline)}px)`}}>{tagline}</text>
    </svg>
  </AbsoluteFill>;
};

export const MarkLockup: React.FC<MarkProps> = (props) => <FontReady><MarkScene {...props}/></FontReady>;

export type CardData = {
  image: string; title: string; eyebrow: string; footerColor: string; textColor: string;
};
export type Variant = 'horizontal' | 'diagonal' | 'vertical';
export type CarouselProps = {cards: CardData[]; variant: Variant};
export const cards: CardData[] = [
  {image: 'assets/coast.jpg', title: 'Along the coast.', eyebrow: 'FIELD NOTES', footerColor: '#cce789', textColor: '#18251e'},
  {image: 'assets/forest.jpg', title: 'Into the green.', eyebrow: 'FIELD NOTES', footerColor: '#184c3a', textColor: '#ffffff'},
  {image: 'assets/desert.jpg', title: 'A little further.', eyebrow: 'FIELD NOTES', footerColor: '#f4876e', textColor: '#18251e'},
  {image: 'assets/mountains.jpg', title: 'Above it all.', eyebrow: 'FIELD NOTES', footerColor: '#dae5ef', textColor: '#18251e'},
];

const PaperCard: React.FC<{card: CardData; index: number}> = ({card, index}) => {
  const title = fitTitle(card.title);
  return <>
    <Img src={staticFile(card.image)} style={{display: 'block', width: 560, height: 538, objectFit: 'cover'}}/>
    <div data-element="footer" style={{
      height: 182, width: 560, boxSizing: 'border-box', padding: '27px 36px 20px',
      background: card.footerColor, color: card.textColor,
    }}>
      <div style={{height: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18, lineHeight: '24px', fontWeight: 400}}>
        <span style={{fontSize: fitSingleLine(card.eyebrow, 340, 18, 400)}}>{card.eyebrow}</span>
        <span>{`VOL. ${String(index + 1).padStart(2, '0')}`}</span>
      </div>
      <div data-element="card-title" style={{marginTop: title.lines.length > 1 ? 10 : 17, width: 488, fontSize: title.size, fontWeight: 600, lineHeight: 1.08}}>
        {title.lines.map((line, lineIndex) => <div key={lineIndex} style={{whiteSpace: 'nowrap'}}>{line}</div>)}
      </div>
    </div>
  </>;
};

const CarouselScene: React.FC<CarouselProps> = ({cards: items, variant}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const time = frame / fps;
  const enter = progress(time, 0, 0.48);
  let position = 0;
  let active = 0;
  let movementBlur = 0;
  let settle = 0;
  for (const [index, start] of [0.9, 2.05, 3.2].entries()) {
    const raw = clamp((time - start) / 0.64);
    position += progress(time, start, start + 0.64, CAROUSEL);
    if (raw >= 0.5) active = index + 1;
    if (raw > 0 && raw < 1) {
      movementBlur = interpolate(raw, [0, 0.3, 0.85, 1], [0, 5, 0, 0]);
      // A 6px late overshoot eases back within the final 0.12 seconds.
      settle = 6 * Math.sin(Math.PI * clamp((time - start - 0.52) / 0.12));
    }
  }
  const direction = variant === 'horizontal' ? [1, 0] : variant === 'vertical' ? [0, -1] : [Math.SQRT1_2, -Math.SQRT1_2];
  return <AbsoluteFill style={{background: '#ebeeeb', overflow: 'hidden', fontFamily: 'Geist, Arial, sans-serif', letterSpacing: 0}}>
    <AbsoluteFill style={{transform: `scale(${0.94 + 0.06 * enter})`, opacity: 0.3 + 0.7 * enter}}>
      {items.slice(0, 4).map((card, index) => {
        const distance = (index - position) * 690 - settle;
        const scale = 0.78 + 0.22 * (1 - clamp(Math.abs(index - position)));
        return <div key={index} data-card-index={index} data-active={index === active} style={{
          position: 'absolute', left: width / 2 - 280 + direction[0] * distance,
          top: height / 2 - 360 + direction[1] * distance, width: 560, height: 720,
          borderRadius: 8, overflow: 'hidden', transform: `scale(${scale})`,
          zIndex: index === active ? 10 : 1, boxShadow: '0 24px 50px rgba(20,32,25,0.12)',
          filter: `blur(${8 * (1 - enter) + movementBlur}px)`,
        }}><PaperCard card={card} index={index}/></div>;
      })}
    </AbsoluteFill>
  </AbsoluteFill>;
};

export const Carousel: React.FC<CarouselProps> = (props) => <FontReady><CarouselScene {...props}/></FontReady>;

const Root: React.FC = () => <>
  <Composition id="pf-mark-lockup" component={MarkLockup} width={1920} height={1080} fps={60} durationInFrames={216} defaultProps={markDefaults}/>
  {(['horizontal', 'diagonal', 'vertical'] as const).map((variant) =>
    <Composition key={variant} id={`pf-carousel-${variant}`} component={Carousel} width={1200} height={1200} fps={60} durationInFrames={288} defaultProps={{cards, variant}}/>
  )}
</>;

registerRoot(Root);
