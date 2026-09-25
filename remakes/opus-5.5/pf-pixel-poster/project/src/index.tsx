import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PixelPoster} from './PixelPoster';

const Root: React.FC = () => (
  <Composition id="pf-pixel-poster" component={PixelPoster} width={1350} height={1350} fps={60} durationInFrames={288} />
);
registerRoot(Root);
