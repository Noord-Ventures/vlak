import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { CALENDAR_LIMITS, addDays, addMinutes, addMonths, dateTime, dayOfWeek, expandEvents, exportICS, importICS, isDate, isWallTime, localDate, makeInitialStore, parseStore, shiftEvent, startOfWeek, validateEvent } from "../app/interfaces/calendar/model.ts";

const event = (patch = {}) => ({ id: "e-1", calendarId: "work", title: "Design review", description: "", location: "", start: "2026-01-31T09:00", end: "2026-01-31T10:00", allDay: false, ...patch });
const starts = (source, from, to) => expandEvents([source], from, to).map(item => item.start);
const ics = (...properties) => ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "UID:test@example.com", "SUMMARY:A meeting", ...properties, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
const basic = ["DTSTART:20260908T090000", "DTEND:20260908T100000"];

test("civil date helpers reject normalization, invalid bounds and invalid times", () => {
  for (const invalid of ["2025-02-29", "2026-04-31", "2026-00-01", "2026-1-01", "1899-12-31", "2201-01-01", "2026-09-08T09:00", "", null]) assert.equal(isDate(invalid), false);
  assert.ok(isDate("2000-02-29")); assert.ok(!isDate("1900-02-29"));
  for (const invalid of ["2026-01-01T24:00", "2026-01-01T09:60", "2026-01-01T09:00Z", "2026-02-30T09:00"]) assert.equal(isWallTime(invalid), false);
  assert.equal(dateTime("2026-09-08"), "2026-09-08T09:00");
  assert.throws(() => addDays("2026-02-30", 1), RangeError);
  assert.throws(() => addDays("2200-12-31", 1), RangeError);
  assert.throws(() => addDays("1900-01-01", -1), RangeError);
  assert.throws(() => addDays("2026-01-01", 0.5), RangeError);
  assert.throws(() => addMinutes("2026-01-01T09:00", Infinity), RangeError);
  assert.throws(() => localDate(new Date("invalid")), RangeError);
});

test("date navigation clamps month ends, crosses years and respects the chosen week start", () => {
  assert.equal(addDays("2024-02-28", 2), "2024-03-01");
  assert.equal(addDays("1900-01-01", 1), "1900-01-02");
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2025-01-31", 1), "2025-02-28");
  assert.equal(addMonths("2026-03-31", -1), "2026-02-28");
  assert.equal(addMonths("2026-12-31", 2), "2027-02-28");
  assert.equal(startOfWeek("2026-09-06", 1), "2026-08-31");
  assert.equal(startOfWeek("2026-09-06", 0), "2026-09-06");
  assert.equal(dayOfWeek("2026-09-08"), 2);
  assert.equal(addMinutes("2026-12-31T23:30", 60), "2027-01-01T00:30");
});

test("initial store uses the supplied day and reconstructs valid Work and Personal records", () => {
  const store = makeInitialStore("2026-09-08");
  assert.deepEqual(store.calendars.map(item => item.name), ["Work", "Personal"]);
  assert.ok(store.events.some(item => item.start.startsWith("2026-09-08")));
  assert.ok(store.events.some(item => item.allDay));
  assert.ok(store.events.every(item => validateEvent(item) === null));
  assert.deepEqual(parseStore(JSON.stringify(store)), store);
  for (const date of ["1900-01-01", "2200-12-31"]) assert.ok(makeInitialStore(date).events.every(item => validateEvent(item) === null));
});

test("event validation permits overlaps and overnight spans but rejects malformed schedules", () => {
  assert.equal(validateEvent(event()), null);
  assert.equal(validateEvent(event({ end: "2026-02-02T10:00" })), null);
  for (const patch of [{ title: " " }, { id: "x\nBEGIN:VEVENT" }, { end: "2026-01-31T09:00" }, { end: "2026-01-30T10:00" }, { allDay: true }, { description: "a".repeat(10001) }, { allDay: "true" }, { recurrence: { frequency: "daily", interval: 0 } }, { recurrence: { frequency: "monthly", interval: 1, weekdays: [1] } }, { recurrence: { frequency: "daily", interval: 1, count: 1, until: "2026-12-31" } }, { recurrence: { frequency: "daily", interval: 1, count: 1.2 } }, { recurrence: { frequency: "weekly", interval: 1, weekdays: [1] } }, { recurrence: { frequency: "weekly", interval: 1, weekdays: [6, 6] } }, { exclusions: ["2026-01-31T09:00", "2026-01-31T09:00"] }]) assert.ok(validateEvent(event(patch)), JSON.stringify(patch));
  assert.equal(validateEvent(null), "Event must be an object.");
  const store = makeInitialStore("2026-09-08"); store.events = [event(), event({ id: "overlap" })];
  assert.ok(parseStore(JSON.stringify(store)));
});

test("stored calendars are bounded, unique, structurally validated and copied without unknown fields", () => {
  const read = change => { const store = makeInitialStore("2026-09-08"); change(store); return parseStore(JSON.stringify(store)); };
  for (const raw of ["{", "null", "[]", "{}", " ".repeat(CALENDAR_LIMITS.bytes + 1)]) assert.equal(parseStore(raw), null);
  for (const change of [s => { s.version = 2; }, s => { s.events[0] = null; }, s => { s.calendars = []; }, s => { s.calendars[1].id = s.calendars[0].id; }, s => { s.events[1].id = s.events[0].id; }, s => { s.events[0].calendarId = "missing"; }, s => { s.weekStartsOn = 2; }, s => { s.view = "year"; }, s => { s.events[0].recurrence = { frequency: "daily", interval: 1, BYHOUR: 9 }; }, s => { s.events = Array.from({ length: 2001 }, (_, i) => event({ id: `e${i}` })); }]) assert.equal(read(change), null);
  assert.equal(read(s => { s.unknown = "界".repeat(700000); }), null, "Byte cap counts UTF-8, not UTF-16 units");
  const source = JSON.stringify(makeInitialStore("2026-09-08")).replace('"version":1', '"version":1,"__proto__":{"polluted":true}');
  const clean = parseStore(source);
  assert.ok(clean); assert.equal(Object.hasOwn(clean, "__proto__"), false); assert.equal({}.polluted, undefined);
  clean.events[0].recurrence.interval = 3;
  assert.equal(parseStore(source).events[0].recurrence.interval, 1, "Parsing does not share mutable records");
});

test("daily intervals count original instances before exclusions and UNTIL includes its date", () => {
  const source = event({ start: "2026-03-01T09:00", end: "2026-03-01T10:00", recurrence: { frequency: "daily", interval: 2, count: 4 }, exclusions: ["2026-03-03T09:00"] });
  assert.deepEqual(starts(source, "2026-03-01", "2026-04-01"), ["2026-03-01T09:00", "2026-03-05T09:00", "2026-03-07T09:00"]);
  assert.deepEqual(starts(source, "2026-03-05", "2026-03-08"), ["2026-03-05T09:00", "2026-03-07T09:00"]);
  source.recurrence = { frequency: "daily", interval: 2, until: "2026-03-07" };
  assert.deepEqual(starts(source, "2026-03-01", "2026-04-01"), ["2026-03-01T09:00", "2026-03-05T09:00", "2026-03-07T09:00"]);
});

test("weekly rules anchor on Monday, sort weekdays and include DTSTART exactly once", () => {
  const source = event({ start: "2026-09-09T09:00", end: "2026-09-09T10:00", recurrence: { frequency: "weekly", interval: 2, weekdays: [0, 3, 1], count: 6 }, exclusions: ["2026-09-13T09:00"] });
  assert.deepEqual(starts(source, "2026-09-01", "2026-11-01"), ["2026-09-09T09:00", "2026-09-21T09:00", "2026-09-23T09:00", "2026-09-27T09:00", "2026-10-05T09:00"]);
  assert.deepEqual(starts(source, "2026-09-22", "2026-11-01"), ["2026-09-23T09:00", "2026-09-27T09:00", "2026-10-05T09:00"]);
  const defaultDay = { ...source, recurrence: { frequency: "weekly", interval: 1, count: 2 } };
  assert.deepEqual(starts(defaultDay, "2026-09-01", "2026-10-01"), ["2026-09-09T09:00", "2026-09-16T09:00"]);
});

test("monthly recurrence skips missing month dates without consuming COUNT or drifting", () => {
  const source = event({ recurrence: { frequency: "monthly", interval: 1, count: 4 } });
  assert.deepEqual(starts(source, "2026-01-01", "2027-01-01"), ["2026-01-31T09:00", "2026-03-31T09:00", "2026-05-31T09:00", "2026-07-31T09:00"]);
  assert.deepEqual(starts(source, "2026-04-01", "2027-01-01"), ["2026-05-31T09:00", "2026-07-31T09:00"]);
  assert.deepEqual(starts(event({ recurrence: { frequency: "monthly", interval: 2, count: 3 } }), "2026-01-01", "2027-01-01"), ["2026-01-31T09:00", "2026-03-31T09:00", "2026-05-31T09:00"]);
});

test("yearly leap-day recurrence skips non-leap and century years", () => {
  const source = event({ start: "2096-02-29T09:00", end: "2096-02-29T10:00", recurrence: { frequency: "yearly", interval: 1, count: 3 } });
  assert.deepEqual(starts(source, "2096-01-01", "2110-01-01"), ["2096-02-29T09:00", "2104-02-29T09:00", "2108-02-29T09:00"]);
});

test("weekly and monthly clock arithmetic also works before the Unix epoch", () => {
  const source = event({ start: "1900-01-01T09:00", end: "1900-01-01T10:00", recurrence: { frequency: "weekly", interval: 1, count: 2 } });
  assert.deepEqual(starts(source, "1900-01-01", "1900-02-01"), ["1900-01-01T09:00", "1900-01-08T09:00"]);
  source.recurrence.frequency = "monthly";
  assert.deepEqual(starts(source, "1900-01-01", "1900-03-01"), ["1900-01-01T09:00", "1900-02-01T09:00"]);
});

test("range queries include overlapping and all-day spans, with exclusive ends", () => {
  const overnight = event({ start: "2026-09-07T23:00", end: "2026-09-08T01:00" });
  assert.equal(expandEvents([overnight], "2026-09-08", "2026-09-09").length, 1);
  assert.equal(expandEvents([{ ...overnight, end: "2026-09-08T00:00" }], "2026-09-08", "2026-09-09").length, 0);
  const allDay = event({ start: "2026-09-07T00:00", end: "2026-09-10T00:00", allDay: true });
  assert.equal(expandEvents([allDay], "2026-09-09", "2026-09-10").length, 1);
  assert.equal(expandEvents([allDay], "2026-09-10", "2026-09-11").length, 0);
  assert.equal(expandEvents([allDay], "2026-09-09", "2026-09-09").length, 0);
  const recurring = { ...overnight, recurrence: { frequency: "daily", interval: 1, count: 2 } };
  assert.deepEqual(starts(recurring, "2026-09-08", "2026-09-09"), ["2026-09-07T23:00", "2026-09-08T23:00"]);
});

test("bounded expansion merges the earliest 10,000 occurrences across input order", () => {
  const late = event({ id: "late", start: "1900-01-01T11:00", end: "1900-01-01T12:00", recurrence: { frequency: "daily", interval: 1 } });
  const early = event({ id: "early", start: "1900-01-01T09:00", end: "1900-01-01T10:00", recurrence: { frequency: "daily", interval: 1 } });
  const output = expandEvents([late, early], "1900-01-01", "2200-12-31");
  assert.equal(output.length, 10000);
  assert.equal(output[0].eventId, "early"); assert.equal(output[1].eventId, "late");
  assert.equal(output.filter(item => item.eventId === "early").length, 5000);
  assert.equal(output.at(-1).start, `${addDays("1900-01-01", 4999)}T11:00`);
  assert.equal(new Set(output.map(item => item.key)).size, 10000);
});

test("shifting an event preserves wall duration and moves recurrence dates without mutation", () => {
  const source = event({ start: "2026-03-28T23:00", end: "2026-03-29T03:00", recurrence: { frequency: "weekly", interval: 1, weekdays: [6], until: "2026-04-30" }, exclusions: ["2026-04-04T23:00"] });
  const snapshot = JSON.stringify(source);
  const moved = shiftEvent(source, "2026-03-30T22:00");
  assert.equal(moved.end, "2026-03-31T02:00");
  assert.deepEqual(moved.recurrence.weekdays, [1]); assert.equal(moved.recurrence.until, "2026-05-02");
  assert.deepEqual(moved.exclusions, ["2026-04-06T22:00"]);
  assert.equal(JSON.stringify(source), snapshot);
  assert.throws(() => shiftEvent(event({ allDay: true, start: "2026-01-31T00:00", end: "2026-02-01T00:00" }), "2026-02-01T09:00"));
  assert.equal(shiftEvent(event({ title: "" }), "2026-02-01T14:00").end, "2026-02-01T15:00", "An unfinished editor title does not block duration following its start");
});

test("local recurrence and shifting preserve clock times across spring and autumn DST in several zones", () => {
  const modelURL = new URL("../app/interfaces/calendar/model.ts", import.meta.url).href;
  for (const zone of ["Europe/Amsterdam", "America/New_York", "Australia/Lord_Howe"]) {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `import {expandEvents,shiftEvent,addDays} from ${JSON.stringify(modelURL)}; const e=${JSON.stringify(event({ start: "2026-03-01T09:00", end: "2026-03-01T10:00", recurrence: { frequency: "daily", interval: 1 } }))}; console.log(JSON.stringify({times:expandEvents([e],'2026-03-01','2026-11-10').map(x=>[x.start.slice(11),x.end.slice(11)]),end:shiftEvent(e,'2026-11-01T09:00').end,next:addDays('2026-03-29',1)}));`], { env: { ...process.env, TZ: zone }, encoding: "utf8" });
    const value = JSON.parse(output); assert.ok(value.times.every(([start, end]) => start === "09:00" && end === "10:00"), zone); assert.equal(value.end, "2026-11-01T10:00"); assert.equal(value.next, "2026-03-30");
  }
});

test("ICS round-trips escaped Unicode text, floating recurrence and exclusive all-day exclusions", () => {
  const timed = event({ title: "Review, notes; \\ sketches 🖊", description: "First line\nSecond line; comma, and \\ literal n", location: "Studio, floor 2", recurrence: { frequency: "monthly", interval: 1, until: "2026-12-31" }, exclusions: ["2026-03-31T09:00"] });
  const allDay = event({ id: "day", start: "2026-09-08T00:00", end: "2026-09-10T00:00", allDay: true, recurrence: { frequency: "weekly", interval: 1, weekdays: [2, 4], count: 8 }, exclusions: ["2026-09-10T00:00"] });
  const output = exportICS([timed, allDay]);
  assert.ok(output.includes("DTEND;VALUE=DATE:20260910\r\n"));
  assert.ok(output.includes("UNTIL=20261231T235959"));
  const imported = importICS(output, "work");
  assert.deepEqual(imported.warnings, []); assert.deepEqual(imported.events, [timed, allDay]);
  assert.deepEqual(expandEvents(imported.events, "2026-01-01", "2027-01-01").map(item => [item.key, item.start, item.end]), expandEvents([timed, allDay], "2026-01-01", "2027-01-01").map(item => [item.key, item.start, item.end]));
});

test("ICS folds at75 UTF-8 bytes without splitting Unicode and unfolds continuations", () => {
  const source = event({ title: "日本語🖊".repeat(25), description: "界".repeat(600) });
  const output = exportICS([source]);
  for (const line of output.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  assert.ok(output.includes("\r\n "));
  assert.deepEqual(importICS(output, "work").events, [source]);
  const input = ics(...basic, "DESCRIPTION:First\r\n\t second");
  assert.equal(importICS(input, "work").events[0].description, "First second");
});

test("ICS accepts date-only defaults, positive durations and multiple EXDATE properties", () => {
  const allDay = importICS(ics("DTSTART;VALUE=DATE:20260228"), "work");
  assert.equal(allDay.events[0].end, "2026-03-01T00:00");
  const timed = importICS(ics("DTSTART:20260908T230000", "DURATION:PT2H30M", "RRULE:FREQ=DAILY;COUNT=4", "EXDATE:20260909T230000", "EXDATE:20260910T230000"), "work");
  assert.equal(timed.events[0].end, "2026-09-09T01:30");
  assert.deepEqual(starts(timed.events[0], "2026-09-08", "2026-09-15"), ["2026-09-08T23:00", "2026-09-11T23:00"]);
  assert.equal(importICS(ics("DTSTART;VALUE=DATE:20260908", "DURATION:P2D"), "work").events[0].end, "2026-09-10T00:00");
});

test("ICS UNTIL date-time honors its time and count still precedes exclusions", () => {
  const before = importICS(ics(...basic, "RRULE:FREQ=DAILY;UNTIL=20260910T085959"), "work");
  assert.deepEqual(starts(before.events[0], "2026-09-08", "2026-09-15"), ["2026-09-08T09:00", "2026-09-09T09:00"]);
  const exact = importICS(ics(...basic, "RRULE:FREQ=DAILY;UNTIL=20260910T090000"), "work");
  assert.equal(starts(exact.events[0], "2026-09-08", "2026-09-15").length, 3);
});

test("ICS converts UTC and IANA TZID one-offs to the device timezone explicitly", () => {
  const modelURL = new URL("../app/interfaces/calendar/model.ts", import.meta.url).href;
  const inputs = [ics("DTSTART:20260701T140000Z", "DTEND:20260701T150000Z"), ics('DTSTART;TZID="America/New_York":20260701T100000', 'DTEND;TZID="America/New_York":20260701T110000')];
  for (const zone of ["UTC", "Europe/Amsterdam"]) {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `import {importICS} from ${JSON.stringify(modelURL)};console.log(JSON.stringify(${JSON.stringify(inputs)}.map(text=>importICS(text,'work'))));`], { env: { ...process.env, TZ: zone }, encoding: "utf8" });
    for (const result of JSON.parse(output)) { assert.equal(result.events[0].start, zone === "UTC" ? "2026-07-01T14:00" : "2026-07-01T16:00"); assert.match(result.warnings.join(" "), /converted/); }
  }
});

test("ambiguous TZID clocks choose their first occurrence, including half-hour DST", () => {
  const modelURL = new URL("../app/interfaces/calendar/model.ts", import.meta.url).href;
  const inputs = [
    ics("DTSTART;TZID=America/New_York:20261101T013000", "DTEND;TZID=America/New_York:20261101T023000"),
    ics("DTSTART;TZID=Australia/Lord_Howe:20260405T014500", "DTEND;TZID=Australia/Lord_Howe:20260405T024500"),
  ];
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `import {importICS} from ${JSON.stringify(modelURL)};console.log(JSON.stringify(${JSON.stringify(inputs)}.map(text=>importICS(text,'work'))));`], { env: { ...process.env, TZ: "UTC" }, encoding: "utf8" });
  const results = JSON.parse(output);
  assert.equal(results[0].events[0].start, "2026-11-01T05:30");
  assert.equal(results[1].events[0].start, "2026-04-04T14:45");
});

test("ICS rejects unsupported recurrence and timezone semantics instead of silently changing events", () => {
  const unsupported = [
    [...basic, "RRULE:FREQ=MONTHLY;BYDAY=1MO"], [...basic, "RRULE:FREQ=YEARLY;BYMONTH=9"], [...basic, "RRULE:FREQ=DAILY;BYHOUR=9,10"], [...basic, "RRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU"], [...basic, "RRULE:FREQ=HOURLY"], [...basic, "RRULE:FREQ=DAILY;COUNT=3;UNTIL=20261001T090000"], [...basic, "RDATE:20260909T090000"], [...basic, "RECURRENCE-ID:20260908T090000"],
    ["DTSTART:20260908T090000Z", "DTEND:20260908T100000Z", "RRULE:FREQ=DAILY"], ["DTSTART;TZID=Europe/Amsterdam:20260908T090000", "DTEND;TZID=Europe/Amsterdam:20260908T100000", "RRULE:FREQ=DAILY"], ["DTSTART;TZID=Mars/Olympus:20260908T090000", "DTEND;TZID=Mars/Olympus:20260908T100000"], ["DTSTART;TZID=America/New_York:20260308T023000", "DTEND;TZID=America/New_York:20260308T033000"],
  ];
  for (const properties of unsupported) { const result = importICS(ics(...properties), "work"); assert.equal(result.events.length, 0, properties.join("\n")); assert.ok(result.warnings.length, properties.join("\n")); }
});

test("unsupported detached instances prevent importing an unmodified master series", () => {
  const input = ics(...basic, "RRULE:FREQ=DAILY;COUNT=3").replace("END:VCALENDAR", ["BEGIN:VEVENT", "UID:test@example.com", "RECURRENCE-ID:20260909T090000", "DTSTART:20260909T110000", "DTEND:20260909T120000", "END:VEVENT", "END:VCALENDAR"].join("\r\n"));
  const result = importICS(input, "work"); assert.equal(result.events.length, 0); assert.match(result.warnings.join(" "), /entire series/);
});

test("ICS handles untrusted identifiers, duplicate UIDs, nested alarms and text without executing content", () => {
  const input = ics(...basic, "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "TRIGGER:-PT15M", "END:VALARM").replace("UID:test@example.com", "UID:unsafe uid;\\,text");
  const result = importICS(input, "work"); assert.equal(result.events.length, 1); assert.match(result.events[0].id, /^ics-/); assert.match(result.warnings.join(" "), /safe local identifier/); assert.match(result.warnings.join(" "), /reminders/);
  assert.deepEqual(importICS(exportICS(result.events), "work").events, result.events);
  const duplicate = ics(...basic).replace("END:VCALENDAR", ["BEGIN:VEVENT", "UID:test@example.com", ...basic, "END:VEVENT", "END:VCALENDAR"].join("\r\n"));
  assert.equal(importICS(duplicate, "work").events.length, 0);
  const text = importICS(ics(...basic, "DESCRIPTION:<script>alert(1)</script>\\nhttps://example.test/"), "work");
  assert.equal(text.events[0].description, "<script>alert(1)</script>\nhttps://example.test/");
});

test("ICS rejects malformed, huge, cancelled, sub-minute and missing-duration input without throwing", () => {
  for (const input of ["", "BEGIN:VEVENT\nEND:VEVENT", "BEGIN:VCALENDAR", ics(...basic).replace("VERSION:2.0", "VERSION:1.0"), ics(...basic).replace("END:VEVENT", "END:VALARM"), ics("DTSTART:20260908T090030", "DTEND:20260908T100000"), ics("DTSTART:20260908T090000"), ics(...basic, "DURATION:PT1H"), "x".repeat(CALENDAR_LIMITS.bytes + 1)]) { const result = importICS(input, "work"); assert.equal(result.events.length, 0); assert.ok(result.warnings.length); }
  const cancelled = importICS(ics(...basic, "STATUS:CANCELLED"), "work"); assert.equal(cancelled.events.length, 0); assert.match(cancelled.warnings.join(" "), /cancelled/);
  assert.throws(() => exportICS([event({ title: "" })]));
  assert.throws(() => exportICS([event(), event()]));
  assert.equal(importICS(ics(...basic), "bad\ncalendar").events.length, 0);
});
