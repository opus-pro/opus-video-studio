import React from 'react';
import {abs} from './Stage';

// Editable device geometry, adapted from the project's earlier phone study.
// The body can travel and crop while its contents retain one coordinate system.
export function Phone({children,x=960,y=680,w=580,h=1220,scale=1,ry=0,rz=0,blur=0,opacity=1,white=false}:{children:React.ReactNode;x?:number;y?:number;w?:number;h?:number;scale?:number;ry?:number;rz?:number;blur?:number;opacity?:number;white?:boolean}){
 return <div style={{...abs,left:x-w/2,top:y-h/2,width:w,height:h,transform:'perspective(2400px) rotateY('+ry+'deg) rotateZ('+rz+'deg) scale('+scale+')',transformOrigin:'50% 50%',border:'5px solid #253e37',borderRadius:w*.145,background:white?'#fff':'linear-gradient(150deg,#fafffc,#e9f7f0)',boxShadow:'0 0 0 3px #b2d6c7,inset 0 0 0 2px white,0 30px 90px #153f4424',overflow:'hidden',opacity,filter:'blur('+blur+'px)'}}>
  {children}
  <div style={{...abs,top:w*.03,left:'35%',width:'30%',height:w*.06,borderRadius:40,background:'#19332d'}}/>
  <div style={{...abs,bottom:12,left:'35%',width:'30%',height:6,borderRadius:6,background:'#355e50'}}/>
 </div>;
}
