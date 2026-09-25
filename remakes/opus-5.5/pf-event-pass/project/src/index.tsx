import React from 'react';
import {Composition, registerRoot} from 'remotion';
import './font';
import {EventPass} from './EventPass';

const Root: React.FC = () => (
  <Composition id="pf-event-pass" component={EventPass} width={1080} height={1350} fps={60} durationInFrames={288} />
);
registerRoot(Root);
