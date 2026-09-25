import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {AnalyticsGlow} from './AnalyticsGlow';

const Root: React.FC = () => (
  <Composition
    id="template-analytics-glow"
    component={AnalyticsGlow}
    width={960}
    height={540}
    fps={60}
    durationInFrames={180}
  />
);
registerRoot(Root);
