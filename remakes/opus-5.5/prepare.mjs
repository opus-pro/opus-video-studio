// SPDX-License-Identifier: MIT
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareTemplate } from "../../templates/prepare.mjs";

export const remakesRoot = fileURLToPath(new URL("./", import.meta.url));
export const readRemakes = async () => JSON.parse(await readFile(path.join(remakesRoot, "catalog.json"), "utf8"));

// A remake reuses its original template's media, so it is restored from the same
// immutable, checksummed release with the template preparation code.
export const prepareRemake = (item, options = {}) => prepareTemplate(item, { root: remakesRoot, ...options });

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [, , id, archivePath, extra] = process.argv;
    const item = (await readRemakes()).items.find(item => item.id === id);
    if (!item || extra) throw new Error("Usage: npm run remakes:prepare -- <component-id> [local-release.zip]");
    const result = await prepareRemake(item, { archivePath });
    console.log(`Restored ${result.restored} missing media files. Existing files were preserved.`);
    console.log(`Project: ${result.project}\nNext: cd into the project, then npm ci && npm run studio`);
  } catch (error) {
    console.error(error.code === "ENOENT" && error.syscall?.startsWith("spawn")
      ? "Install unzip and retry; no package scripts were run." : error.message);
    process.exitCode = 1;
  }
}
