import assert from "node:assert/strict";
import { test } from "node:test";
import type { RecordReviewAdapter, ReviewPrincipal, ReviewRecord } from "../domain/types.ts";

export interface AdapterHarness {
  adapter: RecordReviewAdapter;
  principal: ReviewPrincipal;
  recordId: string;
  cleanup(): Promise<void>;
  reopen?(): Promise<RecordReviewAdapter>;
}

export function runAdapterContract(name: string, create: () => Promise<AdapterHarness>): void {
  test(`${name}: rejects a stale write with the authoritative record`, async () => {
    const harness = await create();
    try {
      const first = await harness.adapter.get(harness.principal, harness.recordId);
      assert(first);
      const committed = await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: first.record.revision,
        idempotencyKey: "stale-first",
        changes: { summary: "First accepted summary." },
      });
      assert.equal(committed.kind, "committed");
      const stale = await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: first.record.revision,
        idempotencyKey: "stale-second",
        changes: { summary: "This draft used an old revision." },
      });
      assert.equal(stale.kind, "conflict");
      if (stale.kind === "conflict") assert.equal(stale.current.revision, first.record.revision + 1);
    } finally { await harness.cleanup(); }
  });

  test(`${name}: rejects an invalid status transition`, async () => {
    const harness = await create();
    try {
      const detail = await harness.adapter.get(harness.principal, harness.recordId);
      assert(detail);
      const result = await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: detail.record.revision,
        idempotencyKey: "invalid-transition",
        changes: {},
        requestedStatus: "approved",
      });
      assert.equal(result.kind, "validation-failed");
      if (result.kind === "validation-failed") assert.match(result.fieldErrors.status ?? "", /Cannot move/);
    } finally { await harness.cleanup(); }
  });

  test(`${name}: commits the same command once`, async () => {
    const harness = await create();
    try {
      const detail = await harness.adapter.get(harness.principal, harness.recordId);
      assert(detail);
      const command = {
        recordId: harness.recordId,
        expectedRevision: detail.record.revision,
        idempotencyKey: "double-commit",
        changes: { summary: "One durable change." },
      } as const;
      const first = await harness.adapter.commit(harness.principal, command);
      const second = await harness.adapter.commit(harness.principal, command);
      assert.equal(first.kind, "committed");
      assert.equal(second.kind, "committed");
      if (first.kind === "committed" && second.kind === "committed") {
        assert.equal(first.record.revision, second.record.revision);
        assert.equal(first.replayed, false);
        assert.equal(second.replayed, true);
      }
      const rebound = await harness.adapter.commit(harness.principal, { ...command, changes: { summary: "Different command." } });
      assert.equal(rebound.kind, "validation-failed");
    } finally { await harness.cleanup(); }
  });

  test(`${name}: reports unknown and known operation status`, async () => {
    const harness = await create();
    try {
      assert.equal((await harness.adapter.getOperation(harness.principal, "not-written")).kind, "unknown");
      const detail = await harness.adapter.get(harness.principal, harness.recordId);
      assert(detail);
      await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: detail.record.revision,
        idempotencyKey: "lost-response",
        changes: { summary: "Committed before the response disappeared." },
      });
      const status = await harness.adapter.getOperation(harness.principal, "lost-response");
      assert.equal(status.kind, "known");
      if (status.kind === "known") assert.equal(status.outcome.kind, "committed");
      if (harness.reopen) {
        const reopened = await harness.reopen();
        assert.equal((await reopened.getOperation(harness.principal, "lost-response")).kind, "known");
      }
    } finally { await harness.cleanup(); }
  });

  test(`${name}: refuses undo after a competing change`, async () => {
    const harness = await create();
    try {
      const detail = await harness.adapter.get(harness.principal, harness.recordId);
      assert(detail);
      const first = await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: detail.record.revision,
        idempotencyKey: "undo-target",
        changes: { summary: "First change." },
      });
      assert.equal(first.kind, "committed");
      assert(first.kind === "committed");
      const second = await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: first.record.revision,
        idempotencyKey: "competing-change",
        changes: { title: "Later title" },
      });
      assert.equal(second.kind, "committed");
      assert(second.kind === "committed");
      const undo = await harness.adapter.undo(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: second.record.revision,
        idempotencyKey: "undo-after-competing",
        targetOperationId: "undo-target",
      });
      assert.equal(undo.kind, "conflict");
      if (undo.kind === "conflict") assert.match(undo.message, /later change/i);
    } finally { await harness.cleanup(); }
  });

  test(`${name}: applies an eligible undo as a new revision`, async () => {
    const harness = await create();
    try {
      const detail = await harness.adapter.get(harness.principal, harness.recordId);
      assert(detail);
      const original = detail.record.summary;
      const committed = await harness.adapter.commit(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: detail.record.revision,
        idempotencyKey: "eligible-target",
        changes: { summary: "Temporary summary." },
      });
      assert(committed.kind === "committed");
      const undone = await harness.adapter.undo(harness.principal, {
        recordId: harness.recordId,
        expectedRevision: committed.record.revision,
        idempotencyKey: "eligible-undo",
        targetOperationId: committed.operationId,
      });
      assert(undone.kind === "committed");
      assert.equal(undone.record.summary, original);
      assert.equal(undone.record.revision, committed.record.revision + 1);
    } finally { await harness.cleanup(); }
  });
}

export function fixture(id = "record-1", title = "Fixture record"): ReviewRecord {
  return {
    id,
    revision: 1,
    title,
    reference: "FIXTURE-1",
    summary: "Ready for deterministic adapter checks.",
    status: "needs-information",
    updatedAt: "2026-09-11T08:00:00.000Z",
  };
}
