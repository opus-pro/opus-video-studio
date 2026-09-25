import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {BrandLockup, defaultBrandLockupProps} from './BrandLockup';
import {CANVAS} from './geometry';

const Root: React.FC = () => (
  <Composition
    id="study-brand-lockup"
    component={BrandLockup}
    width={CANVAS.width}
    height={CANVAS.height}
    fps={CANVAS.fps}
    durationInFrames={CANVAS.frames}
    defaultProps={defaultBrandLockupProps}
  />
);
registerRoot(Root);
