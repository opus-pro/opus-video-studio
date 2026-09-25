import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {VerticalRelay} from './VerticalRelay';

const Root: React.FC = () => (
  <Composition id="pf-carousel-vertical" component={VerticalRelay} width={1200} height={1200} fps={60} durationInFrames={288} />
);
registerRoot(Root);
