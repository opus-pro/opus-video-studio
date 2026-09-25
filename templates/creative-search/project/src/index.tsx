import React from 'react';
import {AbsoluteFill,Audio,Composition,registerRoot,Sequence,staticFile} from 'remotion';
import config from '../config/template.json';
import {Opening} from './Opening';import {Search} from './Search';import {Results} from './Results';import {Outro} from './Outro';import {Refine} from './Refine';import {Finale} from './Finale';
import {SHOTS} from './BeatTiming';
const openD=SHOTS.search,searchD=SHOTS.refine-SHOTS.search,refineD=SHOTS.results-SHOTS.refine;
const CreativeSearch:React.FC<{sound:boolean}>=({sound})=><AbsoluteFill style={{background:config.background,fontFamily:'Helvetica Neue, Helvetica, Arial, sans-serif',color:config.ink,overflow:'hidden'}}>
<Sequence from={0} durationInFrames={openD} name="01 Toolbar → light strip → Ask AI"><Opening speed={300/openD}/></Sequence>
<Sequence from={SHOTS.search} durationInFrames={searchD} name="02 Question → formats → searching"><Search speed={231/searchD}/></Sequence>
<Sequence from={SHOTS.refine} durationInFrames={refineD} name="03 Describe what you remember"><Refine duration={refineD}/></Sequence>
<Sequence from={SHOTS.results} durationInFrames={SHOTS.explore-SHOTS.results} name="04 Found creative files"><Results hold/></Sequence>
<Sequence from={SHOTS.explore} durationInFrames={SHOTS.outro-SHOTS.explore} name="05 Continuous card → open → creating"><Finale duration={SHOTS.outro-SHOTS.explore}/></Sequence>
<Sequence from={SHOTS.outro} durationInFrames={SHOTS.end-SHOTS.outro} name="07 Less searching, more creating"><Outro/></Sequence>
{sound&&config.audio.mode==='master'&&<Audio src={staticFile(config.audio.master)}/>}
</AbsoluteFill>;
registerRoot(()=> <Composition id="CreativeSearch" component={CreativeSearch} durationInFrames={SHOTS.end} fps={60} width={1920} height={1080} defaultProps={{sound:true}}/>);
