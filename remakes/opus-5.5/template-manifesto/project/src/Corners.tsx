import React from 'react';
import {AbsoluteFill} from 'remotion';
import {outCubic, outExpo, prog} from './anim';
import {SANS} from './text';

const INSET = 28;
const ARM = 22;
const LINE = 'rgba(214,186,138,0.62)';

const Bracket: React.FC<{corner: 'tl' | 'tr' | 'bl' | 'br'; k: number}> = ({corner, k}) => {
  const top = corner[0] === 't';
  const lft = corner[1] === 'l';
  const len = ARM * k;
  const pos: React.CSSProperties = {
    position: 'absolute',
    [top ? 'top' : 'bottom']: INSET,
    [lft ? 'left' : 'right']: INSET,
    width: ARM,
    height: ARM,
  };
  return (
    <div style={pos}>
      <div style={{position: 'absolute', [top ? 'top' : 'bottom']: 0, [lft ? 'left' : 'right']: 0, width: len, height: 1, background: LINE}} />
      <div style={{position: 'absolute', [top ? 'top' : 'bottom']: 0, [lft ? 'left' : 'right']: 0, width: 1, height: len, background: LINE}} />
    </div>
  );
};

const Label: React.FC<{corner: 'tl' | 'tr' | 'bl' | 'br'; text: string; t: number; start: number}> = ({corner, text, t, start}) => {
  const top = corner[0] === 't';
  const lft = corner[1] === 'l';
  const k = outExpo(prog(t, start, start + 26));
  const o = outCubic(prog(t, start, start + 18));
  return (
    <div
      style={{
        position: 'absolute',
        [top ? 'top' : 'bottom']: INSET - 5,
        [lft ? 'left' : 'right']: INSET + ARM + 12,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: 10,
        lineHeight: '10px',
        letterSpacing: `${(0.32 + 0.18 * (1 - k)).toFixed(3)}em`,
        textTransform: 'uppercase',
        color: 'rgba(226,204,166,0.78)',
        opacity: o,
        transform: `translateX(${((lft ? -1 : 1) * 8 * (1 - k)).toFixed(2)}px)`,
        whiteSpace: 'nowrap',
        // letter-spacing trails the last glyph; pull it back on right-aligned labels
        marginRight: lft ? undefined : '-0.32em',
      }}
    >
      {text}
    </div>
  );
};

export const Corners: React.FC<{t: number}> = ({t}) => {
  if (t < 220) return null;
  const k = (d: number) => outExpo(prog(t, 222 + d, 248 + d));
  return (
    <AbsoluteFill>
      <Bracket corner="tl" k={k(0)} />
      <Bracket corner="tr" k={k(3)} />
      <Bracket corner="br" k={k(6)} />
      <Bracket corner="bl" k={k(9)} />
      <Label corner="tl" text="A Manifesto" t={t} start={228} />
      <Label corner="tr" text="Nº 01" t={t} start={231} />
      <Label corner="bl" text="MMXXVI" t={t} start={234} />
      <Label corner="br" text="Say less · Mean more" t={t} start={237} />
    </AbsoluteFill>
  );
};
