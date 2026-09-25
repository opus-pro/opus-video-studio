import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill,openBrowser,RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const args=process.argv.slice(2);
const value=(name)=>args.find(a=>a.startsWith(`--${name}=`))?.split('=')[1];
const scale=Number(value('scale')??1);
if(!Number.isFinite(scale)||scale<=0||scale>1)throw new Error('--scale must be greater than 0 and no larger than 1.');
const concurrency=Number(process.env.RENDER_CONCURRENCY??4);
if(!Number.isInteger(concurrency)||concurrency<1)throw new Error('RENDER_CONCURRENCY must be a positive integer.');
const frameRange=value('range')?.split('-').map(Number);
const frames=value('frames')?.split(',').map(Number);
const stills=args.includes('--stills')||Boolean(frames);
fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome');
try{
 const composition=await selectComposition({serveUrl,id:'AIAgentRecreation',puppeteerInstance:browser});
 const valid=(f)=>Number.isInteger(f)&&f>=0&&f<composition.durationInFrames;
 if(frameRange&&(frameRange.length!==2||frameRange.some(f=>!valid(f))||frameRange[0]>frameRange[1]))throw new Error(`Invalid inclusive --range; frames must be 0-${composition.durationInFrames-1}.`);
 if(frames?.some(f=>!valid(f)))throw new Error(`Invalid --frames; frames must be 0-${composition.durationInFrames-1}.`);
 if(stills){
  const list=frames??[96,222,360,600,810,1004,1090,1200,1370,1580];
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  for(const frame of list){
   await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,scale,output:path.join(out,'frames',`${frame}.png`)});
   console.log(`Frame ${frame}`);
  }
 }else{
  const file=frameRange?`segment-${frameRange[0]}-${frameRange[1]}.mp4`:'aiagent.mp4';
  const destination=path.join(out,file);
  const picture=frameRange?destination:path.join(out,'.aiagent-picture.mp4');
  let last=-1;
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',crf:17,scale,pixelFormat:'yuv420p',muted:!frameRange,frameRange,concurrency,outputLocation:picture,onProgress:({progress})=>{
   const percent=Math.floor(progress*20)*5;if(percent!==last){last=percent;console.log(`Render ${percent}%`);}
  }});
  if(!frameRange){
   // Preserve the approved AAC packets exactly; Remotion supplies FFmpeg.
   await RenderInternals.callFf({bin:'ffmpeg',indent:false,logLevel:'error',binariesDirectory:null,cancelSignal:undefined,args:[
    '-v','error','-y','-i',picture,'-i',path.join(root,'public/reference-audio.m4a'),'-map','0:v:0','-map','1:a:0','-c','copy','-map_metadata','-1','-movflags','+faststart',destination,
   ],options:{stdio:'inherit'}});
   fs.unlinkSync(picture);
  }
  console.log(`Saved ${path.relative(root,destination)}`);
 }
}finally{await browser.close({silent:true})}
