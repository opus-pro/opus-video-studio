import {bundle} from '@remotion/bundler';
import {finalizeAudio} from './finalize-audio.mjs';
import {selectComposition,renderMedia,renderStill,openBrowser} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const openingOnly=process.argv.includes('--opening-only');
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',{chromiumOptions:{gl:'swiftshader'}});
try{
 const composition=await selectComposition({serveUrl,id:'Companion',puppeteerInstance:browser});
 if(process.argv.includes('--stills')){
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  for(const frame of (process.argv.find(v=>v.startsWith("--frames="))?.split("=")[1].split(",").map(Number) || [6,40,82,88,95,149,251,334,375,410,449,470,489,514,551,574,608,620,629,663,700,741,767,823,839,899])){
   if(fs.existsSync(path.join(out,'frames',frame+'.png')))continue;
   await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,scale:.5,output:path.join(out,'frames',frame+'.png')});
   console.log('Frame '+frame);
  }
 }else{
  let previous=-1;
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',crf:18,pixelFormat:'yuv420p',audioCodec:'aac',audioBitrate:'256k',muted:openingOnly,frameRange:openingOnly?[0,212]:undefined,outputLocation:path.join(out,openingOnly?'opening.mp4':'companion.mp4'),concurrency:Number(process.env.RENDER_CONCURRENCY)||2,onProgress:({progress})=>{const step=Math.floor(progress*10);if(step>previous){previous=step;console.log('Render '+step*10+'%');}}});
  if(!openingOnly)await finalizeAudio();
 }
}finally{await browser.close({silent:true});}
