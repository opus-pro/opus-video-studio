import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {SixColors} from './SixColors';

const Root: React.FC = () => (
  <Composition id="pf-six-colors" component={SixColors} width={1920} height={1080} fps={60} durationInFrames={216} />
);
registerRoot(Root);
