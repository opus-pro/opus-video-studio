import {motionFrame} from './BeatTiming';
import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {KineticType} from './KineticType';
import {p,lin,slow,focusBlur,center,Icon} from './common';
export const Refine=({duration}:{duration:number})=>{const frame=useCurrentFrame();const local=useCurrentFrame();const f=motionFrame('refine',local);const prevF=motionFrame('refine',local-1);const exit=p(f,221,240);const text='The blue poster with circles';return <div style={{...center,width:850,height:320,transform:`translate(-50%,calc(-50% + ${(1-p(f,0,36))*25}px)) scale(${1-exit*.08})`,opacity:p(f,0,18)*(1-exit),filter:`blur(${focusBlur(f,0,36,10)+exit*8}px)`}}>
<div style={{textAlign:'center',fontSize:41,letterSpacing:-1.4,marginBottom:43}}>Just describe what you remember.</div>
<div style={{height:91,borderRadius:13,border:'1px solid #d4dce1',background:'#fafcfd',boxShadow:'0 10px 30px #18394c06',display:'flex',alignItems:'center',padding:'0 28px',gap:19,fontSize:31,letterSpacing:-.9}}><span style={{color:'#5e829d'}}><Icon kind="spark" size={26}/></span><KineticType text={text} f={f} prevF={prevF} start={35} end={110} size={31} cursor/></div>
<div style={{display:'flex',justifyContent:'center',gap:13,marginTop:26}}>{['Blue','Poster','PSD'].map((t,i)=><div key={t} style={{padding:'10px 20px',borderRadius:25,background:i===2?'#d5eafb':'#e6ebef',color:'#42657c',fontSize:21,opacity:p(f,125+i*13,143+i*13),transform:`translateY(${(1-slow(f,125+i*13,161+i*13))*20}px)`,filter:`blur(${focusBlur(f,125+i*13,161+i*13,5)}px)`}}>{t}</div>)}</div>
<div style={{textAlign:'center',marginTop:24,fontSize:19,color:'#828c94',opacity:p(f,179,198)}}>Searching your creative archive</div>
</div>};
