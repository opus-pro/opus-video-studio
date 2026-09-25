import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {OrbitFocus} from './OrbitFocus';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './spatial';

const Root: React.FC = () => (
  <Composition
    id="pf-orbit-focus"
    component={OrbitFocus}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={DURATION_IN_FRAMES}
  />
);
registerRoot(Root);
