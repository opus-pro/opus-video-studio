import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'template.json'), 'utf8'));
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const stills = args.includes('--stills');
const scale = preview ? config.preview.width / config.width : 1;
const output = path.join(root, 'out');
await mkdir(output, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
const browser = await openBrowser('chrome', {
  browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || undefined,
});
try {
  const composition = await selectComposition({serveUrl, id: config.compositionId, puppeteerInstance: browser});
  for (const [key, expected] of Object.entries({width: config.width, height: config.height, fps: config.fps, durationInFrames: config.frames})) {
    if (composition[key] !== expected) throw new Error(`Composition ${key} differs from template.json: ${composition[key]} / ${expected}`);
  }
  const frames = [...new Set([0, Math.floor(config.frames / 3), Math.floor(config.frames * 2 / 3), config.frames - 1])];
  if (stills) {
    for (const frame of frames) {
      await renderStill({serveUrl, composition, puppeteerInstance: browser, frame, scale,
        imageFormat: 'png', output: path.join(output, `frame-${frame}.png`)});
    }
  } else {
    await renderMedia({serveUrl, composition, puppeteerInstance: browser, codec: 'h264',
      imageFormat: 'png', pixelFormat: 'yuv420p', colorSpace: 'bt709', crf: 16,
      muted: true, enforceAudioTrack: false, scale, concurrency: 2,
      outputLocation: path.join(output, `${config.compositionId}.mp4`),
      ffmpegOverride: ({args: ffmpegArgs}) => [...ffmpegArgs.slice(0, -1), '-color_range', 'tv',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', ffmpegArgs.at(-1)],
    });
  }
  await writeFile(path.join(output, 'render-report.json'), JSON.stringify({
    compositionId: config.compositionId, sourceVersion: config.version,
    width: Math.round(config.width * scale), height: Math.round(config.height * scale),
    fps: config.fps, frames: config.frames, durationSeconds: config.frames / config.fps,
    audio: 'intentionally silent component', kind: stills ? 'sampled stills' : 'complete MP4',
    fullPlaybackReviewed: false,
  }, null, 2) + '\n');
  console.log(`${config.compositionId}: ${stills ? 'stills' : 'MP4'} rendered`);
} finally {
  await browser.close({silent: true});
}
// The bundler's background workers may retain handles after the completed export.
process.exit(0);
