import React from 'react';
import {Composition, registerRoot} from 'remotion';
import './font';
import {TrailRecap} from './TrailRecap';

const Root: React.FC = () => (
  <Composition id="pf-trail-recap" component={TrailRecap} width={1080} height={1350} fps={60} durationInFrames={324} />
);
registerRoot(Root);
