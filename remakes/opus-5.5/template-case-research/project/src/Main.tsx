import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background, Fade, Grain, LensSoftness, LightLeaks, Vignette, WarmLight} from './Atmosphere';
import {Brand} from './Brand';
import {C} from './layout';
import {Markers} from './Markers';
import {BackPhotos, Foreground, Hero} from './Proof';
import {Surface} from './Surface';

export const EvidenceBackedAnswer: React.FC = () => (
  <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
    <Background />
    <WarmLight />
    <BackPhotos />
    <Surface />
    <Hero />
    <Foreground />
    <LensSoftness />
    <Brand />
    <Markers />
    <LightLeaks />
    <Vignette />
    <Grain />
    <Fade />
  </AbsoluteFill>
);
