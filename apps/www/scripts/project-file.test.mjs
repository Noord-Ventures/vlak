import test from "node:test";
import assert from "node:assert/strict";
import { createProject, readProject, readRecovery, serializeProject, projectFilename } from "../lib/project-file.ts";
const parse = value => {
  if (!value || typeof value !== "object" || Object.keys(value).join() !== "text" || typeof value.text !== "string") throw new Error("Invalid document");
  return { text: value.text };
};
test("project file preserves identity and data while reconstructing a validated payload", () => {
  const original = createProject("test", "Notes", { text: "Keep this" });
  const read = readProject(serializeProject(original), "test", parse);
  assert.deepEqual(read, original); assert.notEqual(read.payload, original.payload);
});
test("legacy data requires the domain validator and gets a new identity", () => {
  const result = readProject('{"text":"Legacy"}', "test", parse);
  assert.equal(result.payload.text, "Legacy"); assert.equal(result.schema, "vlak.project");
  assert.throws(() => readProject('{"other":"Legacy"}', "test", parse), /Invalid document/);
});
test("rejects wrong kinds, future versions, invalid headers and unrecognized keys", () => {
  const project = createProject("test", "Notes", { text: "Original" });
  for (const edit of [{ kind: "different" }, { envelopeVersion: 2 }, { documentVersion: 2 }, { revision: "" }, { createdAt: "yesterday" }, { runtime: true }]) {
    assert.throws(() => readProject(JSON.stringify({ ...project, ...edit }), "test", parse));
  }
  assert.equal(project.payload.text, "Original");
});
test("blocks nonfinite runtime values and oversized documents", () => {
  assert.throws(() => serializeProject(createProject("test", "Bad", { number: Infinity })), /invalid number/);
  assert.throws(() => serializeProject(createProject("test", "Bad", { kept: "yes", lost: undefined })), /would be lost/);
  assert.throws(() => serializeProject(createProject("test", "Large", { text: "x".repeat(8 * 1024 * 1024) })), /8 MiB/);
  assert.throws(() => readProject("{broken", "test", parse), /valid JSON/);
});
test("download names cannot contain path segments", () => {
  assert.equal(projectFilename("../../A / B", "json"), "A-B.json");
  assert.equal(projectFilename("Notes", "../../bad/json"), "Notes.bad-json");
});
test("recovery salvages valid entries and reports invalid entries", () => {
  const valid = createProject("test", "Valid", { text: "Keep this" });
  const wrong = createProject("other", "Wrong kind", { text: "Do not open" });
  const recovery = JSON.stringify({ schema: "vlak.project-recovery", version: 1, projects: [valid, { broken: true }, wrong] });
  const result = readRecovery(recovery, "test", parse);
  assert.deepEqual(result.projects, [valid]);
  assert.equal(result.issues.length, 2);
  assert.match(result.issues[0], /Entry 2/);
  assert.match(result.issues[1], /Entry 3/);
  assert.throws(() => readRecovery("{bad", "test", parse), /current work is unchanged/);
});
