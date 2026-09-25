import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(
  fs.readFileSync(path.join(root, "config/template.json")),
);
const timeline = JSON.parse(
  fs.readFileSync(path.join(root, "config/timeline.json")),
);
const fail = (message) => {
  throw new Error(message);
};
function localFile(file) {
  if (
    typeof file !== "string" ||
    !file ||
    /^[a-z]+:/i.test(file) ||
    path.isAbsolute(file) ||
    file.split(/[\\/]/).includes("..")
  )
    fail(`Use a relative public/ file path: ${file}`);
  if (
    !fs
      .statSync(path.join(root, "public", file), { throwIfNoEntry: false })
      ?.isFile()
  )
    fail(`Missing public/${file}`);
}
function length(value, n, label) {
  if (!Array.isArray(value) || value.length !== n)
    fail(`${label} must contain ${n} items`);
}
for (const [key, n] of [
  ["openingLines", 2],
  ["secondClaimLines", 2],
  ["inputLabels", 3],
  ["scriptLines", 4],
  ["storyboardCaptions", 3],
  ["screenplay", 3],
  ["categoryPrompts", 3],
  ["openingCardLines", 3],
  ["openingCardStory", 2],
  ["openingCardCTA", 2],
])
  length(cfg.copy[key], n, `copy.${key}`);
for (const [key, n] of [
  ["inputImages", 4],
  ["openingImages", 4],
  ["workflowImages", 6],
  ["heroVideos", 3],
  ["heroStartSeconds", 3],
  ["heroPlaybackRates", 3],
])
  length(cfg.media[key], n, `media.${key}`);
for (const key of [
  "inputImages",
  "openingImages",
  "workflowImages",
  "heroVideos",
])
  cfg.media[key].forEach(localFile);
length(cfg.media.workflowPreviewClips, 3, "media.workflowPreviewClips");
length(cfg.media.openingVideos, 3, "media.openingVideos");
cfg.media.openingVideos.forEach(clip => {
  localFile(clip.file);
  if (!(clip.startSeconds >= 0 && clip.playbackRate > 0)) fail(`Invalid opening video: ${clip.file}`);
});
cfg.media.workflowPreviewClips.forEach(clip => {
  localFile(clip.file);
  if (!(clip.startSeconds >= 0 && clip.endSeconds > clip.startSeconds && clip.playbackRate > 0)) fail(`Invalid workflow preview clip: ${clip.file}`);
});
for (const key of ["ads", "stories", "explainers"])
  if (!cfg.media.wallVideos.some((v) => v.category === key))
    fail(`Missing result-wall group ${key}`);
cfg.media.wallVideos.forEach((v) => {
  localFile(v.file);
  if (!(v.duration > 1 / 15)) fail(`Invalid duration for ${v.file}`);
});
for (const [key, value] of Object.entries({...cfg.product, ...cfg.copy})) {
  if (Array.isArray(value) ? value.some(item => typeof item !== "string" || !item.trim()) : typeof value !== "string" || !value.trim()) fail(`Empty or invalid text: ${key}`);
}
localFile(cfg.brand.wordmark);
if (!cfg.brand.markPaths.length) fail("brand.markPaths cannot be empty");
for (const [key, n] of [
  ["titleColors", 5],
  ["markFaceColors", 5],
  ["markSideColors", 3],
])
  length(cfg.brand[key], n, `brand.${key}`);
if (!["master", "mute"].includes(cfg.audio.mode))
  fail("audio.mode must be master or mute");
if (cfg.audio.mode === "master") localFile(cfg.audio.master);
if (
  timeline.durationInFrames !== 1224 ||
  timeline.fps !== 30 ||
  timeline.width !== 1920 ||
  timeline.height !== 1080
)
  fail(
    "This template has a locked 1920×1080, 30 fps, 1224-frame timeline. Re-author the scene clocks before changing these values.",
  );
console.log("Local assets and template configuration OK.");
