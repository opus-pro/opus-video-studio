import React from 'react';
import {AbsoluteFill,Easing,interpolate,Img,staticFile,spring,useCurrentFrame} from 'remotion';
import type {Brand} from './design';

export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const out=(f:number,d=18,delay=0)=>interpolate(f,[delay,delay+d],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)});
export const snap=(f:number,delay=0)=>spring({frame:f-delay,fps:60,config:{damping:19,stiffness:310,mass:.65}});
export const Box:React.FC<{x?:number;y?:number;w?:number|string;h?:number|string;style?:React.CSSProperties;children?:React.ReactNode}>=({x=0,y=0,w,h,style,children})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,...style}}>{children}</div>;
export const Text:React.FC<{x?:number;y?:number;size?:number;serif?:boolean;weight?:number;style?:React.CSSProperties;children:React.ReactNode}>=({x=0,y=0,size=80,serif=false,weight=700,style,children})=><Box x={x} y={y} style={{fontFamily:serif?'Instrument':'Geist',fontSize:size,fontWeight:serif?400:weight,letterSpacing:serif?'-0.025em':'-0.065em',lineHeight:.94,whiteSpace:'nowrap',...style}}>{children}</Box>;
export const Arrow:React.FC<{size?:number;color?:string;direction?:number}>=({size=40,color='currentColor',direction=0})=><svg width={size} height={size} viewBox="0 0 40 40" style={{rotate:`${direction}deg`}}><path d="M7 20H32M21 8L33 20L21 32" fill="none" stroke={color} strokeWidth="2.7" strokeLinecap="square"/></svg>;
export const Check:React.FC<{size?:number;color?:string}>=({size=40,color='currentColor'})=><svg width={size} height={size} viewBox="0 0 40 40"><path d="M7 20L16 29L34 10" fill="none" stroke={color} strokeWidth="3.5"/></svg>;
export const Cursor:React.FC<{x:number;y:number;f:number;click?:number;color?:string}>=({x,y,f,click=12,color='#381F25'})=>{
 const p=out(f,12);const ring=clamp((f-click)/15);
 return <Box x={x+(1-p)*100} y={y+(1-p)*80} style={{zIndex:15,scale:1-Math.sin(clamp((f-click+3)/9)*Math.PI)*.14}}>
 {f>=click&&ring<1?<div style={{position:'absolute',width:80,height:80,border:`2px solid ${color}`,borderRadius:100,left:-40,top:-40,scale:.4+ring*.8,opacity:1-ring}}/>:null}
 <svg width="50" height="58" viewBox="0 0 50 58"><path d="M5 4L8 45L20 33L30 53L38 49L29 30L45 29Z" fill={color} stroke="#FFF5E7" strokeWidth="2.5"/></svg></Box>
};
export const Mark:React.FC<{kind:string;size?:number;color?:string;f?:number}>=({kind,size=45,color='currentColor',f=0})=><svg width={size} height={size} viewBox="0 0 100 100" style={{overflow:'visible'}}>
 {kind==='TOVO'?<><rect x="4" y="13" width="36" height="60" rx="17" fill={color}/><rect x="49" y="27" width="36" height="60" rx="17" fill={color}/><path d="M16 68L14 91L35 70" fill={color}/></>:kind==='NUMO'?<><rect x="3" y="48" width="24" height="44" fill={color}/><rect x="38" y="8" width="24" height="84" fill={color}/><rect x="73" y="31" width="24" height="61" fill={color}/></>:<><path d="M10 90V12H87V31H32V47H72V66H32V90Z" fill={color}/><rect x="72" y="71" width="18" height="19" fill={color}/></>}
 </svg>;
export const Stage:React.FC<{brand:Brand;bg?:string;ink?:string;children:React.ReactNode;grain?:boolean}>=({brand,bg,ink,children,grain=true})=><AbsoluteFill style={{background:bg||brand.background,color:ink||brand.ink,fontFamily:'Geist',overflow:'hidden'}}>
 {children}
 {grain&&<Img src={staticFile('grain.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.075,mixBlendMode:'multiply',pointerEvents:'none'}}/>}
 </AbsoluteFill>;
export const Rule:React.FC<{x:number;y:number;w:number;color?:string;vertical?:boolean;opacity?:number}>=({x,y,w,color='currentColor',vertical=false,opacity=1})=><Box x={x} y={y} w={vertical?1:w} h={vertical?w:1} style={{background:color,opacity}}/>;
export const Pill:React.FC<{children:React.ReactNode;bg:string;color:string;style?:React.CSSProperties}>=({children,bg,color,style})=><div style={{background:bg,color,padding:'15px 24px',fontSize:64,fontWeight:570,letterSpacing:'-.025em',borderRadius:100,display:'inline-flex',alignItems:'center',gap:12,...style}}>{children}</div>;
export const HeroEnd:React.FC<{brand:Brand;f:number}>=({brand,f})=>{
 const p=snap(f);return <Stage brand={brand} bg={brand.template==='TOVO'?brand.accent:brand.background} >
 
 <Box x={85} y={224} style={{scale:.8+p*.2,opacity:out(f,8)}}><Mark kind={brand.template} size={137}/></Box>
 <Text x={258} y={205} size={252} weight={760} style={{translate:`0 ${(1-p)*140}px`}}>{brand.name.toLowerCase()}</Text>
 <Rule x={87} y={496} w={1100*out(f,25,4)}/><Text x={89} y={536} size={64} weight={450} style={{opacity:out(f,18,8)}}>{brand.tagline}</Text>
 <Box x={1140} y={531}><Arrow size={51}/></Box></Stage>;
};
