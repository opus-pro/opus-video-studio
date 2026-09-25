import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {EvidenceBackedAnswer} from './Main';

const Root: React.FC = () => (
  <Composition
    id="template-case-research"
    component={EvidenceBackedAnswer}
    width={960}
    height={540}
    fps={30}
    durationInFrames={252}
  />
);
registerRoot(Root);
