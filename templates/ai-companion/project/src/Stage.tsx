import React from 'react';
import {AbsoluteFill} from 'remotion';
import brand from '../config/brand.json';
import {a,m,mix} from './motion';
export const abs:React.CSSProperties={position:'absolute'};
export function Sky({f}:{f:number}){
 const white=0,sunset=m(f,362,375)*(1-m(f,549,559));
 return <AbsoluteFill style={{background:'linear-gradient(180deg,#124e4b 0%,'+brand.accent+' 37%,#a3dbd0 75%,#effaf4 100%)'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 57% 45%,#fbfffc,#edf9f3 70%,#d9ede5)',opacity:white}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 58%,#fff1d6 0%,#e6eadb 42%,#78aea3 100%)',opacity:sunset}}/>
  <div style={{...abs,left:300,top:-730,width:1400,height:1600,transform:'rotate(-12deg) translateX('+mix(-80,60,m(f,0,960))+'px)',background:'radial-gradient(ellipse at 50% 0%,#edfff590,transparent 67%)',filter:'blur(42px)'}}/>
  <svg width="1920" height="360" viewBox="0 0 1920 360" style={{...abs,left:0,bottom:-65,opacity:.7}}>
   <defs><filter id="cloudSoft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="24"/></filter><linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".87"/><stop offset="1" stopColor="#fff" stopOpacity=".2"/></linearGradient></defs>
   <path d="M-80 264C80 141 130 227 260 188C344 103 434 213 530 210C680 134 809 170 905 251C1052 155 1130 220 1212 185C1378 86 1510 210 1621 209C1771 137 1910 187 2000 255V430H-80Z" fill="url(#cloudFill)" filter="url(#cloudSoft)"/>
  </svg>
 </AbsoluteFill>;
}
export function Icon({kind,size=28}:{kind:'voice'|'send'|'plus'|'arrow'|'heart';size?:number}){
 return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{kind==='send'?<path d="M5 7L28 16L5 25L9 16Z M9 16H27"/>:kind==='voice'?<><rect x="12" y="4" width="8" height="17" rx="4"/><path d="M7 15V17A9 9 0 0 0 25 17V15M16 26V30"/></>:kind==='plus'?<path d="M16 6V26M6 16H26"/>:kind==='heart'?<path d="M16 26L5 15C-1 7 9 1 16 9C23 1 33 7 27 15Z"/>:<path d="M6 16H27M18 7L27 16L18 25"/>}</svg>;
}
