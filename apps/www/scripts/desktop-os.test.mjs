import assert from "node:assert/strict";
import { test } from "node:test";
import { childrenOf, initialFileSystem, makeFolder, moveEntry, normalizePath, removeEntry, runCommand, validateFileSystem, writeFile } from "../app/interfaces/desktop-os/fs.ts";
import { calculate } from "../app/interfaces/desktop-os/calculator.ts";

test("filesystem normalizes relative paths and keeps folder contents through rename", () => {
  assert.equal(normalizePath("../../../../Pictures/./drawing.png", "/Documents/Notes"), "/Pictures/drawing.png");
  let files = makeFolder(initialFileSystem(), "/Documents/Drafts");
  files = writeFile(files, "/Documents/Drafts/Idea.txt", "A small idea");
  files = moveEntry(files, "/Documents/Drafts", "/Documents/Work");
  assert.equal(files.find(file => file.path === "/Documents/Work/Idea.txt").content, "A small idea");
  assert.ok(validateFileSystem(files));
  assert.equal(childrenOf(files, "/Documents")[0].kind, "folder");
  assert.throws(() => moveEntry(files, "/Documents/Work", "/Documents/Work/Nested"));
  assert.throws(() => removeEntry(files, "/"));
  assert.throws(() => writeFile(files, "/Documents", "replace a folder"));
  assert.ok(!removeEntry(files, "/Documents/Work").some(file => file.path.startsWith("/Documents/Work")));
});
test("invalid persisted files are rejected without trusting orphaned paths or oversized data", () => {
  for (const candidate of [null, {}, [], [{path:"/",kind:"folder"},{path:"/Missing/Child",kind:"file",content:""}], [...initialFileSystem(), {path:"/Documents/../Bad",kind:"file",content:""}], [...initialFileSystem(), {path:"/Documents",kind:"folder"}], [{path:"/",kind:"folder"},{path:"/Huge",kind:"file",content:"x".repeat(2_000_001)}]]) assert.equal(validateFileSystem(candidate), null);
  const fresh = initialFileSystem(); const restored = validateFileSystem(JSON.parse(JSON.stringify(fresh)));
  assert.deepEqual(restored, fresh);
  assert.notEqual(restored, fresh);
});
test("terminal commands write, append, copy, find and move the shared files", () => {
  let files = initialFileSystem(); let cwd = "/Documents";
  const run = command => { const result = runCommand(command, files, cwd); files = result.files; cwd = result.cwd; return result; };
  run('echo "A line with spaces" > "New note.txt"');
  run('echo second >> "New note.txt"');
  assert.equal(run('cat "New note.txt"').output, "A line with spaces\nsecond\n");
  run('mkdir Drafts'); run('cp "New note.txt" Drafts/Copy.txt'); run('cd Drafts');
  assert.equal(run('grep spaces Copy.txt').output, "A line with spaces");
  run('mv /Documents/Drafts /Documents/Saved');
  assert.equal(cwd, "/Documents/Saved");
  assert.equal(run('find Copy').output, "/Documents/Saved/Copy.txt");
  const before = JSON.stringify(files);
  assert.match(run('mkdir Copy.txt').output, /already/);
  assert.equal(JSON.stringify(files), before);
  run('rm /Documents/Saved'); assert.equal(cwd, "/");
  assert.equal(run('clear').clear, true);
});
test("each desktop starts with independent records", () => {
  const mac = initialFileSystem("mac"); const linux = initialFileSystem("linux");
  const edited = writeFile(mac, "/Documents/Notes.txt", "Only here");
  assert.notEqual(edited.find(file => file.path === "/Documents/Notes.txt").content, linux.find(file => file.path === "/Documents/Notes.txt").content);
});
test("calculator respects precedence, decimals and parentheses without evaluating code", () => {
  assert.equal(calculate("2 + 3 × 4"), 14);
  assert.equal(calculate("(2 + 3) × -4"), -20);
  assert.equal(calculate(".1 + .2"), .3);
  assert.equal(calculate("24 ÷ (2 × 3)"), 4);
  for (const invalid of ["", "2+", "(2+3", "3/0", "Math.random()", "1; alert(1)", "2**3", "Infinity"]) assert.throws(() => calculate(invalid));
});
