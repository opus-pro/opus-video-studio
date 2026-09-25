import React from 'react';
import {Img} from 'remotion';
import {photo,Publication} from './UI';

const picture=(name:string,style:React.CSSProperties={})=><Img src={photo(name)} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',...style}}/>;
const header:React.CSSProperties={height:76,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 38px',fontSize:13};
const page:React.CSSProperties={width:1000,minHeight:1050,overflow:'hidden',position:'relative'};

function Wayfarer(){
 return <div style={{...page,background:'#f4eddf',color:'#3c3026',fontFamily:'Georgia,serif'}}>
  <div style={header}><b style={{fontSize:35,letterSpacing:-2}}>Wayfarer.</b><span>Destinations　 Journal　 About</span><span style={{borderBottom:'1px solid',paddingBottom:4}}>Find your next escape ↗</span></div>
  <div style={{height:546,margin:'0 24px',position:'relative',overflow:'hidden',borderRadius:3}}>{picture('desert')}<div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,#29160065,transparent)'}}/><div style={{position:'absolute',left:38,top:72,color:'#fff8e9'}}><div style={{fontFamily:'Geist',fontSize:13,letterSpacing:3}}>A JOURNAL FOR THE WANDERERS</div><div style={{fontSize:109,letterSpacing:-7,lineHeight:.94,marginTop:23}}>Somewhere<br/><i>out there.</i></div><div style={{display:'inline-block',marginTop:30,padding:'13px 22px',border:'1px solid #fff9',borderRadius:30,fontSize:15,fontFamily:'Geist'}}>Explore the desert　↗</div></div></div>
  <div style={{display:'flex',gap:36,padding:'30px 38px',alignItems:'center'}}><div style={{fontSize:38,width:320,lineHeight:1.08}}>Go a little<br/>further.</div><div style={{height:150,width:240}}>{picture('mountains')}</div><div style={{height:150,width:240}}>{picture('coast')}</div></div>
 </div>
}
function FormStudio(){
 return <div style={{...page,background:'#e8edf2',color:'#172c50'}}>
  <div style={{...header,borderBottom:'1px solid #172c5030'}}><b style={{fontSize:29,letterSpacing:-2}}>FORM /</b><span>Spaces　 Practice　 Selected work</span><span>LET’S TALK ↗</span></div>
  <div style={{display:'grid',gridTemplateColumns:'1.05fr 1fr',gap:30,padding:'42px 38px 32px'}}><div><div style={{fontSize:13,letterSpacing:2}}>ARCHITECTURE & INTERIORS</div><h1 style={{fontSize:94,fontWeight:500,letterSpacing:-7,lineHeight:.95,margin:'50px 0 35px'}}>Space<br/>to think.</h1><p style={{fontSize:17,maxWidth:285,lineHeight:1.5}}>Considered spaces.<br/>Extraordinary everyday life.</p><div style={{marginTop:42,display:'flex',gap:18,alignItems:'center',fontSize:14}}><span style={{width:43,height:43,border:'1px solid',borderRadius:'50%',display:'grid',placeItems:'center'}}>↗</span>OUR APPROACH</div></div><div style={{height:511,position:'relative'}}>{picture('desk')}<div style={{position:'absolute',right:14,bottom:14,background:'#fff',padding:'10px 14px',fontSize:12}}>01 / The Common Room</div></div></div>
  <div style={{margin:'0 38px',borderTop:'1px solid #172c5040',paddingTop:20,display:'flex',justifyContent:'space-between'}}><span>SELECTED PROJECTS</span><span>2024—2026</span></div>
 </div>
}
function Nightshift(){
 return <div style={{...page,background:'#121416',color:'#d5ff62'}}>
  <div style={{...header,borderBottom:'1px solid #d5ff6240'}}><b style={{fontSize:25,letterSpacing:-1}}>NIGHTSHIFT®</b><span style={{color:'#deded9'}}>Sounds　 Stories　 After hours</span><span style={{border:'1px solid #d5ff62',borderRadius:30,padding:'10px 16px'}}>Tune in ↗</span></div>
  <div style={{position:'relative',height:551,overflow:'hidden'}}>{picture('city',{opacity:.54})}<div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#121416,transparent 80%)'}}/><div style={{position:'absolute',left:37,top:34,fontSize:147,fontWeight:850,letterSpacing:-11,lineHeight:.82}}>AFTER<br/><span style={{color:'transparent',WebkitTextStroke:'2px #d5ff62'}}>HOURS.</span></div><div style={{position:'absolute',left:40,bottom:30,right:40,display:'flex',alignItems:'center',gap:22}}><div style={{width:62,height:62,borderRadius:'50%',background:'#d5ff62',color:'#121416',display:'grid',placeItems:'center',fontSize:24}}>▶</div><div style={{color:'#f0f3e9'}}><b style={{fontSize:26}}>The midnight edit.</b><div style={{fontSize:13,marginTop:6}}>A new frequency for your Friday.</div></div><div style={{marginLeft:'auto',fontSize:13}}>VOL. 024　/　LISTEN NOW ↗</div></div></div>
  <div style={{borderTop:'1px solid #d5ff6233',padding:'22px 40px',fontSize:43,fontWeight:700,letterSpacing:-2}}>Good music. No algorithm.</div>
 </div>
}
function Orbit(){
 return <div style={{...page,background:'#e9dfff',color:'#33224d'}}>
  <div style={header}><b style={{fontSize:33,letterSpacing:-2}}>orbit ✳</b><span>Work　 Studio　 Playground</span><span>Say hello ↗</span></div>
  <div style={{height:570,position:'relative',margin:'0 34px',borderTop:'1px solid #33224d30'}}><div style={{position:'absolute',left:10,top:47,fontSize:100,fontWeight:650,letterSpacing:-8,lineHeight:.94,zIndex:2}}>Ideas<br/>with a<br/><i style={{fontFamily:'Georgia',fontWeight:400}}>little spin.</i></div><svg style={{position:'absolute',right:-20,top:12,width:565,height:540}} viewBox="0 0 560 540"><defs><radialGradient id="orb"><stop stopColor="#ffdeda" offset="0"/><stop stopColor="#ff966c" offset=".5"/><stop stopColor="#bb41a8" offset="1"/></radialGradient><linearGradient id="orbit"><stop stopColor="#7139c8"/><stop stopColor="#fef5ff" offset=".45"/><stop stopColor="#6b29b0" offset="1"/></linearGradient></defs><circle cx="300" cy="270" r="160" fill="url(#orb)"/><ellipse cx="300" cy="270" rx="244" ry="73" fill="none" stroke="url(#orbit)" strokeWidth="29" transform="rotate(-37 300 270)"/><circle cx="133" cy="427" r="28" fill="#f88e65"/><circle cx="460" cy="71" r="13" fill="#6b29b0"/></svg><div style={{position:'absolute',left:12,bottom:33,fontSize:14}}>Independent design. Unexpected outcomes.</div></div>
  <div style={{background:'#34234c',color:'#ebdeff',padding:'27px 43px',display:'flex',justifyContent:'space-between',fontSize:24}}><span>IDENTITY</span><span>DIGITAL</span><span>MOTION</span><span>✳</span></div>
 </div>
}
function SlowDays(){
 return <div style={{...page,background:'#e8efdf',color:'#233b2b'}}>
  <div style={header}><b style={{fontSize:31,fontFamily:'Georgia',letterSpacing:-1}}>slow days</b><span>Our world　 Field trips　 Membership</span><span style={{background:'#274933',color:'#fff',padding:'11px 18px',borderRadius:4}}>Join us ↗</span></div>
  <div style={{height:515,margin:'0 25px',position:'relative',overflow:'hidden',borderRadius:'200px 200px 8px 8px'}}>{picture('forest')}<div style={{position:'absolute',inset:0,background:'#15371b38'}}/><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#eff3d2'}}><span style={{fontSize:13,letterSpacing:3}}>A LITTLE LESS ONLINE.</span><div style={{fontFamily:'Georgia',fontSize:105,letterSpacing:-6,lineHeight:.95,textAlign:'center',marginTop:25}}>Make room<br/>for <i>outside.</i></div><div style={{marginTop:30,fontSize:14}}>Fresh air. Familiar faces. A different pace.</div></div></div>
  <div style={{padding:'28px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontFamily:'Georgia',fontSize:43}}>Meet you out there.</span><span style={{fontSize:14,borderBottom:'1px solid',paddingBottom:5}}>UPCOMING FIELD TRIPS ↗</span></div>
 </div>
}

// Six distinct sites, consumed once in this order. Last site is the page assembled next.
export const websiteCuts=[
 {at:1.1,name:'Wayfarer',kind:'Travel journal',component:Wayfarer},
 {at:1.32,name:'Form',kind:'Architecture studio',component:FormStudio},
 {at:1.54,name:'Nightshift',kind:'Music publication',component:Nightshift},
 {at:1.76,name:'Orbit',kind:'Creative portfolio',component:Orbit},
 {at:1.98,name:'Slow Days',kind:'Outdoor community',component:SlowDays},
 {at:2.18,name:'Fieldnotes',kind:'Editorial newsletter',component:()=> <Publication/>},
];
export function WebsiteShowcase({t}:{t:number}){
 const current=websiteCuts.reduce((selected,c)=>t>=c.at?c:selected,websiteCuts[0]);
 const Site=current.component;
 return <Site/>;
}
