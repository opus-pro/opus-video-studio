import {motionFrame} from './BeatTiming';
import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {slow,p,center,Icon,Metal} from './common';
import {Poster} from './Results';
import {KineticType,VelocityFilter} from './KineticType';

// One continuous scene. The selected card remains the anchor through every change.
export const Finale=({duration}:{duration:number})=>{const local=useCurrentFrame();const f=motionFrame('finale',local);const prevF=motionFrame('finale',local-1);const {width}=useVideoConfig();const fan=slow(f,0,48);const isolate=slow(f,62,100);const detail=slow(f,123,166);const button=p(f,180,206);const open=slow(f,223,257);const band=slow(f,246,282);const line=slow(f,282,308);const closing=p(f,350,360);
 const position=(t:number,i:number)=>{const spread=(i-1)*(86.5+170*slow(t,0,48));const solo=slow(t,62,100);return i<2?spread-solo*(i===0?520:370):spread*(1-solo)-215*slow(t,123,166)*(1-slow(t,223,257));};
 const zoom=(t:number)=>.94+.19*slow(t,62,100)+.15*slow(t,123,166)+.21*slow(t,223,257);
 const cardWidth=290*zoom(f);const cardHeight=330*zoom(f);const w=cardWidth+(width-cardWidth)*band;const h=cardHeight*(1-band)+83*band;const bx=position(f,2);const bvel=bx-position(prevF,2)+(w-(290*zoom(prevF)+(width-290*zoom(prevF))*slow(prevF,246,282)))*.45;
 return <div style={{position:'absolute',inset:0,opacity:1-closing}}>
 {Array.from({length:2},(_,i)=>{const x=position(f,i);return <React.Fragment key={i}><VelocityFilter id={`side-${i}`} velocity={x-position(prevF,i)}/><div style={{position:'absolute',left:`calc(50% + ${x}px)`,top:550,transform:`translate(-50%,-50%) scale(${.893+.06*fan}) rotate(${(i===0?-2.8:0)*(1-fan)}deg)`,opacity:1-isolate,filter:`url(#side-${i})`,zIndex:i}}><div style={{height:23,fontSize:12,color:'#667680'}}>{['Chroma.fig','Form.svg'][i]}</div><Poster i={i}/></div></React.Fragment>})}
 <VelocityFilter id="hero-velocity" velocity={bvel}/>
 <div style={{position:'absolute',left:`calc(50% + ${bx}px)`,top:550-10*band,width:w,height:h*(1-line)+2*line,transform:'translate(-50%,-50%)',borderRadius:11*(1-band),overflow:'hidden',filter:'url(#hero-velocity)',opacity:1-p(f,300,312),zIndex:3}}>
 <div style={{position:'absolute',inset:0,opacity:band}}><Metal f={f+140}/></div>
 <div style={{position:'absolute',left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${zoom(f)+band*2})`,opacity:1-band}}><Poster i={2}/></div>
 </div>
 <div style={{position:'absolute',left:`calc(50% + ${bx-cardWidth/2}px)`,top:550-cardHeight/2-24,fontSize:12,color:'#667680',opacity:1-open}}>Flow.psd</div>
 <div style={{position:'absolute',left:'calc(50% + 55px)',top:485,opacity:p(f,127,142)*(1-open),transform:`translateX(${(1-detail)*45}px)`,whiteSpace:'nowrap'}}>
 <div style={{height:70,opacity:1-button}}><KineticType text="Found it." f={f} prevF={prevF} start={122} end={154} size={43}/></div>
 <div style={{position:'absolute',left:0,top:5,padding:'11px 21px',background:'#d1e9fb',borderRadius:6,fontSize:29,color:'#386782',display:'flex',gap:20,alignItems:'center',opacity:button,transform:`scale(${1-.05*p(f,223,229)+.05*p(f,229,241)})`}}>Open file <span>↗</span></div>
 <div style={{fontSize:18,display:'none',color:'#8a969f',marginTop:7,opacity:1-button}}>Blue. Circles. Flow.psd.</div>
 </div>
 <svg width="30" height="37" viewBox="0 0 35 43" style={{position:'absolute',left:`calc(50% + ${285-65*slow(f,208,223)}px)`,top:570-39*slow(f,208,223),opacity:p(f,204,210)*(1-p(f,225,238))}}><path d="M3 2 30 24 18 26 13 38Z" fill="#202a32" stroke="white" strokeWidth="2"/></svg>
 <div style={{...center,opacity:p(f,288,302),color:'#242629',background:'#f1f1f1',padding:'0 12px',zIndex:4}}><KineticType text="Back to creating." f={f} prevF={prevF} start={288} end={310} size={47}/></div>
 </div>;
};
