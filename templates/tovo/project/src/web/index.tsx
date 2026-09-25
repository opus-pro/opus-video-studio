import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Brand} from '../design';
import {TovoShot} from '../tovo/Tovo';
import {TovoWeb,tovoUiShots} from './TovoWeb';
export const WebShot:React.FC<{shot:number;brand:Brand}>=({shot,brand})=>{
 const f=useCurrentFrame();
 return tovoUiShots.includes(shot)?<TovoWeb shot={shot} f={f} b={brand}/>:<TovoShot shot={shot} brand={brand}/>;
};
