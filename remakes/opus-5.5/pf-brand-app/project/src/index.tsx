import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main} from './Main';

const Root: React.FC = () => (
  <Composition id="pf-brand-app" component={Main} width={1920} height={1080} fps={60} durationInFrames={348} />
);
registerRoot(Root);
