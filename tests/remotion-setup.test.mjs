import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
  assert.deepEqual(lock.packages[""].devDependencies, manifest.devDependencies);
  assert.equal(manifest.scripts.studio, "remotion studio src/index.tsx");
  assert.equal(manifest.scripts.typecheck, "tsc --noEmit");
  const tsconfig = JSON.parse(readFileSync(path.join(directory, "tsconfig.json")));
  assert.equal(tsconfig.compilerOptions.jsx, "react-jsx");
  assert.equal(tsconfig.compilerOptions.noEmit, true);
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
  assert.notEqual(directory, runtimeDirectory({ PLUGIN_DATA: "/tmp/other-plugin-data" }));
});

test("new project gitignore excludes dependencies, output and local credentials", (t) => {
  const directory = createProject(mkdtempSync(path.join(tmpdir(), "opus-remotion-git-")));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", directory]);
  for (const file of ["node_modules/large-file", "out/video.mp4", ".env", ".env.local"]) {
    assert.equal(execFileSync("git", ["-C", directory, "check-ignore", file], {encoding: "utf8"}).trim(), file);
  }
});

test("plugin version directories share runtime identity without a root npm install", async (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), "opus-remotion-versions-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = fileURLToPath(new URL("../plugins/opus-video-studio/", import.meta.url));
  const paths = [];
  for (const version of ["one", "two"]) {
    const target = path.join(directory, version);
    cpSync(source, target, { recursive: true, filter: (file) => !file.includes("node_modules") });
    assert.equal(existsSync(path.join(target, "package.json")), false);
    const { runtimeDirectory: resolve } = await import(path.join(target, "scripts/setup-remotion.mjs"));
    paths.push(resolve({ OPUS_VIDEO_TOOLS_DATA_DIR: path.join(directory, "shared") }));
  }
  assert.equal(paths[0], paths[1]);
});
