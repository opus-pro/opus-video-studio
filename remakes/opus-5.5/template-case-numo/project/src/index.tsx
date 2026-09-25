import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main} from './Main';

const Root: React.FC = () => (
  <Composition id="template-case-numo" component={Main} width={960} height={540} fps={60} durationInFrames={612} />
);
registerRoot(Root);
