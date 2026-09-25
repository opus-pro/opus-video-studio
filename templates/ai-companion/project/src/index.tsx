import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {Film} from './Film';
import timeline from '../config/timeline.json';
registerRoot(()=><Composition id="Companion" component={Film} fps={timeline.fps} width={timeline.width} height={timeline.height} durationInFrames={timeline.durationInFrames}/>);
