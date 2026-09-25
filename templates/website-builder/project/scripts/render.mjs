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
 const composition=await selectComposition({serveUrl,id:'WebsiteBuilder',puppeteerInstance:browser});
 if(process.argv.includes('--stills')) {
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  const chosen=process.argv.find(v=>v.startsWith('--frames='))?.split('=')[1];
  const frames=chosen?chosen.split(',').map(Number):[38,44,50,56,63,68,95,334,396,446,607,631,758,783,1311,1327,1559];
  for(const frame of frames) {
   if(!Number.isInteger(frame)||frame<0||frame>=composition.durationInFrames)throw Error('Invalid frame: '+frame);
   await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,scale:.5,output:path.join(out,'frames',frame+'.png')});
   console.log('Frame '+frame);
  }
 } else {
  let last=-1;
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',crf:18,pixelFormat:'yuv420p',muted:true,concurrency:Number(process.env.RENDER_CONCURRENCY)||2,outputLocation:path.join(out,'website-builder.mp4'),onProgress:({progress})=>{const step=Math.floor(progress*10);if(step>last){last=step;console.log('Render '+step*10+'%')}}});
  await finalizeAudio();
  console.log('Complete: dist/website-builder.mp4');
 }
} finally { await browser.close({silent:true}); }
