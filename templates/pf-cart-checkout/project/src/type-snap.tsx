import React from 'react';
import {Scene, TextLine, progress, snap, useTime} from './shared';

export const typeDefaults = {first: ['MAKE', 'SOMETHING', 'MATTER.'], second: ['IDEAS', 'INTO', 'ACTION.'], brand: 'FIELD DAYS', date: 'OCT 24-25', city: 'SAN FRANCISCO', accent: '#c9ef8a'};
export type TypeProps = typeof typeDefaults;
const TypeContent: React.FC<TypeProps> = ({first, second, brand, date, city, accent}) => {
  const t = useTime();
  return <>
    <TextLine text={brand} size={22} width={700} weight={500} style={{position: 'absolute', left: 80, top: 80}}/>
    <div style={{position: 'absolute', left: 56, top: 350, width: 944, height: 610, overflow: 'hidden'}}>
      {[first, second].map((words, group) => words.slice(0, 3).map((word, row) => {
        const entranceStart = group ? 2.03 + row * .07 : row * .07;
        const p = progress(t, entranceStart, entranceStart + (group ? .6 : .56), snap);
        const departure = group ? 0 : progress(t, 1.85 + row * .05, 2.2 + row * .05);
        const rawEntrance = 1400 * (1 - p);
        // Preserve the entry velocity and smoothly bound the settle beyond x80 to 24px.
        const entrance = rawEntrance < 0 ? 24 * Math.tanh(rawEntrance / 24) : rawEntrance;
        const x = entrance - 1500 * departure;
        const moving = t >= entranceStart && t < entranceStart + (group ? .6 : .56);
        const blur = moving ? Math.max(0, 6 * (1 - Math.min(1, p))) : 0;
        return <TextLine key={`${group}-${row}`} text={word} size={group ? 144 : row === 1 ? 116 : 136} width={920} weight={650} style={{position: 'absolute', top: row * 160, left: 24, height: 160, lineHeight: '160px', color: row === 2 ? accent : '#f6f8f4', transform: `translateX(${x}px)`, filter: `blur(${blur}px)`}}/>;
      }))}
    </div>
    <div style={{position: 'absolute', right: 80, bottom: 80, textAlign: 'right', fontSize: 22, lineHeight: '32px', fontWeight: 500, maxWidth: 700}}><TextLine text={date} size={22} width={700} weight={500}/><TextLine text={city} size={22} width={700} weight={500}/></div>
  </>;
};
export const TypeSnap: React.FC<TypeProps> = props => <Scene background="#181b1c"><TypeContent {...props}/></Scene>;
