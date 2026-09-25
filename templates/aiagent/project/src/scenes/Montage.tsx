import React from 'react';
import {Frame,LightWash,useFrame30,curve,CURVES,cubicTrack,speed} from '../common';
import {ProductBoard} from '../components/ProductBoard';

const cards=[
 {x:115,y:82,s:.68,r:-3,k:0,dx:-22,dy:-9},
 {x:940,y:-83,s:.55,r:2,k:1,dx:15,dy:7},
 {x:1210,y:368,s:.54,r:-2,k:2,dx:19,dy:-15},
 {x:178,y:649,s:.52,r:1.6,k:3,dx:-20,dy:11},
 {x:822,y:690,s:.66,r:-1.7,k:4,dx:16,dy:12},
 {x:18,y:455,s:.37,r:-4.5,k:5,dx:-16,dy:-10},
];
export const Montage=()=>{
 const f=useFrame30();
 return <Frame><LightWash opacity={.42}/><div style={{position:'absolute',inset:0,perspective:1600}}>{cards.map((c,i)=>{
  const lag=i*1.65;
  const arrive=(t:number)=>curve(t,[lag,lag+23,43],[0,1,1.015],[CURVES.enter,CURVES.drift]);
  const fold=(t:number)=>curve(t,[43+i*.35,59],[0,1],CURVES.snap);
  const xAt=(t:number)=>{const p=arrive(t),q=fold(t);return 960+((c.x+c.s*480-960)*p+c.dx*(t/59))*(1-q);};
  const yAt=(t:number)=>{const p=arrive(t),q=fold(t);return 540+((c.y+c.s*300-540)*p+c.dy*(t/59))*(1-q);};
  const q=fold(f),p=arrive(f);
  const sc=c.s*curve(f,[lag,lag+13,lag+28,43,59],[.08,1.025,1,1.01,.035],[CURVES.enter,CURVES.settle,CURVES.drift,CURVES.snap]);
  const tilt=curve(f,[lag,lag+27,43,59],[i%2?13:-13,0,0,i%2?-22:22],[CURVES.enter,CURVES.drift,CURVES.snap]);
  const rot=cubicTrack(f,[{at:0,value:c.r+(i%2?-9:9),velocity:0},{at:25,value:c.r,velocity:-c.r*.008},{at:43,value:c.r*.9,velocity:-c.r*.008},{at:59,value:0,velocity:0}]);
  const blur=Math.min(13,Math.hypot(speed(xAt,f),speed(yAt,f))*.055)+(1-p)*4+q*5;
  return <div key={i} style={{position:'absolute',left:xAt(f)-480,top:yAt(f)-300,width:960,height:600,transformOrigin:'50% 50%',transform:`scale(${sc}) rotate(${rot}deg) rotateY(${tilt}deg) rotateX(${-tilt*.4}deg)`,opacity:curve(f,[lag,lag+8,51,59],[0,1,1,0],[CURVES.enter,CURVES.drift,CURVES.depart]),filter:`blur(${blur}px)`,willChange:'transform'}}><ProductBoard kind={c.k}/></div>;
 })}</div></Frame>
};
