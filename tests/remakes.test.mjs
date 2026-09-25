import assert from "node:assert/strict";
import test from "node:test";
import { readCatalogue } from "../templates/prepare.mjs";
import { checkRemakes } from "../remakes/opus-5.5/check.mjs";
import { readRemakes } from "../remakes/opus-5.5/prepare.mjs";

test("every motion component has an intact Claude Opus 5.5 remake built on its original release", async () => {
  const [remakes, templates] = await Promise.all([readRemakes(), readCatalogue()]);
  const components = templates.items.filter(item => item.kind === "component").map(item => item.id).sort();
  assert.deepEqual(remakes.items.map(item => item.id).sort(), components);
  const result = await checkRemakes({ catalogue: remakes, templates });
  assert.equal(result.remakes, 34);
  assert.ok(result.sourceFiles > 300);
});

test("remakes record the blind protocol inputs and their spec tier", async () => {
  const { items } = await readRemakes();
  for (const item of items) {
    assert.ok(item.files.some(file => file.path === "TASK.md"), `${item.id}: prompt missing`);
    assert.ok(item.files.some(file => file.path === "BUILD-LOG.md"), `${item.id}: build log missing`);
  }
  assert.equal(items.filter(item => item.spec === "brief").length, 7);
});
