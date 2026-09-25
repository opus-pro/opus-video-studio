import React from 'react';
import {AbsoluteFill,Easing,Img,staticFile} from 'remotion';
import {a,p,mix} from './motion';
import {TypeRun,editorialTravel,FocusConveyor} from './Typography';
import {brand} from '../config/brand';

const cream='#fff5e9',ink='#302013';
const travel=(t:number,s:number,e:number)=>editorialTravel(p(t,s,e));
const outCurve=Easing.bezier(.32,0,.70,.45);
export const sources=[
 {name:'Research.pdf',kind:'research',headline:'The first steps\nmatter.',line:'Users struggle with the first steps.'},
 {name:'Interview notes',kind:'quote',headline:'“I got stuck\nconnecting\nmy data.”',line:'Interview 03 · Onboarding'},
 {name:'Customer feedback',kind:'feedback',headline:'Where people\nget stuck.',line:'Connection setup'},
 {name:'Saved article',kind:'research',headline:'A better first\nexperience.',line:'From sign-up to the first result.'},
 {name:'Meeting notes',kind:'quote',headline:'“Where do\nI start?”',line:'Onboarding · Research notes'},
 {name:'Product brief',kind:'research',headline:'Make the next\nstep clear.',line:'What should we fix first?'},
];

// A focus window and the final brand mark use the same four open corners.
export function FocusBrackets({w,h,armX=34,armY=34,stroke=2,color=cream}:{w:number;h:number;armX?:number;armY?:number;stroke?:number;color?:string}){
 return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:'absolute',inset:0,overflow:'visible',pointerEvents:'none'}}>
  <path d={`M${armX} 0H0V${armY} M${w-armX} 0H${w}V${armY} M0 ${h-armY}V${h}H${armX} M${w} ${h-armY}V${h}H${w-armX}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"/>
 </svg>;
}

export function EvidenceQuote({contentOpacity=1}:{contentOpacity?:number}){
 return <div style={{position:'absolute',inset:0,background:'#faf0e1',borderRadius:18,color:'#624528',boxShadow:'0 15px 50px #40251212'}}>
  <div style={{position:'absolute',inset:0,opacity:contentOpacity,padding:'26px 35px'}}>
   <div style={{fontSize:20,color:'#a37a4c',marginBottom:19}}>[1] Interview notes · Page 3 <span style={{float:'right'}}>↗</span></div>
   <div style={{fontSize:43,letterSpacing:'-.025em',whiteSpace:'nowrap'}}>{brand.evidence}</div>
  </div>
 </div>;
}

function Paper({index}:{index:number}){
 const s=sources[index%sources.length],dark=index===2||index===4;
 return <div style={{position:'absolute',inset:0,padding:'46px 48px',background:dark?'#2c1c12':'linear-gradient(135deg,#fffaf1,#eddbbf)',color:dark?cream:ink,border:'1.5px solid '+(dark?'#af794c':'#fff1d9'),borderRadius:10,boxShadow:'0 34px 80px #1e0c043b',overflow:'hidden'}}>
  <div style={{display:'flex',alignItems:'center',gap:13,fontSize:23,opacity:.66,marginBottom:40}}><span style={{width:12,height:12,border:'1.5px solid currentColor',borderRadius:s.kind==='quote'?20:1}}/>{s.name}</div>
  <div style={{fontSize:s.kind==='quote'?76:79,fontWeight:370,letterSpacing:'-.052em',lineHeight:1.03,whiteSpace:'pre-line'}}>{s.headline}</div>
  {s.kind==='feedback'?<div style={{marginTop:45,display:'flex',flexDirection:'column',gap:22}}>{['Connection','First run','Setup'].map((label,i)=><div key={label} style={{fontSize:24,display:'flex',gap:25,alignItems:'center'}}><span style={{width:145}}>{label}</span><span style={{width:[305,184,126][i],height:18,background:i===0?'#efab60':'#8c6a4b',borderRadius:2}}/></div>)}</div>:<>
   <div style={{position:'relative',marginTop:43,fontSize:27,letterSpacing:'-.02em',display:'inline-block',lineHeight:1.35}}><span style={{position:'absolute',height:17,left:-3,right:-4,bottom:0,background:dark?'#ce8e4477':'#d8914777'}}/><span style={{position:'relative'}}>{s.line}</span></div>
   {[.91,.78,.84].map((w,i)=><div key={i} style={{width:`${w*100}%`,height:3,background:dark?'#f7d3a434':'#71553730',marginTop:i===0?43:17}}/>)}
  </>}
 </div>;
}

type Pose={x:number;y:number;s:number;r:number;ry:number;opacity:number};
const positions:Pose[]=[
 {x:310,y:220,s:.86,r:-16,ry:14,opacity:1},
 {x:1100,y:580,s:1.26,r:5,ry:-9,opacity:1},
 {x:1820,y:730,s:1.02,r:13,ry:-13,opacity:1},
 {x:990,y:-240,s:.7,r:8,ry:14,opacity:.88},
 {x:-260,y:1000,s:1.16,r:9,ry:15,opacity:.95},
 {x:1300,y:1370,s:1.19,r:-10,ry:-8,opacity:1},
];

function Researcher({t}:{t:number}){
 const enter=a(t,4.56,5.06),exit=travel(t,7.04,7.76),turn=travel(t,5.60,6.08),shift=travel(t,6.29,6.73);
 const x=1070-100*turn+65*shift,y=805+650*(1-enter)+140*exit;
 const scale=(1+.022*turn)*(1-exit*.28);
 return <div style={{position:'absolute',left:x-640,top:y-853.33,width:1280,height:1706.67,transform:`scale(${scale})`,opacity:p(t,4.56,4.68)*(1-exit),filter:`blur(${(1-enter)*14+exit*11}px)`,pointerEvents:'none'}}>
  <Img src={staticFile('photos/creator-copper.png')} style={{width:'100%',height:'100%',objectFit:'contain',maskImage:`url('${staticFile('photos/creator.png')}')`,maskSize:'100% 100%',maskRepeat:'no-repeat',maskMode:'alpha'}}/>
 </div>;
}

export function EvidenceJourney({t}:{t:number}){
 const unfold=travel(t,3.94,4.40),chaos=travel(t,4.62,5.12),sweep=travel(t,5.60,6.08),counter=travel(t,6.29,6.73),gather=travel(t,7.04,7.78),handoff=travel(t,9.52,10.0);
 const cameraX=-150*sweep+210*counter,cameraY=80*sweep-150*counter;
 const scroll=(q:number)=>-60+278*a(q,3.03,3.40)+278*a(q,3.49,3.75)+278*a(q,3.84,4.14);
 const labels=['Research.pdf','Saved article','Product brief','Meeting notes','Customer feedback','Another tab','Interview notes'];
 const speed=(Math.abs(scroll(t+.004)-scroll(t-.004))/.008)*.002;
 const pose=(i:number,q=t):Pose=>{
  const u=travel(q,3.94,4.40),c=travel(q,4.62,5.12),sw=travel(q,5.60,6.08),co=travel(q,6.29,6.73),g=travel(q,7.04,7.78),ho=travel(q,9.52,10.0),pos=positions[i];
  const dx=-150*sw+210*co,dy=80*sw-150*co;
  if(i===1){
   return {x:mix(mix(mix(1040,520,c),410,sw)+dx,960,g)+ho*155,y:mix(mix(mix(540,425,c),370,sw)+dy,900,g)-ho*210,s:mix(mix(mix(1.43,.97,c),.80,sw),.51,g)+ho*.17,r:mix(mix(-8*c,-11,sw),-5,g),ry:mix(-9*c,-7,g),opacity:1-ho};
  }
  const enter=a(q,4.33+i*.055,4.77+i*.055);
  return {x:mix(mix(pos.x,i===2?1420:pos.x,sw)+dx+(pos.x<960?-380:380)*(1-enter),960+(i-2)*95,g)+ho*155,
   y:mix(mix(pos.y,i===2?855:pos.y,sw)+dy+(1-enter)*190,900+Math.abs(i-2)*24,g)-ho*210,
   s:mix(mix(pos.s,i===2?1.16:pos.s,sw)*(.9+.1*enter),.45-Math.abs(i-2)*.022,g)+ho*.17,
   r:mix(mix(pos.r,i===2?-3:pos.r,sw),-5+(i-2)*5,g),ry:mix(pos.ry,-7,g),opacity:(.30+.70*u)*mix(pos.opacity,.74,g)*(1-ho)};
 };
 return <AbsoluteFill style={{overflow:'hidden',background:'#120a05'}}>
  <AbsoluteFill style={{opacity:1-gather,transform:`scale(${1.07+.02*sweep-.03*counter})`,filter:`blur(${1.8+gather*13}px)`}}><Img src={staticFile('photos/research-before.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill>
  <AbsoluteFill style={{background:`radial-gradient(ellipse 1090px 790px at ${1280-cameraX}px ${270-cameraY}px,#ffdaac 0%,#b5783e 43%,#4e2b12 72%,#120a05 100%)`,opacity:mix(.17,1,gather)}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse 1020px 580px at 36% 56%,#090603dd,transparent 90%)',opacity:1-unfold*.52}}/>
  {[3,0,5,4,1,2].map(i=>{
   const v=pose(i),before=pose(i,t-.004),after=pose(i,t+.004),velocity=Math.hypot(after.x-before.x,after.y-before.y)/.008+Math.abs(after.s-before.s)*720/.008;
   const depth=i===1?0:mix(i===0?2.4:i===2?4*(1-sweep):4,2.6,gather);
   const focusBlur=Math.hypot(depth,Math.min(18,velocity*.003));
   if(i===1&&t<4.4)return null;
   return <React.Fragment key={i}>{i===2&&<Researcher t={t}/>}<div style={{position:'absolute',left:v.x-410,top:v.y-320,width:820,height:640,transform:`perspective(2400px) rotateY(${v.ry}deg) rotateZ(${v.r}deg) scale(${v.s})`,opacity:v.opacity,filter:`blur(${focusBlur}px)`}}><Paper index={i}/></div></React.Fragment>;
  })}
  {/* The selected filename unfolds into the very same interview document. */}
  {t<4.4&&<>
   <div style={{position:'absolute',inset:0,opacity:1-p(t,3.98,4.10),overflow:'hidden',maskImage:'linear-gradient(to bottom,black 42%,transparent 43%,transparent 57%,black 58%)'}}>
    <div style={{position:'absolute',left:410,top:430-scroll(t),width:1260,fontSize:102,fontWeight:350,lineHeight:'139px',textAlign:'center',letterSpacing:'-.04em',color:cream,opacity:.45,filter:`blur(${Math.min(11,2+speed)}px)`}}>{labels.map(s=><div key={s}>{s}</div>)}</div>
   </div>
   <div style={{position:'absolute',left:1040-mix(920,1173,unfold)/2,top:540-mix(146,915,unfold)/2,width:mix(920,1173,unfold),height:mix(146,915,unfold),background:`rgba(255,246,227,${mix(.035,1,unfold)})`,borderRadius:10*unfold,boxShadow:`0 24px 95px #170b0433`,overflow:'hidden'}}>
    {unfold>0&&<div style={{position:'absolute',left:0,top:0,width:820,height:640,transform:'scale(1.43)',transformOrigin:'top left',opacity:unfold}}><Paper index={1}/></div>}
    <div style={{position:'absolute',inset:0,opacity:1-p(t,3.98,4.10),overflow:'hidden'}}><div style={{position:'absolute',left:-170,top:430-scroll(t)-467,width:1260,fontSize:102,fontWeight:350,lineHeight:'139px',textAlign:'center',letterSpacing:'-.04em',color:cream}}>{labels.map(s=><div key={s}>{s}</div>)}</div></div>
   </div>
   <div style={{position:'absolute',left:1040-mix(920,1173,unfold)/2,top:540-mix(146,915,unfold)/2,opacity:1-p(t,4.32,4.4)}}><FocusBrackets w={mix(920,1173,unfold)} h={mix(146,915,unfold)} armX={32} armY={32} color="#ffe8c3"/></div>
  </>}
  <AbsoluteFill style={{pointerEvents:'none',opacity:.46,mixBlendMode:'screen',background:`radial-gradient(ellipse 145px 1050px at ${1560-cameraX*.6}px 480px,#ffe0bbaa,transparent 90%),radial-gradient(ellipse 960px 120px at 900px 1020px,#ffb56188,transparent 90%)`,filter:'blur(29px)'}}/>
  {t>=7.44&&<>
   <AbsoluteFill style={{background:'radial-gradient(ellipse 1020px 380px at 50% 42%,#ffe8c4,#c78741aa 55%,transparent 100%)',opacity:p(t,7.44,7.74)}}/>
   <AbsoluteFill style={{background:'#160a03',opacity:p(t,8.99,9.24)*.87}}/>
   <FocusConveyor t={t}/>
  </>}
  <Img src={staticFile('photos/creator.png')} style={{position:'absolute',width:1,height:1,opacity:0,pointerEvents:'none'}}/>
 </AbsoluteFill>;
}

// Detach the actual citation at its screen-space position, then keep its four
// corners alive through both closing phrases and the final brand contraction.
export function ProofEnding({t}:{t:number}){
 const lift=travel(t,14.57,15.02),morph=travel(t,17.39,17.94);
 const w=mix(mix(1271.97,1510,lift),84,morph),h=mix(mix(156.87,228,lift),81.6,morph);
 const x=mix(mix(970,960,lift),603,morph),y=mix(723.055,540,lift);
 const clear=p(t,14.68,14.94),surface=1-p(t,14.75,15.12);
 const dark=p(t,14.62,14.94),light=travel(t,15.90,16.23);
 const markDot=a(t,17.62,17.91),core=15.6*markDot;
 const morphVelocity=(travel(t+.004,17.39,17.94)-travel(t-.004,17.39,17.94))/.008;
 const liftVelocity=(travel(t+.004,14.57,15.02)-travel(t-.004,14.57,15.02))/.008;
 const motionBlur=Math.min(8,Math.abs(morphVelocity)*2.1+Math.abs(liftVelocity)*.55);
 return <AbsoluteFill style={{pointerEvents:'none'}}>
  <AbsoluteFill style={{opacity:dark,background:'#140b06'}}/>
  <AbsoluteFill style={{opacity:dark*.87,transform:`scale(${mix(1.075,1.015,p(t,14.57,19.2))})`,filter:`blur(${mix(8,1.4,travel(t,15.85,16.3))}px)`}}><Img src={staticFile('photos/research-after.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill>
  <AbsoluteFill style={{opacity:dark,background:'radial-gradient(ellipse 760px 350px at 50% 50%,#170a054a,transparent 100%)'}}/>
  <AbsoluteFill style={{opacity:dark*.45,background:`radial-gradient(ellipse ${mix(1130,580,morph)}px ${mix(730,480,morph)}px at ${mix(1120,603,morph)}px ${mix(570,540,morph)}px,#db934c66,transparent 84%),radial-gradient(ellipse 190px 1150px at ${1530-light*150}px 390px,#ffe0b9aa,transparent 90%)`,filter:'blur(32px)'}}/>
  {/* The source's ruled lines recede toward its focal point as the answer clears. */}
  {[0,1,2,3].map(i=><div key={i} style={{position:'absolute',left:0,right:0,top:mix(360+i*125,540,morph),height:1,opacity:dark*(1-morph)*.16,background:'linear-gradient(90deg,transparent,#e2ae72,transparent)',transform:`perspective(2000px) rotateX(${30*(1-lift)}deg)`}}/>)}
  <div style={{position:'absolute',left:x-w/2,top:y-h/2,width:w,height:h,filter:`blur(${motionBlur}px)`}}>
   <div style={{position:'absolute',left:0,top:0,width:1346,height:166,transform:`scale(${w/1346},${h/166})`,transformOrigin:'top left',opacity:surface}}><EvidenceQuote contentOpacity={1-clear}/></div>
   <div style={{position:'absolute',inset:-18,borderRadius:24,boxShadow:`0 0 ${mix(70,35,morph)}px ${mix(8,3,morph)}px #edaf5638`,opacity:dark}}/>
   <FocusBrackets w={w} h={h} armX={mix(34,19.2,morph)} armY={mix(34,28.8,morph)} stroke={mix(2.2,8.4,morph)} color={lift<.45?'#b88043':cream}/>
   <div style={{position:'absolute',left:w/2-mix(480,core,morph),top:mix(h-30,h/2-core,morph),width:mix(960,core*2,morph),height:mix(16,core*2,morph),borderRadius:mix(1,core,morph),background:cream,opacity:mix((1-clear)*.25,1,markDot)}}/>
  </div>
  <div style={{opacity:dark}}>
   <TypeRun id="less-searching" text="Less searching." t={t} start={14.90} end={15.96} size={135} flowExit/>
   <TypeRun id="more-understanding" text={brand.endline} t={t} start={15.99} end={17.58} size={133} mode="resolve" flowExit/>
   <TypeRun id="trace-final" text={brand.name} t={t} start={17.68} x={1007} size={265} mode="resolve"/>
  </div>
 </AbsoluteFill>;
}
