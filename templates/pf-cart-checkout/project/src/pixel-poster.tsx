import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, Img, staticFile} from 'remotion';
import {Scene, TextLine, linear, progress, useTime} from './shared';

export const pixelDefaults = {title: ['DESIGN', 'IN MOTION', 'OCTOBER 24'], replacement: 'IN THE OPEN', brand: 'FIELD FORUM', date: 'OCTOBER 24', city: 'SAN FRANCISCO', cta: 'RESERVE YOUR SEAT', photo: 'mountains.jpg', background: '#f0aca2', ink: '#192021'};
export type PixelProps = typeof pixelDefaults;
const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const hash = (x: number, y: number) => (((x * 73856093) ^ (y * 19349663) ^ 48271) >>> 0) % 997 / 997;
const MountainDither: React.FC<{photo: string; background: string; ink: string}> = ({photo, background, ink}) => {
  const t = useTime(); const canvas = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [handle] = useState(() => delayRender('Decode and dither bundled mountain photo'));
  useLayoutEffect(() => {
    if (!source || !canvas.current) return;
    const sample = document.createElement('canvas'); sample.width = 180; sample.height = 133;
    const context = sample.getContext('2d', {willReadFrequently: true})!;
    const cropHeight = source.naturalHeight; const cropWidth = cropHeight * 1020 / 750;
    const available = Math.max(0, source.naturalWidth - cropWidth);
    const offset = Math.min(available, source.naturalWidth * .05) * linear(t, 0, 4.8);
    context.drawImage(source, (available - Math.min(available, source.naturalWidth * .05)) / 2 + offset, 0, cropWidth, cropHeight, 0, 0, 180, 133);
    const pixels = context.getImageData(0, 0, 180, 133).data;
    const output = canvas.current.getContext('2d')!;
    output.fillStyle = background; output.fillRect(0, 0, 1020, 750); output.fillStyle = ink;
    for (let y = 0; y < 133; y++) for (let x = 0; x < 180; x++) {
      const at = (y * 180 + x) * 4;
      const luminance = (pixels[at] * .2126 + pixels[at + 1] * .7152 + pixels[at + 2] * .0722) / 255;
      if (luminance < (bayer[y % 4][x % 4] + .5) / 16) {
        output.beginPath(); output.arc((x + .5) * 1020 / 180, (y + .5) * 750 / 133, 2.4, 0, Math.PI * 2); output.fill();
      }
    }
    continueRender(handle);
  }, [source, t, background, ink, handle]);
  return <><Img src={staticFile(`assets/${photo}`)} onLoad={event => setSource(event.currentTarget)} style={{position: 'absolute', width: 1, height: 1, opacity: 0}}/><canvas ref={canvas} width={1020} height={750} style={{position: 'absolute', left: 330, top: 600, width: 1020, height: 750}}/></>;
};
const GridMask: React.FC<{id: string; threshold: number; height: number}> = ({id, threshold, height}) => <svg width="0" height="0" style={{position: 'absolute'}}><defs><clipPath id={id} clipPathUnits="userSpaceOnUse">{Array.from({length: Math.ceil(height / 42)}, (_, y) => Array.from({length: 29}, (_, x) => hash(x, y) <= threshold ? <rect key={`${x}-${y}`} x={x * 42} y={y * 42} width={42.1} height={42.1}/> : null))}</clipPath></defs></svg>;
const PixelContent: React.FC<PixelProps> = ({title, replacement, brand, date, city, cta, photo, background, ink}) => {
  const t = useTime(); const reveal = .05 + .95 * linear(t, 0, 1.05);
  const changing = progress(t, 1.6, 2.1); const replacementReveal = linear(t, 1.75, 2.25);
  const lines = [title[0] ?? '', title[1] ?? '', title[2] === pixelDefaults.title[2] ? date : title[2] ?? ''];
  return <>
    <MountainDither photo={photo} background={background} ink={ink}/>
    <TextLine text={brand} size={24} width={1100} weight={500} style={{position: 'absolute', left: 80, top: 85}}/>
    <GridMask id="title-grid" threshold={reveal} height={370}/><GridMask id="replacement-grid" threshold={replacementReveal} height={118}/>
    <div style={{position: 'absolute', left: 80, top: 220, width: 1190, height: 370, clipPath: reveal >= 1 ? 'none' : 'url(#title-grid)'}}>
      <TextLine text={lines[0]} size={116} width={1190} weight={650} style={{position: 'absolute', top: 0, lineHeight: '121.8px'}}/>
      <div style={{position: 'absolute', top: 121.8, width: 1190, height: 118, overflow: 'hidden'}}>
        <TextLine text={lines[1]} size={102} width={1190} weight={650} style={{position: 'absolute', lineHeight: '107.1px', transform: `translateY(${-118 * changing}px)`}}/>
        <div style={{position: 'absolute', width: 1190, height: 118, clipPath: replacementReveal >= 1 ? 'none' : 'url(#replacement-grid)'}}><TextLine text={replacement} size={102} width={1190} weight={650} style={{lineHeight: '107.1px'}}/></div>
      </div>
      <TextLine text={lines[2]} size={84} width={1190} weight={650} style={{position: 'absolute', top: 242, lineHeight: '88.2px'}}/>
    </div>
    {t < .85 ? <div style={{position: 'absolute', left: 80, top: 220, width: 1190, height: 370, overflow: 'hidden', opacity: 1 - linear(t, .55, .85)}}>{Array.from({length: 9}, (_, y) => Array.from({length: 29}, (_, x) => hash(x + 41, y + 67) < .09 && hash(x, y) > reveal ? <div key={`${x}-${y}`} style={{position: 'absolute', left: x * 42, top: y * 42, width: 42, height: 42, background: ink}}/> : null))}</div> : null}
    <div style={{position: 'absolute', left: 0, top: 1194, width: 1350, height: 76, background}}/>
    <div style={{position: 'absolute', left: 80, top: 1220, width: 1190, display: 'flex', justifyContent: 'space-between'}}><TextLine text={city} size={20} width={550} weight={500}/><TextLine text={cta} size={20} width={550} weight={500} style={{textAlign: 'right'}}/></div>
  </>;
};
export const PixelPoster: React.FC<PixelProps> = props => <Scene background={props.background} color={props.ink}><PixelContent {...props}/></Scene>;
