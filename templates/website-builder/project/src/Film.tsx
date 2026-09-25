import React from 'react';
import {AbsoluteFill,Audio,Img,staticFile,useCurrentFrame} from 'remotion';
import {a,m,d,p,mix,lerp,blur,textIn} from './motion';
import {Mark,Editor,Publication,Properties,Widgets,ColorPicker,Animations,Signup,Cursor,Icon,PhotoCard,Toolbar,photo,purple} from './UI';
import brand from '../config/brand.json';
import alignment from '../config/beat-alignment.json';
import {Layer,White} from './Scene';
import {interactions as events} from './interactions';
import {Teaser,Assemble,ThemeFlow,FormFlow,Publish} from './InteractionScenes';
const ink=brand.ink;
const center:React.CSSProperties={position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)'};
const fill:React.CSSProperties={position:'absolute',inset:0};
const Black=()=> <AbsoluteFill style={{background:'#050407'}}><div style={{...fill,background:'radial-gradient(ellipse at 50% 51%,#26163c33,transparent 55%)'}}/></AbsoluteFill>;
const Type=({lines,t,start=0,size=108,color=ink,x=0,y=0,align='center',glow=false}:{lines:string[];t:number;start?:number;size?:number;color?:string;x?:number;y?:number;align?:'left'|'center';glow?:boolean})=><div style={{position:'absolute',left:960+x,top:540+y,transform:'translate(-50%,-50%)',textAlign:align,fontSize:size,fontWeight:900,letterSpacing:-size*.065,lineHeight:.88,whiteSpace:'nowrap',color}}>{lines.map((l,row)=><div key={row}>{[...l].map((c,i)=><span key={i} style={{display:'inline-block',whiteSpace:'pre',color:l==='NO-CODE'?purple:color,...textIn(t,start+row*.085,i),textShadow:glow?'0 0 9px #ecafff,0 0 24px #b15be3':undefined}}>{c}</span>)}</div>)}</div>;
const Star=({t,s=1}:{t:number;s?:number})=><div style={{...center,width:270,height:270,transform:`translate(-50%,-50%) scale(${s}) rotate(${lerp(t,[[0,-24],[.4,10],[.95,75],[1.2,115]])}deg)`,filter:'drop-shadow(0 0 20px #df61ff) drop-shadow(0 0 45px #b142ed)'}}><svg viewBox="0 0 200 200"><defs><linearGradient id="star" x1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset=".35" stopColor="#ffb6fe"/><stop offset=".7" stopColor="#bc3dfe"/><stop offset="1" stopColor="#694ce3"/></linearGradient></defs><path d="M100 4Q106 85 194 100Q113 105 100 196Q89 114 6 100Q87 90 100 4Z" fill="url(#star)"/><path d="m100 4 1 96L6 100Q87 90 100 4Z" fill="#fff" opacity=".25"/></svg></div>;
function Reveal({t}:{t:number}){
 if(t<6.2)return <><Black/><Type lines={['INTRODUCING']} t={t} start={5.04} size={104} color="white"/></>;
 if(t<7.5)return <><Black/><Star t={t-6.2} s={lerp(t,[[6.2,.07],[6.63,1],[7.16,1.15],[7.5,.06]])}/></>;
 const logoX=lerp(t,[[7.5,0],[7.72,0],[8.14,-455],[9.3,-455],[9.95,0]]),logoS=lerp(t,[[7.5,.7],[7.8,1.1],[8.14,1],[9.4,1],[10,.44]]);
 return <><Black/><Layer w={300} h={300} x={logoX} s={logoS} opacity={a(t,7.47,7.68)}><Mark size={300} glow t={t}/><div style={{position:'absolute',left:-20,top:0,color:'#ffc9ff',fontSize:80}}>✦</div><div style={{position:'absolute',right:-5,bottom:4,color:'#dcbfff',fontSize:48}}>✦</div></Layer><div style={{opacity:1-d(t,9.35,9.72)}}><Type lines={brand.product.toUpperCase().split(' ')} t={t} start={7.88} size={130} color="white" x={205} glow/></div></>
}
function MotionPanel({t}:{t:number}){
 if(t<32.3)return <><White/><Layer w={435} h={710} x={lerp(t,[[29.55,300],[30.1,70],[31.8,-20],[32.3,-120]])} y={lerp(t,[[29.55,740],[30.15,185],[31.4,0],[32.3,-120]])} s={1.24} rx={17} ry={-8} rz={lerp(t,[[29.55,-15],[31.5,-3]])} bl={blur(t,q=>lerp(q,[[29.55,740],[30.15,185],[31.4,0],[32.3,-120]]),.13,10)}><Animations t={t}/>{t>30.45&&<Cursor x={lerp(t,[[30.45,480],[30.9,events.blurPreset.point[0]]])} y={lerp(t,[[30.45,690],[30.9,events.blurPreset.point[1]]])} scale={.82} click={t>=events.blurPreset.down&&t<events.blurPreset.up}/>}</Layer></>;
 return <><White/><Layer w={1000} h={950} s={1.45} y={270} x={0}><Publication archive t={t} reveal={32.32}/></Layer></>
}
function Promise({t}:{t:number}){
 if(t<35.02)return <><White/><Type lines={t<34.05?['ENDLESS']:['ENDLESS','POSSIBILITIES']} t={t} start={33.65} size={135}/></>;
 if(t<37.18)return <><White/><Layer w={1800} h={1010}><div style={{height:'100%',overflow:'hidden',borderRadius:28}}><Img src={photo('desk')} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${1+(t-35.02)*.025})`}}/><div style={{...fill,background:'#1b0b2638'}}/></div></Layer><Type lines={['BRING YOUR','IDEAS TO LIFE']} t={t} start={35.15} size={165} color="white"/></>;
 if(t<38.2)return <><White/><Type lines={['ALL IN ONE.']} t={t} start={37.2} size={133}/><Layer s={.92} y={mix(1190,0,a(t,37.65,38.23))} bl={blur(t,q=>mix(1190,0,a(q,37.65,38.23)),.13,14)}><Editor/></Layer></>;
 if(t<39.12)return <><White/><Layer s={lerp(t,[[38.2,.92],[38.5,.92],[39.12,1.85]])} x={lerp(t,[[38.2,0],[38.5,0],[39.12,-1160]])} y={lerp(t,[[38.2,0],[38.5,0],[39.12,110]])} ry={lerp(t,[[38.2,0],[39.12,-9]])} rz={lerp(t,[[38.2,0],[39.12,6]])} bl={blur(t,q=>lerp(q,[[38.2,0],[38.5,0],[39.12,-1160]]),.1,10)}><Editor/></Layer></>;
 return <><White/><Layer w={310} h={1050} x={lerp(t,[[39.12,0],[39.55,-420],[42.65,-420]])} y={lerp(t,[[39.12,60],[42.65,-270]])} s={1.16} ry={-6} rz={-4}><Properties/></Layer><Type lines={['SEAMLESS','NO-CODE','CREATION.']} t={t} start={39.55} x={380} size={117} align="left"/></>
}
function End({t}:{t:number}){
 if(t<47.1)return <><Black/><Type lines={[brand.cta.toUpperCase()]} t={t} start={44.9} size={139} color="white" glow={t<45.55}/></>;
 if(t<48.45)return <><Black/><Star t={t-47.1} s={lerp(t,[[47.1,.06],[47.45,.87],[47.94,1.07],[48.45,.04]])}/></>;
 return <><Black/><Layer w={270} h={270} s={mix(.57,1,a(t,48.38,49.12))} y={-50} opacity={a(t,48.38,48.62)}><Mark size={270} glow t={t}/><div style={{position:'absolute',left:-12,top:0,fontSize:69,color:'#e3b5fb'}}>✦</div><div style={{position:'absolute',right:-2,bottom:10,fontSize:38,color:'#d9bcff'}}>✦</div></Layer><div style={{position:'absolute',left:0,right:0,top:742,textAlign:'center',fontSize:40,fontWeight:650,letterSpacing:-1,color:'white',opacity:a(t,49.1,49.6),transform:`translateY(${(1-a(t,49.1,49.6))*15}px)`}}>{brand.name}</div></>
}
export const Film=()=>{
 const frame=useCurrentFrame(),actual=frame/30;
 let t=actual;for(let i=1;i<alignment.knots.length;i++){const prev=alignment.knots[i-1],next=alignment.knots[i];if(actual<=next[0]){t=mix(prev[1],next[1],p(actual,prev[0],next[0]));break;}}
 return <AbsoluteFill style={{background:'#fff',fontFamily:'Geist,sans-serif',color:ink}}><style>{`@font-face{font-family:Geist;src:url('${staticFile('fonts/GeistVF.woff2')}') format('woff2');font-weight:100 900}*{box-sizing:border-box}`}</style>
 {t<5?<Teaser t={t}/>:t<10.03?<Reveal t={t}/>:t<17.4?<Assemble t={t}/>:t<23.75?<ThemeFlow t={t}/>:t<29.55?<FormFlow t={t}/>:t<33.65?<MotionPanel t={t}/>:t<42.65?<Promise t={t}/>:t<44.9?<Publish t={t}/>:<End t={t}/>}
 {brand.audio.mode==='master'&&<Audio src={staticFile(brand.audio.master)}/>}
 </AbsoluteFill>
};
