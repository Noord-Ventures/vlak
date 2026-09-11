import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve, sep } from "node:path";

type Entry = { path: string; base: string; owners: string[]; source: string };
export type Manifest = { schema: "vlak.installed"; version: 1; files: Entry[] };
export type SourceFile = { path: string; content: string | Buffer; owners: string[] };
type Change = { path: string; before: string | null; after: string | null; content: string | null; state: "ready" | "unchanged" | "local" | "conflict"; owners: string[] };
export type UpdatePlan = { schema: "vlak.update-plan"; version: 1; id: string; source: string; manifestHash: string | null; changes: Change[]; digest: string };
type Journal = { schema: "vlak.transaction"; version: 1; id: string; beforeManifest: string | null; afterManifest: string; files: { path: string; before: string | null; after: string | null }[] };
const EMPTY: Manifest = { schema: "vlak.installed", version: 1, files: [] };
const MANIFEST = ".vlak/installed.json", JOURNAL = ".vlak/transaction.json", LOCK = ".vlak/lock";
// A journal can contain both sides of the 64 MiB managed-file ceiling as base64.
const MAX_METADATA_BYTES = 256 * 1024 * 1024;
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_TOTAL_BYTES = 64 * 1024 * 1024;
const MAX_FILES = 10_000;
const MAX_TEXT = 2_048;
export const sha = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
const validHash = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const windowsDevice = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;

/** Registry destinations are project-relative; existing symlinks are never followed. */
export function safePath(cwd: string, path: string, internal = false): string {
  const parts = typeof path === "string" ? path.split("/") : [];
  if (typeof path !== "string" || !path || path.length > MAX_TEXT || path.includes("\\") || isAbsolute(path) || /^[a-z]:/i.test(path) || parts.some(part => !part || part === "." || part === ".." || [...part].some(character => character.charCodeAt(0) < 32) || /[<>:"|?*]/.test(part) || /[ .]$/.test(part) || windowsDevice.test(part)) || (!internal && parts[0]?.toLowerCase() === ".vlak")) throw new Error(`Unsafe project path: ${path}`);
  const root = resolve(cwd), absolute = resolve(root, path);
  if (!absolute.startsWith(root + sep)) throw new Error(`Path escapes project: ${path}`);
  let current = root;
  for (const [index, part] of parts.entries()) {
    current += sep + part;
    try {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error(`Refusing symlink: ${path}`);
      if (index < parts.length - 1 && !stat.isDirectory()) throw new Error(`Refusing non-directory parent: ${path}`);
    }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  return absolute;
}
function bytes(cwd: string, path: string, internal = false): Buffer | null {
  const target = safePath(cwd, path, internal);
  if (!existsSync(target)) return null;
  const stat = lstatSync(target);
  if (!stat.isFile()) throw new Error(`Managed path is not a regular file: ${path}`);
  const limit = path === MANIFEST || path === JOURNAL ? MAX_METADATA_BYTES : MAX_FILE_BYTES;
  if (stat.size > limit) throw new Error(`Managed file exceeds its size limit: ${path}`);
  return readFileSync(target);
}
function atomic(cwd: string, path: string, value: string | Buffer, internal = false) {
  const target = safePath(cwd, path, internal);
  const size = typeof value === "string" ? Buffer.byteLength(value) : value.length;
  const limit = path === MANIFEST || path === JOURNAL ? MAX_METADATA_BYTES : MAX_FILE_BYTES;
  if (size > limit) throw new Error(`Managed file exceeds its size limit: ${path}`);
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  try { writeFileSync(temporary, value, { flag: "wx" }); renameSync(temporary, target); }
  finally { if (existsSync(temporary)) unlinkSync(temporary); }
}
function decode(text: string) {
  if (typeof text !== "string" || Buffer.byteLength(text) > MAX_METADATA_BYTES) throw new Error("Managed metadata exceeds its size limit.");
  try { return JSON.parse(text); } catch { throw new Error("Managed metadata is not valid JSON."); }
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid managed metadata.");
  return value as Record<string, unknown>;
}
function exactKeys(value: Record<string, unknown>, expected: string[], label: string) {
  if (Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) throw new Error(`Invalid ${label} fields.`);
}
function boundedText(value: unknown): value is string { return typeof value === "string" && value.length > 0 && value.length <= MAX_TEXT; }
function names(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_FILES && new Set(value).size === value.length && value.every(name => boundedText(name) && /^[a-z0-9-]+$/.test(name));
}
function base64(value: unknown, label: string, maxBytes = MAX_FILE_BYTES): Buffer | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.length > Math.ceil(maxBytes / 3) * 4 + 4 || value.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error(`Invalid ${label}.`);
  const result = Buffer.from(value, "base64");
  if (result.length > maxBytes || result.toString("base64") !== value) throw new Error(`Invalid ${label}.`);
  return result;
}
function parseManifest(cwd: string, raw: Buffer, requireBases = true): Manifest {
  const data = object(decode(raw.toString()));
  exactKeys(data, ["schema", "version", "files"], "installed manifest");
  if (data.schema !== EMPTY.schema || data.version !== 1 || !Array.isArray(data.files) || data.files.length > MAX_FILES) throw new Error("Unsupported installed manifest. Keep a backup; do not overwrite it.");
  const seen = new Set<string>();
  const files = data.files.map(value => {
    const entry = object(value); exactKeys(entry, ["path", "base", "owners", "source"], "installed file record");
    if (typeof entry.path !== "string" || !validHash(entry.base) || !names(entry.owners) || !boundedText(entry.source) || seen.has(entry.path)) throw new Error("Invalid installed file record.");
    safePath(cwd, entry.path); seen.add(entry.path);
    if (requireBases) {
      const baseline = bytes(cwd, `.vlak/bases/${entry.base}`, true);
      if (!baseline || sha(baseline) !== entry.base) throw new Error(`Missing or damaged baseline for ${entry.path}. Restore .vlak from backup.`);
    }
    return { path: entry.path, base: entry.base, owners: entry.owners, source: entry.source };
  });
  return { ...EMPTY, files };
}
export function installed(cwd: string): Manifest {
  const raw = bytes(cwd, MANIFEST, true);
  if (!raw) return structuredClone(EMPTY);
  return parseManifest(cwd, raw);
}
export function assertReady(cwd: string) {
  if (bytes(cwd, JOURNAL, true)) throw new Error("An interrupted update needs review. Run vlak recover before changing managed files.");
  installed(cwd);
}
function exclusive<T>(cwd: string, action: () => T, recover = false): T {
  const target = safePath(cwd, LOCK, true);
  mkdirSync(dirname(target), { recursive: true });
  if (existsSync(target) && recover) {
    const pid = Number(readFileSync(target, "utf8").split(":", 1)[0]);
    if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error("Invalid CLI lock; inspect .vlak/lock before removing it.");
    let alive = true;
    try { process.kill(pid, 0); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ESRCH") alive = false; }
    if (!alive) unlinkSync(target);
  }
  const owner = `${process.pid}:${randomUUID()}`;
  try { writeFileSync(target, owner, { flag: "wx" }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error("Another CLI operation holds .vlak/lock. After an interrupted process, run vlak recover.");
    throw error;
  }
  try {
    const result = action();
    if (readFileSync(target, "utf8") !== owner) throw new Error("CLI lock ownership changed during the operation. Inspect .vlak/lock.");
    unlinkSync(target);
    return result;
  } catch (error) {
    try {
      if (readFileSync(target, "utf8") === owner) unlinkSync(target);
    } catch { /* Preserve the primary operation or lock-ownership failure. */ }
    throw error;
  }
}

function normalizedSources(cwd: string, sources: SourceFile[]) {
  if (sources.length > MAX_FILES) throw new Error("Too many managed source files.");
  const merged = new Map<string, { path: string; content: Buffer; owners: string[] }>();
  let total = 0;
  for (const file of sources) {
    safePath(cwd, file.path);
    if (!names(file.owners)) throw new Error("Invalid component owners.");
    const content = Buffer.from(file.content);
    if (content.length > MAX_FILE_BYTES) throw new Error(`Managed source exceeds 16 MiB: ${file.path}`);
    const previous = merged.get(file.path);
    if (previous && !previous.content.equals(content)) throw new Error(`Conflicting target definitions: ${file.path}`);
    if (!previous) { total += content.length; if (total > MAX_TOTAL_BYTES) throw new Error("Managed sources exceed 64 MiB in total."); }
    merged.set(file.path, { path: file.path, content, owners: [...new Set([...(previous?.owners ?? []), ...file.owners])].sort() });
  }
  return merged;
}

/** Hold the CLI lock across destination writes and provenance recording. */
export function installManaged<T>(cwd: string, sources: SourceFile[], source: string, action: () => { value: T; installedPaths: string[] }): T {
  if (!boundedText(source)) throw new Error("Invalid managed source label.");
  const candidates = normalizedSources(cwd, sources);
  return exclusive(cwd, () => {
    assertReady(cwd);
    const manifest = installed(cwd);
    const result = action();
    if (!Array.isArray(result.installedPaths) || result.installedPaths.length > candidates.size || new Set(result.installedPaths).size !== result.installedPaths.length || result.installedPaths.some(path => !candidates.has(path))) throw new Error("Install reported invalid managed destinations.");
    for (const path of result.installedPaths) {
      const file = candidates.get(path)!;
      const content = file.content, current = bytes(cwd, file.path);
      if (!current?.equals(content)) throw new Error(`File changed before provenance could be recorded: ${file.path}`);
      const base = sha(content), previous = manifest.files.find(entry => entry.path === file.path);
      atomic(cwd, `.vlak/bases/${base}`, content, true);
      const entry = { path: file.path, base, source, owners: [...new Set([...(previous?.owners ?? []), ...file.owners])].sort() };
      manifest.files = [...manifest.files.filter(item => item.path !== file.path), entry];
    }
    manifest.files.sort((a, b) => a.path.localeCompare(b.path));
    atomic(cwd, MANIFEST, json(manifest), true);
    return result.value;
  });
}

export function managedStatus(cwd: string) {
  return installed(cwd).files.map(file => {
    const current = bytes(cwd, file.path);
    return { ...file, state: !current ? "missing" : sha(current) === file.base ? "clean" : "modified" };
  });
}
function planDigest(plan: Omit<UpdatePlan, "digest">) { return sha(JSON.stringify(plan)); }
export function makeUpdatePlan(cwd: string, sources: SourceFile[], source: string): UpdatePlan {
  assertReady(cwd);
  if (!boundedText(source)) throw new Error("Invalid managed source label.");
  const manifest = installed(cwd), targets = normalizedSources(cwd, sources);
  const paths = [...new Set([...manifest.files.map(file => file.path), ...targets.keys()])].sort();
  const changes = paths.map((path: string) => {
    const entry = manifest.files.find(file => file.path === path), target = targets.get(path), current = bytes(cwd, path);
    const before = current ? sha(current) : null, after = target ? sha(target.content) : null;
    const changed = entry ? before !== entry.base : before !== null;
    const state: Change["state"] = before === after ? "unchanged" : changed ? after === entry?.base ? "local" : "conflict" : "ready";
    return { path, before, after, content: target ? target.content.toString("base64") : null, state, owners: target?.owners ?? entry!.owners };
  });
  const raw = bytes(cwd, MANIFEST, true);
  const plan: Omit<UpdatePlan, "digest"> = { schema: "vlak.update-plan", version: 1, id: randomUUID(), source, manifestHash: raw ? sha(raw) : null, changes };
  return { ...plan, digest: planDigest(plan) };
}
export function readUpdatePlan(cwd: string, text: string): UpdatePlan {
  const value = object(decode(text));
  exactKeys(value, ["schema", "version", "id", "source", "manifestHash", "changes", "digest"], "update plan");
  const { digest, ...body } = value;
  if (value.schema !== "vlak.update-plan" || value.version !== 1 || !boundedText(value.id) || !boundedText(value.source) || (value.manifestHash !== null && !validHash(value.manifestHash)) || !Array.isArray(value.changes) || value.changes.length > MAX_FILES || !validHash(digest) || digest !== sha(JSON.stringify(body))) throw new Error("Invalid or edited update plan. Generate a fresh plan.");
  const seen = new Set<string>();
  for (const raw of value.changes) {
    const change = object(raw);
    exactKeys(change, ["path", "before", "after", "content", "state", "owners"], "update change");
    if (typeof change.path !== "string" || seen.has(change.path) || !names(change.owners) || !["ready", "unchanged", "local", "conflict"].includes(String(change.state)) || (change.before !== null && !validHash(change.before)) || (change.after !== null && !validHash(change.after))) throw new Error("Invalid update change.");
    safePath(cwd, change.path); seen.add(change.path);
    const content = base64(change.content, "update content");
    if (change.after === null ? content !== null : content === null || sha(content) !== change.after) throw new Error("Damaged update content.");
  }
  return value as unknown as UpdatePlan;
}
export function applyUpdate(cwd: string, input: UpdatePlan) {
  return exclusive(cwd, () => {
    assertReady(cwd);
    const plan = readUpdatePlan(cwd, json(input)), manifest = installed(cwd), prior = bytes(cwd, MANIFEST, true);
    if ((prior ? sha(prior) : null) !== plan.manifestHash) throw new Error("Installed metadata changed. Generate a fresh plan.");
    if (plan.changes.some(change => change.state === "conflict")) throw new Error("Resolve conflicts and generate a fresh plan before updating. No files were changed.");
    for (const change of plan.changes) {
      const current = bytes(cwd, change.path);
      const base = manifest.files.find(file => file.path === change.path)?.base;
      const changed = base ? change.before !== base : change.before !== null;
      const state = change.before === change.after ? "unchanged" : changed ? change.after === base ? "local" : "conflict" : "ready";
      if (change.state !== state) throw new Error("Update plan classification does not match installed provenance.");
      if ((current ? sha(current) : null) !== change.before) throw new Error(`Stale update plan: ${change.path} changed. No files were changed.`);
    }
    const actionable = plan.changes.filter(change => change.state === "ready" || change.state === "unchanged");
    for (const change of actionable) {
      manifest.files = manifest.files.filter(file => file.path !== change.path);
      if (change.after && change.content !== null) {
        atomic(cwd, `.vlak/bases/${change.after}`, Buffer.from(change.content, "base64"), true);
        manifest.files.push({ path: change.path, base: change.after, owners: change.owners, source: plan.source });
      }
    }
    manifest.files.sort((a, b) => a.path.localeCompare(b.path));
    const journal: Journal = { schema: "vlak.transaction", version: 1, id: plan.id, beforeManifest: prior?.toString("base64") ?? null, afterManifest: Buffer.from(json(manifest)).toString("base64"), files: actionable.filter(change => change.state === "ready").map(change => ({ path: change.path, before: bytes(cwd, change.path)?.toString("base64") ?? null, after: change.content })) };
    atomic(cwd, JOURNAL, json(journal), true);
    for (const file of journal.files) {
      if (file.after === null) { if (existsSync(safePath(cwd, file.path))) unlinkSync(safePath(cwd, file.path)); }
      else atomic(cwd, file.path, Buffer.from(file.after, "base64"));
    }
    atomic(cwd, MANIFEST, Buffer.from(journal.afterManifest, "base64"), true);
    unlinkSync(safePath(cwd, JOURNAL, true));
    return { changed: journal.files.length, preserved: plan.changes.filter(change => change.state === "local").length };
  });
}
/** Roll back only recognizable before/after bytes. Later edits stop recovery before any writes. */
export function recoverUpdate(cwd: string, rollback = false) {
  return exclusive(cwd, () => {
    const raw = bytes(cwd, JOURNAL, true);
    if (!raw) return { pending: false, paths: [] as string[] };
    const data = object(decode(raw.toString()));
    exactKeys(data, ["schema", "version", "id", "beforeManifest", "afterManifest", "files"], "transaction journal");
    if (data.schema !== "vlak.transaction" || data.version !== 1 || !boundedText(data.id) || !Array.isArray(data.files) || data.files.length > MAX_FILES) throw new Error("Invalid transaction journal. Preserve .vlak for manual recovery.");
    const beforeManifest = base64(data.beforeManifest, "transaction before manifest", MAX_METADATA_BYTES);
    const afterManifest = base64(data.afterManifest, "transaction after manifest", MAX_METADATA_BYTES);
    if (!afterManifest) throw new Error("Invalid transaction journal. Preserve .vlak for manual recovery.");
    const beforeInstalled = beforeManifest ? parseManifest(cwd, beforeManifest) : structuredClone(EMPTY);
    const afterInstalled = parseManifest(cwd, afterManifest);
    const files = data.files.map(raw => {
      const item = object(raw);
      exactKeys(item, ["path", "before", "after"], "transaction file");
      if (typeof item.path !== "string") throw new Error("Invalid transaction file.");
      safePath(cwd, item.path);
      const before = base64(item.before, "transaction before bytes"); const after = base64(item.after, "transaction after bytes");
      if ((before === null && after === null) || (before !== null && after !== null && before.equals(after))) throw new Error("Invalid transaction file.");
      const beforeEntry = beforeInstalled.files.find(entry => entry.path === item.path);
      const afterEntry = afterInstalled.files.find(entry => entry.path === item.path);
      if ((before === null ? beforeEntry !== undefined : beforeEntry?.base !== sha(before)) || (after === null ? afterEntry !== undefined : afterEntry?.base !== sha(after))) throw new Error("Transaction bytes do not match its manifests.");
      return { path: item.path, before: before?.toString("base64") ?? null, after: after?.toString("base64") ?? null };
    });
    if (new Set(files.map(file => file.path)).size !== files.length) throw new Error("Duplicate transaction destinations.");
    const all = [...files, { path: MANIFEST, before: beforeManifest?.toString("base64") ?? null, after: afterManifest.toString("base64") }];
    for (const file of all) {
      const current = bytes(cwd, file.path, file.path === MANIFEST)?.toString("base64") ?? null;
      if (current !== file.before && current !== file.after) throw new Error(`Recovery stopped: ${file.path} has later edits. Preserve those edits before retrying.`);
    }
    if (rollback) {
      for (const file of all) {
        if (file.before === null) { const path = safePath(cwd, file.path, file.path === MANIFEST); if (existsSync(path)) unlinkSync(path); }
        else atomic(cwd, file.path, Buffer.from(file.before, "base64"), file.path === MANIFEST);
      }
      unlinkSync(safePath(cwd, JOURNAL, true));
    }
    return { pending: !rollback, paths: files.map(file => file.path) };
  }, true);
}
