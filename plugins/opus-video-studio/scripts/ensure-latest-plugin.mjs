#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const DEFAULT_MARKETPLACE = "opus-pro";
export const DEFAULT_PLUGIN = "opus-video-studio";

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function compareVersions(left, right) {
  const parse = (value) => {
    const match = String(value).match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/);
    if (!match) throw new Error(`unsupported plugin version: ${value}`);
    return {
      numbers: match.slice(1, 4).map(Number),
      prerelease: match[4] ?? null,
    };
  };
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < 3; index += 1) {
    if (a.numbers[index] !== b.numbers[index]) return Math.sign(a.numbers[index] - b.numbers[index]);
  }
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;
  return a.prerelease.localeCompare(b.prerelease, "en", { numeric: true });
}

export function marketplaceRoot(output, marketplace = DEFAULT_MARKETPLACE) {
  const line = output
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${marketplace} `));
  if (!line) throw new Error(`configured marketplace not found: ${marketplace}`);
  return line.slice(marketplace.length).trim();
}

function command(codexBin, args) {
  const result = spawnSync(codexBin, args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${codexBin} ${args.join(" ")} failed`).trim());
  }
  return result.stdout;
}

function result(status, fields = {}) {
  return { status, updated: false, restartRequired: false, ...fields };
}

export function ensureLatest({
  checkOnly = false,
  codexBin = "codex",
  marketplace = DEFAULT_MARKETPLACE,
  plugin = DEFAULT_PLUGIN,
  pluginRoot: suppliedPluginRoot,
  homeDirectory = os.homedir(),
  commandRunner = command,
} = {}) {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const pluginRoot = suppliedPluginRoot ?? path.resolve(scriptDirectory, "..");
  const currentVersion = readJson(path.join(pluginRoot, ".codex-plugin", "plugin.json")).version;

  let removalAttempted = false;
  let removed = false;
  try {
    commandRunner(codexBin, ["plugin", "marketplace", "upgrade", marketplace]);
    const root = marketplaceRoot(
      commandRunner(codexBin, ["plugin", "marketplace", "list"]),
      marketplace,
    );
    const latestManifest = path.join(root, "plugins", plugin, ".codex-plugin", "plugin.json");
    const latestVersion = readJson(latestManifest).version;

    if (compareVersions(latestVersion, currentVersion) <= 0) {
      return result("up_to_date", { currentVersion, latestVersion });
    }
    if (checkOnly) {
      return result("update_available", { currentVersion, latestVersion });
    }

    // Verify support before changing the installed package. Use Codex's scoped cache cleanup.
    commandRunner(codexBin, ["plugin", "remove", "--help"]);
    removalAttempted = true;
    commandRunner(codexBin, ["plugin", "remove", `${plugin}@${marketplace}`, "--json"]);
    removed = true;
    commandRunner(codexBin, ["plugin", "add", `${plugin}@${marketplace}`]);
    const installedManifest = path.join(
      homeDirectory,
      ".codex",
      "plugins",
      "cache",
      marketplace,
      plugin,
      latestVersion,
      ".codex-plugin",
      "plugin.json",
    );
    if (!existsSync(installedManifest) || readJson(installedManifest).version !== latestVersion) {
      throw new Error(`plugin install did not create the expected ${latestVersion} cache`);
    }
    return result("updated", {
      currentVersion,
      latestVersion,
      updated: true,
      restartRequired: true,
    });
  } catch (error) {
    return result(removalAttempted ? "update_failed" : "check_failed", {
      ...(removalAttempted ? {
        restartRequired: true,
        installationState: removed ? "reinstall_incomplete" : "removal_unconfirmed",
      } : {}),
      currentVersion,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function main() {
  const checkOnly = process.argv.includes("--check-only");
  process.stdout.write(
    `${JSON.stringify(ensureLatest({
      checkOnly,
      codexBin: process.env.OPUS_VIDEO_STUDIO_CODEX_BIN || "codex",
    }))}\n`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
