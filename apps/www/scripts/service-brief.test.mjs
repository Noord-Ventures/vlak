import assert from "node:assert/strict";
import { test } from "node:test";
import { BRIEF_FORMAT, BRIEF_KEYS, BRIEF_LIMITS, parseBrief } from "../app/services/brief.ts";

const brief = Object.fromEntries(BRIEF_KEYS.map(key => [key, `${key} detail`]));

test("brief parser round-trips direct and legacy versioned payloads", () => {
  assert.deepEqual(parseBrief(brief), brief);
  assert.deepEqual(parseBrief({ format: BRIEF_FORMAT, data: brief }), brief);
});

test("brief parser rejects malformed, unknown, future, and oversized fields", () => {
  assert.throws(() => parseBrief({ ...brief, extra: "no" }), /unsupported field/);
  assert.throws(() => parseBrief({ ...brief, namedProblem: 4 }), /expected text/);
  assert.throws(() => parseBrief({ ...brief, namedProblem: "x".repeat(BRIEF_LIMITS.string + 1) }), /exceeds/);
  assert.throws(() => parseBrief({ format: "vlak-modernization-brief-v2", data: brief }), /Expected format/);
  assert.throws(() => parseBrief({ format: BRIEF_FORMAT, data: { ...brief, extra: "no" } }), /unsupported field/);
  assert.throws(() => parseBrief({ ...brief, namedProblem: "x".repeat(BRIEF_LIMITS.bytes) }), /256 KiB/);
});

test("failed parsing does not mutate the supplied brief", () => {
  const source = { ...brief };
  assert.throws(() => parseBrief({ ...source, owner: null }));
  assert.deepEqual(source, brief);
});
