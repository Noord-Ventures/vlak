import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { workflowCatalog } from "../../catalog.ts";

test("workflow catalog has unique IDs and resolvable explicit sources", async () => {
  assert.equal(new Set(workflowCatalog.map(kit => kit.id)).size, workflowCatalog.length);
  const workflowRoot = resolve(import.meta.dirname, "../..");
  for (const kit of workflowCatalog) {
    assert.equal(kit.schemaVersion, 1);
    assert(kit.sources.length > 0);
    assert(kit.ownership.hostProvides.length > 0);
    for (const source of kit.sources) {
      assert(source.path.startsWith("examples/workflows/"));
      await access(resolve(workflowRoot, source.path.slice("examples/workflows/".length)));
    }
  }
});
