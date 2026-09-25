import React, {useEffect, useState, type CSSProperties, type PropsWithChildren} from 'react';
import {AbsoluteFill, Composition, Easing, Img, continueRender, delayRender, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const smooth = Easing.bezier(.16, 1, .3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (t:number, a:number, b:number, from=0, to=1, easing=smooth) => interpolate(t, [a,b], [from,to], {...clamp,easing});
const pulse = (t:number, a:number, b:number, peak:number) => t<a || t>b ? 0 : Math.sin(Math.PI * (t-a)/(b-a))*peak;
const useTime = () => {const frame=useCurrentFrame(); const {fps}=useVideoConfig(); return frame/fps;};
const img = (name:string) => staticFile(`assets/${name}`);
const fit = (text:string, px:number, width:number, weight=.58) => Math.min(px, width/(Math.max(...text.split('\n').map(v=>v.length),1)*weight));
const fill:CSSProperties = {position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'};

const Frame:React.FC<PropsWithChildren<{color?:string}>> = ({children,color='#e4eef3'}) => {
  const [handle] = useState(()=>delayRender('Loading bundled Geist font'));
  useEffect(()=>{
    const face=new FontFace('Geist', `url("${img('GeistVF.woff2')}")`, {weight:'100 900'});
    face.load().then(loaded=>{(document.fonts as FontFaceSet & {add:(font:FontFace)=>void}).add(loaded);return document.fonts.ready;}).catch(()=>document.fonts.ready).finally(()=>continueRender(handle));
  },[handle]);
  return <AbsoluteFill style={{background:color,fontFamily:'Geist, Arial, sans-serif',letterSpacing:0,overflow:'hidden'}}>{children}</AbsoluteFill>;
};

type IconName='search'|'explore'|'saved'|'profile'|'flash'|'settings'|'switch';
const Icon:React.FC<{name:IconName;size?:number;stroke?:string}> = ({name,size=24,stroke='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
  {name==='search'&&<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>}
  {name==='explore'&&<><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/></>}
  {name==='saved'&&<path d="M6 3h12v18l-6-4-6 4Z"/>}
  {name==='profile'&&<><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></>}
  {name==='flash'&&<path d="m13 2-8 12h6l-1 8 9-13h-7Z"/>}
  {name==='settings'&&<><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/>{Array.from({length:8},(_,i)=><path key={i} d="M12 1v3" transform={`rotate(${i*45} 12 12)`}/>)}</>}
  {name==='switch'&&<><path d="M4 10a8 8 0 0 1 14-5l3 3M21 2v6h-6M20 14a8 8 0 0 1-14 5l-3-3M3 22v-6h6"/></>}
</svg>;

type Route = {name:string;detail:string;photo:string};
type AppProps = {brand:string;headlines:string[];routes:Route[];navigation:string[];background:string;ink:string;accent:string;time:string};
const appDefaults:AppProps={brand:'FIELD',headlines:['Your next\noutside.','Find your\nquiet.','A little\nfurther.'],routes:[{name:'Coastal path',detail:'6.4 km · Easy',photo:'coast.jpg'},{name:'Forest loop',detail:'8.2 km · Moderate',photo:'forest.jpg'},{name:'Ridge walk',detail:'12.1 km · Hard',photo:'mountains.jpg'}],navigation:['Explore','Saved','Profile'],background:'#f3f5ef',ink:'#1c3128',accent:'#d1eb91',time:'9:41'};
const FieldScreen:React.FC<{app:AppProps;scroll?:number;headline?:number;height?:number;blur?:number}> = ({app,scroll=0,headline=0,height=780,blur=0}) => <div style={{width:360,height,position:'relative',overflow:'hidden',background:app.background,color:app.ink}}>
  <div style={{position:'absolute',left:0,top:45,width:360,height:height-125,overflow:'hidden'}}>
    <div style={{position:'absolute',left:0,top:0,width:360,height:1560,transform:`translateY(${scroll}px)`,filter:`blur(${blur}px)`}}>
      <div style={{height:62,padding:'6px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',boxSizing:'border-box'}}><span style={{fontSize:fit(app.brand,28,260),fontWeight:750}}>{app.brand}</span><Icon name="search" size={23}/></div>
      <div style={{position:'absolute',left:20,top:78,width:320,fontSize:fit(app.headlines[headline],38,320),fontWeight:650,lineHeight:'42px',whiteSpace:'pre-line'}}>{app.headlines[headline]}</div>
      {app.routes.map((route,i)=><div key={i} style={{position:'absolute',left:20,top:200+i*408,width:320}}>
        <Img src={img(route.photo)} style={{width:320,height:240,objectFit:'cover',display:'block'}}/>
        <div style={{marginTop:15,fontSize:fit(route.name,20,320),fontWeight:650,lineHeight:'27px'}}>{route.name}</div>
        <div style={{marginTop:2,fontSize:fit(route.detail,20,320),lineHeight:'27px',opacity:.7}}>{route.detail}</div>
      </div>)}
    </div>
  </div>
  <div style={{position:'absolute',left:0,top:0,height:45,width:360,background:app.background,display:'flex',alignItems:'center',padding:'0 24px',boxSizing:'border-box',fontWeight:650,fontSize:14}}>{app.time}<div style={{marginLeft:'auto',display:'flex',gap:5,alignItems:'center'}}><svg width="17" height="15" viewBox="0 0 17 15" fill="currentColor"><rect x="0" y="10" width="3" height="5"/><rect x="4.5" y="7" width="3" height="8"/><rect x="9" y="4" width="3" height="11"/><rect x="13.5" y="1" width="3" height="14"/></svg><svg width="26" height="14" viewBox="0 0 26 14"><rect x="1" y="1" width="21" height="12" rx="3" stroke="currentColor" fill="none"/><rect x="3" y="3" width="17" height="8" rx="1" fill="currentColor"/><path d="M24 5v4" stroke="currentColor" strokeWidth="2"/></svg></div></div>
  <div style={{position:'absolute',left:0,bottom:0,height:80,width:360,background:app.background,borderTop:'1px solid #d7ded1',display:'flex',justifyContent:'space-around',paddingTop:11,boxSizing:'border-box'}}>{app.navigation.map((label,i)=><div key={i} style={{width:110,textAlign:'center',fontSize:fit(label,12,102),fontWeight:i===0?700:500}}><div style={{height:30,display:'flex',justifyContent:'center'}}><Icon name={(['explore','saved','profile'] as const)[i]}/></div>{label}</div>)}</div>
</div>;

type PhoneHandProps={app:AppProps;photo:string;screen:{x:number;y:number;width:number;height:number;radius:number;sourceSize:number}};
export const phoneHandDefaults:PhoneHandProps={app:appDefaults,photo:'hand-phone.png',screen:{x:438,y:187,width:355,height:749,radius:37,sourceSize:1254}};
export const PhoneHand:React.FC<PhoneHandProps>=({app,photo,screen})=>{
  const t=useTime();
  const scroll=t<1.45?at(t,.45,1.45,0,-420,Easing.bezier(.4,0,.8,1)):t<2.05?-420:t<2.8?at(t,2.05,2.8,-420,-620):t<2.9?-620:at(t,2.9,3.75,-620,-100);
  const factor=1200/screen.sourceSize;
  const blur=pulse(t,.45,1.45,1.2)+pulse(t,2.05,2.8,1.2)+pulse(t,2.9,3.75,1.2);
  return <Frame><Img src={img(photo)} style={fill}/><div style={{position:'absolute',left:(screen.x-.7)*factor,top:(screen.y-.7)*factor,width:(screen.width+1.4)*factor,height:(screen.height+1.4)*factor,borderRadius:(screen.radius+.7)*factor,overflow:'hidden',background:app.background}}><div style={{transform:`scale(${(screen.width+1.4)*factor/360})`,transformOrigin:'top left'}}><FieldScreen app={app} scroll={scroll} height={(screen.height+1.4)*360/(screen.width+1.4)} blur={blur}/></div></div></Frame>;
};

export const phoneCarouselDefaults={app:appDefaults,background:'#eff2ed',positions:[230,720,1210],phoneWidth:330,phoneHeight:720};
export const PhoneCarousel:React.FC<typeof phoneCarouselDefaults>=({app,background,positions,phoneWidth,phoneHeight})=>{
  const t=useTime(); const initialSlots=[1,2,0];
  const pass=t>=2.3?1:0; const start=pass?2.3:1; const end=pass?2.95:1.65;
  const active=t>=1 && t<end;
  const cycle=t<1?0:t<2.3?1:2;
  const p=active?at(t,start,end,0,1,Easing.bezier(.8,0,.5,1.18)):1;
  const q=Math.min(p,1+24/490);
  const expand=at(t,0,.5); const final=at(t,3.4,3.95);
  return <Frame color={background}>{initialSlots.map((slot,i)=>{
    const from=(slot-(cycle-1)+6)%3; const to=(slot-cycle+6)%3;
    let x=positions[slot],scale=slot===1?1:.78;
    if(t<1){x=720+(positions[slot]-720)*expand;scale=slot===1?1:1-.22*expand;}
    else if(active){
      if(from===0){const linear=at(t,start,end,0,1,Easing.linear);x=linear<.5?at(linear,0,.5,positions[0],-190):at(linear,.5,1,1630,positions[2]);scale=.78;}
      else {x=positions[from]+(positions[to]-positions[from])*q;scale=(from===1?1:.78)+((to===1?1:.78)-(from===1?1:.78))*Math.min(q,1);}
    }else {x=positions[to];scale=to===1?1:.78;}
    if(t>=3.4){x+=(to===0?-25:to===2?25:0)*final;scale*=to===1?1+.03*final:1;}
    const onTop=t<1?slot===1:active?(p<.5?from===1:to===1):to===1;
    return <div key={i} style={{position:'absolute',left:x-phoneWidth/2,top:540-phoneHeight/2,width:phoneWidth,height:phoneHeight,boxSizing:'border-box',padding:12,borderRadius:48,background:'#111614',boxShadow:'0 22px 32px #24342c26, inset 0 0 0 2px #454d47',transform:`scale(${scale})`,zIndex:onTop?3:1,filter:`blur(${active?pulse(t,start,end,4):0}px)`}}><div style={{width:'100%',height:'100%',borderRadius:36,overflow:'hidden',background:app.background}}><div style={{transform:`scale(${(phoneWidth-24)/360})`,transformOrigin:'top left'}}><FieldScreen app={app} headline={i} scroll={i===0?0:i===1?-420:-828} height={(phoneHeight-24)*360/(phoneWidth-24)}/></div></div></div>;
  })}</Frame>;
};

type CampaignProps={photos:string[];brand:string;headline:string;footer:string;accent:string;textX:number;brandY:number;headlineY:number;footerY:number};
export const cameraDefaults:CampaignProps={photos:['portrait-front.png','portrait-turn.png','portrait-smile.png'],brand:'LUMA',headline:'See things\ndifferently.',footer:'THE NEW OPTICAL COLLECTION',accent:'#861b25',textX:80,brandY:1320,headlineY:1450,footerY:1690};
const BrandCopy:React.FC<{props:CampaignProps;t:number;start:number;end:number}>=({props:p,t,start,end})=>{
  const reveal=at(t,start,end); const head=at(t,start+.08,end); const foot=at(t,start+.16,end);
  return <><AbsoluteFill style={{background:'linear-gradient(to bottom, transparent 60%, rgba(255,255,255,.08) 67%, rgba(255,255,255,.52) 100%)',opacity:reveal}}/>
    <div style={{position:'absolute',left:p.textX,top:p.brandY,width:920,height:115,overflow:'hidden',color:p.accent}}><div style={{fontSize:fit(p.brand,96,920),lineHeight:'110px',fontWeight:650,transform:`translateY(${(1-reveal)*110}px)`,filter:`blur(${(1-reveal)*3}px)`}}>{p.brand}</div></div>
    <div style={{position:'absolute',left:p.textX,top:p.headlineY,width:920,color:p.accent,fontSize:fit(p.headline,78,920),fontWeight:500,lineHeight:'84px',whiteSpace:'pre-line',opacity:head,transform:`translateY(${(1-head)*30}px)`}}>{p.headline}</div>
    <div style={{position:'absolute',left:p.textX,top:p.footerY,width:920,color:p.accent,fontSize:fit(p.footer,22,920),fontWeight:550,opacity:foot,transform:`translateY(${(1-foot)*18}px)`}}>{p.footer}</div></>;
};
export const CameraCampaign:React.FC<CampaignProps>=(props)=>{
  const t=useTime();
  const cuts=[{start:0,end:.8,index:0},{start:.8,end:1.06,index:1},{start:1.06,end:1.3,index:2},{start:1.3,end:1.55,index:0},{start:1.55,end:4.2,index:2}];
  const cut=cuts.find(c=>t>=c.start&&t<c.end)??cuts[4];
  const retiring=at(t,1.35,1.9); const grid=1-retiring;
  const photoScale=t<.7?1.06:t>=2.45?at(t,2.45,4.2,1,1.015,Easing.linear):at(t,cut.start,cut.start+.2,1.04,1);
  const blur=t<.7?at(t,0,.7,9,0):at(t,cut.start,cut.start+.13,4,0);
  return <Frame><Img src={img(props.photos[cut.index])} style={{...fill,transform:`scale(${photoScale})`,filter:`blur(${blur}px)`,objectPosition:'center top'}}/>
    <AbsoluteFill style={{opacity:grid}}><svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0}}><path d="M360 0V1920M720 0V1920M0 640H1080M0 1280H1080" fill="none" stroke="white" strokeWidth="2" opacity=".2"/><path d="M508 946v-18h18M554 928h18v18M572 974v18h-18M526 992h-18v-18" fill="none" stroke="white" strokeWidth="3"/></svg></AbsoluteFill>
    <div style={{position:'absolute',left:0,top:0,width:1080,height:120,background:'#111a224d',color:'white',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 70px',boxSizing:'border-box',transform:`translateY(${-140*retiring}px)`}}><Icon name="flash" size={35}/><Icon name="settings" size={35}/><Icon name="switch" size={35}/></div>
    <div style={{position:'absolute',left:0,bottom:0,width:1080,height:360,background:'#111a2273',color:'white',textAlign:'center',transform:`translateY(${360*retiring}px)`}}><div style={{fontSize:25,fontWeight:600,paddingTop:35}}>PHOTO</div><div style={{position:'absolute',top:115,left:486,width:108,height:108,border:'6px solid white',borderRadius:'50%',boxSizing:'border-box',padding:6}}><div style={{width:'100%',height:'100%',borderRadius:'50%',background:'white'}}/></div><div style={{position:'absolute',right:90,top:145}}><Icon name="switch" size={40}/></div></div>
    {t>=.72&&t<.8&&<AbsoluteFill style={{background:'white',opacity:at(t,.72,.8,.55,0,Easing.linear)}}/>}
    <BrandCopy props={props} t={t} start={1.9} end={2.45}/>
  </Frame>;
};

export const slicesDefaults={...cameraDefaults,headline:'A new way\nto see.',footer:'NEW COLLECTION',background:'#e4eef3',sliceHeight:480,sliceOffsets:[-310,-300,-390,-830],sliceScales:[1.18,1.4,1,1.5]};
export const PortraitSlices:React.FC<typeof slicesDefaults>=(props)=>{
  const t=useTime(); const expand=at(t,1.6,2.2,0,1,Easing.bezier(.5,0,0,1));
  const indexes=[1,0,2,1];
  return <Frame color={props.background}>
    {t<1.6&&<Img src={img(props.photos[0])} style={{...fill,transform:`scale(${at(t,0,.6,1.04,1)})`}}/>}
    {t>=.6&&indexes.map((idx,i)=>{
      if(i===1&&t>=1.6)return null;
      const dir=i%2===0?-1:1; const entered=at(t,.6+i*.05,1.15+i*.05,0,1,Easing.bezier(0,0,0,1));
      const exited=at(t,1.6,2.15);
      return <div key={i} style={{position:'absolute',left:0,top:i*props.sliceHeight,width:1080,height:props.sliceHeight,overflow:'hidden'}}><div style={{position:'absolute',width:1080,height:1920,transform:`translateX(${dir*1080*(1-entered+exited)}px)`,filter:`blur(${pulse(t,.6+i*.05,1.15+i*.05,3)}px)`}}><Img src={img(props.photos[idx])} style={{position:'absolute',left:(1080-1080*props.sliceScales[i])/2,top:props.sliceOffsets[i],width:1080*props.sliceScales[i],height:1620*props.sliceScales[i],objectFit:'cover'}}/></div></div>;
    })}
    {t>=1.6&&<div style={{position:'absolute',left:0,top:480*(1-expand),width:1080,height:480+1440*expand,overflow:'hidden'}}>
      <Img src={img(props.photos[2])} style={{position:'absolute',left:0,top:0,width:1080,height:1920,objectFit:'cover',objectPosition:'center top',transform:`translateY(${-300*(1-expand)}px) scale(${1.4-.4*expand})`,transformOrigin:'center top'}}/>
      {t<1.7&&<Img src={img(props.photos[0])} style={{position:'absolute',left:(1080-1080*(1.4-.4*expand))/2,top:-300*(1-expand),width:1080*(1.4-.4*expand),height:1620*(1.4-.4*expand),objectFit:'cover'}}/>}
    </div>}
    <BrandCopy props={props} t={t} start={2.2} end={2.7}/>
  </Frame>;
};

type Product={title:string[];photo:string;price:string};
export const printDefaults={brand:'FIELD PRINTS',edition:'2026 EDITION',footer:['40×50 CM','ARCHIVAL PAPER','FIELD.STUDIO'],background:'#d0e88b',ink:'#173f36',label:'LIMITED PRINT',products:[{title:['COAST','STUDY'],photo:'coast.jpg',price:'$32'},{title:['GREEN','HOURS'],photo:'forest.jpg',price:'$32'},{title:['DESERT','LIGHT'],photo:'desert.jpg',price:'$32'}] as Product[]};
export const PrintMenu:React.FC<typeof printDefaults>=(p)=>{
  const t=useTime(); const starts=[0,1.5,3.2]; const ends=[.55,2.2,3.9]; const selected=t<1.85?0:t<3.55?1:2;
  return <Frame color={p.background}><div style={{position:'absolute',left:65,top:57,fontSize:fit(p.brand,26,610),fontWeight:650,color:p.ink}}>{p.brand}</div><div style={{position:'absolute',right:65,top:64,fontSize:fit(p.edition,18,320),color:p.ink}}>{p.edition}</div>
    {p.products.map((product,i)=>{
      const entrance=at(t,starts[i],ends[i]); const next=i<2?at(t,starts[i+1],ends[i+1]):0;
      if(t<starts[i]||i<2&&t>=ends[i+1])return null;
      const x=1350-700*entrance-1000*next;
      const rotation=8-11*entrance-5*next;
      return <React.Fragment key={i}>
        <div style={{position:'absolute',left:x-220,top:340,width:440,height:560,padding:18,boxSizing:'border-box',background:'white',boxShadow:'0 16px 22px #243b2933',transform:`rotate(${rotation}deg)`,filter:`blur(${pulse(t,starts[i],ends[i],3)+(i<2?pulse(t,starts[i+1],ends[i+1],3):0)}px)`}}><Img src={img(product.photo)} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/></div>
        {product.title.map((line,j)=>{
          const inc=at(t,starts[i]+j*.07,ends[i]); const out=i<2?at(t,starts[i+1]+j*.07,ends[i+1]):0;
          const swing=t<ends[i]?interpolate(inc,[0,.8,1],[.82,1.04,1],clamp):out>0?interpolate(out,[0,.4,1],[1,1.04,.82],clamp):1;
          return <div key={j} style={{position:'absolute',left:65,top:145+j*112,width:600,height:114,color:p.ink,fontSize:fit(line,112,600,.62),fontWeight:700,lineHeight:'112px',whiteSpace:'nowrap',transform:`translateX(${i===0?-(1-inc)*900-out*1080:(1-inc)*1080-out*1080}px) scaleX(${swing})`,transformOrigin:'left center',filter:`blur(${pulse(t,starts[i]+j*.07,ends[i],4)+(i<2?pulse(t,starts[i+1]+j*.07,ends[i+1],4):0)}px)`}}>{line}</div>;
        })}
      </React.Fragment>;
    })}
    <div style={{position:'absolute',left:80,top:800,width:280,color:p.ink,fontSize:fit(p.products[selected].price,56,280),fontWeight:600}}>{p.products[selected].price}</div><div style={{position:'absolute',left:80,top:875,width:300,color:p.ink,fontSize:fit(p.label,20,300)}}>{p.label}</div>
    <div style={{position:'absolute',left:65,right:65,top:1010,display:'flex',justifyContent:'space-between',color:p.ink,fontSize:20}}>{p.footer.map((text,i)=><div key={i} style={{maxWidth:300,fontSize:fit(text,20,300)}}>{text}</div>)}</div>
  </Frame>;
};

export const recapDefaults={photo:'mountains.jpg',brand:'FIELD RUN',headline:'Trail\ncomplete.',background:'#182722',routeColor:'#d1eb91',distance:12.4,metrics:[{label:'Distance',value:'12.4',unit:'km'},{label:'Time',value:'1:24:36',unit:''},{label:'Elevation',value:'680',unit:'m'},{label:'Pace',value:'6:49',unit:'/km'}]};
export const TrailRecap:React.FC<typeof recapDefaults>=(p)=>{
  const t=useTime(); const enter=at(t,.65,1.35,0,1,Easing.bezier(0,.81,.62,1)); const compact=at(t,1.5,2.15); const scale=t<.7?at(t,0,.7,1.13,1.03):t<2.8?1.03:at(t,2.8,5.4,1.03,1.055,Easing.linear);
  const route=at(t,0,.7); const routeOpacity=1-.75*compact;
  return <Frame color={p.background}><Img src={img(p.photo)} style={{...fill,transform:`scale(${scale})`}}/><AbsoluteFill style={{background:`linear-gradient(to bottom, ${p.background}22 0%, ${p.background}08 28%, ${p.background}aa 61%, ${p.background} 90%)`}}/>
    <svg width="1080" height="1350" style={{position:'absolute',inset:0,opacity:routeOpacity}}><path d="M150 850 C180 745 260 520 340 520 S530 740 620 680 S745 350 850 260" fill="none" stroke={p.routeColor} strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-route}/><circle cx="850" cy="260" r="6" fill={p.routeColor} opacity={at(t,.57,.7)}/></svg>
    <div style={{position:'absolute',left:64,top:80,width:720,fontSize:fit(p.brand,24,720),fontWeight:600,color:'white'}}>{p.brand}</div>
    <div style={{position:'absolute',left:64,top:424+(200-424)*compact+70*(1-enter),width:950,fontSize:fit(p.headline,124-44*compact,950),lineHeight:`${126-42*compact}px`,fontWeight:650,whiteSpace:'pre-line',color:'white',opacity:enter,filter:`blur(${8*(1-enter)}px)`}}>{p.headline}</div>
    <svg width="210" height="360" viewBox="0 0 240 390" style={{position:'absolute',right:64,top:150,opacity:.25}}>{[0,1,2].map(i=><path key={i} d={`M${225-i*23} ${270-i*12} V${100+i*23} A${90-i*23} ${90-i*23} 0 0 0 ${15+i*23} ${100+i*23} V${300-i*23} A${90-i*23} ${90-i*23} 0 0 0 ${155-i*18} ${355-i*23}`} fill="none" stroke={p.routeColor} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1-at(t,2.05+i*.12,2.56+i*.12)}/>)}</svg>
    {p.metrics.map((metric,i)=>{
      const reveal=at(t,2+i*.08,2.51+i*.08); const value=i===0?(p.distance*at(t,2,2.5)).toFixed(1):metric.value;
      return <div key={i} style={{position:'absolute',left:i%2===0?64:580,top:(i<2?850:1020)+(1-reveal)*28,width:430,height:145,opacity:reveal}}><div style={{fontSize:fit(metric.label,20,430),color:'#b0c4b6',fontWeight:500}}>{metric.label}</div><div style={{marginTop:12,fontSize:fit(`${value} ${metric.unit}`,56,430,.58),color:'white',fontWeight:550,whiteSpace:'nowrap'}}>{value}{metric.unit&&<span style={{fontSize:32,marginLeft:10,fontWeight:400}}>{metric.unit}</span>}</div></div>;
    })}
  </Frame>;
};

const Root:React.FC=()=> <>
  <Composition id="pf-phone-hand" component={PhoneHand} width={1200} height={1200} fps={60} durationInFrames={276} defaultProps={phoneHandDefaults}/>
  <Composition id="pf-phone-carousel" component={PhoneCarousel} width={1440} height={1080} fps={60} durationInFrames={288} defaultProps={phoneCarouselDefaults}/>
  <Composition id="pf-camera-campaign" component={CameraCampaign} width={1080} height={1920} fps={60} durationInFrames={252} defaultProps={cameraDefaults}/>
  <Composition id="pf-portrait-slices" component={PortraitSlices} width={1080} height={1920} fps={60} durationInFrames={252} defaultProps={slicesDefaults}/>
  <Composition id="pf-print-menu" component={PrintMenu} width={1080} height={1080} fps={60} durationInFrames={336} defaultProps={printDefaults}/>
  <Composition id="pf-trail-recap" component={TrailRecap} width={1080} height={1350} fps={60} durationInFrames={324} defaultProps={recapDefaults}/>
</>;
registerRoot(Root);
