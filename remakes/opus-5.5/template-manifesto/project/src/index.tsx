import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Manifesto} from './Manifesto';

const Root: React.FC = () => (
  <Composition id="template-manifesto" component={Manifesto} width={960} height={540} fps={30} durationInFrames={270} />
);
registerRoot(Root);
