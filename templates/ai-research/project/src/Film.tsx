import audioConfig from '../config/audio.json';
import React from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import {a,p,mix,blur} from './motion';
import {brand} from '../config/brand';
import {TypeRun,editorialTravel} from './Typography';
import {EvidenceJourney,EvidenceQuote,FocusBrackets,ProofEnding} from './EvidenceWorld';

const white='#fff5e9',ink='#25190f';
const flex:React.CSSProperties={display:'flex',alignItems:'center',justifyContent:'center'};
function Layer({children,x=960,y=540,w=1920,h=1080,scale=1,rotate=0,rx=0,ry=0,opacity=1,blur:bl=0,style={}}:{children?:React.ReactNode;x?:number;y?:number;w?:number;h?:number;scale?:number;rotate?:number;rx?:number;ry?:number;opacity?:number;blur?:number;style?:React.CSSProperties}){return <div style={{position:'absolute',left:x-w/2,top:y-h/2,width:w,height:h,opacity,transform:`perspective(2300px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rotate}deg) scale(${scale})`,filter:bl>.05?`blur(${bl}px)`:undefined,...style}}>{children}</div>}
function Mark({size=64,color='currentColor'}:{size?:number;color?:string}){return <svg width={size} height={size} viewBox="0 0 100 100" fill="none"><path d="M31 16H15V40M69 16H85V40M15 60V84H31M85 60V84H69" stroke={color} strokeWidth="7" strokeLinecap="round"/><circle cx="50" cy="50" r="13" fill={color}/></svg>}
function Grain(){return <AbsoluteFill style={{pointerEvents:'none',opacity:.04,mixBlendMode:'soft-light',backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27140%27 height=%27140%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.76%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Cpath fill=%27white%27 filter=%27url(%23n)%27 d=%27M0 0h140v140H0z%27/%3E%3C/svg%3E")'}}/>}
function Ring({t,foreground=false}:{t:number;foreground?:boolean}){
 const rot=-19+6*Math.sin(t*.57),grow=1+.075*Math.sin(t*1.2);
 if(foreground)return <AbsoluteFill style={{pointerEvents:'none',opacity:.26,background:`radial-gradient(ellipse 240px 500px at ${1530+60*Math.sin(t)}px 540px,#ffe3b8b0,transparent 100%),radial-gradient(ellipse 180px 470px at 220px 525px,#d0985860,transparent 100%)`,mixBlendMode:'screen'}}/>;
 return <AbsoluteFill style={{background:'#100804',overflow:'hidden'}}><Layer x={960} y={560} w={1940} h={1640} rotate={rot} scale={grow}>
  <div style={{position:'absolute',width:647,height:547,transform:'scale(3)',transformOrigin:'0 0'}}><div style={{position:'absolute',inset:0,borderRadius:'47% 53% 59% 41%',background:'conic-gradient(from 15deg,#b94810,#ffd5ab 66deg,#d16b24 130deg,#814717 180deg,#ffcda0 226deg,#32140a 288deg,#ea9044 340deg,#b94810)',filter:'blur(25px)'}}/><div style={{position:'absolute',left:45,top:80,width:420,height:340,borderRadius:'49% 51% 44% 56%',background:'#070302',filter:'blur(22px)'}}/><div style={{position:'absolute',right:30,top:130,width:80,height:300,borderRadius:'50%',background:'#ffe4c6',filter:'blur(27px)',opacity:.55}}/></div>
 </Layer><Grain/></AbsoluteFill>
}
function Lens({t,stage=false}:{t:number;stage?:boolean}){
 const rise=a(t,7.34,7.99),lift=editorialTravel(p(t,8.79,9.43));
 const x=960+90*Math.sin((t-7.4)*1.8),y=stage?150:mix(1380,540,rise)-850*lift;
 return <AbsoluteFill style={{background:stage?'#241006':'#0c0704',overflow:'hidden'}}>
  <AbsoluteFill style={{background:`radial-gradient(ellipse ${stage?1020:970}px ${stage?600:660}px at ${x}px ${y}px,#fff0d6 0%,#ffdfab 36%,#e49748 57%,#bc5412aa 74%,#6d2d0c33 81%,transparent 100%)`}}/>
  <AbsoluteFill style={{background:`radial-gradient(ellipse 870px 430px at ${1040-100*Math.sin(t)}px ${1420-680*lift}px,#a4481099,transparent 90%)`}}/>
  <AbsoluteFill style={{background:'repeating-linear-gradient(0deg,transparent 0 116px,#26150815 118px,#ffe6c708 120px,transparent 123px)',opacity:.8}}/><Grain/>
 </AbsoluteFill>
}
function OpticalVeil({t,strength=.4}:{t:number;strength?:number}){
 const q=p(t,9.57,14.94),xx=1430-q*500;
 return <AbsoluteFill style={{pointerEvents:'none',opacity:strength,mixBlendMode:'screen',maskImage:'radial-gradient(ellipse 58% 43% at 48% 49%,transparent 18%,#000a 70%,black 100%)',background:`radial-gradient(ellipse 230px 740px at ${xx}px 660px,#fff3d4d9,transparent 80%),radial-gradient(ellipse 720px 220px at 1200px 80px,#ffe2bebb,transparent 83%),radial-gradient(ellipse 470px 180px at 390px 960px,#ffbb6cb0,transparent 86%)`,filter:'blur(28px)'}}/>;
}
function Hook({t}:{t:number}){return <AbsoluteFill><Ring t={t}/>
 <TypeRun id="too" text={brand.hook[0]} t={t} start={0} end={1.01} size={346} x={930} y={508} mode="hero" flowExit/>
 <TypeRun id="tabs" text={brand.hook[1]} t={t} start={.97} end={1.77} size={246} x={960} y={535} mode="resolve" flowExit/>
 <TypeRun id="answer" text={brand.hook[2]} t={t} start={1.75} end={3.04} size={125} x={970} y={540} mode="resolve" flowExit/>
 <Ring t={t} foreground/>
 </AbsoluteFill>}
function SourceCollection({t}:{t:number}){
 const ent=editorialTravel(p(t,9.57,10.05)),out=editorialTravel(p(t,10.52,10.91));
 return <AbsoluteFill><AbsoluteFill style={{opacity:p(t,9.57,9.88)}}><Lens t={9.75} stage/></AbsoluteFill>
 <Layer x={1130+(1-ent)*530} y={640+(1-ent)*180} w={1640} h={1060} scale={mix(.81,1.08,ent)+out*.6} ry={mix(-24,-8,ent)} rotate={mix(6,-2,ent)} blur={(1-ent)*17+out*14} opacity={1-out}>
 <div style={{position:'absolute',inset:0,borderRadius:36,background:'#fffaf3',padding:58,color:ink,boxShadow:'0 35px 100px #0003'}}>
 <div style={{display:'flex',alignItems:'center',gap:15,fontSize:29}}><Mark size={45}/>{brand.name}</div>
 <div style={{fontSize:93,letterSpacing:'-.055em',fontWeight:330,margin:'46px 0 36px'}}>All your sources.</div>
 <div style={{display:'flex',gap:24}}>{['Research.pdf','Interview notes','Customer feedback'].map((s,i)=><div key={s} style={{position:'relative',flex:1,height:515,borderRadius:19,padding:29,background:['#f7e1c7','#ecdfd1','#f5e9d9'][i],transform:`translateY(${(1-a(t,9.75+i*.065,10.11+i*.065))*170}px)`,boxShadow:'0 15px 30px #98754e10',overflow:'hidden'}}><div style={{fontSize:21,opacity:.6,marginBottom:24}}>{['PDF · 24 pages','DOC · 8 pages','CSV · 126 entries'][i]}</div><div style={{fontSize:33,letterSpacing:'-.03em',lineHeight:1.1}}>{s}</div>{i===0?<><div style={{marginTop:38,fontSize:49,lineHeight:1.04,letterSpacing:'-.04em'}}>Where users<br/>get stuck.</div><div style={{marginTop:35,height:27,width:'80%',background:'#d7984a78'}}/><div style={{marginTop:15,height:4,width:'68%',background:'#64513e33'}}/><div style={{marginTop:13,height:4,width:'82%',background:'#64513e33'}}/></>:i===1?<><div style={{height:60,display:'flex',alignItems:'center',gap:5,marginTop:26}}>{Array.from({length:34},(_,j)=><span key={j} style={{width:4,height:8+42*Math.abs(Math.sin(j*1.7)*Math.cos(j*.4)),borderRadius:3,background:'#a3743e'}}/>)}</div><div style={{fontSize:36,lineHeight:1.15,marginTop:27,letterSpacing:'-.03em'}}>“I got stuck<br/>connecting<br/>my data.”</div></>:<div style={{marginTop:37,display:'flex',flexDirection:'column',gap:17}}>{['Setup','Connection','First run'].map(v=><div key={v} style={{fontSize:30,borderBottom:'1px solid #b29a7b55',paddingBottom:15,display:'flex',justifyContent:'space-between'}}><span>{v}</span><span style={{color:'#a07b4d'}}>↗</span></div>)}</div>}</div>)}</div>
 </div></Layer><OpticalVeil t={t} strength={.46}/></AbsoluteFill>
}
function Cursor({t,start,x,y}:{t:number;start:number;x:number;y:number}){
 const q=a(t,start,start+.27),hit=a(t,start+.29,start+.34)-a(t,start+.40,start+.48);return <Layer x={x+(1-q)*270} y={y+(1-q)*180} w={65} h={79} opacity={p(t,start,start+.06)} scale={1-hit*.16} blur={(1-q)*5}><svg width="65" height="79" viewBox="0 0 65 79"><path d="M8 5L53 44L32 47L21 66Z" fill="#2c1a0d" stroke="white" strokeWidth="4" strokeLinejoin="round"/></svg></Layer>;
}
function AskAndAnswer({t}:{t:number}){
 // One surface persists: the camera approaches the input, click commits the query,
 // then the same input becomes the top of the answer. No unrelated slide replacement.
 const ent=a(t,10.64,10.97),pressed=a(t,11.81,11.87)-a(t,11.95,12.08),open=editorialTravel(p(t,12.07,12.48)),leave=editorialTravel(p(t,14.57,14.94));
 const boxH=mix(405,910,open),boxY=mix(540,535,open),query=brand.query;
 const typed=Math.floor(p(t,10.91,11.55)*query.length),respond=a(t,12.46,12.84),cite=a(t,13.43,13.77),quote=a(t,13.69,14.03);
 return <AbsoluteFill style={{background:'#fbf0dd',opacity:p(t,10.64,10.83)}}><AbsoluteFill style={{background:'radial-gradient(ellipse at 72% 66%,#cc8c45aa,transparent 70%),linear-gradient(145deg,#fff,#e4caab)'}}/>
 <Layer x={970+(1-ent)*250} y={boxY-leave*180} w={1490} h={boxH} scale={mix(1.19,1,ent)-open*.055+leave*.6} rx={mix(9,0,open)} ry={mix(-8,0,open)} rotate={mix(-3,0,open)} blur={(1-ent)*15+leave*16} opacity={1-leave}>
  <div style={{position:'absolute',inset:0,borderRadius:mix(200,40,open),background:'#fffaf3',boxShadow:`0 ${50-pressed*28}px ${105-pressed*30}px #70471644`,overflow:'hidden'}}>
   <div style={{position:'absolute',left:mix(115,68,open),right:mix(93,68,open),top:mix(120,53,open),height:150,display:'flex',alignItems:'center',gap:32}}>
    <div style={{flex:1,color:ink,fontSize:mix(79,51,open),letterSpacing:'-.04em',fontWeight:350,whiteSpace:'nowrap'}}>{query.slice(0,typed)}<span style={{opacity:t<11.74?1:0,color:'#a55823'}}>|</span></div>
    <div style={{width:mix(265,175,open),height:mix(144,99,open),borderRadius:100,...flex,color:white,fontSize:mix(60,39,open),background:'linear-gradient(135deg,#e0b07c,#80471e)',boxShadow:'inset 0 3px 1px #fff1d670',transform:`scale(${1-pressed*.08}) translateY(${pressed*7}px)`}}>Ask <span style={{fontSize:39,marginLeft:13}}>↗</span></div>
   </div>
   <div style={{position:'absolute',left:72,right:72,top:235,opacity:open}}>
    <div style={{height:1,background:'#e7d9c5',marginBottom:44}}/>
    <div style={{display:'flex',alignItems:'center',gap:15,color:'#a46b39',fontSize:22,opacity:respond}}><Mark size={30}/>From your sources</div>
    <div style={{position:'relative',height:215,marginTop:25}}>
     <TypeRun id="core-answer" text={brand.answer} t={t} start={12.55} size={87} x={640} y={74} color={ink} weight={350}/>
     <div style={{position:'absolute',right:36,top:133,width:62,height:55,borderRadius:15,background:'#f7d5a6',color:'#925324',...flex,fontSize:30,opacity:cite,transform:`scale(${.8+.2*cite})`}}>[1]</div>
     <div style={{position:'absolute',bottom:6,left:9,fontSize:30,color:'#947d64',opacity:respond}}>Connection setup is where people get stuck.</div>
    </div>
    {t<14.57&&<div style={{position:'absolute',top:336,left:0,right:0,height:166,opacity:quote,transform:`translateY(${(1-quote)*75}px)`,filter:`blur(${(1-quote)*8}px)`}}>
     <EvidenceQuote/>
     <FocusBrackets w={1346} h={166} stroke={2.2} color="#b88043"/>
     <div style={{position:'absolute',left:193,top:136,width:960,height:16,background:'#fff5e9',opacity:.25,transform:`scaleX(${a(t,13.9,14.19)})`,transformOrigin:'left'}}/>
    </div>}
   </div>
  </div>
 </Layer>
 {t>11.51&&t<12.13&&<Cursor t={t} start={11.52} x={1514} y={594}/>}
 <OpticalVeil t={t} strength={.42*(1-open*.6)+leave*.4}/><Grain/>
 </AbsoluteFill>
}
export function Film(){const t=useCurrentFrame()/30;return <AbsoluteFill style={{background:'#0e0703',fontFamily:'Geist,Arial,sans-serif',overflow:'hidden'}}>
 <style>{`@font-face{font-family:Geist;src:url('${staticFile('fonts/GeistVF.woff2')}');font-weight:100 900;font-style:normal}*{box-sizing:border-box}`}</style>
 {t<3.03?<Hook t={t}/>:t<10.91?<EvidenceJourney t={t}/>:null}
 {t>=9.57&&t<10.91&&<SourceCollection t={t}/>}
 {t>=10.64&&t<14.94&&<AskAndAnswer t={t}/>}
 {t>=14.57&&<ProofEnding t={t}/>}
 {audioConfig.enabled && <Audio src={staticFile(audioConfig.master)}/>}
 </AbsoluteFill>}
