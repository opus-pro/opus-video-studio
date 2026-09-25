import React from 'react';import {useCurrentFrame} from 'remotion';
import {Brand} from '../design';import {HeroEnd} from '../shared';
import {TovoOpening} from './Opening';import {TovoExtraction} from './Extraction';import {TovoResult} from './Result';
export const TovoShot:React.FC<{shot:number;brand:Brand}>=({shot,brand})=>{const f=useCurrentFrame();return shot<6?<TovoOpening shot={shot} f={f} b={brand}/>:shot<12?<TovoExtraction shot={shot} f={f} b={brand}/>:shot<17?<TovoResult shot={shot} f={f} b={brand}/>:<HeroEnd brand={brand} f={f}/>};
