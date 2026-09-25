import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Theme} from './themes';

export const PAGE_W = 780;
export const PAGE_H = 439;
const PAD = 32;

const IMG = {
  hero: staticFile('generated-assets/alpine-valley.png'),
  ridge: staticFile('generated-assets/ridge-meadow.png'),
  lake: staticFile('generated-assets/rowboat-lake.png'),
  desert: staticFile('generated-assets/sandstone-desert.png'),
};

const Photo: React.FC<{src: string; t: Theme; radius: number; style: React.CSSProperties; position?: string}> = ({
  src,
  t,
  radius,
  style,
  position = 'center',
}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: radius, background: t.surface, ...style}}>
    <Img
      src={src}
      style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, filter: t.imgFilter, display: 'block'}}
    />
    <div style={{position: 'absolute', inset: 0, background: t.imgOverlay, mixBlendMode: t.imgBlend}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: `inset 0 0 0 1px ${t.rule}`}} />
  </div>
);

const Nav: React.FC<{t: Theme}> = ({t}) => (
  <div
    style={{
      position: 'absolute',
      left: PAD,
      right: PAD,
      top: 0,
      height: 46,
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${t.rule}`,
    }}
  >
    <div
      style={{
        fontFamily: t.headFont,
        fontSize: t.logoSize,
        fontStyle: t.headStyle,
        fontWeight: t.headWeight,
        textTransform: t.headTransform,
        letterSpacing: t.logoTracking,
        color: t.ink,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      Meridian
    </div>
    <div style={{marginLeft: 30, display: 'flex', gap: 20, fontFamily: t.uiFont, fontSize: 10.5, color: t.muted}}>
      {['Journal', 'Routes', 'Field guides', 'About'].map((l, i) => (
        <span key={l} style={{color: i === 0 ? t.ink : t.muted, fontWeight: i === 0 ? 600 : 400, position: 'relative'}}>
          {l}
          {i === 0 ? (
            <span style={{position: 'absolute', left: 0, right: 0, bottom: -6, height: 1.5, background: t.accent}} />
          ) : null}
        </span>
      ))}
    </div>
    <div style={{flex: 1}} />
    <span style={{fontFamily: t.uiFont, fontSize: 10.5, color: t.muted, marginRight: 16}}>Sign in</span>
    <div
      style={{
        fontFamily: t.uiFont,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '6px 13px',
        borderRadius: t.buttonRadius,
        color: t.buttonFilled ? t.onAccent : t.accent,
        background: t.buttonFilled ? t.accent : 'transparent',
        boxShadow: t.buttonFilled ? 'none' : `inset 0 0 0 1.2px ${t.accent}`,
        lineHeight: 1,
      }}
    >
      Subscribe
    </div>
  </div>
);

const Hero: React.FC<{t: Theme}> = ({t}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: PAD,
        top: 60,
        width: 300,
        height: 238,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: t.uiFont,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: t.accent,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{width: 18, height: 1.5, background: t.accent, display: 'inline-block'}} />
        Issue 14 · High country
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: t.headFont,
          fontSize: t.headSize,
          fontWeight: t.headWeight,
          fontStyle: t.headStyle,
          textTransform: t.headTransform,
          letterSpacing: t.headTracking,
          lineHeight: t.headLine,
          color: t.ink,
          whiteSpace: 'nowrap',
        }}
      >
        The long way
        <br />
        through the
        <br />
        high country
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: t.bodyFont,
          fontWeight: t.bodyWeight,
          fontSize: 11.5,
          lineHeight: 1.52,
          color: t.muted,
          width: 290,
        }}
      >
        Seven slow routes across ridgelines, still lakes and red-rock canyons, walked end to end with nothing to do but
        look.
      </div>
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: t.uiFont,
          fontSize: 10,
          color: t.muted,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: t.accent,
            color: t.onAccent,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          IA
        </div>
        <span>
          By <span style={{color: t.ink, fontWeight: 600}}>Ines Aldana</span>
        </span>
        <span style={{width: 3, height: 3, borderRadius: 9, background: t.muted, opacity: 0.6}} />
        <span>12 min read</span>
      </div>
    </div>

    <Photo src={IMG.hero} t={t} radius={t.radius} position="50% 55%" style={{left: 356, top: 62, width: 392, height: 234}} />
    <div
      style={{
        position: 'absolute',
        left: 368,
        top: 74,
        padding: '5px 9px',
        borderRadius: Math.min(t.buttonRadius, 999),
        background: t.bg,
        color: t.ink,
        fontFamily: t.uiFont,
        fontSize: 8,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      Photo essay
    </div>
    <div
      style={{
        position: 'absolute',
        left: 356,
        top: 303,
        width: 392,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: t.bodyFont,
        fontWeight: t.bodyWeight,
        fontSize: 9,
        color: t.muted,
        whiteSpace: 'nowrap',
      }}
    >
      <span>The north valley at first light</span>
      <span>Photograph by Theo Marsh</span>
    </div>
  </>
);

const CARDS = [
  {src: IMG.ridge, kicker: 'Trail notes', title: 'Nine days on the meadow line', meta: '8 min read', pos: '40% 60%'},
  {src: IMG.lake, kicker: 'Still water', title: 'A rowboat, a lake, no signal', meta: '6 min read', pos: '50% 70%'},
  {src: IMG.desert, kicker: 'Desert', title: 'Reading red rock country', meta: '10 min read', pos: '60% 50%'},
];

const More: React.FC<{t: Theme}> = ({t}) => {
  const cardW = (PAGE_W - PAD * 2 - 40) / 3;
  return (
    <>
      <div style={{position: 'absolute', left: PAD, right: PAD, top: 327, height: 1, background: t.rule}} />
      <div
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: 337,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: t.uiFont,
          lineHeight: 1,
        }}
      >
        <span style={{fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.ink}}>
          More from Issue 14
        </span>
        <span style={{fontSize: 9.5, fontWeight: 600, color: t.accent}}>View all →</span>
      </div>
      {CARDS.map((c, i) => (
        <div key={c.title} style={{position: 'absolute', left: PAD + i * (cardW + 20), top: 357, width: cardW, height: 62}}>
          <Photo src={c.src} t={t} radius={t.thumbRadius} position={c.pos} style={{left: 0, top: 0, width: 86, height: 62}} />
          <div style={{position: 'absolute', left: 98, top: 1, right: 0}}>
            <div
              style={{
                fontFamily: t.uiFont,
                fontSize: 8,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: t.accent,
                lineHeight: 1,
              }}
            >
              {c.kicker}
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: t.headFont,
                fontStyle: t.headStyle,
                fontWeight: t.cardTitleWeight,
                fontSize: t.cardTitleSize,
                lineHeight: 1.18,
                color: t.ink,
              }}
            >
              {c.title}
            </div>
            <div style={{marginTop: 5, fontFamily: t.uiFont, fontSize: 8.5, color: t.muted, lineHeight: 1}}>{c.meta}</div>
          </div>
        </div>
      ))}
    </>
  );
};

export const Page: React.FC<{t: Theme}> = ({t}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: PAGE_W,
      height: PAGE_H,
      background: t.bgImage,
      backgroundColor: t.bg,
      color: t.ink,
      overflow: 'hidden',
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    <Nav t={t} />
    <Hero t={t} />
    <More t={t} />
  </div>
);
