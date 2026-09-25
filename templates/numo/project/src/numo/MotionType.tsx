import React from 'react';
import {Brand} from '../design';
import {Text,out} from '../shared';

type Props=React.ComponentProps<typeof Text>&{b:Brand;f:number;delay?:number;dx?:number;dy?:number;light?:boolean};
export const MotionType:React.FC<Props>=({b,f,delay=0,dx=0,dy=52,light=false,style,...props})=>{
 const t=Math.max(0,f-delay);
 const settle=out(t,25);
 const focus=Math.pow(Math.max(0,1-t/15),2);
 const offset=2.25+11*(1-out(t,23));
 const pink=light?'#A46294':'#CE84AB';
 const second=light?b.paper:b.accent;
 return <Text {...props} style={{...style,
  translate:`${dx*(1-settle)}px ${dy*(1-settle)}px`,
  filter:`blur(${15*focus}px)`,
  textShadow:`${-offset*.65}px ${offset*.15}px ${focus*4}px ${pink},${offset}px ${offset*.55}px ${focus*3}px ${second}`,
 }}/>
};
