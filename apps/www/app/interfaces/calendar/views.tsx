"use client";

import { useLayoutEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent } from "react";
import { Icon } from "@noorddev/vlak-react";
import type { CalendarViewsProps, Occurrence } from "./types";
import "./views.css";

const HOUR = 88;
const DAY_HEIGHT = HOUR * 24;
const dragType = "application/x-vlak-calendar-occurrence";
const localDay = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`);
const isoDay = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
function shiftDay(value: string, amount: number) { const date = localDay(value); date.setDate(date.getDate() + amount); return isoDay(date); }
function weekStart(value: string, starts: number) { return shiftDay(value, -((localDay(value).getDay() - starts + 7) % 7)); }
const dateFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const fullDate = (value: string) => dateFormat.format(localDay(value));
const shortDate = (value: string) => shortFormat.format(localDay(value));
const weekday = (value: string) => weekdayFormat.format(localDay(value));
const clock = (value: string) => value.slice(11, 16);
const wallTime = (day: string, minutes: number) => `${day}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const intersects = (item: Occurrence, day: string) => item.start.slice(0, 10) <= day && item.end > `${day}T00:00`;
const timeLabel = (item: Occurrence) => item.event.allDay ? "All day" : `${clock(item.start)}–${item.start.slice(0, 10) === item.end.slice(0, 10) ? "" : `${shortDate(item.end)} `}${clock(item.end)}`;
const eventLabel = (item: Occurrence) => `Open ${item.event.title}, ${fullDate(item.start)}, ${timeLabel(item)}`;

type Segment = { occurrence: Occurrence; start: number; end: number; lane: number; lanes: number };
/** Overlapping visual hit areas occupy separate lanes, including short appointments. */
function daySegments(occurrences: Occurrence[], day: string): Segment[] {
  const minute = (value: string) => Number(value.slice(11, 13)) * 60 + Number(value.slice(14, 16));
  const segments = occurrences.filter(item => !item.event.allDay && intersects(item, day)).map(occurrence => ({ occurrence, start: occurrence.start.slice(0, 10) < day ? 0 : minute(occurrence.start), end: occurrence.end.slice(0, 10) > day ? 1440 : minute(occurrence.end), lane: 0, lanes: 1 })).sort((a, b) => a.start - b.start || b.end - a.end);
  let group: Segment[] = [], laneEnds: number[] = [], groupEnd = -1;
  const finish = () => { for (const item of group) item.lanes = laneEnds.length; };
  for (const segment of segments) {
    if (segment.start >= groupEnd) { finish(); group = []; laneEnds = []; groupEnd = -1; }
    const end = Math.max(segment.end, segment.start + 30);
    let lane = laneEnds.findIndex(value => value <= segment.start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end; segment.lane = lane; group.push(segment); groupEnd = Math.max(groupEnd, end);
  }
  finish();
  return segments;
}

export function CalendarViews(props: CalendarViewsProps) {
  const { view, date, today, weekStartsOn, calendars, onDate, onCreate, onOpen, onMove } = props;
  const root = useRef<HTMLDivElement>(null), picker = useRef<HTMLDivElement>(null), detail = useRef<HTMLHeadingElement>(null), timeline = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false), [expanded, setExpanded] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragged = useRef<Occurrence | null>(null), pendingDateFocus = useRef<string | null>(null);
  const occurrences = useMemo(() => {
    const visible = new Set(calendars.filter(calendar => calendar.visible).map(calendar => calendar.id));
    return props.occurrences.filter(item => visible.has(item.event.calendarId)).sort((a, b) => a.start.localeCompare(b.start) || a.event.title.localeCompare(b.event.title));
  }, [calendars, props.occurrences]);
  const dayCache = new Map<string, Occurrence[]>();
  const forDay = (day: string) => {
    const cached = dayCache.get(day);
    if (cached) return cached;
    const items = occurrences.filter(item => intersects(item, day)).sort((a, b) => Number(b.event.allDay) - Number(a.event.allDay) || a.start.localeCompare(b.start));
    dayCache.set(day, items); return items;
  };
  const calendarName = (item: Occurrence) => calendars.find(calendar => calendar.id === item.event.calendarId)?.name ?? "";
  const week = Array.from({ length: 7 }, (_, index) => shiftDay(weekStart(date, weekStartsOn), index));
  const monthFirst = `${date.slice(0, 7)}-01`;
  const nextMonth = localDay(monthFirst); nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthStart = weekStart(monthFirst, weekStartsOn);
  const lastMonthDay = shiftDay(isoDay(nextMonth), -1);
  const monthLength = Math.ceil((Math.round((localDay(lastMonthDay).getTime() - localDay(monthStart).getTime()) / 86400000) + 1) / 7) * 7;
  const month = Array.from({ length: monthLength }, (_, index) => shiftDay(monthStart, index));
  const periodStart = view === "day" ? date : week[0]!;
  const initialScrollPeriod = useRef("");

  useLayoutEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(entries => { const width = entries[0]?.contentRect.width; if (width) setCompact(width <= 640); });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const key = `${view}:${compact}:${periodStart}`;
    if (!compact && (view === "week" || view === "day") && timeline.current && initialScrollPeriod.current !== key) timeline.current.scrollTop = 8 * HOUR;
    initialScrollPeriod.current = key;
  }, [view, compact, periodStart]);
  useLayoutEffect(() => {
    const pending = pendingDateFocus.current;
    if (pending === date) picker.current?.querySelector<HTMLButtonElement>(`button[data-date="${pending}"]`)?.focus({ preventScroll: true });
    pendingDateFocus.current = null;
  }, [date]);
  useLayoutEffect(() => {
    if (view === "month" && expanded === date && !compact) { detail.current?.focus({ preventScroll: true }); detail.current?.scrollIntoView({ block: "nearest" }); }
  }, [expanded, date, compact, view]);
  useLayoutEffect(() => { if (view !== "month") setExpanded(null); }, [view]);

  const selectDate = (day: string, keyboard = false) => { if (keyboard) pendingDateFocus.current = day; onDate(day); };
  const dateKey = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next: string | undefined;
    if (event.key in offsets) next = shiftDay(day, offsets[event.key]!);
    else if (event.key === "Home") next = weekStart(day, weekStartsOn);
    else if (event.key === "End") next = shiftDay(weekStart(day, weekStartsOn), 6);
    if (next) { event.preventDefault(); selectDate(next, true); }
  };
  const create = (day: string, minutes = 9 * 60, allDay = false) => { onDate(day); onCreate(wallTime(day, minutes), allDay); };
  const dragStart = (event: DragEvent<HTMLButtonElement>, occurrence: Occurrence) => {
    dragged.current = occurrence; setDragging(occurrence.key);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(dragType, occurrence.key);
    event.dataTransfer.setData("text/plain", occurrence.event.title);
  };
  const dragEnd = () => { dragged.current = null; setDragging(null); for (const target of root.current?.querySelectorAll<HTMLElement>("[data-drop]") ?? []) delete target.dataset.drop; };
  const dragOver = (event: DragEvent<HTMLElement>) => {
    if (!dragged.current || !event.dataTransfer.types.includes(dragType)) return;
    event.preventDefault(); event.dataTransfer.dropEffect = "move"; event.currentTarget.dataset.drop = "true";
  };
  const dragLeave = (event: DragEvent<HTMLElement>) => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) delete event.currentTarget.dataset.drop; };
  const drop = (event: DragEvent<HTMLElement>, day: string, minutes?: number) => {
    const occurrence = dragged.current;
    delete event.currentTarget.dataset.drop;
    if (!occurrence || !event.dataTransfer.types.includes(dragType)) return;
    event.preventDefault(); event.stopPropagation();
    const time = occurrence.event.allDay ? 0 : minutes ?? (Number(clock(occurrence.start).slice(0, 2)) * 60 + Number(clock(occurrence.start).slice(3)));
    dragEnd(); onMove(occurrence, wallTime(day, time));
  };
  const eventButton = (occurrence: Occurrence, className = "cal-month-event") => <button key={occurrence.key} type="button" className={className} aria-label={eventLabel(occurrence)} draggable={!compact} data-dragging={dragging === occurrence.key || undefined} onDragStart={event => dragStart(event, occurrence)} onDragEnd={dragEnd} onClick={() => onOpen(occurrence)}>{!occurrence.event.allDay && <time>{clock(occurrence.start)}</time>}<span>{occurrence.event.title}</span></button>;
  const dateButton = (day: string, extra = false) => <button type="button" className="cal-date-button" data-date={day} data-today={day === today || undefined} data-outside={day.slice(0, 7) !== date.slice(0, 7) || undefined} aria-label={fullDate(day)} aria-current={day === today ? "date" : undefined} aria-description={view === "day" && day !== date ? undefined : `${forDay(day).length} ${forDay(day).length === 1 ? "event" : "events"}`} aria-pressed={day === date} tabIndex={day === date ? 0 : -1} onKeyDown={event => dateKey(event, day)} onClick={() => selectDate(day)}>{extra && <span className="cal-weekday">{weekday(day)}</span>}<span>{localDay(day).getDate()}</span></button>;
  const dayList = (day: string, showClose = false) => {
    const items = forDay(day);
    return <section className="cal-day-list" aria-label={`Events on ${fullDate(day)}`} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={event => drop(event, day)}>
      <div className="cal-list-heading"><h3 ref={detail} tabIndex={-1}>{fullDate(day)}</h3>{showClose && <button type="button" className="cal-view-icon" aria-label="Close day details" onClick={() => { setExpanded(null); const selected = picker.current?.querySelector<HTMLButtonElement>(`button[data-date="${day}"]`); selected?.focus({ preventScroll: true }); selected?.scrollIntoView({ block: "nearest" }); }}><Icon name="close" size={16} /></button>}<button type="button" className="cal-view-icon" aria-label={`Create event on ${fullDate(day)}`} onClick={() => create(day)}><Icon name="plus" size={16} /></button></div>
      {items.length ? <ol className="cal-event-list">{items.map(item => <li key={item.key}><button type="button" className="cal-agenda-event" aria-label={eventLabel(item)} draggable={!compact} data-dragging={dragging === item.key || undefined} onDragStart={event => dragStart(event, item)} onDragEnd={dragEnd} onClick={() => onOpen(item)}><span className="cal-agenda-time">{item.event.allDay ? "All day" : <><time>{item.start.slice(0, 10) < day ? "00:00" : clock(item.start)}</time><small>{item.end.slice(0, 10) > day ? "Continues" : clock(item.end)}</small></>}</span><span className="cal-agenda-copy"><strong>{item.event.title}</strong><span>{[item.event.location, calendarName(item)].filter(Boolean).join(" · ")}</span></span>{item.event.recurrence && <Icon name="refresh" size={16} />}</button></li>)}</ol> : <div className="cal-empty-day"><p>Nothing scheduled.</p><button type="button" className="cal-view-text" onClick={() => create(day)}>Add an event</button></div>}
    </section>;
  };

  const monthView = () => <div className="cal-month-view">
    <div className="cal-date-scroll"><div ref={picker} className="cal-month-grid" role="group" aria-label={localDay(date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}>
      {month.slice(0, 7).map(day => <div key={`heading-${day}`} className="cal-month-weekday" aria-hidden="true">{weekday(day)}</div>)}
      {month.map(day => {
        const items = forDay(day);
        return <div key={day} className="cal-month-cell" data-selected={day === date || undefined} data-outside={day.slice(0, 7) !== date.slice(0, 7) || undefined} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={event => drop(event, day)}>
          <div className="cal-month-date">{dateButton(day)}{!compact && <button type="button" className="cal-view-icon cal-cell-create" aria-label={`Create event on ${fullDate(day)}`} onClick={() => create(day)}><Icon name="plus" size={16} /></button>}</div>
          {compact ? <span className="cal-date-count" aria-hidden="true">{items.length || ""}</span> : <div className="cal-month-events">{items.slice(0, 1).map(item => eventButton(item))}{items.length > 1 && <button type="button" className="cal-view-text cal-view-all" aria-label={`View all ${items.length} events on ${fullDate(day)}`} onClick={() => { onDate(day); setExpanded(day); }}>+{items.length - 1} more</button>}</div>}
        </div>;
      })}
    </div></div>
    {(compact || expanded === date) && dayList(date, !compact)}
  </div>;
  const compactWeek = () => <div className="cal-compact-schedule"><div className="cal-week-strip" ref={picker} role="group" aria-label="Choose a date">{week.map(day => <div key={day} className="cal-strip-date">{dateButton(day, true)}{view === "week" && <span className="cal-date-count" aria-hidden="true">{forDay(day).length || "—"}</span>}</div>)}</div>{dayList(date)}</div>;

  const schedule = () => {
    const days = view === "day" ? [date] : week;
    const columns = days.map(day => ({ day, segments: daySegments(occurrences, day) }));
    const sizes = columns.map(({ segments }) => Math.max(120, ...segments.map(segment => segment.lanes * 60)));
    const createMinute = (event: MouseEvent<HTMLButtonElement> | DragEvent<HTMLElement>, hour: number) => {
      const fraction = event.type === "click" && event.detail === 0 ? 0 : Math.max(0, Math.min(.999, (event.clientY - event.currentTarget.getBoundingClientRect().top) / HOUR));
      return hour * 60 + Math.floor(fraction * 4) * 15;
    };
    return <div ref={timeline} className="cal-timeline-scroll" role="region" aria-label={`${view === "day" ? "Day" : "Week"} schedule`}>
      <div ref={picker} className="cal-timeline-grid" style={{ gridTemplateColumns: `56px ${sizes.map(size => `minmax(${size}px, 1fr)`).join(" ")}`, minWidth: `${56 + sizes.reduce((sum, size) => sum + size, 0)}px` }}>
        <div className="cal-time-corner cal-timeline-heading" aria-hidden="true">24h</div>
        {days.map(day => <div key={`heading-${day}`} className="cal-timeline-heading" data-selected={day === date || undefined}>{dateButton(day, true)}</div>)}
        <div className="cal-all-day-label">All day</div>
        {days.map(day => <div key={`all-${day}`} className="cal-all-day" onDragOver={dragOver} onDragLeave={dragLeave} onDrop={event => drop(event, day)}>{forDay(day).filter(item => item.event.allDay).map(item => eventButton(item, "cal-all-day-event"))}<button type="button" className="cal-all-day-create" aria-label={`Create all-day event on ${fullDate(day)}`} onClick={() => create(day, 0, true)}><Icon name="plus" size={16} /></button></div>)}
        <div className="cal-time-rail" aria-hidden="true" style={{ height: DAY_HEIGHT + 44 }}>{Array.from({ length: 25 }, (_, hour) => <span key={hour} style={{ top: hour * HOUR }}>{String(hour).padStart(2, "0")}:00</span>)}</div>
        {columns.map(({ day, segments }) => <div key={day} className="cal-timed-day" style={{ height: DAY_HEIGHT + 44 }} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={event => drop(event, day, Math.min(1425, Math.max(0, Math.floor((event.clientY - event.currentTarget.getBoundingClientRect().top) / HOUR * 4) * 15)))}>
          {Array.from({ length: 24 }, (_, hour) => <button key={hour} type="button" className="cal-time-slot" style={{ top: hour * HOUR, height: HOUR }} aria-label={`Create event on ${fullDate(day)} at ${String(hour).padStart(2, "0")}:00`} onClick={event => create(day, createMinute(event, hour))} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={event => drop(event, day, createMinute(event, hour))} />)}
          {segments.map(segment => <button key={segment.occurrence.key} type="button" className="cal-timed-event" aria-label={eventLabel(segment.occurrence)} draggable data-dragging={dragging === segment.occurrence.key || undefined} style={{ top: segment.start / 60 * HOUR, height: Math.max(44, (segment.end - segment.start) / 60 * HOUR), left: `calc(${segment.lane / segment.lanes * 100}% + 2px)`, width: `calc(${100 / segment.lanes}% - 4px)` }} onDragStart={event => dragStart(event, segment.occurrence)} onDragEnd={dragEnd} onClick={() => onOpen(segment.occurrence)}><strong>{segment.occurrence.event.title}</strong><span>{timeLabel(segment.occurrence)}</span>{segment.end - segment.start >= 90 && segment.occurrence.event.location && <span>{segment.occurrence.event.location}</span>}</button>)}
        </div>)}
      </div>
    </div>;
  };
  const agenda = () => {
    const days = Array.from({ length: 30 }, (_, index) => shiftDay(date, index)).filter(day => forDay(day).length);
    return <div className="cal-agenda-view">{days.length ? days.map(day => <div key={day}>{dayList(day)}</div>) : <div className="cal-agenda-empty"><h3>A little room in your calendar</h3><p>No events in the next 30 days.</p><button type="button" className="cal-view-text" onClick={() => create(date)}>Add an event</button></div>}</div>;
  };

  return <div ref={root} className="cal-views" data-view={view} data-compact={compact}>{view === "month" ? monthView() : view === "agenda" ? agenda() : compact ? compactWeek() : schedule()}</div>;
}
