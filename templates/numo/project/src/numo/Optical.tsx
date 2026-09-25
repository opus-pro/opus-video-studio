import React from 'react';
import {Brand} from '../design';
import {Stage,Box,Text,Rule,Arrow,out} from '../shared';
import {PrintGrain} from './PrintGrain';
import {MotionType} from './MotionType';
import {OpticField} from './OpticField';
import {numoStory as story,rawValue} from './story';

export const NumoOptical:React.FC<{shot:number;f:number;b:Brand}>=({shot,f,b})=>{
 const p=out(f,16);let content:React.ReactNode;let bg=b.background,ink=b.paper;
 if(shot===0){
  content=<>{Array.from({length:15},(_,r)=><Box key={r} x={-430+(r%2?1:-1)*f*13} y={-84+r*64} w={2816} h={64} style={{display:'flex',fontVariantNumeric:'tabular-nums',fontSize:44,fontWeight:550,letterSpacing:'-.055em',borderBottom:`1px solid ${b.paper}44`,color:b.paper}}>{Array.from({length:16},(_,c)=><div key={c} style={{width:176,flexShrink:0,padding:'4px 12px',borderRight:`1px solid ${b.paper}33`,background:(r*17+c)%29===0?b.accent:'transparent',color:(r*17+c)%29===0?b.background:'inherit',opacity:(r+c)%5===0?1:.62}}>{rawValue(r,c)}</div>)}</Box>)}</>;
 }else if(shot===1){
  bg=b.accent;ink=b.background;
  content=<><Box w={1280} h={720}><OpticField b={b} f={f} amount={1.25}/></Box><Box x={-28} y={-35} w={1070} h={790} style={{background:b.accent,rotate:'-5deg'}}/><Text x={29+(1-p)*-170} y={164} size={312} weight={780} style={{letterSpacing:'-.085em'}}>{story.rows.toLocaleString('en-US')}</Text><Text x={48} y={516} size={106} weight={650}>ROWS</Text></>;
 }else if(shot===2){
  content=<>{story.sources.map((name,i)=><Box key={name} x={(1-out(f,12,i*2))*(i===1?420:-420)} y={i*240} w={1280} h={240} style={{overflow:'hidden',background:i===1?b.accent:b.paper,color:b.background,borderBottom:`2px solid ${b.background}`}}><Text x={43} y={i===2?42:22} size={i===2?151:i===1?181:207} weight={760}>{name.toUpperCase()}</Text><Box x={943} w={337} h={240}><OpticField b={{...b,accent:i===1?b.background:b.paper,background:i===1?b.accent:b.background}} f={f} phase={i*.8} amount={1.1}/></Box></Box>)}</>;
 }else if(shot===3){
  content=<><Box x={829} y={-58} w={451} h={433}><OpticField b={b} f={f} amount={1.45}/></Box><Box x={0} y={353} w={1280} h={310} style={{background:b.background}}/><MotionType b={b} f={f} x={31} y={12} size={272} weight={790} dx={-130} dy={0}>WHY</MotionType><MotionType b={b} f={f} delay={3} x={30} y={397} size={202} weight={790} dx={140} dy={0}>THE DROP?</MotionType><Box y={672} w={1280} h={48}><OpticField b={b} f={f} phase={1.2}/></Box></>;
 }else if(shot===7){
  bg=b.accent;ink=b.background;
  const drop=Math.round((1-story.revenue.after/story.revenue.before)*100);
  content=<><Box x={865} w={415} h={720}><OpticField b={b} f={f} amount={1.65} phase={1.5}/></Box><Text x={45} y={53} size={91} weight={650}>SALES</Text><Rule x={46} y={173} w={753}/><MotionType b={b} f={f} light x={14} y={240} size={378} weight={780} dy={110} style={{letterSpacing:'-.1em'}}>−{drop}<span style={{fontSize:196}}>%</span></MotionType><Box x={669} y={585}><Arrow size={118} direction={90}/></Box></>;
 }else if(shot===12){
  bg=b.accent;ink=b.background;
  content=<><Box x={865} w={415} h={720}><OpticField b={b} f={f} amount={1.65} phase={1.5}/></Box><MotionType b={b} f={f} light x={34} y={86} size={244} weight={780} dy={100}>CHECK</MotionType><Rule x={46} y={375} w={753}/><MotionType b={b} f={f} delay={3} light x={35} y={434} size={155} weight={780} dx={90} dy={0}>PAYMENTS.</MotionType></>;
 }else if(shot===16){
  content=<><Box w={1280} h={720}><OpticField b={b} f={f} amount={1.55} phase={.8}/></Box><Box x={-40+(1-p)*-170} y={63} w={1004} h={227} style={{background:b.paper}}/><Box x={304+(1-p)*200} y={360} w={1060} h={275} style={{background:b.accent}}/><MotionType b={b} f={f} light x={37} y={102} size={160} weight={790} dx={-170} dy={0} style={{color:b.background}}>KNOW WHY.</MotionType><MotionType b={b} f={f} delay={3} light x={345} y={401} size={190} weight={790} dx={200} dy={0} style={{color:b.background}}>ACT FAST.</MotionType></>;
 }else{
  content=<><Box w={1280} h={720}><OpticField b={b} f={f+75} amount={1.55} phase={.8}/></Box><Box x={0} y={22} w={1228} h={439} style={{background:b.background,translate:`${(1-p)*-120}px 0`}}/><MotionType b={b} f={f} x={25} y={69} size={399} weight={780} dy={110} style={{letterSpacing:'-.085em'}}>{b.name}</MotionType><Box x={36} y={555} w={1132} h={107} style={{background:b.paper,translate:`${(1-p)*110}px 0`}}/><Text x={60} y={572} size={69} weight={560} style={{color:b.background,opacity:out(f,12,6)}}>{b.tagline}</Text></>;
 }
 return <Stage brand={b} bg={bg} ink={ink} grain={false}>{content}<PrintGrain/></Stage>;
};
