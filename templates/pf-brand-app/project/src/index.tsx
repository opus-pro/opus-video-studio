import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Easing, Img, continueRender, delayRender, interpolate, interpolateColors, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const morph = Easing.bezier(0.5, 0, 0, 1);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const step = (t: number, a: number, b: number, curve = ease) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curve});
const motionBlur = (t: number, a: number, b: number, amount = 3) => t <= a || t >= b ? 0 : amount * Math.sin(Math.PI * step(t, a, b));
const useTime = () => {const frame = useCurrentFrame(); const {fps} = useVideoConfig(); return frame / fps;};
const fit = (text: string, size: number, width: number, factor = 0.62) => Math.min(size, width / Math.max(1, text.length * factor));
const photoStyle: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'};

const Frame: React.FC<{background: string; children: React.ReactNode}> = ({background, children}) => {
  const [handle] = useState(() => delayRender('Load bundled Geist font'));
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const font = new FontFace('Geist', `url(${staticFile('assets/GeistVF.woff2')})`, {weight: '100 900'});
        await font.load(); document.fonts.add(font); await document.fonts.ready;
      } catch { /* Arial is the explicit fallback when the local font is unavailable. */ }
      if (active) continueRender(handle);
    };
    void load();
    return () => {active = false; continueRender(handle);};
  }, [handle]);
  return <AbsoluteFill style={{background, fontFamily: 'Geist, Arial, sans-serif', letterSpacing: 0, overflow: 'hidden', color: '#1c2324'}}>{children}</AbsoluteFill>;
};

type Capsule = {x: number; y: number; width: number; height: number; radius: number};
const capsules: Capsule[] = [
  {x: -30, y: -166, width: 60, height: 132, radius: 30},
  {x: 34, y: -30, width: 132, height: 60, radius: 30},
  {x: -30, y: 34, width: 60, height: 132, radius: 30},
  {x: -166, y: -30, width: 132, height: 60, radius: 30},
];
const Mark: React.FC<{size: number; color?: string; shape?: Capsule[]; rotate?: number}> = ({size, color = '#1c2324', shape = capsules, rotate = 0}) => <svg width={size} height={size} viewBox="-166 -166 332 332" style={{display: 'block', transform: `rotate(${rotate}deg)`}}>{shape.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} rx={p.radius} fill={color}/>)}</svg>;

type BrandProps = {brand: string; tagline: string[]; colors: string[]; photo: string; photoCaption: string; labels: string[]; mark: Capsule[]};
const brandDefaults: BrandProps = {brand: 'FIELD', tagline: ['Make space.', 'Go further.'], colors: ['#c8e58a', '#ff846e', '#c6dce8'], photo: 'assets/coast.jpg', photoCaption: 'Along the coast.', labels: ['FIELD', 'OPEN', '2026'], mark: capsules};
const panels = [
  {x: 80, y: 80, w: 430, h: 448}, {x: 522, y: 80, w: 430, h: 448},
  {x: 964, y: 80, w: 876, h: 448}, {x: 80, y: 540, w: 872, h: 460},
  {x: 964, y: 540, w: 876, h: 460},
];
const panelColor = (i: number, props: BrandProps) => ['#fafbf7', '#c6dce8', props.colors[1], '#1c2324', props.colors[0]][i];

const PanelContent: React.FC<{index: number; t: number; start: number; duration: number; props: BrandProps; skipBrand?: boolean; turnStart: number}> = ({index, t, start, duration, props, skipBrand, turnStart}) => {
  const p = step(t, start, start + 0.36);
  const {w, h} = panels[index];
  const revealed: React.CSSProperties = {position: 'absolute', inset: 0, opacity: p, transform: `translateY(${(1-p)*16}px)`, filter: `blur(${(1-p)*5}px)`};
  if (index === 0) return <div style={{...revealed, overflow: 'hidden'}}><div style={{position: 'absolute', left: -110 + t*12, top: -110 + t*12}}>{Array.from({length: 8}, (_, row) => Array.from({length: 8}, (_, col) => <div key={`${row}-${col}`} style={{position: 'absolute', left: col*88, top: row*88}}><Mark size={35} shape={props.mark}/></div>))}</div></div>;
  if (index === 1) return <div style={revealed}><div style={{height: h-70, overflow: 'hidden'}}><Img src={staticFile(props.photo)} style={{...photoStyle, transform: `scale(${lerp(1.02, 1.08, step(t, start, duration, Easing.linear))})`}}/></div><div style={{height: 70, background: '#fff', display: 'flex', alignItems: 'center', paddingLeft: 26, paddingRight: 26, boxSizing: 'border-box', fontSize: fit(props.photoCaption, 24, w-52), whiteSpace: 'nowrap'}}>{props.photoCaption}</div></div>;
  if (index === 2) return <div style={{...revealed, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Mark size={280} shape={props.mark} rotate={-90 + 90*step(t, turnStart, turnStart+0.6)}/></div>;
  if (index === 3) return <>
    {!skipBrand && <div style={{position: 'absolute', left: 48, top: 58, width: w-96, fontSize: fit(props.brand, 116, w-96), lineHeight: 1.08, fontWeight: 600, color: '#fff', opacity: p, transform: `translateY(${(1-p)*24}px)`, filter: `blur(${6*(1-p)}px)`}}>{props.brand}</div>}
    {props.tagline.slice(0, 2).map((line, i) => {const q = step(t, start+i*0.08, start+i*0.08+0.4); return <div key={i} style={{position: 'absolute', left: 48, top: 240+i*55, width: w-96, fontSize: fit(line, 42, w-96), color: '#fff', lineHeight: 1.2, opacity: q, transform: `translateY(${24*(1-q)}px)`, filter: `blur(${6*(1-q)}px)`}}>{line}</div>;})}
  </>;
  return <>{props.colors.slice(0, 3).map((color, i) => {const q = step(t, start+i*0.06, start+i*0.06+0.42); return <div key={i} style={{position: 'absolute', left: w*(1-q), top: h*i/3, width: w, height: h/3+0.2, background: color, display: 'flex', alignItems: 'center', paddingLeft: 48, boxSizing: 'border-box', filter: `blur(${motionBlur(t, start+i*.06, start+i*.06+.42, 3)}px)`}}><span style={{fontSize: fit(props.labels[i] ?? '', 18, w-96)}}>{props.labels[i]}</span></div>;})}</>;
};

const Arrow: React.FC = () => <svg width="32" height="40" viewBox="0 0 32 40"><path d="M2 2 L2 30 L10 23 L16 37 L23 34 L17 21 L28 21 Z" fill="#101413" stroke="white" strokeWidth="2" strokeLinejoin="round"/></svg>;

const BrandBoard: React.FC<BrandProps & {mode: 'dots' | 'app' | 'clover'}> = ({mode, ...props}) => {
  const t = useTime();
  const {durationInFrames, fps} = useVideoConfig();
  const duration = durationInFrames/fps;
  const backgrounds = {dots: '#f0f3ef', app: '#e8ecee', clover: '#eef2ee'};
  const revealOrder = [0, 2, 1, 4, 3];
  const revealStart = mode === 'dots' ? 1.45 : mode === 'app' ? 1.55 : 1.65;
  const cloverP = step(t, .8, 1.65, morph);
  const cloverR = -45+45*step(t, .1, .65);
  const cloverStarts = [capsules[0], capsules[3], capsules[1], capsules[2]];
  return <Frame background={backgrounds[mode]}>
    {mode === 'app' && <div style={{position: 'absolute', left: 640, top: 485, width: 640, height: 170, borderRadius: 36, background: '#fafbf9', opacity: 1-step(t, .8, 1.1), transform: `translateY(${80*step(t, .8, 1.1)}px)`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50}}>
      <div style={{width: 128, height: 128, borderRadius: 27, background: '#d3e6ef', display: 'grid', placeItems: 'center'}}><div style={{width: 62, height: 62, position: 'relative'}}><div style={{position: 'absolute', left: 27, width: 8, height: 62, background: '#5d91aa'}}/><div style={{position: 'absolute', top: 27, width: 62, height: 8, background: '#5d91aa'}}/></div></div>
      <div style={{width: 128, height: 128}}/>
      <div style={{width: 128, height: 128, borderRadius: 27, background: '#eff7d8', display: 'grid', placeItems: 'center'}}><div style={{width: 66, height: 66, borderRadius: '50%', background: props.colors[0]}}/></div>
    </div>}
    {panels.map((panel, i) => {
      let cx = panel.x+panel.w/2, cy = panel.y+panel.h/2, w = panel.w, h = panel.h, radius = 0, opacity = 1;
      let color = panelColor(i, props);
      if (mode === 'dots') {
        const move = step(t, .7, 1.45, morph); const grow = step(t, 1.1, 1.45, morph);
        cx = lerp(640+i*160, cx, move); cy = lerp(540, cy, move);
        const pop = lerp(.65, 1, step(t, i*.045, .42+i*.045));
        w = lerp(72*pop, panel.w, grow); h = lerp(72*pop, panel.h, grow); radius = 36*(1-grow);
      } else if (mode === 'app') {
        const delays = [0, .05, 0, .1, .15];
        const q = step(t, .75+delays[i], 1.55, Easing.bezier(0, 0, 0, 1));
        cx = lerp(960, cx, q); cy = lerp(570, cy, q); w = lerp(128, w, q); h = lerp(128, h, q); radius = 27*(1-q);
        if (i !== 2) opacity = t < .75+delays[i] ? 0 : 1;
        else if (t < .75) {const press = 1-.06*step(t, .62, .69)+.06*step(t, .69, .75); w *= press; h *= press;}
      } else {
        if (i < 4) {
          const petal = cloverStarts[i]; const factor = 440/332;
          const startX = (petal.x+petal.width/2)*factor; const startY = (petal.y+petal.height/2)*factor;
          const r = cloverR*Math.PI/180;
          cx = lerp(960+startX*Math.cos(r)-startY*Math.sin(r), cx, cloverP);
          cy = lerp(440+startX*Math.sin(r)+startY*Math.cos(r), cy, cloverP);
          w = lerp(petal.width*factor, w, cloverP); h = lerp(petal.height*factor, h, cloverP); radius = 40*(1-cloverP);
          color = interpolateColors(cloverP, [0, 1], ['#1c2324', panelColor(i, props)]);
        } else {
          const q = step(t, 1.05, 1.65, morph); cx = lerp(1402, cx, q); cy = 540+h*q/2; h *= q; opacity = q;
        }
      }
      const contentStart = revealStart+revealOrder.indexOf(i)*(mode === 'clover' ? .065 : .12);
      return <div key={i} data-panel={i} style={{position: 'absolute', left: cx-w/2, top: cy-h/2, width: w, height: h, background: color, borderRadius: radius, opacity, overflow: 'hidden', transform: mode === 'clover' && t < .8 ? `rotate(${cloverR}deg)` : undefined, filter: `blur(${mode === 'dots' ? motionBlur(t, .7, 1.45, 2) : 0}px)`}}>
        {t >= revealStart && <PanelContent index={i} t={t} start={contentStart} duration={duration} props={props} skipBrand={mode === 'clover'} turnStart={mode === 'dots' ? 2 : mode === 'clover' ? 1.75 : 2.1}/>}
        {mode === 'app' && i === 2 && t < revealStart+.36 && <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 1-step(t, revealStart, revealStart+.36)}}><Mark size={lerp(72, 280, step(t, .75, 1.55, Easing.bezier(0, 0, 0, 1)))} shape={props.mark}/></div>}
      </div>;
    })}
    {mode === 'clover' && <div style={{position: 'absolute', left: lerp(806, 128, cloverP), top: lerp(694, 598, cloverP)+24*(1-step(t, .1, .65)), width: lerp(650, 776, cloverP), fontSize: fit(props.brand, lerp(104, 116, cloverP), 776), fontWeight: 600, lineHeight: 1.1, color: interpolateColors(cloverP,[0,.35,1],['#1c2324','#1c2324','#fff']), filter: `blur(${8*(1-step(t, .1, .65))}px)`}}>{props.brand}</div>}
    {mode === 'app' && t < 1.1 && (() => {const q=step(t, .18, .65); const u=1-q; const x=u*u*u*1320+3*u*u*q*1260+3*u*q*q*1000+q*q*q*960; const y=u*u*u*850+3*u*u*q*655+3*u*q*q*645+q*q*q*570; return <div style={{position: 'absolute', left: x, top: y, opacity: 1-step(t, .8, 1.1), filter: `blur(${motionBlur(t, .18, .65, 1.5)}px)`}}><Arrow/></div>;})()}
  </Frame>;
};

type SixProps = {brand: string; subtitle: string; colors: string[]; names: string[]; numbers: string[]};
const sixDefaults: SixProps = {brand: 'FIELD', subtitle: 'A fresh perspective.', colors: ['#173f36', '#cfeb8d', '#f58870', '#c8dfea', '#f8f8f5', '#1c2421'], names: ['PINE', 'LIME', 'CORAL', 'AIR', 'CHALK', 'INK'], numbers: ['01', '02', '03', '04', '05', '06']};
const SixColors: React.FC<SixProps> = props => {
  const t = useTime(); const handoff = step(t, 1.8, 2.45, morph); const title=step(t, .92, 1.2);
  return <Frame background="#f8f8f5">{props.colors.map((color, i) => {
    const q=step(t, i*.075, i*.075+.6, morph); const starts=[1450,1750,1920,1920,-1920,-1920];
    const next=props.colors[(i+1)%6]; const edge=960-180*(i+1)*handoff;
    return <div key={i} style={{position: 'absolute', left: starts[i]*(1-q), top: i*180, width: 1920, height: 180, background: color, overflow: 'hidden', filter: `blur(${motionBlur(t, i*.075, i*.075+.6, 2)}px)`}}>
      {handoff > 0 && <div style={{position: 'absolute', top: 0, left: edge, width: 1920-edge, height: 180, background: next, opacity: step(t, 1.8, 1.87)}}/>}
      <span style={{position: 'absolute', left: 48, top: 78, fontSize: 20, color: i===0 || i===5 ? '#fff' : '#182821'}}>{props.numbers[i]}</span>
      {handoff > 0 && <span style={{position: 'absolute', left: 48, top: 78, fontSize: 20, color: (i+1)%6===0 || (i+1)%6===5 ? '#fff' : '#182821', clipPath: `inset(0 0 0 ${Math.max(0,edge-48)}px)`, opacity: step(t,1.8,1.87)}}>{props.numbers[i]}</span>}
      <span style={{position: 'absolute', right: 48, top: 78, fontSize: fit(props.names[i] ?? '', 20, 230), color: handoff > 0 ? ((i+1)%6===0 || (i+1)%6===5 ? '#fff' : '#182821') : i===0 || i===5 ? '#fff' : '#182821'}}>{props.names[i]}</span>
    </div>;
  })}<div style={{position: 'absolute', left: 500-96*handoff, top: 316+24*(1-title), width: 920, textAlign: 'center', color: '#182821', opacity: title, transform: `scale(${1-.1*handoff})`, filter: `blur(${6*(1-title)}px)`}}><div style={{fontSize: fit(props.brand, 144, 920), fontWeight: 650, lineHeight: 1.05}}>{props.brand}</div><div style={{fontSize: fit(props.subtitle, 32, 920), marginTop: 28}}>{props.subtitle}</div></div></Frame>;
};

type PhotoProps = {photos: string[]; titles: string[]; label: string; colors: string[]};
const fanDefaults: PhotoProps = {photos: ['assets/coast.jpg','assets/forest.jpg','assets/desert.jpg','assets/mountains.jpg'], titles: ['COAST','FOREST','DESERT','HIGHER'], label: 'FIELD NOTES', colors: ['#ff846e','#277765','#c6dce8','#c8e58a']};
const OrbitFan: React.FC<PhotoProps> = props => {
  const t=useTime(); const spread=lerp(4,17,step(t,0,.6)); const turn1=step(t,.9,1.65,Easing.bezier(.25,.8,.2,1)); const turn2=step(t,2,2.75,Easing.bezier(.25,.8,.2,1)); const turn=17*(turn1+turn2); const focus=step(t,3.1,3.65);
  const blur=motionBlur(t,.9,1.45)+motionBlur(t,2,2.55);
  return <Frame background="#e8ece8"><div style={{position: 'absolute', left: 315, top: 935, width: 810, height: 42, borderRadius: '50%', background: '#24372b', opacity: .075, filter: 'blur(24px)'}}/><AbsoluteFill style={{transform: `scale(${lerp(.92,1,step(t,0,.6))})`, transformOrigin: '720px 1500px'}}>
    {Array.from({length: 7}, (_, i) => {const j=i-3; const relative=j+turn/17; const a=j*spread+turn+(j===-2 ? 0 : Math.sign(j+2)*5*focus); const rad=a*Math.PI/180; const x=720+940*Math.sin(rad); const y=1500-940*Math.cos(rad); const asset=i%4; const scale=j===-2 ? 1+.12*focus : 1;
      return <div key={i} data-card={i} style={{position: 'absolute', left:x-170, top:y-250, width:340, height:500, transform:`rotate(${a}deg) scale(${scale})`, zIndex:100-Math.round(Math.abs(relative)*10)+(j===-2 && focus>0 ? 20 : 0), overflow:'hidden', filter:`blur(${blur}px)`}}><Img src={staticFile(props.photos[asset])} style={photoStyle}/><div style={{position:'absolute',left:0,bottom:0,width:340,height:180,background:props.colors[asset],padding:26,boxSizing:'border-box',color:asset===1?'#fff':'#1c2324'}}><div style={{fontSize:fit(props.label,16,288),lineHeight:1.1}}>{props.label}</div><div style={{fontSize:fit(props.titles[asset],44,288),lineHeight:1.1,fontWeight:600,marginTop:28}}>{props.titles[asset]}</div></div></div>;
    })}
  </AbsoluteFill></Frame>;
};

type FocusProps = {photos: string[]; titleLines: string[]; finalTitle: string; subtitle: string};
const focusDefaults: FocusProps = {photos: fanDefaults.photos, titleLines:['SELECTED','FIELD NOTES'],finalTitle:'FIELD NOTES',subtitle:'A different point of view.'};
const OrbitFocus: React.FC<FocusProps> = props => {
  const t=useTime(); const angle=90*step(t,1,1.95,Easing.bezier(.66,0,1,.51))+90*step(t,1.95,2.7,Easing.bezier(.15,.8,.2,1)); const collect=step(t,3.2,4.4,Easing.bezier(.55,0,.09,1)); const titleIn=step(t,.15,.65); const titleOut=step(t,3.2,3.65); const caption=step(t,4.4,4.85);
  return <Frame background="#ebedf0"><div style={{position:'absolute',left:680,top:470-95*titleOut+24*(1-titleIn),width:560,textAlign:'center',fontSize:66,fontWeight:600,lineHeight:1.05,color:'#202521',opacity:titleIn*(1-titleOut),filter:`blur(${8*(1-titleIn)}px)`}}>{props.titleLines.slice(0,2).map((line,i)=><div key={i} style={{fontSize:fit(line,66,560,.55)}}>{line}</div>)}</div>
    {Array.from({length:8},(_,i)=>{const intro=step(t,i*.045,.485+i*.045);const a=(i*45-90+angle)*Math.PI/180;const orbitX=960+690*Math.cos(a); const orbitY=540+350*Math.sin(a);const x=lerp(lerp(960,orbitX,intro),960,collect);const y=lerp(lerp(1080,orbitY,intro),540,collect);const w=i===0?lerp(210,1920,collect):210;const h=i===0?lerp(260,1080,collect):260;return <div key={i} data-orbit-card={i} style={{position:'absolute',left:x-w/2,top:y-h/2,width:w,height:h,zIndex:i===0 && t>=3.2?20:i+1,overflow:'hidden',opacity:i===0?1:1-step(t,3.8,4.3)}}><Img src={staticFile(props.photos[i%4])} style={{...photoStyle,transform:i===0?`scale(${lerp(1,1.025,step(t,4.85,6,Easing.linear))})`:undefined}}/></div>;})}
    {t>=4.4 && <><div style={{position:'absolute',inset:0,zIndex:21,background:'linear-gradient(to top, rgba(0,0,0,.62), rgba(0,0,0,0) 58%)',opacity:caption}}/><div style={{position:'absolute',left:96,bottom:96-32*(1-caption),right:96,zIndex:22,color:'#fff',opacity:caption,filter:`blur(${6*(1-caption)}px)`}}><div style={{fontSize:fit(props.finalTitle,72,1728),fontWeight:600,lineHeight:1.15}}>{props.finalTitle}</div><div style={{fontSize:fit(props.subtitle,30,1728),marginTop:16}}>{props.subtitle}</div></div></>}
  </Frame>;
};

type PassProps = {opening: string[]; eventLines: string[]; year: string; sticker: string; name: string; role: string; date: string; city: string; photo: string; colors: string[]};
const passDefaults: PassProps = {opening:["I'M",'GOING','OUTSIDE.'],eventLines:['FIELD','DAYS'],year:'2026',sticker:'26',name:'MIRA CHEN',role:'DESIGNER',date:'OCT 24-25',city:'SAN FRANCISCO',photo:'assets/coast.jpg',colors:['#ff806c','#174a3b','#acd3eb']};
const EventPass: React.FC<PassProps> = props => {
  const t=useTime(); const replace=step(t,.9,1.5,morph); const grow=step(t,1.6,2.55,morph); const settle=step(t,2.55,3); const squash=t<1.2?lerp(1,.88,step(t,.9,1.2)):lerp(.88,1,step(t,1.2,1.5)); const tilt=-5*grow*(1-settle); const inner=step(t,2.1,2.55);
  return <Frame background="#f4f5f1"><div style={{position:'absolute',left:205,top:255,width:670,height:865,transform:`rotate(${tilt}deg)`,transformOrigin:'center'}}>
    <div style={{position:'absolute',inset:0,background:'#fff',borderRadius:8,boxShadow:'0 12px 32px rgba(24,40,33,.055)',transform:`scale(${lerp(.1,1,grow)})`,opacity:grow,transformOrigin:'50% 20%'}}/>
    <div style={{position:'absolute',left:100,top:245,width:470,height:320,overflow:'hidden',opacity:inner,clipPath:`inset(0 0 ${100*(1-inner)}% 0)`}}><Img src={staticFile(props.photo)} style={photoStyle}/></div>
    <div style={{position:'absolute',left:480,top:220,width:90,height:90,borderRadius:'50%',background:props.colors[0],color:'#fff',display:'grid',placeItems:'center',fontSize:36,fontWeight:600,opacity:inner,transform:`rotate(${lerp(20,-8,settle)}deg) scale(${lerp(.6,1,inner)})`}}>{props.sticker}</div>
    <div style={{position:'absolute',left:50,top:603,right:50,fontSize:fit(props.name,52,570),fontWeight:600,lineHeight:1.1,opacity:inner}}>{props.name}</div>
    <div style={{position:'absolute',left:50,top:676,right:50,fontSize:fit(props.role,24,570),lineHeight:1.2,opacity:inner}}>{props.role}</div>
    <div style={{position:'absolute',left:50,top:747,width:570,borderTop:'1px solid #c9ceca',opacity:inner}}/>
    <div style={{position:'absolute',left:50,top:779,width:200,fontSize:fit(props.date,20,200),opacity:inner}}>{props.date}</div>
    <div style={{position:'absolute',right:50,top:779,width:300,textAlign:'right',fontSize:fit(props.city,20,300),opacity:inner}}>{props.city}</div>
    {[0,1].map(i=>{const q=step(t,2.55+i*.1,2.8+i*.1);return <div key={i} style={{position:'absolute',left:530+i*35,top:145-30*(1-q),width:30,height:30,background:props.colors[i+1],borderRadius:i===0?'50%':0,opacity:q,transform:`rotate(${i===1?45:0}deg)`}}/>;})}
  </div>
  <div style={{position:'absolute',left:lerp(80,255,grow),top:lerp(350,305,grow),width:920,transform:`rotate(${tilt}deg) scaleX(${squash})`,transformOrigin:'0 0'}}>
    {[0,1,2].map(i=>{const intro=step(t,i*.07-.04,i*.07+.46); const old=props.opening[i]??''; const next=i<2?props.eventLines[i]:props.year; const size=lerp(136,72,grow); const lineH=lerp(148,80,grow);return <div key={i} style={{position:'absolute',left:0,top:i*lineH+100*(1-intro),width:lerp(920,570,grow),height:lineH,fontSize:fit(old.length>next.length && replace<1 ? old : next,size,lerp(920,570,grow),.58),fontWeight:650,lineHeight:1,opacity:intro*(i===2?1-step(t,1.6,2.08):1),filter:`blur(${8*(1-intro)}px)`}}><div style={{position:'absolute',inset:0,clipPath:`inset(0 0 0 ${replace*100}%)`}}>{old}</div><div style={{position:'absolute',inset:0,clipPath:`inset(0 ${(1-replace)*100}% 0 0)`}}>{next}</div></div>;})}
  </div></Frame>;
};

const Root: React.FC = () => <>
  <Composition id="pf-brand-dots" component={(props: BrandProps)=><BrandBoard {...props} mode="dots"/>} durationInFrames={336} fps={60} width={1920} height={1080} defaultProps={brandDefaults}/>
  <Composition id="pf-brand-app" component={(props: BrandProps)=><BrandBoard {...props} mode="app"/>} durationInFrames={348} fps={60} width={1920} height={1080} defaultProps={brandDefaults}/>
  <Composition id="pf-brand-clover" component={(props: BrandProps)=><BrandBoard {...props} mode="clover"/>} durationInFrames={324} fps={60} width={1920} height={1080} defaultProps={brandDefaults}/>
  <Composition id="pf-six-colors" component={SixColors} durationInFrames={216} fps={60} width={1920} height={1080} defaultProps={sixDefaults}/>
  <Composition id="pf-orbit-fan" component={OrbitFan} durationInFrames={288} fps={60} width={1440} height={1080} defaultProps={fanDefaults}/>
  <Composition id="pf-orbit-focus" component={OrbitFocus} durationInFrames={360} fps={60} width={1920} height={1080} defaultProps={focusDefaults}/>
  <Composition id="pf-event-pass" component={EventPass} durationInFrames={288} fps={60} width={1080} height={1350} defaultProps={passDefaults}/>
</>;
registerRoot(Root);
