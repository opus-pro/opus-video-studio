import React from 'react';
import {Frame,Orb,useFrame30,curve,CURVES,cubicTrack,speed} from '../common';

export const Claims=()=>{
 const f=useFrame30();
 const second=f>=92;
 const line=second?'No learning curve':'No complex syntax';
 const begin=second?96:48;
 const end=second?121:77;
 const incoming=curve(f,[begin,begin+24],[0,1],CURVES.glide);
 const outgoing=curve(f,[end,end+14],[0,1],CURVES.glide);
 const textWidth=second?728:770;
 const visibleWidth=textWidth*incoming;
 const left=960-(visibleWidth+98)/2;
 const active=f>=48&&f<135;
 const orbX=(t:number)=>{
  if(t<48||t>135)return 960;
  const b=t>=92?96:48,en=t>=92?121:77,w=t>=92?728:770;
  const ins=curve(t,[b,b+24],[0,1],CURVES.glide);
  const out=curve(t,[en,en+14],[0,1],CURVES.snap);
  const holdX=960+w*ins/2;
  return holdX+(960-holdX)*out;
 };
 const sizeAt=(t:number)=>curve(t,[0,12,23,38,128,136,141,154,164,171],[124,216,172,80,80,247,191,678,646,650],[CURVES.enter,CURVES.float,CURVES.glide,CURVES.drift,CURVES.glide,CURVES.float,CURVES.snap,CURVES.settle,CURVES.drift]);
 const size=sizeAt(f);
 const rotation=cubicTrack(f,[{at:0,value:-32,velocity:2.8},{at:26,value:0,velocity:.25},{at:48,value:4,velocity:0},{at:92,value:-4,velocity:.2},{at:128,value:4,velocity:0},{at:143,value:-18,velocity:-.6},{at:159,value:1.4,velocity:0},{at:171,value:0,velocity:0}]);
 const movementBlur=Math.min(9,speed(orbX,f)*.12+speed(sizeAt,f)*.055);
 return <Frame>
  {f<44&&<div style={{position:'absolute',inset:0,display:'flex',justifyContent:'center',alignItems:'center'}}>{[1080,718,400].map((diameter,i)=>{
   const lag=(2-i)*1.4;
   const scale=curve(f,[lag,14+lag,25+lag,42],[.1,1.075,.97,1.47],[CURVES.enter,CURVES.float,CURVES.glide]);
   return <div key={i} style={{position:'absolute',width:diameter,height:diameter,borderRadius:'50%',background:'linear-gradient(150deg,#fff 35%,#fbfdff 72%,#e6f2ff)',boxShadow:'8px 18px 48px #9cc7ee55,inset -2px -2px 6px #e4efffa0',transform:`scale(${scale})`,opacity:curve(f,[0,5,27,43],[0,1,1,0],[CURVES.enter,CURVES.drift,CURVES.glide]),filter:`blur(${curve(f,[0,12,29,43],[8,0,0,4])}px)`}}/>;
  })}</div>}
  {active&&<div style={{position:'absolute',left,top:484,fontSize:87,letterSpacing:-3.8,lineHeight:1.22,whiteSpace:'nowrap',width:textWidth,opacity:1-outgoing,translate:`${outgoing*95}px 0`,filter:`blur(${outgoing*8}px)`}}>{Array.from(line).map((char,i)=>{
    const delay=begin+i*.95;
    const reveal=curve(f,[delay,delay+9],[0,1],CURVES.enter);
    return <span key={`${second}-${i}`} style={{display:'inline-block',whiteSpace:'pre',opacity:reveal,translate:`${(1-reveal)*12}px ${(1-reveal)*4}px`,filter:`blur(${(1-reveal)*7}px)`,color:reveal<.7?'#a5a0e4':'#17171c'}}>{char}</span>;
   })}</div>}
  <div style={{position:'absolute',left:orbX(f)-size/2,top:540-size/2,filter:`blur(${movementBlur}px)`,transform:`scaleX(${1+Math.min(.1,speed(orbX,f)*.0015)})`}}><Orb size={size} terminal={f>144} terminalProgress={curve(f,[144,160],[0,1],CURVES.glide)} turn={rotation}/></div>
 </Frame>
};
