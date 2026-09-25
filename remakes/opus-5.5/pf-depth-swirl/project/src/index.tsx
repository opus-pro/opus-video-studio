import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DepthSwirl} from './DepthSwirl';

// Literal values so the registration is auditable at a glance.
const Root: React.FC = () => (
  <Composition
    id="pf-depth-swirl"
    component={DepthSwirl}
    width={1920}
    height={1080}
    fps={60}
    durationInFrames={348}
    defaultProps={{audit: false}}
  />
);
registerRoot(Root);
