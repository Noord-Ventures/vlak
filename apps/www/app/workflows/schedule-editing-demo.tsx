"use client";

import { useState } from "react";
import { Alert, Badge, Button, CalendarPopover, Field, FieldLabel, Input } from "@noorddev/vlak-react";
import { MemoryReviewAdapter } from "../../../../examples/workflows/record-review/adapters/memory";
import { scheduleEditCommand, scheduleReviewRecord, type ScheduleEventDraft } from "../../../../examples/workflows/schedule-editing/recipe";

const principal = { scopeId: "schedule-site-example", actorLabel: "Local scheduler", canDecide: false };
const initialEvent: ScheduleEventDraft = {
  id: "event-204",
  revision: 1,
  title: "Site walk",
  startsAt: "2026-09-14T09:00:00Z",
  endsAt: "2026-09-14T10:00:00Z",
  timeZone: "UTC",
  allDay: false,
  updatedAt: "2026-09-11T10:00:00.000Z",
};

function createSession() {
  return { current: { ...initialEvent }, adapter: new MemoryReviewAdapter({ fixtures: { [principal.scopeId]: [scheduleReviewRecord(initialEvent)] } }) };
}

type PendingCommand = ReturnType<typeof scheduleEditCommand>;
const localValue = (value: string) => value.slice(0, 16);
const withUtcOffset = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00Z` : value;

export function ScheduleEditingDemo() {
  const [session, setSession] = useState(createSession);
  const [draft, setDraft] = useState<ScheduleEventDraft>({ ...initialEvent, endsAt: "2026-09-14T10:30:00Z" });
  const [pending, setPending] = useState<PendingCommand | null>(null);
  const [phase, setPhase] = useState<"editing" | "reviewing" | "confirmed">("editing");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Extend the supplied event, then review the exact change.");

  const review = (event: React.FormEvent) => {
    event.preventDefault(); if (busy || phase !== "editing") return;
    try {
      const command = scheduleEditCommand(session.current, draft, crypto.randomUUID());
      if (Object.keys(command.changes).length === 0) throw new Error("Change at least one event field before review.");
      setPending(command); setPhase("reviewing"); setMessage("Review the bounded event change before applying it locally.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The event could not be validated."); }
  };

  const apply = async () => {
    if (!pending || busy) return;
    setBusy(true);
    try {
      const result = await session.adapter.commit(principal, pending);
      if (result.kind !== "committed") { setMessage(`The local edit was not recorded: ${result.kind}.`); return; }
      const current = { ...draft, revision: result.record.revision, updatedAt: result.record.updatedAt };
      setSession({ current, adapter: session.adapter }); setDraft(current); setPending(null); setPhase("confirmed");
      setMessage(`Event edit recorded as revision ${result.record.revision}. No calendar provider was contacted.`);
    } catch { setMessage("The local edit could not be recorded. The reviewed draft is unchanged."); }
    finally { setBusy(false); }
  };

  const reset = () => {
    if (busy) return;
    setSession(createSession()); setDraft({ ...initialEvent, endsAt: "2026-09-14T10:30:00Z" }); setPending(null); setPhase("editing");
    setMessage("Extend the supplied event, then review the exact change.");
  };

  const changedFields = [
    ["Title", session.current.title, draft.title],
    ["Starts at", session.current.startsAt, draft.startsAt],
    ["Ends at", session.current.endsAt, draft.endsAt],
    ["Time zone", session.current.timeZone, draft.timeZone],
  ].filter(([, before, after]) => before !== after);

  return <section className="workflow-live-example" aria-labelledby="schedule-example-title">
    <header className="workflow-example-header"><div><p className="section-label">Local memory example</p><h2 id="schedule-example-title">Edit one supplied event</h2></div><Badge variant={phase === "confirmed" ? "solid" : "muted"}>{phase}</Badge></header>
    {phase === "reviewing" ? <div className="workflow-schedule-review" role="group" aria-label="Schedule changes">{changedFields.map(([label, before, after]) => <div className="workflow-schedule-change" key={label}><span className="workflow-example-kicker">{label}</span><dl><div><dt>Current</dt><dd>{before}</dd></div><div><dt>Proposed</dt><dd>{after}</dd></div></dl></div>)}</div> : phase === "editing" ? <form id="schedule-example-form" className="workflow-schedule-form" onSubmit={review}>
      <Field><FieldLabel htmlFor="schedule-title">Title</FieldLabel><Input plain id="schedule-title" value={draft.title} onChange={event => setDraft({ ...draft, title: event.currentTarget.value })} /></Field>
      <CalendarPopover id="schedule-start" type="datetime-local" label="Starts at · UTC" locale="en-GB" value={localValue(draft.startsAt)} onValueChange={value => setDraft({ ...draft, startsAt: withUtcOffset(value) })} triggerLabel="Choose start date and time" dialogLabel="Choose start date and time" required />
      <CalendarPopover id="schedule-end" type="datetime-local" label="Ends at · UTC" locale="en-GB" value={localValue(draft.endsAt)} onValueChange={value => setDraft({ ...draft, endsAt: withUtcOffset(value) })} triggerLabel="Choose end date and time" dialogLabel="Choose end date and time" required />
      <Field><FieldLabel htmlFor="schedule-zone">IANA time zone</FieldLabel><Input plain id="schedule-zone" value={draft.timeZone} readOnly aria-readonly="true" /></Field>
    </form> : <dl className="workflow-schedule-confirmed"><div><dt>Title</dt><dd>{session.current.title}</dd></div><div><dt>Time</dt><dd>{session.current.startsAt}<br />{session.current.endsAt}</dd></div><div><dt>Revision</dt><dd>{session.current.revision}</dd></div></dl>}
    <div className="workflow-example-status"><Alert live="polite" title="Schedule status">{message}</Alert></div>
    <div className="workflow-example-controls">
      {phase === "editing" && <Button type="submit" form="schedule-example-form">Review edit</Button>}
      {phase === "reviewing" && <><Button disabled={busy} onClick={() => void apply()}>{busy ? "Applying…" : "Apply local edit"}</Button><Button variant="ghost" disabled={busy} onClick={() => { setPending(null); setPhase("editing"); setMessage("The draft is still available for editing."); }}>Back to fields</Button></>}
      {phase === "confirmed" && <Button variant="ghost" disabled={busy} onClick={reset}>Reset local example</Button>}
    </div>
    <p className="workflow-example-boundary">The fixture uses UTC so the displayed civil time maps to one unambiguous offset. This example checks the revision and event bounds in memory; calendar ownership, provider authorization, recurrence, and synchronization remain host responsibilities.</p>
  </section>;
}
