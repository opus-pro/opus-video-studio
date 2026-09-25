import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {CarouselProps} from './data';
import {FieldScreen} from './FieldScreen';
import {useGeist} from './font';
import {Phone} from './Phone';
import {PHONE_H, PHONE_W, POOL, SIDE_SCALE, phoneState} from './motion';

export const PhoneCarousel: React.FC<CarouselProps> = ({trail, totalKm, accent, background, screens}) => {
  useGeist();
  const frame = useCurrentFrame();
  const phones = Array.from({length: POOL}, (_, e) => ({e, ...phoneState(e, frame, screens.length)}));

  return (
    <AbsoluteFill style={{backgroundColor: background, overflow: 'hidden'}}>
      {/* Horizontal-only motion blur, one filter per physical phone. */}
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
        <defs>
          {phones.map((p) => (
            <filter
              key={p.e}
              id={`mblur-${p.e}`}
              x="-40%"
              y="-25%"
              width="180%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation={`${(p.blur / p.scale).toFixed(3)} 0`} />
            </filter>
          ))}
        </defs>
      </svg>
      {phones.map((p) => {
        // Depth: smaller phones sit lower in the stack and cast a softer shadow.
        const depth = (p.scale - SIDE_SCALE) / (1 - SIDE_SCALE);
        return (
          <div
            key={p.e}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: PHONE_W,
              height: PHONE_H,
              transform: `translate(${(p.x - PHONE_W / 2).toFixed(3)}px, ${(p.y - PHONE_H / 2).toFixed(3)}px) rotate(${p.rotate.toFixed(3)}deg) scale(${p.scale.toFixed(5)})`,
              transformOrigin: '50% 50%',
              zIndex: Math.round(p.scale * 1000),
              filter: p.blur > 0.05 ? `url(#mblur-${p.e})` : undefined,
            }}
          >
            <Phone shadow={0.78 + 0.22 * Math.max(0, Math.min(1, depth))}>
              <FieldScreen
                uid={`p${p.e}`}
                data={screens[p.content]}
                all={screens}
                trail={trail}
                accent={accent}
                totalKm={totalKm}
              />
            </Phone>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
