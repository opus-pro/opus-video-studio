import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
registerRoot(()=> <Composition id="WebsiteBuilder" component={Film} fps={30} width={1920} height={1080} durationInFrames={1560}/>);
