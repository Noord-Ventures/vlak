"use client";

import * as React from "react";
import { Button, Checkbox, Dialog, DialogTitle, Icon, Input, NativeSelect } from "@noorddev/vlak-react";
import type { CalendarEvent, CalendarStore, CalendarView, Occurrence } from "./types";
import { CALENDAR_LIMITS, addDays, addMinutes, addMonths, expandEvents, exportICS, importICS, isDate, localDate, makeInitialStore, parseStore, shiftEvent, startOfWeek } from "./model";
import { EventEditor, type EditorState, type EditScope } from "./editor";
import { CalendarViews } from "./views";
import "./scene.css";

const storageKey = "vlak-calendar-v1";
const dateValue = (date: string) => new Date(`${date}T12:00:00`);
const navigationDate = (date: string) => date < "1901-01-01" ? "1901-01-01" : date > "2199-12-31" ? "2199-12-31" : date;
function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CalendarBoard() {
  const [store, setStore] = React.useState<CalendarStore | null>(null);
  const [today, setToday] = React.useState("");
  const [date, setDate] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [editor, setEditor] = React.useState<EditorState | null>(null);
  const [settings, setSettings] = React.useState(false);
  const [calendarName, setCalendarName] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [saveError, setSaveError] = React.useState("");
  const [recovery, setRecovery] = React.useState<string | null>(null);
  const [undo, setUndo] = React.useState<CalendarStore | null>(null);
  const [imported, setImported] = React.useState<ReturnType<typeof importICS> | null>(null);
  const [importCalendar, setImportCalendar] = React.useState("");
  const [manageCalendar, setManageCalendar] = React.useState<string | null>(null);
  const [managedName, setManagedName] = React.useState("");
  const [deleteCalendar, setDeleteCalendar] = React.useState(false);
  const [moving, setMoving] = React.useState<{ occurrence: Occurrence; start: string } | null>(null);
  const [zone, setZone] = React.useState("");
  const current = React.useRef(store); current.current = store;
  const lastStored = React.useRef<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const newButton = React.useRef<HTMLButtonElement>(null);
  const board = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const now = localDate(new Date()); setDate(navigationDate(now)); setToday(now);
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " "));
    let initial = makeInitialStore(now);
    if (board.current && board.current.clientWidth <= 640) initial.view = "day";
    try {
      const raw = localStorage.getItem(storageKey); lastStored.current = raw;
      if (raw) { const saved = parseStore(raw); if (saved) initial = saved; else { setRecovery(raw); setSaveError("The saved calendar could not be read. Download a copy before starting a new calendar."); } }
    } catch { setSaveError("Browser storage is unavailable. Export your calendar to keep your changes."); }
    setStore(initial);
    const checkDate = () => setToday(localDate(new Date()));
    const timer = window.setInterval(checkDate, 60000);
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      const next = parseStore(event.newValue);
      if (next) { lastStored.current = event.newValue; setStore(next); setUndo(null); setStatus("Calendar updated from another tab."); }
    };
    window.addEventListener("storage", sync);
    return () => { window.clearInterval(timer); window.removeEventListener("storage", sync); };
  }, []);

  function commit(next: CalendarStore, message: string, remember = true): boolean {
    if (recovery !== null) { setStatus("Download the saved data and start a new calendar in Calendars before making changes."); return false; }
    const serialized = JSON.stringify(next);
    if (!parseStore(serialized)) { setStatus("This change exceeds the calendar’s limits. Export older events or shorten the event details."); return false; }
    try {
      const incoming = localStorage.getItem(storageKey);
      if (incoming !== lastStored.current && incoming !== null) {
        const parsed = parseStore(incoming);
        if (parsed) { lastStored.current = incoming; setStore(parsed); setUndo(null); setStatus("Another tab changed this calendar. Review the updated events and try again."); return false; }
        setRecovery(incoming); setSaveError("Saved data changed and could not be read. Download a recovery copy in Calendars."); return false;
      }
      localStorage.setItem(storageKey, serialized); lastStored.current = serialized; setSaveError("");
    } catch { setSaveError("Changes are held in this tab. Export your calendar because browser storage is unavailable or full."); }
    if (remember) setUndo(current.current);
    current.current = next; setStore(next); setStatus(message); return true;
  }
  function closeEditor() {
    setEditor(null);
    // A moved or deleted occurrence may no longer have a focusable trigger.
    requestAnimationFrame(() => { if (document.activeElement === document.body) newButton.current?.focus(); });
  }
  function create(start = `${date}T09:00`, allDay = false) {
    if (!store) return;
    const calendarId = store.calendars.find(calendar => calendar.visible)?.id ?? store.calendars[0]!.id;
    const normalized = allDay ? `${start.slice(0, 10)}T00:00` : start;
    setEditor({ event: { id: crypto.randomUUID(), calendarId, title: "", description: "", location: "", start: normalized, end: allDay ? `${addDays(start.slice(0, 10), 1)}T00:00` : addMinutes(start, 60), allDay } });
  }
  function open(occurrence: Occurrence) {
    setEditor({ original: occurrence.event, occurrenceStart: occurrence.originalStart, event: { ...occurrence.event, start: occurrence.start, end: occurrence.end, recurrence: undefined, exclusions: undefined } });
  }
  function save(event: CalendarEvent, scope: EditScope): string | null {
    if (!store || !editor) return "Calendar is still loading.";
    const original = editor.original;
    if (original && JSON.stringify(store.events.find(item => item.id === original.id)) !== JSON.stringify(original)) return "This event changed in another tab. Copy your notes, then close and reopen the event to review the latest version.";
    let events: CalendarEvent[];
    if (original?.recurrence && scope === "one") {
      events = store.events.map(item => item.id === original.id ? { ...item, exclusions: [...(item.exclusions ?? []), editor.occurrenceStart!] } : item);
      events.push({ ...event, id: crypto.randomUUID(), recurrence: undefined, exclusions: undefined });
    } else events = original ? store.events.map(item => item.id === original.id ? event : item) : [...store.events, event];
    const calendars = store.calendars.map(calendar => calendar.id === event.calendarId ? { ...calendar, visible: true } : calendar);
    if (!commit({ ...store, events, calendars }, original ? "Event updated." : "Event added.")) return "Event was not saved. Review the calendar status and try again.";
    setDate(navigationDate(event.start.slice(0, 10))); setQuery(""); closeEditor(); return null;
  }
  function remove(scope: EditScope) {
    if (!store || !editor?.original) return;
    const original = editor.original;
    if (JSON.stringify(store.events.find(event => event.id === original.id)) !== JSON.stringify(original)) { setStatus("This event changed in another tab. Reopen it before deleting."); closeEditor(); return; }
    const events = original.recurrence && scope === "one" ? store.events.map(event => event.id === original.id ? { ...event, exclusions: [...(event.exclusions ?? []), editor.occurrenceStart!] } : event) : store.events.filter(event => event.id !== original.id);
    if (commit({ ...store, events }, original.recurrence && scope === "series" ? "Series deleted." : "Event deleted.")) closeEditor();
  }
  function move(occurrence: Occurrence, start: string, scope: EditScope = "one") {
    if (!store) return;
    const original = store.events.find(event => event.id === occurrence.eventId);
    if (!original || JSON.stringify(original) !== JSON.stringify(occurrence.event)) { setStatus("This event changed. Reopen it before moving."); setMoving(null); return; }
    try {
      const shifted = shiftEvent({ ...original, start: occurrence.start, end: occurrence.end, ...(scope === "one" ? { recurrence: undefined, exclusions: undefined } : {}) }, start);
      const events = original.recurrence && scope === "one" ? [...store.events.map(event => event.id === original.id ? { ...event, exclusions: [...(event.exclusions ?? []), occurrence.originalStart] } : event), { ...shifted, id: crypto.randomUUID(), recurrence: undefined, exclusions: undefined }] : store.events.map(event => event.id === original.id ? shifted : event);
      if (commit({ ...store, events }, "Event moved.")) setMoving(null);
    } catch { setStatus("That date is outside the supported calendar range."); }
  }
  async function readFile(file: File | undefined) {
    if (!file || !store) return;
    if (file.size > 2 * 1024 * 1024) { setStatus("Choose an .ics file smaller than 2 MB."); return; }
    try { const calendarId = store.calendars.find(calendar => calendar.visible)?.id ?? store.calendars[0]!.id; const result = importICS(await file.text(), calendarId); setImportCalendar(calendarId); setSettings(false); setImported(result); } catch { setStatus("This calendar file could not be read. Choose a valid .ics file."); }
  }
  function exportCalendar() {
    if (!store) return;
    try { download(exportICS(store.events), "vlak-calendar.ics", "text/calendar;charset=utf-8"); setStatus("Calendar exported."); }
    catch { download(JSON.stringify(store, null, 2), "vlak-calendar-backup.json", "application/json"); setStatus("This calendar is too large for .ics export. A complete JSON backup was downloaded instead."); }
  }

  const range = React.useMemo(() => {
    if (!store || !date) return { start: "", end: "" };
    try {
      if (query.trim()) return { start: addMonths(date, -12), end: addMonths(date, 12) };
      if (store.view === "month") { const first = `${date.slice(0, 7)}-01`; const start = startOfWeek(first, store.weekStartsOn); return { start, end: addDays(start, 42) }; }
      if (store.view === "week") { const start = startOfWeek(date, store.weekStartsOn); return { start, end: addDays(start, 7) }; }
      return { start: date, end: addDays(date, store.view === "agenda" ? 30 : 1) };
    } catch { return { start: date, end: addDays(date, 1) }; }
  }, [date, store, query]);
  const occurrences = React.useMemo(() => {
    if (!store || !range.start) return [];
    const active = new Set(store.calendars.filter(calendar => calendar.visible).map(calendar => calendar.id));
    const term = query.trim().toLowerCase();
    return expandEvents(store.events.filter(event => active.has(event.calendarId) && (!term || `${event.title} ${event.location} ${event.description}`.toLowerCase().includes(term))), range.start, range.end);
  }, [store, range, query]);

  if (!store || !date) return <div ref={board} className="cal-board cal-loading" aria-busy="true"><p>Opening your calendar…</p></div>;
  const selected = dateValue(date);
  const title = selected.toLocaleDateString("en", { month: "long", year: "numeric" });
  function navigate(direction: number) {
    try { setDate(navigationDate(store!.view === "month" ? addMonths(date, direction) : addDays(date, direction * (store!.view === "week" ? 7 : store!.view === "agenda" ? 30 : 1)))); } catch { setStatus("Choose a date between 1901 and 2199."); }
  }
  function addCalendar(event: React.FormEvent) {
    event.preventDefault();
    const name = calendarName.trim();
    if (!name || !store) return;
    if (store.calendars.some(calendar => calendar.name.toLowerCase() === name.toLowerCase())) { setStatus("A calendar with that name already exists."); return; }
    if (commit({ ...store, calendars: [...store.calendars, { id: crypto.randomUUID(), name, visible: true }] }, "Calendar added.")) setCalendarName("");
  }
  const collections = (editable = false) => <div className="cal-collections"><h3>My calendars</h3>{store.calendars.map(calendar => <div className="cal-collection-row" key={calendar.id}><Checkbox label={calendar.name} checked={calendar.visible} onCheckedChange={visible => commit({ ...store, calendars: store.calendars.map(item => item.id === calendar.id ? { ...item, visible } : item) }, `${calendar.name} ${visible ? "shown" : "hidden"}.`, false)} />{editable && <Button variant="ghost" className="cal-icon-button" aria-label={`Edit ${calendar.name} calendar`} onClick={() => { setManageCalendar(calendar.id); setManagedName(calendar.name); setDeleteCalendar(false); }}><Icon name="edit" /></Button>}</div>)}</div>;
  return <div ref={board} className="cal-board">
    <header className="cal-toolbar"><div className="cal-period"><h2 aria-live="polite">{title}</h2><span>{store.view === "agenda" ? "The next 30 days" : selected.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "short" })}</span></div><div className="cal-date-navigation"><Button variant="ghost" onClick={() => setDate(navigationDate(today))}>Today</Button><Button variant="ghost" className="cal-icon-button" aria-label="Previous period" onClick={() => navigate(-1)}><Icon name="arrow-left" /></Button><Button variant="ghost" className="cal-icon-button" aria-label="Next period" onClick={() => navigate(1)}><Icon name="arrow-right" /></Button></div><div className="cal-toolbar-actions"><NativeSelect aria-label="Calendar view" value={store.view} onChange={event => { setQuery(""); commit({ ...store, view: event.target.value as CalendarView }, "", false); }}><option value="month">Month</option><option value="week">Week</option><option value="day">Day</option><option value="agenda">Agenda</option></NativeSelect><Button ref={newButton} onClick={() => create()}><Icon name="plus" /><span>New event</span></Button></div></header>
    <div className="cal-searchbar"><label className="cal-search"><Icon name="search" /><input type="search" aria-label="Search events" placeholder="Search events" value={query} onChange={event => setQuery(event.target.value)} maxLength={160} /></label><Button variant="ghost" className="cal-settings-button" aria-label="Calendars" onClick={() => setSettings(true)}><Icon name="grid" /><span>Calendars</span></Button></div>
    <div className="cal-workspace">
      <aside className="cal-sidebar" aria-label="Calendar navigation"><div className="cal-today"><p>{dateValue(today).toLocaleDateString("en", { weekday: "long" })}</p><strong>{Number(today.slice(8))}</strong><span>{dateValue(today).toLocaleDateString("en", { month: "long", year: "numeric" })}</span></div>{collections()}<div className="cal-sidebar-bottom"><Input label="Go to date" type="date" min="1901-01-01" max="2199-12-31" value={date} onChange={event => { if (isDate(event.target.value) && event.target.value >= "1901-01-01" && event.target.value <= "2199-12-31") setDate(event.target.value); }} /><p>{zone}</p><span>Saved in this browser</span></div></aside>
      <div className="cal-main">{query.trim() ? <div className="cal-search-results"><div className="cal-results-heading"><h3>{occurrences.length} {occurrences.length === 1 ? "event" : "events"}</h3><p>Within a year of {selected.toLocaleDateString("en", { month: "short", year: "numeric" })}</p></div>{occurrences.length ? <ul>{occurrences.slice(0, 200).map(occurrence => <li key={occurrence.key}><button type="button" onClick={() => open(occurrence)}><span><strong>{occurrence.event.title}</strong><small>{occurrence.event.location || store.calendars.find(calendar => calendar.id === occurrence.event.calendarId)?.name}</small></span><time>{dateValue(occurrence.start.slice(0, 10)).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}<small>{occurrence.event.allDay ? "All day" : occurrence.start.slice(11)}</small></time></button></li>)}</ul> : <p className="cal-empty-search">No matching events. Try another title, place or note.</p>}{occurrences.length > 200 && <p className="cal-hint">Showing the first 200 matches. Refine your search to see more.</p>}</div> : <CalendarViews view={store.view} date={date} today={today} weekStartsOn={store.weekStartsOn} occurrences={occurrences} calendars={store.calendars} onDate={value => setDate(navigationDate(value))} onCreate={create} onOpen={open} onMove={(occurrence, start) => { if (occurrence.event.recurrence) setMoving({ occurrence, start }); else move(occurrence, start); }} />}</div>
    </div>
    <footer className="cal-status"><span role="status">{status || (occurrences.length === CALENDAR_LIMITS.occurrences ? "Showing the first 10,000 occurrences. Narrow the date range or filters." : saveError ? "Changes are not saved" : "Your time, in one place")}</span>{undo && <Button variant="ghost" onClick={() => { if (commit(undo, "Change undone.", false)) setUndo(null); }}>Undo</Button>}</footer>
    {saveError && <p className="cal-storage-error" role="alert">{saveError}</p>}
    <input ref={fileInput} hidden type="file" accept=".ics,text/calendar" aria-label="Import calendar file" onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ""; }} />
    {editor && <EventEditor editor={editor} calendars={store.calendars} onClose={closeEditor} onSave={save} onDelete={remove} />}
    <Dialog open={settings} onClose={() => setSettings(false)} className="cal-dialog cal-settings"><header className="cal-dialog-heading"><DialogTitle>Calendars</DialogTitle><Button variant="ghost" className="cal-icon-button" aria-label="Close calendar settings" onClick={() => setSettings(false)}><Icon name="close" /></Button></header><div className="cal-dialog-content">{collections(true)}<form className="cal-add-calendar" onSubmit={addCalendar}><Input label="New calendar" value={calendarName} onChange={event => setCalendarName(event.target.value)} maxLength={60} required placeholder="Name" /><Button variant="ghost" type="submit" disabled={store.calendars.length >= 12}>Add</Button></form><div className="cal-field-pair"><Input label="Go to date" type="date" min="1901-01-01" max="2199-12-31" value={date} onChange={event => { if (isDate(event.target.value) && event.target.value >= "1901-01-01" && event.target.value <= "2199-12-31") setDate(event.target.value); }} /><NativeSelect label="Week starts on" value={store.weekStartsOn} onChange={event => commit({ ...store, weekStartsOn: Number(event.target.value) as 0 | 1 }, "Week start updated.", false)}><option value={1}>Monday</option><option value={0}>Sunday</option></NativeSelect></div><div className="cal-file-actions"><h3>Take your calendar with you</h3><p>Import an .ics file or export your events for another calendar app.</p><div className="cal-action-row"><Button variant="ghost" onClick={() => fileInput.current?.click()}>Import .ics</Button><Button variant="ghost" onClick={exportCalendar}>Export .ics</Button></div></div><p className="cal-hint">Events stay in this browser. Times use {zone}. No account connection is needed.</p>{recovery !== null && <div className="cal-recovery"><p>{saveError}</p><Button variant="ghost" onClick={() => download(recovery, "vlak-calendar-recovery.json", "application/json")}>Download saved data</Button><Button onClick={() => { try { localStorage.removeItem(storageKey); lastStored.current = null; setRecovery(null); setSaveError(""); setStatus("New calendar ready."); } catch { setStatus("Browser storage could not be cleared."); } }}>Start new calendar</Button></div>}<p role="status">{status}</p></div></Dialog>
    <Dialog open={Boolean(imported)} onClose={() => setImported(null)} className="cal-dialog"><header className="cal-dialog-heading"><DialogTitle>Import events</DialogTitle><Button variant="ghost" className="cal-icon-button" aria-label="Cancel import" onClick={() => setImported(null)}><Icon name="close" /></Button></header><div className="cal-dialog-content"><p>{imported?.events.length ?? 0} events ready to import.</p><NativeSelect label="Import into" value={importCalendar} onChange={event => setImportCalendar(event.target.value)}>{store.calendars.map(calendar => <option key={calendar.id} value={calendar.id}>{calendar.name}</option>)}</NativeSelect>{imported?.warnings.length ? <ul className="cal-import-warnings">{imported.warnings.slice(0, 12).map((warning, index) => <li key={index}>{warning}</li>)}</ul> : <p>Your existing events will be kept.</p>}<div className="cal-action-row"><Button variant="ghost" onClick={() => setImported(null)}>Cancel</Button><Button disabled={!imported?.events.length} onClick={() => { if (!imported) return; const ids = new Set(store.events.map(event => event.id)); const fresh = imported.events.filter(event => !ids.has(event.id)).map(event => ({ ...event, calendarId: importCalendar })); if (commit({ ...store, events: [...store.events, ...fresh] , calendars: store.calendars.map(calendar => calendar.id === importCalendar ? { ...calendar, visible: true } : calendar) }, `${fresh.length} events imported.${fresh.length < imported.events.length ? " Duplicates skipped." : ""}`)) { if (fresh[0]) setDate(navigationDate(fresh[0].start.slice(0, 10))); setImported(null); } }}>Import events</Button></div><p role="status">{status}</p></div></Dialog>
    <Dialog open={Boolean(moving)} onClose={() => setMoving(null)} className="cal-dialog"><header className="cal-dialog-heading"><DialogTitle>Move repeating event</DialogTitle></header><div className="cal-dialog-content"><p>Move this occurrence to {moving?.start.replace("T", " at ")}?</p><p>To move the entire series, open the event and choose Entire series.</p><div className="cal-action-row"><Button variant="ghost" onClick={() => setMoving(null)}>Cancel</Button><Button onClick={() => { if (moving) move(moving.occurrence, moving.start); }}>Move this event</Button></div><p role="status">{status}</p></div></Dialog>
    <Dialog open={Boolean(manageCalendar)} onClose={() => setManageCalendar(null)} className="cal-dialog"><header className="cal-dialog-heading"><DialogTitle>{deleteCalendar ? "Delete calendar?" : "Edit calendar"}</DialogTitle><Button variant="ghost" className="cal-icon-button" aria-label="Close calendar editor" onClick={() => setManageCalendar(null)}><Icon name="close" /></Button></header><form className="cal-dialog-content" onSubmit={event => { event.preventDefault(); const name = managedName.trim(); if (!name) return; if (store.calendars.some(calendar => calendar.id !== manageCalendar && calendar.name.toLowerCase() === name.toLowerCase())) { setStatus("A calendar with that name already exists."); return; } if (commit({ ...store, calendars: store.calendars.map(calendar => calendar.id === manageCalendar ? { ...calendar, name } : calendar) }, "Calendar renamed.")) setManageCalendar(null); }}>{deleteCalendar ? <><p>This removes “{managedName}” and its {store.events.filter(event => event.calendarId === manageCalendar).length} saved events, including repeating series. You can undo this afterwards.</p><div className="cal-action-row"><Button variant="ghost" onClick={() => setDeleteCalendar(false)}>Keep calendar</Button><Button onClick={() => { if (store.calendars.length <= 1) return; if (commit({ ...store, calendars: store.calendars.filter(calendar => calendar.id !== manageCalendar), events: store.events.filter(event => event.calendarId !== manageCalendar) }, "Calendar deleted.")) setManageCalendar(null); }}>Confirm delete calendar</Button></div></> : <><Input label="Calendar name" required maxLength={60} value={managedName} onChange={event => setManagedName(event.target.value)} /><div className="cal-action-row"><Button variant="ghost" disabled={store.calendars.length <= 1} onClick={() => setDeleteCalendar(true)}>Delete calendar</Button><Button type="submit">Save calendar</Button></div></>}<p role="status">{status}</p></form></Dialog>
  </div>;
}
