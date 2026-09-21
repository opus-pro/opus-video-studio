import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugin = "plugins/opus-video-studio";
const json = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const read = (file) => readFileSync(path.join(root, file), "utf8");

test("Codex publishes a consistent plugin version and source", () => {
  const marketplace = json(".agents/plugins/marketplace.json");
  const manifest = json(`${plugin}/.codex-plugin/plugin.json`);
  assert.equal(marketplace.name, "opus-pro");
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].source.path, `./${plugin}`);
  assert.equal(marketplace.plugins[0].version, json("package.json").version);
  assert.equal(marketplace.plugins[0].policy.authentication, "ON_USE");
  assert.equal(manifest.version, json("package.json").version);
  assert.equal(manifest.name, "opus-video-studio");
  assert.equal(manifest.repository, "https://github.com/opus-pro/opus-video-studio");
});

test("the public distribution excludes inactive packs and internal contracts", () => {
  assert.deepEqual(readdirSync(path.join(root, plugin, "skills")).sort(), ["get-started", "media-tools", "motion-ui", "video-director"]);
  assert.deepEqual(readdirSync(path.join(root, plugin, "skillpacks")), ["seedance2-director"]);
  for (const file of ["evals", "contracts", `${plugin}/docs/editor-timeline-mcp.md`, `${plugin}/scripts/check-tools.ts`]) {
    assert.equal(existsSync(path.join(root, file)), false, file);
  }
  const pack = json(`${plugin}/skillpacks/seedance2-director/skillpack.json`);
  for (const file of [pack.entrypoint, pack.adapter, pack.source.path]) {
    assert.ok(existsSync(path.join(root, plugin, "skillpacks/seedance2-director", file)), file);
  }
});

test("MCP is the public Labs resource without bundled credentials", () => {
  const servers = json(`${plugin}/.mcp.json`).mcpServers;
  assert.deepEqual(Object.keys(servers), ["opus-video-tools"]);
  assert.deepEqual(servers["opus-video-tools"], {
    type: "http", url: "https://labs.opus.pro/opus-video-tools/mcp", timeout: 900000,
  });
});

test("installation guides use the public source and keep the same MCP resource", () => {
  for (const file of ["docs/codex-install-protocol.md"]) {
    const text = read(file);
    assert.match(text, /github\.com\/opus-pro\/opus-video-studio\.git/);
    assert.match(text, /https:\/\/labs\.opus\.pro\/opus-video-tools\/mcp/);
    assert.match(text, /setup-remotion\.mjs/);
    assert.doesNotMatch(text, /github\.com\/opus-pro\/opus-video-tools|npm run schema:check|mcp remove aao/);
  }
});

test("the Codex manifest declares managed MCP and media skills load shared rules", () => {
  assert.equal(json(`${plugin}/.codex-plugin/plugin.json`).mcpServers, "./.mcp.json");
  for (const skill of ["motion-ui", "media-tools", "video-director"]) {
    assert.match(read(`${plugin}/skills/${skill}/SKILL.md`), /\(\.\.\/\.\.\/docs\/shared-rules\.md\)/);
  }
  const rules = read(`${plugin}/docs/shared-rules.md`);
  assert.match(rules, /45 seconds/);
  assert.match(rules, /requestKey/);
  assert.match(rules, /reserved credits are an estimate/i);
  assert.doesNotMatch(rules, /You are.*Codex harness|up to `plugins\/opus-video-studio`/);
  for (const file of [".agents/plugins/marketplace.json"]) {
    assert.doesNotMatch(json(file).plugins[0].description, /Seedance/);
  }
});
