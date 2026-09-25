import {Easing} from 'remotion';
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const p=(t:number,s:number,e:number)=>clamp((t-s)/(e-s));
export const curves={arrive:Easing.bezier(.16,1,.3,1),travel:Easing.bezier(.76,0,.24,1),depart:Easing.bezier(.65,0,.9,.35),focus:Easing.bezier(.22,.7,.14,1),glide:Easing.bezier(.25,.1,.25,1)};
export const a=(t:number,s:number,e:number)=>curves.arrive(p(t,s,e));
export const m=(t:number,s:number,e:number)=>curves.travel(p(t,s,e));
export const d=(t:number,s:number,e:number)=>curves.depart(p(t,s,e));
export const lerp=(t:number,keys:number[][],mode:'arrive'|'travel'|'glide'='travel')=>{
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++)if(t<keys[i][0])return mix(keys[i-1][1],keys[i][1],curves[mode](p(t,keys[i-1][0],keys[i][0])));
 return keys[keys.length-1][1];
};
// Derive blur from actual screen-space displacement over a 144-degree shutter.
export const blur=(t:number,fn:(q:number)=>number,gain=.3,max=15)=>Math.min(max,Math.abs(fn(t+.0067)-fn(t-.0067))*gain);
export const textIn=(t:number,s:number,i=0)=>{const q=a(t,s+i*.014,s+.31+i*.014);return {opacity:p(t,s+i*.014,s+.07+i*.014),transform:`translateY(${(1-q)*48}px) scale(${.92+.08*q})`,filter:`blur(${(1-q)*17}px)`}};
