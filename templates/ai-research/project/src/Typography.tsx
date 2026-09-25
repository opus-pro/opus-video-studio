import React from 'react';
import {Easing} from 'remotion';
import {p,mix} from './motion';
import {brand} from '../config/brand';

// Approximation fitted to the reference's visible glyph boundary, not recovered author data.
export const measuredArrival=Easing.bezier(.13,1,.325,1);
export const editorialTravel=Easing.bezier(.64,0,.16,1);
export const departFast=Easing.bezier(.56,0,.88,.25);
const uninterruptedExit=Easing.bezier(.32,0,.70,.45);
const run=(t:number,s:number,e:number)=>measuredArrival(p(t,s,e));
const adv=(c:string)=>'ilI.,!|'.includes(c)?.24:'mwMW'.includes(c)?.82:c===' '?.28:'frt'.includes(c)?.35:.55;

export function TypeRun({id,text,t,start,end=99,size=150,x=960,y=540,color='#fff5e9',mode='line',weight=350,flowExit=false}:{id:string;text:string;t:number;start:number;end?:number;size?:number;x?:number;y?:number;color?:string;mode?:'hero'|'resolve'|'line';weight?:number;flowExit?:boolean}){
 const chars=Array.from(text),hero=mode==='hero',duration=hero?.69:mode==='resolve'?.47:.34;
 const delay=hero?.033:mode==='resolve'?.023:.016,dist=hero?740:mode==='resolve'?240:100;
 const width=chars.reduce((n,c)=>n+adv(c)*size,0);
 const scale=hero?mix(1.13,.97,run(t,start,start+.81)):mode==='resolve'?mix(1.03,1,run(t,start,start+.55)):1;
 // The opening phrases leave as one object. Travel continues beyond the final
 // visible frame, so neither position nor velocity blur can clamp during fade-out.
 const wholeX=(q:number)=>dist*(1-run(q,start,start+duration))-(flowExit
  ?(hero?1900:1450)*uninterruptedExit(p(q,end-.30,end+.04))
  :p(q,start+duration,end-.25)*(hero?44:12));
 const states=chars.map((c,i)=>{
  const begin=start+i*delay,leave=end-.19+i*.007;
  const localX=(q:number)=>size*(hero?.65:.31)*(1-run(q,begin,begin+duration))-(flowExit?0:(hero?490:230)*departFast(p(q,leave,leave+.19)));
  const tracking=(q:number)=>size*.065*(1-run(q,start,start+duration*.9));
  const pos=(q:number)=>wholeX(q)+localX(q)+(i-(chars.length-1)/2)*tracking(q);
  const velocity=(pos(t+.004)-pos(t-.004))/.008;
  const before=chars.slice(0,i).reduce((n,v)=>n+adv(v)*size,0);
  const screenX=x-width/2+before+pos(t),depth=mode==='line'?0:Math.min(16,Math.pow(Math.max(0,Math.abs(screenX-930)-500)/115,1.45));
  const bx=Math.min(29,Math.hypot(depth,Math.abs(velocity)*.0046)),by=Math.max(.05,depth*.67);
  const opacity=p(t,begin-.025,begin+.085)*(1-(flowExit?p(t,end-.085,end-.02):p(t,leave+.105,leave+.23)))*(1-Math.min(.38,depth/40));
  return {c,i,x:localX(t),track:tracking(t),bx,by,opacity,y:mode==='line'?14*(1-run(t,begin,begin+.3)):0};
 });
 if(t<start-.08||t>end+chars.length*.007+.08)return null;
 return <div style={{position:'absolute',left:x,top:y,transform:`translate(-50%,-50%) translateX(${wholeX(t)}px) scale(${scale})`,whiteSpace:'pre',display:'flex',alignItems:'baseline',fontSize:size,lineHeight:1.03,fontWeight:weight,letterSpacing:'-.045em',color}}>
  <svg width="0" height="0" style={{position:'absolute'}}><defs>{states.map(s=><filter key={s.i} id={`${id}-${s.i}`} x="-180%" y="-140%" width="460%" height="380%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${s.bx.toFixed(2)} ${s.by.toFixed(2)}`}/></filter>)}</defs></svg>
  {states.map(s=><span key={s.i} style={{display:'inline-block',opacity:s.opacity,marginRight:s.track,transform:`translate(${s.x}px,${s.y}px)`,filter:s.c===' '?undefined:`url(#${id}-${s.i})`}}>{s.c}</span>)}
 </div>
}

// All words occupy one spatial row. The camera and the shared selection frame move;
// outgoing and incoming words never crossfade on the same baseline position.
export function FocusConveyor({t}:{t:number}){
 const words=[{text:brand.name,x:0,w:365},{text:'your sources',x:950,w:880},{text:'in focus',x:2090,w:540}];
 const move1=editorialTravel(p(t,8.12,8.53)),move2=editorialTravel(p(t,8.91,9.33));
 const cam=950*move1+1140*move2,activeW=mix(mix(365,880,move1),540,move2);
 const arrival=run(t,7.47,7.91),exit=editorialTravel(p(t,9.54,9.9));
 const dark=p(t,8.99,9.24),color=`rgb(${mix(33,255,dark)},${mix(20,245,dark)},${mix(10,228,dark)})`;
 return <div style={{position:'absolute',inset:0,transform:`translateY(${(1-arrival)*250-exit*65}px) scale(${1+exit*.28})`,opacity:arrival*(1-exit)}}>
  {words.map((w,i)=>{const dx=w.x-cam,focus=Math.exp(-Math.pow(dx/510,2)),sc=.51+.49*focus;const v0=(editorialTravel(p(t+.004,8.12,8.53))-editorialTravel(p(t-.004,8.12,8.53)))*950/.008+(editorialTravel(p(t+.004,8.91,9.33))-editorialTravel(p(t-.004,8.91,9.33)))*1140/.008;
   const light=(1-focus)*.43,directionBlur=Math.min(28,Math.abs(v0)*.0032),depthBlur=Math.max(0,Math.abs(dx)-800)/260;const wordColor=`rgb(${mix(33,255,Math.max(dark,light))},${mix(20,245,Math.max(dark,light))},${mix(10,228,Math.max(dark,light))})`;
   return <React.Fragment key={w.text}><svg width="0" height="0" style={{position:'absolute'}}><defs><filter id={`conveyor-${i}`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation={`${Math.hypot(directionBlur,depthBlur)} ${depthBlur}`}/></filter></defs></svg><div style={{position:'absolute',left:960+dx,top:540,transform:`translate(-50%,-50%) scale(${sc})`,opacity:Math.max(0,1-Math.abs(dx)/1650),fontSize:158,fontWeight:360,letterSpacing:'-.05em',whiteSpace:'nowrap',color:wordColor,filter:`url(#conveyor-${i})`}}>{w.text}</div></React.Fragment>;
  })}
  {[-1,1].map(s=><div key={s} style={{position:'absolute',left:960+s*(activeW/2+64),top:540,transform:'translate(-50%,-50%)',fontSize:183,fontWeight:250,color}}>{s<0?'[':']'}</div>)}
 </div>
}
