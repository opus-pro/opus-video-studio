import React from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,registerRoot,staticFile,useVideoConfig} from 'remotion';
import {brand,CUTS,audio} from './design';
import {WebShot} from './web';
import timeline from '../config/timeline.json';
import './style.css';
const Film:React.FC=()=>{
 const {width}=useVideoConfig();
 return <AbsoluteFill style={{background:brand.background}}><div style={{position:'absolute',width:1280,height:720,transform:`scale(${width/1280})`,transformOrigin:'top left'}}>
 {CUTS.slice(0,-1).map((from,i)=><Sequence key={i} from={from} durationInFrames={CUTS[i+1]-from} name={`${i+1} · ${brand.name}`}><WebShot shot={i} brand={brand}/></Sequence>)}
 </div>{audio.mode==='master'&&<Audio src={staticFile(audio.master)}/>}</AbsoluteFill>;
};
export const Root:React.FC=()=> <Composition id="TOVO" component={Film} width={timeline.width} height={timeline.height} fps={timeline.fps} durationInFrames={timeline.durationInFrames}/>;
registerRoot(Root);
