import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CameraChrome} from './CameraChrome';
import {Copy} from './Copy';
import {Flash} from './Flash';
import {ensureFont} from './font';
import {LightSweep} from './LightSweep';
import {Photos} from './Photos';

ensureFont();

// Subtle lens falloff so the frame has depth without muddying the silver palette.
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse 85% 70% at 45% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 100%)',
    }}
  />
);

export const CameraCampaign: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#111214'}}>
    <Photos />
    <LightSweep from={118} to={196} />
    <Vignette />
    <Copy />
    <CameraChrome />
    <Flash />
  </AbsoluteFill>
);
