import React from 'react';
import {AbsoluteFill, Audio, Composition, registerRoot, staticFile} from 'remotion';
import {FastFilm} from './FastFinale';
import config from '../config/template.json';
export type AudioMode='master'|'sfx'|'mute';
const Film=({audioMode='master'}:{audioMode?:AudioMode})=><AbsoluteFill>
  <FastFilm bgm={false}/>
  {audioMode!=='mute'&&<Audio src={staticFile(config.audio[audioMode])}/>}
</AbsoluteFill>;
registerRoot(()=><Composition id="MarginFast" component={Film}
  width={config.canvas.width} height={config.canvas.height} fps={config.canvas.fps}
  durationInFrames={config.canvas.durationInFrames}
  defaultProps={{audioMode:config.audio.mode as AudioMode}}/>);
