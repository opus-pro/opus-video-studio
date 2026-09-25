import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
export async function finalizeAudio({root,movie,mode}) {
  if(mode==='mute')return;
  const cfg=JSON.parse(fs.readFileSync(path.join(root,'config/template.json'),'utf8'));
  const master=path.join(root,'public',cfg.audio[mode]);
  const temp=movie.replace(/\.mp4$/,'-mux.mp4');
  await RenderInternals.callFf({
    bin:'ffmpeg',indent:false,logLevel:'error',binariesDirectory:null,cancelSignal:undefined,
    args:['-v','error','-y','-i',movie,'-i',master,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-map_metadata','-1','-movflags','+faststart',temp],
    options:{stdio:'inherit'}
  });
  fs.renameSync(temp,movie);
}
