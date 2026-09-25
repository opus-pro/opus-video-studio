import React from 'react';
import {Brand,task} from '../design';
import {Box,Cursor,out,snap,Stage,Text,Rule} from '../shared';
import {interpolateColors} from 'remotion';
import {AppFrame,Surface,UText,Icon,Button,Avatar,uiInk} from './ui';

const Task:React.FC<{b:Brand;owner?:boolean;due?:boolean;compact?:boolean}>=({b,owner=true,due=true,compact=false})=>{
 if(compact)return <Surface w={396} h={318} style={{padding:28}}><Box x={28} y={30} style={{display:'flex',gap:14,alignItems:'center'}}><Icon name="tasks"/><Icon name="more" style={{marginLeft:270}}/></Box><UText x={28} y={85} size={70} weight={590}>{task.title}</UText><Box x={27} y={186} style={{display:'flex',gap:17,alignItems:'center'}}><Avatar b={b}/><span style={{fontSize:56,letterSpacing:'-.04em'}}>{task.owner}</span></Box><Box x={34} y={263} style={{display:'flex',gap:20,alignItems:'center'}}><Icon name="calendar" size={34}/><span style={{fontSize:48,letterSpacing:'-.035em'}}>{task.due}</span></Box></Surface>;
 return <Surface w={928} h={448} style={{boxShadow:'0 10px 30px #25151e12'}}><Box x={40} y={30} style={{display:'flex',gap:14,alignItems:'center'}}><Icon name="tasks"/><div style={{width:12,height:12,borderRadius:20,background:b.accent}}/></Box><Box x={842} y={29}><Icon name="more"/></Box><UText x={39} y={110} size={91} weight={590}>{task.title}</UText><Box x={40} y={236} w={848} h={1} style={{background:'#25151e18'}}/>
 <Box x={39} y={276} w={385} h={94} style={{border:'1.5px solid #29252b25',borderRadius:12,display:'flex',gap:22,alignItems:'center',padding:'0 22px',background:owner?'#FFF8F9':'#FBFAF9'}}><Avatar b={b}/>{owner?<span style={{fontSize:60,letterSpacing:'-.04em'}}>{task.owner}</span>:<Icon name="plus" size={40}/>}<Icon name="chevron" size={27} style={{marginLeft:'auto',rotate:'90deg'}}/></Box>
 <Box x={450} y={276} w={438} h={94} style={{border:'1.5px solid #29252b25',borderRadius:12,display:'flex',gap:24,alignItems:'center',padding:'0 23px',background:due?'#FFF8F9':'#FBFAF9'}}><Icon name="calendar" size={42}/>{due?<span style={{fontSize:60,letterSpacing:'-.04em'}}>{task.due}</span>:<Icon name="plus" size={40}/>}<Icon name="chevron" size={27} style={{marginLeft:'auto',rotate:'90deg'}}/></Box></Surface>;
};
export const tovoUiShots=[4,5,7,8,9,11,12,13,14];
export const TovoWeb:React.FC<{shot:number;f:number;b:Brand}>=({shot,f,b})=>{
 const p=out(f,16);let content:React.ReactNode;
 // Carry the same owner avatar across the 5.633 s cut; the next shot no longer
 // remounts a zero-scale spring after the app disappears.
 if(shot===8||(shot===7&&f>=36)){
  const q=shot===8?1:out(f,13,36), reveal=shot===8?1:out(f,9,40);
  const x=274+(79-274)*q,y=466+(254-466)*q,size=54+(205-54)*q;
  return <Stage brand={b}>
   {shot===7&&<Box w={1280} h={720} style={{opacity:1-q}}><AppFrame b={b} f={100} title="Tasks" active="tasks"><Box x={87} y={52}><Task b={b} owner={false} due={false}/></Box></AppFrame></Box>}
   <Box x={x} y={y} w={size} h={size} style={{borderRadius:150,background:interpolateColors(q,[0,1],[b.paper,b.accent]),display:'grid',placeItems:'center',color:b.ink}}>
    <Box style={{inset:0,display:'grid',placeItems:'center',opacity:1-reveal}}><Icon name="user" size={size*.56}/></Box>
    <span style={{fontSize:135*(size/205),fontWeight:740,opacity:reveal}}>{task.owner.charAt(0)}</span>
   </Box>
   <Text x={337+(1-reveal)*70} y={226} size={230} weight={670} style={{opacity:reveal}}>{task.owner}</Text>
   <Rule x={86} y={526} w={1110} opacity={reveal}/>
  </Stage>;
 }
 if(shot===4||shot===5)return <AppFrame b={b} f={shot===5?f+63:f} title="Meeting" active="mic" camera={shot===5?1+.045*out(f,12):1}>
 <Box x={32} y={27} style={{display:'flex',gap:14,alignItems:'center'}}><Avatar b={b}/><Box x={77} y={7} style={{display:'flex',gap:6,alignItems:'center',height:40}}>{Array.from({length:35},(_,i)=><div key={i} style={{width:5,height:10+22*Math.abs(Math.sin(i*.67+(f+(shot===5?63:0))*.17)),background:b.accent,borderRadius:8}}/>)}</Box></Box>
 <Surface x={30} y={112} w={1040} h={270}><UText x={39} y={49} size={79} weight={510}><span style={{background:b.paper,borderRadius:6,padding:'0 9px'}}>{task.owner},</span> {task.action}<br/>by <span style={{background:shot===5?b.paper:'transparent',borderRadius:6,padding:'0 8px'}}>{task.due}.</span></UText><Box x={978} y={25}><Icon name="more"/></Box></Surface>
 <Button b={b} x={744} y={423} w={326} h={87} icon="tasks" pressed={shot===5&&f>10&&f<18}>Extract</Button>{shot===5&&<Cursor x={983} y={462} f={f} click={12} color={b.ink}/>}</AppFrame>;
 if(shot===7||shot===9||shot===12){
 content=<><Box x={87} y={52} style={{scale:shot===12?.93+.07*snap(f):1,transformOrigin:'center center'}}><Task b={b} owner={shot!==7} due={shot===12}/></Box>{shot===9&&<><Surface x={493} y={182+(1-p)*65} w={500} h={240} style={{boxShadow:'0 18px 55px #25151e30',borderColor:`${b.accent}88`}}><Box x={29} y={29} style={{display:'flex',alignItems:'center',gap:23}}><Icon name="search" size={38}/><UText x={64} y={-9} size={58}>{task.owner}</UText></Box><Box x={18} y={106} w={462} h={106} style={{background:b.paper,borderRadius:9,display:'flex',alignItems:'center',gap:24,padding:'0 20px'}}><Avatar b={b} size={60}/><span style={{fontSize:62,letterSpacing:'-.045em'}}>{task.owner}</span><Icon name="check" size={35} style={{marginLeft:'auto'}}/></Box></Surface><Cursor x={911} y={340} f={f} click={12}/></>}{shot===12&&<Box x={938} y={55} w={64} h={64} style={{borderRadius:100,background:b.accent,color:'white',display:'grid',placeItems:'center',scale:snap(f,3)}}><Icon name="check" size={38}/></Box>}</>;
 }else if(shot===11){content=<><Surface x={31} y={30} w={603} h={492} style={{boxShadow:'0 12px 24px #25151e15'}}><Box x={36} y={31}><Icon name="calendar" size={47}/></Box><UText x={108} y={20} size={69}>{task.due}</UText><Box x={36} y={120} style={{display:'grid',gridTemplateColumns:'repeat(3,165px)',gap:15}}>{['WED','THU','FRI'].map((d,i)=><div key={d} style={{fontSize:48,letterSpacing:'-.04em',textAlign:'center',color:i===2?b.accent:'#9A9294'}}>{d}</div>)}{['09','10','11','16','17','18'].map((d,i)=><div key={d} style={{height:112,borderRadius:14,border:i===2?'none':'1px solid #29252b18',background:i===2?b.accent:'#FCFAF9',color:i===2?'#fff':b.ink,display:'grid',placeItems:'center',fontSize:72,fontWeight:500,scale:i===2?.95+.05*snap(f):1}}>{d}</div>)}</Box></Surface><UText x={692} y={125} size={83} weight={590} w={375}>Send<br/>deck</UText><Box x={685} y={348} w={372} h={101} style={{background:'#fff',border:'1.5px solid #29252b25',borderRadius:12,display:'flex',alignItems:'center',gap:24,padding:'0 22px'}}><Icon name="calendar" size={41}/><span style={{fontSize:58,letterSpacing:'-.04em'}}>{task.due}</span></Box><Cursor x={510} y={269} f={f} click={12}/></>;
 }else if(shot===13){content=<>{['To do','Doing','Done'].map((label,i)=><Box key={label} x={24+[0,436,758][i]} y={28} w={[414,300,300][i]} h={502} style={{background:'#EEECEA',border:'1px solid #2c1c2910',borderRadius:12}}><Box x={23} y={24} style={{display:'flex',gap:14,alignItems:'center'}}><div style={{width:13,height:13,borderRadius:20,background:[b.accent,'#C9AD60','#6E9B86'][i]}}/><span style={{fontSize:48,fontWeight:560,letterSpacing:'-.045em'}}>{label}</span></Box><Box x={i===0?353:240} y={34}><Icon name="plus" size={28}/></Box>{i===0&&<Box x={9+(1-p)*190} y={115-(1-p)*55} style={{scale:.97+.03*p,transformOrigin:'top left'}}><Task b={b} compact/></Box>}</Box>)}</>;
 }else{content=<><Box x={28} y={99}><Task b={b} compact/></Box><Box x={439} y={267} w={108*p} h={2} style={{background:b.accent}}/><Box x={461} y={238} style={{color:b.accent}}><Icon name="link" size={54}/></Box><Surface x={548+(1-p)*140} y={65} w={523} h={429} style={{borderColor:`${b.accent}55`}}><Box x={31} y={27} style={{color:b.accent}}><Icon name="mic" size={42}/></Box><UText x={31} y={121} size={67} w={463} weight={470}>“{task.owner},<br/>{task.action}<br/>by {task.due}.”</UText></Surface></>}
 return <AppFrame b={b} f={f} title={shot===14?'Source':'Tasks'} active="tasks">{content}</AppFrame>;
};
