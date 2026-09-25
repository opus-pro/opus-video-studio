import React from 'react';
import {Img, staticFile} from 'remotion';
import {Scene, TextLine, linear, progress, useTime} from './shared';

export const depthDefaults = {first: ['A wider', 'point of view.'], second: ['Find your', 'next perspective.'], brand: 'FIELD NOTES', footer: 'FIELD.STUDIO', photos: ['coast.jpg', 'forest.jpg', 'desert.jpg', 'mountains.jpg']};
export type DepthProps = typeof depthDefaults;
const DepthContent: React.FC<DepthProps> = ({first, second, brand, footer, photos}) => {
  const t = useTime();
  // The final half-speed integral brakes the orbit without a velocity discontinuity.
  const orbit = t <= .65 ? 0 : t < 3.7 ? (t - .65) / 3.05 * 100 : 100 + (100 / 3.05) * .75 * (linear(t, 3.7, 4.45) - .5 * linear(t, 3.7, 4.45) ** 2);
  const spread = 60 * progress(t, 3.7, 4.45);
  return <>
    {Array.from({length: 8}, (_, i) => {
      const angle = (i * 45 + 22.5 + orbit) * Math.PI / 180;
      const depth = (Math.cos(angle) + 1) / 2;
      const targetScale = .45 + .65 * depth;
      const enter = progress(t, .02 + (i % 4) * .065, .65);
      const visibleAtStart = i % 2 === 0;
      const scale = visibleAtStart ? targetScale : .25 + (targetScale - .25) * enter;
      const blur = visibleAtStart ? 8 * (1 - depth) : 12 * (1 - enter) + 8 * (1 - depth) * enter;
      const x = 960 + (800 + spread) * Math.cos(angle);
      const y = 540 + (470 + spread * .3) * Math.sin(angle);
      const tilt = 8 * Math.sin(angle * .7 + i);
      return <Img key={i} src={staticFile(`assets/${photos[i % photos.length]}`)} style={{position: 'absolute', left: x - 130, top: y - 170, width: 260, height: 340, objectFit: 'cover', transform: `rotate(${angle * 180 / Math.PI}deg) rotate(${-angle * 180 / Math.PI + tilt}deg) scale(${scale})`, opacity: visibleAtStart ? 1 : .2 + .8 * enter, filter: `blur(${blur}px)`, zIndex: Math.round(depth * 10)}}/>;
    })}
    <div style={{position: 'absolute', left: 510, top: 230, width: 900, textAlign: 'center', zIndex: 20}}><TextLine text={brand} size={24} width={900} weight={500}/></div>
    <div style={{position: 'absolute', left: 510, top: 440, width: 900, zIndex: 20, textAlign: 'center'}}>
      {first.slice(0, 2).map((line, row) => {
        const enter = progress(t, .1 + row * .08, .52 + row * .08);
        const change = progress(t, 3.7 + row * .07, 4.12 + row * .07);
        return <div key={row} style={{position: 'relative', height: 100, overflow: 'hidden'}}>
          <TextLine text={line} size={94} width={900} style={{position: 'absolute', lineHeight: '100px', transform: `translateY(${32 * (1 - enter) - 100 * change}px)`, opacity: enter, filter: `blur(${8 * (1 - enter)}px)`}}/>
          <TextLine text={second[row] ?? ''} size={88} width={900} style={{position: 'absolute', lineHeight: '100px', transform: `translateY(${100 * (1 - change)}px)`}}/>
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 80, top: 990, width: 500, textAlign: 'left', zIndex: 20, opacity: progress(t, 4.45, 4.85), transform: `translateY(${12 * (1 - progress(t, 4.45, 4.85))}px)`}}><TextLine text={footer} size={24} width={500} weight={500}/></div>
  </>;
};
export const DepthSwirl: React.FC<DepthProps> = props => <Scene background="#171b1c"><DepthContent {...props}/></Scene>;
