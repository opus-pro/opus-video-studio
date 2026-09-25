import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {loadFont, loadTone, type ToneImage} from './assets';
import {drawDither} from './dither';
import {buildTitle, drawTitle, type TitleSet} from './title';
import {CORAL, DITHER_H, DITHER_W, DITHER_X, DITHER_Y, FONT, GREEN, H, M, W, col, row} from './theme';

type Ready = {tone: ToneImage; title: TitleSet};

const base: React.CSSProperties = {
  position: 'absolute',
  fontFamily: `${FONT}, sans-serif`,
  color: GREEN,
  margin: 0,
  whiteSpace: 'nowrap',
  fontFeatureSettings: '"tnum" 1, "ss01" 1',
};

const Rule: React.FC<{y: number}> = ({y}) => (
  <div style={{position: 'absolute', left: M, top: y, width: W - 2 * M, height: 2, backgroundColor: GREEN}} />
);

const FOOTER: {label: string; value: string}[] = [
  {label: 'Date', value: 'Sat, October 24, 2026'},
  {label: 'Time', value: '09:30 – 18:00'},
  {label: 'Place', value: 'Alder Ridge Meadow'},
  {label: 'Tickets', value: 'fieldforum.org'},
];

const Header: React.FC = () => (
  <>
    <p style={{...base, left: M, top: M - 6, fontSize: 30, fontWeight: 760, letterSpacing: '0.02em', lineHeight: '36px'}}>
      FIELD FORUM
    </p>
    <p
      style={{
        ...base,
        right: M,
        top: M - 6,
        fontSize: 18,
        fontWeight: 560,
        letterSpacing: '0.1em',
        lineHeight: '36px',
        textTransform: 'uppercase',
      }}
    >
      No. 07 — Autumn Edition
    </p>
    <Rule y={row(2) - 2} />
  </>
);

const Descriptor: React.FC = () => (
  <p
    style={{
      ...base,
      left: col(21),
      top: row(3) - 6,
      width: W - M - col(21),
      whiteSpace: 'normal',
      fontSize: 22,
      fontWeight: 480,
      lineHeight: '30px',
      letterSpacing: '-0.005em',
    }}
  >
    A one-day forum on design that moves. Talks, workshops and slow walks — held outdoors.
  </p>
);

const Footer: React.FC = () => (
  <>
    <Rule y={row(28)} />
    {FOOTER.map((item, i) => (
      <div key={item.label} style={{position: 'absolute', left: col(i * 7), top: row(28) + 20}}>
        <p
          style={{
            ...base,
            position: 'relative',
            fontSize: 14,
            fontWeight: 620,
            letterSpacing: '0.14em',
            lineHeight: '18px',
            textTransform: 'uppercase',
          }}
        >
          {item.label}
        </p>
        <p style={{...base, position: 'relative', marginTop: 8, fontSize: 24, fontWeight: 540, lineHeight: '28px', letterSpacing: '-0.01em'}}>
          {item.value}
        </p>
      </div>
    ))}
  </>
);

export const PixelPoster: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('Loading Geist and mountains.jpg'));
  const [ready, setReady] = useState<Ready | null>(null);
  const released = useRef(false);
  const titleRef = useRef<HTMLCanvasElement>(null);
  const ditherRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    Promise.all([loadFont(), loadTone(), document.fonts.ready])
      .then(([, tone]) => setReady({tone, title: buildTitle()}))
      .catch((err) => cancelRender(err));
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const t = titleRef.current?.getContext('2d');
    const d = ditherRef.current?.getContext('2d');
    if (!t || !d) return;
    drawDither(d, ready.tone, frame);
    drawTitle(t, ready.title, frame);
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [ready, frame, handle]);

  return (
    <AbsoluteFill style={{backgroundColor: CORAL}}>
      <canvas
        ref={ditherRef}
        width={DITHER_W}
        height={DITHER_H}
        style={{position: 'absolute', left: DITHER_X, top: DITHER_Y, width: DITHER_W, height: DITHER_H}}
      />
      <canvas ref={titleRef} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}} />
      {ready ? (
        <>
          <Header />
          <Descriptor />
          <Footer />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
