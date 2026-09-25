import React from 'react';
import {Img} from 'remotion';
import {Layer,White} from './Scene';
import {WebsiteShowcase,websiteCuts} from './WebsiteShowcase';
import {a,m,p,d,mix,lerp,blur} from './motion';
import {interactions as events,press,done} from './interactions';
import {Editor,Publication,Widgets,Cursor,Icon,PhotoCard,photo,purple,Properties} from './UI';
const abs:React.CSSProperties={position:'absolute'};
const mouse=(t:number,key:keyof typeof events)=>t>=events[key].down&&t<events[key].up;

export function Teaser({t}:{t:number}){
 if(t<1.1){const s=lerp(t,[[0,1.47],[.58,.94],[1.1,.95]],'arrive');return <><White/><Layer s={s} y={lerp(t,[[0,95],[.58,0],[1.1,-3]],'arrive')} bl={blur(t,q=>lerp(q,[[0,1.47],[.58,.94]])*800)}><Editor empty/></Layer></>}
 if(t<2.38){const cut=websiteCuts.reduce((selected,c)=>t>=c.at?c:selected,websiteCuts[0]),local=t-cut.at;return <><White/><Layer w={1000} h={1000} s={1.43+local*.07} y={225}><WebsiteShowcase t={t}/></Layer></>}
 // One set of real page columns. The exact same DOM nodes become the final page.
 const s=lerp(t,[[2.38,1.18],[2.9,.86],[3.72,.86],[4.65,.98],[5,1.05]]),rx=lerp(t,[[2.38,9],[2.9,20],[4.4,0]]),rz=lerp(t,[[2.38,-3],[2.9,-5],[4.4,0]]);
 return <><White/><Layer s={s} y={lerp(t,[[2.38,110],[2.9,20],[4.4,0]])} rx={rx} rz={rz} bl={blur(t,q=>lerp(q,[[2.38,1.18],[2.9,.86],[3.72,.86],[4.65,.98],[5,1.05]])*600,.16,7)}><Editor t={t} assemble={2.52} assembly/></Layer></>
}

export function Assemble({t}:{t:number}){
 // Focus the brand control, pull back once, then approach Insert. All clicks live in editor coordinates.
 const s=lerp(t,[[10.03,3.2],[11.12,.94],[12,.94],[12.74,2.5],[13.36,2.5],[14.05,1.7],[15.2,1.7],[16.25,.96],[17.4,.96]]);
 const x=lerp(t,[[10.03,2443],[11.12,0],[12,0],[12.74,1462.5],[13.36,1462.5],[14.05,710.6],[15.2,710.6],[16.25,0]]);
 const y=lerp(t,[[10.03,1388.8],[11.12,0],[12,0],[12.74,1085],[13.36,1085],[14.05,275.4],[15.2,275.4],[16.25,0]]);
 const open=a(t,events.insert.result,13.55)*(1-d(t,15.2,15.48));
 return <><White/><Layer s={s} x={x} y={y} bl={blur(t,q=>lerp(q,[[10.03,2443],[11.12,0],[12,0],[12.74,1462.5],[13.36,1462.5],[14.05,710.6],[15.2,710.6],[16.25,0]]),.075,11)}><Editor empty={t<15.27} t={t} assemble={15.28}>
 {t>12.78&&t<13.5&&<Cursor x={mix(346,events.insert.point[0],a(t,12.78,13.05))} y={mix(139,events.insert.point[1],a(t,12.78,13.05))} scale={.7} click={mouse(t,'insert')}/>}
 {open>0&&<div style={{...abs,left:162,top:64,opacity:open,transform:`translateY(${(1-a(t,events.insert.result,13.55))*-16}px) scale(${.94+.06*a(t,events.insert.result,13.55)})`,transformOrigin:'20px 0',filter:`blur(${(1-a(t,events.insert.result,13.55))*8}px)`}}><Widgets t={t}/>{t>14.25&&<Cursor x={mix(335,events.gallery.point[0],a(t,14.25,14.7))} y={mix(130,events.gallery.point[1],a(t,14.25,14.7))} scale={.68} click={mouse(t,'gallery')}/>}</div>}
 </Editor></Layer></>
}

const rgb=(from:number[],to:number[],q:number)=>`rgb(${from.map((c,i)=>Math.round(mix(c,to[i],q))).join(',')})`;
function SectionPreview({t}:{t:number}){
 const lavender=a(t,events.lavender.result,20.18),dark=a(t,events.charcoal.result,21.18);
 const base=[255,255,255].map((v,i)=>mix(v,[235,225,252][i],lavender));
 const background=rgb(base,[23,23,25],dark);
 return <div data-subject="featured-section" style={{width:1000,height:525,position:'relative',background,borderRadius:12,padding:32,color:rgb([21,20,28],[249,246,255],dark),boxShadow:'0 18px 45px #21132b16',outline:'2px solid '+purple,outlineOffset:6}}>
 <div style={{fontSize:32,fontWeight:750,marginBottom:26}}>Featured</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:19}}>{[2,3,4,5].map(i=><PhotoCard key={i} i={i} dark={dark>.45}/>)}</div><div style={{position:'absolute',bottom:31,left:32,fontSize:13,opacity:.6}}>FIELDNOTES　/　Stories worth exploring.</div>
 </div>
}
function ThemeControls({t}:{t:number}){
 const color=done(t,'charcoal')?'#171719':done(t,'lavender')?'#EBE1FC':'#FFFFFF';
 const open=a(t,events.background.result,18.82)*(1-a(t,21.57,21.84));
 return <>
 <div style={{...abs,left:1118,top:206,width:390,height:178,borderRadius:14,padding:24,background:'white',boxShadow:'0 6px 34px #34204a22'}}><b style={{fontSize:20}}>Section</b><div style={{marginTop:19,fontSize:14,color:'#88818f'}}>Background</div><div data-control="background" style={{...abs,left:24,top:80,width:342,height:50,display:'flex',alignItems:'center',gap:14,padding:'8px 14px',border:'1px solid #dfd9e9',borderRadius:8,transform:`scale(${1-.04*press(t,'background')})`}}><span style={{width:27,height:27,background:color,borderRadius:5,border:'1px solid #d4cddd'}}/><span style={{fontSize:15}}>{color}</span><span style={{marginLeft:'auto'}}><Icon name="chevron" size={17}/></span></div></div>
 {open>0&&<div style={{...abs,left:1128,top:354,width:362,height:315,background:'white',border:'1px solid #e7deef',boxShadow:'0 14px 30px #2c10492a',borderRadius:13,opacity:open,transform:`translateY(${(1-a(t,events.background.result,18.82))*-14}px)`,padding:24}}><b style={{fontSize:16}}>Background color</b><div style={{marginTop:22,height:116,borderRadius:6,position:'relative',background:'linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,#9b51ef)'}}><span style={{...abs,width:17,height:17,borderRadius:'50%',border:'3px solid white',left:done(t,'charcoal')?275:done(t,'lavender')?55:5,top:done(t,'charcoal')?99:done(t,'lavender')?24:5}}/></div><div style={{height:9,borderRadius:9,background:'linear-gradient(to right,red,#ff0,#0f0,#0ff,#00f,#f0f)',marginTop:13}}/><div style={{marginTop:17,fontSize:12,color:'#8f849b'}}>Saved colors</div>{['#fff','#171719','#ebe1fc',purple,'#cee8d8'].map((c,i)=><span key={c} data-control={i===1?'charcoal':i===2?'lavender':undefined} style={{...abs,left:30+i*42,top:232,width:30,height:30,background:c,border:'1px solid #cfc6d9',borderRadius:6,outline:color.toLowerCase()===c?'2px solid '+purple:undefined,outlineOffset:3,transform:`scale(${1-.16*(i===1?press(t,'charcoal'):i===2?press(t,'lavender'):0)})`}}/>)}</div>}
 </>
}
export function ThemeFlow({t}:{t:number}){
 const focus=m(t,21.9,22.64),s=mix(1,1.49,focus),x=mix(0,395,focus),y=mix(0,-35,focus);
 const cx=lerp(t,[[17.4,930],[18.16,1273],[18.88,1273],[19.4,1257],[20.04,1257],[20.47,1215],[21.5,1215]]);
 const cy=lerp(t,[[17.4,724],[18.16,311],[18.88,311],[19.4,601],[21.5,601]]);
 return <><White/><Layer w={1600} h={900} s={s} x={x} y={y}><div style={{...abs,left:40,top:195}}><SectionPreview t={t}/></div><div style={{opacity:1-a(t,21.87,22.25)}}><ThemeControls t={t}/></div>{t<21.7&&<Cursor x={cx} y={cy} scale={.85} click={mouse(t,'background')||mouse(t,'lavender')||mouse(t,'charcoal')}/>}</Layer></>
}

function EditableForm({stack}:{stack:number}){
 return <div data-subject="signup-form" style={{position:'relative',width:700,height:340,borderRadius:13,background:'white',boxShadow:'0 20px 45px #30204022',outline:'2px solid '+purple,outlineOffset:6,color:'#171520'}}>
 <div style={{...abs,left:32,top:34,right:32,textAlign:'center',fontSize:39,fontWeight:760,lineHeight:1.08,letterSpacing:-1.5}}>The world is worth<br/>a closer look.</div>
 <div style={{...abs,left:32,top:mix(177,151,stack),width:mix(442,636,stack),height:62,borderRadius:5,border:'1px solid #ddd5e6',display:'flex',alignItems:'center',padding:'0 20px',fontSize:21,color:'#a79cad'}}>Your email address</div>
 <div style={{...abs,left:mix(490,32,stack),top:mix(177,230,stack),width:mix(178,636,stack),height:62,borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',background:purple,color:'white',fontSize:21}}>Subscribe</div>
 </div>
}
export function FormFlow({t}:{t:number}){
 const reveal=a(t,23.75,24.15),stack=a(t,events.stacked.result,25.85),focus=m(t,26.76,27.44),s=mix(1,1.23,focus),x=mix(0,310,focus),y=mix(0,30,focus);
 const formControls=(1-a(t,26.73,27.05))*reveal;
 const cx=lerp(t,[[23.75,1510],[24.3,1510],[25.02,1390],[26.65,1390],[27.3,1100],[27.6,1080],[28.74,838]]);
 const cy=lerp(t,[[23.75,760],[24.3,760],[25.02,438],[26.65,438],[27.3,680],[27.6,660],[28.74,183]]);
 return <><White/><Layer w={1600} h={900} s={s} x={x} y={y} bl={blur(t,q=>mix(0,310,m(q,26.76,27.44)),.12,6)}>
 <div style={{...abs,left:60,top:-105,width:1000,opacity:.20,filter:'blur(2px)',transform:'scale(1.06)',transformOrigin:'0 0'}}><Publication hideSignup/></div>
 <div style={{...abs,left:174,top:258,opacity:reveal,transform:`translateY(${(1-reveal)*65}px)`,filter:`blur(${(1-reveal)*9}px)`}}><EditableForm stack={stack}/></div>
 <div style={{opacity:formControls,transform:`translateX(${(1-reveal)*180}px)`}}><div style={{...abs,left:1090,top:300,width:420,height:307,borderRadius:16,background:'white',boxShadow:'0 6px 30px #2d143e20',padding:30}}><b style={{fontSize:23}}>Signup form</b><div style={{marginTop:20,color:'#928698',fontSize:16}}>Layout</div><div style={{marginTop:112,fontSize:14,color:'#a496aa'}}>Spacing <span style={{float:'right',color:'#53475c'}}>16 px</span></div></div>{['Inline','Stacked'].map((name,i)=><div key={name} data-control={i===1?'stacked':undefined} style={{...abs,left:i===0?1120:1300,top:405,width:i===0?165:180,height:66,borderRadius:9,border:'1px solid '+((i===1?done(t,'stacked'):!done(t,'stacked'))?purple:'#e6e0eb'),background:(i===1?done(t,'stacked'):!done(t,'stacked'))?'#f1e8ff':'#f8f6fa',color:(i===1?done(t,'stacked'):!done(t,'stacked'))?purple:'#7f7289',display:'flex',gap:13,alignItems:'center',justifyContent:'center',fontSize:19,transform:`scale(${1-.06*(i===1?press(t,'stacked'):0)})`}}><span style={{display:'flex',flexDirection:i===1?'column':'row',gap:3}}><span style={{width:19,height:7,border:'1.7px solid currentColor',borderRadius:1}}/><span style={{width:i===1?19:8,height:7,background:'currentColor',borderRadius:1}}/></span>{name}</div>)}</div>
 {t>27.4&&<div style={{...abs,left:738,top:154,width:148,height:58,background:'white',boxShadow:'0 4px 17px #20102720',borderRadius:10,display:'flex',alignItems:'center',paddingLeft:10,gap:8,opacity:a(t,27.4,27.7)}}><Icon name="grid" size={24}/><Icon name="gear" size={24}/><div data-control="animation" style={{width:52,height:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:done(t,'animation')?'#f0e4ff':'#f7f5f9',color:purple,transform:`scale(${1-.07*press(t,'animation')})`}}><Icon name="star" size={23}/></div></div>}
 <Cursor x={cx} y={cy} scale={.8} click={mouse(t,'stacked')||mouse(t,'animation')}/>
 </Layer></>
}

export function Publish({t}:{t:number}){
 const z=a(t,42.65,43.12),pushed=press(t,'publish'),published=done(t,'publish');
 const bx=626,by=18,bw=198,bh=78;
 const mx=lerp(t,[[42.65,800],[43.06,800],[43.38,events.publish.point[0]]]),my=lerp(t,[[42.65,226],[43.06,226],[43.38,events.publish.point[1]]]);
 return <><White/><Layer w={850} h={600} x={mix(130,-90,z)} y={mix(490,190,z)} s={1.7} bl={blur(t,q=>mix(490,190,a(q,42.65,43.12)),.13,12)}><div style={{width:850,height:600,position:'relative',background:'white',borderRadius:25,boxShadow:'0 -4px 30px #b58bea55',overflow:'hidden'}}><div style={{height:112,borderBottom:'1px solid #eee'}}>{['clock','eye','gear','square'].map((n,i)=><div key={n} style={{...abs,left:258+i*86,top:24,width:66,height:66,background:'#f7f7f9',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={n} size={28}/></div>)}
 <div data-control="publish" style={{...abs,left:bx,top:by,width:bw,height:bh,display:'flex',alignItems:'center',justifyContent:'center',gap:13,background:published?'#259574':pushed>.1?'#6936c9':purple,color:'white',fontSize:27,borderRadius:12,transform:`translateY(${pushed*3}px) scale(${1-pushed*.065})`,boxShadow:pushed>.1?'inset 0 3px 6px #35127255':'0 3px 0 #31106728'}}><span style={{opacity:1-.18*pushed}}>{published?'Published':'Publish'}</span><span style={{transform:published?`scale(${mix(.5,1,a(t,events.publish.result,44.1))})`:undefined}}><Icon name={published?'check':'chevron'} size={21}/></span></div></div><div style={{...abs,right:10,top:125}}><Properties plain/></div></div><Cursor x={mx} y={my} scale={.88} click={mouse(t,'publish')}/></Layer></>
}
