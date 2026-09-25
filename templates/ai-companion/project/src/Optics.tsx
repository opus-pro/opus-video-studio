import React from 'react';
import {a,m,progress,mix,track,motionBlur,focusIn,focusOut} from './motion';
const abs:React.CSSProperties={position:'absolute'};
// 9 ms letter stagger at 30 fps is 0.27 frame; fractional starts are deterministic.
export function FocusText({text,f,start,duration=9.7,delay=.27,amount=18,travel=22}:{text:string;f:number;start:number;duration?:number;delay?:number;amount?:number;travel?:number}){
 return <span aria-label={text} style={{whiteSpace:'pre'}}>
  {Array.from(text).map((letter,i)=>{
   const from=start+i*delay,to=from+duration,t=a(f,from,to);
   return <span key={i} aria-hidden style={{display:'inline-block',opacity:progress(f,from,from+2),transform:'translateY('+mix(travel,0,t)+'px)',filter:'blur('+focusIn(f,from,to,amount)+'px)'}}>{letter===' '?'\u00a0':letter}</span>;
  })}
 </span>;
}
export const surfaceKeys=[
 [362,655,95,610,1270,88,1],[370,655,95,610,1270,88,1],
 [383,545,869,830,96,40,1],[479,545,869,830,96,40,1],
 [489,728,837,464,100,52,1],[549,728,837,464,100,52,1],
 [559,310,461,1320,153,70,1],[588,310,461,1320,153,70,1],
 [598,170,-1000,1580,2800,180,1],[620,170,-1000,1580,2800,180,1],[628,570,460,780,166,90,0]
];
export const surfaceState=(f:number)=>{
 const [x,y,width,height,round,opacity]=track(f,surfaceKeys);
 return {x,y,width,height,round,opacity};
};
export function GlassSurface({f}:{f:number}){
 const s=surfaceState(f);
 const blur=motionBlur(f,surfaceState,400,10);
 return <div style={{...abs,left:s.x,top:s.y,width:s.width,height:s.height,borderRadius:s.round,opacity:s.opacity,background:'linear-gradient(135deg,#ffffffbd,#f1fff5b3)',border:'2px solid #ffffffb0',boxShadow:'inset 0 0 38px #ffffff80,0 24px 66px #19493920',filter:'blur('+blur+'px)'}}/>;
}
export function Exit({children,f,start,end,dx=0,dy=-65}:{children:React.ReactNode;f:number;start:number;end:number;dx?:number;dy?:number}){
 const t=m(f,start,end);
 return <div style={{...abs,inset:0,opacity:1-progress(f,start+(end-start)*.4,end),transform:'translate('+dx*t+'px,'+dy*t+'px)',filter:'blur('+focusOut(f,start,end,14)+'px)'}}>{children}</div>;
}
