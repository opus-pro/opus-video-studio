import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const cfg=read('config/brand.json'),t=read('config/timeline.json');
if(t.fps!==60||t.durationInFrames!==900||t.bpm!==144||t.width!==1920||t.height!==1080)throw Error('Baseline uses 1920×1080, 900 frames, 60 fps and 144 BPM. Retime scenes and sound together before changing these.');
if(t.cutFrames[0]!==0||t.cutFrames.at(-1)!==t.durationInFrames||t.cutFrames.length!==19||t.cutFrames.some((v,i)=>!Number.isInteger(v)||(i>0&&v<=t.cutFrames[i-1])))throw Error('Invalid cutFrames');
if(t.cutFrames.some((v,i)=>v!==Math.round(t.cutBeats[i]*60/t.bpm*t.fps)))throw Error('cutBeats and cutFrames differ');
if(!['master','music','sfx','mute'].includes(cfg.audio.mode))throw Error('audio.mode must be master, music, sfx or mute');
for(const p of [cfg.audio.master,cfg.audio.music,cfg.audio.sfx,'grain.png','fonts/GeistVF.woff2','fonts/InstrumentSerif-Regular.ttf']){
 if(path.isAbsolute(p)||p.split(/[\\/]/).includes('..')||!fs.existsSync(path.join(root,'public',p)))throw Error('Missing or invalid local asset: '+p);
}
for(const value of Object.values(cfg.palette))if(!/^#[0-9a-fA-F]{6}$/.test(value))throw Error('Use six-digit hex colors');
for(const key of ['name','tagline'])if(typeof cfg.product[key]!=='string'||!cfg.product[key].trim())throw Error('Missing product '+key);
if(cfg.story.sources.length!==3||cfg.story.devices.length!==2||cfg.story.question.length!==2)throw Error('This layout expects 3 sources, 2 device groups and 2 question lines.');
if(!Number.isFinite(cfg.story.rows)||cfg.story.rows<=0||cfg.story.revenue.before<=0)throw Error('Invalid story numbers');
console.log('NUMO Lite: local assets, brand configuration and 15-second timeline verified.');
