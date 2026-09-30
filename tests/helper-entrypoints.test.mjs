import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

function linkedScripts(t) {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "opus-helper-link-"));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const link = path.join(temporary, "scripts");
  symlinkSync(fileURLToPath(new URL("../plugins/opus-video-studio/scripts", import.meta.url)), link, "junction");
  return { temporary, link };
}

test("helpers remain importable from stdin without running their CLI", () => {
  const modules = ["download-template.mjs", "ensure-latest-plugin.mjs"].map(name =>
    new URL(`../plugins/opus-video-studio/scripts/${name}`, import.meta.url).href);
  const result = spawnSync(process.execPath, ["--input-type=module", "-"], {
    encoding: "utf8",
    input: `${modules.map(url => `await import(${JSON.stringify(url)});`).join("\n")}\nconsole.log("imported");`,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "imported\n");
});

test("download CLI reports missing arguments through a symlinked installation", (t) => {
  const { link } = linkedScripts(t);
  const result = spawnSync(process.execPath, [path.join(link, "download-template.mjs")], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node download-template\.mjs/);
});

test("update CLI reports a failed check through a symlinked installation", (t) => {
  const { temporary, link } = linkedScripts(t);
  const result = spawnSync(process.execPath, [path.join(link, "ensure-latest-plugin.mjs"), "--check-only"], {
    encoding: "utf8",
    env: { ...process.env, OPUS_VIDEO_STUDIO_CODEX_BIN: path.join(temporary, "missing-codex") },
  });
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "check_failed");
  assert.match(report.message, /ENOENT/);
});

for (const script of ["templates/prepare.mjs", "remakes/opus-5.5/prepare.mjs", "scripts/check-install-guides.mjs", "templates/check.mjs", "remakes/opus-5.5/check.mjs"]) {
  test(`repository CLI ${script} runs through a symlink`, (t) => {
    const temporary = mkdtempSync(path.join(os.tmpdir(), "opus-repo-link-"));
    t.after(() => rmSync(temporary, { recursive: true, force: true }));
    const real = fileURLToPath(new URL(`../${script}`, import.meta.url));
    const link = path.join(temporary, "entry.mjs");
    symlinkSync(real, link);
    const direct = spawnSync(process.execPath, [real], { encoding: "utf8" });
    const linked = spawnSync(process.execPath, [link], { encoding: "utf8" });
    assert.equal(linked.status, direct.status);
    assert.equal(linked.stdout, direct.stdout);
    assert.equal(linked.stderr, direct.stderr);
    assert.ok(linked.stdout || linked.stderr, "must execute the CLI, not silently skip it");
    const imported = spawnSync(process.execPath, ["--input-type=module", "-"], {
      encoding: "utf8", input: `await import(${JSON.stringify(new URL(`../${script}`, import.meta.url).href)}); console.log("imported");`,
    });
    assert.equal(imported.status, 0, imported.stderr);
    assert.equal(imported.stdout, "imported\n");
  });
}
