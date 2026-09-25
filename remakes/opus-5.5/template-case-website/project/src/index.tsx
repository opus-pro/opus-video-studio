import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Scene} from './Scene';

const Root: React.FC = () => (
  <Composition id="template-case-website" component={Scene} width={960} height={540} fps={30} durationInFrames={195} />
);
registerRoot(Root);
