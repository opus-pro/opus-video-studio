import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FieldApp, UI_H, UI_W} from './FieldApp';
import {ensureFont} from './font';
import {blurAt, indicatorOpacityAt, scrollAt, sectionAt} from './timing';

ensureFont();

// Photographed screen boundary in the 1254px source image (x438..793, y187..936 inclusive).
const SRC = 1254;
export const SCREEN = {x: 438, y: 187, w: 356, h: 750};
// Per-corner radii (rx / ry, source px) fitted to the photo's anti-aliased green corners
// (measured arc centres TL 475.5,223.0  TR 756.5,223.1  BL 477.9,897.6  BR 755.9,899.3).
const SCREEN_RADIUS = '37.4px 37.5px 38.1px 39.9px / 36px 36.1px 37.7px 39.4px';
// Despill plate: the measured green region (438.65..793.44 x 186.17..936.82) grown by ~1.2px so its anti-aliased edge lands on the black bezel, not on the green.
const DESPILL = {x: 437.45, y: 184.97, w: 357.19, h: 753.05, radius: '38px 38.1px 38.7px 40.4px'};

export const PhoneHand: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const s = width / SRC; // source px -> canvas px

  const scroll = scrollAt(frame);
  const blur = blurAt(frame);
  const indicator = indicatorOpacityAt(frame);
  const section = sectionAt(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#c9c9c7'}}>
      {/* Fixed full-frame plate */}
      <Img
        src={staticFile('assets/hand-phone.png')}
        style={{position: 'absolute', left: 0, top: 0, width, height: width}}
      />
      {/* Everything below lives in source-photo pixels, scaled to canvas. */}
      <div style={{position: 'absolute', left: 0, top: 0, width: SRC, height: SRC, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        {/* Despill: the photo's anti-aliased green edge (row 186) gets the display's black border. */}
        <div
          style={{
            position: 'absolute',
            left: DESPILL.x,
            top: DESPILL.y,
            width: DESPILL.w,
            height: DESPILL.h,
            borderRadius: DESPILL.radius,
            background: '#090c0d',
          }}
        />
        {/* Screen: editable app UI, masked to the photographed display */}
        <div
          style={{
            position: 'absolute',
            left: SCREEN.x,
            top: SCREEN.y,
            width: UI_W,
            height: UI_H,
            borderRadius: SCREEN_RADIUS,
            overflow: 'hidden',
            isolation: 'isolate',
          }}
        >
          <FieldApp scroll={scroll} blur={blur} indicator={indicator} section={section} />
          {/* Cover-glass sheen + display edge, fixed to the glass (not the content) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 10,
              borderRadius: SCREEN_RADIUS,
              background:
                'linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 24%, rgba(255,255,255,0) 42%, rgba(255,255,255,0) 70%, rgba(0,0,0,0.035) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.55), inset 0 0 6px rgba(0,0,0,0.12)',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
