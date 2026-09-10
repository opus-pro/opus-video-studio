#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { constants, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifests = ["package.json", "package-lock.json"];
const manifest = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

export function runtimeDirectory(env = process.env) {
  const fingerprint = createHash("sha256");
  for (const file of manifests) fingerprint.update(readFileSync(path.join(root, file)));
  const data = env.OPUS_VIDEO_TOOLS_DATA_DIR || env.PLUGIN_DATA || env.CLAUDE_PLUGIN_DATA
    || path.join(homedir(), ".opus-video-tools");
  return path.resolve(data, "remotion", fingerprint.digest("hex").slice(0, 16));
}

function copyManifests(directory, exclusive = false) {
  mkdirSync(directory, { recursive: true });
  for (const file of manifests) copyFileSync(path.join(root, file), path.join(directory, file), exclusive ? constants.COPYFILE_EXCL : 0);
}

export function createProject(directory) {
  const target = path.resolve(directory);
  if (existsSync(target) && readdirSync(target).length > 0) {
    throw new Error("Project directory is not empty. Reuse its existing Remotion setup or choose a new empty directory; no files were changed.");
  }
  copyManifests(target, true);
  mkdirSync(path.join(target, "src"));
  mkdirSync(path.join(target, "public"));
  copyFileSync(path.join(root, "assets/remotion/index.tsx"), path.join(target, "src/index.tsx"), constants.COPYFILE_EXCL);
  return target;
}

function cli(directory) {
  return path.join(directory, "node_modules/@remotion/cli/remotion-cli.js");
}

function runtimeReady(directory) {
  try {
    for (const [name, version] of Object.entries(manifest.dependencies)) {
      const installed = JSON.parse(readFileSync(path.join(directory, "node_modules", name, "package.json"), "utf8"));
      if (installed.version !== version) return false;
    }
    execFileSync(process.execPath, [cli(directory), "--help"], {
      cwd: directory, stdio: "pipe", timeout: 30_000,
    });
    return true;
  } catch {
    return false;
  }
}

export function ensureRuntime(directory) {
  if (!runtimeReady(directory)) {
    const lock = path.join(directory, ".remotion-install-lock");
    try { mkdirSync(lock); }
    catch (error) {
      if (error.code === "EEXIST") throw new Error("Another Remotion install is running. Retry after it finishes; do not start a second install in this directory.");
      throw error;
    }
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    try {
      execFileSync(npm, ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], {
        cwd: directory, stdio: "inherit", timeout: 480_000,
        shell: process.platform === "win32",
      });
      if (!runtimeReady(directory)) throw new Error("Remotion dependencies are incomplete; initialization did not succeed.");
    } finally { rmdirSync(lock); }
  }
  return directory;
}

function main(args) {
  if (args.includes("--help")) {
    console.log("Usage: node setup-remotion.mjs [init <empty-project-directory> | install <prepared-project-directory>]");
    return;
  }
  if (Number(process.versions.node.split(".")[0]) < 22) {
    throw new Error("Remotion setup needs Node.js 22 or newer and npm. Install them with the user's permission, then retry. No global packages were changed.");
  }
  let directory;
  if (args.length === 0) {
    if (runtimeReady(root)) directory = root;
    else {
      directory = runtimeDirectory();
      copyManifests(directory);
    }
  } else if (args.length === 2 && args[0] === "init") {
    directory = createProject(args[1]);
  } else if (args.length === 2 && args[0] === "install") {
    directory = path.resolve(args[1]);
    for (const file of manifests) {
      if (!readFileSync(path.join(directory, file)).equals(readFileSync(path.join(root, file)))) {
        throw new Error("This project has its own dependencies. Use its existing package manager and lockfile; no files were changed.");
      }
    }
  } else {
    throw new Error("Usage: node setup-remotion.mjs [init <empty-project-directory> | install <prepared-project-directory>]");
  }
  ensureRuntime(directory);
  console.log(JSON.stringify({ status: "ready", directory, remotionVersion: manifest.dependencies.remotion }));
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { main(process.argv.slice(2)); }
  catch (error) {
    console.error(`Remotion setup failed: ${error.message}`);
    process.exitCode = 1;
  }
}
