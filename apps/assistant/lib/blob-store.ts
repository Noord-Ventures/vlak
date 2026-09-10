import { createHmac, randomUUID } from "node:crypto";
import { BlobError, BlobPreconditionFailedError, del, get, put } from "@vercel/blob";
import { checkedId, ReferenceAppError, validateUpload } from "./file-store.ts";
import type { ReferenceConversation, ReferenceTask, StoredUpload } from "./types.ts";

/** Conditional writes and uncached private reads are required, never CDN reads. */
export interface PrivateObjectStore {
  read(key: string): Promise<{ bytes: Uint8Array; etag: string } | null>;
  write(key: string, bytes: Uint8Array, etag?: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}
export const privateBlobObjects: PrivateObjectStore = {
  async read(key) {
    // Compression changes large responses to weak ETags, which cannot satisfy If-Match.
    const result = await get(key, { access: "private", useCache: false, headers: { "Accept-Encoding": "identity" } });
    if (!result) return null;
    if (!result.stream) throw new Error("Private storage returned no body.");
    if (!result.blob.etag || result.blob.etag.startsWith("W/")) throw new Error("Private storage must return a strong ETag for conditional writes.");
    return { bytes: new Uint8Array(await new Response(result.stream).arrayBuffer()), etag: result.blob.etag };
  },
  async write(key, bytes, etag) {
    try {
      await put(key, Buffer.from(bytes), { access: "private", addRandomSuffix: false, contentType: "application/octet-stream", ...(etag ? { allowOverwrite: true, ifMatch: etag } : { allowOverwrite: false }) });
      return true;
    } catch (error) {
      // The SDK exposes ETag conflicts as a class, but put-if-absent collisions as BlobError.
      if (error instanceof BlobPreconditionFailedError || (error instanceof BlobError && error.message.startsWith("Vercel Blob: This blob already exists,"))) return false;
      throw error;
    }
  },
  async remove(key) { await del(key); },
};

type Lease = { token: string; expiresAt: number; stop: boolean };
type ConversationRecord = { conversation: ReferenceConversation; lease?: Lease };
type OwnerRecord = { conversations: string[]; uploads: StoredUpload[] };
const ROOT = "vlak-reference/v1";
const LEASE_MS = 5 * 60_000; // Longer than both the 120-second model and 180-second function timeout.
const emptyOwner = (): OwnerRecord => ({ conversations: [], uploads: [] });
const cleanIds = (conversation: ReferenceConversation) => {
  const seen = new Set<string>();
  for (const message of conversation.messages) { if (!message.id || seen.has(message.id)) message.id = randomUUID(); seen.add(message.id); }
  return conversation;
};
const boundedSetting = (name: string, fallback: number, maximum: number) => {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
};

/** Each record update is a compare-and-swap, including quotas and task idempotency. */
export function createBlobStore(objects: PrivateObjectStore, now = Date.now, prefix = ROOT) {
  const keyForOwner = (owner: string) => `${prefix}/owners/${checkedId(owner)}`;
  const keyForConversation = (owner: string, id: string) => `${keyForOwner(owner)}/conversations/${checkedId(id)}`;
  async function read<T>(key: string) {
    const object = await objects.read(key);
    return object ? { value: JSON.parse(new TextDecoder().decode(object.bytes)) as T, etag: object.etag } : null;
  }
  async function update<T>(key: string, initial: () => T, operation: (value: T) => void) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const current = await read<T>(key);
      const value = current?.value ?? initial();
      operation(value);
      if (await objects.write(key, new TextEncoder().encode(JSON.stringify(value)), current?.etag)) return value;
      await new Promise(resolve => setTimeout(resolve, Math.min(attempt * 5, 35)));
    }
    throw new ReferenceAppError(409, "Storage is busy. Try again shortly.");
  }
  async function record(owner: string, id: string) {
    const result = await read<ConversationRecord>(keyForConversation(owner, id));
    if (!result) throw new ReferenceAppError(404, "Not found.");
    return result.value;
  }
  const missing = (): never => { throw new ReferenceAppError(404, "Not found."); };
  const updateConversation = (owner: string, id: string, operation: (value: ConversationRecord) => void) => update(keyForConversation(owner, id), missing, operation);
  async function readConversation(owner: string, id: string) { return (await record(owner, id)).conversation; }
  async function saveConversation(owner: string, conversation: ReferenceConversation) {
    cleanIds(conversation);
    await updateConversation(owner, conversation.id, current => {
      // Executed tasks survive stale stream snapshots and restoring message history.
      current.conversation = { ...conversation, updatedAt: new Date(now()).toISOString(), tasks: current.conversation.tasks };
    });
  }
  async function listConversations(owner: string) {
    const index = (await read<OwnerRecord>(keyForOwner(owner)))?.value ?? emptyOwner();
    const records = await Promise.all(index.conversations.map(id => readConversation(owner, id)));
    return records.map(({ id, title, updatedAt }) => ({ id, title, updatedAt })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async function reserveBudget(name: string, count: number, limit: number, message: string) {
    await update(`${prefix}/limits/${name}`, () => ({ used: 0 }), value => {
      if (value.used + count > limit) throw new ReferenceAppError(429, message);
      value.used = Math.max(0, value.used + count);
    });
  }
  async function createConversation(owner: string) {
    const date = new Date(now()).toISOString();
    const conversation: ReferenceConversation = { id: randomUUID(), title: "New conversation", createdAt: date, updatedAt: date, messages: [], tasks: [], versions: [] };
    await update(keyForConversation(owner, conversation.id), () => ({ conversation }), () => {});
    let reserved = false;
    try {
      await update(keyForOwner(owner), emptyOwner, value => {
        if (value.conversations.length >= 100) throw new ReferenceAppError(409, "This session has reached its conversation limit.");
        value.conversations.push(conversation.id);
      });
      reserved = true;
      await reserveBudget(`conversations-${date.slice(0, 10)}`, 1, 500, "The shared demo has reached its daily conversation limit. Try again tomorrow.");
    } catch (error) {
      if (reserved) await update(keyForOwner(owner), emptyOwner, value => { value.conversations = value.conversations.filter(id => id !== conversation.id); });
      await objects.remove(keyForConversation(owner, conversation.id));
      throw error;
    }
    return conversation;
  }
  async function lockConversation(owner: string, id: string) {
    const token = randomUUID();
    await updateConversation(owner, id, value => {
      if (value.lease && value.lease.expiresAt > now()) throw new ReferenceAppError(409, "A response is already running. Wait for it to finish or stop it first.");
      value.lease = { token, expiresAt: now() + LEASE_MS, stop: false };
    });
    return async () => { await updateConversation(owner, id, value => { if (value.lease?.token === token) delete value.lease; }); };
  }
  async function requestStop(owner: string, id: string) {
    let running = false;
    await updateConversation(owner, id, value => {
      running = !!value.lease && value.lease.expiresAt > now();
      if (running && value.lease) value.lease.stop = true;
    });
    return running;
  }
  async function runState(owner: string, id: string) {
    const lease = (await record(owner, id)).lease;
    return { running: !!lease && lease.expiresAt > now(), stop: lease?.stop ?? false };
  }
  async function createTaskOnce(owner: string, id: string, toolCallId: string, title: string): Promise<ReferenceTask> {
    const task: ReferenceTask = { id: randomUUID(), title, status: "open", createdAt: new Date(now()).toISOString(), toolCallId };
    const value = await updateConversation(owner, id, value => {
      if (!value.conversation.tasks.some(task => task.toolCallId === toolCallId)) value.conversation.tasks.push(task);
    });
    return value.conversation.tasks.find(task => task.toolCallId === toolCallId)!;
  }
  async function snapshotConversation(owner: string, conversation: ReferenceConversation) {
    const version = { id: randomUUID(), createdAt: new Date(now()).toISOString() };
    const key = `${keyForConversation(owner, conversation.id)}/versions/${version.id}`;
    await update(key, () => conversation, () => {});
    const retired = conversation.versions.slice(19);
    const versions = [version, ...conversation.versions].slice(0, 20);
    try { await updateConversation(owner, conversation.id, value => { value.conversation.versions = versions; }); }
    catch (error) { await objects.remove(key); throw error; }
    conversation.versions = versions;
    // The durable index must stop referencing old versions before their objects are removed.
    for (const old of retired) await objects.remove(`${keyForConversation(owner, conversation.id)}/versions/${checkedId(old.id)}`);
  }
  async function restoreConversation(owner: string, id: string, versionId: string) {
    const release = await lockConversation(owner, id);
    try {
      const current = await readConversation(owner, id);
      if (!current.versions.some(version => version.id === versionId)) throw new ReferenceAppError(404, "Version not found.");
      const previous = await read<ReferenceConversation>(`${keyForConversation(owner, id)}/versions/${checkedId(versionId)}`);
      if (!previous) throw new ReferenceAppError(404, "Version not found.");
      await snapshotConversation(owner, current);
      current.messages = previous.value.messages; current.title = previous.value.title;
      await saveConversation(owner, current);
      return await readConversation(owner, id);
    } finally { await release(); }
  }
  async function saveUploads(owner: string, files: File[]) {
    if (files.length < 1 || files.length > 4 || files.reduce((sum, file) => sum + file.size, 0) > 4 * 1024 * 1024) throw new ReferenceAppError(413, "Choose up to four files totaling at most 4 MB for the hosted demo.");
    const uploads = files.map(file => {
      if (file.size > 3 * 1024 * 1024) throw new ReferenceAppError(413, "Each hosted file must contain 1 byte to 3 MB.");
      const mediaType = validateUpload(file); const id = randomUUID();
      // biome-ignore lint/suspicious/noControlCharactersInRegex: Sanitize filenames before response headers and display.
      return { id, name: file.name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").slice(0, 180) || "Attachment", mediaType, size: file.size, url: `/api/uploads/${id}` };
    });
    const bytes = uploads.reduce((sum, file) => sum + file.size, 0);
    // Reserve before uploading: simultaneous requests cannot exceed session quotas.
    await update(keyForOwner(owner), emptyOwner, value => {
      if (value.uploads.length + uploads.length > 100 || value.uploads.reduce((sum, file) => sum + file.size, 0) + bytes > 50 * 1024 * 1024) throw new ReferenceAppError(413, "The session upload limit is 100 files or 50 MB.");
      value.uploads.push(...uploads);
    });
    let reserved = false;
    try {
      await reserveBudget("upload-bytes", bytes, 256 * 1024 * 1024, "The shared demo has reached its upload storage limit.");
      reserved = true;
      for (const [index, file] of files.entries()) {
        const path = `${keyForOwner(owner)}/uploads/${uploads[index]!.id}`;
        if (!await objects.write(path, new Uint8Array(await file.arrayBuffer()))) throw new ReferenceAppError(409, "Upload storage conflicted. Attach the file again.");
      }
    } catch (error) {
      await Promise.all(uploads.map(upload => objects.remove(`${keyForOwner(owner)}/uploads/${upload.id}`)));
      await update(keyForOwner(owner), emptyOwner, value => { value.uploads = value.uploads.filter(file => !uploads.some(upload => upload.id === file.id)); });
      if (reserved) await reserveBudget("upload-bytes", -bytes, 256 * 1024 * 1024, "");
      throw error;
    }
    return uploads;
  }
  async function readUpload(owner: string, id: string) {
    const index = (await read<OwnerRecord>(keyForOwner(owner)))?.value;
    const metadata = index?.uploads.find(file => file.id === checkedId(id));
    if (!metadata) throw new ReferenceAppError(404, "Not found.");
    const object = await objects.read(`${keyForOwner(owner)}/uploads/${checkedId(id)}`);
    if (!object) throw new ReferenceAppError(404, "Upload is unavailable. Attach the file again.");
    return { ...metadata, bytes: Buffer.from(object.bytes) };
  }
  async function consumeModelBudget(owner: string) {
    const day = new Date(now()).toISOString().slice(0, 10);
    await reserveBudget(`session-${checkedId(owner)}-${day}`, 1, boundedSetting("AI_REFERENCE_SESSION_DAILY_REQUESTS", 20, 100), "This session has reached its daily response limit. Try again tomorrow.");
    await reserveBudget(`model-${day}`, 1, boundedSetting("AI_REFERENCE_DAILY_REQUESTS", 200, 1000), "The shared demo has reached its daily response limit. Try again tomorrow.");
  }
  async function approvalSecret(owner: string, conversationId: string) {
    const secret = process.env.AI_REFERENCE_APPROVAL_SECRET;
    if (!secret || secret.length < 32) throw new ReferenceAppError(503, "The hosted approval secret is not configured.");
    return createHmac("sha256", secret).update(`${checkedId(owner)}:${checkedId(conversationId)}`).digest("hex");
  }
  return { approvalSecret, listConversations, createConversation, readConversation, saveConversation, lockConversation, createTaskOnce, snapshotConversation, restoreConversation, saveUploads, readUpload, requestStop, runState, consumeModelBudget };
}
export const blobStore = createBlobStore(privateBlobObjects, Date.now, process.env.AI_REFERENCE_BLOB_PREFIX || ROOT);
