import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {defaultLogoBloomProps, LogoBloom, LogoBloomProps} from './LogoBloom';

const Root: React.FC = () => (
  <Composition
    id="study-brand-bloom"
    component={LogoBloom as React.FC<LogoBloomProps & Record<string, unknown>>}
    width={960}
    height={540}
    fps={30}
    durationInFrames={66}
    defaultProps={defaultLogoBloomProps as LogoBloomProps & Record<string, unknown>}
  />
);
registerRoot(Root);
