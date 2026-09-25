import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
export async function finalizeAudio({root, video, output}) {
  const audio = JSON.parse(fs.readFileSync(path.join(root, 'config/audio.json'), 'utf8'));
  if (!audio.enabled) { fs.renameSync(video, output); return; }
  const master = path.join(root, 'public', audio.master);
  const codec = path.extname(master).toLowerCase() === '.m4a'
    ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '256k'];
  await RenderInternals.callFf({
    bin: 'ffmpeg', indent: false, logLevel: 'error', binariesDirectory: null,
    cancelSignal: undefined,
    args: ['-v', 'error', '-y', '-i', video, '-i', master, '-map', '0:v:0',
      '-map', '1:a:0', '-c:v', 'copy', ...codec,
      '-map_metadata', '-1', '-movflags', '+faststart', output],
    options: {stdio: 'inherit'},
  });
  fs.unlinkSync(video);
}
