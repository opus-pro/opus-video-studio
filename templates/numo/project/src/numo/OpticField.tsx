import React from 'react';
import {Brand} from '../design';
import {out} from '../shared';

// Continuous positive/negative bands create the illusion of a compressed sheet.
// All paths share the same warp so gaps remain ordered as the field deforms.
export const OpticField:React.FC<{b:Brand;f:number;amount?:number;inverse?:boolean;phase?:number}>=({b,f,amount=1,inverse=false,phase=0})=>{
 const strength=(112+72*out(f,28))*amount;
 const shift=.6*(1-out(f,34))+phase;
 const xAt=(x:number,y:number)=>x+strength*Math.exp(-Math.pow((x-650)/550,2))*Math.sin((y-300)/182+shift);
 const ys=Array.from({length:49},(_,i)=>-24+i*16);
 const dark=inverse?b.accent:b.background,light=inverse?b.background:b.accent;
 return <svg width="100%" height="100%" viewBox="0 0 1280 720" preserveAspectRatio="none" style={{display:'block'}}>
  <rect width="1280" height="720" fill={dark}/>
  {Array.from({length:62},(_,i)=>{
   const left=-250+i*30,right=left+15;
   const a=ys.map((y,j)=>`${j===0?'M':'L'}${xAt(left,y).toFixed(2)} ${y}`).join(' ');
   const z=[...ys].reverse().map(y=>`L${xAt(right,y).toFixed(2)} ${y}`).join(' ');
   return <path key={i} d={`${a} ${z} Z`} fill={light}/>;
  })}
 </svg>;
};
