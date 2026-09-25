import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill,openBrowser} from '@remotion/renderer';
import {finalizeAudio} from './finalize-audio.mjs';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'config/template.json'),'utf8'));
const mode=process.argv.includes('--mute')?'mute':process.argv.includes('--sfx')?'sfx':cfg.audio.mode;
if(!['master','sfx','mute'].includes(mode))throw Error('Invalid audio mode');
const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const inputProps={audioMode:mode};
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',{chromiumOptions:{gl:'swiftshader'}});
try {
  const composition=await selectComposition({serveUrl,id:'MarginFast',inputProps,puppeteerInstance:browser});
  if(process.argv.includes('--stills')) {
    fs.mkdirSync(path.join(out,'frames'),{recursive:true});
    const chosen=process.argv.find(v=>v.startsWith('--frames='))?.split('=')[1];
    const frames=chosen?chosen.split(',').map(Number):[60,165,216,360,525,690,795,825,855,888,915,945,960,975,990,1005,1060,1110];
    for(const frame of frames) {
      if(!Number.isInteger(frame)||frame<0||frame>=composition.durationInFrames)throw Error('Invalid frame: '+frame);
      await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,frame,scale:.5,output:path.join(out,'frames',frame+'.png')});
      console.log('Frame '+frame);
    }
  } else {
    const movie=path.join(out,mode==='master'?'margin.mp4':mode==='sfx'?'margin-sfx.mp4':'margin-mute.mp4');
    let last=-1;
    await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,codec:'h264',crf:17,pixelFormat:'yuv420p',muted:true,concurrency:Number(process.env.RENDER_CONCURRENCY)||2,outputLocation:movie,onProgress:({progress})=>{
      const step=Math.floor(progress*10);if(step>last){last=step;console.log('Render '+step*10+'%');}
    }});
    await finalizeAudio({root,movie,mode});
    console.log('Complete: '+path.relative(root,movie));
  }
} finally {await browser.close({silent:true});}
