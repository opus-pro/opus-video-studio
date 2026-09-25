import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main} from './Main';

const Root: React.FC = () => (
  <Composition id="template-case-companion" component={Main} width={960} height={540} fps={30} durationInFrames={316} />
);
registerRoot(Root);
