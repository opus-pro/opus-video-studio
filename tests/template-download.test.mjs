import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, access, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { downloadTemplate, selectTemplate, templateLocation } from "../plugins/opus-video-studio/scripts/download-template.mjs";
import { archiveEntries } from "../plugins/opus-video-studio/scripts/template-archive.mjs";

function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [filename, value, mode = 0x8000] of files) {
    const name = Buffer.from(filename), body = Buffer.from(value);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(body.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(body.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE((mode << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, body);
    centrals.push(central, name);
    offset += local.length + name.length + body.length;
  }
  const end = Buffer.alloc(22), directory = Buffer.concat(centrals);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
const bytes = zip([["project/package.json", '{"name":"source"}'], ["project/src/index.tsx", "original source"]]);
const entry = {
  id: "margin", published: true, kind: "template", title: "Template",
  mediaPath: "launch-videos/lite/source-v1", archive: "source.zip",
  sha256: createHash("sha256").update(bytes).digest("hex"), size: bytes.length,
  readingOrder: ["README.md", "src/index.tsx"],
};
const catalogue = { schemaVersion: 1, items: [entry] };

test("template URLs select only published sources in their own realm", () => {
  for (const host of ["labs.opus.pro", "stg-labs.opus.pro"]) {
    const location = templateLocation(`https://${host}/product-videos/margin?utm_source=test#preview`);
    assert.equal(location.id, "margin");
    assert.equal(location.base.includes("stg-"), host.startsWith("stg-"));
    assert.equal(selectTemplate(catalogue, location).sha256, entry.sha256);
  }
  for (const link of ["https://evil.test/product-videos/margin", "http://labs.opus.pro/product-videos/margin",
    "https://user@labs.opus.pro/product-videos/margin", "https://labs.opus.pro:4433/product-videos/margin",
    "https://labs.opus.pro/product-videos", "https://labs.opus.pro/product-videos/%2e%2e"]) {
    assert.throws(() => templateLocation(link));
  }
  const location = templateLocation("https://labs.opus.pro/product-videos/margin");
  for (const patch of [{ published: false }, { sha256: "" }, { archive: "../file.zip" }, { mediaPath: "//evil.test/a" }]) {
    assert.throws(() => selectTemplate({ ...catalogue, items: [{ ...entry, ...patch }] }, location));
  }
});

test("a successful download preserves exact source and receipt without executing it", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "opus-template-test-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const destination = path.join(temporary, "download");
  const requests = [];
  const receipt = await downloadTemplate("https://labs.opus.pro/product-videos/margin", destination, {
    fetcher: async (url, options) => {
      requests.push(url);
      assert.equal(options.redirect, "error");
      return new Response(url.endsWith("index.json") ? JSON.stringify(catalogue) : bytes);
    },
  });
  assert.equal(await readFile(path.join(receipt.projectDirectory, "src/index.tsx"), "utf8"), "original source");
  assert.equal(JSON.parse(await readFile(path.join(destination, "template-source.json"))).sha256, entry.sha256);
  assert.equal(requests.length, 2);
  await assert.rejects(downloadTemplate("https://labs.opus.pro/product-videos/margin", destination), /already exists/);
});

test("bad bytes never become an installed source and existing work is preserved", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "opus-template-test-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const target = path.join(temporary, "source");
  await assert.rejects(downloadTemplate("https://labs.opus.pro/product-videos/margin", target, {
    fetcher: async url => new Response(url.endsWith("index.json") ? JSON.stringify(catalogue) : Buffer.alloc(bytes.length)),
  }), /checksum/);
  await assert.rejects(access(target));
  await writeFile(target, "keep me");
  await assert.rejects(downloadTemplate("https://labs.opus.pro/product-videos/margin", target), /already exists/);
  assert.equal(await readFile(target, "utf8"), "keep me");
});

test("ZIP extraction rejects traversal, absolute paths, links and duplicate paths", () => {
  for (const name of ["../outside", "/absolute", "a/../../outside", "C:/outside", "a\\b"]) {
    assert.throws(() => archiveEntries(zip([[name, "bad"]])), /Unsafe/);
  }
  assert.throws(() => archiveEntries(zip([["link", "target", 0xa000]])), /Unsafe/);
  assert.throws(() => archiveEntries(zip([["file", "one"], ["FILE", "two"]])), /Unsafe/);
});
