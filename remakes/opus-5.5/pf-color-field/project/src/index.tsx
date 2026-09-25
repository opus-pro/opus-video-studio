import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ColorField} from './ColorField';

const Root: React.FC = () => (
  <Composition id="pf-color-field" component={ColorField} width={1920} height={1080} fps={60} durationInFrames={336} />
);
registerRoot(Root);
