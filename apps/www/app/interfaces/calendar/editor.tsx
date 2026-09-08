"use client";

import * as React from "react";
import { Button, Checkbox, Dialog, DialogTitle, Icon, Input, NativeSelect, Textarea } from "@noorddev/vlak-react";
import type { CalendarCollection, CalendarEvent, Frequency } from "./types";
import { addDays, addMinutes, dayOfWeek, isDate, isWallTime, shiftEvent, validateEvent } from "./model";

export type EditScope = "one" | "series";
export interface EditorState { event: CalendarEvent; original?: CalendarEvent; occurrenceStart?: string }
export function EventEditor({ editor, calendars, onClose, onSave, onDelete }: {
  editor: EditorState;
  calendars: CalendarCollection[];
  onClose: () => void;
  onSave: (event: CalendarEvent, scope: EditScope) => string | null;
  onDelete: (scope: EditScope) => void;
}) {
  const [draft, setDraft] = React.useState(editor.event);
  const [scope, setScope] = React.useState<EditScope>("one");
  const [error, setError] = React.useState("");
  const [discarding, setDiscarding] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const isSeries = Boolean(editor.original?.recurrence);
  const dirty = JSON.stringify(draft) !== JSON.stringify(editor.event);
  const update = (patch: Partial<CalendarEvent>) => { setDraft(current => ({ ...current, ...patch })); setError(""); };
  const close = () => { if (dirty) setDiscarding(true); else onClose(); };
  const recurrence = draft.recurrence;
  const validStartDate = isDate(draft.start.slice(0, 10)) ? draft.start.slice(0, 10) : editor.event.start.slice(0, 10);
  const startDay = dayOfWeek(validStartDate);
  function changeScope(next: EditScope) {
    setScope(next);
    if (!editor.original) return;
    setDraft(current => next === "series" ? { ...current, start: editor.original!.start, end: editor.original!.end, recurrence: editor.original!.recurrence, exclusions: editor.original!.exclusions } : { ...current, start: editor.event.start, end: editor.event.end, recurrence: undefined, exclusions: undefined });
    setError("");
  }
  function changeStart(start: string) {
    try { update(shiftEvent(draft, start)); } catch { update({ start }); }
  }
  function allDay(next: boolean) {
    if (!isWallTime(draft.start) || !isWallTime(draft.end)) { setError("Add valid start and end times first."); return; }
    if (draft.end.slice(0, 10) === "2200-12-31") { setError("Choose an end date before December 31, 2200 to change the event type."); return; }
    const start = `${draft.start.slice(0, 10)}T${next ? "00:00" : "09:00"}`;
    const end = next ? `${addDays(draft.end.slice(0, 10), draft.end.slice(11) === "00:00" && draft.end > draft.start ? 0 : 1)}T00:00` : addMinutes(start, 60);
    update({ allDay: next, start, end, exclusions: draft.exclusions?.map(value => `${value.slice(0, 10)}T${next ? "00:00" : "09:00"}`) });
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = { ...draft, title: draft.title.trim(), location: draft.location.trim(), description: draft.description.trim(), exclusions: draft.recurrence ? draft.exclusions : undefined };
    const issue = validateEvent(next);
    if (issue) { setError(issue); return; }
    setError(onSave(next, scope) ?? "");
  }
  return <Dialog open onClose={close} className="cal-dialog cal-editor">
    <form onSubmit={submit}>
      <header className="cal-dialog-heading"><div><p>{editor.original ? "Event details" : "Make time"}</p><DialogTitle>{editor.original ? "Edit event" : "New event"}</DialogTitle></div><Button variant="ghost" className="cal-icon-button" aria-label="Close event editor" onClick={close}><Icon name="close" /></Button></header>
      {discarding ? <div className="cal-dialog-content"><h3>Discard unsaved changes?</h3><p>Your saved event will stay as it is.</p><div className="cal-action-row"><Button variant="ghost" onClick={() => setDiscarding(false)}>Keep editing</Button><Button onClick={onClose}>Discard changes</Button></div></div> : deleting ? <div className="cal-dialog-content"><h3>{isSeries && scope === "series" ? "Delete the entire series?" : "Delete this event?"}</h3><p>You can undo this after deleting.</p><div className="cal-action-row"><Button variant="ghost" onClick={() => setDeleting(false)}>Keep event</Button><Button onClick={() => onDelete(scope)}>Confirm delete</Button></div></div> : <>
      <div className="cal-dialog-content">
        {isSeries && <NativeSelect label="Apply changes to" value={scope} onChange={e => changeScope(e.target.value as EditScope)}><option value="one">This event only</option><option value="series">Entire series</option></NativeSelect>}
        <Input label="Title" autoFocus required maxLength={160} placeholder="Add a title" value={draft.title} onChange={e => update({ title: e.target.value })} />
        <div className="cal-field-pair"><NativeSelect label="Calendar" value={draft.calendarId} onChange={e => update({ calendarId: e.target.value })}>{calendars.map(calendar => <option value={calendar.id} key={calendar.id}>{calendar.name}</option>)}</NativeSelect><Checkbox label="All day" checked={draft.allDay} onCheckedChange={allDay} /></div>
        <div className="cal-field-pair"><Input label="Starts" required type={draft.allDay ? "date" : "datetime-local"} min={draft.allDay ? "1900-01-01" : "1900-01-01T00:00"} max={draft.allDay ? "2200-12-30" : "2200-12-30T23:59"} value={draft.allDay ? draft.start.slice(0, 10) : draft.start} onChange={e => changeStart(draft.allDay ? `${e.target.value}T00:00` : e.target.value)} /><Input label={draft.allDay ? "Last day" : "Ends"} required type={draft.allDay ? "date" : "datetime-local"} min={draft.allDay ? draft.start.slice(0, 10) : draft.start} max={draft.allDay ? "2200-12-30" : "2200-12-31T23:59"} value={draft.allDay ? addDays(draft.end.slice(0, 10), -1) : draft.end} onChange={e => { if (!e.target.value || draft.allDay && (!isDate(e.target.value) || e.target.value >= "2200-12-31")) return; update({ end: draft.allDay ? `${addDays(e.target.value, 1)}T00:00` : e.target.value }); }} /></div>
        {(!isSeries || scope === "series") && <>
          <NativeSelect label="Repeat" value={recurrence?.frequency ?? "none"} onChange={e => update({ recurrence: e.target.value === "none" ? undefined : { frequency: e.target.value as Frequency, interval: 1 } })}><option value="none">Does not repeat</option><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option><option value="yearly">Every year</option></NativeSelect>
          {recurrence && <div className="cal-recurrence-fields">
            <Input label={`Every (${({ daily: "days", weekly: "weeks", monthly: "months", yearly: "years" })[recurrence.frequency]})`} type="number" required min={1} max={99} value={recurrence.interval} onChange={e => update({ recurrence: { ...recurrence, interval: Number(e.target.value) } })} />
            {recurrence.frequency === "weekly" && <fieldset className="cal-weekdays"><legend>On these days</legend>{[1, 2, 3, 4, 5, 6, 0].map(day => <Checkbox key={day} label={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]} checked={(recurrence.weekdays ?? [startDay]).includes(day)} onCheckedChange={checked => { const days = recurrence.weekdays ?? [startDay]; update({ recurrence: { ...recurrence, weekdays: checked ? [...days, day].sort() : days.filter(value => value !== day) } }); }} />)}</fieldset>}
            <div className="cal-field-pair"><NativeSelect label="Ends" value={recurrence.until ? "until" : recurrence.count ? "count" : "never"} onChange={e => update({ recurrence: { ...recurrence, until: e.target.value === "until" ? addDays(validStartDate > "2200-11-30" ? "2200-11-30" : validStartDate, 30) : undefined, count: e.target.value === "count" ? 10 : undefined } })}><option value="never">Never</option><option value="until">On a date</option><option value="count">After a number</option></NativeSelect>{recurrence.until && <Input label="Repeat until" type="date" required min={draft.start.slice(0, 10)} max="2200-12-31" value={recurrence.until} onChange={e => update({ recurrence: { ...recurrence, until: e.target.value } })} />}{recurrence.count !== undefined && <Input label="Occurrences" type="number" required min={1} max={10000} value={recurrence.count} onChange={e => update({ recurrence: { ...recurrence, count: Number(e.target.value) } })} />}</div>
            {(recurrence.frequency === "monthly" || recurrence.frequency === "yearly") && <p className="cal-hint">Dates that do not exist in a month are skipped.</p>}
          </div>}
        </>}
        <Input label="Location" maxLength={300} placeholder="Add a place" value={draft.location} onChange={e => update({ location: e.target.value })} />
        <Textarea label="Notes" rows={3} maxLength={5000} placeholder="Anything to keep in mind" value={draft.description} onChange={e => update({ description: e.target.value })} />
        <p className="cal-hint">Times follow this device’s time zone.</p>
        {error && <p role="alert" className="cal-error">{error}</p>}
      </div>
      <footer className="cal-dialog-actions">{editor.original && <Button variant="ghost" onClick={() => setDeleting(true)}>Delete</Button>}<span /><Button variant="ghost" onClick={close}>Cancel</Button><Button type="submit">Save event</Button></footer>
      </>}
    </form>
  </Dialog>;
}
