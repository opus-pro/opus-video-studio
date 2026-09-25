import React, {useLayoutEffect, useRef} from 'react';
import {Scene, TextLine, linear, progress, useTime} from './shared';

export const colorDefaults = {title: 'FIELD', secondTitle: 'STUDIO', firstSubtitle: 'A fresh perspective.', secondSubtitle: 'Made for what is next.', launchSubtitle: 'Launching October 24.', footer: 'FIELD.STUDIO', coral: '#ff7f73', ice: '#b6dcee', green: '#144b41', white: '#f2f7ef', ink: '#142f28'};
export type ColorProps = typeof colorDefaults;
const rgb = (hex: string) => [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
const Field: React.FC<Pick<ColorProps, 'coral' | 'ice' | 'green' | 'white'>> = ({coral, ice, green, white}) => {
  const t = useTime(); const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const context = canvas.current!.getContext('2d')!;
    const data = context.createImageData(320, 180);
    const palette = [rgb(coral), rgb(white), rgb(ice)]; const edge = rgb(green);
    const shift = 160 * t / 5.6;
    // Broad, open bands use periods of at least 2304 source pixels. No radial fields.
    for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) {
      const px = x * 6 - shift; const py = y * 6;
      const band = .5 + .5 * Math.sin((py + px * .24) / 2800 * Math.PI * 2 - 1.55 + .12 * Math.cos(px / 2600 * Math.PI * 2));
      const palettePosition = band * 2;
      const low = Math.min(1, Math.floor(palettePosition));
      const weight = palettePosition - low;
      const centerLight = .5 + .5 * Math.cos((px - 960) / 2500 * Math.PI * 2);
      const edgeWeight = .64 * (1 - centerLight) ** 2;
      const offset = (y * 320 + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const base = palette[low][channel] * (1 - weight) + palette[low + 1][channel] * weight;
        data.data[offset + channel] = Math.round(base * (1 - edgeWeight) + edge[channel] * edgeWeight);
      }
      data.data[offset + 3] = 255;
    }
    context.putImageData(data, 0, 0);
  }, [t, coral, ice, green, white]);
  return <canvas ref={canvas} width={320} height={180} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}}/>;
};
const ColorContent: React.FC<ColorProps> = props => {
  const {title, secondTitle, firstSubtitle, secondSubtitle, launchSubtitle, footer} = props;
  const t = useTime(); const expand = progress(t, 1.5, 2.2);
  const subtitleY = 620 + 55 * expand; const subtitleSize = 52 - 10 * expand;
  const replacement = progress(t, 2.75, 3.4);
  return <>
    <Field {...props}/>
    <div style={{position: 'absolute', left: 410, top: 350, width: 1100, height: 180, textAlign: 'center', opacity: 1 - progress(t, 1.5, 1.8), clipPath: `inset(0 ${expand * 50}% 0 ${expand * 50}%)`}}><TextLine text={title} size={152} width={1100} weight={600} style={{lineHeight: '180px'}}/></div>
    <div style={{position: 'absolute', left: 410, top: 295, width: 1100, height: 290, textAlign: 'center', clipPath: `inset(0 ${50 * (1 - expand)}% 0 ${50 * (1 - expand)}%)`, opacity: linear(t, 1.5, 1.67), paddingTop: 15, boxSizing: 'border-box'}}>
      <TextLine text={title} size={124} width={1100} weight={600} style={{lineHeight: '130px'}}/>
      <TextLine text={secondTitle} size={124} width={1100} weight={600} style={{lineHeight: '130px'}}/>
    </div>
    <div style={{position: 'absolute', left: 360, top: subtitleY, width: 1200, textAlign: 'center'}}>
      {[firstSubtitle, secondSubtitle].map((line, row) => {
        const entrance = progress(t, row * .07, .53 + row * .07);
        return <div key={row} style={{position: 'relative', height: 62, overflow: 'hidden', opacity: entrance, transform: `translateY(${36 * (1 - entrance)}px)`, filter: `blur(${8 * (1 - entrance)}px)`}}>
          <TextLine text={line} size={subtitleSize} width={1200} weight={row === 0 ? 600 : 400} style={{position: 'absolute', lineHeight: '62px', transform: `translateY(${-62 * replacement * row}px)`}}/>
          {row === 1 ? <TextLine text={launchSubtitle} size={42} width={1200} weight={400} style={{position: 'absolute', lineHeight: '62px', transform: `translateY(${62 * (1 - replacement)}px)`}}/> : null}
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 460, top: 900, width: 1000, textAlign: 'center', opacity: progress(t, 3.4, 3.9), transform: `translateY(${14 * (1 - progress(t, 3.4, 3.9))}px)`}}><TextLine text={footer} size={24} width={1000} weight={500}/></div>
  </>;
};
export const ColorField: React.FC<ColorProps> = props => <Scene background={props.white} color={props.ink}><ColorContent {...props}/></Scene>;
