import React from 'react';
import {Img,staticFile} from 'remotion';
import {Frame,Orb,useFrame30,curve,CURVES,cubicTrack} from '../common';
import {brand} from '../config';

export const Outro=()=>{
 const f=useFrame30();
 const reform=curve(f,[45,66],[0,1],CURVES.glide);
 const iconSize=curve(f,[0,13,27],[405,236,240],[CURVES.enter,CURVES.settle]);
 const iconY=cubicTrack(f,[{at:0,value:540,velocity:-14},{at:17,value:416,velocity:-.8},{at:32,value:416,velocity:0},{at:144,value:410,velocity:0}]);
 const headlineSize=curve(f,[45,65,77],[104,151,147],[CURVES.glide,CURVES.settle]);
 const wordTop=curve(f,[0,17,34,66],[630,580,579,575],[CURVES.enter,CURVES.settle,CURVES.glide]);
 return <Frame style={{background:'#9295d4',color:'#fff'}}>
  <div style={{position:'absolute',inset:-20,filter:`blur(${curve(f,[0,10,116,144],[5,0,0,2.4],[CURVES.enter,CURVES.drift,CURVES.glide])}px)`}}>
   <Img src={staticFile('images/meadow-outro.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',scale:cubicTrack(f,[{at:0,value:1.09,velocity:-.0025},{at:26,value:1.052,velocity:-.00025},{at:144,value:1.018,velocity:-.00023}]),translate:`${curve(f,[0,144],[-9,4],CURVES.drift)}px ${curve(f,[0,144],[5,-5],CURVES.drift)}px`,filter:`saturate(${curve(f,[0,23],[.45,1],CURVES.glide)}) hue-rotate(${curve(f,[0,23],[18,0],CURVES.glide)}deg)`}}/>
   <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,#24276633,#35266616 60%,transparent 90%)'}}/>
  </div>
  <div style={{position:'absolute',left:960-iconSize/2,top:iconY-iconSize/2,opacity:curve(f,[0,9],[0,1],CURVES.enter),rotate:`${curve(f,[0,16,30],[-6,1,0],[CURVES.enter,CURVES.settle])}deg`,filter:`blur(${curve(f,[0,10],[8,0],CURVES.enter)}px)`}}><Orb size={iconSize} terminal tile/></div>
  <div style={{position:'absolute',left:0,right:0,top:wordTop,textAlign:'center',fontSize:headlineSize,lineHeight:1.08,fontWeight:440,letterSpacing:-5,whiteSpace:'nowrap',opacity:curve(f,[11,23],[0,1],CURVES.enter)}}>
   <span style={{display:'inline-block',width:curve(f,[45,66],[294,0],CURVES.glide),opacity:1-reform,overflow:'hidden',verticalAlign:'top',filter:`blur(${reform*7}px)`,translate:`${-reform*30}px 0`,whiteSpace:'pre'}}>this is </span>
   <span style={{display:'inline-block',filter:`blur(${Math.sin(reform*Math.PI)*1.4}px)`}}>{Array.from(brand.name+'.').map((c,i)=><span key={i} style={{display:'inline-block',opacity:curve(f,[17+i*1.8,26+i*1.8],[0,1],CURVES.enter),translate:`0 ${curve(f,[17+i*1.8,31+i*1.8],[17,0],CURVES.enter)}px`}}>{c}</span>)}</span>
  </div>
  <div style={{position:'absolute',left:0,right:0,top:750,textAlign:'center',fontSize:31,fontWeight:400,letterSpacing:-.3}}>{brand.tagline.split(' ').map((word,i)=>{const p=curve(f,[64+i*3.2,80+i*3.2],[0,1],CURVES.enter);return <span key={word} style={{display:'inline-block',whiteSpace:'pre',opacity:p,translate:`0 ${(1-p)*13}px`,filter:`blur(${(1-p)*4}px)`}}>{word+' '}</span>})}</div>
 </Frame>
};
