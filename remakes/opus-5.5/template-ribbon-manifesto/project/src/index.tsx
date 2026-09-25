import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {RibbonManifesto, defaultRibbonProps} from './RibbonManifesto';

const Root: React.FC = () => (
  <Composition
    id="template-ribbon-manifesto"
    component={RibbonManifesto}
    width={960}
    height={540}
    fps={30}
    durationInFrames={240}
    defaultProps={defaultRibbonProps}
  />
);
registerRoot(Root);
