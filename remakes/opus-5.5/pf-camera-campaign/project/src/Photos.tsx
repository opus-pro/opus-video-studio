import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {CUT_CLOSE, CUT_FINAL, DURATION, SHOTS, ShotKey, clampInterp, ease, shotAt} from './timeline';

const ORDER: ShotKey[] = ['wide', 'close', 'detail'];

// Scale + transform-origin for the visible shot at this frame.
const shotTransform = (frame: number) => {
  const shot = shotAt(frame);
  const local = frame - shot.start;

  if (shot.key === 'wide' && !shot.burst) {
    // Viewfinder: a slow lean-in toward the face before the shutter fires.
    const scale = clampInterp(frame, [0, CUT_CLOSE], [1, 1.028], ease.gentle);
    return {key: shot.key, scale, origin: '50% 24%', blur: 0, grade: 0};
  }
  if (shot.burst) {
    // Burst frames land slightly punched-in and settle, with a two-frame zoom smear.
    const scale = clampInterp(local, [0, 13], [1.05, 1], ease.out);
    const blur = clampInterp(local, [0, 2.5], [5, 0], ease.outCubic);
    const origin = shot.key === 'detail' ? '44% 40%' : shot.key === 'close' ? '40% 34%' : '50% 24%';
    return {key: shot.key, scale, origin, blur, grade: 0};
  }
  // Final hold on close: 1 -> 1.014.
  const scale = clampInterp(frame, [CUT_FINAL, DURATION - 1], [1, 1.014], ease.gentle);
  // Campaign grade eases in as the camera UI leaves: a touch more contrast, cooler silver.
  const grade = clampInterp(frame, [CUT_FINAL, CUT_FINAL + 36], [0, 1], ease.inOut);
  return {key: shot.key, scale, origin: '40% 34%', blur: 0, grade};
};

const filterFor = (blur: number, grade: number) => {
  const parts: string[] = [];
  if (grade > 0.001) {
    parts.push(`contrast(${1 + 0.06 * grade})`, `saturate(${1 - 0.08 * grade})`, `brightness(${1 - 0.015 * grade})`);
  }
  if (blur > 0.05) parts.push(`blur(${blur}px)`);
  return parts.length ? parts.join(' ') : undefined;
};

export const Photos: React.FC = () => {
  const frame = useCurrentFrame();
  const t = shotTransform(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#1b1c1e', overflow: 'hidden'}}>
      {ORDER.map((key) => {
        const visible = key === t.key;
        return (
          <AbsoluteFill
            key={key}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? `scale(${t.scale})` : undefined,
              transformOrigin: visible ? t.origin : undefined,
              filter: visible ? filterFor(t.blur, t.grade) : undefined,
              willChange: 'transform',
            }}
          >
            <Img
              src={staticFile(SHOTS[key].file)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${SHOTS[key].posX}% 50%`,
              }}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
