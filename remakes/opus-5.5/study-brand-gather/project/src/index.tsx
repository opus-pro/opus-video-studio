import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FourBlocksConverge, defaultFourBlocksProps} from './FourBlocksConverge';

const Root: React.FC = () => (
  <Composition
    id="study-brand-gather"
    component={FourBlocksConverge}
    width={960}
    height={540}
    fps={30}
    durationInFrames={66}
    defaultProps={defaultFourBlocksProps}
  />
);
registerRoot(Root);
