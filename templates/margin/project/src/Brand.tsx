import React from 'react';
export function Mark({size=34,color='#17191b'}:{size?:number,color?:string}) {
  return <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M7 7V33H33M17 7V23H33" fill="none" stroke={color} strokeWidth="3.5"/>
  </svg>;
}
