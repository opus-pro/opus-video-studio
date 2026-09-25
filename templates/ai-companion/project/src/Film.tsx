import React from 'react';
import {motionFrame} from './clock';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import brand from '../config/brand.json';
import {Character} from './Character';
import {Sky,Icon,abs} from './Stage';
import {Crowd,Identity,Conversation,CreationSequence,ShareAccent,crowdCamera} from './ReferenceMoves';
import {StoryWorld} from './StoryWorld';
import {FocusText,GlassSurface,Exit,surfaceState} from './Optics';
import {a,m,mix,progress,pose,track,spatialTrack,motionBlur,focusIn,focusOut} from './motion';

function Pod({id,x,y,size=200,scale=1,rotate=0,opacity=1,blink=false,blur=0}:{id:number;x:number;y:number;size?:number;scale?:number;rotate?:number;opacity?:number;blink?:boolean;blur?:number}){
 return <div style={{...abs,left:x-size/2,top:y-size/2,transform:'scale('+scale+') rotate('+rotate+'deg)',opacity,filter:'blur('+(blur/Math.max(.1,scale))+'px)'}}><Character id={id} size={size} blink={blink}/></div>;
}
// The selected character is one continuous object. It becomes the chat avatar,
// the subject of customization, the source of the voice, then the prompt's icon.
const heroKeys=[
 [0,960,1270,.85,-12,1],[16,960,672,1.35,-3,1],[38,960,672,1.35,-3,1],
 [51,960,535,1.31,0,1],[76,960,535,1.31,0,1],[83,960,535,370/480,0,1],
 [90,960,535,156/480,0,1],[138,960,535,156/480,0,1],[149,852,535,137/480,0,1],[170,852,535,137/480,0,1],
 [184,942,295,.11,0,0],[362,134.5,682.25,85/480,0,0],[365,134.5,682.25,85/480,0,1],
 [375,960,510,1.36,0,1],[477,960,510,1.36,0,1],
 [489,960,495,.84,0,1],[549,960,495,.84,0,1],
 [559,384,537,.17,0,1],[588,384,537,.17,0,1],[596,384,537,.12,0,0],
 [705,960,535,.75,0,0],[716,960,535,1.25,0,1],[738,960,535,1.25,0,1],
 [751,590,855,.28,0,1],[820,590,855,.28,0,1],
 [827,210,742,.30,0,1],[878,210,742,.30,0,1],
 [889,310,800,.48,0,1],[960,310,800,.48,0,1]
];
const heroState=(f:number)=>{
 const [x,y,scale,rotate,opacity]=spatialTrack(f,heroKeys,f<200?0:-.16),camera=crowdCamera(f);
 const sharedScale=f>=76&&f<=90?mix(480*1.31*camera.zoom/1.7,156,camera.field)/480:scale;
 return {x,y,scale:sharedScale,rotate,opacity};
};
function Hero({f}:{f:number}){
 const s=heroState(f),morph=m(f,434,444),blur=motionBlur(f,heroState,240,18)+morph*(1-morph)*9;
 const blink=(f>=160&&f<164)||(f>=337&&f<341)||(f>=886&&f<890);
 return <div style={{...abs,left:s.x-240,top:s.y-240,width:480,height:480,transform:'scale('+s.scale+') rotate('+s.rotate+'deg)',opacity:s.opacity,filter:'blur('+(blur/Math.max(.18,s.scale))+'px)'}}>
  {morph<1&&<div style={{...abs,inset:0,opacity:1-morph}}><Character id={0} size={480} blink={blink}/></div>}
  {morph>0&&<div style={{...abs,inset:0,opacity:morph}}><Character id={2} size={480} blink={blink}/></div>}
 </div>;
}
function Discover({f}:{f:number}){
 const focus=m(f,21,30),leaving=m(f,41,51);
 return <AbsoluteFill>
  {/* The statement occupies the world behind the selected character, not a title column. */}
  <Exit f={f} start={41} end={51} dy={-160}>
   <div style={{...abs,left:0,right:0,top:212,textAlign:'center',fontSize:246,lineHeight:1,fontFamily:'Editorial',letterSpacing:'-.055em',color:'#f0fff6',textShadow:'0 8px 40px #c1eed52a'}}><FocusText text={brand.headlines.opening.join(' ')} f={f} start={1} duration={8} delay={.25} amount={20} travel={52}/></div>
  </Exit>
  {[{id:1,x:330,y:142,s:290,hit:0},{id:3,x:1640,y:211,s:388,hit:5},{id:2,x:1840,y:874,s:490,hit:9},{id:4,x:610,y:1105,s:265,hit:12},{id:5,x:53,y:718,s:372,hit:3}].map((p,i)=>{
   const sample=(q:number)=>{
    const enter=a(q,p.hit*.6,p.hit*.6+10),leave=m(q,41,51),select=m(q,21,30);
    return {x:p.x+mix((i%2?1:-1)*170,0,enter)+(p.x-960)*select*.07+(p.x-960)*leave*.85,y:p.y+mix(270,0,enter)+(p.y-540)*leave*.75,scale:mix(.72,1,enter)*mix(1,.95,select)*mix(1,1.25,leave),rotate:mix(i%2?-18:18,0,enter)};
   };
   const s=sample(f),blur=Math.max(motionBlur(f,sample,p.s/2,16),focusIn(f,p.hit*.6,p.hit*.6+9,10))+focus*3.5+leaving*2;
   return <Pod key={i} id={p.id} {...s} size={p.s} opacity={progress(f,p.hit*.6,p.hit*.6+3)*mix(1,.72,focus)*(1-progress(f,46,53))} blur={blur}/>;
  })}

 </AbsoluteFill>;
}
function Personalize({f}:{f:number}){
 const places=[[258,338],[1360,442],[346,760]];
 return <AbsoluteFill>
  {/* A chosen attribute becomes an environmental word for one beat, behind the face. */}
  <Exit f={f} start={460} end={472} dx={-480} dy={0}>
   <div style={{...abs,left:-180,right:-180,top:123,textAlign:'center',fontFamily:'Editorial',fontSize:640,lineHeight:1,letterSpacing:'-.055em',color:'#697a6370'}}><FocusText text={brand.traits[1]+'.'} f={f} start={432} duration={9} delay={.35} amount={24} travel={52}/></div>
  </Exit>
  {brand.traits.map((trait,i)=>{
   const start=369+i*11,sample=(q:number)=>{
    const arrival=a(q,start,start+12),pull=m(q,434,444),[x,y]=places[i];
    return {x:i===1?mix(x,1010,pull):x+(x-960)*pull*.6,y:y+mix(90,0,arrival)+(i===1?pull*(490-y):(y-510)*pull*.4),rotate:mix(i%2?-8:8,0,arrival),scale:mix(1,.18,i===1?pull:0)};
   },s=sample(f);
   return <div key={trait} style={{...abs,left:s.x,top:s.y,padding:'23px 35px',borderRadius:60,background:i===1?'#7561acee':'#f6fff9d9',color:i===1?'#fff':'#456f5b',fontSize:40,border:'1px solid #fff9',boxShadow:'0 14px 28px #46614519',transform:'rotate('+s.rotate+'deg) scale('+s.scale+')',opacity:progress(f,start,start+3)*(1-progress(f,439,445)),filter:'blur('+(Math.max(focusIn(f,start,start+10,13),motionBlur(f,sample,160,14))/Math.max(s.scale,.3))+'px)'}}>{trait}<span style={{marginLeft:24,opacity:.7}}>+</span></div>;
  })}
 </AbsoluteFill>;
}
function ResponseQuote({f}:{f:number}){
 const chosen=m(f,434,444);
 return <div style={{...abs,left:545,top:869,width:830,padding:'21px 24px',textAlign:'center',fontSize:39,color:'#41624e',opacity:a(f,383,389)*(1-progress(f,477,485)),filter:'blur('+Math.max(focusIn(f,383,392,12),focusOut(f,476,485,12))+'px)'}}>
  <div style={{height:49,position:'relative'}}>
   <span style={{...abs,inset:0,opacity:1-progress(f,434,439),filter:'blur('+(chosen*13)+'px)'}}>{brand.creationResponse[0]}</span>
   <span style={{...abs,inset:0,opacity:progress(f,439,444),filter:'blur('+(13*(1-chosen))+'px)'}}>{brand.creationResponse[1]}</span>
  </div>
 </div>;
}
function Voice({f}:{f:number}){
 const chosen=m(f,517,527),enter=a(f,483,495),exit=m(f,549,559),hero=heroState(f);
 return <AbsoluteFill>
  <div style={{...abs,left:hero.x,top:hero.y,opacity:progress(f,483,488)*(1-progress(f,553,559)),transform:'scale('+mix(enter,.13,exit)+')',filter:'blur('+Math.max(focusIn(f,483,495,12),focusOut(f,549,559,11))+'px)'}}>
   {Array.from({length:100},(_,i)=>{
    const angle=i/100*Math.PI*2,phase=f*.15+i*.49,length=19+(16+Math.pow(Math.sin(phase),2)*62)*(1+chosen*.30),radius=280;
    return <div key={i} style={{...abs,left:Math.sin(angle)*radius-4,top:-Math.cos(angle)*radius-length,width:8,height:length,borderRadius:6,transformOrigin:'4px '+length+'px',transform:'rotate('+(i*3.6)+'deg)',background:i%7<3?'#80699e':'#55988a',opacity:.70}}/>;
   })}
  </div>
  <div style={{...abs,left:728,top:837,width:464,height:100,padding:12,display:'flex',gap:8,opacity:progress(f,484,491)*(1-progress(f,543,552)),filter:'blur('+Math.max(focusIn(f,483,492,10),focusOut(f,543,552,14))+'px)'}}>
   <div style={{...abs,top:12,left:12+chosen*224,width:216,height:76,borderRadius:42,background:'#7661a7',filter:'blur('+motionBlur(f,q=>({x:m(q,517,527)*224}),100,8)+'px)'}}/>
   {['Warm','Bright'].map((label,i)=><div key={label} style={{width:216,textAlign:'center',fontSize:35,padding:'15px 20px',position:'relative',color:(i===0?1-chosen:chosen)>.5?'white':'#557964'}}>{label}</div>)}
  </div>
 </AbsoluteFill>;
}
function StoryCard({f,x,y,w,rotate=0,variant=0,opacity=1,blur=0}:{f:number;x:number;y:number;w:number;rotate?:number;variant?:number;opacity?:number;blur?:number}){
 const rounding=Math.min(35,w*.045)*(1-progress(w,1720,1920));
 return <div style={{...abs,left:x,top:y,width:w,height:w*9/16,borderRadius:rounding,overflow:'hidden',transform:'rotate('+rotate+'deg)',opacity,filter:'blur('+blur+'px)',boxShadow:'0 24px 60px #123d4526',border:'2px solid #ffffff80'}}>
  <div style={{width:1920,height:1080,transformOrigin:'0 0',transform:'scale('+(w/1920)+')'}}><StoryWorld f={f} variant={variant}/></div>
 </div>;
}
const storyState=(f:number)=>{
 const arrive=m(f,735,751),gather=m(f,820,827),close=m(f,869,881);
 const width=mix(mix(mix(840,1000,arrive),950,gather),390,close);
 const x=mix(mix(mix(540,460,arrive),500,gather),2100,close);
 const y=mix(mix(mix(315,196,arrive),250,gather),-370,close);
 return {x,y,width,rotate:mix(-5,0,arrive)+close*11};
};
function Story({f}:{f:number}){
 const s=storyState(f),blur=motionBlur(f,storyState,450,16);
 return <div style={{...abs,inset:0,opacity:progress(f,735,742)*(1-progress(f,878,885))}}>
  <div style={{...abs,left:s.x,top:s.y,width:s.width,height:s.width*9/16+164,borderRadius:40,background:'linear-gradient(135deg,#eafff9bb,#e9fff280)',border:'3px solid #effff9aa',boxShadow:'inset 0 0 22px #fff8,0 20px 70px #16392f1a',opacity:1-progress(f,811,823),filter:'blur('+blur+'px)'}}/>
  <StoryCard f={f} x={s.x} y={s.y} w={s.width} rotate={s.rotate} blur={blur}/>
 </div>;
}
const friendKeys=[[738,2070,945,.55],[751,1700,934,.58],[820,1700,934,.58],[827,1670,732,.58],[878,1670,732,.58],[889,1430,929,115/288],[960,1430,929,115/288]];
function Friend({f}:{f:number}){
 const sample=(q:number)=>{const [x,y,scale]=spatialTrack(q,friendKeys,.15);return {x,y,scale};},s=sample(f);
 return <Pod id={1} {...s} size={288} opacity={progress(f,739,744)} blur={motionBlur(f,sample,144,15)}/>;
}
function Sharing({f}:{f:number}){
 return <AbsoluteFill>
  <div style={{...abs,left:682,top:833,color:'#386c56',fontSize:38,opacity:progress(f,751,756)*(1-progress(f,809,820)),filter:'blur('+Math.max(focusIn(f,751,761,10),focusOut(f,809,820,14))+'px)'}}>{brand.story.shareMessage}</div>
  <div style={{...abs,left:1272,top:810,padding:'19px 25px',borderRadius:34,background:'#f4fff9ee',color:'#386c56',fontSize:31,opacity:progress(f,751,756)*(1-progress(f,809,820)),transform:'scale('+mix(1,.93,m(f,765,769))*mix(1,1/.93,m(f,769,774))+')'}}>{f<771?'Share':'Sent ✓'}</div>
  <div style={{...abs,left:1380,top:783,padding:'20px 28px',borderRadius:'30px 30px 9px 30px',background:'#effff6ee',color:'#386c56',fontSize:38,...pose(f,779,789,60),opacity:progress(f,779,782)*(1-progress(f,814,824)),filter:'blur('+Math.max(focusIn(f,779,789,11),focusOut(f,814,824,12))+'px)'}}>{brand.story.reply}</div>
 </AbsoluteFill>;
}
function Community({f}:{f:number}){
 const cards=[{x:40,y:44,w:645,r:-8,v:1},{x:-55,y:692,w:655,r:5,v:2},{x:1325,y:25,w:650,r:8,v:3},{x:1367,y:769,w:640,r:-7,v:1}];
 return <AbsoluteFill>
  {cards.map((p,i)=>{
   const sample=(q:number)=>{
    const t=a(q,818+i*2,825+i*2),exit=m(q,866+i*2,879+i*2);
    return {x:mix(750,p.x,t)+(p.x-960)*exit*1.3,y:mix(425,p.y,t)+(p.y-520)*exit*1.6,width:p.w*mix(.24,1,t)*mix(1,.5,exit),rotate:p.r*t+exit*p.r*.5};
   },s=sample(f);
   return <StoryCard key={i} f={670} variant={p.v} x={s.x} y={s.y} w={s.width} rotate={s.rotate} opacity={progress(f,818+i*2,820+i*2)*(1-progress(f,877+i*2,884+i*2))} blur={motionBlur(f,sample,350,16)}/>;
  })}
 </AbsoluteFill>;
}
function Closing({f}:{f:number}){
 return <AbsoluteFill>
  <div style={{...abs,left:0,right:0,top:278,textAlign:'center',color:'#fff',fontFamily:'Editorial',fontSize:183,letterSpacing:'-.05em',textShadow:'0 4px 45px #bafbdd66'}}><FocusText text={brand.name} f={f} start={873} amount={22} travel={50}/></div>
  <div style={{...abs,left:0,right:0,top:506,textAlign:'center',fontSize:51,letterSpacing:'-.025em',color:'#effff8'}}><FocusText text={brand.headlines.closing} f={f} start={881} delay={.18} amount={13} travel={23}/></div>
  <div style={{...abs,left:0,right:0,top:616,display:'flex',justifyContent:'center',...pose(f,887,899,35)}}><div style={{display:'flex',gap:24,alignItems:'center',borderRadius:60,padding:'21px 32px',fontSize:31,color:'#2a6b54',background:'#effff8eb',border:'1px solid white'}}>{brand.url}<Icon kind="arrow"/></div></div>
  <Pod id={0} x={1640} y={680} size={180} scale={mix(.6,1,a(f,878,890))} opacity={progress(f,878,881)} blur={focusIn(f,878,890,12)}/>
 </AbsoluteFill>;
}
export function Film(){
 const f=motionFrame(useCurrentFrame());
 return <AbsoluteFill style={{fontFamily:'Sans',overflow:'hidden'}}>
  <style>{'*{box-sizing:border-box}@font-face{font-family:Sans;src:url("'+staticFile('fonts/GeistVF.woff2')+'")}@font-face{font-family:Editorial;src:url("'+staticFile('fonts/InstrumentSerif-Regular.ttf')+'")}'}</style>
  <Sky f={f}/>
  {f>=362&&f<621&&<GlassSurface f={f}/>}
  {f<53&&<Discover f={f}/>}
  {f>=47&&f<150&&<Crowd f={f}/>}
  {f>=138&&f<185&&<Identity f={f}/>}
  {f>=170&&f<376&&<Conversation f={f}/>}
  {f>=362&&f<479&&<Personalize f={f}/>}
  {f>=477&&f<560&&<Voice f={f}/>}
  {f>=549&&f<715&&<CreationSequence f={f}/>}
  {f>=705&&f<753&&<ShareAccent f={f}/>}
  {f>=808&&f<891&&<Community f={f}/>}
  {f>=735&&f<885&&<Story f={f}/>}
  {f>=751&&f<825&&<Sharing f={f}/>}
  {f>=873&&<Closing f={f}/>}
  {f>=383&&f<485&&<ResponseQuote f={f}/>}
  {f>=738&&<Friend f={f}/>}
  <Hero f={f}/>
  {brand.audio.enabled&&<Audio src={staticFile(brand.audio.master)}/>}
 </AbsoluteFill>;
}
