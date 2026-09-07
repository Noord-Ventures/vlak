import assert from "node:assert/strict";
import { test } from "node:test";
import { PLAN_LIMITS, axisValue, formatNumber, frameCount, initialPlan, parsePlan, previewFrame, reviewPlan, serializePlan } from "../app/interfaces/microscopy/plan.ts";

const read = change => { const plan = initialPlan(); change(plan); return parsePlan(JSON.stringify(plan)); };

test("sample plan counts every included position, plane, time point and step", () => {
  const plan = initialPlan();
  assert.deepEqual(reviewPlan(plan), { issues: [], frames: 120, exposureMs: 3900 });
  plan.positions[0].enabled = false;
  assert.equal(frameCount(plan), 80);
  assert.equal(reviewPlan(plan).exposureMs, 2600);
  plan.steps[1].exposure = 100;
  assert.equal(reviewPlan(plan).exposureMs, 4800);
});

test("negative and zero coordinates, zero exposure and repeated offsets remain known", () => {
  const plan = read(plan => { plan.positions[0].x = 0; plan.positions[0].y = -0.125; plan.steps[0].exposure = 0; plan.z.step = 0; plan.t.step = 0; });
  assert.equal(plan.positions[0].x, 0);
  assert.equal(plan.positions[0].y, -0.125);
  assert.equal(reviewPlan(plan).issues.length, 0);
  assert.equal(axisValue(plan.z, 4), -2);
  assert.equal(reviewPlan(plan).exposureMs, 2700);
});

test("missing values round-trip and block only the relevant ready-for-review fields", () => {
  const plan = read(plan => { plan.positions[0].x = null; plan.steps[0].exposure = null; plan.units.z = null; plan.coordinateFrame = null; });
  assert.deepEqual(parsePlan(serializePlan(plan)), plan);
  assert.equal(reviewPlan(plan).frames, 120);
  assert.equal(reviewPlan(plan).exposureMs, null);
  assert.deepEqual(reviewPlan(plan).issues.map(issue => issue.path), ["coordinateFrame", "units.z", "positions.site-01.x", "steps.capture-01.exposure"]);
  plan.positions[0].enabled = false;
  assert.equal(reviewPlan(plan).issues.some(issue => issue.path === "positions.site-01.x"), false);
});

test("fractional axis offsets and preview coordinate formulas preserve values", () => {
  const plan = initialPlan(); plan.z = { start: -0.2, step: 0.1, count: 4 }; plan.t = { start: 2, step: 0.25, count: 4 };
  plan.steps[1].depth = 0.125; plan.steps[1].time = 0.1;
  const before = JSON.stringify(plan);
  const frame = previewFrame(plan, { position: 1, z: 3, t: 2, step: 1 });
  assert.ok(Math.abs(frame.z - 2.225) < 1e-12);
  assert.equal(frame.time, 2.6);
  assert.equal(frame.x, 0); assert.equal(frame.channel, "Channel A");
  assert.equal(frame.status, "Not acquired");
  assert.equal(JSON.stringify(plan), before);
  assert.equal(Number(formatNumber(axisValue({ start: 0.1, step: 0.1, count: 3 }, 2))), 0.1 + 0.1 * 2);
  assert.equal(formatNumber(0.0001), "0.0001");
  assert.equal(formatNumber(1e-18), "1e-18");
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(null), "Not supplied");
  assert.equal(axisValue(plan.z, -1), null); assert.equal(axisValue(plan.z, 4), null); assert.equal(axisValue(plan.z, 0.5), null);
});

test("a missing stage Z unit cannot be added to known micrometre slice offsets", () => {
  const plan = initialPlan(); const selection = { position: 0, z: 0, t: 0, step: 0 };
  assert.equal(previewFrame(plan, selection).z, -2);
  plan.units.z = null;
  assert.equal(previewFrame(plan, selection).z, null);
  plan.units.z = "µm"; plan.z.start = 0;
  assert.equal(previewFrame(plan, selection).z, 0);
  assert.equal(previewFrame(plan, { ...selection, z: null }).z, null);
  assert.equal(previewFrame(plan, { ...selection, step: null }).z, null);
  assert.equal(previewFrame(plan, { ...selection, position: null }).position, undefined);
  assert.equal(previewFrame(plan, { ...selection, t: null }).time, null);
});

test("schema is strict and reconstructs records without runtime or acquisition claims", () => {
  assert.throws(() => parsePlan("{"), /not valid JSON/);
  assert.throws(() => parsePlan("[]"), /expected an object/);
  assert.throws(() => read(plan => { plan.version = 2; }), /version 1/);
  assert.throws(() => read(plan => { plan.schema = "other"; }), /schema/);
  for (const key of ["acquired", "url", "__proto__", "constructor"]) {
    const source = serializePlan(initialPlan()).replace('"version": 1,', `"version": 1, "${key}": true,`);
    assert.throws(() => parsePlan(source), /unsupported field/);
  }
  assert.throws(() => read(plan => { plan.positions[0].pending = true; }), /unsupported field/);
  assert.throws(() => read(plan => { plan.steps[0].status = "Completed"; }), /unsupported field/);
  assert.throws(() => read(plan => { delete plan.positions[0].x; }), /field is required/);
  assert.throws(() => read(plan => { plan.positions[0].enabled = 1; }), /true or false/);
  assert.throws(() => read(plan => { plan.positions[0].x = "0"; }), /finite number/);
});

test("identifiers are bounded, unique and every step references a supplied channel", () => {
  assert.throws(() => read(plan => { plan.positions[1].id = plan.positions[0].id; }), /unique/);
  assert.throws(() => read(plan => { plan.channels[1].id = plan.channels[0].id; }), /unique/);
  assert.throws(() => read(plan => { plan.steps[1].id = plan.steps[0].id; }), /unique/);
  assert.throws(() => read(plan => { plan.positions[0].id = " "; }), /nonblank/);
  assert.throws(() => read(plan => { plan.positions[0].id = "a".repeat(65); }), /64/);
  assert.throws(() => read(plan => { plan.positions[0].name = "a".repeat(97); }), /96/);
  assert.throws(() => read(plan => { plan.steps[0].channel = "missing"; }), /does not exist/);
  assert.equal(read(plan => { plan.positions[1].name = plan.positions[0].name; }).positions.length, 3, "stable visible IDs distinguish repeated names");
});

test("numeric format limits reject nonfinite, overlarge, invalid count and negative time values", () => {
  assert.throws(() => parsePlan(serializePlan(initialPlan()).replace('"x": -240', '"x": 1e309')), /finite number/);
  assert.throws(() => read(plan => { plan.positions[0].x = PLAN_LIMITS.magnitude + 1; }), /finite number/);
  assert.throws(() => read(plan => { plan.steps[0].exposure = -1; }), /finite number/);
  assert.throws(() => read(plan => { plan.t.step = -1; }), /finite number/);
  assert.throws(() => read(plan => { plan.units.x = "mm"; }), /does not convert/);
  for (const count of [0, -1, 1.5, 65]) assert.throws(() => read(plan => { plan.z.count = count; }), /count/);
  for (const count of [0, -1, 1.5, 65, null]) {
    const plan = initialPlan(); plan.z.count = count;
    assert.equal(frameCount(plan), null);
    assert.ok(reviewPlan(plan).issues.some(issue => issue.path === "z.count"));
    assert.equal(reviewPlan(plan).exposureMs, null);
  }
  const bad = initialPlan(); bad.positions[0].x = Number.NaN;
  assert.throws(() => serializePlan(bad), /Nonfinite/);
});

test("collection and projected frame caps prevent unbounded stack expansion", () => {
  assert.throws(() => read(plan => { plan.positions = Array.from({ length: 129 }, (_, i) => ({ ...plan.positions[0], id: `p-${i}` })); }), /128/);
  assert.throws(() => read(plan => { plan.channels = Array.from({ length: 17 }, (_, i) => ({ id: `c-${i}`, label: "Channel" })); }), /16/);
  assert.throws(() => read(plan => { plan.steps = Array.from({ length: 17 }, (_, i) => ({ ...plan.steps[0], id: `s-${i}` })); }), /16/);
  assert.throws(() => read(plan => { plan.z.count = 64; plan.t.count = 64; }), /16384/);
  const atLimit = read(plan => { plan.positions = plan.positions.slice(0, 2); plan.z.count = 64; plan.t.count = 64; });
  assert.equal(frameCount(atLimit), 16384);
  assert.equal(reviewPlan(atLimit).issues.length, 0);
});

test("byte limit uses encoded bytes and validation failures leave the original working object unchanged", () => {
  assert.throws(() => parsePlan(" ".repeat(PLAN_LIMITS.bytes + 1)), /256 KiB/);
  assert.throws(() => parsePlan("µ".repeat(PLAN_LIMITS.bytes / 2 + 1)), /256 KiB/);
  const working = initialPlan(); const snapshot = JSON.stringify(working);
  assert.throws(() => parsePlan('{"schema":"bad"}'));
  assert.equal(JSON.stringify(working), snapshot);
  const imported = parsePlan(serializePlan(working)); imported.positions[0].x = 999;
  assert.equal(working.positions[0].x, -240);
});

test("empty drafts are structurally valid and never become fabricated acquired frames", () => {
  const plan = read(plan => { plan.positions = []; plan.channels = []; plan.steps = []; plan.z.count = null; plan.t.count = null; });
  const review = reviewPlan(plan);
  assert.equal(review.frames, null);
  assert.equal(review.exposureMs, null);
  assert.ok(review.issues.some(issue => issue.path === "positions"));
  assert.ok(review.issues.some(issue => issue.path === "steps"));
  const frame = previewFrame(plan, { position: 0, z: 0, t: 0, step: 0 });
  assert.equal(frame.z, null); assert.equal(frame.time, null); assert.equal(frame.status, "Not acquired");
});
