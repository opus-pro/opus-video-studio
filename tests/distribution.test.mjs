import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugin = "plugins/opus-video-studio";
const json = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const read = (file) => readFileSync(path.join(root, file), "utf8");

test("both clients publish one consistent plugin version and source", () => {
  const codex = json(".agents/plugins/marketplace.json");
  const claude = json(".claude-plugin/marketplace.json");
  assert.equal(codex.name, "opus-pro");
  assert.equal(codex.plugins[0].policy.authentication, "ON_USE");
  assert.equal(claude.name, codex.name);
  for (const marketplace of [codex, claude]) {
    assert.equal(marketplace.plugins.length, 1);
    assert.equal(marketplace.plugins[0].name, "opus-video-studio");
    assert.equal(marketplace.plugins[0].version, json("package.json").version);
  }
  assert.equal(codex.plugins[0].source.path, `./${plugin}`);
  assert.equal(claude.plugins[0].source, `./${plugin}`);
  for (const client of ["codex", "claude"]) {
    const manifest = json(`${plugin}/.${client}-plugin/plugin.json`);
    assert.equal(manifest.version, json("package.json").version);
    assert.equal(manifest.name, "opus-video-studio");
    assert.equal(manifest.repository, "https://github.com/opus-pro/opus-video-studio");
  }
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
  for (const file of ["docs/codex-install-protocol.md", "docs/claude-code-install-protocol.md"]) {
    const text = read(file);
    assert.match(text, /github\.com\/opus-pro\/opus-video-studio\.git/);
    assert.match(text, /https:\/\/labs\.opus\.pro\/opus-video-tools\/mcp/);
    assert.match(text, /setup-remotion\.mjs/);
    assert.doesNotMatch(text, /github\.com\/opus-pro\/opus-video-tools|npm run schema:check|mcp remove aao/);
  }
});

test("both clients declare the same MCP config and every skill loads shared rules", () => {
  for (const client of ["codex", "claude"]) assert.equal(json(`${plugin}/.${client}-plugin/plugin.json`).mcpServers, "./.mcp.json");
  for (const skill of ["motion-ui", "media-tools", "video-director"]) {
    assert.match(read(`${plugin}/skills/${skill}/SKILL.md`), /\(\.\.\/\.\.\/docs\/shared-rules\.md\)/);
  }
  const rules = read(`${plugin}/docs/shared-rules.md`);
  assert.match(rules, /45 seconds/);
  assert.match(rules, /requestKey/);
  assert.match(rules, /reserved credits are an estimate/i);
  assert.doesNotMatch(rules, /You are.*Codex harness|up to `plugins\/opus-video-studio`/);
  for (const file of [".agents/plugins/marketplace.json", ".claude-plugin/marketplace.json"]) {
    assert.doesNotMatch(json(file).plugins[0].description, /Seedance/);
  }
});

test("Claude setup supports Desktop Code and upgrades stale installations before authentication", () => {
  const guide = read("docs/claude-code-install-protocol.md");
  assert.match(guide, /Claude Desktop, Code mode, local session/);
  assert.match(guide, /claude plugin marketplace update opus-pro/);
  assert.match(guide, /claude plugin update opus-video-studio@opus-pro/);
  assert.match(guide, /claude plugin list --json/);
  assert.match(guide, /installPath/);
  assert.match(guide, /slash command/);
  assert.doesNotMatch(guide, /\nclaude plugin details|claude mcp get opus-video-tools/);
  assert.match(guide, /No MCP servers\s+configured/);
});

test("Claude setup starts sign-in from the agent before falling back to /mcp", () => {
  const guide = read("docs/claude-code-install-protocol.md");
  assert.match(guide, /mcp__plugin_opus-video-studio_opus-video-tools__authenticate/);
  assert.match(guide, /script -q \/dev\/null claude mcp login plugin:opus-video-studio:opus-video-tools/);
  assert.match(guide, /--no-browser/);
  assert.match(guide, /`\/reload-plugins`/);
  assert.match(guide, /send the user to `\/mcp` only as a fallback/);
  assert.doesNotMatch(guide, /Do not use `claude mcp login`/);
});

test("setup does not require an unshipped button or automatic session handoff", () => {
  for (const file of ["docs/codex-install-protocol.md", "docs/claude-code-install-protocol.md"]) {
    const text = read(file);
    for (const skill of ["get-started", "motion-ui", "media-tools", "video-director"]) {
      assert.ok(text.includes(skill), `${file}: ${skill}`);
    }
    assert.match(text, /opus_video_tools_whoami/);
    assert.match(text, /pending/);
    assert.doesNotMatch(text, /click Start creating|After installing\/updating, use a fresh|start a new Codex task/);
  }
});

test("Claude setup waits for sign-in itself instead of asking the user to reply", () => {
  const guide = read("docs/claude-code-install-protocol.md");
  assert.match(guide, /Do not end the turn asking the user to reply/);
  assert.match(guide, /grep -q 'Connected'/);
  assert.match(guide, /do not list account identity as\s+pending because it returns only IDs/);
});
