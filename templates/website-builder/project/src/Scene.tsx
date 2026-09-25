import React from 'react';
import {AbsoluteFill} from 'remotion';
export const White=()=> <AbsoluteFill style={{background:'#fff'}}/>;
export const Layer=({children,x=0,y=0,s=1,rx=0,ry=0,rz=0,bl=0,opacity=1,w=1600,h=930}:{children:React.ReactNode;x?:number;y?:number;s?:number;rx?:number;ry?:number;rz?:number;bl?:number;opacity?:number;w?:number;h?:number})=><div style={{position:'absolute',left:960,top:540,perspective:2200,opacity}}><div style={{width:w,height:h,position:'absolute',left:-w/2,top:-h/2,transform:`translate(${x}px,${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,transformStyle:'preserve-3d',filter:bl>.1?`blur(${bl}px)`:undefined,backfaceVisibility:'hidden'}}>{children}</div></div>;
