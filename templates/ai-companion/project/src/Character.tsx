import React,{useId} from 'react';
import {Img,staticFile} from 'remotion';
import brand from '../config/brand.json';
// Original procedural characters. Optional image replaces the illustration, retaining glass and motion.
const palettes=[['#fff8d7','#ffc66c','#da7840'],['#eaffdf','#9ee594','#42836c'],['#f6e6ff','#d4a7f2','#8263b6'],['#ffe6ea','#ff9dae','#bd5a83'],['#e3f8ff','#80ccec','#3e7ead'],['#fff1d9','#e6ad8c','#986856']];
export function Character({id=0,size=300,turn=0,talk=0,blink=false,image}:{id?:number,size?:number,turn?:number,talk?:number,blink?:boolean,image?:string}){
 image=image||brand.portraits[id%brand.portraits.length]||undefined;
 const uid=useId().replace(/:/g,''),p=palettes[id%palettes.length],shift=turn*7;
 return <div style={{width:size,height:size,borderRadius:'50%',position:'relative',background:'linear-gradient(145deg,#ffffffb8,#eef8ff18 42%,#b4ffe130 76%,#ffffffcb)',padding:size*.055,boxShadow:'inset 0 3px 12px #fff,inset -5px -6px 18px #ffffffb0,0 '+size*.065+'px '+size*.11+'px #124a4133',border:size*.005+'px solid #f5fffab0'}}>
  <div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',borderRadius:'50%',background:'radial-gradient(circle at 32% 22%,#fffdf8,'+p[0]+' 43%,'+p[1]+' 135%)'}}>
   {image?<Img src={staticFile(image)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<svg viewBox="0 0 300 300" width="100%" height="100%">
    <defs>
     <radialGradient id={uid+'body'} cx="30%" cy="20%" r="86%"><stop stopColor={p[0]}/><stop offset=".38" stopColor={p[1]}/><stop offset=".84" stopColor={p[2]}/><stop offset="1" stopColor={p[1]}/></radialGradient>
     <radialGradient id={uid+'shine'}><stop stopColor="#fff" stopOpacity=".87"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
     <radialGradient id={uid+'cheek'}><stop stopColor="#df756a" stopOpacity=".4"/><stop offset="1" stopColor="#df756a" stopOpacity="0"/></radialGradient>
     <filter id={uid+'shadow'} x="-60%" y="-100%" width="220%" height="300%"><feGaussianBlur stdDeviation="11"/></filter>
    </defs>
    <ellipse cx="159" cy="271" rx="80" ry="14" fill={p[2]} opacity=".35" filter={'url(#'+uid+'shadow)'}/>
    <g transform={'translate('+shift+',0)'}>
     {id%3===0?<path d="M57 176C51 129 73 113 82 91C87 77 83 52 104 45C126 37 133 62 151 66C170 64 177 37 198 44C221 53 212 78 220 96C249 126 254 158 246 198C239 239 201 259 148 258C87 258 62 227 57 176Z" fill={'url(#'+uid+'body)'}/>:id%3===1?<path d="M65 154C38 125 40 93 70 83C85 77 100 85 111 96C135 87 166 87 187 96C201 79 226 76 241 94C255 111 245 141 231 156C249 222 216 260 150 260C84 260 52 221 65 154Z" fill={'url(#'+uid+'body)'}/>:<path d="M54 177C50 145 64 121 85 105C76 77 98 56 118 73C129 51 155 51 164 74C188 60 210 79 209 103C238 119 253 151 247 185C241 231 208 260 150 260C96 260 62 231 54 177Z" fill={'url(#'+uid+'body)'}/>}
     <ellipse cx="108" cy="100" rx="44" ry="54" fill={'url(#'+uid+'shine)'} opacity=".67" transform="rotate(32 108 100)"/>
     <ellipse cx="97" cy="194" rx="30" ry="19" fill={'url(#'+uid+'cheek)'}/><ellipse cx="205" cy="194" rx="30" ry="19" fill={'url(#'+uid+'cheek)'}/>
     {blink?<path d="M107 159Q117 167 128 159M172 159Q182 167 193 159" fill="none" stroke="#263446" strokeWidth="5" strokeLinecap="round"/>:<><ellipse cx={118+shift*.6} cy="163" rx="9" ry="13" fill="#253140"/><ellipse cx={184+shift*.6} cy="163" rx="9" ry="13" fill="#253140"/><circle cx={115+shift*.6} cy="159" r="3.2" fill="#fff9"/><circle cx={181+shift*.6} cy="159" r="3.2" fill="#fff9"/></>}
     {talk>.15?<ellipse cx="152" cy="196" rx={10+talk*5} ry={5+talk*9} fill="#67423b"/>:<path d="M137 190Q151 204 166 190" fill="none" stroke="#67423b" strokeWidth="4" strokeLinecap="round"/>}
    </g>
   </svg>}
  </div>
  <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'radial-gradient(ellipse at 30% 7%,#ffffffa0,transparent 31%)',boxShadow:'inset 0 -5px 9px #ffffff6b',pointerEvents:'none'}}/>
 </div>;
}
