import React, {useEffect, useMemo, useState} from 'react';
import {
  AbsoluteFill, Composition, Easing, Img, continueRender, delayRender,
  interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

export type Photo = {src: string; width: number; height: number};
export type FocalPoint = {x: number; y: number; zoom: number};
type Copy = {brand: string; productName: string; headline: string[]; footer: string; url: string};
export type CameraProps = Copy & {
  photos: {wide: Photo; close: Photo; detail: Photo};
  photoFocalPoints: {wide: FocalPoint; close: FocalPoint; detail: FocalPoint};
};
export type SlicesProps = Copy & {
  photos: {wide: Photo; turn: Photo; macro: Photo};
  stripFocalPoints: [FocalPoint, FocalPoint, FocalPoint, FocalPoint];
  finalFocalPoint: FocalPoint;
};

const W = 1080;
const H = 1920;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const stripEase = Easing.bezier(0, 0, 0, 1);
const expandEase = Easing.bezier(0.5, 0, 0, 1);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const tween = (t: number, start: number, end: number, easing = easeOut) =>
  interpolate(t, [start, end], [0, 1], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const mix = (start: number, end: number, amount: number) => start + (end - start) * amount;
const photo = (name: string): Photo => ({src: `assets/${name}.png`, width: 1024, height: 1536});
const center: FocalPoint = {x: 0.5, y: 0.5, zoom: 1};

export const cameraDefaultProps: CameraProps = {
  photos: {
    wide: photo('editorial-silver-wide'),
    close: photo('editorial-silver-close'),
    detail: photo('editorial-silver-detail'),
  },
  photoFocalPoints: {wide: {...center}, close: {...center}, detail: {...center}},
  brand: 'SERA', productName: 'SILVER\nCONTOUR',
  headline: ['See in a', 'different light.'],
  footer: 'OPTICAL COLLECTION 01', url: 'SERA.STUDIO',
};

export const slicesDefaultProps: SlicesProps = {
  photos: {
    wide: photo('editorial-sunset-wide'),
    turn: photo('editorial-sunset-turn'),
    macro: photo('editorial-sunset-macro'),
  },
  stripFocalPoints: [
    {x: 0.5, y: 0.22, zoom: 1},
    {x: 0.48, y: 0.48, zoom: 1},
    {x: 0.5, y: 0.345, zoom: 1},
    {x: 0.63, y: 0.315, zoom: 1.55},
  ],
  finalFocalPoint: {x: 0.48, y: 0.5, zoom: 1},
  brand: 'SERA', productName: 'AFTER\nHOURS',
  headline: ['A closer', 'point of view.'],
  footer: 'OPTICAL COLLECTION 02', url: 'SERA.STUDIO',
};

function useGeist() {
  const [handle] = useState(() => delayRender('Load bundled Geist font'));
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const font = new FontFace('Geist', `url("${staticFile('assets/GeistVF.woff2')}")`, {weight: '100 900'});
        const fontSet = document.fonts as FontFaceSet & {add: (face: FontFace) => void};
        fontSet.add(await font.load());
        await document.fonts.ready;
        if (active) setLoaded(true);
      } catch (error) {
        console.warn('Geist unavailable; Arial fallback enabled.', String(error));
      } finally {
        continueRender(handle);
      }
    };
    void load();
    return () => {active = false;};
  }, [handle]);
  return loaded;
}

type TextProps = {
  text: string | string[]; x: number; y: number; width: number; height: number;
  size: number; lineHeight: number; weight?: number; align?: 'left' | 'right';
  progress?: number; singleLine?: boolean; fontReady: boolean;
};

function TextBlock({text, x, y, width, height, size, lineHeight, weight = 450,
  align = 'left', progress = 1, singleLine = false, fontReady}: TextProps) {
  const fit = useMemo(() => {
    const lines = (Array.isArray(text) ? text : text.split('\n')).map(String);
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return {size, lines};
    const wrap = (fontSize: number) => {
      context.font = `${weight} ${fontSize}px ${fontReady ? 'Geist' : 'Arial'}`;
      const output: string[] = [];
      for (const original of lines) {
        if (singleLine) {output.push(original); continue;}
        let current = '';
        for (const character of original) {
          const next = current + character;
          if (context.measureText(next).width > width && current.length) {
            const space = current.lastIndexOf(' ');
            if (space > 0) {
              output.push(current.slice(0, space));
              current = current.slice(space + 1) + character;
            } else {output.push(current); current = character;}
          } else {current = next;}
        }
        output.push(current.trim());
      }
      return output;
    };
    let fontSize = size;
    let result = wrap(fontSize);
    while (fontSize > 1 && (result.length * lineHeight * fontSize / size > height ||
      result.some((line) => context.measureText(line).width > width))) {
      fontSize -= 0.25;
      result = wrap(fontSize);
    }
    return {size: fontSize, lines: result};
  }, [text, width, height, size, lineHeight, singleLine, weight, fontReady]);
  return <div data-copy="true" style={{
    position: 'absolute', left: x, top: y, width, height, textAlign: align,
    fontSize: fit.size, lineHeight: `${lineHeight * fit.size / size}px`, fontWeight: weight,
    whiteSpace: 'pre', letterSpacing: 0, opacity: progress,
    translate: `0 ${12 * (1 - progress)}px`, filter: `blur(${2 * (1 - progress)}px)`,
  }}>{fit.lines.join('\n')}</div>;
}

// A focal point is a normalized source coordinate placed at the viewport center.
// The clamped cover rectangle always fills the viewport without distorting the image.
function coverRect(p: Photo, width: number, height: number, focal: FocalPoint) {
  const scale = Math.max(width / p.width, height / p.height) * Math.max(1, focal.zoom);
  const imageWidth = p.width * scale;
  const imageHeight = p.height * scale;
  return {
    x: clamp(width / 2 - focal.x * imageWidth, width - imageWidth, 0),
    y: clamp(height / 2 - focal.y * imageHeight, height - imageHeight, 0),
    width: imageWidth, height: imageHeight,
  };
}

function PhotoFill({p, focal = center, scale = 1, blur = 0, x = 0}: {
  p: Photo; focal?: FocalPoint; scale?: number; blur?: number; x?: number;
}) {
  const rect = coverRect(p, W, H, focal);
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <AbsoluteFill style={{scale, translate: `${x}px 0`, filter: `blur(${blur}px)`}}>
      <Img src={staticFile(p.src)} style={{position: 'absolute', left: rect.x,
        top: rect.y, width: rect.width, height: rect.height, maxWidth: 'none'}} />
    </AbsoluteFill>
  </AbsoluteFill>;
}

function Readability({opacity}: {opacity: number}) {
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 500,
    background: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,${opacity}))`}} />;
}

function LensIcon({size = 40}: {size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17a16 16 0 0 1 27-4l3 4M40 8v9h-9M38 31A16 16 0 0 1 11 35l-3-4M8 40v-9h9" />
    <circle cx="24" cy="24" r="6" />
  </svg>;
}

function CameraChrome({t, p}: {t: number; p: Photo}) {
  const exit = tween(t, 1.2, 1.72);
  if (exit >= 1) return null;
  return <>
    <AbsoluteFill style={{opacity: 1 - exit}}>
      {[1, 2].map((part) => <React.Fragment key={part}>
        <div style={{position: 'absolute', left: W * part / 3, top: 0, width: 1,
          height: H, backgroundColor: 'rgba(255,255,255,.17)'}} />
        <div style={{position: 'absolute', top: H * part / 3, left: 0, height: 1,
          width: W, backgroundColor: 'rgba(255,255,255,.17)'}} />
      </React.Fragment>)}
      <svg width="420" height="340" viewBox="0 0 420 340"
        style={{position: 'absolute', left: 330, top: 480}}>
        <path d="M0 44V0H44 M376 0H420V44 M420 296V340H376 M44 340H0V296"
          stroke="#f8f8f5" strokeWidth="2" fill="none" />
      </svg>
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 0, left: 0, width: W, height: 140,
      backgroundColor: 'rgba(0,0,0,.50)', translate: `0 ${-140 * exit}px`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 68px',
      boxSizing: 'border-box'}}>
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinejoin="round"><path d="M21 2L4 24h12l-3 16 17-23H18z" /></svg>
      <LensIcon />
    </div>
    <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: 300,
      backgroundColor: 'rgba(0,0,0,.65)', translate: `0 ${300 * exit}px`}}>
      <div style={{position: 'absolute', top: 37, width: W, textAlign: 'center', fontSize: 24,
        fontWeight: 500}}>PHOTO</div>
      <div style={{position: 'absolute', left: 488, top: 100, width: 104, height: 104,
        borderRadius: '50%', border: '3px solid #f8f8f5', padding: 7, boxSizing: 'border-box'}}>
        <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#f8f8f5'}} />
      </div>
      <Img src={staticFile(p.src)} style={{position: 'absolute', left: 96, top: 110,
        width: 84, height: 84, objectFit: 'cover', objectPosition: 'center 25%'}} />
      <div style={{position: 'absolute', right: 113, top: 131}}><LensIcon size={42} /></div>
    </div>
  </>;
}

const baseStyle: React.CSSProperties = {
  backgroundColor: '#111', overflow: 'hidden', color: '#f8f8f5',
  fontFamily: 'Geist, Arial, sans-serif', letterSpacing: 0,
};

export const CameraCampaign: React.FC<CameraProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const fontReady = useGeist();
  const key: keyof CameraProps['photos'] = t < 0.76 ? 'wide' : t < 1.01 ? 'close' :
    t < 1.24 ? 'detail' : t < 1.48 ? 'wide' : 'close';
  const cutStart = t < 0.76 ? 0 : t < 1.01 ? 0.76 : t < 1.24 ? 1.01 : t < 1.48 ? 1.24 : 1.48;
  const settle = tween(t, cutStart, cutStart + (cutStart === 0 ? 0.24 : cutStart === 1.48 ? 0.37 : 0.13));
  const push = tween(t, 2.42, 4.2, Easing.linear);
  const scale = t >= 1.48 ? 1 + 0.014 * push : 1 + (cutStart === 0 ? 0.045 : 0.025) * (1 - settle);
  const flash = interpolate(t, [0.68, 0.705, 0.76], [0, 0.38, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={baseStyle} data-font-loaded={fontReady}>
    <PhotoFill p={props.photos[key]} focal={props.photoFocalPoints[key]} scale={scale}
      x={t >= 1.48 ? 36 * (1 - settle) : 0} blur={(cutStart === 0 ? 6 : 3) * (1 - settle)} />
    <CameraChrome t={t} p={props.photos.wide} />
    <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash, pointerEvents: 'none'}} />
    <Readability opacity={0.22 * tween(t, 2.05, 2.42)} />
    <TextBlock text={props.brand} x={770} y={90} width={230} height={60} size={48} lineHeight={56}
      weight={550} align="right" progress={tween(t, 1.85, 2.15)} singleLine fontReady={fontReady} />
    <TextBlock text={props.productName} x={64} y={100} width={260} height={81} size={22} lineHeight={27}
      progress={tween(t, 1.9, 2.2)} fontReady={fontReady} />
    <TextBlock text={props.headline} x={64} y={1590} width={420} height={132} size={38} lineHeight={44}
      progress={tween(t, 2.05, 2.32)} fontReady={fontReady} />
    <TextBlock text={props.footer} x={64} y={1770} width={620} height={48} size={20} lineHeight={24}
      progress={tween(t, 2.1, 2.37)} fontReady={fontReady} />
    <TextBlock text={props.url} x={750} y={1770} width={266} height={48} size={20} lineHeight={24}
      align="right" progress={tween(t, 2.15, 2.42)} singleLine fontReady={fontReady} />
  </AbsoluteFill>;
};

function Strip({p, focal, index, t}: {p: Photo; focal: FocalPoint; index: number; t: number}) {
  const start = 0.6 + index * 0.05;
  const entry = tween(t, start, start + 0.55, stripEase);
  const exit = tween(t, 1.6, 2.22, easeOut);
  const direction = index % 2 === 0 ? -1 : 1;
  const x = direction * W * ((1 - entry) + exit);
  const rect = coverRect(p, W, 480, focal);
  const velocity = Math.abs(tween(t + 1 / 120, start, start + 0.55, stripEase) -
    tween(t - 1 / 120, start, start + 0.55, stripEase));
  const exitVelocity = Math.abs(tween(t + 1 / 120, 1.6, 2.22) - tween(t - 1 / 120, 1.6, 2.22));
  return <div style={{position: 'absolute', left: 0, top: index * 480, width: W, height: 480,
    overflow: 'hidden', translate: `${x}px 0`, filter: `blur(${Math.min(7, (velocity + exitVelocity) * 30)}px)`}}>
    <Img src={staticFile(p.src)} style={{position: 'absolute', left: rect.x, top: rect.y,
      width: rect.width, height: rect.height, maxWidth: 'none'}} />
  </div>;
}

function ExpandingMacro({p, focal, finalFocal, t}: {
  p: Photo; focal: FocalPoint; finalFocal: FocalPoint; t: number;
}) {
  const entry = tween(t, 0.65, 1.2, stripEase);
  const expanded = tween(t, 1.6, 2.22, expandEase);
  const rect = coverRect(p, W, 480, focal);
  const target = coverRect(p, W, H, finalFocal);
  const push = 1 + 0.01 * tween(t, 2.65, 4.2, Easing.linear);
  const imageWidth = mix(rect.width, target.width, expanded);
  const imageHeight = mix(rect.height, target.height, expanded);
  const imageX = mix(rect.x, target.x, expanded);
  const imageY = mix(480 + rect.y, target.y, expanded);
  const velocity = Math.abs(tween(t + 1 / 120, 0.65, 1.2, stripEase) -
    tween(t - 1 / 120, 0.65, 1.2, stripEase));
  // The source image keeps one canvas coordinate system while its clipping window opens.
  return <AbsoluteFill style={{translate: `${W * (1 - entry)}px 0`,
    clipPath: `inset(${480 * (1 - expanded)}px 0 ${960 * (1 - expanded)}px 0)`,
    filter: `blur(${Math.min(7, velocity * 30)}px)`}}>
    <AbsoluteFill style={{scale: push}}>
      <Img src={staticFile(p.src)} style={{position: 'absolute', left: imageX, top: imageY,
        width: imageWidth, height: imageHeight, maxWidth: 'none'}} />
    </AbsoluteFill>
  </AbsoluteFill>;
}

export const PortraitSlices: React.FC<SlicesProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const fontReady = useGeist();
  const topOpacity = interpolate(t, [1.6, 1.73, 2.12, 2.32], [1, 0, 0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const productColorProgress = tween(t, 1.6, 1.82);
  const productColor = `rgb(${Math.round(mix(32, 248, productColorProgress))}, ${Math.round(mix(37, 248, productColorProgress))}, ${Math.round(mix(33, 245, productColorProgress))})`;
  return <AbsoluteFill style={baseStyle} data-font-loaded={fontReady}>
    <PhotoFill p={props.photos.wide} scale={1 + 0.035 * (1 - tween(t, 0, 0.6))} />
    <Strip p={props.photos.turn} focal={props.stripFocalPoints[0]} index={0} t={t} />
    <Strip p={props.photos.wide} focal={props.stripFocalPoints[2]} index={2} t={t} />
    <Strip p={props.photos.turn} focal={props.stripFocalPoints[3]} index={3} t={t} />
    <ExpandingMacro p={props.photos.macro} focal={props.stripFocalPoints[1]}
      finalFocal={props.finalFocalPoint} t={t} />
    <Readability opacity={0.2 * tween(t, 2.22, 2.65)} />
    <div style={{opacity: topOpacity}}>
      <div style={{color: productColor}}>
        <TextBlock text={props.productName} x={64} y={88} width={260} height={81} size={22} lineHeight={27}
          fontReady={fontReady} />
      </div>
      <TextBlock text={props.brand} x={790} y={88} width={226} height={60} size={48} lineHeight={56}
        weight={550} align="right" singleLine fontReady={fontReady} />
    </div>
    <TextBlock text={props.headline} x={64} y={1590} width={460} height={132} size={38} lineHeight={44}
      progress={tween(t, 2.22, 2.55)} fontReady={fontReady} />
    <TextBlock text={props.footer} x={64} y={1770} width={620} height={48} size={20} lineHeight={24}
      progress={tween(t, 2.27, 2.6)} fontReady={fontReady} />
    <TextBlock text={props.url} x={750} y={1770} width={266} height={48} size={20} lineHeight={24}
      align="right" singleLine progress={tween(t, 2.32, 2.65)} fontReady={fontReady} />
  </AbsoluteFill>;
};

const Root: React.FC = () => <>
  <Composition id="pf-camera-campaign" component={CameraCampaign} width={W} height={H}
    fps={60} durationInFrames={252} defaultProps={cameraDefaultProps} />
  <Composition id="pf-portrait-slices" component={PortraitSlices} width={W} height={H}
    fps={60} durationInFrames={252} defaultProps={slicesDefaultProps} />
</>;

registerRoot(Root);
