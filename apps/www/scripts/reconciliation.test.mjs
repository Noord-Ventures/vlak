import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareTables,
  columnPairs,
  exportComparison,
  exportRecipe,
  makeRecipe,
  neutralizeFormula,
  parseCsv,
  parseReconciliationProject,
  readRecipe,
  reconcileDecisions,
  serializeCsv,
  sha256,
  shouldAcceptJob,
} from "../app/interfaces/reconciliation/model.ts";
import { runWorkerJob } from "../app/interfaces/reconciliation/worker.ts";

async function source(name, text) {
  return { name, text, size: new TextEncoder().encode(text).byteLength, hash: await sha256(text), table: parseCsv(text) };
}

test("CSV parser round-trips commas, newlines, quotes, BOM, empty cells and leading zeros", () => {
  const text = '\ufeffid,name,note,empty\r\n001,"Doe, Ana","line one\nline ""two""",\r\n002,Bob,plain,""\r\n';
  const table = parseCsv(text);
  assert.equal(table.headers[0].sourceName, "id");
  assert.deepEqual(table.rows[0].cells, ["001", "Doe, Ana", 'line one\nline "two"', ""]);
  assert.deepEqual(table.rows[1].cells, ["002", "Bob", "plain", ""]);
  const roundTrip = serializeCsv([table.headers.map(value => value.sourceName), ...table.rows.map(row => row.cells.map(value => value ?? ""))]);
  assert.deepEqual(parseCsv(roundTrip).rows.map(row => row.cells), table.rows.map(row => row.cells));
});

test("duplicate and missing headers are stable, while absent fields stay distinct from empty fields", () => {
  const table = parseCsv("id,id,\n1,,x\n2\n");
  assert.deepEqual(table.headers.map(header => [header.id, header.label, header.occurrence]), [
    ["column-1", "id", 1], ["column-2", "id (2)", 2], ["column-3", "Column 3", 1],
  ]);
  assert.equal(table.rows[0].cells[1], "");
  assert.equal(table.rows[1].cells[1], null);
  assert.match(table.diagnostics.join(" "), /duplicate header/);
  assert.match(table.diagnostics.join(" "), /missing trailing fields/);
  assert.deepEqual(parseCsv(""), { parserVersion: 1, headers: [], rows: [], diagnostics: ["The file is empty."] });
  assert.throws(() => parseCsv('id\n"unfinished'), /unterminated/);
});

test("exact comparison classifies matched, missing, conflicting and ambiguous groups deterministically", async () => {
  const left = await source("a.csv", "id,name,qty\n001,Clamp,2\n002,Bolt,4\n003,Nut,1\n003,Nut,1\n,Blank,0\n");
  const right = await source("b.csv", "id,name,qty\n001,Clamp,2\n002,Bolt,5\n004,Washer,1\n,Blank,0\n");
  const recipe = makeRecipe(left.table, right.table, "column-1", "column-1");
  const first = compareTables(left, right, recipe); const second = compareTables(left, right, recipe);
  assert.deepEqual(first, second);
  assert.deepEqual(first.totals, { matched: 1, missing: 1, conflicting: 1, ambiguous: 2, leftRows: 5, rightRows: 4, outputRows: 9 });
  assert.equal(first.groups.find(group => group.key === "001").category, "matched");
  assert.deepEqual(first.groups.find(group => group.key === "002").differences, ["qty"]);
  assert.equal(first.groups.find(group => group.key === "003").category, "ambiguous");
  assert.equal(first.groups.find(group => group.key === "004").category, "missing");
  assert.equal(first.groups.find(group => group.key === "").category, "ambiguous", "an empty key requires review without becoming a fabricated match");
  assert.equal(first.groups.find(group => group.key === "001").key, "001", "leading zero remains text");
});

test("decisions bind to an exact input and recipe fingerprint and invalidate after replacement", async () => {
  const left = await source("a.csv", "id,value\n01,A\n"); const right = await source("b.csv", "id,value\n01,B\n");
  const comparison = compareTables(left, right, makeRecipe(left.table, right.table, "column-1", "column-1"));
  const decision = { groupId: comparison.groups[0].id, fingerprint: comparison.fingerprint, status: "reviewed", note: "Checked source systems" };
  assert.deepEqual(reconcileDecisions([decision], comparison), [decision]);
  const replacement = await source("b.csv", "id,value\n01,C\n");
  replacement.hash = right.hash;
  const changed = compareTables(left, replacement, makeRecipe(left.table, replacement.table, "column-1", "column-1"));
  assert.deepEqual(reconcileDecisions([decision], changed), [], "source text invalidates decisions even when an imported digest is reused");
});

test("wide comparisons index each schema once instead of scanning headers for every cell", async () => {
  const headers = ["id", ...Array.from({ length: 499 }, (_, index) => `field-${index + 1}`)];
  const rows = Array.from({ length: 200 }, (_, row) => [`key-${row}`, ...Array.from({ length: 499 }, (_, column) => `${row}:${column}`)].join(","));
  const text = `${headers.join(",")}\n${rows.join("\n")}\n`;
  const left = await source("wide-a.csv", text); const right = await source("wide-b.csv", text);
  Object.defineProperty(left.table.headers, "findIndex", { value: () => { throw new Error("per-cell header scan"); } });
  Object.defineProperty(right.table.headers, "findIndex", { value: () => { throw new Error("per-cell header scan"); } });
  const comparison = compareTables(left, right, makeRecipe(left.table, right.table, "column-1", "column-1"));
  assert.equal(comparison.totals.matched, 200);
  assert.equal(comparison.groups.every(group => group.differences.length === 0), true);
});

test("exports account for every source row and describe spreadsheet formula neutralization", async () => {
  const left = await source("a.csv", "id,value\n1,=2+2\n2,+cmd\n"); const right = await source("b.csv", "id,value\n1,=2+2\n3,@name\n");
  const comparison = compareTables(left, right, makeRecipe(left.table, right.table, "column-1", "column-1"));
  const data = exportComparison(comparison, left, right, [], false);
  const safe = exportComparison(comparison, left, right, [], true);
  assert.equal(parseCsv(data).rows.length, 4);
  assert.equal(parseCsv(safe).rows.length, 4);
  assert.match(data, /,=2\+2/); assert.match(safe, /,'=2\+2/);
  assert.equal(neutralizeFormula("  -2"), "'  -2"); assert.equal(neutralizeFormula("001"), "001");
  assert.deepEqual(JSON.parse(exportRecipe(makeRecipe(left.table, right.table, "column-1", "column-1"))).schema, "vlak.reconciliation-recipe");
});

test("project import rejects extra keys, fabricated tables, unbounded values and stale decisions", async () => {
  const left = await source("a.csv", "id,value\n1,A\n"); const right = await source("b.csv", "id,value\n1,B\n");
  const recipe = makeRecipe(left.table, right.table, "column-1", "column-1"); const comparison = compareTables(left, right, recipe);
  const project = { schema: "vlak.reconciliation", version: 1, title: "Check", sources: { left, right }, recipe, decisions: [{ groupId: comparison.groups[0].id, fingerprint: comparison.fingerprint, status: "reviewed", note: "" }] };
  assert.deepEqual(parseReconciliationProject(JSON.stringify(project)), project);
  assert.throws(() => parseReconciliationProject({ ...project, execute: "alert(1)" }), /unsupported field execute/);
  assert.throws(() => parseReconciliationProject({ ...project, sources: { ...project.sources, left: { ...left, table: { ...left.table, rows: [] } } } }), /immutable source text/);
  assert.throws(() => parseReconciliationProject({ ...project, decisions: [{ ...project.decisions[0], note: "x".repeat(501) }] }), /500/);
  assert.throws(() => parseReconciliationProject({ ...project, sources: { ...project.sources, left: { ...left, size: Number.NaN } } }), /finite integer/);
  assert.throws(() => parseReconciliationProject({ ...project, recipe: { ...recipe, compare: [...recipe.compare, { leftId: "constructor", rightId: "column-2", label: "bad" }] } }), /do not match/);
  assert.throws(() => parseReconciliationProject({ ...project, decisions: [{ ...project.decisions[0], fingerprint: "stale" }] }), /do not belong/);
});

test("worker jobs carry IDs and stale or canceled results cannot be accepted", async () => {
  const response = await runWorkerJob({ jobId: 41, kind: "parse", name: "a.csv", size: 7, text: "id\n001\n" });
  assert.equal(response.jobId, 41); assert.equal(response.kind, "parsed");
  assert.equal(shouldAcceptJob(41, response.jobId), true);
  assert.equal(shouldAcceptJob(42, response.jobId), false, "incrementing the active ID cancels or supersedes the old result");
  const bad = await runWorkerJob({ jobId: 43, kind: "parse", name: "bad.csv", size: 3, text: '"x' });
  assert.equal(bad.kind, "error"); assert.equal(bad.jobId, 43);
});

test("malformed quotes are rejected and collided display headers cannot discard cells", async () => {
  for (const source of ['id,value\n1,"a"b', 'id,value\n1,a"b']) assert.throws(() => parseCsv(source));
  const text = 'id,a,a,a (2),Column 5,\n001,first,second,third,fourth,fifth\n';
  const table = parseCsv(text);
  assert.equal(new Set(table.headers.map(header => header.label)).size, table.headers.length);
  const left = await source("left.csv", text), right = await source("right.csv", text);
  const comparison = compareTables(left, right, makeRecipe(left.table, right.table, "column-1", "column-1"));
  const exported = parseCsv(exportComparison(comparison, left, right, []));
  for (const row of exported.rows) for (const value of ["001", "first", "second", "third", "fourth", "fifth"]) assert.ok(row.cells.includes(value), value);
});
test("recipe export reopens only against compatible sources and preserves their values", async () => {
  const left = await source("a.csv", "id,value\n001,one\n"), right = await source("b.csv", "id,value\n001,two\n");
  const available = columnPairs(left.table, right.table, "column-1", "column-1");
  const recipe = makeRecipe(left.table, right.table, "column-1", "column-1", available);
  assert.deepEqual(readRecipe(exportRecipe(recipe), left, right), recipe);
  const withoutValue = makeRecipe(left.table, right.table, "column-1", "column-1", []);
  assert.deepEqual(withoutValue.compare, []);
  assert.equal(compareTables(left, right, withoutValue).groups[0].category, "matched", "deselected fields do not create conflicts");
  assert.equal(compareTables(left, right, recipe).groups[0].category, "conflicting", "included fields remain exact comparisons");
  assert.deepEqual(readRecipe(exportRecipe(withoutValue), left, right), withoutValue, "a custom comparison-column selection reopens");
  assert.throws(() => readRecipe(exportRecipe(recipe), null, right));
  assert.throws(() => readRecipe(JSON.stringify({ schema: "vlak.reconciliation-recipe", version: 2, recipe }), left, right));
  assert.equal(left.table.rows[0].cells[0], "001");
});
