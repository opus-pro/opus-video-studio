import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill, openBrowser} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {finalizeAudio} from './finalize-audio.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'swiftshader'}});
try {
  const composition = await selectComposition({serveUrl, id: 'AIResearch', puppeteerInstance: browser});
  if (process.argv.includes('--stills')) {
    const selected = process.argv.find(v => v.startsWith('--frames='));
    const frames = selected ? selected.slice(9).split(',').map(Number) : [12, 62, 103, 162, 236, 293, 382, 455, 533, 567];
    fs.mkdirSync(path.join(root, 'dist/frames'), {recursive: true});
    for (const frame of frames) {
      if (!Number.isInteger(frame) || frame < 0 || frame >= composition.durationInFrames) throw new Error('Invalid frame: ' + frame);
      await renderStill({serveUrl, composition, puppeteerInstance: browser, frame, scale: .5,
        output: path.join(root, 'dist/frames', frame + '.png')});
      console.log('Frame ' + frame);
    }
  } else {
    const output = path.join(root, 'dist', process.argv.includes('--preview') ? 'trace-preview.mp4' : 'trace.mp4');
    const silent = output + '.silent.rendering.mp4';
    const temporary = output + '.rendering.mp4';
    fs.mkdirSync(path.dirname(output), {recursive: true});
    let last = -1;
    await renderMedia({serveUrl, composition, puppeteerInstance: browser, codec: 'h264', crf: 18,
      pixelFormat: 'yuv420p', muted: true, scale: process.argv.includes('--preview') ? 2/3 : 1,
      concurrency: Number(process.env.RENDER_CONCURRENCY) || 2, outputLocation: silent,
      onProgress: ({progress}) => {const step = Math.floor(progress * 20); if (step > last) {last = step; console.log(step * 5 + '%');}},
    });
    await finalizeAudio({root, video: silent, output: temporary});
    fs.renameSync(temporary, output);
    console.log('Saved: ' + path.relative(root, output));
  }
} finally { await browser.close({silent: true}); }
