import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const cfg=read('config/brand.json'),t=read('config/timeline.json');
if(t.fps!==60||t.durationInFrames!==900)throw Error('Baseline motion uses 900 frames at 60 fps; retime scenes and audio together.');
if(t.cutFrames[0]!==0||t.cutFrames.at(-1)!==t.durationInFrames||t.cutFrames.length!==19||t.cutFrames.some((v,i)=>!Number.isInteger(v)||(i>0&&v<=t.cutFrames[i-1])))throw Error('Invalid cutFrames');
if(!['master','mute'].includes(cfg.audio.mode))throw Error('audio.mode must be master or mute');
for(const p of [cfg.audio.master,'grain.png','fonts/GeistVF.woff2','fonts/InstrumentSerif-Regular.ttf']){
 if(path.isAbsolute(p)||p.split(/[\\/]/).includes('..')||!fs.existsSync(path.join(root,'public',p)))throw Error('Missing or invalid local asset: '+p);
}
for(const value of Object.values(cfg.palette))if(!/^#[0-9a-fA-F]{6}$/.test(value))throw Error('Use six-digit hex colors');
console.log('TOVO Lite: local assets and 15-second timeline verified.');
