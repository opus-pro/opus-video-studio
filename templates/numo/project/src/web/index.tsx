import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Brand} from '../design';
import {NumoOptical} from '../numo/Optical';
import {NumoWeb,numoUiShots} from './NumoWeb';
export const WebShot:React.FC<{shot:number;brand:Brand}>=({shot,brand})=>{
 const f=useCurrentFrame();
 return numoUiShots.includes(shot)?<NumoWeb shot={shot} f={f} b={brand}/>:<NumoOptical shot={shot} f={f} b={brand}/>;
};
