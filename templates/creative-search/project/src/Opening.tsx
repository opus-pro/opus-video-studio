import {motionFrame} from './BeatTiming';
import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {KineticType} from './KineticType';
import {p,lin,slow,focusBlur,center,Icon,Metal} from './common';
export const Opening=({speed=1}:{speed?:number})=>{const local=useCurrentFrame();const f=motionFrame('opening',local);const prevF=motionFrame('opening',local-1); const {width}=useVideoConfig(); const strip=p(f,168,185); const spread=p(f,187,211); const collapse=slow(f,230,274); const buttonShrink=slow(f,281,301); const typed='find my files'.slice(0,Math.floor(lin(f,124,165)*13));return <>
{f<181&&<div style={{...center,width:440,height:60,display:'flex',alignItems:'center',gap:30,opacity:p(f,4,28)*(1-p(f,168,179)),transform:`translate(-50%,-50%) scale(${.68+.32*p(f,8,36)+.26*p(f,110,150)})`,filter:`blur(${(1-p(f,4,30))*9}px)`}}><Icon kind="back"/><span style={{opacity:1-p(f,111,130)}}><Icon kind="screen"/></span><div style={{width:192,color:typed?'#202326':'#85898c',fontSize:22,whiteSpace:'nowrap'}}>{f<114?'Search anything':<KineticType text="find my files" f={f} prevF={prevF} start={124} end={165} size={22} cursor/>}</div><Icon kind="reload"/><Icon kind="more"/>
<div style={{position:'absolute',height:2,width:108,left:155,top:68,background:'linear-gradient(90deg,#99d8ff,#253bbf,#e4a6db)',opacity:p(f,22,38)*(1-p(f,62,75)),transform:`scaleX(${p(f,22,48)})`}}/>
<div style={{position:'absolute',width:12,height:12,borderRadius:'50%',background:'#1c1d20',left:216,top:68-120*Math.sin(Math.PI*lin(f,67,112)),opacity:p(f,64,73)*(1-p(f,111,116))}}/>
</div>}
{f>=168&&<div style={{...center,width:(width*strip)*(1-collapse)+Math.max(58,250*(1-buttonShrink))*collapse,height:(76+1004*spread)*(1-collapse)+78*collapse,overflow:'hidden',opacity:1-p(f,294,304),filter:`blur(${focusBlur(f,230,275,16)+p(f,293,303)*9}px)`,boxShadow:collapse>.9?'0 5px 12px #18335410':'none'}}><Metal f={f}/><div style={{position:'absolute',inset:0,background:'#f1f1f1',opacity:spread*.25*(1-collapse)}}/>
<div style={{...center,color:'white',fontSize:37,whiteSpace:'nowrap',letterSpacing:-1.3,opacity:(1-p(f,223,237)),filter:`blur(${p(f,224,237)*8}px)`,transform:`translate(-50%,-50%) scale(${1-.1*p(f,204,229)})`}}>A new way to find creative files<span style={{marginLeft:8,opacity:.7}}>|</span></div>
<div style={{...center,color:'white',fontSize:28,whiteSpace:'nowrap',opacity:p(f,255,273)*(1-buttonShrink),display:'flex',alignItems:'center',gap:13}}><Icon kind="spark"/>Ask AI</div></div>}
</>};
