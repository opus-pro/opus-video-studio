import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
  openBrowser,
} from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { finalizeAudio } from "./finalize-audio.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
fs.mkdirSync(out, { recursive: true });
const timeline = JSON.parse(
  fs.readFileSync(path.join(root, "config/timeline.json")),
);
const rangeArg = process.argv.find((arg) => arg.startsWith("--range="));
const frameRange = rangeArg?.slice(8).split("-").map(Number);
if (frameRange && (frameRange.length !== 2 || frameRange.some(f => !Number.isInteger(f)) || frameRange[0] < 0 || frameRange[1] >= timeline.durationInFrames || frameRange[0] > frameRange[1])) throw new Error("Invalid inclusive frame range");
const frameArg = process.argv.find((arg) => arg.startsWith("--frames="));
const selectedFrames = frameArg?.slice(9).split(",").map(Number);
if (
  selectedFrames?.some(
    (f) => !Number.isInteger(f) || f < 0 || f >= timeline.durationInFrames,
  )
) {
  throw new Error(
    `--frames expects comma-separated integer frames from 0 to ${timeline.durationInFrames - 1}.`,
  );
}
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.tsx"),
  publicDir: path.join(root, "public"),
});
const browser = await openBrowser("chrome", {
  chromiumOptions: { gl: process.env.RENDER_GL || "angle" },
});
try {
  const composition = await selectComposition({
    serveUrl,
    id: "TOVO",
    puppeteerInstance: browser,
  });
  if (process.argv.includes("--stills-only") || selectedFrames) {
    fs.mkdirSync(path.join(out, "frames"), { recursive: true });
    for (const frame of selectedFrames ?? [8,102,188,280,330,337,338,369,456,550,623,706,857]) {
      if (frame >= timeline.durationInFrames) continue;
      await renderStill({
        serveUrl,
        composition,
        puppeteerInstance: browser,
        frame,
        scale: 0.5,
        output: path.join(out, "frames", `${frame}.png`),
      });
      console.log(`Frame ${frame}`);
    }
  } else {
    let last = -1;
    await renderMedia({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      outputLocation: path.join(out, frameRange ? `segment-${frameRange?.[0]}-${frameRange?.[1]}.mp4` : "tovo.mp4"),
      frameRange,
      codec: "h264",
      crf: 16,
      pixelFormat: "yuv420p",
      audioCodec: "aac",
      audioBitrate: "320k",
      concurrency: Math.max(1, Number(process.env.RENDER_CONCURRENCY) || 2),
      onProgress: ({ progress }) => {
        const n = Math.floor(progress * 20);
        if (n > last) {
          last = n;
          console.log(`Render ${n * 5}%`);
        }
      },
    });
    if (!frameRange) await finalizeAudio();
    console.log(frameRange ? `Saved dist/segment-${frameRange[0]}-${frameRange[1]}.mp4` : "Saved dist/tovo.mp4");
  }
} finally {
  await browser.close({ silent: true });
}
