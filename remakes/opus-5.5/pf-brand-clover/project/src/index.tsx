import React from 'react';
import {Composition, registerRoot} from 'remotion';
import './font';
import {BrandClover} from './BrandClover';

const Root: React.FC = () => (
  <Composition id="pf-brand-clover" component={BrandClover} width={1920} height={1080} fps={60} durationInFrames={324} />
);
registerRoot(Root);
