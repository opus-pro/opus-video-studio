import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CartCheckout} from './CartCheckout';

const Root: React.FC = () => (
  <Composition id="pf-cart-checkout" component={CartCheckout} width={1600} height={1200} fps={60} durationInFrames={324} />
);
registerRoot(Root);
