import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Website, websiteDefaults} from './Website';
import {Research, researchDefaults} from './Research';

const Root: React.FC = () => <>
  <Composition id="template-case-website" component={Website} width={960} height={540} fps={30} durationInFrames={195} defaultProps={websiteDefaults} />
  <Composition id="template-case-research" component={Research} width={960} height={540} fps={30} durationInFrames={252} defaultProps={researchDefaults} />
</>;
registerRoot(Root);
