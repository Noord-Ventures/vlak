import { parseCalendarProject } from "../app/interfaces/calendar/project.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeInitialStore, parseStore } from "../app/interfaces/calendar/model.ts";
import { initialPlan, parsePlan, reviewPlan, serializePlan } from "../app/interfaces/microscopy/plan.ts";

const calendarProjectParse = value => {
  const parsed = parseStore(JSON.stringify(value));
  if (!parsed) throw new Error("Invalid calendar project");
  return parsed;
};
const microscopyProjectParse = value => parsePlan(JSON.stringify(value));

test("project parsers accept valid payloads and reject malformed or future versions", () => {
  const calendar = makeInitialStore("2026-09-11");
  assert.deepEqual(calendarProjectParse(calendar), calendar);
  assert.throws(() => calendarProjectParse({ ...calendar, version: 2 }), /Invalid calendar project/);
  const plan = initialPlan();
  assert.deepEqual(microscopyProjectParse(plan), plan);
  assert.throws(() => microscopyProjectParse({ ...plan, version: 2 }), /version 1/);
  assert.throws(() => microscopyProjectParse({ ...plan, units: { ...plan.units, x: "mm" } }), /does not convert/);
});

test("failed project parsing leaves the working values unchanged", () => {
  const calendar = makeInitialStore("2026-09-11");
  const calendarBefore = JSON.stringify(calendar);
  assert.throws(() => calendarProjectParse({ ...calendar, events: [{ bad: true }] }));
  assert.equal(JSON.stringify(calendar), calendarBefore);
  const plan = initialPlan();
  const before = JSON.stringify(plan);
  assert.throws(() => microscopyProjectParse({ ...plan, positions: [{ ...plan.positions[0], x: "bad" }] }));
  assert.equal(JSON.stringify(plan), before);
  assert.equal(reviewPlan(parsePlan(serializePlan(plan))).frames, 120);
});

test("calendar project import refuses data that its storage parser would silently drop", () => {
  const value = { version: 1, calendars: [{ id: "work", name: "Work", visible: true }], events: [], view: "month", weekStartsOn: 1 };
  assert.deepEqual(parseCalendarProject(value), value);
  assert.throws(() => parseCalendarProject({ ...value, attachments: ["keep me"] }), /unsupported fields/);
  assert.throws(() => parseCalendarProject({ ...value, calendars: [{ ...value.calendars[0], account: "external" }] }), /unsupported fields/);
  assert.equal(value.calendars[0].name, "Work");
});
