import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main} from './Main';

const Root: React.FC = () => (
  <Composition id="template-case-search" component={Main} width={960} height={540} fps={60} durationInFrames={590} />
);
registerRoot(Root);
