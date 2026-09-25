import React from 'react';
import {Brand} from '../design';
import {Box,Mark,out,Stage} from '../shared';
import {PrintGrain} from '../numo/PrintGrain';

export type IconName='grid'|'search'|'tasks'|'mic'|'calendar'|'user'|'plus'|'arrow'|'check'|'chevron'|'more'|'file'|'chart'|'bookmark'|'link'|'close'|'play'|'layers'|'settings'|'globe'|'code';
export const Icon:React.FC<{name:IconName;size?:number;style?:React.CSSProperties}>=({name,size=34,style})=>{
 const paths:Record<IconName,React.ReactNode>={
 grid:<><rect x="4" y="4" width="9" height="9" rx="2"/><rect x="19" y="4" width="9" height="9" rx="2"/><rect x="4" y="19" width="9" height="9" rx="2"/><rect x="19" y="19" width="9" height="9" rx="2"/></>,
 search:<><circle cx="13" cy="13" r="9"/><path d="m20 20 8 8"/></>,
 tasks:<><rect x="4" y="5" width="24" height="23" rx="4"/><path d="m9 15 3 3 5-6M20 13h4M20 21h4M9 22h7"/></>,
 mic:<><rect x="11" y="3" width="10" height="18" rx="5"/><path d="M6 15v2a10 10 0 0 0 20 0v-2M16 27v3"/></>,
 calendar:<><rect x="4" y="6" width="24" height="23" rx="4"/><path d="M4 13h24M10 3v7M22 3v7M10 19h3M19 19h3M10 24h3"/></>,
 user:<><circle cx="16" cy="10" r="5"/><path d="M5 29v-3a11 11 0 0 1 22 0v3"/></>,
 plus:<path d="M16 5v22M5 16h22"/>,arrow:<path d="M4 16h24M18 6l10 10-10 10"/>,check:<path d="m5 16 8 8L28 8"/>,chevron:<path d="m10 6 10 10-10 10"/>,
 more:<><circle cx="6" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/><circle cx="26" cy="16" r="1" fill="currentColor"/></>,
 file:<><path d="M6 3h14l7 7v19H6zM20 3v8h7M11 17h11M11 23h9"/></>,
 chart:<><path d="M4 28V4M4 28h25"/><rect x="9" y="17" width="4" height="7" rx="1"/><rect x="17" y="8" width="4" height="16" rx="1"/><rect x="25" y="13" width="4" height="11" rx="1"/></>,
 bookmark:<path d="M8 4h16v25l-8-6-8 6z"/>,link:<><path d="m13 8 3-3a8 8 0 0 1 11 11l-4 4M19 24l-3 3A8 8 0 0 1 5 16l4-4M11 21l10-10"/></>,
 close:<path d="m7 7 18 18M25 7 7 25"/>,play:<path d="m10 5 17 11-17 11z"/>,
 layers:<><path d="m16 3 14 8-14 8L2 11zM3 18l13 8 13-8M6 25l10 6 10-6"/></>,
 settings:<><path d="M5 8h22M5 24h22"/><circle cx="12" cy="8" r="4" fill="white"/><circle cx="22" cy="24" r="4" fill="white"/></>,
 globe:<><circle cx="16" cy="16" r="13"/><ellipse cx="16" cy="16" rx="6" ry="13"/><path d="M3 16h26"/></>,code:<><path d="m10 8-7 8 7 8M22 8l7 8-7 8M19 4l-6 24"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,...style}}>{paths[name]}</svg>;
};
export const uiInk=(b:Brand)=>b.template==='NUMO'?b.background:b.template==='FORMO'?b.background:b.ink;
export const uiAccent=(b:Brand)=>b.template==='TOVO'?b.accent:b.background;
export const Surface:React.FC<{x?:number;y?:number;w:number;h:number;style?:React.CSSProperties;children?:React.ReactNode}>=({x=0,y=0,w,h,style,children})=><Box x={x} y={y} w={w} h={h} style={{background:'#FFFDFC',border:'1.5px solid #2220201c',borderRadius:14,boxShadow:'0 4px 12px #29202008',overflow:'hidden',...style}}>{children}</Box>;
export const UText:React.FC<{x?:number;y?:number;size?:number;weight?:number;w?:number;style?:React.CSSProperties;children:React.ReactNode}>=({x=0,y=0,size=60,weight=530,w,style,children})=><Box x={x} y={y} w={w} style={{fontFamily:'Geist',fontSize:size,fontWeight:weight,letterSpacing:'-.045em',lineHeight:1.08,...style}}>{children}</Box>;
export const Button:React.FC<{b:Brand;x:number;y:number;w?:number;h?:number;icon?:IconName;children?:React.ReactNode;quiet?:boolean;pressed?:boolean;style?:React.CSSProperties}>=({b,x,y,w=260,h=80,icon='arrow',children,quiet=false,pressed=false,style})=><Box x={x} y={y} w={w} h={h} style={{background:b.template==='NUMO'?b.accent:quiet?'#FFFFFF':uiAccent(b),color:b.template==='NUMO'?b.background:quiet?uiInk(b):'#FFF8F2',border:quiet?'1.5px solid #28202525':'1.5px solid transparent',borderRadius:b.template==='NUMO'?2:12,display:'flex',alignItems:'center',justifyContent:'center',gap:18,fontSize:48,fontWeight:560,letterSpacing:'-.04em',transform:pressed?'scale(.96)':'none',boxShadow:quiet?'0 2px 3px #20102004':'0 3px 6px #20102014',...style}}>{children}<Icon name={icon} size={38}/></Box>;
export const Avatar:React.FC<{b:Brand;size?:number;active?:boolean}>=({b,size=54,active=false})=><div style={{width:size,height:size,borderRadius:99,background:active?b.accent:b.paper,color:b.template==='NUMO'?b.background:b.ink,display:'grid',placeItems:'center',border:'2px solid #ffffff',flexShrink:0}}><Icon name="user" size={size*.56}/></div>;
export const AppFrame:React.FC<{b:Brand;f:number;title:string;active?:IconName;children:React.ReactNode;action?:React.ReactNode;camera?:number}>=({b,f,title,active='grid',children,action,camera=1})=>{
 const p=out(f,14);return <Stage brand={b} grain={false}>{b.template==='NUMO'&&<PrintGrain/>}<Box x={52} y={44+(1-p)*24} w={1176} h={632} style={{background:b.template==='NUMO'?'#E9E1EE':'#F5F4F3',border:b.template==='NUMO'?`2px solid ${b.background}`:`1px solid ${b.ink}24`,borderRadius:b.template==='NUMO'?3:18,boxShadow:b.template==='NUMO'?`9px 9px 0 ${b.accent}`:`0 28px 65px ${b.ink}28,0 2px 4px ${b.ink}18`,overflow:'hidden',scale:camera+(1-p)*.025,transformOrigin:'center center',color:uiInk(b),zIndex:b.template==='NUMO'?41:undefined}}>
 <Box w={1176} h={74} style={{background:b.template==='NUMO'?b.paper:'#FFFEFD',borderBottom:b.template==='NUMO'?`2px solid ${b.background}`:'1px solid #29252b1b',display:'flex',alignItems:'center',padding:'0 23px',gap:10}}>{[0,1,2].map(i=><div key={i} style={{width:11,height:11,borderRadius:20,background:b.template==='NUMO'?[b.background,'#B7A7C4',b.accent][i]:['#E3AAA6','#E4C797','#B0C6AE'][i]}}/>)}<Box x={99} y={17}><Mark kind={b.template} size={36}/></Box><UText x={152} y={9} size={48} weight={590}>{title}</UText>{action||<Box x={1028} y={18} style={{display:'flex',gap:28,alignItems:'center'}}><Icon name="search"/><Icon name="more"/></Box>}</Box>
 <Box x={0} y={74} w={74} h={558} style={{borderRight:'1px solid #29252b14',background:b.template==='NUMO'?b.paper:'#FDFCFA',display:'flex',alignItems:'center',flexDirection:'column',gap:20,paddingTop:26}}>{(['grid',active==='grid'?'tasks':active,'calendar','file'] as IconName[]).map((name,i)=><div key={i} style={{width:52,height:52,borderRadius:b.template==='NUMO'?2:11,display:'grid',placeItems:'center',background:i===1?`${uiAccent(b)}13`:'transparent',color:i===1?uiAccent(b):'#AAA5A2'}}><Icon name={name} size={29}/></div>)}<Box x={12} y={482}><Avatar b={b} size={48}/></Box></Box>
 <Box x={74} y={74} w={1102} h={558} style={{overflow:'hidden'}}>{children}</Box>{b.template==='NUMO'&&<PrintGrain strength={.16}/>}</Box></Stage>;
};
