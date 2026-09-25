import React from 'react';
import {AbsoluteFill} from 'remotion';
import brand from '../config/brand.json';
import {Character} from './Character';
import {Phone} from './Phone';
import {StoryWorld} from './StoryWorld';
import {abs,Icon} from './Stage';
import {FocusText,Exit} from './Optics';
import {a,m,mix,progress,motionBlur,focusIn,focusOut,track} from './motion';

const Avatar=({id=0,size=90}:{id?:number;size?:number})=>id===-1?<div style={{width:size,height:size,borderRadius:'50%',background:'#f6fff6',border:'2px solid #c7decf',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.27,color:'#4c705a'}}>You</div>:<Character id={id} size={size}/>;

// One ordered field: neighbouring characters keep their relative positions
// as the pullback opens into depth. Never scatter them across the hero's path.
export const crowdCamera=(f:number)=>({zoom:mix(1.7,1,m(f,76,83)),field:m(f,80,90)});
export function Crowd({f}:{f:number}){
 return <AbsoluteFill>{Array.from({length:25},(_,i)=>{
  if(i===12)return null;
  const col=i%5-2,row=Math.floor(i/5)-2,start=49+Math.abs(col)*1.25+Math.abs(row)*2.3;
  const sample=(q:number)=>{
   const {zoom,field}=crowdCamera(q);
   const tx=960+col*420+row*70,ty=535+row*310-col*60;
   return {x:mix(960+col*440*zoom,tx,field),y:mix(535+row*460*zoom,ty,field),scale:mix(385*zoom/400,(140+i%3*60)/400,field),rotate:mix(Math.sin(i*2)*11,-12,field)};
  },s=sample(f),opacity=a(f,start,start+12)*(1-progress(f,136,148));
  if(s.x<-400||s.x>2320||s.y<-450||s.y>1530)return null;
  return <div key={i} style={{...abs,left:s.x-200,top:s.y-200,width:400,height:400,transform:'scale('+s.scale+') rotate('+s.rotate+'deg)',opacity,filter:'blur('+(Math.max(Math.abs(row)*1.8,focusIn(f,start,start+11,14),motionBlur(f,sample,200,15))/Math.max(.2,s.scale))+'px)'}}><Avatar id={(i+3)%6} size={400}/></div>;
 })}
 {Array.from({length:10},(_,i)=>{
  const enter=a(f,105+i*2.2,113+i*2.2),x=(i*431%1830)+45,y=(i*347%980)+30;
  return <div key={i} style={{...abs,left:x,top:y+mix(70,0,enter),padding:'17px 29px',borderRadius:55,background:'#e4fff4aa',color:'#fafffc',fontSize:43,letterSpacing:5,transform:'rotate(-12deg)',opacity:enter*(1-progress(f,136,148)),filter:'blur('+(i%3+focusIn(f,105+i*2.2,113+i*2.2,9))+'px)'}}>•••</div>;
 })}</AbsoluteFill>;
}
export function Identity({f}:{f:number}){
 const expand=a(f,138,149),out=m(f,170,182);
 return <div style={{...abs,left:960-mix(78,190,expand),top:457,width:mix(156,380,expand),height:156,borderRadius:100,background:'#effff7dc',border:'2px solid #ffffff9c',boxShadow:'inset 0 0 18px #fff9',overflow:'hidden',opacity:1-progress(f,174,184),transform:'translateY('+(-out*220)+'px) scale('+mix(1,.65,out)+')',filter:'blur('+focusOut(f,172,185,14)+'px)'}}>
  <div style={{...abs,left:181,top:41,fontSize:56,color:'#254c3d',opacity:progress(f,142,148),whiteSpace:'nowrap'}}>{brand.heroName}</div>
 </div>;
}
function ChatMessages({f}:{f:number}){
 const rows=[{text:brand.conversation[0],user:true,start:208},{text:brand.conversation[1],user:false,start:232}];
 return <div style={{display:'flex',flexDirection:'column',gap:28,padding:'205px 35px 0'}}>
  <div style={{textAlign:'center',fontSize:25,color:'#80998d',opacity:progress(f,205,210)}}>{brand.memory.label}</div>
  {rows.map((p,i)=><div key={i} style={{alignSelf:p.user?'flex-end':'flex-start',maxWidth:'89%',padding:'23px 27px',borderRadius:'32px',background:p.user?brand.accent:'#ddecdf',color:p.user?'white':'#355b47',fontSize:35,lineHeight:1.28,opacity:progress(f,p.start,p.start+3),transform:'translateY('+mix(44,0,a(f,p.start,p.start+10))+'px)',filter:'blur('+focusIn(f,p.start,p.start+10,9)+'px)'}}>{p.text}</div>)}
 </div>;
}
export const conversationPhone=(f:number)=>{
 const [x,y,w,h,ry,rz]=track(f,[[170,960,1070,590,1270,-12,5],[184,960,805,590,1270,-12,5],[241,960,805,590,1270,-12,5],[254,960,730,610,1270,0,0],[362,960,730,610,1270,0,0]]);
 return {x,y,width:w,height:h,rotate:rz,ry};
};
export function Conversation({f}:{f:number}){
 const s=conversationPhone(f),expand=m(f,250,265),leave=progress(f,365,375);
 const bubbles=[
  {text:brand.memory.quote,id:-1,x:1030,y:337,w:795,start:254,small:brand.memory.label,user:true},
  {text:brand.conversation[2],id:0,x:92,y:584,w:768,start:287,small:'Today',user:false},
  {text:brand.memory.reply,id:-1,x:1180,y:785,w:645,start:326,small:'',user:true}
 ];
 return <AbsoluteFill style={{opacity:1-leave,filter:'blur('+focusOut(f,363,375,12)+'px)'}}>
  {f<253&&<Exit f={f} start={241} end={253} dy={-80}>
   <div style={{...abs,left:170,top:118,fontSize:242,color:'#f4fff9',fontFamily:'Editorial',letterSpacing:'-.045em',textShadow:'0 0 24px #edfff877'}}><FocusText text="Talk" f={f} start={177} amount={20} duration={9}/></div>
   <div style={{...abs,left:1180,top:798,fontSize:164,color:'#f4fff9',fontFamily:'Editorial',letterSpacing:'-.045em',textShadow:'0 0 24px #edfff866'}}><FocusText text="your way." f={f} start={182} amount={16} duration={9}/></div>
  </Exit>}
  <Phone x={s.x} y={s.y} w={s.width} h={s.height} ry={s.ry} rz={s.rotate} opacity={progress(f,170,174)} blur={Math.max(focusIn(f,170,184,12),motionBlur(f,conversationPhone,430,14))}>
   <div style={{...abs,top:100,left:38,right:38,display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:30,color:'#254f3e',opacity:progress(f,179,186)}}><span>‹</span><div style={{display:'flex',alignItems:'center',gap:10}}><Avatar size={52}/>{brand.heroName}</div><span>•••</span></div>
   <div style={{...abs,inset:0,opacity:1-expand,filter:'blur('+(expand*8)+'px)'}}><ChatMessages f={f}/></div>
   <div style={{...abs,left:38,right:38,top:850,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'22px 28px',borderRadius:50,border:'2px solid #d8e8df',color:'#adc1b6',fontSize:29,opacity:progress(f,249,259)}}><span>Message {brand.heroName}</span><span style={{color:brand.accent}}>↑</span></div>
  </Phone>
  {/* One thread: remembered user message, Pip's follow-up, then the user's reaction. */}
  {bubbles.map((p,i)=>{
   const sample=(q:number)=>{const k=a(q,p.start,p.start+(i===2?6:10));return {x:mix(p.user?p.x-80:p.x+80,p.x,k),y:mix(p.y+35,p.y,k)};},b=sample(f);
   return <div key={i} style={{...abs,left:b.x,top:b.y,width:p.w,display:'flex',flexDirection:p.user?'row-reverse':'row',alignItems:'flex-end',gap:18,opacity:progress(f,p.start,p.start+3),filter:'blur('+Math.max(focusIn(f,p.start,p.start+(i===2?6:10),9),motionBlur(f,sample,200,10))+'px)'}}>
    <div style={{opacity:i===1?1-progress(f,362,365):1}}><Avatar id={p.id} size={85}/></div>
    <div style={{flex:1,padding:'24px 30px',borderRadius:p.user?'38px 38px 10px 38px':'38px 38px 38px 10px',background:p.user?brand.accent:'#effff8f5',color:p.user?'#f5fffb':'#315c47',fontSize:43,lineHeight:1.25,boxShadow:'0 8px 35px #22534212'}}>{p.small&&<div style={{fontSize:24,color:p.user?'#c4e9dd':'#79958a',marginBottom:9}}>{p.small}</div>}{p.text}</div>
   </div>;
  })}
 </AbsoluteFill>;
}

const macroShift=(f:number)=>mix(0,18,progress(f,592,602))+mix(0,137,m(f,602,614));
const resultPose=(f:number)=>{const k=a(f,656,663),settle=a(f,663,666);return {x:mix(960,980,k),y:mix(1190,840,k),scale:mix(1.25,1.025,k)-.025*settle,rotate:mix(7,-3,k)};};
export function CreationSequence({f}:{f:number}){
 const macro=m(f,588,598),scroll=macroShift(f),submit=m(f,611,617),result=resultPose(f);
 return <AbsoluteFill>
  {/* The same typed sentence survives the camera cut into the enlarged device. */}
  {f<624&&<>
   {f>=588&&<Phone x={960} y={400} w={1580} h={2800} white opacity={progress(f,588,594)} scale={mix(1.05,1,m(f,588,598))} blur={Math.max(focusIn(f,588,597,11),focusOut(f,620,628,16))}>
    <div style={{...abs,left:110,right:110,top:1130,transform:'translateY('+(-scroll)+'px)'}}>
     <div style={{display:'flex',gap:35,opacity:progress(f,590,596),fontSize:43,color:'#a2ada6'}}>{['A garden above the clouds','A train to the moon'].map(s=><div key={s} style={{background:'#f4f8f4',padding:'27px 32px',width:'50%',borderRadius:15}}>{s}</div>)}</div>
     <div style={{height:420}}/>
     <div style={{borderRadius:58,background:submit>.7?'linear-gradient(#69c8af,#b3ecd8)':'linear-gradient(#247569,#75bb9f)',padding:34,textAlign:'center',fontSize:63,color:'white',boxShadow:'inset 0 2px 15px #e6fff7,0 0 3px white',transform:'scale('+mix(1,.975,m(f,611,615))+')'}}>Create story</div>
     <div style={{marginTop:156,display:'flex',gap:16,padding:27,background:'#d9e4dc',borderRadius:22,fontSize:67,color:'#6e8075'}}>{'qwertyuiop'.split('').map(c=><div key={c} style={{background:'white',borderRadius:15,width:112,textAlign:'center',padding:'10px 0'}}>{c}</div>)}</div>
    </div>
   </Phone>}
   <div style={{...abs,left:mix(455,345,macro),top:mix(502,491-scroll,macro),fontSize:mix(57,63,macro),color:'#335b49',opacity:progress(f,554,559)*(1-progress(f,620,625)),filter:'blur('+Math.max(focusIn(f,553,560,8),focusOut(f,620,625,12),motionBlur(f,q=>({x:mix(455,345,m(q,588,598)),y:mix(502,491-macroShift(q),m(q,588,598))}),200,8))+'px)'}}><FocusText text={brand.story.prompt} f={f} start={557} duration={2.6} delay={26/(brand.story.prompt.length-1)} amount={6} travel={4}/></div>
   {f<595&&<div style={{...abs,left:1506,top:495,width:86,height:86,borderRadius:'50%',background:brand.accent,color:'white',display:'flex',alignItems:'center',justifyContent:'center',opacity:progress(f,554,559)*(1-progress(f,588,595)),filter:'blur('+focusOut(f,588,595,8)+'px)'}}><Icon kind="arrow" size={43}/></div>}
  </>}
  {f>=621&&f<660&&<AbsoluteFill style={{opacity:progress(f,621,625)*(1-progress(f,653,660)),filter:'blur('+focusOut(f,653,660,14)+'px)'}}>
   <div style={{...abs,left:960,top:540,opacity:1-progress(f,643,649)}}>{Array.from({length:8},(_,i)=><div key={i} style={{...abs,left:-35,top:-100,width:70,height:184,borderRadius:50,transformOrigin:'35px 100px',transform:'rotate('+(i*45+(f-621)*4)+'deg) translateY(-243px)',background:'#ddfff39c',opacity:.2+((i+Math.floor(f/3))%8)/12}}/>)}</div>
   <div style={{...abs,left:960,top:540,transform:'translate(-50%,-50%)',whiteSpace:'nowrap',padding:'37px 60px',borderRadius:100,background:'#e3fff1ec',fontSize:70,color:'#315e4b',boxShadow:'inset 0 0 20px #ffffff90'}}>{f<645?<><span style={{opacity:.45,marginRight:23}}>◌</span>Creating story&nbsp; {Math.round(mix(12,100,a(f,625,640)))}%</>:<><span style={{color:'#429b76',marginRight:23}}>✓</span>Story ready</>}</div>
  </AbsoluteFill>}
  {f>=656&&<Phone x={result.x} y={result.y} w={690} h={1470} ry={-9} rz={result.rotate} scale={result.scale} opacity={progress(f,656,659)*(1-progress(f,705,715))} blur={Math.max(motionBlur(f,resultPose,740,20),focusIn(f,656,663,12),focusOut(f,705,715,16))}>
   <div style={{padding:'128px 30px 0',color:'#355d48'}}>
    <div style={{fontSize:29,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:36}}><span>‹</span><span style={{borderRadius:40,background:'white',padding:'14px 27px'}}>✓ Story ready</span><Icon kind="heart" size={28}/></div>
    <div style={{width:620,height:702,borderRadius:42,overflow:'hidden',background:'#1c4b4a',position:'relative'}}><div style={{position:'absolute',left:-480,top:0,transform:'scale(.65)',transformOrigin:'0 0'}}><StoryWorld f={665+(f-653)*.4}/></div></div>
    <div style={{padding:'31px 25px',marginTop:24,borderRadius:26,background:'#dcefe1',fontSize:34,lineHeight:1.4}}>{brand.story.prompt}</div>
   </div>
  </Phone>}
 </AbsoluteFill>;
}
export function ShareAccent({f}:{f:number}){
 const travel=progress(f,706,749),x=mix(1940,-2030,travel);
 return <div style={{...abs,left:x,top:340,fontSize:360,letterSpacing:'-.045em',fontFamily:'Editorial',color:'#f4fff8',whiteSpace:'nowrap',opacity:progress(f,705,710)*(1-progress(f,746,753)),textShadow:'0 0 22px #edfff86b',filter:'blur('+Math.max(focusIn(f,705,712,13),motionBlur(f,q=>({x:mix(1940,-2030,progress(q,706,749))}),400,3))+'px)'}}>Made for sharing.</div>;
}
