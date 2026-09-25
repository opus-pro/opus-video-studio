// SPDX-License-Identifier: MIT
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const templatesRoot = fileURLToPath(new URL("./", import.meta.url));
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const readCatalogue = async () => JSON.parse(await readFile(path.join(templatesRoot, "catalog.json"), "utf8"));

export function safeRelative(value) {
  return typeof value === "string" && value.length > 0 &&
    !value.startsWith("/") && !/[\\\x00-\x1f:*?\[\]]/.test(value) &&
    value.split("/").every(part => part && part !== "." && part !== "..");
}

// Check every ancestor, including existing files, before writing or reading it.
export async function safeTarget(root, relative) {
  if (!safeRelative(relative)) throw new Error(`Unsafe path: ${relative}`);
  let current = path.resolve(root);
  for (const part of ["", ...relative.split("/")]) {
    if (part) current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing symlink: ${current}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return current;
}

async function download(url, limit, fetcher) {
  const parsed = new URL(url);
  if (parsed.origin !== "https://opus-lab.cdn.opuslab.ai" ||
      !parsed.pathname.startsWith("/labs/launch-videos/lite/") || parsed.search || parsed.hash ||
      parsed.username || parsed.password) throw new Error("Unsupported release URL");
  const response = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(120_000) });
  if (!response.ok || !response.body || Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel();
    throw new Error(`Release download failed: HTTP ${response.status}`);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) throw new Error("Release exceeds expected size");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function prepareTemplate(item, {
  root = templatesRoot, archivePath, fetcher = fetch,
} = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || item.sourcePath !== `${item.id}/project` ||
      !Number.isSafeInteger(item.archiveBytes) || item.archiveBytes < 1 || item.archiveBytes > 250_000_000 ||
      !/^[a-f0-9]{64}$/.test(item.archiveSha256)) throw new Error("Invalid release metadata");
  const missing = [];
  for (const file of item.files.filter(file => file.storage === "download")) {
    if (!safeRelative(file.archivePath) || !safeRelative(file.path) ||
        !Number.isSafeInteger(file.bytes) || file.bytes < 0 || file.bytes > 250_000_000 ||
        !/^[a-f0-9]{64}$/.test(file.sha256)) throw new Error("Invalid asset metadata");
    const target = await safeTarget(root, `${item.sourcePath}/${file.path}`);
    try {
      if (!(await lstat(target)).isFile()) throw new Error(`Not a regular file: ${target}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missing.push({ ...file, target });
    }
  }
  if (!missing.length) return { restored: 0, project: path.join(root, item.sourcePath) };
  const bytes = archivePath ? await readFile(archivePath) : await download(item.archiveUrl, item.archiveBytes, fetcher);
  if (bytes.length !== item.archiveBytes || sha256(bytes) !== item.archiveSha256) {
    throw new Error("Release size or SHA-256 mismatch; no files were restored");
  }
  const temp = await mkdtemp(path.join(tmpdir(), "opus-template-"));
  try {
    const zip = path.join(temp, "release.zip");
    await writeFile(zip, bytes);
    // Only named, hash-verified assets are read. ZIP entries never choose output paths.
    const contents = missing.map(file => {
      const content = execFileSync("unzip", ["-p", zip, file.archivePath], {
        maxBuffer: Math.max(1024, file.bytes + 1), stdio: ["ignore", "pipe", "pipe"],
      });
      if (content.length !== file.bytes || sha256(content) !== file.sha256) {
        throw new Error(`Asset checksum mismatch: ${file.path}`);
      }
      return content;
    });
    for (let i = 0; i < missing.length; i++) {
      const file = missing[i];
      await safeTarget(root, `${item.sourcePath}/${file.path}`);
      await mkdir(path.dirname(file.target), { recursive: true });
      await writeFile(file.target, contents[i], { flag: "wx" });
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
  return { restored: missing.length, project: path.join(root, item.sourcePath) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [, , id, archivePath, extra] = process.argv;
    const catalogue = await readCatalogue();
    const item = catalogue.items.find(item => item.id === id);
    if (!item || extra) throw new Error("Usage: npm run templates:prepare -- <template-id> [local-release.zip]");
    const result = await prepareTemplate(item, { archivePath });
    console.log(`Restored ${result.restored} missing media files. Existing files were preserved.`);
    console.log(`Project: ${result.project}\nNext: cd into the project, then npm ci && npm run check && npm run studio`);
  } catch (error) {
    console.error(error.code === "ENOENT" && error.syscall?.startsWith("spawn")
      ? "Install unzip and retry; no package scripts were run." : error.message);
    process.exitCode = 1;
  }
}
