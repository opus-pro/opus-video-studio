import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {BrandDots} from './BrandDots';

const Root: React.FC = () => (
  <Composition id="pf-brand-dots" component={BrandDots} width={1920} height={1080} fps={60} durationInFrames={336} />
);
registerRoot(Root);
