import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile, rename, unlink, link, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { ReferenceConversation, ReferenceTask, StoredUpload } from "./types.ts";

export class ReferenceAppError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
const validId = /^[a-zA-Z0-9_-]{1,128}$/;
export function checkedId(value: string) { if (!validId.test(value)) throw new ReferenceAppError(400, "Invalid identifier."); return value; }
export function dataDirectory() { return resolve(process.env.AI_REFERENCE_DATA_DIR || ".data"); }
export function ownerId(token: string) { return createHash("sha256").update(token).digest("hex"); }
function ownerDirectory(owner: string) { return join(dataDirectory(), "owners", checkedId(owner)); }
function conversationPath(owner: string, id: string) { return join(ownerDirectory(owner), "conversations", `${checkedId(id)}.json`); }
async function json<T>(path: string): Promise<T> { try { return JSON.parse(await readFile(path, "utf8")) as T; } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new ReferenceAppError(404, "Not found."); throw error; } }
async function atomicJson(path: string, value: unknown) {
  await mkdir(resolve(path, ".."), { recursive: true, mode: 0o700 });
  const temp = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temp, JSON.stringify(value), { mode: 0o600 }); await rename(temp, path); }
  finally { await unlink(temp).catch(() => {}); }
}
async function filesAt(path: string) { try { return await readdir(path); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; } }
export async function approvalSecret(owner: string, conversationId: string) {
  const root = dataDirectory(); await mkdir(root, { recursive: true, mode: 0o700 });
  const path = join(root, ".approval-secret");
  try { await writeFile(path, randomBytes(32), { flag: "wx", mode: 0o600 }); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
  return createHmac("sha256", await readFile(path)).update(`${checkedId(owner)}:${checkedId(conversationId)}`).digest("hex");
}
export async function listConversations(owner: string) {
  const paths = await filesAt(join(ownerDirectory(owner), "conversations"));
  const items = await Promise.all(paths.filter(path => path.endsWith(".json")).map(path => json<ReferenceConversation>(join(ownerDirectory(owner), "conversations", path))));
  return items.map(({ id, title, updatedAt }) => ({ id, title, updatedAt })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function createConversation(owner: string): Promise<ReferenceConversation> {
  if ((await listConversations(owner)).length >= 100) throw new ReferenceAppError(409, "This local session has reached its conversation limit.");
  const now = new Date().toISOString();
  const conversation: ReferenceConversation = { id: randomUUID(), title: "New conversation", createdAt: now, updatedAt: now, messages: [], tasks: [], versions: [] };
  await saveConversation(owner, conversation); return conversation;
}
function needsMessageIds(conversation: ReferenceConversation) {
  const seen = new Set<string>();
  for (const message of conversation.messages) { if (!message.id || seen.has(message.id)) return true; seen.add(message.id); }
  return false;
}
async function conversationRecord(owner: string, id: string): Promise<ReferenceConversation> {
  const path = conversationPath(owner, id);
  for (let attempt = 0; attempt < 100; attempt++) {
    const conversation = await json<ReferenceConversation>(path);
    if (!needsMessageIds(conversation)) return conversation;
    // A pre-upgrade stream may still own this history. Its next completed read repairs it.
    try { await stat(`${path}.lock`); return conversation; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    const repair = `${path}.repair-lock`;
    try { await writeFile(repair, "repairing", { flag: "wx", mode: 0o600 }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; await new Promise(resolve => setTimeout(resolve, 10)); continue; }
    try {
      const current = await json<ReferenceConversation>(path);
      if (needsMessageIds(current)) {
        const seen = new Set<string>();
        for (const message of current.messages) { if (!message.id || seen.has(message.id)) message.id = randomUUID(); seen.add(message.id); }
        await atomicJson(path, current);
      }
      return current;
    } finally { await unlink(repair).catch(() => {}); }
  }
  throw new ReferenceAppError(409, "Conversation history is being updated. Try again.");
}
export async function readConversation(owner: string, id: string): Promise<ReferenceConversation> {
  const conversation = await conversationRecord(owner, id);
  const taskPaths = await filesAt(join(ownerDirectory(owner), "tasks", checkedId(id)));
  conversation.tasks = await Promise.all(taskPaths.filter(path => path.endsWith(".json")).map(path => json<ReferenceTask>(join(ownerDirectory(owner), "tasks", id, path))));
  return conversation;
}
export async function saveConversation(owner: string, conversation: ReferenceConversation) {
  const seen = new Set<string>();
  for (const message of conversation.messages) { if (!message.id || seen.has(message.id)) message.id = randomUUID(); seen.add(message.id); }
  await atomicJson(conversationPath(owner, conversation.id), { ...conversation, updatedAt: new Date().toISOString(), tasks: [] });
}
/** File locks prevent simultaneous turns even across separate local server workers. */
export async function lockConversation(owner: string, id: string) {
  await readConversation(owner, id);
  const path = `${conversationPath(owner, id)}.lock`;
  const token = randomUUID();
  try { await writeFile(path, token, { flag: "wx", mode: 0o600 }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if (Date.now() - (await stat(path)).mtimeMs > 5 * 60_000) { await unlink(path); return lockConversation(owner, id); }
    throw new ReferenceAppError(409, "A response is already running. Wait for it to finish or stop it first.");
  }
  let released = false;
  return async () => { if (released) return; released = true; try { if (await readFile(path, "utf8") === token) await unlink(path); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; } };
}
export async function createTaskOnce(owner: string, conversationId: string, toolCallId: string, title: string): Promise<ReferenceTask> {
  await readConversation(owner, conversationId);
  const key = createHash("sha256").update(toolCallId).digest("hex");
  const path = join(ownerDirectory(owner), "tasks", checkedId(conversationId), `${key}.json`);
  await mkdir(resolve(path, ".."), { recursive: true, mode: 0o700 });
  const task: ReferenceTask = { id: randomUUID(), title, status: "open", createdAt: new Date().toISOString(), toolCallId };
  const temp = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(task), { mode: 0o600 });
    try { await link(temp, path); return task; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; return await json<ReferenceTask>(path); }
  } finally { await unlink(temp).catch(() => {}); }
}
export async function snapshotConversation(owner: string, conversation: ReferenceConversation) {
  const version = { id: randomUUID(), createdAt: new Date().toISOString() };
  const directory = join(ownerDirectory(owner), "versions", conversation.id);
  await atomicJson(join(directory, `${version.id}.json`), conversation);
  const versions = [version, ...conversation.versions];
  for (const old of versions.slice(20)) await unlink(join(directory, `${checkedId(old.id)}.json`)).catch(() => {});
  conversation.versions = versions.slice(0, 20);
}
export async function restoreConversation(owner: string, id: string, versionId: string) {
  const release = await lockConversation(owner, id);
  try {
    const current = await readConversation(owner, id);
    if (!current.versions.some(version => version.id === versionId)) throw new ReferenceAppError(404, "Version not found.");
    const previous = await json<ReferenceConversation>(join(ownerDirectory(owner), "versions", checkedId(id), `${checkedId(versionId)}.json`));
    await snapshotConversation(owner, current);
    current.messages = previous.messages; current.title = previous.title;
    await saveConversation(owner, current);
    return await readConversation(owner, id);
  } finally { await release(); }
}
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 4;
export const UPLOAD_TYPES = new Set(["text/plain", "text/markdown", "text/csv", "application/json", "application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"]);
export function validateUpload(file: { name: string; size: number; type: string }) {
  if (!file.size || file.size > MAX_FILE_BYTES) throw new ReferenceAppError(413, "Each file must contain 1 byte to 5 MB.");
  const extension = file.name.toLowerCase().split(".").at(-1) ?? "";
  const mediaType = (file.type === "application/octet-stream" ? "" : file.type) || ({ txt: "text/plain", md: "text/markdown", markdown: "text/markdown", csv: "text/csv", json: "application/json" } as Record<string, string>)[extension] || "";
  if (!UPLOAD_TYPES.has(mediaType)) throw new ReferenceAppError(415, "Choose a text, Markdown, CSV, JSON, PDF, PNG, JPEG, WebP, or GIF file.");
  return mediaType;
}
export async function saveUploads(owner: string, files: File[]): Promise<StoredUpload[]> {
  if (files.length < 1 || files.length > MAX_UPLOAD_FILES || files.reduce((sum, file) => sum + file.size, 0) > MAX_UPLOAD_BYTES) throw new ReferenceAppError(413, "Choose up to four files totaling at most 12 MB.");
  const mediaTypes = files.map(validateUpload);
  const directory = join(ownerDirectory(owner), "uploads");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const quotaLock = join(directory, ".upload-lock");
  try { await writeFile(quotaLock, "locked", { flag: "wx", mode: 0o600 }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new ReferenceAppError(409, "Another upload is in progress. Try again."); throw error; }
  try {
  const existing = await filesAt(directory);
  const metadata = await Promise.all(existing.filter(name => name.endsWith(".json")).map(name => json<StoredUpload>(join(directory, name))));
  if (metadata.length + files.length > 100 || metadata.reduce((sum, file) => sum + file.size, 0) + files.reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) throw new ReferenceAppError(413, "The local session upload limit is 100 files or 50 MB.");
  const result: StoredUpload[] = [];
  for (const [index, file] of files.entries()) {
    const id = randomUUID();
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Remove control characters from uploaded filenames before headers and display.
    const upload: StoredUpload = { id, name: file.name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").slice(0, 180) || "Attachment", mediaType: mediaTypes[index]!, size: file.size, url: `/api/uploads/${id}` };
    await writeFile(join(directory, `${id}.bin`), new Uint8Array(await file.arrayBuffer()), { mode: 0o600 });
    await atomicJson(join(directory, `${id}.json`), upload); result.push(upload);
  }
  return result;
  } finally { await unlink(quotaLock).catch(() => {}); }
}
export async function readUpload(owner: string, id: string) {
  const directory = join(ownerDirectory(owner), "uploads");
  const metadata = await json<StoredUpload>(join(directory, `${checkedId(id)}.json`));
  const bytes = await readFile(join(directory, `${id}.bin`));
  return { ...metadata, bytes };
}
