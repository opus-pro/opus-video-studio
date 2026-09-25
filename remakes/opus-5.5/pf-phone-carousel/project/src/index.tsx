import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {defaultCarouselProps} from './data';
import {DURATION, FPS, HEIGHT, WIDTH} from './motion';
import {PhoneCarousel} from './PhoneCarousel';

const Root: React.FC = () => (
  <Composition
    id="pf-phone-carousel"
    component={PhoneCarousel}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={DURATION}
    defaultProps={defaultCarouselProps}
  />
);
registerRoot(Root);
