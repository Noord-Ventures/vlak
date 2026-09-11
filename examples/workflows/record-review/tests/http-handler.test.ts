import assert from "node:assert/strict";
import { test } from "node:test";
import { MemoryReviewAdapter } from "../adapters/memory.ts";
import { createRecordReviewHandler } from "../handlers/reference/handler.ts";
import { fixture } from "./adapter-contract.ts";

test("HTTP handler requires its external ownership adapter", async () => {
  const adapter = new MemoryReviewAdapter();
  const handler = createRecordReviewHandler({ adapter, ownership: { authenticate: async () => null } });
  const result = await handler({ method: "GET", url: "/api/records", headers: {} });
  assert.equal(result.status, 401);
});

test("HTTP handler ignores client ownership fields and scopes operations", async () => {
  const principal = { scopeId: "trusted-scope", actorLabel: "Trusted actor", canDecide: true };
  const other = { ...principal, scopeId: "body-scope" };
  const adapter = new MemoryReviewAdapter({ fixtures: {
    [principal.scopeId]: [fixture("same-record", "Trusted record")],
    [other.scopeId]: [fixture("same-record", "Other record")],
  } });
  const handler = createRecordReviewHandler({ adapter, ownership: { authenticate: async () => principal } });
  const result = await handler({
    method: "POST",
    url: "/api/records/same-record/commits",
    headers: { "content-type": "application/json" },
    body: { scopeId: other.scopeId, actorLabel: "Forged actor", canDecide: true, expectedRevision: 1, idempotencyKey: "http-owned", changes: { summary: "Trusted scope update." } },
  });
  assert.equal(result.status, 200);
  assert.equal((await adapter.get(principal, "same-record"))?.record.revision, 2);
  assert.equal((await adapter.get(other, "same-record"))?.record.revision, 1);
  assert.equal((await adapter.getOperation(other, "http-owned")).kind, "unknown");
});

test("HTTP handler returns a typed validation outcome for malformed mutation JSON", async () => {
  const principal = { scopeId: "scope", actorLabel: "Trusted actor", canDecide: true };
  const handler = createRecordReviewHandler({ adapter: new MemoryReviewAdapter(), ownership: { authenticate: async () => principal } });
  const result = await handler({ method: "POST", url: "/api/records/record-1/commits", headers: {}, body: { changes: [] } });
  assert.equal(result.status, 422);
  assert.deepEqual(result.body, { kind: "validation-failed", fieldErrors: { request: "Commit requires an expected revision, idempotency key, and changes object." } });
});
