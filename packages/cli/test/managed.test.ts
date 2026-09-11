import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir as osTmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyUpdate, installManaged, installed, makeUpdatePlan, managedStatus, readUpdatePlan, recoverUpdate, safePath, sha } from "../src/managed";
import type { SourceFile } from "../src/managed";

let cwd: string;
beforeEach(() => { cwd = mkdtempSync(join(osTmpdir(), "vlak-managed-")); });
afterEach(() => { rmSync(cwd, { recursive: true, force: true }); });

function write(relative: string, content: string | Buffer) {
  const path = join(cwd, relative); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content);
}
function install(files: SourceFile[], source = "fixture:v1") {
  return installManaged(cwd, files, source, () => {
    for (const file of files) write(file.path, file.content);
    return { value: files.length, installedPaths: [...new Set(files.map(file => file.path))] };
  });
}
const file = (path: string, content: string, owners = ["button"]): SourceFile => ({ path, content, owners });
const manifestText = () => readFileSync(join(cwd, ".vlak/installed.json"));

describe("managed provenance and safe updates", () => {
  it("records the exact installed bytes and reports clean, modified, and missing files", () => {
    install([file("ui/a.ts", "old-a"), file("ui/b.ts", "old-b")]);
    expect(installed(cwd).files.map(entry => [entry.path, entry.base])).toEqual([
      ["ui/a.ts", sha("old-a")], ["ui/b.ts", sha("old-b")],
    ]);
    write("ui/a.ts", "local-a"); rmSync(join(cwd, "ui/b.ts"));
    expect(managedStatus(cwd).map(entry => [entry.path, entry.state])).toEqual([["ui/a.ts", "modified"], ["ui/b.ts", "missing"]]);
  });

  it("applies a clean reviewed update and replaces its baseline", () => {
    install([file("ui/a.ts", "old")]);
    const plan = makeUpdatePlan(cwd, [file("ui/a.ts", "new")], "fixture:v2");
    expect(plan.changes[0]?.state).toBe("ready");
    expect(applyUpdate(cwd, plan)).toEqual({ changed: 1, preserved: 0 });
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("new");
    expect(installed(cwd).files[0]).toMatchObject({ base: sha("new"), source: "fixture:v2" });
    expect(existsSync(join(cwd, ".vlak/transaction.json"))).toBe(false);
  });

  it("preserves a local-only edit when the upstream bytes are unchanged", () => {
    install([file("ui/a.ts", "base")]); write("ui/a.ts", "my local edit");
    const plan = makeUpdatePlan(cwd, [file("ui/a.ts", "base")], "fixture:v2");
    expect(plan.changes[0]?.state).toBe("local");
    expect(applyUpdate(cwd, plan)).toEqual({ changed: 0, preserved: 1 });
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("my local edit");
    expect(installed(cwd).files[0]?.base).toBe(sha("base"));
  });

  it("blocks a two-sided conflict before changing a clean sibling", () => {
    install([file("ui/a.ts", "old-a"), file("ui/b.ts", "old-b")]); write("ui/a.ts", "local-a");
    const plan = makeUpdatePlan(cwd, [file("ui/a.ts", "upstream-a"), file("ui/b.ts", "upstream-b")], "fixture:v2");
    expect(plan.changes.map(change => change.state)).toEqual(["conflict", "ready"]);
    expect(() => applyUpdate(cwd, plan)).toThrow(/Resolve conflicts/);
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("local-a");
    expect(readFileSync(join(cwd, "ui/b.ts"), "utf8")).toBe("old-b");
  });

  it("rejects a stale plan before any destination write", () => {
    install([file("ui/a.ts", "old-a"), file("ui/b.ts", "old-b")]);
    const plan = makeUpdatePlan(cwd, [file("ui/a.ts", "new-a"), file("ui/b.ts", "new-b")], "fixture:v2");
    write("ui/b.ts", "later-b");
    expect(() => applyUpdate(cwd, plan)).toThrow(/Stale update plan: ui\/b.ts/);
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("old-a");
    expect(readFileSync(join(cwd, "ui/b.ts"), "utf8")).toBe("later-b");
    expect(existsSync(join(cwd, ".vlak/transaction.json"))).toBe(false);
  });

  it("rejects a plan after installed metadata changes", () => {
    install([file("ui/a.ts", "old-a")]);
    const plan = makeUpdatePlan(cwd, [file("ui/a.ts", "new-a")], "fixture:v2");
    install([file("ui/b.ts", "newly-installed", ["dialog"])], "fixture:add");
    expect(() => applyUpdate(cwd, plan)).toThrow(/Installed metadata changed/);
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("old-a");
    expect(readFileSync(join(cwd, "ui/b.ts"), "utf8")).toBe("newly-installed");
  });

  it("removes a clean retired file while preserving shared helper ownership", () => {
    install([
      file("ui/shared.ts", "shared", ["button", "dialog"]),
      file("ui/retired.ts", "retired", ["button"]),
    ]);
    write("ui/retired.ts", "locally retained");
    const blocked = makeUpdatePlan(cwd, [file("ui/shared.ts", "shared", ["dialog"])], "fixture:v2");
    expect(blocked.changes.find(change => change.path === "ui/retired.ts")?.state).toBe("conflict");
    expect(() => applyUpdate(cwd, blocked)).toThrow(/Resolve conflicts/);
    expect(readFileSync(join(cwd, "ui/retired.ts"), "utf8")).toBe("locally retained");
    write("ui/retired.ts", "retired");
    const plan = makeUpdatePlan(cwd, [file("ui/shared.ts", "shared", ["dialog"])], "fixture:v2");
    expect(plan.changes.find(change => change.path === "ui/retired.ts")?.state).toBe("ready");
    applyUpdate(cwd, plan);
    expect(existsSync(join(cwd, "ui/retired.ts"))).toBe(false);
    expect(readFileSync(join(cwd, "ui/shared.ts"), "utf8")).toBe("shared");
    expect(installed(cwd).files).toEqual([{ path: "ui/shared.ts", base: sha("shared"), owners: ["dialog"], source: "fixture:v2" }]);
  });
});

describe("untrusted managed metadata", () => {
  it("rejects malformed manifests, extra fields, missing baselines, and duplicate owners", () => {
    mkdirSync(join(cwd, ".vlak"), { recursive: true });
    write(".vlak/installed.json", "not json");
    expect(() => installed(cwd)).toThrow(/not valid JSON/);
    write(".vlak/installed.json", JSON.stringify({ schema: "vlak.installed", version: 1, files: [], extra: true }));
    expect(() => installed(cwd)).toThrow(/manifest fields/);
    write(".vlak/installed.json", JSON.stringify({ schema: "vlak.installed", version: 1, files: [{ path: "ui/a.ts", base: sha("x"), owners: ["a", "a"], source: "fixture", extra: true }] }));
    expect(() => installed(cwd)).toThrow(/file record fields/);
    write(".vlak/installed.json", JSON.stringify({ schema: "vlak.installed", version: 1, files: [{ path: "ui/a.ts", base: sha("x"), owners: ["a"], source: "fixture" }] }));
    expect(() => installed(cwd)).toThrow(/Missing or damaged baseline/);
  });

  it("rejects edited plans, extra change fields, noncanonical base64, and unsafe destinations", () => {
    install([file("ui/a.ts", "old")]); const plan = makeUpdatePlan(cwd, [file("ui/a.ts", "new")], "fixture:v2");
    expect(() => readUpdatePlan(cwd, JSON.stringify({ ...plan, execute: true }))).toThrow(/update plan fields/);
    const change = { ...plan.changes[0], extra: true }; const body = { schema: plan.schema, version: plan.version, id: plan.id, source: plan.source, manifestHash: plan.manifestHash, changes: [change] };
    expect(() => readUpdatePlan(cwd, JSON.stringify({ ...body, digest: sha(JSON.stringify(body)) }))).toThrow(/update change fields/);
    const broken = { ...plan.changes[0], content: `${plan.changes[0]!.content}====` }; const brokenBody = { ...body, changes: [broken] };
    expect(() => readUpdatePlan(cwd, JSON.stringify({ ...brokenBody, digest: sha(JSON.stringify(brokenBody)) }))).toThrow(/update content/);
    for (const path of ["../outside", "/tmp/outside", "a\\b", ".VLAK/installed.json", "a//b", "file.ts:stream", "CON/file.ts", "trailing./file.ts"]) expect(() => safePath(cwd, path)).toThrow(/Unsafe project path|escapes project/);
  });

  it("refuses symlinked and non-directory parents before planning a write", () => {
    const outside = mkdtempSync(join(osTmpdir(), "vlak-outside-"));
    try {
      symlinkSync(outside, join(cwd, "linked"));
      expect(() => makeUpdatePlan(cwd, [file("linked/file.ts", "x")], "fixture:v2")).toThrow(/Refusing symlink/);
      write("blocked", "not a directory");
      expect(() => makeUpdatePlan(cwd, [file("blocked/file.ts", "x")], "fixture:v2")).toThrow(/non-directory parent/);
      expect(existsSync(join(outside, "file.ts"))).toBe(false);
    } finally { rmSync(outside, { recursive: true, force: true }); }
  });

  it("holds a synchronous lock across install writes and provenance", () => {
    mkdirSync(join(cwd, ".vlak"), { recursive: true }); write(".vlak/lock", String(process.pid));
    expect(() => install([file("ui/a.ts", "x")])).toThrow(/Another CLI operation/);
    expect(existsSync(join(cwd, "ui/a.ts"))).toBe(false);
  });

  it("does not remove a lock whose ownership changes during an operation", () => {
    expect(() => installManaged(cwd, [], "fixture:v1", () => {
      write(".vlak/lock", "999999:replacement");
      return { value: undefined, installedPaths: [] };
    })).toThrow(/lock ownership changed/);
    expect(readFileSync(join(cwd, ".vlak/lock"), "utf8")).toBe("999999:replacement");
  });
});

function interruptedJournal(files: Array<{ path: string; before: string | null; after: string | null }>, afterFiles: Array<{ path: string; base: string; owners: string[]; source: string }>) {
  const beforeManifest = manifestText();
  for (const entry of afterFiles) write(`.vlak/bases/${entry.base}`, files.find(file => file.path === entry.path)?.after ? Buffer.from(files.find(file => file.path === entry.path)!.after!, "base64") : "");
  const afterManifest = Buffer.from(JSON.stringify({ schema: "vlak.installed", version: 1, files: afterFiles }, null, 2) + "\n").toString("base64");
  write(".vlak/transaction.json", JSON.stringify({ schema: "vlak.transaction", version: 1, id: "fixture-transaction", beforeManifest: beforeManifest.toString("base64"), afterManifest, files }, null, 2) + "\n");
}

describe("interrupted update recovery", () => {
  it("rolls back recognized partially written bytes and the manifest", () => {
    install([file("ui/a.ts", "old")]);
    const before = Buffer.from("old").toString("base64"), after = Buffer.from("new").toString("base64");
    interruptedJournal([{ path: "ui/a.ts", before, after }], [{ path: "ui/a.ts", base: sha("new"), owners: ["button"], source: "fixture:v2" }]);
    write("ui/a.ts", "new");
    expect(recoverUpdate(cwd)).toEqual({ pending: true, paths: ["ui/a.ts"] });
    expect(recoverUpdate(cwd, true)).toEqual({ pending: false, paths: ["ui/a.ts"] });
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("old");
    expect(installed(cwd).files[0]?.base).toBe(sha("old"));
    expect(existsSync(join(cwd, ".vlak/transaction.json"))).toBe(false);
  });

  it("refuses rollback before any write when one path has a later edit", () => {
    install([file("ui/a.ts", "old-a"), file("ui/b.ts", "old-b")]);
    const files = [
      { path: "ui/a.ts", before: Buffer.from("old-a").toString("base64"), after: Buffer.from("new-a").toString("base64") },
      { path: "ui/b.ts", before: Buffer.from("old-b").toString("base64"), after: Buffer.from("new-b").toString("base64") },
    ];
    interruptedJournal(files, [
      { path: "ui/a.ts", base: sha("new-a"), owners: ["button"], source: "fixture:v2" },
      { path: "ui/b.ts", base: sha("new-b"), owners: ["button"], source: "fixture:v2" },
    ]);
    write("ui/a.ts", "new-a"); write("ui/b.ts", "later-b");
    expect(() => recoverUpdate(cwd, true)).toThrow(/ui\/b.ts has later edits/);
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("new-a");
    expect(readFileSync(join(cwd, "ui/b.ts"), "utf8")).toBe("later-b");
    expect(existsSync(join(cwd, ".vlak/transaction.json"))).toBe(true);
  });

  it("rejects malformed journals without touching managed files", () => {
    install([file("ui/a.ts", "old")]);
    write(".vlak/transaction.json", JSON.stringify({ schema: "vlak.transaction", version: 1, id: "bad", beforeManifest: "!!!!", afterManifest: "", files: [], extra: true }));
    expect(() => recoverUpdate(cwd, true)).toThrow(/journal fields/);
    write(".vlak/transaction.json", JSON.stringify({ schema: "vlak.transaction", version: 1, id: "bad", beforeManifest: "!!!!", afterManifest: "!!!!", files: [] }));
    expect(() => recoverUpdate(cwd, true)).toThrow(/transaction before manifest/);
    expect(readFileSync(join(cwd, "ui/a.ts"), "utf8")).toBe("old");
    expect(existsSync(join(cwd, ".vlak/transaction.json"))).toBe(true);
  });

  it.skipIf(process.platform === "win32")("leaves a recovery journal when a destination write fails", () => {
    install([file("readonly/a.ts", "old")]);
    const plan = makeUpdatePlan(cwd, [file("readonly/a.ts", "new")], "fixture:v2");
    chmodSync(join(cwd, "readonly"), 0o555);
    try {
      expect(() => applyUpdate(cwd, plan)).toThrow();
      expect(existsSync(join(cwd, ".vlak/transaction.json"))).toBe(true);
    } finally { chmodSync(join(cwd, "readonly"), 0o755); }
    expect(recoverUpdate(cwd, true).pending).toBe(false);
    expect(readFileSync(join(cwd, "readonly/a.ts"), "utf8")).toBe("old");
  });
});
