import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PhoneHand} from './PhoneHand';

const Root: React.FC = () => (
  <Composition id="pf-phone-hand" component={PhoneHand} width={1200} height={1200} fps={60} durationInFrames={276} />
);
registerRoot(Root);
