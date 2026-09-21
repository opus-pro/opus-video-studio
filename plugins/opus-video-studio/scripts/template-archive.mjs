import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { inflateRawSync } from "node:zlib";

// Validate every entry before writing. Only regular files and directories are
// accepted; archives cannot create links or escape the new destination.
export function archiveEntries(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("Invalid ZIP directory");
  const count = bytes.readUInt16LE(end + 10);
  const size = bytes.readUInt32LE(end + 12);
  let offset = bytes.readUInt32LE(end + 16);
  if (bytes.readUInt32LE(end + 4) !== 0 || bytes.readUInt16LE(end + 8) !== count ||
      count === 0xffff || count > 20000 || offset + size !== end) throw new Error("Unsupported ZIP");
  const entries = [];
  const seen = new Set();
  let total = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error("Invalid ZIP entry");
    const flags = bytes.readUInt16LE(offset + 8);
    const method = bytes.readUInt16LE(offset + 10);
    const compressed = bytes.readUInt32LE(offset + 20);
    const expanded = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const local = bytes.readUInt32LE(offset + 42);
    const next = offset + 46 + nameLength + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
    if (next > end || local + 30 > bytes.length) throw new Error("Invalid ZIP bounds");
    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    const kind = (bytes.readUInt32LE(offset + 38) >>> 16) & 0xf000;
    if (!name || name.startsWith("/") || /[\\\x00-\x1f:]/.test(name) ||
        name.split("/").some(part => part === ".." || part === ".") ||
        seen.has(name.toLowerCase()) || (kind !== 0 && kind !== 0x8000 && kind !== 0x4000) ||
        flags & 1 || ![0, 8].includes(method)) throw new Error("Unsafe ZIP entry");
    seen.add(name.toLowerCase());
    total += expanded;
    if (total > 1_000_000_000 || expanded > 250_000_000) throw new Error("ZIP exceeds extraction limit");
    if (bytes.readUInt32LE(local) !== 0x04034b50) throw new Error("Invalid ZIP local header");
    const localNameLength = bytes.readUInt16LE(local + 26);
    const start = local + 30 + localNameLength + bytes.readUInt16LE(local + 28);
    if (bytes.subarray(local + 30, local + 30 + localNameLength).toString("utf8") !== name ||
        start + compressed > end) throw new Error("Invalid ZIP file bounds");
    entries.push({ name, directory: name.endsWith("/"), method, expanded, start, compressed });
    offset = next;
  }
  if (offset !== end) throw new Error("Invalid ZIP directory size");
  return entries;
}

export async function extractArchive(bytes, directory) {
  const entries = archiveEntries(bytes);
  const packages = entries.filter(entry => /(^|\/)package\.json$/.test(entry.name) &&
    !entry.name.includes("node_modules/"));
  const root = packages.sort((a, b) => a.name.split("/").length - b.name.split("/").length)[0];
  if (!root) throw new Error("Template source has no package.json");
  const project = path.posix.dirname(root.name);
  const prefix = project === "." ? "" : project + "/";
  if (!entries.some(entry => entry.name.startsWith(prefix + "src/") && /\.[cm]?[jt]sx?$/.test(entry.name))) {
    throw new Error("Template archive has no animation source");
  }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.directory) {
      await mkdir(target, { recursive: true });
      continue;
    }
    await mkdir(path.dirname(target), { recursive: true });
    const raw = bytes.subarray(entry.start, entry.start + entry.compressed);
    const content = entry.method === 8 ? inflateRawSync(raw, { maxOutputLength: Math.max(1, entry.expanded) }) : raw;
    if (content.length !== entry.expanded) throw new Error("Invalid ZIP file size");
    await writeFile(target, content, { flag: "wx" });
  }
  return project;
}
