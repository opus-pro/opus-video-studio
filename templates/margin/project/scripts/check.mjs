import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'config/template.json')));
if(!['master','sfx','mute'].includes(cfg.audio.mode))throw Error('Invalid audio mode');
for(const asset of [cfg.audio.master,cfg.audio.sfx,'ocean.jpg','GeistVF.woff2']){
  if(path.isAbsolute(asset)||asset.split(/[\\/]/).includes('..')||!fs.existsSync(path.join(root,'public',asset)))throw Error('Missing local asset: '+asset);
}
const grid=JSON.parse(fs.readFileSync(path.join(root,'config/beat-grid.json')));
if(cfg.canvas.durationInFrames!==1200||cfg.canvas.fps!==60)throw Error('Baseline timing changed: update visual clocks and mixes before exporting');
if(!grid.anchors.every(a=>a.frame===Math.round(a.seconds*60)&&a.frame%15===0))throw Error('Half-beat timing mismatch');
for(const file of fs.readdirSync(path.join(root,'src'))){
  if(file!=='index.tsx'&&/<Audio\b/.test(fs.readFileSync(path.join(root,'src',file),'utf8')))throw Error('Unexpected audio layer in '+file);
}
console.log('Lite checks passed: local assets, one mix layer, 1200-frame baseline and half-beat grid.');
