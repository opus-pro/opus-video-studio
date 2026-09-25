import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { checkTemplates } from "../templates/check.mjs";
import { prepareTemplate, readCatalogue, sha256 } from "../templates/prepare.mjs";

test("the complete published catalogue has intact editable source and demo links", async () => {
  const catalogue = await readCatalogue();
  assert.equal(catalogue.items.filter(item => item.kind === "template").length, 9);
  assert.equal(catalogue.items.filter(item => item.kind === "component").length, 34);
  const result = await checkTemplates({ catalogue });
  assert.equal(result.templates, 43);
  assert.ok(result.sourceFiles > 800);
});

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "opus-assets-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const asset = Buffer.from("example media");
  const staging = path.join(root, "input");
  await mkdir(path.join(staging, "release/public"), { recursive: true });
  await writeFile(path.join(staging, "release/public/asset.png"), asset);
  const archivePath = path.join(root, "release.zip");
  execFileSync("zip", ["-q", archivePath, "release/public/asset.png"], { cwd: staging });
  const archive = await readFile(archivePath);
  const item = {
    id: "example", sourcePath: "example/project", archiveBytes: archive.length,
    archiveSha256: sha256(archive),
    archiveUrl: "https://opus-lab.cdn.opuslab.ai/labs/launch-videos/lite/example/release.zip",
    files: [{ path: "public/asset.png", archivePath: "release/public/asset.png", storage: "download", bytes: asset.length, sha256: sha256(asset) }],
  };
  return { root, archivePath, archive, asset, item, target: path.join(root, "example/project/public/asset.png") };
}

test("preparation restores verified media and preserves later user edits without a download", async t => {
  const f = await fixture(t);
  assert.equal((await prepareTemplate(f.item, f)).restored, 1);
  assert.deepEqual(await readFile(f.target), f.asset);
  await writeFile(f.target, "user replacement");
  const result = await prepareTemplate(f.item, { root: f.root, fetcher: () => { throw new Error("Unexpected network call"); } });
  assert.equal(result.restored, 0);
  assert.equal(await readFile(f.target, "utf8"), "user replacement");
});

test("a corrupt archive or corrupt asset record writes no files", async t => {
  const f = await fixture(t);
  await assert.rejects(prepareTemplate({ ...f.item, archiveSha256: "0".repeat(64) }, f), /SHA-256 mismatch/);
  await assert.rejects(readFile(f.target), { code: "ENOENT" });
  const files = [{ ...f.item.files[0], sha256: "0".repeat(64) }];
  await assert.rejects(prepareTemplate({ ...f.item, files }, f), /Asset checksum mismatch/);
  await assert.rejects(readFile(f.target), { code: "ENOENT" });
});

test("preparation rejects traversal and symbolic-link destinations", async t => {
  const f = await fixture(t);
  const files = [{ ...f.item.files[0], path: "../../escape.png" }];
  await assert.rejects(prepareTemplate({ ...f.item, files }, f), /Invalid asset metadata/);
  await mkdir(path.join(f.root, "example/project"), { recursive: true });
  await symlink(path.join(f.root, "input"), path.join(f.root, "example/project/public"));
  await assert.rejects(prepareTemplate(f.item, f), /Refusing symlink/);
});

test("network preparation uses a bounded public release request and validates the response", async t => {
  const f = await fixture(t);
  const fetcher = async (url, options) => {
    assert.equal(url, f.item.archiveUrl);
    assert.equal(options.redirect, "error");
    return new Response(f.archive);
  };
  assert.equal((await prepareTemplate(f.item, { root: f.root, fetcher })).restored, 1);
  await rm(f.target);
  await assert.rejects(prepareTemplate(f.item, { root: f.root, fetcher: async () => new Response(Buffer.alloc(f.archive.length + 1)) }), /exceeds expected size/);
  await assert.rejects(prepareTemplate({ ...f.item, archiveUrl: "https://example.com/release.zip" }, { root: f.root, fetcher }), /Unsupported release URL/);
});
