import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.72, 0, 0.22, 1);
export const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const v = (f:number, times:number[], values:number[], e=ease) => interpolate(f,times,values,{...clamp,easing:e});
export const smooth = (f:number,a:number,b:number) => v(f,[a,b],[0,1]);
/** Author time in 30 fps units, sampled at the composition's actual fps. */
export const useFrame30=()=>useCurrentFrame()*30/useVideoConfig().fps;
export type Bezier=readonly [number,number,number,number];
export const CURVES={
 glide:[.42,0,.24,1] as Bezier,
 enter:[.16,1,.3,1] as Bezier,
 depart:[.6,0,.84,.28] as Bezier,
 settle:[.22,.68,.28,1] as Bezier,
 drift:[.33,.33,.67,.67] as Bezier,
 float:[.45,0,.55,1] as Bezier,
 snap:[.68,0,.2,1] as Bezier,
};
/** Independent cubic handles per segment. Values can include anticipation/overshoot. */
export const curve=(f:number,times:number[],values:number[],handles:Bezier|Bezier[]=CURVES.glide)=>{
 if(f<=times[0])return values[0]; if(f>=times[times.length-1])return values[values.length-1];
 const i=times.findIndex((t,n)=>n<times.length-1&&f>=t&&f<times[n+1]);
 const h=typeof handles[0]==='number'?handles as Bezier:(handles as Bezier[])[Math.min(i,handles.length-1)];
 return interpolate(f,[times[i],times[i+1]],[values[i],values[i+1]],{...clamp,easing:Easing.bezier(...h)});
};
export const speed=(at:(frame:number)=>number,f:number)=>Math.abs(at(f+.25)-at(f-.25))*2;
/** Cubic Bézier track with shared node velocities, continuous across keyframes. */
export const cubicTrack=(f:number,keys:{at:number;value:number;velocity:number}[])=>{
 if(f<=keys[0].at)return keys[0].value;
 if(f>=keys[keys.length-1].at)return keys[keys.length-1].value;
 const i=keys.findIndex((k,n)=>n<keys.length-1&&f>=k.at&&f<keys[n+1].at);
 const a=keys[i],b=keys[i+1],d=b.at-a.at,t=(f-a.at)/d,u=1-t;
 return u*u*u*a.value+3*u*u*t*(a.value+a.velocity*d/3)+3*u*t*t*(b.value-b.velocity*d/3)+t*t*t*b.value;
};
export const Frame:React.FC<{children:React.ReactNode;style?:React.CSSProperties}> = ({children,style}) => <AbsoluteFill style={{fontFamily:'Geist, Arial, sans-serif',background:'#fff',color:'#111',overflow:'hidden',...style}}>{children}</AbsoluteFill>;
export const FontFace = () => <style>{`@font-face{font-family:Geist;src:url('${staticFile('fonts/GeistVF.woff2')}') format('woff2');font-weight:100 900;font-style:normal;}*{box-sizing:border-box}`}</style>;

const shape = Array.from({length:240},(_,i)=>{const a=i/240*Math.PI*2;const r=82+7.3*Math.cos(a*6+.2);return `${i===0?'M':'L'}${100+Math.cos(a)*r},${100+Math.sin(a)*r}`;}).join(' ')+'Z';
export const Orb:React.FC<{size?:number;terminal?:boolean;terminalProgress?:number;tile?:boolean;style?:React.CSSProperties;turn?:number}> = ({size=160,terminal=false,terminalProgress=1,tile=false,style,turn=0}) => <div style={{width:size,height:size,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:tile?'white':undefined,borderRadius:tile?size*.27:undefined,boxShadow:tile?'0 8px 35px #32246a24':undefined,...style}}><svg width={tile?'85%':'100%'} height={tile?'85%':'100%'} viewBox="0 0 200 200" style={{overflow:'visible',rotate:`${turn}deg`}}><defs><linearGradient id="orbBase" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#4526f9"/><stop offset=".4" stopColor="#6564f1"/><stop offset="1" stopColor="#ac9ff7"/></linearGradient><radialGradient id="orbLight" cx=".2" cy=".78" r=".9"><stop stopColor="#3620e6" stopOpacity=".65"/><stop offset=".5" stopColor="#5bb8ee" stopOpacity=".05"/><stop offset="1" stopColor="#fff" stopOpacity=".1"/></radialGradient></defs><path d={shape} fill="url(#orbBase)"/><path d={shape} fill="url(#orbLight)"/>{terminal&&<g fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" style={{transformOrigin:'100px 100px',rotate:`${-turn}deg`}}><path d="M69 79 L82 99 L69 119" pathLength={1} strokeDasharray={1} strokeDashoffset={1-Math.min(1,terminalProgress*1.4)}/><path d="M107 120H132" pathLength={1} strokeDasharray={1} strokeDashoffset={1-Math.max(0,Math.min(1,(terminalProgress-.35)/.65))} opacity={terminalProgress>.35?1:0}/></g>}</svg></div>;

export const Cursor:React.FC<{x:number;y:number;size?:number;rotation?:number;opacity?:number}> = ({x,y,size=84,rotation=-14,opacity=1}) => <div style={{position:'absolute',left:x,top:y,width:size,height:size*1.13,rotate:`${rotation}deg`,opacity,filter:'drop-shadow(0px 6px 7px #0007)',zIndex:20,pointerEvents:'none'}}><svg viewBox="0 0 100 115" width="100%" height="100%"><path d="M17 8 Q11 3 11 13 L12 96 Q12 106 20 100 L44 77 L62 105 Q66 111 72 107 L80 102 Q84 100 80 94 L63 66 L94 62 Q105 60 96 54Z" fill="#101014" stroke="#fff" strokeWidth="5" strokeLinejoin="round"/></svg></div>;
export const Mic:React.FC<{size?:number;color?:string;stroke?:number}> = ({size=60,color='currentColor',stroke=5}) => <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"><rect x="23" y="6" width="18" height="33" rx="9"/><path d="M15 29V33a17 17 0 0 0 34 0V29M32 50V59M23 59H41"/></svg>;
export const Star:React.FC<{size?:number;rotate?:number;color?:string}> = ({size=94,rotate=0,color='#6354de'}) => <svg width={size} height={size} viewBox="0 0 100 100" style={{rotate:`${rotate}deg`}}><g stroke={color} strokeWidth="10" strokeLinecap="square">{[0,45,90,135].map(d=><path key={d} d="M50 10V90" transform={`rotate(${d} 50 50)`}/>)}</g></svg>;
export const LightWash = ({opacity=1}:{opacity?:number}) => <AbsoluteFill style={{pointerEvents:'none',opacity,background:'radial-gradient(ellipse at 60% 100%,#f3e7ff88,transparent 42%),radial-gradient(ellipse at 5% 85%,#cce8ff44,transparent 36%)'}}/>;
export const MotionText:React.FC<{text:string;from?:number;size?:number;color?:string;style?:React.CSSProperties;stagger?:number}> = ({text,from=0,size=112,color,style,stagger=1.2}) => {const f=useCurrentFrame();return <div style={{fontSize:size,letterSpacing:-size*.045,lineHeight:1.12,color,whiteSpace:'nowrap',...style}}>{Array.from(text).map((c,i)=>{const p=smooth(f,from+i*stagger,from+i*stagger+14);return <span key={i} style={{display:'inline-block',whiteSpace:'pre',opacity:p,translate:`0 ${(1-p)*42}px`,filter:`blur(${(1-p)*10}px)`}}>{c}</span>})}</div>};
