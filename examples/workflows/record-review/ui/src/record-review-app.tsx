import {
  Alert,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Select,
  Spinner,
  Textarea,
} from "@noorddev/vlak-react";
import * as React from "react";
import type {
  ReviewChangeSet,
  ReviewFieldErrors,
  ReviewHistoryEntry,
  ReviewRecord,
  ReviewRecordDetail,
  ReviewStatus,
} from "../../domain/types.ts";
import { RecordReviewHttpClient, type TransportWriteResult } from "../../transports/http/client.ts";

type Phase = "viewing" | "editing" | "reviewing" | "submitting" | "confirmed" | "conflict" | "outcome-unknown";
type Draft = Pick<ReviewRecord, "title" | "reference" | "summary" | "status">;
type PendingWrite =
  | { kind: "commit"; recordId: string; expectedRevision: number; idempotencyKey: string; changes: ReviewChangeSet; requestedStatus?: ReviewStatus }
  | { kind: "undo"; recordId: string; expectedRevision: number; idempotencyKey: string; targetOperationId: string };
type NavigationIntent = { recordId: string | null };

const defaultClient = new RecordReviewHttpClient();
export type ReviewClient = Pick<RecordReviewHttpClient, "list" | "get" | "commit" | "undo" | "getOperation">;
const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "needs-information", label: "Needs information" },
  { value: "ready-for-review", label: "Ready for review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusLabel = (status: ReviewStatus) => status.split("-").map(word => `${word[0]?.toUpperCase()}${word.slice(1)}`).join(" ");
const badgeVariant = (status: ReviewStatus) => status === "approved" ? "solid" : status === "needs-information" ? "muted" : "outline";
const toDraft = (record: ReviewRecord): Draft => ({ title: record.title, reference: record.reference, summary: record.summary, status: record.status });

export function RecordReviewApp({ client = defaultClient, embedded = false }: { client?: ReviewClient; embedded?: boolean } = {}) {
  const Frame = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";
  const [records, setRecords] = React.useState<ReviewRecord[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<ReviewRecordDetail | null>(null);
  const [phase, setPhase] = React.useState<Phase>("viewing");
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [filter, setFilter] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [errors, setErrors] = React.useState<ReviewFieldErrors>({});
  const [message, setMessage] = React.useState("");
  const [pending, setPending] = React.useState<PendingWrite | null>(null);
  const [conflict, setConflict] = React.useState<ReviewRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [navigationIntent, setNavigationIntent] = React.useState<NavigationIntent | null>(null);
  const alive = React.useRef(true);
  const listRequest = React.useRef(0);
  const detailRequest = React.useRef(0);
  const selected = React.useRef<string | null>(selectedId);
  selected.current = selectedId;

  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      listRequest.current++;
      detailRequest.current++;
    };
  }, []);

  const loadList = React.useCallback(async () => {
    const request = ++listRequest.current;
    const next = await client.list({ status: filter ? filter as ReviewStatus : undefined, query });
    if (alive.current && request === listRequest.current) setRecords(next);
  }, [client, filter, query]);

  React.useEffect(() => {
    let current = true;
    setLoading(true);
    loadList().catch(() => current && setMessage("Could not load records. Start the reference server and try again.")).finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [loadList]);

  const choose = async (recordId: string | null) => {
    const request = ++detailRequest.current;
    selected.current = recordId;
    setSelectedId(recordId);
    setDetail(null);
    setMessage("");
    setPhase("viewing");
    if (!recordId) return;
    try {
      const next = await client.get(recordId);
      if (alive.current && request === detailRequest.current && selected.current === recordId) setDetail(next);
    }
    catch { if (alive.current && request === detailRequest.current) setMessage("Could not load this record."); }
  };

  const requestNavigation = (recordId: string | null) => {
    if (recordId === selectedId) return;
    if (draft) { setNavigationIntent({ recordId }); return; }
    void choose(recordId);
  };

  const discardDraft = () => {
    setDraft(null);
    setErrors({});
    setPending(null);
    setConflict(null);
    setMessage("");
    setPhase("viewing");
  };

  const discardAndNavigate = () => {
    if (!navigationIntent) return;
    const { recordId } = navigationIntent;
    setNavigationIntent(null);
    discardDraft();
    void choose(recordId);
  };

  const refresh = async (recordId: string) => {
    const request = ++detailRequest.current;
    const [nextDetail] = await Promise.all([client.get(recordId), loadList()]);
    if (alive.current && request === detailRequest.current && selected.current === recordId) setDetail(nextDetail);
  };

  const startEditing = () => {
    if (!detail) return;
    setDraft(toDraft(detail.record));
    setErrors({});
    setMessage("");
    setPhase("editing");
  };

  const review = (event: React.FormEvent) => {
    event.preventDefault();
    if (!detail || !draft) return;
    const nextErrors: ReviewFieldErrors = {};
    if (!draft.title.trim()) nextErrors.title = "Title is required.";
    if (!draft.reference.trim()) nextErrors.reference = "Reference is required.";
    if (!draft.summary.trim()) nextErrors.summary = "Summary is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const changes = Object.fromEntries((["title", "reference", "summary"] as const)
      .filter(field => draft[field] !== detail.record[field])
      .map(field => [field, draft[field]])) as ReviewChangeSet;
    const command = {
      kind: "commit" as const,
      recordId: detail.record.id,
      expectedRevision: detail.record.revision,
      idempotencyKey: crypto.randomUUID(),
      changes,
      requestedStatus: draft.status === detail.record.status ? undefined : draft.status,
    };
    setPending(command);
    setPhase("reviewing");
  };

  const applyOutcome = async (outcome: TransportWriteResult, operation: PendingWrite["kind"] = pending?.kind ?? "commit", recovered = false) => {
    if (outcome.kind === "outcome-unknown") {
      setMessage(outcome.message);
      return setPhase("outcome-unknown");
    }
    if (outcome.kind === "validation-failed") {
      setErrors(outcome.fieldErrors);
      setMessage("The server found fields that need attention.");
      return setPhase("editing");
    }
    if (outcome.kind === "conflict") {
      if (operation === "undo") {
        await refresh(outcome.current.id);
        setPending(null);
        setMessage(outcome.message);
        return setPhase("viewing");
      }
      setConflict(outcome.current);
      setMessage(outcome.message);
      return setPhase("conflict");
    }
    if (outcome.kind === "committed") {
      await refresh(outcome.record.id);
      setDraft(null);
      setPending(null);
      setMessage(outcome.replayed || recovered ? "The existing committed result was recovered." : operation === "undo" ? "The change was undone in a new revision." : "The record was committed.");
      return setPhase("confirmed");
    }
    if (outcome.kind === "unavailable") {
      setMessage(outcome.message);
      setPhase(operation === "commit" ? "editing" : "viewing");
      return;
    }
    setMessage("The record no longer exists.");
    setPhase("viewing");
  };

  const submit = async () => {
    if (pending?.kind !== "commit" || phase === "submitting") return;
    setPhase("submitting");
    const { kind: _kind, recordId, ...command } = pending;
    try { await applyOutcome(await client.commit(recordId, command), "commit"); }
    catch { setMessage("The write failed before an outcome was returned. Your draft is preserved."); setPhase("editing"); }
  };

  const resolveUnknown = async () => {
    if (!pending) return;
    setPhase("submitting");
    try {
      const status = await client.getOperation(pending.idempotencyKey);
      if (status.kind === "known") await applyOutcome(status.outcome, pending.kind, true);
      else {
        setMessage("No operation is recorded. You can safely retry with the same idempotency key.");
        setPhase("outcome-unknown");
      }
    } catch {
      setMessage("Operation status is still unavailable. Try the status check again.");
      setPhase("outcome-unknown");
    }
  };

  const retryUnknown = async () => {
    if (!pending) return;
    setPhase("submitting");
    try {
      if (pending.kind === "commit") {
        const { kind, recordId, ...command } = pending;
        await applyOutcome(await client.commit(recordId, command), kind);
      } else {
        const { kind, recordId, ...command } = pending;
        await applyOutcome(await client.undo(recordId, command), kind);
      }
    } catch {
      setMessage("The retry failed before an outcome was returned. Check operation status again.");
      setPhase("outcome-unknown");
    }
  };

  const keepDraft = () => {
    if (!conflict || !draft) return;
    setDetail(current => current ? { ...current, record: conflict } : { record: conflict, history: [] });
    setPending(null);
    setConflict(null);
    setPhase("editing");
    setMessage("Your draft is preserved against the latest server revision. Review it again before submitting.");
  };

  const acceptServerRecord = async () => {
    if (!conflict) return;
    setDraft(toDraft(conflict));
    setPending(null);
    setConflict(null);
    setPhase("viewing");
    await refresh(conflict.id);
  };

  const undo = async (entry: ReviewHistoryEntry) => {
    if (!detail) return;
    const command = {
      kind: "undo" as const,
      recordId: detail.record.id,
      expectedRevision: detail.record.revision,
      idempotencyKey: crypto.randomUUID(),
      targetOperationId: entry.operationId,
    };
    setPending(command);
    setPhase("submitting");
    const { kind: _kind, recordId: _recordId, ...body } = command;
    try { await applyOutcome(await client.undo(command.recordId, body), "undo"); }
    catch { setMessage("Undo failed before an outcome was returned. The record was not changed by this client."); setPhase("viewing"); }
  };

  const before = detail ? JSON.stringify(toDraft(detail.record), null, 2) : "";
  const after = draft ? JSON.stringify(draft, null, 2) : "";

  return <Frame className="workflow-reference" data-embedded={embedded} aria-label="Record review example">
    <header className="workflow-heading">
      <div><p className="eyebrow">{embedded ? "Local example" : "Workflow kit"}</p>{!embedded && <Heading>Record review</Heading>}</div>
      <p>Review local fixture records through the same revision and recovery contract an application can adapt.</p>
    </header>
    <section className="workflow-filters" aria-label="Record filters">
      <Field><FieldLabel htmlFor="record-query">Search</FieldLabel><Input plain id="record-query" type="search" value={query} onChange={event => setQuery(event.currentTarget.value)} /></Field>
      <Field><FieldLabel id="record-status-label">Status</FieldLabel><Select aria-labelledby="record-status-label" options={statusOptions} value={filter} onValueChange={setFilter} /></Field>
      <div className="workflow-result-count"><span role="status">{records.length} {records.length === 1 ? "result" : "results"}</span>{filter && <Button variant="ghost" onClick={() => setFilter("")}>Clear status</Button>}</div>
    </section>
    {message && phase === "viewing" && <Alert live="polite" title="Workflow status">{message}</Alert>}
    {loading ? <div className="workflow-loading"><Spinner label="Loading records" /></div> : <div className="workflow-master">
      <nav aria-label="Records" className={selectedId ? "workflow-list workflow-list-hidden-mobile" : "workflow-list"}>
        <ul>{records.map(record => <li key={record.id}><button type="button" aria-current={selectedId === record.id ? "true" : undefined} onClick={() => requestNavigation(record.id)}><strong>{record.title}</strong><span>{record.reference} · {statusLabel(record.status)}</span></button></li>)}</ul>
      </nav>
      <section className={!selectedId ? "workflow-panel workflow-panel-hidden-mobile" : "workflow-panel"} aria-label="Record details">
        {selectedId && <Button className="workflow-back" variant="ghost" onClick={() => requestNavigation(null)}>Back to records</Button>}
        {selectedId && !detail && <Spinner label="Loading record" />}
        {detail && <><h2>{detail.record.title}</h2><RecordPanel detail={detail} phase={phase} draft={draft} errors={errors} message={message} onEdit={startEditing} onDraft={setDraft} onReview={review} onCancel={discardDraft} onUndo={undo} /></>}
        {!selectedId && <p>Select a record to see its details.</p>}
      </section>
    </div>}

    <Dialog open={navigationIntent !== null} onClose={() => setNavigationIntent(null)}>
      <DialogTitle>Discard this draft?</DialogTitle>
      <DialogBody>Your unsaved changes stay in the editor unless you choose to discard them.</DialogBody>
      <DialogActions><Button variant="ghost" onClick={() => setNavigationIntent(null)}>Keep editing</Button><Button onClick={discardAndNavigate}>Discard draft and continue</Button></DialogActions>
    </Dialog>

    <Dialog open={phase === "reviewing" || phase === "submitting"} dismissable={phase !== "submitting"} onClose={() => setPhase("editing")}>
      <DialogTitle>Review the change</DialogTitle>
      <DialogBody>The server will compare expected revision {pending?.expectedRevision} before committing.</DialogBody>
      <DraftDiff before={before} after={after} beforeLabel="Current" afterLabel="Proposed" />
      <DialogActions>
        <Button variant="ghost" disabled={phase === "submitting"} onClick={() => setPhase("editing")}>Back</Button>
        <Button disabled={phase === "submitting"} onClick={() => void submit()}>{phase === "submitting" ? "Submitting…" : "Commit change"}</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={phase === "conflict"} dismissable={false} onClose={() => undefined}>
      <DialogTitle>Resolve a newer revision</DialogTitle>
      <DialogBody>{message} Your draft remains available.</DialogBody>
      {conflict && draft && <DraftDiff before={JSON.stringify(toDraft(conflict), null, 2)} after={JSON.stringify(draft, null, 2)} beforeLabel={`Server revision ${conflict.revision}`} afterLabel="Your draft" />}
      <DialogActions><Button variant="ghost" onClick={() => void acceptServerRecord()}>Use server record</Button><Button onClick={keepDraft}>Keep my draft</Button></DialogActions>
    </Dialog>

    <Dialog open={phase === "outcome-unknown"} dismissable={false} onClose={() => undefined}>
      <DialogTitle>Write outcome unknown</DialogTitle><DialogBody>{message}</DialogBody>
      <DialogActions><Button variant="ghost" onClick={() => void retryUnknown()}>Retry same request</Button><Button onClick={() => void resolveUnknown()}>Check operation status</Button></DialogActions>
    </Dialog>
  </Frame>;
}

interface RecordPanelProps {
  detail: ReviewRecordDetail;
  phase: Phase;
  draft: Draft | null;
  errors: ReviewFieldErrors;
  message: string;
  onEdit(): void;
  onDraft(draft: Draft): void;
  onReview(event: React.FormEvent): void;
  onCancel(): void;
  onUndo(entry: ReviewHistoryEntry): Promise<void>;
}

function RecordPanel({ detail, phase, draft, errors, message, onEdit, onDraft, onReview, onCancel, onUndo }: RecordPanelProps) {
  const { record, history } = detail;
  const latestReversible = [...history].reverse().find(entry => entry.reversible);
  if (phase === "editing" && draft) {
    const statusChoices = record.status === "needs-information"
      ? [{ value: "needs-information", label: "Needs information" }, { value: "ready-for-review", label: "Ready for review" }]
      : [{ value: "ready-for-review", label: "Ready for review" }, { value: "needs-information", label: "Request information" }, { value: "approved", label: "Approve" }, { value: "rejected", label: "Reject" }];
    return <form className="workflow-form" onSubmit={onReview}>
      {message && <Alert live="polite" title="Draft status">{message}</Alert>}
      {Object.keys(errors).length > 0 && <div className="workflow-error-summary" role="alert"><strong>Check the following fields</strong><ul>{Object.entries(errors).map(([id, error]) => <li key={id}><a href={`#review-${id}`}>{error}</a></li>)}</ul></div>}
      <Field><FieldLabel htmlFor="review-title">Title</FieldLabel><Input plain id="review-title" value={draft.title} aria-invalid={!!errors.title} onChange={event => onDraft({ ...draft, title: event.currentTarget.value })} />{errors.title && <FieldError>{errors.title}</FieldError>}</Field>
      <Field><FieldLabel htmlFor="review-reference">Reference</FieldLabel><Input plain id="review-reference" value={draft.reference} aria-invalid={!!errors.reference} onChange={event => onDraft({ ...draft, reference: event.currentTarget.value })} />{errors.reference && <FieldError>{errors.reference}</FieldError>}</Field>
      <Field><FieldLabel htmlFor="review-summary">Summary</FieldLabel><Textarea id="review-summary" rows={7} value={draft.summary} aria-invalid={!!errors.summary} onChange={event => onDraft({ ...draft, summary: event.currentTarget.value })} /><FieldHint>Keep the summary under 4,000 characters.</FieldHint>{errors.summary && <FieldError>{errors.summary}</FieldError>}</Field>
      <Field><FieldLabel id="review-status-label">Next status</FieldLabel><Select aria-labelledby="review-status-label" options={statusChoices} value={draft.status} onValueChange={value => onDraft({ ...draft, status: value as ReviewStatus })} />{errors.status && <FieldError>{errors.status}</FieldError>}</Field>
      <div className="workflow-actions"><Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button><Button type="submit">Review change</Button></div>
    </form>;
  }

  return <div className="workflow-detail">
    {message && (phase === "confirmed" || phase === "conflict") && <Alert live="polite" title="Workflow status">{message}</Alert>}
    <div className="workflow-status"><Badge variant={badgeVariant(record.status)}>{statusLabel(record.status)}</Badge><span>Revision {record.revision}</span></div>
    <dl className="workflow-description"><div><dt>Reference</dt><dd>{record.reference}</dd></div><div><dt>Summary</dt><dd>{record.summary}</dd></div><div><dt>Updated</dt><dd>{new Date(record.updatedAt).toLocaleString()}</dd></div></dl>
    <div className="workflow-actions">
      <Button disabled={record.status === "approved" || record.status === "rejected"} onClick={onEdit}>Edit record</Button>
      {latestReversible && <Button variant="ghost" onClick={() => void onUndo(latestReversible)}>Undo latest change</Button>}
    </div>
    <section aria-labelledby="record-history-title"><h3 id="record-history-title">History</h3>{history.length ? <ol className="workflow-history">{history.slice().reverse().map(entry => <li key={entry.operationId}><time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time><div><strong>{entry.action === "undo" ? "Change undone" : "Record committed"}</strong><span>{entry.actorLabel}</span><p>Revision {entry.revision}: {entry.changedFields.join(", ")}</p></div></li>)}</ol> : <p>No committed changes yet.</p>}</section>
  </div>;
}

function DraftDiff({ before, after, beforeLabel, afterLabel }: { before: string; after: string; beforeLabel: string; afterLabel: string }) {
  return <div className="workflow-diff" role="group" aria-label="Change comparison"><section><h3>{beforeLabel}</h3><pre>{before}</pre></section><section><h3>{afterLabel}</h3><pre>{after}</pre></section></div>;
}
