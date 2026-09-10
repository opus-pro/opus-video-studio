import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  compareVersions,
  ensureLatest,
  marketplaceRoot,
} from "../plugins/opus-video-studio/scripts/ensure-latest-plugin.mjs";

test("plugin update version comparison handles ordinary releases", () => {
  assert.equal(compareVersions("0.6.14", "0.6.13"), 1);
  assert.equal(compareVersions("0.10.0", "0.6.99"), 1);
  assert.equal(compareVersions("1.0.0", "1.0.0"), 0);
  assert.equal(compareVersions("1.0.0-beta.1", "1.0.0"), -1);
  assert.equal(compareVersions("1.0.0+codex.local", "1.0.0"), 0);
});

test("plugin update locates the configured marketplace snapshot", () => {
  const output = [
    "openai-bundled  /tmp/openai-bundled",
    "opus-pro        /Users/example/.codex/.tmp/marketplaces/opus-pro",
  ].join("\n");
  assert.equal(marketplaceRoot(output), "/Users/example/.codex/.tmp/marketplaces/opus-pro");
  assert.throws(() => marketplaceRoot(output, "missing"), /configured marketplace not found/);
});

test("plugin update installs a newer marketplace release and requires a fresh task", () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "opus-video-studio-update-"));
  const pluginRoot = path.join(temporary, "loaded-plugin");
  const marketplace = path.join(temporary, "marketplace");
  const homeDirectory = path.join(temporary, "home");
  const writeManifest = (target, version) => {
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, JSON.stringify({ name: "opus-video-studio", version }));
  };
  writeManifest(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "0.6.13");
  writeManifest(
    path.join(marketplace, "plugins", "opus-video-studio", ".codex-plugin", "plugin.json"),
    "0.6.14",
  );
  writeManifest(
    path.join(
      homeDirectory,
      ".codex/plugins/cache/opus-pro/opus-video-studio/0.6.14/.codex-plugin/plugin.json",
    ),
    "0.6.14",
  );
  const calls = [];
  const update = ensureLatest({
    pluginRoot,
    homeDirectory,
    commandRunner(_bin, args) {
      calls.push(args.join(" "));
      return args.at(-1) === "list" ? `opus-pro  ${marketplace}\n` : "";
    },
  });

  assert.deepEqual(update, {
    status: "updated",
    updated: true,
    restartRequired: true,
    currentVersion: "0.6.13",
    latestVersion: "0.6.14",
  });
  assert.deepEqual(calls, [
    "plugin marketplace upgrade opus-pro",
    "plugin marketplace list",
    "plugin add opus-video-studio@opus-pro",
  ]);
});

test("plugin update failures do not block the loaded workflow", () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "opus-video-studio-update-fail-"));
  const pluginRoot = path.join(temporary, "loaded-plugin");
  mkdirSync(path.join(pluginRoot, ".codex-plugin"), { recursive: true });
  writeFileSync(
    path.join(pluginRoot, ".codex-plugin", "plugin.json"),
    JSON.stringify({ name: "opus-video-studio", version: "0.6.14" }),
  );
  const update = ensureLatest({
    pluginRoot,
    commandRunner() {
      throw new Error("offline");
    },
  });
  assert.equal(update.status, "check_failed");
  assert.equal(update.restartRequired, false);
  assert.match(update.message, /offline/);
});
