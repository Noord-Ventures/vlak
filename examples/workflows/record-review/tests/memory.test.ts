import assert from "node:assert/strict";
import { test } from "node:test";
import { MemoryReviewAdapter } from "../adapters/memory.ts";
import { fixture, runAdapterContract } from "./adapter-contract.ts";

const principal = { scopeId: "scope-a", actorLabel: "Fixture operator", canDecide: true } as const;
const clock = { now: () => "2026-09-11T10:00:00.000Z" };

runAdapterContract("memory adapter", async () => ({
  adapter: new MemoryReviewAdapter({ fixtures: { [principal.scopeId]: [fixture()] }, clock }),
  principal,
  recordId: "record-1",
  cleanup: async () => undefined,
}));

test("memory adapter keeps ownership scopes independent", async () => {
  const scopeA = { ...principal, scopeId: "organization-a" };
  const scopeB = { ...principal, scopeId: "organization-b" };
  const adapter = new MemoryReviewAdapter({
    fixtures: {
      [scopeA.scopeId]: [fixture("shared-id", "Organization A fixture")],
      [scopeB.scopeId]: [fixture("shared-id", "Organization B fixture")],
    },
    clock,
  });
  const a = await adapter.get(scopeA, "shared-id");
  const b = await adapter.get(scopeB, "shared-id");
  assert.equal(a?.record.title, "Organization A fixture");
  assert.equal(b?.record.title, "Organization B fixture");
  await adapter.commit(scopeA, { recordId: "shared-id", expectedRevision: 1, idempotencyKey: "owned-write", changes: { summary: "Only A changes." } });
  assert.equal((await adapter.get(scopeA, "shared-id"))?.record.revision, 2);
  assert.equal((await adapter.get(scopeB, "shared-id"))?.record.revision, 1);
  assert.equal((await adapter.getOperation(scopeB, "owned-write")).kind, "unknown");
});

test("memory adapter bounds public history", async () => {
  const adapter = new MemoryReviewAdapter({ fixtures: { [principal.scopeId]: [fixture()] }, clock, historyLimit: 2 });
  for (let index = 0; index < 3; index++) {
    const detail = await adapter.get(principal, "record-1");
    assert(detail);
    const result = await adapter.commit(principal, {
      recordId: "record-1",
      expectedRevision: detail.record.revision,
      idempotencyKey: `bounded-${index}`,
      changes: { summary: `Summary ${index}` },
    });
    assert.equal(result.kind, "committed");
  }
  const detail = await adapter.get(principal, "record-1");
  assert.deepEqual(detail?.history.map(entry => entry.operationId), ["bounded-1", "bounded-2"]);
});
