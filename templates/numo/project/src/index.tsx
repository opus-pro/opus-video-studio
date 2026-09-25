import React from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,registerRoot,staticFile,useVideoConfig} from 'remotion';
import {brand,CUTS,audio} from './design';
import timeline from '../config/timeline.json';
import {WebShot} from './web';
import './style.css';
const tracks:Record<string,string>={master:audio.master,music:audio.music,sfx:audio.sfx};
const Film:React.FC=()=>{
 const {width}=useVideoConfig();
 const source=tracks[audio.mode];
 return <AbsoluteFill style={{background:brand.background}}>
  <div style={{position:'absolute',width:1280,height:720,transform:`scale(${width/1280})`,transformOrigin:'top left'}}>
   {CUTS.slice(0,-1).map((from,i)=><Sequence key={i} from={from} durationInFrames={CUTS[i+1]-from} name={`${i+1} · NUMO`}><WebShot shot={i} brand={brand}/></Sequence>)}
  </div>
  {source&&<Audio src={staticFile(source)}/>}
 </AbsoluteFill>;
};
const Root:React.FC=()=><Composition id="NUMO" component={Film} width={timeline.width} height={timeline.height} fps={timeline.fps} durationInFrames={timeline.durationInFrames}/>;
registerRoot(Root);
