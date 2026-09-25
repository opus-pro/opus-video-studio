import React from 'react';
import {Easing} from 'remotion';
import {Frame,Star,useFrame30} from '../common';

type Handles=[number,number,number,number];
const unit=(x:number)=>Math.max(0,Math.min(1,x));
const p=(f:number,a:number,b:number,h:Handles)=>Easing.bezier(...h)(unit((f-a)/(b-a)));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const letterIn=(f:number,i:number,from:number,stagger:number=0.65)=>p(f,from+i*stagger,from+i*stagger+6,[.19,.66,.26,1]);
const codeLetters=['C','o','d','e','?'];
const codeGhosts=['{','#','*','/','}'];

export const TypeSequence=()=>{
 const f=useFrame30();
 const write=p(f,16,30,[.52,.02,.17,1]);
 const typeOut=p(f,37,44,[.64,0,.83,.55]);
 const codeIn=p(f,37,45,[.17,.67,.24,1]);
 const codeOut=p(f,60,67,[.63,0,.76,.42]);
 const codeScale=f<45?mix(.5,1.035,codeIn):mix(1.035,1,p(f,45,53,[.26,0,.33,1]));
 const you=p(f,63,70,[.18,.67,.28,1]);
 const just=p(f,72,81,[.34,.02,.2,1]);
 const speak=p(f,86,97,[.32,.02,.22,1]);
 const baseScale=mix(.965,1,p(f,0,9,[.23,.7,.32,1]));
 return <Frame>
  {f<45&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:28,fontSize:140,lineHeight:1.18,letterSpacing:-7,opacity:1-typeOut,scale:baseScale*(1+typeOut*.12),filter:`blur(${typeOut*11}px)`}}>
   <span style={{translate:`${(1-write)*14}px 0`,whiteSpace:'nowrap'}}>{Array.from('without').map((c,i)=>{const t=letterIn(f,i,-2,.38);return <span key={i} style={{display:'inline-block',opacity:t,translate:`0 ${(1-t)*18}px`,filter:`blur(${(1-t)*5}px)`}}>{c}</span>;})}</span>
   <span style={{display:'flex',alignItems:'center',gap:25,width:write*570,overflow:'visible'}}>
    <span style={{display:'flex',width:122,height:140,alignItems:'center',justifyContent:'center',flexShrink:0,scale:mix(.36,1,p(f,17,27,[.16,1.28,.35,1])),opacity:p(f,16,21,[.3,0,.2,1]),rotate:`${mix(-115,0,p(f,17,31,[.22,.8,.3,1]))}deg`}}>{f<22?<span style={{fontSize:145,color:'#6354de',lineHeight:1}}>{f<19?'{':'✳'}</span>:<Star size={122}/>}</span>
    <span style={{whiteSpace:'nowrap',color:f<32?'#6554dd':'#15151b'}}>{Array.from('writing').map((c,i)=>{const t=letterIn(f,i,21,.66);return <span key={i} style={{display:'inline-block',opacity:t,translate:`${(1-t)*14}px ${(1-t)*17}px`,filter:`blur(${(1-t)*8}px)`}}>{c}</span>;})}</span>
   </span>
  </div>}
  {f>=37&&f<68&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:410,lineHeight:1.16,fontWeight:420,letterSpacing:-23,opacity:codeIn*(1-codeOut),scale:codeScale*(1+codeOut*.08),translate:`0 ${mix(35,0,codeIn)-codeOut*22}px`,filter:`blur(${(1-codeIn)*13+codeOut*17}px)`}}>
   {codeLetters.map((c,i)=>{
    const settle=p(f,39+i*.72,45+i*.72,[.2,.75,.28,1]);
    const ghostOut=p(f,39+i*.72,43+i*.72,[.5,0,.65,.45]);
    return <span key={c} style={{position:'relative',display:'inline-block',translate:`0 ${mix(26,0,settle)}px`,rotate:`${mix(i%2?-4:3,0,settle)}deg`}}>
     <span style={{opacity:settle,filter:`blur(${(1-settle)*9}px)`}}>{c}</span>
     {ghostOut<1&&<span style={{position:'absolute',inset:0,textAlign:'center',color:i===2?'#6553d8':'#111',fontSize:i===2?'76%':undefined,opacity:1-ghostOut,translate:`0 ${-ghostOut*65}px`,filter:`blur(${ghostOut*9}px)`}}>{codeGhosts[i]}</span>}
    </span>;
   })}
  </div>}
  {f>=63&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:96,lineHeight:1.18,letterSpacing:-3.5,color:'#182539',opacity:you,scale:mix(1.075,1,you),translate:`0 ${mix(18,0,you)}px`,filter:`blur(${(1-you)*7}px)`}}>
   <span style={{whiteSpace:'nowrap'}}><span style={{color:f<73?'#789ad1':'#182539'}}>You</span><span style={{display:'inline-block',whiteSpace:'pre',width:just*186,verticalAlign:'bottom',overflow:'visible'}}>{Array.from(' just').map((c,i)=>{const t=letterIn(f,i,72,.42);return <span key={i} style={{display:'inline-block',whiteSpace:'pre',opacity:t,translate:`0 ${(1-t)*13}px`,filter:`blur(${(1-t)*4}px)`}}>{c}</span>;})}</span><span style={{display:'inline-block',whiteSpace:'pre',width:speak*280,color:'#253148',verticalAlign:'bottom',overflow:'visible'}}>{Array.from(' speak').map((c,i)=>{const t=letterIn(f,i,86,.42);return <span key={i} style={{display:'inline-block',whiteSpace:'pre',opacity:t,translate:`0 ${(1-t)*13}px`,filter:`blur(${(1-t)*4}px)`}}>{c}</span>;})}</span></span>
  </div>}
 </Frame>
};
