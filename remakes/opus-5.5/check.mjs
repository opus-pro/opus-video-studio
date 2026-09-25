// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readCatalogue, safeRelative, safeTarget, sha256 } from "../../templates/prepare.mjs";
import { readRemakes, remakesRoot } from "./prepare.mjs";

const REQUIRED = ["package.json", "package-lock.json", "template.json", "src/index.tsx", "scripts/render.mjs", "TASK.md", "BUILD-LOG.md"];

export async function checkRemakes({ root = remakesRoot, catalogue, templates } = {}) {
  catalogue ??= await readRemakes();
  templates ??= await readCatalogue();
  assert.equal(catalogue.schemaVersion, 1);
  assert.equal(new Set(catalogue.items.map(item => item.id)).size, catalogue.items.length, "Duplicate remake ID");
  const originals = new Map(templates.items.map(item => [item.id, item]));
  let sourceFiles = 0;
  let mediaFiles = 0;
  for (const item of catalogue.items) {
    const original = originals.get(item.id);
    assert.ok(original && original.kind === "component", `${item.id}: no original component`);
    assert.equal(item.template, `templates/${item.id}`);
    assert.equal(item.sourcePath, `${item.id}/project`);
    assert.ok(["precise", "brief"].includes(item.spec), `${item.id}: unknown spec tier`);
    for (const field of ["archiveUrl", "archiveSha256", "archiveBytes"]) {
      assert.equal(item[field], original[field], `${item.id}: ${field} must match the original release`);
    }
    for (const field of ["demoUrl", "compareUrl", "posterUrl"]) {
      const url = new URL(item[field]);
      assert.equal(url.origin, "https://opus-lab.cdn.opuslab.ai");
      assert.ok(url.pathname.startsWith(`/labs/launch-videos/opus-5.5/v1/${item.id}/`), `${item.id}: ${field}`);
    }
    for (const required of REQUIRED) {
      assert.ok(item.files.some(file => file.path === required && file.storage === "git"), `${item.id}: missing ${required}`);
    }
    const released = new Map(original.files.filter(file => file.storage === "download").map(file => [file.sha256, file]));
    for (const file of item.files) {
      assert.ok(safeRelative(file.path));
      assert.match(file.sha256, /^[a-f0-9]{64}$/);
      if (file.storage === "download") {
        // Media must be byte-identical to a file in the original release.
        assert.equal(released.get(file.sha256)?.archivePath, file.archivePath, `${item.id}/${file.path}: not in the original release`);
      } else {
        assert.equal(file.storage, "git");
      }
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
  return { remakes: catalogue.items.length, sourceFiles, mediaFiles };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(await checkRemakes()); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
