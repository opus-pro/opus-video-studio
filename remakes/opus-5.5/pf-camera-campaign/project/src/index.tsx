import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CameraCampaign} from './CameraCampaign';

const Root: React.FC = () => (
  <Composition
    id="pf-camera-campaign"
    component={CameraCampaign}
    width={1080}
    height={1920}
    fps={60}
    durationInFrames={252}
  />
);
registerRoot(Root);
