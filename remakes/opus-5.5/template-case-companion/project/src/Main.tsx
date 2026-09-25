import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EASE, FONT, PERSPECTIVE, camTf, childPose, dist2, project, prog, shutter} from './math';
import {Backdrop, Cursor, FloorShadow, Grain, InputPanel, Phone, Toast} from './parts';
import {CardChip, GlassCard, Hero, Orb, Related, Spheres} from './share';
import {BTN_C, PANEL, T, cameraAt, cardPose, panelOpacity, panelPose, phonePose} from './timeline';

const cursorPose = (f: number) => {
  const p = panelPose(f);
  const t = prog(f, 76, 98, EASE.out);
  const lx = BTN_C.x + 10 + (1 - t) * 150;
  const ly = BTN_C.y + 12 + (1 - t) * 105;
  return childPose(p, PANEL.w, PANEL.h, lx + 10, ly + 14, 30);
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const camV = cameraAt(f);
  const cam = camTf(camV);
  const pp = panelPose(f);
  const po = panelOpacity(f);
  const ph = phonePose(f);
  const cp = cardPose(f);
  const cursorO = prog(f, 74, 84, EASE.soft) * (1 - prog(f, 108, 118, EASE.soft));
  const click = f >= T.click ? Math.sin(Math.PI * Math.min(1, (f - T.click) / 8)) : 0;
  const phoneShadow = prog(f, 118, 160, EASE.soft) * (1 - prog(f, 204, 228, EASE.soft));
  const cardShadow = prog(f, 212, 246, EASE.soft);
  // motion blur for the phone's fast entrance
  const pa = phonePose(f - 0.5);
  const pb = phonePose(f + 0.5);
  const phoneSamples =
    f > 112 && f < 150
      ? shutter(dist2(project([pa.x, pa.y, pa.z], camV), project([pb.x, pb.y, pb.z], camV)), 0.5, 8)
      : {offsets: [0], alpha: 1};
  return (
    <AbsoluteFill style={{backgroundColor: '#ECE7F3', fontFamily: FONT, overflow: 'hidden'}}>
      <Backdrop f={f} cam={camV} />
      <div style={{position: 'absolute', inset: 0, perspective: `${PERSPECTIVE}px`, perspectiveOrigin: '480px 270px'}}>
        <FloorShadow cam={cam} x={pp.x} z={pp.z} w={760} d={220} opacity={po * 0.32} />
        <FloorShadow cam={cam} x={ph.x + 10} z={ph.z} w={280} d={100} opacity={phoneShadow * 0.75} />
        <FloorShadow cam={cam} x={cp.x + 8} z={cp.z} w={360} d={130} opacity={cardShadow * 0.6} />
        <Related f={f} cam={cam} camV={camV} />
        <InputPanel f={f} cam={cam} pose={pp} opacity={po} />
        <Cursor cam={cam} pose={cursorPose(f)} opacity={cursorO} scale={1 - click * 0.12} />
        {phoneSamples.offsets.map((o) => (
          <Phone key={`b${o}`} f={f} cam={cam} pose={phonePose(f + o)} opacity={phoneSamples.alpha} part="back" />
        ))}
        {phoneSamples.offsets.map((o) => (
          <Phone key={`f${o}`} f={f} cam={cam} pose={phonePose(f + o)} opacity={phoneSamples.alpha} part="face" />
        ))}
        <Toast f={f} cam={cam} phone={ph} />
        <Spheres f={f} cam={cam} front={false} />
        <GlassCard f={f} cam={cam} />
        <Hero f={f} cam={cam} camV={camV} />
        <CardChip f={f} cam={cam} />
        <Spheres f={f} cam={cam} front />
        <Orb f={f} cam={cam} camV={camV} />
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
