import React from 'react';
import {interpolate, Easing} from 'remotion';
export const ease=Easing.bezier(.22,1,.36,1);
export const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
export const lin=(f:number,a:number,b:number)=>Math.max(0,Math.min(1,(f-a)/(b-a)));
export const center:React.CSSProperties={position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)'};
export const Icon=({kind,size=25}:{kind:string,size?:number})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{kind==='back'?<path d="m14 6-6 6 6 6"/>:kind==='screen'?<><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8m-4-4v4"/></>:kind==='reload'?<><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>:kind==='spark'?<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>:<><circle cx="4" cy="12" r=".8"/><circle cx="12" cy="12" r=".8"/><circle cx="20" cy="12" r=".8"/></>}</svg>;
export const Metal=({f=0}:{f?:number})=><div style={{position:'absolute',inset:-100,background:'#a7bdcf',overflow:'hidden',filter:'blur(23px)',transform:`scale(1.2) translateX(${Math.sin(f/70)*40}px)`}}><div style={{position:'absolute',inset:0,background:'linear-gradient(118deg,#071e32 2%,#bad9ee 24%,#344a68 39%,#d8f0ff 57%,#718baa 70%,#e4eef6 86%,#2f5274 100%)'}}/>{[0,1,2,3].map(i=><div key={i} style={{position:'absolute',width:700,height:1300,left:i*350-470,top:-210,border:'55px solid rgba(231,246,255,.6)',borderRadius:'50%',transform:`rotate(-32deg) translateY(${Math.sin(f/95+i)*70}px)`,boxShadow:'40px 15px 60px #102f55'}}/>)}</div>;

// Fast travel followed by a longer deceleration and focus recovery.
export const slow=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.12,.82,.20,1)});
export const focusBlur=(f:number,a:number,b:number,amount:number)=>amount*p(f,a,a+5)*(1-slow(f,a+5,b));
