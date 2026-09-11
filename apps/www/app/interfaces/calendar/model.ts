import type { CalendarEvent, CalendarStore, Frequency, Occurrence, Recurrence } from "./types";

/** Dates are civil values, not elapsed-time instants. UTC is only an arithmetic workspace. */
export const CALENDAR_LIMITS = { minYear: 1900, maxYear: 2200, events: 2000, occurrences: 10000, bytes: 2 * 1024 * 1024, exclusions: 10000 } as const;
const DAY = 86_400_000, MINUTE = 60_000;
const MIN = Date.UTC(CALENDAR_LIMITS.minYear, 0, 1), MAX = Date.UTC(CALENDAR_LIMITS.maxYear + 1, 0, 1);
const frequencies: Frequency[] = ["daily", "weekly", "monthly", "yearly"];
const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const encoder = new TextEncoder();
const pad = (n: number) => String(n).padStart(2, "0");
const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const identifier = (value: unknown): value is string => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:@+/-]{0,255}$/.test(value);
const textValue = (value: unknown, max: number) => typeof value === "string" && value.length <= max && ![...value].some(char => { const n = char.charCodeAt(0); return n < 32 && n !== 9 && n !== 10 || n === 127; });

export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= CALENDAR_LIMITS.minYear && year <= CALENDAR_LIMITS.maxYear && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
export function isWallTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) && isDate(value.slice(0, 10));
}
const dateNumber = (date: string) => {
  if (!isDate(date)) throw new RangeError("Use a valid date between 1900 and 2200.");
  return Date.parse(`${date}T00:00:00Z`);
};
const wallNumber = (value: string) => {
  if (!isWallTime(value)) throw new RangeError("Use a valid local date and time between 1900 and 2200.");
  return Date.parse(`${value}:00Z`);
};
const fromNumber = (value: number, time = false) => {
  if (!Number.isFinite(value) || value < MIN || value >= MAX) throw new RangeError("Dates must stay between 1900 and 2200.");
  return new Date(value).toISOString().slice(0, time ? 16 : 10);
};
export function localDate(date: Date): string {
  const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  if (!isDate(value)) throw new RangeError("Use a valid date between 1900 and 2200.");
  return value;
}
export function dateTime(date: string, time = "09:00"): string {
  const value = `${date}T${time}`;
  if (!isWallTime(value)) throw new RangeError("Use a valid local date and time.");
  return value;
}
export function addDays(date: string, amount: number): string {
  if (!Number.isSafeInteger(amount)) throw new RangeError("Days must be a whole number.");
  return fromNumber(dateNumber(date) + amount * DAY);
}
export function addMonths(date: string, amount: number): string {
  if (!Number.isSafeInteger(amount) || Math.abs(amount) > 3612) throw new RangeError("Months must be a bounded whole number.");
  const source = new Date(dateNumber(date));
  const first = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + amount, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return fromNumber(first.getTime() + (Math.min(source.getUTCDate(), last) - 1) * DAY);
}
export function addMinutes(value: string, amount: number): string {
  if (!Number.isSafeInteger(amount)) throw new RangeError("Minutes must be a whole number.");
  return fromNumber(wallNumber(value) + amount * MINUTE, true);
}
export function dayOfWeek(date: string): number { return new Date(dateNumber(date)).getUTCDay(); }
export function startOfWeek(date: string, startsOn: 0 | 1): string {
  if (startsOn !== 0 && startsOn !== 1) throw new RangeError("Weeks begin on Sunday or Monday.");
  return addDays(date, -((dayOfWeek(date) - startsOn + 7) % 7));
}

export function validateEvent(event: CalendarEvent): string | null {
  if (!record(event)) return "Event must be an object.";
  if (!identifier(event.id) || !identifier(event.calendarId)) return "Event and calendar identifiers are invalid.";
  if (!textValue(event.title, 200) || !event.title.trim()) return "Add a title of 200 characters or fewer.";
  if (!textValue(event.description, 10000)) return "Description must contain 10,000 characters or fewer.";
  if (!textValue(event.location, 500)) return "Location must contain 500 characters or fewer.";
  if (!isWallTime(event.start) || !isWallTime(event.end)) return "Use valid dates and times between 1900 and 2200.";
  if (event.end <= event.start) return "End must be after start.";
  if (typeof event.allDay !== "boolean") return "Choose whether the event is all day.";
  if (event.allDay && (!event.start.endsWith("T00:00") || !event.end.endsWith("T00:00"))) return "All-day events start and end at midnight; the end date is exclusive.";
  if (event.recurrence !== undefined) {
    const rule = event.recurrence;
    if (!record(rule) || !frequencies.includes(rule.frequency) || !Number.isInteger(rule.interval) || rule.interval < 1 || rule.interval > 1000) return "Recurrence needs a supported frequency and an interval from 1 to 1,000.";
    if (Object.keys(rule).some(key => !["frequency", "interval", "count", "until", "weekdays"].includes(key))) return "Recurrence contains an unsupported rule.";
    if (rule.count !== undefined && (!Number.isInteger(rule.count) || rule.count < 1 || rule.count > 10000)) return "Recurrence count must be from 1 to 10,000.";
    if (rule.until !== undefined && (!isDate(rule.until) || rule.until < event.start.slice(0, 10))) return "Repeat until must be a valid date on or after the start.";
    if (rule.count !== undefined && rule.until !== undefined) return "Use either a repeat count or an end date.";
    if (rule.weekdays !== undefined) {
      if (rule.frequency !== "weekly" || !Array.isArray(rule.weekdays) || !rule.weekdays.length || rule.weekdays.length > 7 || rule.weekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6) || new Set(rule.weekdays).size !== rule.weekdays.length) return "Weekly recurrence needs distinct weekdays from Sunday to Saturday.";
      if (!rule.weekdays.includes(dayOfWeek(event.start.slice(0, 10)))) return "Weekly recurrence must include the event's start day.";
    }
  }
  if (event.exclusions !== undefined && (!Array.isArray(event.exclusions) || event.exclusions.length > CALENDAR_LIMITS.exclusions || event.exclusions.some(value => !isWallTime(value) || event.allDay && !value.endsWith("T00:00")) || new Set(event.exclusions).size !== event.exclusions.length)) return "Excluded occurrences must be unique valid start times.";
  return null;
}
function copyEvent(event: CalendarEvent): CalendarEvent {
  const rule = event.recurrence;
  return { id: event.id, calendarId: event.calendarId, title: event.title, description: event.description, location: event.location, start: event.start, end: event.end, allDay: event.allDay,
    ...(rule ? { recurrence: { frequency: rule.frequency, interval: rule.interval, ...(rule.until !== undefined ? { until: rule.until } : {}), ...(rule.count !== undefined ? { count: rule.count } : {}), ...(rule.weekdays ? { weekdays: [...rule.weekdays] } : {}) } } : {}),
    ...(event.exclusions ? { exclusions: [...event.exclusions] } : {}),
  };
}
export function parseStore(raw: string): CalendarStore | null {
  if (typeof raw !== "string" || raw.length > CALENDAR_LIMITS.bytes || encoder.encode(raw).length > CALENDAR_LIMITS.bytes) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !Array.isArray(value.calendars) || !value.calendars.length || value.calendars.length > 32 || !Array.isArray(value.events) || value.events.length > CALENDAR_LIMITS.events || !["month", "week", "day", "agenda"].includes(String(value.view)) || value.weekStartsOn !== 0 && value.weekStartsOn !== 1) return null;
    const calendarIds = new Set<string>(), eventIds = new Set<string>();
    for (const calendar of value.calendars) {
      if (!record(calendar) || !identifier(calendar.id) || calendarIds.has(calendar.id) || !textValue(calendar.name, 60) || !(calendar.name as string).trim() || typeof calendar.visible !== "boolean") return null;
      calendarIds.add(calendar.id);
    }
    for (const event of value.events) {
      if (validateEvent(event) || !calendarIds.has(event.calendarId) || eventIds.has(event.id)) return null;
      eventIds.add(event.id);
    }
    return { version: 1, calendars: value.calendars.map(calendar => ({ id: calendar.id, name: calendar.name, visible: calendar.visible })), events: value.events.map(copyEvent), view: value.view as CalendarStore["view"], weekStartsOn: value.weekStartsOn };
  } catch { return null; }
}
export function makeInitialStore(today: string): CalendarStore {
  dateNumber(today);
  const relative = (offset: number) => fromNumber(Math.max(MIN, Math.min(MAX - 2 * DAY, dateNumber(today) + offset * DAY)));
  const event = (id: string, calendarId: string, title: string, offset: number, start: string, end: string, location = ""): CalendarEvent => ({ id, calendarId, title, description: "", location, start: dateTime(relative(offset), start), end: dateTime(relative(offset), end), allDay: false });
  return { version: 1, calendars: [{ id: "work", name: "Work", visible: true }, { id: "personal", name: "Personal", visible: true }], view: "month", weekStartsOn: 1, events: [
    { ...event("sample-studio", "work", "Studio check-in", 0, "09:30", "10:00", "Studio"), recurrence: { frequency: "weekly", interval: 1 } },
    event("sample-review", "work", "Design review", 1, "14:00", "15:00", "Meeting room"),
    event("sample-walk", "personal", "A walk by the water", 0, "17:30", "18:30"),
    event("sample-lunch", "personal", "Lunch with Alex", 3, "12:30", "13:30"),
    { ...event("sample-focus", "work", "Time to make", 2, "10:00", "12:00"), description: "An open block for focused work." },
    { id: "sample-day", calendarId: "personal", title: "A day away", description: "", location: "", start: dateTime(relative(5), "00:00"), end: dateTime(addDays(relative(5), 1), "00:00"), allDay: true },
  ] };
}

export function shiftEvent(event: CalendarEvent, newStart: string): CalendarEvent {
  // Editors call this while title/recurrence fields may still be incomplete.
  if (wallNumber(event.end) <= wallNumber(event.start)) throw new RangeError("End must be after start.");
  if (event.allDay && (!event.start.endsWith("T00:00") || !event.end.endsWith("T00:00") || !newStart.endsWith("T00:00"))) throw new RangeError("All-day events use midnight boundaries.");
  const delta = wallNumber(newStart) - wallNumber(event.start);
  const shifted: CalendarEvent = { ...copyEvent(event), start: newStart, end: fromNumber(wallNumber(event.end) + delta, true) };
  if (event.recurrence) {
    const days = Math.floor(wallNumber(newStart) / DAY) - Math.floor(wallNumber(event.start) / DAY);
    shifted.recurrence = { ...shifted.recurrence!, ...(event.recurrence.until ? { until: addDays(event.recurrence.until, days) } : {}), ...(event.recurrence.weekdays ? { weekdays: event.recurrence.weekdays.map(day => ((day + days) % 7 + 7) % 7).sort((a, b) => a - b) } : {}) };
  }
  if (event.exclusions) shifted.exclusions = event.exclusions.map(start => fromNumber(wallNumber(start) + delta, true));
  return shifted;
}

/** Each iterator skips to the requested window without spending COUNT on exclusions. */
function* eventOccurrences(event: CalendarEvent, lower: number, upper: number): Generator<Occurrence> {
  const base = wallNumber(event.start), duration = wallNumber(event.end) - base;
  const timeOfDay = ((base % DAY) + DAY) % DAY;
  const excluded = new Set(event.exclusions ?? []), rule = event.recurrence;
  const earliest = Math.max(base, lower - duration + MINUTE);
  const latest = Math.min(upper, rule?.until ? dateNumber(rule.until) + DAY : MAX);
  const occurrence = (start: number): Occurrence | null => {
    if (start < base || start >= latest || start + duration <= lower || start + duration >= MAX) return null;
    const value = fromNumber(start, true);
    if (excluded.has(value)) return null;
    return { key: `${event.id}/${value}`, eventId: event.id, originalStart: value, start: value, end: fromNumber(start + duration, true), event };
  };
  if (!rule) { const value = occurrence(base); if (value) yield value; return; }
  const count = rule.count ?? Number.POSITIVE_INFINITY;
  if (rule.frequency === "daily") {
    const step = rule.interval * DAY;
    for (let index = Math.max(0, Math.ceil((earliest - base) / step)); index < count && base + index * step < latest; index++) {
      const value = occurrence(base + index * step); if (value) yield value;
    }
  } else if (rule.frequency === "weekly") {
    const baseDay = Math.floor(base / DAY) * DAY, weekday = new Date(base).getUTCDay();
    const monday = baseDay - ((weekday + 6) % 7) * DAY;
    const offsets = (rule.weekdays ?? [weekday]).map(day => (day + 6) % 7).sort((a, b) => a - b);
    const first = offsets.filter(day => monday + day * DAY + timeOfDay >= base).length;
    const step = rule.interval * 7 * DAY;
    for (let cycle = Math.max(0, Math.floor((earliest - monday) / step)); monday + cycle * step < latest; cycle++) {
      let firstRank = 0;
      for (let rank = 0; rank < offsets.length; rank++) {
        const start = monday + cycle * step + offsets[rank]! * DAY + timeOfDay;
        if (start < base) continue;
        const ordinal = cycle === 0 ? ++firstRank : first + (cycle - 1) * offsets.length + rank + 1;
        if (ordinal > count || start >= latest) return;
        if (start >= earliest) { const value = occurrence(start); if (value) yield value; }
      }
    }
  } else {
    const original = new Date(base), step = rule.interval * (rule.frequency === "yearly" ? 12 : 1);
    const windowDate = new Date(earliest);
    const monthsToWindow = (windowDate.getUTCFullYear() - original.getUTCFullYear()) * 12 + windowDate.getUTCMonth() - original.getUTCMonth();
    const firstIndex = rule.count === undefined ? Math.max(0, Math.floor(monthsToWindow / step)) : 0;
    let ordinal = 0;
    for (let index = firstIndex; index <= 3612; index++) {
      const first = new Date(Date.UTC(original.getUTCFullYear(), original.getUTCMonth() + index * step, 1));
      if (first.getTime() >= latest) return;
      const start = first.getTime() + (original.getUTCDate() - 1) * DAY + timeOfDay;
      // A missing date is skipped, never clamped, and does not consume COUNT.
      if (new Date(start).getUTCMonth() !== first.getUTCMonth()) continue;
      if (++ordinal > count || start >= latest) return;
      if (start >= earliest) { const value = occurrence(start); if (value) yield value; }
    }
  }
}
export function expandEvents(events: CalendarEvent[], rangeStartDate: string, rangeEndDateExclusive: string): Occurrence[] {
  const lower = dateNumber(rangeStartDate), upper = dateNumber(rangeEndDateExclusive);
  if (upper <= lower) return [];
  // A merge heap bounds memory and returns the earliest occurrences across every series.
  type Cursor = { value: Occurrence; iterator: Generator<Occurrence> };
  const heap: Cursor[] = [], result: Occurrence[] = [];
  const compare = (a: Cursor, b: Cursor) => a.value.start.localeCompare(b.value.start) || a.value.end.localeCompare(b.value.end) || a.value.key.localeCompare(b.value.key);
  const push = (cursor: Cursor) => {
    let index = heap.length; heap.push(cursor);
    while (index > 0) { const parent = (index - 1) >> 1; if (compare(heap[parent]!, cursor) <= 0) break; heap[index] = heap[parent]!; index = parent; }
    heap[index] = cursor;
  };
  const pop = () => {
    const first = heap[0]!, last = heap.pop()!;
    if (heap.length) {
      let index = 0;
      while (index * 2 + 1 < heap.length) {
        let child = index * 2 + 1;
        if (child + 1 < heap.length && compare(heap[child + 1]!, heap[child]!) < 0) child++;
        if (compare(last, heap[child]!) <= 0) break;
        heap[index] = heap[child]!; index = child;
      }
      heap[index] = last;
    }
    return first;
  };
  for (const event of events.slice(0, CALENDAR_LIMITS.events)) {
    if (validateEvent(event)) continue;
    const iterator = eventOccurrences(event, lower, upper), first = iterator.next();
    if (!first.done) push({ value: first.value, iterator });
  }
  while (heap.length && result.length < CALENDAR_LIMITS.occurrences) {
    const cursor = pop(); result.push(cursor.value);
    const next = cursor.iterator.next();
    if (!next.done) push({ value: next.value, iterator: cursor.iterator });
  }
  return result;
}

const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
const unescapeText = (value: string) => value.replace(/\\([nN,;\\])/g, (_, escaped: string) => escaped.toLowerCase() === "n" ? "\n" : escaped);
function fold(line: string): string {
  let output = "", bytes = 0;
  for (const char of line) {
    const length = encoder.encode(char).length;
    if (bytes + length > 75) { output += "\r\n "; bytes = 1; }
    output += char; bytes += length;
  }
  return output;
}
const compactDate = (value: string) => value.replace(/[-:]/g, "");
export function exportICS(events: CalendarEvent[]): string {
  if (events.length > CALENDAR_LIMITS.events) throw new RangeError("Export supports up to 2,000 events.");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vlak//Calendar//EN", "CALSCALE:GREGORIAN"];
  const ids = new Set<string>();
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  for (const event of events) {
    const issue = validateEvent(event);
    if (issue) throw new RangeError(issue);
    if (ids.has(event.id)) throw new RangeError("Event identifiers must be unique.");
    ids.add(event.id);
    lines.push("BEGIN:VEVENT", `UID:${escapeText(event.id)}`, `DTSTAMP:${stamp}`, `SUMMARY:${escapeText(event.title)}`);
    const value = (time: string) => event.allDay ? compactDate(time.slice(0, 10)) : `${compactDate(time)}00`;
    const kind = event.allDay ? ";VALUE=DATE" : "";
    lines.push(`DTSTART${kind}:${value(event.start)}`, `DTEND${kind}:${value(event.end)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    if (event.recurrence) {
      const rule = event.recurrence;
      const parts = [`FREQ=${rule.frequency.toUpperCase()}`, `INTERVAL=${rule.interval}`];
      if (rule.count !== undefined) parts.push(`COUNT=${rule.count}`);
      if (rule.until) parts.push(`UNTIL=${compactDate(rule.until)}${event.allDay ? "" : "T235959"}`);
      if (rule.weekdays) parts.push(`BYDAY=${rule.weekdays.map(day => weekdays[day]).join(",")}`);
      if (rule.frequency === "weekly") parts.push("WKST=MO");
      lines.push(`RRULE:${parts.join(";")}`);
    }
    if (event.exclusions?.length) lines.push(`EXDATE${kind}:${event.exclusions.map(value).join(",")}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  const output = `${lines.map(fold).join("\r\n")}\r\n`;
  if (encoder.encode(output).length > CALENDAR_LIMITS.bytes) throw new RangeError("Export exceeds the 2 MiB calendar limit.");
  return output;
}

type Property = { name: string; parameters: Map<string, string>; value: string };
function property(line: string): Property {
  const parts: string[] = []; let quoted = false, start = 0, colon = -1;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') quoted = !quoted;
    if (!quoted && line[i] === ";") { parts.push(line.slice(start, i)); start = i + 1; }
    if (!quoted && line[i] === ":") { parts.push(line.slice(start, i)); colon = i; break; }
  }
  if (colon < 0 || quoted || !/^[A-Z0-9-]+$/i.test(parts[0] ?? "")) throw new Error("Malformed calendar property.");
  const parameters = new Map<string, string>();
  for (const part of parts.slice(1)) {
    const at = part.indexOf("="), key = part.slice(0, at).toUpperCase();
    if (at < 1 || parameters.has(key)) throw new Error("Malformed calendar parameters.");
    let value = part.slice(at + 1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    parameters.set(key, value.replace(/\^([nN^'])/g, (_, char: string) => char === "'" ? '"' : char.toLowerCase() === "n" ? "\n" : "^"));
  }
  return { name: parts[0]!.toUpperCase(), parameters, value: line.slice(colon + 1) };
}
function localWall(instant: number): string {
  const date = new Date(instant);
  if (date.getSeconds() !== 0) throw new Error("This timezone conversion requires sub-minute precision, which is not supported.");
  return dateTime(localDate(date), `${pad(date.getHours())}:${pad(date.getMinutes())}`);
}
function zoneInstant(wall: string, zone: string): number {
  let format: Intl.DateTimeFormat;
  try { format = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }); }
  catch { throw new Error(`Unsupported timezone ${zone}.`); }
  const at = (instant: number) => {
    const parts = Object.fromEntries(format.formatToParts(instant).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  };
  const target = wallNumber(wall);
  // Sample both sides of transitions, including half-hour DST and date-line jumps.
  // An ambiguous local clock selects its first occurrence, as required by RFC5545.
  const offsets = new Set([-2, -1, 0, 1, 2].map(days => {
    const sample = target + days * DAY;
    return Date.parse(`${at(sample)}Z`) - sample;
  }));
  const matches = [...offsets].map(offset => target - offset).filter(value => at(value) === `${wall}:00`);
  if (!matches.length) throw new Error(`The time does not exist in ${zone}.`);
  return Math.min(...matches);
}
type ParsedTime = { wall: string; source: string; allDay: boolean; zone: string | null };
function parseTime(value: string, parameters: Map<string, string>): ParsedTime {
  const type = parameters.get("VALUE")?.toUpperCase(), zone = parameters.get("TZID") ?? null;
  if (parameters.has("ENCODING") || type && type !== "DATE" && type !== "DATE-TIME") throw new Error("Unsupported date encoding.");
  if (type === "DATE") {
    if (zone || !/^\d{8}$/.test(value)) throw new Error("Invalid all-day date.");
    const date = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    const wall = dateTime(date, "00:00");
    return { wall, source: wall, allDay: true, zone: null };
  }
  if (!/^\d{8}T\d{6}Z?$/.test(value)) throw new Error("Unsupported date-time format.");
  if (value.slice(13, 15) !== "00") throw new Error("Sub-minute event times are not supported.");
  const source = dateTime(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`, `${value.slice(9, 11)}:${value.slice(11, 13)}`);
  if (value.endsWith("Z")) {
    if (zone) throw new Error("UTC dates cannot also specify TZID.");
    return { wall: localWall(wallNumber(source)), source, allDay: false, zone: "UTC" };
  }
  return { wall: zone ? localWall(zoneInstant(source, zone)) : source, source, allDay: false, zone };
}
function readRule(value: string, start: ParsedTime): Recurrence {
  if (start.zone) throw new Error("Timezone-based recurrence cannot be preserved in a local-time calendar; this series was skipped.");
  const fields = new Map<string, string>();
  for (const part of value.toUpperCase().split(";")) {
    const pair = part.split("=");
    if (pair.length !== 2 || !pair[0] || !pair[1] || fields.has(pair[0])) throw new Error("Malformed recurrence rule.");
    if (!["FREQ", "INTERVAL", "UNTIL", "COUNT", "BYDAY", "WKST"].includes(pair[0])) throw new Error(`Unsupported recurrence rule ${pair[0]}; this series was skipped.`);
    fields.set(pair[0], pair[1]);
  }
  const frequency = fields.get("FREQ")?.toLowerCase() as Frequency;
  if (!frequencies.includes(frequency)) throw new Error("Unsupported recurrence frequency.");
  const integer = (key: string, fallback?: number) => {
    const value = fields.get(key);
    if (value === undefined) return fallback;
    if (!/^\d+$/.test(value)) throw new Error(`Invalid recurrence ${key}.`);
    return Number(value);
  };
  const rule: Recurrence = { frequency, interval: integer("INTERVAL", 1)! };
  if (fields.has("COUNT")) rule.count = integer("COUNT")!;
  if (fields.has("BYDAY")) {
    if (frequency !== "weekly") throw new Error("BYDAY is supported for weekly recurrence only.");
    rule.weekdays = fields.get("BYDAY")!.split(",").map(day => { const index = weekdays.indexOf(day); if (index < 0) throw new Error("Ordinal weekdays are not supported."); return index; });
  }
  if (fields.has("WKST") && !weekdays.includes(fields.get("WKST")!)) throw new Error("Invalid recurrence week boundary.");
  if (fields.has("WKST") && fields.get("WKST") !== "MO" && frequency === "weekly" && rule.interval !== 1) throw new Error("Weekly intervals with a non-Monday week boundary are not supported.");
  const until = fields.get("UNTIL");
  if (until) {
    if (start.allDay) {
      if (!/^\d{8}$/.test(until)) throw new Error("All-day recurrence requires a date-only UNTIL.");
      rule.until = `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`;
    } else {
      if (!/^\d{8}T(?:[01]\d|2[0-3])[0-5]\d[0-5]\d$/.test(until)) throw new Error("Floating recurrence requires a local date-time UNTIL.");
      const date = `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}`;
      const time = `${until.slice(9, 11)}:${until.slice(11, 13)}`;
      rule.until = time < start.source.slice(11) ? addDays(date, -1) : date;
    }
  }
  return rule;
}
const hash = (value: string) => {
  let first = 2166136261, second = 0x9e3779b9;
  for (const char of value) { first = Math.imul(first ^ char.codePointAt(0)!, 16777619); second = Math.imul(second ^ char.codePointAt(0)!, 2246822519); }
  return `${(first >>> 0).toString(16)}${(second >>> 0).toString(16)}`;
};
export interface CalendarImportRecord {
  sourceIndex: number; uid: string | null; title: string; status: "accepted" | "rejected";
  eventId?: string; issues: string[]; omittedFields: string[];
}
export interface CalendarImportReport {
  schema: "vlak.calendar-import-report"; version: 1; validDocument: boolean;
  total: number | null; accepted: number; rejected: number | null; records: CalendarImportRecord[];
}
export function importICS(text: string, calendarId: string): { events: CalendarEvent[]; warnings: string[]; report: CalendarImportReport } {
  const events: CalendarEvent[] = [], warnings: string[] = [];
  const report: CalendarImportReport = { schema: "vlak.calendar-import-report", version: 1, validDocument: false, total: null, accepted: 0, rejected: null, records: [] };
  let activeRecord: CalendarImportRecord | null = null;
  const warn = (message: string) => { if (warnings.length < 100 && !warnings.includes(message)) warnings.push(message); if (activeRecord && !activeRecord.issues.includes(message)) activeRecord.issues.push(message); };
  if (!identifier(calendarId)) return { events, warnings: ["Choose a valid destination calendar."], report };
  if (typeof text !== "string" || text.length > CALENDAR_LIMITS.bytes || encoder.encode(text).length > CALENDAR_LIMITS.bytes) return { events, warnings: ["Calendar files must be 2 MiB or smaller."], report };
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const components: Property[][] = [], stack: string[] = [];
  const reminders = new Set<number>();
  let current: Property[] | null = null, calendars = 0, version: string | null = null;
  try {
    for (const line of lines) {
      if (!line) continue;
      if (line.length > 262144) throw new Error("A calendar property exceeds the size limit.");
      const item = property(line);
      if (item.name === "BEGIN") {
        const name = item.value.toUpperCase();
        if (!stack.length && name !== "VCALENDAR" || name === "VCALENDAR" && stack.length) throw new Error("Expected a VCALENDAR document.");
        if (name === "VCALENDAR") calendars++;
        if (name === "VEVENT") {
          if (stack.at(-1) !== "VCALENDAR" || current) throw new Error("Invalid event nesting.");
          if (components.length >= CALENDAR_LIMITS.events) throw new Error("Calendar import supports up to 2,000 events.");
          current = []; components.push(current);
        }
        if (name === "VALARM") { warn("Event reminders are not imported."); if (current) reminders.add(components.length - 1); }
        stack.push(name);
      } else if (item.name === "END") {
        if (stack.pop() !== item.value.toUpperCase()) throw new Error("Calendar components are not balanced.");
        if (item.value.toUpperCase() === "VEVENT") current = null;
      } else if (stack.at(-1) === "VEVENT" && current) current.push(item);
      else if (stack.at(-1) === "VCALENDAR" && item.name === "VERSION") {
        if (version !== null) throw new Error("Duplicate calendar version.");
        version = item.value;
      }
      else if (!stack.length) throw new Error("Property outside the calendar document.");
    }
    if (stack.length || calendars !== 1) throw new Error("The calendar document is incomplete.");
    if (version !== "2.0") throw new Error("Import requires iCalendar version 2.0.");
  } catch (error) { return { events: [], warnings: [error instanceof Error ? error.message : "Invalid calendar document."], report }; }
  report.validDocument = true; report.total = components.length;
  const uidCounts = new Map<string, number>(), unsafeSeries = new Set<string>();
  for (const component of components) {
    const uid = component.find(item => item.name === "UID")?.value;
    if (uid) uidCounts.set(uid, (uidCounts.get(uid) ?? 0) + 1);
    if (uid && component.some(item => ["RECURRENCE-ID", "RDATE", "EXRULE"].includes(item.name))) unsafeSeries.add(uid);
  }
  const importedIds = new Set<string>();
  for (const [index, component] of components.entries()) {
    const uid = component.find(item => item.name === "UID")?.value;
    const title = unescapeText(component.find(item => item.name === "SUMMARY")?.value ?? "Untitled event").slice(0, 200);
    const label = `Event ${index + 1} (${title.slice(0, 60)})`;
    const retained = new Set(["UID", "SUMMARY", "DTSTART", "DTEND", "DURATION", "DESCRIPTION", "LOCATION", "RRULE", "EXDATE"]);
    activeRecord = { sourceIndex: index + 1, uid: uid ?? null, title, status: "rejected", issues: [], omittedFields: [...new Set(component.filter(item => !retained.has(item.name)).map(item => item.name))] };
    if (reminders.has(index)) activeRecord.omittedFields.push("VALARM");
    report.records.push(activeRecord);
    try {
      if (component.some(item => item.name === "STATUS" && item.value.toUpperCase() === "CANCELLED")) { warn(`${label}: cancelled event skipped.`); continue; }
      if (uid && unsafeSeries.has(uid) || component.some(item => ["RECURRENCE-ID", "RDATE", "EXRULE"].includes(item.name))) throw new Error("Recurrence overrides or additional dates are not supported; the entire series was skipped.");
      if (uid && (uidCounts.get(uid) ?? 0) > 1) throw new Error("Duplicate UID components need reconciliation; they were skipped.");
      const one = (name: string) => {
        const matches = component.filter(item => item.name === name);
        if (matches.length > 1) throw new Error(`Duplicate ${name} property.`);
        return matches[0];
      };
      one("UID"); one("SUMMARY");
      const first = one("DTSTART");
      if (!first) throw new Error("Missing start date.");
      const start = parseTime(first.value, first.parameters), last = one("DTEND"), duration = one("DURATION");
      if (last && duration) throw new Error("Use DTEND or DURATION, not both.");
      let end: string;
      if (last) {
        const parsed = parseTime(last.value, last.parameters);
        if (parsed.allDay !== start.allDay) throw new Error("Start and end have different date types.");
        end = parsed.wall;
      } else if (duration) {
        if (start.zone) throw new Error("Timezone-based DURATION requires an explicit end date.");
        const match = /^P(?:(\d+)W|(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:0+S)?)?)$/.exec(duration.value);
        if (!match?.slice(1).some(Boolean)) throw new Error("Unsupported event duration.");
        const minutes = Number(match[1] ?? 0) * 10080 + Number(match[2] ?? 0) * 1440 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0);
        if (start.allDay && (match[3] || match[4])) throw new Error("All-day duration must use whole days.");
        end = addMinutes(start.wall, minutes);
      } else if (start.allDay) end = dateTime(addDays(start.wall.slice(0, 10), 1), "00:00");
      else throw new Error("Timed events need an explicit end or duration.");
      const decodedUid = uid ? unescapeText(uid) : "";
      let id = identifier(decodedUid) ? decodedUid : `ics-${hash(uid ?? component.map(item => `${item.name}:${item.value}`).join("\n"))}`;
      if (importedIds.has(id)) id = `${id.slice(0, 240)}-${index}`;
      const event: CalendarEvent = { id, calendarId, title, description: unescapeText(one("DESCRIPTION")?.value ?? ""), location: unescapeText(one("LOCATION")?.value ?? ""), start: start.wall, end, allDay: start.allDay };
      const rule = one("RRULE");
      if (rule) event.recurrence = readRule(rule.value, start);
      const exclusions: string[] = [];
      for (const property of component.filter(item => item.name === "EXDATE")) {
        for (const value of property.value.split(",")) {
          const parsed = parseTime(value, property.parameters);
          if (parsed.allDay !== start.allDay || Boolean(start.zone) !== Boolean(parsed.zone)) throw new Error("Exclusions do not use the event's date type and timezone.");
          exclusions.push(parsed.wall);
        }
      }
      if (exclusions.length) event.exclusions = [...new Set(exclusions)];
      const issue = validateEvent(event);
      if (issue) throw new Error(issue);
      events.push(event); importedIds.add(id);
      activeRecord.status = "accepted"; activeRecord.eventId = id;
      if (unescapeText(one("SUMMARY")?.value ?? "").length > 200) warn(`${label}: the title was shortened to 200 characters.`);
      if (!uid || !identifier(decodedUid)) warn(`${label}: a safe local identifier was assigned.`);
      if (start.zone || last?.parameters.has("TZID") || last?.value.endsWith("Z")) warn(`${label}: timezone dates were converted to this device's local time.`);
      if (component.some(item => item.name === "ATTENDEE" || item.name === "ORGANIZER")) warn("Meeting attendees and invitations are not imported.");
    } catch (error) { warn(`${label}: ${error instanceof Error ? error.message : "Unable to import this event."}`); }
  }
  report.accepted = events.length; report.rejected = components.length - events.length;
  return { events, warnings, report };
}
