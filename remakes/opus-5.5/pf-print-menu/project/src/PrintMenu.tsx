import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FONT, useGeist} from './font';
import {Feel, INTRO, Layer, trackLayer} from './motion';

// ---------------------------------------------------------------------------
// Palette + grid
// ---------------------------------------------------------------------------
const BG = '#d0e88b';
const INK = '#141a0c';
const INK_SOFT = 'rgba(20, 26, 12, 0.6)';
const RULE = 'rgba(20, 26, 12, 0.22)';

const M = 64; // outer margin
const PRINT = {w: 440, h: 560, cx: 650, cy: 620};
const PRINT_LEFT = PRINT.cx - PRINT.w / 2; // 430
const PRINT_TOP = PRINT.cy - PRINT.h / 2; // 340
const PRINT_BOTTOM = PRINT.cy + PRINT.h / 2; // 900

type Product = {
  photo: string;
  focus: string;
  zoom?: number; // extra scale to trim an edge of the source photo
  title: [string, string];
};

const PRODUCTS: Product[] = [
  {photo: 'coast.jpg', focus: '50% 50%', title: ['COAST', 'STUDY']},
  {photo: 'forest.jpg', focus: '58% 50%', title: ['GREEN', 'HOURS']},
  {photo: 'desert.jpg', focus: '60% 50%', zoom: 1.03, title: ['DESERT', 'LIGHT']},
];

// ---------------------------------------------------------------------------
// Motion feel per track
// ---------------------------------------------------------------------------
const PHOTO_FEEL: Feel = {
  dist: 170,
  dir: -1, // products travel leftward: in from the right, out to the left
  blur: 3,
  stretch: 0.035,
  dip: 0.016,
  recede: 0.05,
  fadeIn: [0.12, 0.42],
  fadeOut: [0.3, 0.62],
};
const ROW_FEEL = (dir: 1 | -1): Feel => ({
  dist: 150,
  dir,
  blur: 4,
  stretch: 0.045,
  dip: 0.02,
  recede: 0,
  fadeIn: [0.42, 0.84],
  fadeOut: [0.12, 0.54],
});
const ROW1 = ROW_FEEL(1); // word row 1 travels rightward (opposes the product)
const ROW2 = ROW_FEEL(-1); // word row 2 travels leftward (opposes row 1)
const INDEX_FEEL: Feel = {...ROW_FEEL(-1), dist: 28, stretch: 0, dip: 0};

const PHOTO_SUB = {offset: 0, length: 42}; // the full 1.5-2.2s / 3.2-3.9s window
const ROW1_SUB = {offset: 0, length: 36};
const ROW2_SUB = {offset: 6, length: 36};
const INDEX_SUB = {offset: 8, length: 26};

// ---------------------------------------------------------------------------
// Directional (travel-axis) blur via SVG filter
// ---------------------------------------------------------------------------
const BlurDef: React.FC<{id: string; amount: number}> = ({id, amount}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${amount} ${amount * 0.12}`} />
      </filter>
    </defs>
  </svg>
);

const layerStyle = (l: Layer, origin: string): React.CSSProperties => {
  const moving = l.x !== 0 || l.sx !== 1 || l.scale !== 1;
  return {
    opacity: l.opacity,
    transform: moving ? `translate3d(${l.x}px,0,0) scale(${l.scale * l.sx}, ${l.scale})` : undefined,
    transformOrigin: origin,
  };
};

const Moving: React.FC<{
  id: string;
  layer: Layer;
  origin: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({id, layer, origin, style, children}) => {
  if (layer.opacity <= 0.001) return null;
  const blurred = layer.blur > 0.02;
  return (
    <div style={{position: 'absolute', ...style, ...layerStyle(layer, origin)}}>
      {blurred ? <BlurDef id={id} amount={layer.blur} /> : null}
      <div style={{filter: blurred ? `url(#${id})` : undefined}}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Framed print (440 x 560 overall)
// ---------------------------------------------------------------------------
const FRAME = 14;
const MAT = 36;

const FramedPrint: React.FC<{product: Product; lift: number}> = ({product, lift}) => {
  const l = lift;
  const innerW = PRINT.w - FRAME * 2;
  const innerH = PRINT.h - FRAME * 2;
  return (
    <div
      style={{
        width: PRINT.w,
        height: PRINT.h,
        position: 'relative',
        borderRadius: 2,
        background: 'linear-gradient(150deg, #2d3324 0%, #171b10 55%, #0f120a 100%)',
        boxShadow: [
          `0 1px 1px rgba(16, 26, 4, ${0.3 - 0.12 * l})`,
          `0 ${6 + 6 * l}px ${10 + 10 * l}px -2px rgba(24, 40, 6, 0.22)`,
          `0 ${26 + 16 * l}px ${38 + 22 * l}px -10px rgba(28, 46, 6, ${0.34 - 0.06 * l})`,
          `0 ${60 + 24 * l}px ${80 + 30 * l}px -26px rgba(28, 46, 6, ${0.36 - 0.08 * l})`,
        ].join(', '),
      }}
    >
      {/* frame bevel highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.14), inset -1px -1px 0 rgba(0,0,0,0.5)',
        }}
      />
      {/* mat */}
      <div
        style={{
          position: 'absolute',
          left: FRAME,
          top: FRAME,
          width: innerW,
          height: innerH,
          background: 'linear-gradient(180deg, #f7f5ee 0%, #efece2 100%)',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.25)',
        }}
      >
        {/* photo window */}
        <div
          style={{
            position: 'absolute',
            left: MAT,
            top: MAT,
            width: innerW - MAT * 2,
            height: innerH - MAT * 2,
            overflow: 'hidden',
            background: '#222',
          }}
        >
          <Img
            src={staticFile(`assets/${product.photo}`)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: product.focus,
              display: 'block',
              transform: product.zoom ? `scale(${product.zoom})` : undefined,
              transformOrigin: '50% 0%',
            }}
          />
          {/* mat bevel: thin light cut edge + soft inner shadow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,0.55), inset 0 3px 6px rgba(0,0,0,0.28), inset 0 0 0 2px rgba(0,0,0,0.06)',
            }}
          />
        </div>
      </div>
      {/* glazing sheen */}
      <div
        style={{
          position: 'absolute',
          inset: FRAME,
          background:
            'linear-gradient(118deg, rgba(255,255,255,0) 34%, rgba(255,255,255,0.10) 44%, rgba(255,255,255,0.03) 52%, rgba(255,255,255,0) 62%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Typography helpers
// ---------------------------------------------------------------------------
const label: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 560,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: INK_SOFT,
  lineHeight: '16px',
};
const value: React.CSSProperties = {
  fontSize: 23,
  fontWeight: 500,
  letterSpacing: '-0.01em',
  color: INK,
  lineHeight: '28px',
};

const TITLE_SIZE = 112;
const TITLE_LINE = 100;
const TITLE_TOP = 106;
const TITLE_LEFT = PRINT_LEFT - 7; // optical: cancel the capitals' side bearing

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const PrintMenu: React.FC = () => {
  useGeist();
  const frame = useCurrentFrame();
  const photoLayers = PRODUCTS.map((_, i) => trackLayer(frame, i, PHOTO_FEEL, PHOTO_SUB, INTRO));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: `${FONT}, sans-serif`,
        color: INK,
        fontFeatureSettings: '"tnum" 0, "ss01" 0',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ---------------- fixed chrome ---------------- */}
      <div
        style={{
          position: 'absolute',
          left: M,
          right: M,
          top: 48,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 17,
          fontWeight: 640,
          letterSpacing: '0.2em',
          lineHeight: '20px',
        }}
      >
        <span>FIELD PRINTS</span>
        <span style={{fontWeight: 500}}>2026 EDITION</span>
      </div>
      <div style={{position: 'absolute', left: M, right: M, top: 88, height: 1, background: RULE}} />

      {/* spec column, aligned to the print's top edge */}
      <div style={{position: 'absolute', left: M, top: PRINT_TOP - 2, width: 300}}>
        <div style={label}>Format</div>
        <div style={{...value, marginTop: 8}}>11 × 14 in, framed</div>
        <div style={{...label, marginTop: 30}}>Paper</div>
        <div style={{...value, marginTop: 8}}>Cotton rag, 310 gsm</div>
      </div>

      {/* price, baseline-aligned to the print's bottom edge */}
      <div style={{position: 'absolute', left: M, top: PRINT_BOTTOM - 122, width: 300}}>
        <div style={label}>Price</div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 560,
            letterSpacing: '-0.045em',
            lineHeight: '104px',
            marginTop: 14,
            marginLeft: -4,
          }}
        >
          $32
        </div>
      </div>

      {/* footer */}
      <div style={{position: 'absolute', left: M, right: M, top: 968, height: 1, background: RULE}} />
      <div
        style={{
          position: 'absolute',
          left: M,
          top: 996,
          fontSize: 20,
          fontWeight: 520,
          letterSpacing: '0.01em',
          lineHeight: '24px',
        }}
      >
        fieldprints.co
      </div>

      {/* plate index (relays with the products) */}
      <div
        style={{
          position: 'absolute',
          right: M,
          top: 996,
          height: 24,
          width: 120,
          fontSize: 20,
          fontWeight: 520,
          lineHeight: '24px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{position: 'absolute', right: 0, color: INK_SOFT}}>/ 03</span>
        {PRODUCTS.map((p, i) => (
          <Moving
            key={p.photo}
            id={`idx-${i}`}
            layer={trackLayer(frame, i, INDEX_FEEL, INDEX_SUB, INTRO)}
            origin="right center"
            style={{right: 50, top: 0}}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
          </Moving>
        ))}
      </div>

      {/* ---------------- relayed products ----------------
          The leaving print stays on top and dissolves away, revealing the arriving one beneath. */}
      {PRODUCTS.map((p, i) => (
        <Moving
          key={p.photo}
          id={`photo-${i}`}
          layer={photoLayers[i]}
          origin="50% 50%"
          style={{left: PRINT_LEFT, top: PRINT_TOP, width: PRINT.w, height: PRINT.h, zIndex: 12 - i}}
        >
          <FramedPrint product={p} lift={photoLayers[i].blur / PHOTO_FEEL.blur} />
        </Moving>
      ))}

      {/* ---------------- relayed word rows ---------------- */}
      {PRODUCTS.map((p, i) => (
        <React.Fragment key={p.title.join('-')}>
          <Moving
            id={`row1-${i}`}
            layer={trackLayer(frame, i, ROW1, ROW1_SUB, {start: 2, end: 30})}
            origin="0% 50%"
            style={{left: TITLE_LEFT, top: TITLE_TOP, height: TITLE_LINE, zIndex: 20 + i}}
          >
            <div style={{fontSize: TITLE_SIZE, lineHeight: `${TITLE_LINE}px`, fontWeight: 720, letterSpacing: '-0.045em', whiteSpace: 'nowrap'}}>
              {p.title[0]}
            </div>
          </Moving>
          <Moving
            id={`row2-${i}`}
            layer={trackLayer(frame, i, ROW2, ROW2_SUB, {start: 5, end: 33})}
            origin="0% 50%"
            style={{left: TITLE_LEFT, top: TITLE_TOP + TITLE_LINE, height: TITLE_LINE, zIndex: 20 + i}}
          >
            <div style={{fontSize: TITLE_SIZE, lineHeight: `${TITLE_LINE}px`, fontWeight: 300, letterSpacing: '-0.04em', whiteSpace: 'nowrap'}}>
              {p.title[1]}
            </div>
          </Moving>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
