import { MemoryReviewAdapter } from "../record-review/adapters/memory.ts";
import { assertApprovedPayload, decisionCommand, freezeActionForReview } from "./recipe.ts";

const principal = { scopeId: "approval-example", actorLabel: "Local approver", canDecide: true };
const action = freezeActionForReview({
  actionId: "action-1001",
  revision: 1,
  actionType: "create task",
  payload: { title: "Inspect north quay notes", priority: "normal" },
  createdAt: "2026-09-11T10:00:00.000Z",
});
const adapter = new MemoryReviewAdapter({ fixtures: { [principal.scopeId]: [action.reviewRecord] } });
const outcome = await adapter.commit(principal, decisionCommand(action, "approved", "approval-example-1"));
if (outcome.kind !== "committed") throw new Error(`Approval failed: ${outcome.kind}`);
assertApprovedPayload(action, outcome.record, action.action.payload);
process.stdout.write(`${JSON.stringify({ outcome: outcome.kind, status: outcome.record.status, payloadFingerprint: action.payloadFingerprint }, null, 2)}\n`);
