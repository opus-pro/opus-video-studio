import React from 'react';
import {AbsoluteFill} from 'remotion';
import {inOutSine, lerp, outExpo, prog, push} from './anim';

/** Warm ink stage: layered radial light, slow parallax push, arrival blooms, grain. */
export const Background: React.FC<{t: number}> = ({t}) => {
  // camera push that tracks the type's scale changes (parallax, far plane)
  const s = 1 + 0.05 * push(prog(t, 57, 93)) + 0.03 * inOutSine(prog(t, 130, 176)) + 0.03 * inOutSine(prog(t, 198, 240));
  // arrival blooms
  const bloom =
    0.35 +
    0.35 * Math.max(0, 1 - Math.abs(t - 92) / 26) * outExpo(prog(t, 70, 92)) +
    0.3 * Math.max(0, 1 - Math.abs(t - 168) / 26) +
    0.55 * outExpo(prog(t, 214, 246));
  const warm = prog(t, 204, 250);
  const drift = lerp(-40, 40, inOutSine(prog(t, 0, 270)));
  const seed = Math.floor(t / 2) % 97;
  return (
    <AbsoluteFill style={{backgroundColor: '#070605', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 50%'}}>
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse 75% 70% at 50% 46%, #1d1814 0%, #120f0c 45%, #080706 78%, #050404 100%)',
          }}
        />
        {/* key light */}
        <AbsoluteFill
          style={{
            opacity: bloom,
            background: `radial-gradient(ellipse 42% 34% at ${50 + drift / 20}% 47%, rgba(${Math.round(lerp(120, 170, warm))},${Math.round(lerp(98, 118, warm))},${Math.round(lerp(78, 62, warm))},0.55) 0%, rgba(80,62,46,0.18) 45%, rgba(0,0,0,0) 72%)`,
          }}
        />
        {/* cool rim from top-left for depth */}
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 12% 0%, rgba(120,132,150,0.10) 0%, rgba(0,0,0,0) 70%)',
          }}
        />
        {/* stage floor sheen */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 72%, rgba(255,236,210,0.025) 80%, rgba(0,0,0,0) 100%)',
          }}
        />
      </AbsoluteFill>
      {/* film grain (under the type so resting text stays crisp) */}
      <svg width="960" height="540" style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="960" height="540" filter={`url(#g${seed})`} />
      </svg>
      {/* vignette */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}}
      />
    </AbsoluteFill>
  );
};
