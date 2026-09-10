import assert from "node:assert/strict";
import { test } from "node:test";
import { createBlobStore, type PrivateObjectStore } from "../lib/blob-store.ts";
import { ReferenceAppError } from "../lib/file-store.ts";

function memoryObjects() {
  const records = new Map<string, { bytes: Uint8Array; etag: string }>(); let sequence = 0;
  const objects: PrivateObjectStore = {
    async read(key) { const result = records.get(key); return result ? { bytes: result.bytes.slice(), etag: result.etag } : null; },
    async write(key, bytes, etag) {
      const current = records.get(key);
      if (etag ? current?.etag !== etag : !!current) return false;
      records.set(key, { bytes: bytes.slice(), etag: String(++sequence) }); return true;
    },
    async remove(key) { records.delete(key); },
  };
  return { objects, records };
}

test("independent workers preserve ownership, task idempotency, and tasks across stale history and restore", async () => {
  const { objects } = memoryObjects(); const first = createBlobStore(objects); const second = createBlobStore(objects);
  const conversation = await first.createConversation("owner");
  await assert.rejects(second.readConversation("other-owner", conversation.id), (error: unknown) => error instanceof ReferenceAppError && error.status === 404);
  conversation.messages = [{ id: "user", role: "user", parts: [{ type: "text", text: "Original request" }] }];
  await first.saveConversation("owner", conversation);
  await first.snapshotConversation("owner", conversation);
  conversation.messages[0]!.parts = [{ type: "text", text: "Edited request" }];
  await first.saveConversation("owner", conversation);
  const tasks = await Promise.all([first.createTaskOnce("owner", conversation.id, "tool-call", "Task"), second.createTaskOnce("owner", conversation.id, "tool-call", "Different title")]);
  assert.equal(tasks[0]!.id, tasks[1]!.id);
  await first.saveConversation("owner", conversation);
  assert.equal((await second.readConversation("owner", conversation.id)).tasks.length, 1);
  const restored = await second.restoreConversation("owner", conversation.id, conversation.versions[0]!.id);
  assert.deepEqual(restored.messages[0]!.parts, [{ type: "text", text: "Original request" }]);
  assert.equal(restored.tasks[0]!.id, tasks[0]!.id);
  assert.equal((await first.listConversations("owner")).length, 1);
});

test("concurrent leases exclude other workers, cancellation is shared, and old releases cannot unlock a replacement", async () => {
  let now = 1_000;
  const { objects } = memoryObjects(); const first = createBlobStore(objects, () => now); const second = createBlobStore(objects, () => now);
  const conversation = await first.createConversation("owner");
  const releases = await Promise.allSettled([first.lockConversation("owner", conversation.id), second.lockConversation("owner", conversation.id)]);
  assert.equal(releases.filter(result => result.status === "fulfilled").length, 1);
  const original = releases.find(result => result.status === "fulfilled"); assert.ok(original?.status === "fulfilled");
  assert.equal(await second.requestStop("owner", conversation.id), true);
  assert.deepEqual(await first.runState("owner", conversation.id), { running: true, stop: true });
  now += 5 * 60_000 + 1;
  const replacement = await second.lockConversation("owner", conversation.id);
  await original.value();
  assert.deepEqual(await first.runState("owner", conversation.id), { running: true, stop: false });
  await replacement(); assert.equal((await first.runState("owner", conversation.id)).running, false);
});

test("hosted uploads are owned and bounded, including concurrent session reservations", async () => {
  const { objects, records } = memoryObjects(); const first = createBlobStore(objects); const second = createBlobStore(objects);
  const uploads = await first.saveUploads("owner", [new File(["source"], "brief.md")]);
  assert.equal((await second.readUpload("owner", uploads[0]!.id)).bytes.toString(), "source");
  await assert.rejects(second.readUpload("other-owner", uploads[0]!.id));
  await assert.rejects(first.saveUploads("owner", [new File([new Uint8Array(3 * 1024 * 1024 + 1)], "large.txt", { type: "text/plain" })]), /3 MB/);
  await assert.rejects(first.saveUploads("owner", [new File(["<html>"], "page.html", { type: "text/html" })]), /Choose a text/);
  for (let index = 0; index < 24; index++) await first.saveUploads("owner", [0, 1, 2, 3].map(index => new File(["x"], `${index}.txt`)));
  const results = await Promise.allSettled([first.saveUploads("owner", [new File(["x"], "last.txt"), new File(["x"], "last2.txt")]), second.saveUploads("owner", [new File(["x"], "last.txt"), new File(["x"], "last2.txt")])]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  const failure = results.find(result => result.status === "rejected"); assert.ok(failure?.status === "rejected");
  assert.match(failure.reason.message, /session upload limit/);
  const capacity = () => JSON.parse(new TextDecoder().decode(records.get("vlak-reference/v1/limits/upload-bytes")!.bytes)).used;
  const before = capacity();
  await assert.rejects(first.saveUploads("owner", [new File(["x"], "full.txt"), new File(["x"], "full2.txt")]));
  assert.equal(capacity(), before, "owner quota rejection must not charge shared capacity");
});

test("failed private writes compensate upload reservations and full owners do not consume shared conversation capacity", async () => {
  const { objects, records } = memoryObjects(); let rejectFiles = true;
  const store = createBlobStore({ ...objects, async write(key, bytes, etag) { return rejectFiles && key.includes("/uploads/") ? false : objects.write(key, bytes, etag); } });
  await assert.rejects(store.saveUploads("owner", [new File(["source"], "brief.txt")]), /conflicted/);
  const owner = JSON.parse(new TextDecoder().decode(records.get("vlak-reference/v1/owners/owner")!.bytes));
  assert.equal(owner.uploads.length, 0);
  assert.equal(JSON.parse(new TextDecoder().decode(records.get("vlak-reference/v1/limits/upload-bytes")!.bytes)).used, 0);
  rejectFiles = false;
  await store.saveUploads("owner", [new File(["source"], "brief.txt")]);
  for (let index = 0; index < 100; index++) await store.createConversation("owner");
  const budgetKey = [...records.keys()].find(key => key.includes("/limits/conversations-"))!;
  const before = JSON.parse(new TextDecoder().decode(records.get(budgetKey)!.bytes)).used;
  await assert.rejects(store.createConversation("owner"), /conversation limit/);
  assert.equal(JSON.parse(new TextDecoder().decode(records.get(budgetKey)!.bytes)).used, before);
  assert.equal([...records.keys()].filter(key => key.includes("/conversations/")).length, 100);
});

test("daily model quotas cannot be bypassed by simultaneous workers and reset on the next UTC day", async () => {
  let now = Date.parse("2026-09-10T12:00:00Z");
  const { objects } = memoryObjects(); const store = createBlobStore(objects, () => now);
  for (let index = 0; index < 19; index++) await store.consumeModelBudget("owner");
  const attempts = await Promise.allSettled([store.consumeModelBudget("owner"), store.consumeModelBudget("owner")]);
  assert.equal(attempts.filter(result => result.status === "fulfilled").length, 1);
  now += 24 * 60 * 60_000;
  await store.consumeModelBudget("owner");
});

test("version retention deletes old private objects and approval secrets are stable and owner scoped", async () => {
  const { objects, records } = memoryObjects(); const first = createBlobStore(objects); const second = createBlobStore(objects);
  const conversation = await first.createConversation("owner");
  for (let index = 0; index < 24; index++) await first.snapshotConversation("owner", conversation);
  assert.equal(conversation.versions.length, 20);
  assert.equal([...records.keys()].filter(key => key.includes("/versions/")).length, 20);
  const previous = process.env.AI_REFERENCE_APPROVAL_SECRET;
  try {
    process.env.AI_REFERENCE_APPROVAL_SECRET = "a".repeat(64);
    const firstSecret = await first.approvalSecret("owner", conversation.id);
    assert.equal(firstSecret, await second.approvalSecret("owner", conversation.id));
    assert.notEqual(firstSecret, await second.approvalSecret("other-owner", conversation.id));
    delete process.env.AI_REFERENCE_APPROVAL_SECRET;
    await assert.rejects(first.approvalSecret("owner", conversation.id), /not configured/);
  } finally { if (previous === undefined) delete process.env.AI_REFERENCE_APPROVAL_SECRET; else process.env.AI_REFERENCE_APPROVAL_SECRET = previous; }
});

test("a failed edited-history save leaves every committed version restorable", async () => {
  const { objects, records } = memoryObjects(); let failEditedHistory = false;
  const store = createBlobStore({ ...objects, async write(key, bytes, etag) {
    if (failEditedHistory && !key.includes("/versions/") && new TextDecoder().decode(bytes).includes("Edited request")) throw new Error("Injected history write outage");
    return objects.write(key, bytes, etag);
  } });
  const conversation = await store.createConversation("owner");
  conversation.messages = [{ id: "user", role: "user", parts: [{ type: "text", text: "Original request" }] }];
  await store.saveConversation("owner", conversation);
  for (let index = 0; index < 21; index++) await store.snapshotConversation("owner", conversation);
  conversation.messages[0]!.parts = [{ type: "text", text: "Edited request" }];
  failEditedHistory = true;
  await assert.rejects(store.saveConversation("owner", conversation), /Injected history write outage/);
  const current = await store.readConversation("owner", conversation.id);
  assert.equal(current.versions.length, 20);
  for (const version of current.versions) assert.ok(records.has(`vlak-reference/v1/owners/owner/conversations/${conversation.id}/versions/${version.id}`));
  const restored = await store.restoreConversation("owner", conversation.id, current.versions.at(-1)!.id);
  assert.deepEqual(restored.messages[0]!.parts, [{ type: "text", text: "Original request" }]);
});
