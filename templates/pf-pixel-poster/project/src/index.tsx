import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DepthSwirl, depthDefaults} from './depth-swirl';
import {TypeSnap, typeDefaults} from './type-snap';
import {PixelPoster, pixelDefaults} from './pixel-poster';
import {CartCheckout, cartDefaults} from './cart-checkout';
import {ColorField, colorDefaults} from './color-field';

const Root: React.FC = () => <>
  <Composition id="pf-depth-swirl" component={DepthSwirl} width={1920} height={1080} fps={60} durationInFrames={348} defaultProps={depthDefaults}/>
  <Composition id="pf-type-snap" component={TypeSnap} width={1080} height={1350} fps={60} durationInFrames={288} defaultProps={typeDefaults}/>
  <Composition id="pf-pixel-poster" component={PixelPoster} width={1350} height={1350} fps={60} durationInFrames={288} defaultProps={pixelDefaults}/>
  <Composition id="pf-cart-checkout" component={CartCheckout} width={1600} height={1200} fps={60} durationInFrames={324} defaultProps={cartDefaults}/>
  <Composition id="pf-color-field" component={ColorField} width={1920} height={1080} fps={60} durationInFrames={336} defaultProps={colorDefaults}/>
</>;
registerRoot(Root);
