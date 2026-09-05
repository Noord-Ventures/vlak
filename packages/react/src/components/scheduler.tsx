"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";
import { Input } from "./input";
import { NativeSelect } from "./native-select";
import { Dialog, DialogTitle } from "./dialog";

export type SchedulerView = "agenda" | "week" | "month";
export interface SchedulerEvent { id: string; title: string; start: Date; end: Date; disabled?: boolean }
export interface SchedulerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  events: readonly SchedulerEvent[];
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (day: Date) => void;
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?: (view: SchedulerView) => void;
  onEventSelect?: (event: SchedulerEvent) => void;
  onSlotSelect?: (start: Date) => void;
  onEventMove?: (event: SchedulerEvent, next: { start: Date; end: Date }) => void;
  weekStart?: 0 | 1;
  locale?: string;
  /** IANA zone, for example Europe/Amsterdam. Defaults to the browser zone. */
  timeZone?: string;
  label?: string;
  disabled?: boolean;
}
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "1rem", width: "100%", minWidth: 0, color: vlak.ink },
  toolbar: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" },
  action: { width: "auto", minWidth: vlak.hit, minHeight: vlak.hit, paddingInline: "0.75rem" },
  title: { margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.45, flex: "1 1 12rem" },
  scroll: { overflowX: "auto", padding: "0.25rem", ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: -2 } },
  week: { display: "grid", gridTemplateColumns: "repeat(7, minmax(10rem, 1fr))", minWidth: "70rem", gap: 0 },
  day: { padding: "0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, minWidth: 0 },
  selected: { backgroundColor: vlak.controlFill },
  date: { display: "flex", alignItems: "center", minWidth: vlak.hit, minHeight: vlak.hit, borderWidth: 0, borderRadius: vlak.radiusSm, backgroundColor: "transparent", color: vlak.ink, fontSize: "0.8125rem", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", paddingInline: "0.5rem", ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 } },
  month: { width: "100%", minWidth: "49rem", tableLayout: "fixed", borderCollapse: "collapse" },
  weekday: { padding: "0.75rem", fontSize: "0.75rem", fontWeight: 500, textAlign: "start", color: vlak.gray },
  cell: { verticalAlign: "top", height: "8rem", padding: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  outside: { color: vlak.gray },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" },
  event: { minWidth: 0, display: "flex", flexDirection: "column", gap: "0.25rem", paddingBlock: "0.5rem" },
  eventButton: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem", width: "100%", minHeight: vlak.hit, padding: "0.5rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, backgroundColor: vlak.paper, color: vlak.ink, fontSize: "0.875rem", fontFamily: "inherit", textAlign: "start", overflowWrap: "anywhere", cursor: "pointer", ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineColor: vlak.ink, outlineOffset: 2 }, ":disabled": { color: vlak.gray, cursor: "not-allowed" } },
  time: { fontSize: "0.75rem", color: vlak.gray, lineHeight: 1.45, fontVariantNumeric: "tabular-nums" },
  empty: { margin: 0, paddingBlock: "0.75rem", color: vlak.gray, fontSize: "0.8125rem", lineHeight: 1.45 },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
});
const validDate = (date: Date) => Number.isFinite(date.getTime());
// UTC Dates below represent civil calendar days, not event instants. This keeps
// calendar arithmetic independent from server zone and daylight-saving offsets.
const addDays = (date: Date, days: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
const sameDay = (a: Date, b: Date) => a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
const dateInput = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
const zoneFormatters = new Map<string, Intl.DateTimeFormat>();
function zoneParts(date: Date, timeZone: string) {
  let formatter = zoneFormatters.get(timeZone);
  if (!formatter) { formatter = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }); zoneFormatters.set(timeZone, formatter); }
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second) };
}
function dayInZone(date: Date, timeZone: string): Date { const parts = zoneParts(date, timeZone); return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)); }
function timeInput(date: Date, timeZone: string): string { const parts = zoneParts(date, timeZone); return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`; }
function atTime(day: Date, time: string, timeZone: string): Date | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours! < 0 || hours! > 23 || minutes! < 0 || minutes! > 59) return null;
  const target = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hours, minutes);
  const civilTimestamp = (instant: number) => { const parts = zoneParts(new Date(instant), timeZone); return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second); };
  let guess = target;
  for (let attempt = 0; attempt < 4; attempt++) {
    const delta = target - civilTimestamp(guess);
    if (delta === 0) {
      // A repeated fall-back time selects its earlier valid occurrence.
      for (const minutesEarlier of [120, 90, 60, 30]) { const earlier = guess - minutesEarlier * 60000; if (civilTimestamp(earlier) === target) return new Date(earlier); }
      return new Date(guess);
    }
    guess += delta;
  }
  return null; // A spring-forward gap has no matching civil clock time.
}
function parseDay(value: string): Date | null { const [year, month, day] = value.split("-").map(Number); if (!year || !month || !day) return null; const result = new Date(Date.UTC(year, month - 1, day)); return validDate(result) && result.getUTCMonth() === month - 1 && result.getUTCDate() === day ? result : null; }

/** Agenda, week, and month planning in an explicit or browser-local zone. Mutations are callbacks. */
export const Scheduler = React.forwardRef<HTMLDivElement, SchedulerProps>(function Scheduler({ events, value, defaultValue, onValueChange, view, defaultView = "week", onViewChange, onEventSelect, onSlotSelect, onEventMove, weekStart = 1, locale = "en", timeZone, label = "Schedule", disabled = false, className, style, ...props }, ref) {
  const zone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  const [inner, setInner] = React.useState(() => defaultValue && validDate(defaultValue) ? defaultValue : new Date());
  const selected = dayInZone(value && validDate(value) ? value : inner, zone);
  const [innerView, setInnerView] = React.useState(defaultView);
  const currentView = view ?? innerView;
  const [slotTime, setSlotTime] = React.useState("09:00");
  const [editing, setEditing] = React.useState<SchedulerEvent | null>(null);
  const [editDay, setEditDay] = React.useState("");
  const [editTime, setEditTime] = React.useState("");
  const [editError, setEditError] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const changeDay = (day: Date) => { if (disabled || !validDate(day)) return; const instant = atTime(day, "00:00", zone) ?? atTime(day, "12:00", zone); if (!instant) return; if (value === undefined) setInner(instant); onValueChange?.(instant); };
  const shift = (direction: number) => {
    if (currentView === "month") { const first = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + direction, 1)); const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate(); changeDay(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(last, selected.getUTCDate())))); }
    else changeDay(addDays(selected, direction * (currentView === "week" ? 7 : 1)));
  };
  const sorted = React.useMemo(() => events.filter(event => validDate(event.start) && validDate(event.end) && event.end > event.start).slice().sort((a, b) => a.start.getTime() - b.start.getTime()).map(event => ({ event, firstDay: dayInZone(event.start, zone), lastDay: dayInZone(new Date(event.end.getTime() - 1), zone) })), [events, zone]);
  const forDay = (day: Date) => sorted.filter(item => item.firstDay <= day && item.lastDay >= day).map(item => item.event);
  const timeFormat = (date: Date) => date.toLocaleTimeString(locale, { timeZone: zone, hour: "2-digit", minute: "2-digit" });
  const range = (event: SchedulerEvent) => sameDay(dayInZone(event.start, zone), dayInZone(event.end, zone)) ? `${timeFormat(event.start)}–${timeFormat(event.end)}` : `${event.start.toLocaleString(locale, { timeZone: zone, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} – ${event.end.toLocaleString(locale, { timeZone: zone, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
  const weekday = (day: Date) => day.toLocaleDateString(locale, { timeZone: "UTC", weekday: "short" });
  const dayLabel = (day: Date) => day.toLocaleDateString(locale, { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const weekBeginning = addDays(selected, -((selected.getUTCDay() - weekStart + 7) % 7));
  const week = Array.from({ length: 7 }, (_, index) => addDays(weekBeginning, index));
  const firstOfMonth = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1));
  const monthBeginning = addDays(firstOfMonth, -((firstOfMonth.getUTCDay() - weekStart + 7) % 7));
  const titleText = currentView === "month" ? selected.toLocaleDateString(locale, { timeZone: "UTC", month: "long", year: "numeric" }) : currentView === "agenda" ? dayLabel(selected) : `${week[0]!.toLocaleDateString(locale, { timeZone: "UTC", month: "short", day: "numeric" })} – ${week[6]!.toLocaleDateString(locale, { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}`;
  const root = rs(["rs-scheduler", className], styles.root);
  const toolbar = rs(["rs-scheduler-toolbar"], styles.toolbar);
  const action = rs(["rs-scheduler-action"], styles.action);
  const title = rs(["rs-scheduler-title"], styles.title);
  const scroll = rs(["rs-scheduler-scroll"], styles.scroll);
  const weekStyle = rs(["rs-scheduler-week"], styles.week);
  const dateStyle = rs(["rs-scheduler-date"], styles.date);
  const monthStyle = rs(["rs-scheduler-month"], styles.month);
  const weekdayStyle = rs(["rs-scheduler-weekday"], styles.weekday);
  const list = rs(["rs-scheduler-list"], styles.list);
  const eventStyle = rs(["rs-scheduler-event"], styles.event);
  const eventButton = rs(["rs-scheduler-event-button"], styles.eventButton);
  const time = rs(["rs-scheduler-time"], styles.time);
  const empty = rs(["rs-scheduler-empty"], styles.empty);
  const form = rs(["rs-scheduler-form"], styles.form);
  // Server and browser may have different zones or clocks. The named shell is
  // stable on both; calendar dates are introduced only after hydration.
  if (!hydrated) return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}><p {...empty} role="status">Loading schedule…</p></div>;
  const eventList = (day: Date) => { const items = forDay(day); return items.length ? <ol {...list}>{items.map(event => <li {...eventStyle} key={event.id}>
    {onEventSelect ? <button {...eventButton} type="button" disabled={disabled || event.disabled} onClick={() => onEventSelect(event)}>{event.title}<span {...time}>{range(event)}</span></button> : <><span>{event.title}</span><span {...time}>{range(event)}</span></>}
    {onEventMove && <Button {...action} variant="ghost" disabled={disabled || event.disabled} aria-label={`Reschedule ${event.title}`} onClick={() => { setEditing(event); setEditError(""); setEditDay(dateInput(dayInZone(event.start, zone))); setEditTime(timeInput(event.start, zone)); }}>Reschedule</Button>}
  </li>)}</ol> : <p {...empty}>No events.</p>; };
  const chooseSlot = (day: Date) => { const next = atTime(day, slotTime, zone); if (!next) { setAnnouncement(`That time does not exist in ${zone} because the clocks change. Choose another time.`); return; } if (!disabled) onSlotSelect?.(next); };
  return <div ref={ref} role="region" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...toolbar}><h3 {...title} aria-live="polite">{titleText}</h3><Button {...action} variant="ghost" aria-label={`Previous ${currentView === "agenda" ? "day" : currentView}`} disabled={disabled} onClick={() => shift(-1)}><Icon name="chevron-left" /></Button><Button {...action} variant="ghost" disabled={disabled} onClick={() => changeDay(dayInZone(new Date(), zone))}>Today</Button><Button {...action} variant="ghost" aria-label={`Next ${currentView === "agenda" ? "day" : currentView}`} disabled={disabled} onClick={() => shift(1)}><Icon name="chevron-right" /></Button></div>
    <div {...toolbar}><Input type="date" aria-label="Selected date" value={dateInput(selected)} disabled={disabled} onChange={event => { const day = parseDay(event.target.value); if (day) changeDay(day); }} /><NativeSelect aria-label="Schedule view" value={currentView} disabled={disabled} onChange={event => { const next = event.target.value as SchedulerView; if (view === undefined) setInnerView(next); onViewChange?.(next); }}><option value="agenda">Agenda</option><option value="week">Week</option><option value="month">Month</option></NativeSelect></div>
    <p {...time}>Times in {zone}</p>
    {onSlotSelect && <div {...toolbar}><Input type="time" aria-label="New event time" value={slotTime} disabled={disabled} onChange={event => setSlotTime(event.target.value)} /><Button {...action} variant="ghost" disabled={disabled || !slotTime} onClick={() => chooseSlot(selected)}><Icon name="plus" />Add event</Button></div>}
    {currentView === "agenda" ? eventList(selected) : <div {...scroll} tabIndex={0} role="region" aria-label={`${currentView === "week" ? "Week" : "Month"} calendar`}>
      {currentView === "week" ? <div {...weekStyle}>{week.map(day => { const active = sameDay(day, selected); const cell = rs(["rs-scheduler-day", active && "rs-scheduler-selected"], styles.day, active && styles.selected); return <section key={dateInput(day)} {...cell} aria-label={dayLabel(day)}><button {...dateStyle} type="button" aria-label={dayLabel(day)} aria-pressed={active} disabled={disabled} onClick={() => changeDay(day)}>{weekday(day)} {day.getUTCDate()}</button>{eventList(day)}{onSlotSelect && <Button {...action} variant="ghost" disabled={disabled || !slotTime} aria-label={`Schedule on ${dayLabel(day)}`} onClick={() => chooseSlot(day)}><Icon name="plus" size={12} />{slotTime}</Button>}</section>; })}</div>
      : <table {...monthStyle} aria-label={titleText}><thead><tr>{week.map(day => <th key={day.getUTCDay()} {...weekdayStyle} scope="col">{weekday(day)}</th>)}</tr></thead><tbody>{Array.from({ length: 6 }, (_, row) => <tr key={row}>{Array.from({ length: 7 }, (_, column) => { const day = addDays(monthBeginning, row * 7 + column); const active = sameDay(day, selected); const outside = day.getUTCMonth() !== selected.getUTCMonth(); const cell = rs(["rs-scheduler-cell", active && "rs-scheduler-selected", outside && "rs-scheduler-outside"], styles.cell, active && styles.selected, outside && styles.outside); return <td key={column} {...cell}><button {...dateStyle} type="button" aria-label={dayLabel(day)} aria-pressed={active} disabled={disabled} onClick={() => changeDay(day)}>{day.getUTCDate()}</button>{eventList(day)}</td>; })}</tr>)}</tbody></table>}
    </div>}
    <p {...empty} role="status">{announcement}</p>
    <Dialog open={editing !== null} onClose={() => setEditing(null)} closeLabel="Cancel reschedule"><DialogTitle>Reschedule {editing?.title}</DialogTitle><form {...form} onSubmit={event => { event.preventDefault(); const day = parseDay(editDay); if (!editing || !day || !editTime) return; const start = atTime(day, editTime, zone); if (!start) { setEditError(`That time does not exist in ${zone} because the clocks change. Choose another time.`); return; } const end = new Date(start.getTime() + editing.end.getTime() - editing.start.getTime()); onEventMove?.(editing, { start, end }); setAnnouncement(`${editing.title} rescheduled to ${dayLabel(dayInZone(start, zone))} at ${timeFormat(start)}.`); setEditing(null); }}><Input label="Date" type="date" value={editDay} required onChange={event => setEditDay(event.target.value)} /><Input label="Start time" type="time" value={editTime} required onChange={event => setEditTime(event.target.value)} />{editError && <p {...empty} role="alert">{editError}</p>}<Button type="submit">Save schedule</Button></form></Dialog>
  </div>;
});
