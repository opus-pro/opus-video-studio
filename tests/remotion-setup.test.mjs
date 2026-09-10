import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createProject, runtimeDirectory } from "../plugins/opus-video-studio/scripts/setup-remotion.mjs";

test("new projects include pinned dependencies, an entrypoint, and Studio scripts", (t) => {
  const directory = createProject(mkdtempSync(path.join(tmpdir(), "opus-remotion-test-")));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const manifest = JSON.parse(readFileSync(path.join(directory, "package.json")));
  const lock = JSON.parse(readFileSync(path.join(directory, "package-lock.json")));
  assert.equal(manifest.dependencies.remotion, manifest.dependencies["@remotion/cli"]);
  assert.deepEqual(lock.packages[""].dependencies, manifest.dependencies);
  assert.equal(manifest.scripts.studio, "remotion studio src/index.tsx");
  assert.match(readFileSync(path.join(directory, "src/index.tsx"), "utf8"), /registerRoot/);
});

test("initialization refuses nonempty projects without changing user files", (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), "opus-remotion-existing-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "package.json");
  writeFileSync(file, '{"name":"my-existing-project"}');
  assert.throws(() => createProject(directory), /not empty/);
  assert.equal(readFileSync(file, "utf8"), '{"name":"my-existing-project"}');
});

test("setup runs through symlinked plugin and temporary-directory paths", (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), "opus-remotion-link-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const link = path.join(directory, "setup.mjs");
  symlinkSync(fileURLToPath(new URL("../plugins/opus-video-studio/scripts/setup-remotion.mjs", import.meta.url)), link);
  const output = execFileSync(process.execPath, [link, "--help"], { encoding: "utf8" });
  assert.match(output, /Usage: node setup-remotion.mjs/);
});

test("runtime uses host persistent data and a content-keyed subdirectory", () => {
  const directory = runtimeDirectory({ PLUGIN_DATA: "/tmp/codex-plugin-data" });
  assert.match(directory, /codex-plugin-data\/remotion\/[0-9a-f]{16}$/);
  assert.equal(directory, runtimeDirectory({ CLAUDE_PLUGIN_DATA: "/tmp/codex-plugin-data" }));
  assert.notEqual(directory, runtimeDirectory({ PLUGIN_DATA: "/tmp/other-plugin-data" }));
});
