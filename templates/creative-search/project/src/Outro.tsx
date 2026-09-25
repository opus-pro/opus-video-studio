import React from 'react';
import {useCurrentFrame} from 'remotion';
import {p,center,Icon} from './common';
export const Outro=()=>{const f=useCurrentFrame();return <div style={{position:'absolute',inset:0,background:'#080a0d',opacity:p(f,0,16)}}><div style={{...center,textAlign:'center',color:'#f4f6f8',fontSize:44,letterSpacing:-1.8,transform:`translate(-50%,calc(-50% + ${(1-p(f,8,30))*14}px))`,opacity:p(f,8,30),filter:`blur(${(1-p(f,8,30))*6}px)`,whiteSpace:'nowrap'}}><div>Less searching.</div><div style={{marginTop:5}}>More creating.</div><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:9,color:'#9fb3c5',fontSize:22,letterSpacing:-.4,marginTop:27,opacity:p(f,37,59)}}><Icon kind="spark" size={21}/>Ask AI</div></div></div>};
