import React from 'react';
import {PHONE_H, PHONE_W} from './motion';

// 330x720 black phone frame. Children render into the 310x700 screen.
export const BEZEL = 10;
const RADIUS = 56;

export const Phone: React.FC<{children: React.ReactNode; shadow: number}> = ({children, shadow}) => (
  <div
    style={{
      position: 'relative',
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: RADIUS,
      background: 'linear-gradient(155deg, #3a3b3a 0%, #111211 7%, #060606 40%, #060606 70%, #121312 94%, #2e2f2e 100%)',
      boxShadow: [
        `0 1px 2px rgba(20,32,24,${0.14 * shadow})`,
        `0 8px 16px rgba(20,32,24,${0.1 * shadow})`,
        `0 24px 44px rgba(20,32,24,${0.14 * shadow})`,
        `0 54px 90px -24px rgba(20,32,24,${0.3 * shadow})`,
      ].join(', '),
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 2,
        borderRadius: RADIUS - 2,
        background: '#030303',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.05)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: BEZEL,
        top: BEZEL,
        width: PHONE_W - BEZEL * 2,
        height: PHONE_H - BEZEL * 2,
        borderRadius: RADIUS - BEZEL,
        overflow: 'hidden',
        // Forces a clean rounded clip for the photo + map layers.
        isolation: 'isolate',
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: RADIUS - BEZEL,
          pointerEvents: 'none',
          background: 'linear-gradient(118deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 32%)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.35)',
        }}
      />
    </div>
  </div>
);
