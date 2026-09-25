import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill,openBrowser} from '@remotion/renderer';
import {finalizeAudio} from './finalize-audio.mjs';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',{chromiumOptions:{gl:'swiftshader'}});
try {
 const composition=await selectComposition({serveUrl,id:'CreativeSearch',puppeteerInstance:browser});
 if(process.argv.includes('--stills')) {
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  const chosen=process.argv.find(v=>v.startsWith('--frames='))?.split('=')[1];
  const frames=chosen?chosen.split(',').map(Number):[118,177,236,354,472,767,826,885,944,1003,1062,1121,1180,1225,1356];
  for(const frame of frames) {
   if(!Number.isInteger(frame)||frame<0||frame>=composition.durationInFrames)throw Error('Invalid frame: '+frame);
   await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,scale:.5,output:path.join(out,'frames',frame+'.png')});
   console.log('Frame '+frame);
  }
 } else {
  let last=-1;
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',crf:16,pixelFormat:'yuv420p',muted:true,concurrency:Number(process.env.RENDER_CONCURRENCY)||2,outputLocation:path.join(out,'creative-search.mp4'),onProgress:({progress})=>{const step=Math.floor(progress*10);if(step>last){last=step;console.log('Render '+step*10+'%')}}});
  await finalizeAudio();
  console.log('Complete: dist/creative-search.mp4');
 }
} finally { await browser.close({silent:true}); }
