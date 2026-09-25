import {Easing} from 'remotion';
import {sourceVelocity} from './clock';
import timing from '../config/timeline.json';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const progress=(f:number,start:number,end:number)=>clamp((f-start)/(end-start));
const curve=(v:number[])=>Easing.bezier(v[0],v[1],v[2],v[3]);
const arrive=curve(timing.curves.arrive),travel=curve(timing.curves.travel),depart=curve(timing.curves.depart),focus=curve(timing.curves.focus);
export const a=(f:number,start:number,end:number)=>arrive(progress(f,start,end));
export const m=(f:number,start:number,end:number)=>travel(progress(f,start,end));
export const d=(f:number,start:number,end:number)=>depart(progress(f,start,end));
export const optical=(f:number,start:number,end:number)=>focus(progress(f,start,end));
export type Sample={x?:number;y?:number;scale?:number;rotate?:number;width?:number;height?:number};
// Symmetric shutter interval avoids a one-frame lag in the blur peak.
export const motionBlur=(f:number,sample:(frame:number)=>Sample,radius=180,cap=14)=>{
 const shutter=.32*sourceVelocity(f),before=sample(f-shutter),after=sample(f+shutter);
 const dx=(after.x||0)-(before.x||0),dy=(after.y||0)-(before.y||0);
 const size=Math.max(Math.abs((after.width||0)-(before.width||0)),Math.abs((after.height||0)-(before.height||0)))*.5;
 const angle=Math.abs((after.rotate||0)-(before.rotate||0))*Math.PI/180*radius;
 const zoom=Math.abs((after.scale??1)-(before.scale??1))*radius;
 return Math.min(cap,(Math.hypot(dx,dy)+size+angle+zoom)*.20);
};
export const focusIn=(f:number,start:number,end:number,amount=18)=>amount*(1-optical(f,start,end));
export const focusOut=(f:number,start:number,end:number,amount=16)=>amount*d(f,start,end);
export const pose=(f:number,start:number,end:number,distance=70)=>{
 const sample=(q:number)=>({y:mix(distance,0,a(q,start,end))});
 return {opacity:progress(f,start,start+3),transform:'translateY('+sample(f).y+'px)',filter:'blur('+Math.max(focusIn(f,start,end,12),motionBlur(f,sample,150,12))+'px)'};
};
// Keyframe plateaus are intentional reading time. Paths between them carry motion.
export const track=(f:number,keys:number[][])=>{
 if(f<=keys[0][0])return keys[0].slice(1);
 for(let i=1;i<keys.length;i++)if(f<keys[i][0]){
  const p=m(f,keys[i-1][0],keys[i][0]);
  return keys[i].slice(1).map((v,j)=>mix(keys[i-1][j+1],v,p));
 }
 return keys[keys.length-1].slice(1);
};
export const cubic=(p:number,a:number,b:number,c:number,d:number)=>{
 const q=1-p;return q*q*q*a+3*q*q*p*b+3*q*p*p*c+p*p*p*d;
};
// A geometric Bezier is separate from the time curve. Bend is zero during holds.
export const spatialTrack=(f:number,keys:number[][],bend=.14)=>{
 const values=track(f,keys);
 for(let i=1;i<keys.length;i++)if(f>=keys[i-1][0]&&f<keys[i][0]){
  const from=keys[i-1],to=keys[i],t=m(f,from[0],to[0]),dx=to[1]-from[1],dy=to[2]-from[2];
  if(Math.hypot(dx,dy)>180){
   const nx=-dy*bend,ny=dx*bend;
   values[0]=cubic(t,from[1],from[1]+dx*.3+nx,from[1]+dx*.7+nx,to[1]);
   values[1]=cubic(t,from[2],from[2]+dy*.3+ny,from[2]+dy*.7+ny,to[2]);
  }
  break;
 }
 return values;
};
export const travelBlur=(f:number,start:number,end:number,distance:number)=>motionBlur(f,q=>({x:distance*m(q,start,end)}));
