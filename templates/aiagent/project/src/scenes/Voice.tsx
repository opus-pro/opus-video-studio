import React from 'react';
import {Easing, interpolate, interpolateColors} from 'remotion';
import {Frame, Mic, Cursor, useFrame30} from '../common';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (f: number, from: number, to: number, bezier: [number, number, number, number]) =>
  interpolate(f, [from, to], [0, 1], {...clamp, easing: Easing.bezier(...bezier)});

// Velocity at each key defines the cubic Bézier control points. The camera
// preserves velocity across beats instead of restarting ease-out at every key.
type Key = [time: number, value: number, velocity: number];
const track = (f: number, keys: Key[]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, p3, velocity1] = keys[i];
    const [t0, p0, velocity0] = keys[i - 1];
    if (f <= t1) {
      const duration = t1 - t0;
      const t = (f - t0) / duration;
      const u = 1 - t;
      const p1 = p0 + velocity0 * duration / 3;
      const p2 = p3 - velocity1 * duration / 3;
      return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
    }
  }
  return keys[keys.length - 1][1];
};
const zoomKeys: Key[] = [[0,1,0],[12,1,0],[19,1.06,.026],[30,2.62,.08],[38,2.88,.004],[44,2.89,-.005],[56,2.49,-.038],[66,2.24,-.009],[74,2.22,0],[84,2.34,.026]];
const cameraKeys: Key[] = [[0,960,0],[12,960,0],[21,996,7],[34,1083,1.5],[43,1096,3],[51,1268,44],[60,1820,38],[68,1940,0],[74,1940,0],[84,1970,6]];

export const Voice = () => {
  const f = useFrame30();
  const zoom = track(f, zoomKeys);
  const cameraX = track(f, cameraKeys);
  const cameraY = track(f, [[0,540,0],[36,534,0],[67,540,0],[84,540,0]]);
  const panSpeed = Math.abs(track(f+.15,cameraKeys)-track(f-.15,cameraKeys))/.3;
  const cameraBlur = Math.min(5.5,Math.max(0,panSpeed-8)*.075)/zoom;
  const pillWidth = track(f, [[0,130,0],[18,130,0],[25,438,40],[34,590,0],[41,580,0],[84,580,0]]);
  const activation = ease(f,18,27,[.16,.75,.24,1]);
  const micPress = track(f, [[0,1,0],[17,1,0],[20.5,.85,0],[26,1.035,0],[32,1,0]]);
  const ripple = ease(f,19,32,[.18,.65,.25,1]);
  const waveIn = ease(f,23,33,[.14,.7,.32,1]);
  const waveEnergy = track(f, [[0,0,0],[21,0,0],[29,1,0],[43,.87,-.01],[57,.48,-.015],[68,.2,0]]);
  const ideaIn = ease(f,47,58,[.19,.64,.28,1]);
  const handoff = ease(f,76,85,[.45,0,.24,1]);
  const cursorX = track(f, [[0,1380,0],[7,1314,-18],[15,1112,-16],[18,1076,0],[22,1076,0],[31,1123,7],[37,1170,8]]);
  const cursorY = track(f, [[0,749,0],[7,690,-13],[15,542,-8],[18,529,0],[22,529,0],[31,665,20],[37,794,22]]);
  const buildIn = ease(f,79,91,[.12,.72,.22,1]);
  const forYouIn = ease(f,89,102,[.2,.76,.27,1]);
  return <Frame style={{color:'#17243e'}}>
    <div style={{position:'absolute',inset:0,transformOrigin:'0 0',transform:`translate3d(960px,540px,0) scale(${zoom}) translate3d(${-cameraX}px,${-cameraY}px,0)`,opacity:1-handoff,filter:`blur(${cameraBlur}px)`}}>
      <div style={{position:'absolute',top:481,left:605,fontSize:94,letterSpacing:-4,whiteSpace:'nowrap'}}>You just</div>
      <div style={{position:'absolute',left:1015,top:459,height:146,width:pillWidth,borderRadius:85,background:'white',border:'1.5px solid #e9f2f8',boxShadow:`0 ${8+activation*7}px ${15+activation*13}px #8bbbec35,inset 0 1px 10px #f3f9ff`,display:'flex',alignItems:'center',overflow:'hidden',paddingLeft:21,gap:21}}>
        <div style={{position:'relative',height:95,width:95,flexShrink:0,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',transform:`scale(${micPress})`}}>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'#d7ebff',opacity:activation*(1-ease(f,35,47,[.45,0,.35,1]))}}/>
          <div style={{position:'absolute',inset:-3,borderRadius:'50%',border:'2px solid #a9cfff',opacity:f<19?0:(1-ripple)*.75,transform:`scale(${.75+ripple*.9})`}}/>
          <div style={{position:'relative'}}><Mic size={70} color={interpolateColors(activation,[0,1],['#6855ce','#a5d3ee'])} stroke={4}/></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,height:108,opacity:waveIn,overflow:'hidden',width:381,transform:`translateX(${(1-waveIn)*24}px)`}}>
          {Array.from({length:22},(_,i)=>{
            const phase=f*.24-i*.62;
            const syllable=.45+.32*Math.sin(phase)+.17*Math.sin(phase*1.63+i*.42);
            const envelope=Math.pow(Math.sin((i+1)/24*Math.PI),.58);
            const height=8+(21+73*syllable*syllable)*envelope*waveEnergy;
            return <div key={i} style={{width:7,flexShrink:0,height,borderRadius:8,background:'linear-gradient(#c8c5f3,#abd3f1)',opacity:.95-i*.027}}/>;
          })}
        </div>
      </div>
      <Cursor x={cursorX} y={cursorY} size={70*micPress} opacity={ease(f,2,7,[.2,.6,.3,1])*(1-ease(f,27,36,[.4,0,.75,1]))} rotation={track(f,[[0,-22,0],[16,-10,0],[23,-10,0],[36,-22,0]])}/>
      <div style={{position:'absolute',left:1615,top:480,width:650,textAlign:'center',fontSize:97,letterSpacing:-4,whiteSpace:'nowrap',opacity:ideaIn,transform:`translateY(${(1-ideaIn)*12}px)`,filter:`blur(${(1-ideaIn)*7}px)`}}>Your idea</div>
    </div>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:99,letterSpacing:-4,opacity:handoff,transform:`scale(${.97+buildIn*.03})`}}>
      <span style={{display:'inline-block',opacity:buildIn,transform:`translateY(${(1-buildIn)*20}px)`,filter:`blur(${(1-buildIn)*6}px)`}}>and it builds</span>
      <span style={{display:'inline-block',marginLeft:24,color:'#abc8ed',opacity:forYouIn,transform:`translateY(${(1-forYouIn)*18}px)`,filter:`blur(${(1-forYouIn)*6}px)`}}>for you</span>
    </div>
  </Frame>;
};
