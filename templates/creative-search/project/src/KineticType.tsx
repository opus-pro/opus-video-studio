import React from 'react';
import metrics from './font-metrics.json';
import {p,slow,lin} from './common';

// Nonuniform cadence: deliberate start, a fast middle, word pauses, slow last letters.
export const typingBirths=(text:string,start:number,end:number)=>{
 const intervals=Array.from(text).map((c,i)=>{const q=i/Math.max(1,text.length-1);return (q<.15?5.2:q>.72?2.2+8*(q-.72):1.35)+(c===' '?3.8:0);});
 const total=intervals.reduce((a,b)=>a+b,0);let sum=0;
 return intervals.map(v=>{const at=start+(end-start)*sum/total;sum+=v;return at;});
};
const glyph=(c:string)=>(metrics as Record<string,number>)[c]??.5;
export const typingWidth=(text:string,f:number,start:number,end:number,size:number)=>{const births=typingBirths(text,start,end);return Array.from(text).reduce((sum,c,i)=>sum+size*(glyph(c)-(c===' '?0:.012))*slow(f,births[i],births[i]+7),0);};
export const KineticType=({text,f,prevF=f-1,start,end,size=43,cursor=false,id='type',color='inherit'}:{text:string;f:number;prevF?:number;start:number;end:number;size?:number;cursor?:boolean;id?:string;color?:string})=>{
 const births=typingBirths(text,start,end);let total=0;const advances=Array.from(text).map(c=>size*(glyph(c)-(c===' '?0:.012)));const offsets=advances.map(w=>{const x=total;total+=w;return x;});
 const visibleWidth=advances.reduce((w,a,i)=>w+a*slow(f,births[i],births[i]+7),0);
 return <span style={{position:'relative',display:'inline-block',width:Math.max(1,visibleWidth),height:size*1.25,verticalAlign:'middle',fontSize:size,color,letterSpacing:0,whiteSpace:'nowrap'}}>
 {Array.from(text).map((c,i)=>{const age=f-births[i];const settle=slow(f,births[i],births[i]+10);const dx=12*(1-settle);const prev=12*(1-slow(prevF,births[i],births[i]+10));const blur=Math.min(7,Math.abs(dx-prev)*1.6);return <span key={i} style={{position:'absolute',left:offsets[i],top:0,opacity:p(f,births[i],births[i]+4),transform:`translateX(${dx}px)`,filter:`blur(${blur}px)`}}>{c===' '?' ':c}</span>})}
 {cursor&&<span style={{position:'absolute',left:visibleWidth+3,top:size*.12,width:2,height:size*.95,background:'currentColor',opacity:f>=start&&f<end+16?(Math.floor(f/17)%2?.25:1):0}}/>}
 </span>;
};

export const VelocityFilter=({id,velocity,max=22}:{id:string;velocity:number;max?:number})=>{const x=Math.min(max,Math.abs(velocity)*.65);return <svg width="0" height="0" style={{position:'absolute',overflow:'visible'}}><defs><filter id={id} x="-60%" y="-40%" width="220%" height="180%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${x} ${x*.14}`}/></filter></defs></svg>};
