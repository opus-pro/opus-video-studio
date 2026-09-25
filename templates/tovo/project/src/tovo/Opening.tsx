import React from 'react';import {Brand,task} from '../design';import {Stage,Box,Text,Rule,Cursor,Mark,Arrow,out,snap} from '../shared';
export const TovoOpening:React.FC<{shot:number;f:number;b:Brand}>=({shot,f,b})=>{
 const p=out(f);let content:React.ReactNode;
 if(shot===0)content=<>
 {[{t:`${task.owner}, ${task.action}`,y:117,c:b.ink,bg:b.accent,dir:-1},{t:`by ${task.due}. Right?`,y:321,c:b.ink,bg:b.paper,dir:1},{t:'Wait, who is doing what?',y:525,c:b.background,bg:b.ink,dir:-1}].map((v,i)=><Box key={i} x={-180+v.dir*f*21} y={v.y} w={1900} h={160} style={{background:v.bg,rotate:i===1?'4deg':'-5deg',padding:'21px 55px',fontSize:123,fontWeight:780,letterSpacing:'-.065em',color:v.c,whiteSpace:'nowrap'}}>{v.t} · {v.t}</Box>)}
 <Box x={1040} y={69} style={{rotate:`${f*6}deg`}}><Mark kind="TOVO" size={97}/></Box></>;
 else if(shot===1)content=<>
 
 <Box x={74} y={246} w={1140} h={240} style={{display:'flex',alignItems:'center',gap:8}}>{Array.from({length:67},(_,i)=><div key={i} style={{width:9,background:i%9===0?b.accent:b.ink,height:6+(1-p)*(30+160*Math.abs(Math.sin(i*.37)*Math.cos(i*.8))),borderRadius:20}}/>)}</Box>
 </>;
 else if(shot===2)content=<>
 {[{t:task.owner,x:80,y:121,w:550,bg:b.accent,r:-5},{t:task.action,x:199,y:312,w:950,bg:b.paper,r:3},{t:task.due,x:759,y:512,w:420,bg:b.ink,r:-4}].map((v,i)=><Box key={i} x={v.x} y={v.y+(1-snap(f,i*3))*130} w={v.w} h={133} style={{background:v.bg,color:i===2?b.background:b.ink,rotate:`${v.r}deg`,padding:'12px 29px',fontSize:106,fontWeight:760,letterSpacing:'-.065em'}}>{v.t}</Box>)}
 </>;
 else if(shot===3)content=<>
 <Text x={69} y={118} size={205} weight={850} style={{letterSpacing:'-.082em',translate:`${-45*(1-p)}px 0`}}>WHO DOES</Text>
 <Text x={70} y={329} size={247} weight={850} style={{letterSpacing:'-.085em',translate:`${65*(1-p)}px 0`}}>WHAT<span style={{color:b.accent}}>?</span></Text>
 <Box x={940+(1-p)*350} y={514} w={275} h={80} style={{background:b.paper,rotate:'-7deg',display:'grid',placeItems:'center'}}><Arrow size={57}/></Box></>;
 else if(shot===4)content=<>
 <Rule x={90} y={178} w={1100}/>
 <Box x={87} y={243} w={1100} style={{fontSize:103,fontWeight:650,lineHeight:1.13,letterSpacing:'-.065em',translate:`0 ${(1-p)*70}px`}}><span style={{background:b.accent,padding:'0 14px'}}>{task.owner},</span> {task.action}<br/>by <span style={{fontFamily:'Instrument',fontSize:129}}>{task.due}.</span></Box>
 <Box x={1095} y={559}><Arrow size={70}/></Box></>;
 else content=<>
 
 <Box x={96} y={251} w={1090} h={236} style={{background:b.ink,color:b.background,scale:1-.025*Math.sin(out(f,12)*Math.PI),display:'flex',alignItems:'center',padding:'0 54px',gap:46}}><Mark kind="TOVO" size={110}/><span style={{fontSize:132,fontWeight:690,letterSpacing:'-.065em'}}>Extract</span><Box x={899} y={87}><Arrow size={64}/></Box></Box>
 <Cursor x={975} y={385} f={f}/></>;
 return <Stage brand={b} >{content}</Stage>;
};
