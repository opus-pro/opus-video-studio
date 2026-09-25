// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readCatalogue, safeRelative, safeTarget, sha256, templatesRoot } from "./prepare.mjs";

export async function checkTemplates({ root = templatesRoot, catalogue } = {}) {
  catalogue ??= await readCatalogue();
  assert.equal(catalogue.schemaVersion, 1);
  assert.equal(new Set(catalogue.items.map(item => item.id)).size, catalogue.items.length, "Duplicate template ID");
  let sourceFiles = 0;
  let mediaFiles = 0;
  for (const item of catalogue.items) {
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(item.sourcePath, `${item.id}/project`);
    assert.equal(item.galleryUrl, `https://product-videos.labs.opus.pro/${item.id}`);
    for (const field of ["demoUrl", "posterUrl", "archiveUrl"]) {
      const url = new URL(item[field]);
      assert.equal(url.origin, "https://opus-lab.cdn.opuslab.ai");
      assert.ok(url.pathname.startsWith("/labs/launch-videos/lite/"));
    }
    assert.match(item.archiveSha256, /^[a-f0-9]{64}$/);
    assert.equal(new Set(item.files.map(file => file.path)).size, item.files.length, `${item.id}: duplicate file`);
    for (const required of ["package.json", "package-lock.json", "src/index.tsx", ...item.readingOrder]) {
      assert.ok(item.files.some(file => file.path === required && file.storage === "git"), `${item.id}: missing ${required}`);
    }
    for (const file of item.files) {
      assert.ok(safeRelative(file.path));
      assert.ok(["git", "download"].includes(file.storage));
      assert.match(file.sha256, /^[a-f0-9]{64}$/);
      const target = await safeTarget(root, `${item.sourcePath}/${file.path}`);
      let content;
      try { content = await readFile(target); } catch (error) {
        if (error.code === "ENOENT" && file.storage === "download") continue;
        throw error;
      }
      assert.equal(content.length, file.bytes, `${item.id}/${file.path}: size changed`);
      assert.equal(sha256(content), file.sha256, `${item.id}/${file.path}: checksum changed`);
      if (file.storage === "git") sourceFiles++; else mediaFiles++;
    }
  }
  return { templates: catalogue.items.length, sourceFiles, mediaFiles };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(await checkTemplates()); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
