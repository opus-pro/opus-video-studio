import React from 'react';
import {Easing, Img, interpolate, staticFile} from 'remotion';
import {Frame, Mic, Cursor, useFrame30} from '../common';
import {brand} from '../config';

const clamp = {extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=(f:number,from:number,to:number,bezier:[number,number,number,number])=>
  interpolate(f,[from,to],[0,1],{...clamp,easing:Easing.bezier(...bezier)});
type Key=[time:number,value:number,velocity:number];
const track=(f:number,keys:Key[])=>{
  if(f<=keys[0][0])return keys[0][1];
  for(let i=1;i<keys.length;i++){
    const [t1,p3,velocity1]=keys[i];
    const [t0,p0,velocity0]=keys[i-1];
    if(f<=t1){
      const duration=t1-t0;
      const t=(f-t0)/duration;
      const u=1-t;
      const p1=p0+velocity0*duration/3;
      const p2=p3-velocity1*duration/3;
      return u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3;
    }
  }
  return keys[keys.length-1][1];
};
// Continuous cubic Bézier trajectories: establish, lean into the prompt, then
// carry momentum across the field and arrive on the submit button.
const scaleKeys:Key[]=[[0,1.16,-.02],[13,1.03,-.003],[25,1.015,0],[32,1.12,.039],[43,1.96,.019],[60,2.015,.004],[69,2.13,.024],[81,3.09,.125],[94,4.63,.055],[103,4.87,.025],[109,5.65,.37],[116,10.3,.85]];
const cameraXKeys:Key[]=[[0,960,0],[25,960,0],[33,820,-33],[43,595,-4],[57,607,3],[66,670,12],[74,921,48],[85,1458,31],[96,1620,0],[116,1620,0]];
const cameraYKeys:Key[]=[[0,525,1.6],[17,540,0],[27,540,0],[43,591,0],[71,595,.08],[96,592.5,0],[116,592.5,0]];
const cursorXKeys:Key[]=[[0,135,0],[19,135,0],[31,258,14],[43,344,5],[53,420,12],[63,635,27],[75,995,38],[88,1475,28],[98,1605,0],[104,1605,0],[116,1595,-1]];
const cursorYKeys:Key[]=[[0,809,0],[19,809,0],[31,698,-10],[43,643,0],[53,658,1],[63,663,0],[75,648,-2],[88,624,-2],[98,584,0],[104,584,0],[116,617,4]];

export const PromptDemo=()=>{
  const f=useFrame30();
  const camScale=track(f,scaleKeys);
  const camX=track(f,cameraXKeys);
  const camY=track(f,cameraYKeys);
  const speed=Math.abs(track(f+.15,cameraXKeys)-track(f-.15,cameraXKeys))/.3;
  const speedBlur=Math.min(5.5,Math.max(0,speed-10)*.1)/camScale;
  const establish=ease(f,0,13,[.12,.67,.25,1]);
  const fieldIn=ease(f,3,17,[.2,.73,.25,1]);
  const toApp=ease(f,37,44,[.45,0,.19,1]);
  const toTool=ease(f,59,66,[.45,0,.19,1]);
  const suffixWidth=166-toApp*44-toTool*27;
  const press=track(f,[[0,1,0],[99,1,0],[102,.84,0],[106,1.045,0],[111,1,0],[116,1,0]]);
  const ripple=ease(f,102,115,[.12,.62,.26,1]);
  const clickHalo=f<101?0:(1-ease(f,101,113,[.36,0,.7,1]));
  const flash=ease(f,109,115,[.52,0,.25,1]);
  const suffixes=[
    {text:'a website',opacity:1-toApp,y:-toApp*31,blur:toApp*2},
    {text:'an app',opacity:toApp*(1-toTool),y:(1-toApp)*31-toTool*31,blur:(1-toApp+toTool)*2},
    {text:'a tool',opacity:toTool,y:(1-toTool)*31,blur:(1-toTool)*2},
  ];
  return <Frame style={{background:'#668e8a'}}>
    <div style={{position:'absolute',inset:0,transformOrigin:'0 0',transform:`translate3d(960px,540px,0) scale(${camScale}) translate3d(${-camX}px,${-camY}px,0)`,filter:`blur(${speedBlur+(1-establish)*3.2}px)`}}>
      <Img src={staticFile('images/meadow-input.png')} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',transform:`translate3d(${-f*.036}px,${f*.012}px,0) scale(${1.035+f*.00018})`}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(#05282e55,#12383b28 65%,#12151b18)'}}/>
      <div style={{position:'absolute',inset:0,background:'#2fa8ed',mixBlendMode:'color',opacity:(1-establish)*.62}}/>
      <div style={{position:'absolute',top:344,left:0,right:0,textAlign:'center',fontSize:57,fontWeight:460,color:'white',letterSpacing:-2,opacity:establish,transform:`translateY(${(1-establish)*18}px)`,textShadow:'0 2px 10px #42686822'}}>{brand.promptTitle}</div>
      <div style={{position:'absolute',left:240,top:535+(1-fieldIn)*13,width:1440,height:115,borderRadius:70,border:'1.7px solid #ffffffa8',background:'linear-gradient(113deg,#ffffff2c,#ffffff0d 60%,#d6f3f31b)',boxShadow:'inset 0 2px 3px #ffffff67,inset 0 -1px 4px #d7f2ef38,0 12px 24px #18383c24',backdropFilter:'blur(18px)',color:'#fff',opacity:fieldIn}}>
        <div style={{position:'absolute',inset:3,borderRadius:66,borderTop:'1px solid #ffffff21',pointerEvents:'none'}}/>
        <div style={{position:'absolute',left:35,top:22,fontSize:53,fontWeight:250,width:43,lineHeight:1}}>+</div>
        <div style={{position:'absolute',left:116,top:32,height:48,lineHeight:'48px',fontSize:36,letterSpacing:-.6,whiteSpace:'nowrap',display:'flex',alignItems:'center'}}>
          <span style={{marginRight:9}}>Build me</span>
          <span style={{display:'inline-block',position:'relative',width:suffixWidth,height:48,overflow:'hidden'}}>
            {suffixes.map(({text,opacity,y,blur})=><span key={text} style={{position:'absolute',left:0,top:0,whiteSpace:'nowrap',opacity,transform:`translateY(${y}px)`,filter:`blur(${blur}px)`,color:text==='a website'?'#fff':'#efe8ff'}}>{text}</span>)}
          </span>
          <span style={{width:1.8,height:34,background:'#fff',marginLeft:2,opacity:(.55+.45*Math.cos(f*.3))*(1-ease(f,72,80,[.4,0,.65,1]))}}/>
        </div>
        <span style={{position:'absolute',right:220,top:43,fontSize:22,opacity:.88}}>5.5 Medium <span style={{paddingLeft:8,fontSize:18}}>⌄</span></span>
        <div style={{position:'absolute',right:127,top:38}}><Mic size={37} stroke={4} color="white"/></div>
        <div style={{position:'absolute',right:24,top:21.5,width:72,height:72,transform:`scale(${press})`,borderRadius:'50%',background:'linear-gradient(140deg,#f8fcff,#d9efff)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 5px #25435118,inset 0 1px 2px #ffffffd9'}}>
          <div style={{position:'absolute',inset:-4,borderRadius:'50%',border:'2px solid #e5f6ff',opacity:clickHalo*.75,transform:`scale(${1+ripple*1.35})`}}/>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'#b7dcff',opacity:Math.max(0,(1-press)*3)}}/>
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="#506676" strokeWidth="2.4" style={{position:'relative',transform:`translateY(${(1-press)*5}px)`}}><path d="M24 38V9M11 22L24 9L37 22"/></svg>
        </div>
      </div>
      <Cursor x={track(f,cursorXKeys)} y={track(f,cursorYKeys)} size={track(f,[[0,60,0],[69,60,0],[93,49,0],[116,49,0]])*press} opacity={ease(f,19,28,[.15,.7,.3,1])} rotation={track(f,[[0,-22,0],[39,-11,0],[58,-8,0],[77,7,0],[98,-12,0],[116,-16,0]])}/>
    </div>
    <div style={{position:'absolute',inset:0,background:'#fff',opacity:flash}}/>
  </Frame>;
};
