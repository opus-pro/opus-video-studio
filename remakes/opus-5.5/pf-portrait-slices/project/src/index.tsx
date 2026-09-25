import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PortraitSlices} from './PortraitSlices';

const Root: React.FC = () => (
  <Composition
    id="pf-portrait-slices"
    component={PortraitSlices}
    width={1080}
    height={1920}
    fps={60}
    durationInFrames={252}
  />
);
registerRoot(Root);
