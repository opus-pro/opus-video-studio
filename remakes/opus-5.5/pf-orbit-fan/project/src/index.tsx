import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {OrbitFan} from './OrbitFan';

const Root: React.FC = () => (
  <Composition id="pf-orbit-fan" component={OrbitFan} width={1440} height={1080} fps={60} durationInFrames={288} />
);
registerRoot(Root);
