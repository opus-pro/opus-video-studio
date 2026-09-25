import React,{useId} from 'react';
import {a,m,mix,motionBlur} from './motion';
export function StoryWorld({f=635,variant=0}:{f?:number;variant?:number}){
 const uid=useId().replace(/:/g,''),sample=(q:number)=>({x:mix(-850,280,a(q,625,638))+(q>638?(q-638)*2:0)}),train=sample(f).x,blur=motionBlur(f,sample,400,15);
 const palettes=[['#102e39','#287568','#e4ba85'],['#193855','#567eb3','#f4dca4'],['#402742','#965f87','#eed3a0'],['#173e39','#539e86','#ffe3b0']];
 const p=palettes[variant%4];
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{display:'block'}}>
  <defs>
   <filter id={uid+'motion'} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={blur+' '+blur*.18}/></filter>
   <linearGradient id={uid+'sky'} x2="0" y2="1"><stop stopColor={p[0]}/><stop offset="1" stopColor={p[1]}/></linearGradient>
   <radialGradient id={uid+'halo'}><stop stopColor="#fff9d6" stopOpacity=".5"/><stop offset="1" stopColor="#fff9d6" stopOpacity="0"/></radialGradient>
   <linearGradient id={uid+'moon'} x2=".6" y2="1"><stop stopColor="#fffef1"/><stop offset=".5" stopColor="#f8ead0"/><stop offset="1" stopColor="#d2c7b0"/></linearGradient>
   <linearGradient id={uid+'train'} x2="0" y2="1"><stop stopColor="#a8d8c0"/><stop offset=".18" stopColor="#f5ead0"/><stop offset=".4" stopColor="#74afa0"/><stop offset="1" stopColor="#295d57"/></linearGradient>
   <linearGradient id={uid+'window'} x2=".3" y2="1"><stop stopColor="#fffce6"/><stop offset="1" stopColor={p[2]}/></linearGradient>
   <filter id={uid+'blur'} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  <rect width="1920" height="1080" fill={'url(#'+uid+'sky)'}/>
  <ellipse cx="1485" cy="306" rx="390" ry="380" fill={'url(#'+uid+'halo)'}/>
  {Array.from({length:63},(_,i)=><circle key={i} cx={35+(i*271)%1860} cy={40+(i*113)%640} r={i%7===0?2.8:1.5} fill="#fff" opacity={.18+(i%5)*.1}/>)}
  <circle cx="1485" cy="306" r="184" fill={'url(#'+uid+'moon)'}/>
  <ellipse cx="1450" cy="275" rx="130" ry="120" fill="#ffffff44"/>
  <circle cx="1540" cy="342" r="24" fill="#bbbaa532"/><circle cx="1470" cy="365" r="16" fill="#bbbaa522"/>
  <path d="M0 850C240 650 455 834 715 791C974 658 1226 741 1459 749C1633 639 1740 740 1920 696V1080H0Z" fill="#badad329"/>
  <path d="M0 960C397 703 950 944 1200 895C1519 686 1615 849 1920 809V1080H0Z" fill="#d4efdf1c"/>
  <path d="M-100 1010C500 861 1117 833 2020 703" stroke="#e7d0a3" strokeWidth="9" fill="none"/>
  <path d="M-100 1043C500 892 1117 867 2020 733" stroke="#bfcaba" strokeWidth="4" fill="none"/>
  <path d="M-100 1043C500 892 1117 867 2020 733" stroke="#89b6a1" strokeWidth="65" fill="none" strokeDasharray="6 27" opacity=".3"/>
  <g transform={'translate('+train+' 630) rotate(-5)'} filter={'url(#'+uid+'motion)'}>
   <ellipse cx="523" cy="242" rx="490" ry="26" fill="#112728" opacity=".6" filter={'url(#'+uid+'blur)'}/>
   {[0,1,2].map(i=><g key={i} transform={'translate('+(i*336)+' 0)'}>
    <rect x="0" y="64" width="321" height="162" rx={i===2?55:24} fill={'url(#'+uid+'train)'} stroke="#daf1e080" strokeWidth="3"/>
    <path d="M26 65C57 32 270 32 296 65" fill="#305c57" stroke="#b5dcca" strokeWidth="5"/>
    {[0,1,2].map(j=><rect key={j} x={30+j*84} y="88" width="62" height="81" rx="19" fill={'url(#'+uid+'window)'}/>)}
    <path d="M18 186H300" stroke="#e8d7b4" strokeWidth="6"/>
    <circle cx="73" cy="228" r="27" fill="#173f40" stroke="#8faea0" strokeWidth="7"/>
    <circle cx="250" cy="228" r="27" fill="#173f40" stroke="#8faea0" strokeWidth="7"/>
   </g>)}
   <ellipse cx="1000" cy="142" rx="20" ry="23" fill="#fff4c8"/>
   <path d="M1020 132L1300 20V280L1020 158Z" fill="#fff8c717"/>
  </g>
 </svg>;
}
