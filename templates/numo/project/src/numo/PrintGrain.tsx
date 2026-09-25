import React from 'react';
import {Img,staticFile} from 'remotion';

// Fixed paper grain: neutralize the existing light texture before blending.
// Keeping its seed and position fixed avoids sparkling noise during fast cuts.
export const PrintGrain:React.FC<{strength?:number}>=({strength=.48})=><Img
 src={staticFile('grain.png')}
 style={{position:'absolute',inset:0,width:'100%',height:'100%',
  filter:'brightness(0.572) contrast(4)',mixBlendMode:'soft-light',opacity:strength,
  pointerEvents:'none',zIndex:40}}
/>;
