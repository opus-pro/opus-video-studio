import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Usage: node scripts/render.mjs                 -> out/<id>.mp4 (full composition)
//        node scripts/render.mjs --stills        -> out/frame-<n>.png at 0, 1/3, 2/3, last
//        node scripts/render.mjs --frames=0,90,180 -> out/frame-<n>.png for those frames
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'template.json'), 'utf8'));
const args = process.argv.slice(2);
const framesArg = args.find((a) => a.startsWith('--frames='));
const stills = args.includes('--stills') || Boolean(framesArg);
const output = path.join(root, 'out');
await mkdir(output, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
// WebGL: the default headless GL backend exposes no WebGL context on this machine,
// so ThreeCanvas needs ANGLE (override with REMOTION_GL=swangle for software GL).
const browser = await openBrowser('chrome', {chromiumOptions: {gl: process.env.REMOTION_GL || 'angle'}});
try {
  const composition = await selectComposition({serveUrl, id: config.compositionId, puppeteerInstance: browser});
  for (const [key, expected] of Object.entries({width: config.width, height: config.height, fps: config.fps, durationInFrames: config.frames})) {
    if (composition[key] !== expected) throw new Error(`Composition ${key} differs from template.json: ${composition[key]} / ${expected}`);
  }
  if (stills) {
    const frames = framesArg
      ? framesArg.slice(9).split(',').map(Number).filter((f) => Number.isInteger(f) && f >= 0 && f < config.frames)
      : [...new Set([0, Math.floor(config.frames / 3), Math.floor(config.frames * 2 / 3), config.frames - 1])];
    for (const frame of frames) {
      await renderStill({serveUrl, composition, puppeteerInstance: browser, frame, imageFormat: 'png',
        output: path.join(output, `frame-${frame}.png`)});
    }
    console.log(`stills: ${frames.join(', ')}`);
  } else {
    await renderMedia({serveUrl, composition, puppeteerInstance: browser, codec: 'h264', imageFormat: 'png',
      pixelFormat: 'yuv420p', crf: 16, muted: true, enforceAudioTrack: false, concurrency: 4,
      outputLocation: path.join(output, `${config.compositionId}.mp4`)});
    console.log(`video: out/${config.compositionId}.mp4`);
  }
} finally {
  await browser.close({silent: true});
  // bundle() leaves a copy of public/ in the OS temp dir on every run; remove it.
  await rm(serveUrl, {recursive: true, force: true});
}
process.exit(0);
