import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {MarkLockup} from './MarkLockup';

const Root: React.FC = () => (
  <Composition id="pf-mark-lockup" component={MarkLockup} width={1920} height={1080} fps={60} durationInFrames={216} />
);
registerRoot(Root);
