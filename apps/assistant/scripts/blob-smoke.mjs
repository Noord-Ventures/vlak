import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

if (process.env.AI_REFERENCE_BLOB_TEST !== "1") throw new Error("Set AI_REFERENCE_BLOB_TEST=1 to verify the configured private Blob store.");
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  const env = await readFile(new URL("../.env.blob-test.local", import.meta.url), "utf8");
  const value = env.split("\n").find(line => line.startsWith("BLOB_READ_WRITE_TOKEN="))?.slice("BLOB_READ_WRITE_TOKEN=".length);
  assert.ok(value, "A private Blob token must be configured.");
  process.env.BLOB_READ_WRITE_TOKEN = value.startsWith('"') ? JSON.parse(value) : value;
}
const prefix = `vlak-verification/${randomUUID()}`;
process.env.AI_REFERENCE_BLOB_PREFIX = prefix;
process.env.AI_REFERENCE_STORAGE = "blob";
process.env.AI_REFERENCE_MODE = "fixture";
process.env.AI_REFERENCE_APPROVAL_SECRET = randomUUID() + randomUUID();
const { list, del } = await import("@vercel/blob");
const server = await import("../lib/server.ts");
const base = "https://assistant.example";
const request = (path, cookie, body) => new Request(`${base}${path}`, { method: body === undefined ? "GET" : "POST", headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
let cookie;
const load = async id => { const response = await server.conversationGet(request(`/api/conversations/${id}`, cookie), id); assert.equal(response.status, 200); return (await response.json()).conversation; };
const chat = async body => { const response = await server.chatPost(request("/api/chat", cookie, body)); assert.equal(response.status, 200, response.status === 200 ? "" : await response.text()); await response.text(); };
try {
  const session = await server.conversationsGet(request("/api/conversations"));
  assert.equal(session.status, 200); cookie = session.headers.get("set-cookie").split(";")[0];
  const config = await session.json(); assert.equal(config.storage, "private-blob"); assert.equal(config.uploadLimits.maxFileBytes, 3 * 1024 * 1024);
  const created = await server.conversationsPost(request("/api/conversations", cookie, {})); assert.equal(created.status, 201);
  const { conversation } = await created.json();
  await chat({ conversationId: conversation.id, intent: "submit", requestId: randomUUID(), text: "Create one task for the launch review" });
  const pending = await load(conversation.id); assert.equal(pending.tasks.length, 0);
  const part = pending.messages.flatMap(message => message.parts).find(part => part.type === "tool-createTask" && part.state === "approval-requested"); assert.ok(part);
  await chat({ conversationId: conversation.id, intent: "approve", approvalId: part.approval.id, approved: true });
  const approved = await load(conversation.id); assert.equal(approved.tasks.length, 1);
  assert.ok(approved.messages.every(message => message.id));
  const form = new FormData(); form.append("files", new File(["Owned private source"], "brief.md"));
  const uploaded = await server.uploadsPost(new Request(`${base}/api/uploads`, { method: "POST", headers: { Origin: base, Cookie: cookie }, body: form })); assert.equal(uploaded.status, 201);
  const file = (await uploaded.json()).files[0];
  const downloaded = await server.uploadGet(request(file.url, cookie), file.id); assert.equal(await downloaded.text(), "Owned private source");
  const response = await server.chatPost(request("/api/chat", cookie, { conversationId: conversation.id, intent: "submit", text: "Review the launch brief [slow]" })); assert.equal(response.status, 200);
  let firstText; const started = new Promise(resolve => { firstText = resolve; });
  const finished = (async () => { const reader = response.body.getReader(); let body = ""; while (true) { const result = await reader.read(); if (result.done) break; body += new TextDecoder().decode(result.value); if (body.includes('"type":"text-delta"')) firstText(); } return body; })();
  await Promise.race([started, new Promise((_, reject) => setTimeout(() => reject(new Error("No fixture text arrived.")), 30_000).unref())]);
  // Simulate another Vercel worker: the stop route cannot find the stream's in-process controller.
  globalThis.__vlakReferenceRuns.clear();
  const stopped = await server.chatStop(request("/api/chat/stop", cookie, { conversationId: conversation.id }));
  assert.equal(stopped.status, 200, stopped.status === 200 ? "" : await stopped.text()); assert.equal((await stopped.json()).stopped, true);
  await finished;
  assert.equal((await load(conversation.id)).messages.at(-1).metadata.outcome, "stopped");
  await chat({ conversationId: conversation.id, intent: "submit", text: "Review the launch brief again" });
  assert.equal((await load(conversation.id)).messages.at(-1).metadata.outcome, "complete");
  console.log(JSON.stringify({ result: "pass", checks: ["private hosted routes", "persisted signed approval", "exactly one task", "owned upload", "cross-worker stop", "new turn after stop"] }));
} finally {
  let cursor; let removed = 0;
  do {
    const result = await list({ prefix: `${prefix}/`, cursor });
    if (result.blobs.length) { await del(result.blobs.map(blob => blob.url)); removed += result.blobs.length; }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
  console.log(JSON.stringify({ cleanup: "complete", objects: removed }));
}
