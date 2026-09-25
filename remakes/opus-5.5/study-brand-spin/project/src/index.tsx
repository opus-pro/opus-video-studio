import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {BrandSpin, brandSpinDefaults} from './BrandSpin';

const Root: React.FC = () => (
  <Composition
    id="study-brand-spin"
    component={BrandSpin}
    width={960}
    height={540}
    fps={30}
    durationInFrames={66}
    defaultProps={brandSpinDefaults}
  />
);
registerRoot(Root);
