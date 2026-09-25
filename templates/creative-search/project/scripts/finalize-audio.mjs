import { RenderInternals } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Use the binary already shipped by pinned Remotion 4.0.332. No system FFmpeg
// installation is required for the baseline render.
export async function finalizeAudio() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const cfg = JSON.parse(
    fs.readFileSync(path.join(root, "config/template.json")),
  );
  if (cfg.audio.mode !== "master") return;
  const movie = path.join(root, "dist/creative-search.mp4");
  const temp = path.join(root, "dist/creative-search-mux.mp4");
  const master = path.join(root, "public", cfg.audio.master);
  const codec =
    path.extname(master).toLowerCase() === ".m4a"
      ? ["-c:a", "copy"]
      : ["-c:a", "aac", "-b:a", "320k"];
  await RenderInternals.callFf({
    bin: "ffmpeg",
    indent: false,
    logLevel: "error",
    binariesDirectory: null,
    cancelSignal: undefined,
    args: [
      "-v",
      "error",
      "-y",
      "-i",
      movie,
      "-i",
      master,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      ...codec,
      "-map_metadata",
      "-1",
      "-movflags",
      "+faststart",
      temp,
    ],
    options: { stdio: "inherit" },
  });
  fs.renameSync(temp, movie);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await finalizeAudio();
