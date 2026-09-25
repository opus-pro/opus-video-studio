import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PrintMenu} from './PrintMenu';

const Root: React.FC = () => (
  <Composition id="pf-print-menu" component={PrintMenu} width={1080} height={1080} fps={60} durationInFrames={336} />
);
registerRoot(Root);
