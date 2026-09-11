"use client";

import { useState } from "react";
import { Alert, Badge, Button } from "@noorddev/vlak-react";
import { MemoryReviewAdapter } from "../../../../examples/workflows/record-review/adapters/memory";
import { assertApprovedPayload, decisionCommand, freezeActionForReview } from "../../../../examples/workflows/action-approval/recipe";

const principal = { scopeId: "approval-site-example", actorLabel: "Local approver", canDecide: true };
const actionInput = {
  actionId: "action-1001",
  revision: 1,
  actionType: "create task",
  payload: { title: "Inspect north quay notes", priority: "normal" },
  createdAt: "2026-09-11T10:00:00.000Z",
} as const;

function createSession() {
  const review = freezeActionForReview(actionInput);
  return { review, adapter: new MemoryReviewAdapter({ fixtures: { [principal.scopeId]: [review.reviewRecord] } }) };
}

export function ActionApprovalDemo() {
  const [session, setSession] = useState(createSession);
  const [outcome, setOutcome] = useState<"pending" | "approved" | "rejected">("pending");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("The payload is frozen for this local decision.");

  const decide = async (decision: "approved" | "rejected") => {
    if (busy || outcome !== "pending") return;
    setBusy(true);
    try {
      const result = await session.adapter.commit(principal, decisionCommand(session.review, decision, `approval-site-${decision}`));
      if (result.kind === "committed") {
        if (decision === "approved") assertApprovedPayload(session.review, result.record, session.review.action.payload);
        setOutcome(decision);
        setMessage(decision === "approved" ? "Approval recorded for this exact payload." : "Rejection recorded. The action remains unexecuted.");
      } else setMessage(`The local decision was not recorded: ${result.kind}.`);
    } catch { setMessage("The local decision could not be recorded. The frozen payload is unchanged."); }
    finally { setBusy(false); }
  };

  const reset = () => {
    setSession(createSession());
    setOutcome("pending");
    setMessage("The payload is frozen for this local decision.");
  };

  return <section className="workflow-live-example" aria-labelledby="approval-example-title">
    <header className="workflow-example-header"><div><p className="section-label">Local memory example</p><h2 id="approval-example-title">Review one frozen action</h2></div><Badge variant={outcome === "pending" ? "muted" : "solid"}>{outcome}</Badge></header>
    <div className="workflow-approval-layout">
      <section aria-labelledby="approval-action-title"><span className="workflow-example-kicker">Action</span><h3 id="approval-action-title">Create task</h3><dl className="workflow-example-description"><div><dt>Title</dt><dd>Inspect north quay notes</dd></div><div><dt>Priority</dt><dd>Normal</dd></div><div><dt>Revision</dt><dd>{session.review.action.revision}</dd></div></dl></section>
      <section aria-labelledby="approval-payload-title"><span className="workflow-example-kicker">Frozen payload</span><h3 id="approval-payload-title">Version marker</h3><code className="workflow-fingerprint">{session.review.payloadFingerprint}</code><pre>{JSON.stringify(session.review.action.payload, null, 2)}</pre></section>
    </div>
    <div className="workflow-example-status"><Alert live="polite" title="Approval status">{message}</Alert></div>
    <div className="workflow-example-controls">
      {outcome === "pending" ? <><Button disabled={busy} onClick={() => void decide("approved")}>{busy ? "Recording…" : "Approve exact payload"}</Button><Button variant="ghost" disabled={busy} onClick={() => void decide("rejected")}>Reject action</Button></> : <Button variant="ghost" disabled={busy} onClick={reset}>Reset local example</Button>}
    </div>
    <p className="workflow-example-boundary">This example records a local decision only. Authentication, signed approval, and action execution remain host responsibilities.</p>
  </section>;
}
