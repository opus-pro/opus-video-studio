import React from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,staticFile,registerRoot} from 'remotion';
import {FontFace} from './common';
import {timing} from './config';
import {Opening} from './scenes/Opening';
import {TypeSequence} from './scenes/TypeSequence';
import {Voice} from './scenes/Voice';
import {PromptDemo} from './scenes/PromptDemo';
import {Montage} from './scenes/Montage';
import {Claims} from './scenes/Claims';
import {Outro} from './scenes/Outro';

export const Film=()=> <AbsoluteFill style={{background:'#fff'}}>
 <FontFace/>
 <Sequence from={0} durationInFrames={264} name="01 · Code becomes software"><Opening/></Sequence>
 <Sequence from={264} durationInFrames={214} name="02 · Without writing Code"><TypeSequence/></Sequence>
 <Sequence from={478} durationInFrames={230} name="03 · Speak your idea"><Voice/></Sequence>
 <Sequence from={708} durationInFrames={232} name="04 · Build from a prompt"><PromptDemo/></Sequence>
 <Sequence from={940} durationInFrames={118} name="05 · Product canvas"><Montage/></Sequence>
 <Sequence from={1058} durationInFrames={342} name="06 · Simple by design"><Claims/></Sequence>
 <Sequence from={1400} durationInFrames={288} name="07 · Codex"><Outro/></Sequence>
 <Audio src={staticFile('reference-audio.m4a')} volume={1}/>
</AbsoluteFill>;

const Root=()=> <Composition id="AIAgentRecreation" component={Film} width={timing.width} height={timing.height} fps={timing.fps} durationInFrames={timing.duration}/>;
registerRoot(Root);
