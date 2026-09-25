import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Relay} from './Relay';

const Root: React.FC = () => (
  <Composition id="pf-carousel-diagonal" component={Relay} width={1200} height={1200} fps={60} durationInFrames={288} />
);
registerRoot(Root);
