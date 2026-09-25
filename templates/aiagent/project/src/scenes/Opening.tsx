import React from 'react';
import {Easing, interpolateColors} from 'remotion';
import {Frame, useFrame30} from '../common';
import {ProductBoard} from '../components/ProductBoard';

type Handles = [number, number, number, number];
const unit = (n: number) => Math.max(0, Math.min(1, n));
const progress = (f: number, a: number, b: number, h: Handles) => Easing.bezier(...h)(unit((f-a)/(b-a)));
const mix = (a: number, b: number, p: number) => a+(b-a)*p;
const cubic = (a: number, b: number, c: number, d: number, p: number) => (1-p)**3*a+3*(1-p)**2*p*b+3*(1-p)*p*p*c+p**3*d;

/** Cubic Bézier segments share endpoint tangents, so camera velocity never resets at a keyframe. */
const cameraTrack = (f: number, times: number[], values: number[], velocity: number[]) => {
 if (f<=times[0]) return values[0];
 if (f>=times[times.length-1]) return values[values.length-1];
 const i=times.findIndex((t,n)=>n<times.length-1&&f>=t&&f<times[n+1]);
 const dt=times[i+1]-times[i];
 return cubic(values[i],values[i]+velocity[i]*dt/3,values[i+1]-velocity[i+1]*dt/3,values[i+1],(f-times[i])/dt);
};
const camera = (f: number) => ({
 scale:cameraTrack(f,[0,14,30,58,73],[1,1.13,2.16,2.27,3.25],[.003,.029,.025,.018,.09]),
 x:cameraTrack(f,[0,14,30,58,73],[335,334,368,287,120],[0,.6,-.7,-4,-10]),
 y:cameraTrack(f,[0,14,30,58,73],[105,105,150,85,-40],[0,.3,-.5,-3,-8]),
});
const boards=[
 {x:-580,y:-375,r:5,k:2,depth:1.1,delay:0},
 {x:570,y:-500,r:-7,k:3,depth:.72,delay:1.4},
 {x:1490,y:-135,r:4,k:4,depth:1.25,delay:3.2},
 {x:-640,y:600,r:-6,k:1,depth:.94,delay:2.1},
 {x:990,y:865,r:4,k:0,depth:1.05,delay:4.1},
];

export const Opening=()=>{
 const f=useFrame30();
 const cam=camera(f);
 const detachAt=64;
 const anchor=camera(detachAt);
 const detach=progress(f,detachAt,80,[.34,.06,.18,1]);
 const monoToSans=progress(f,67,77,[.35,0,.3,1]);
 const dark=progress(f,62,73,[.55,0,.8,.65]);
 const windowExit=progress(f,65,75,[.5,0,.82,.58]);
 const sweep=progress(f,88,105,[.62,.01,.2,1]);
 const sweepX=mix(-520,2460,sweep);
 const text='// what if you could';
 const chars=Math.floor(mix(0,text.length,unit((f-1)/31)));
 const prefix='build("';
 const num=Math.floor(mix(0,18,unit((f-33)/31)));
 const letters=Math.max(0,Math.min(8,num-7));
 // Menlo's 40 px character advance minus the -1 px tracking, mapped through the same camera.
 const advance=23.08;
 const startX=anchor.x+(72+7*advance+4*advance)*anchor.scale;
 const startY=anchor.y+(78+70+64+32)*anchor.scale;
 const wordX=cubic(startX,startX+145,1040,960,detach);
 const wordY=cubic(startY,startY-74,500,540,detach);
 const fontSize=mix(40*anchor.scale,176,detach);
 const flyBlur=Math.sin(detach*Math.PI)*10;
 const whiteToPurple=progress(f,102,108,[.35,0,.4,1]);
 const wordColor=interpolateColors(f,[64,78,102,109],['#c5e59d','#fafafa','#fafafa','#6553d8']);
 const exit=progress(f,124,132,[.6,0,.24,1]);
 return <Frame>
  {dark>0&&<div style={{position:'absolute',inset:0,background:'#101018',opacity:dark}}/>}
  {f<76&&<div style={{position:'absolute',left:cam.x,top:cam.y,width:1250,height:820,background:'#101018',borderRadius:22,overflow:'hidden',boxShadow:'0 28px 55px #0004',transformOrigin:'0 0',scale:cam.scale,opacity:1-windowExit,filter:`blur(${progress(f,61,74,[.5,0,.85,.5])*12}px)`}}>
   <div style={{height:78,background:'#f9f9f9',borderBottom:'1px solid #ddd',display:'flex',alignItems:'center',paddingLeft:28,gap:14}}>{['#f34b64','#ffc943','#45dd64'].map(c=><div key={c} style={{height:22,width:22,borderRadius:'50%',background:c}}/>)}</div>
   <div style={{padding:'70px 72px',fontFamily:'Menlo, monospace',fontSize:40,lineHeight:'64px',letterSpacing:-1,color:'#e4e5ee',whiteSpace:'nowrap'}}>
    <div>{text.slice(0,chars)}{f<33&&<span style={{opacity:Math.floor(f/6)%2===0?1:.15,color:'#82828c'}}>▌</span>}</div>
    <div><span style={{color:'#c39de8'}}>{prefix.slice(0,Math.min(5,num))}</span><span>{num>5?prefix.slice(5,Math.min(7,num)):''}</span><span style={{color:'#c5e59d',visibility:f>=detachAt?'hidden':'visible'}}>{'software'.slice(0,letters)}</span><span>{num>15?'\");'.slice(0,num-15):''}</span>{f>=33&&<span style={{display:'inline-block',height:47,width:17,background:'#82828c',verticalAlign:'-8px',opacity:Math.floor(f/7)%2===0?.8:.25}}/>}</div>
   </div>
  </div>}
  {f>=88&&<div style={{position:'absolute',left:-600,top:-90,bottom:-90,width:sweepX+600,background:'linear-gradient(90deg,#fff 0%,#fff calc(100% - 300px),#ffffffcc calc(100% - 210px),#ffffff55 calc(100% - 100px),#ffffff00 100%)',filter:'blur(20px)'}}/>}
  {f>=90&&<div style={{position:'absolute',inset:0,perspective:2200,opacity:progress(f,96,107,[.4,0,.3,1])}}>{boards.map((b,i)=>{
   const arrival=progress(f,96+b.delay,113+b.delay,[.18,.4,.22,1]);
   const drift=(f-111)*b.depth;
   const dir=b.x<0?-1:1;
   const cardX=b.x+(1-arrival)*dir*210+drift*dir*.82+exit*dir*510;
   const cardY=b.y+(1-arrival)*(b.y>400?165:-125)+drift*(b.y>400?-.45:.38);
   const depth=mix(-170*b.depth,0,arrival);
   return <div key={i} style={{position:'absolute',left:cardX,top:cardY,width:960,height:600,transformOrigin:'50% 50%',transform:`translateZ(${depth}px) rotateY(${mix(dir*-13,dir*2.5,arrival)}deg) rotateX(${mix(b.y>400?8:-8,0,arrival)}deg)`,rotate:`${b.r+(1-arrival)*dir*5+drift*.018}deg`,scale:mix(1.21,1,arrival)*(1-exit*.15),filter:`blur(${(1-arrival)*3+exit*5}px)`}}><ProductBoard kind={b.k}/></div>;
  })}</div>}
  {f>=detachAt&&<div style={{position:'absolute',left:wordX,top:wordY,translate:'-50% -50%',fontSize,lineHeight:1.6,whiteSpace:'nowrap',color:wordColor,scale:mix(1,.92,exit),opacity:1-exit*.08,filter:`blur(${flyBlur+Math.sin(sweep*Math.PI)*1.2}px)`}}>
   {monoToSans<1&&<span style={{display:'block',fontFamily:'Menlo, monospace',fontWeight:400,letterSpacing:-anchor.scale,opacity:1-monoToSans}}>software</span>}
   <span style={{position:monoToSans<1?'absolute':'relative',left:monoToSans<1?'50%':undefined,top:monoToSans<1?0:undefined,translate:monoToSans<1?'-50% 0':undefined,fontWeight:430,letterSpacing:-9,opacity:monoToSans,color:whiteToPurple>0?interpolateColors(whiteToPurple,[0,1],['#fafafa','#6553d8']):undefined}}>software</span>
  </div>}
 </Frame>
};
