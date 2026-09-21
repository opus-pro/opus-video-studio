#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractArchive } from "./template-archive.mjs";

const ORIGINS = {
  "labs.opus.pro": "https://opus-lab.cdn.opuslab.ai/labs/",
  "stg-labs.opus.pro": "https://stg-opus-lab.cdn.opuslab.work/labs/",
};
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function templateLocation(value) {
  const url = new URL(value);
  const match = url.pathname.match(/^\/product-videos\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (url.protocol !== "https:" || url.username || url.password || url.port || !ORIGINS[url.hostname] || !match) {
    throw new Error("Use a template link from https://labs.opus.pro/product-videos");
  }
  return { id: match[1], base: ORIGINS[url.hostname], url: url.origin + "/product-videos/" + match[1] };
}

function safePath(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_./-]+$/.test(value) &&
    !value.startsWith("/") && !value.split("/").some(part => part === ".." || part === ".");
}

export function selectTemplate(catalogue, location) {
  if (catalogue?.schemaVersion !== 1 || !Array.isArray(catalogue.items) || catalogue.items.length > 1000) {
    throw new Error("Unsupported template catalogue");
  }
  const matches = catalogue.items.filter(item => item.id === location.id && item.published === true);
  if (matches.length !== 1) throw new Error("Template is unavailable in this catalogue");
  const item = matches[0];
  if (!ID.test(item.id) || !safePath(item.mediaPath) || !item.mediaPath.startsWith("launch-videos/") ||
      !safePath(item.archive) || item.archive.includes("/") || !item.archive.endsWith(".zip") ||
      !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.size) ||
      item.size < 1 || item.size > 250_000_000 ||
      !["template", "component"].includes(item.kind) ||
      !Array.isArray(item.readingOrder) || !item.readingOrder.every(safePath)) {
    throw new Error("Template source metadata is incomplete");
  }
  return { ...item, archiveUrl: new URL(item.mediaPath + "/" + item.archive, location.base).href };
}

async function fetchBytes(url, limit, fetcher) {
  const response = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(120_000) });
  if (!response.ok || !response.body || Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel();
    throw new Error("Template download failed: HTTP " + response.status);
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > limit) throw new Error("Template download exceeds size limit");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function downloadTemplate(link, destination, { fetcher = fetch } = {}) {
  const location = templateLocation(link);
  const target = path.resolve(destination);
  try {
    await access(target);
    throw new Error("Destination already exists; choose a new folder to preserve existing work");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const catalogue = JSON.parse((await fetchBytes(location.base + "launch-videos/catalog/index.json", 1_000_000, fetcher)).toString("utf8"));
  const item = selectTemplate(catalogue, location);
  const archive = await fetchBytes(item.archiveUrl, item.size, fetcher);
  if (archive.length !== item.size || createHash("sha256").update(archive).digest("hex") !== item.sha256) {
    throw new Error("Template checksum or size mismatch; no source was installed");
  }
  await mkdir(path.dirname(target), { recursive: true });
  const staging = await mkdtemp(path.join(path.dirname(target), ".opus-template-"));
  try {
    const project = await extractArchive(archive, path.join(staging, "source"));
    const receipt = {
      templateUrl: location.url, id: item.id, title: item.title, version: item.version,
      kind: item.kind, archiveUrl: item.archiveUrl, sha256: item.sha256,
      width: item.width, height: item.height, fps: item.fps, frames: item.frames,
      readingOrder: item.readingOrder,
      projectDirectory: path.join(target, "source", project),
    };
    await writeFile(path.join(staging, "template.zip"), archive, { flag: "wx" });
    await writeFile(path.join(staging, "template-source.json"), JSON.stringify(receipt, null, 2) + "\n", { flag: "wx" });
    // Claim the destination before moving files; never replace an existing folder.
    await mkdir(target);
    try {
      for (const name of ["source", "template.zip", "template-source.json"]) {
        await rename(path.join(staging, name), path.join(target, name));
      }
    } catch (error) {
      throw new Error("Source transfer failed; preserve the partial destination and retry in a new folder", { cause: error });
    }
    return receipt;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) {
    process.stderr.write('Usage: node download-template.mjs "<template URL>" "<new destination>"\n');
    process.exitCode = 1;
  } else {
    try {
      process.stdout.write(JSON.stringify(await downloadTemplate(process.argv[2], process.argv[3]), null, 2) + "\n");
    } catch (error) {
      process.stderr.write([error.message, error.cause?.code].filter(Boolean).join(": ") + "\n");
      process.exitCode = 1;
    }
  }
}
