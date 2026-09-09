import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

if (process.env.AI_REFERENCE_LIVE_TEST !== "1") {
  throw new Error("Live verification is opt-in. Set AI_REFERENCE_LIVE_TEST=1 to use the configured server model.");
}
const base = new URL(process.env.AI_REFERENCE_URL || "http://localhost:3211");
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error("This smoke check is limited to a local reference server.");
let cookie = "";
async function request(path, body) {
  const response = await fetch(new URL(path, base), {
    method: body === undefined ? "GET" : "POST",
    headers: { Origin: base.origin, ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(180_000),
  });
  const issued = response.headers.get("set-cookie");
  if (issued) cookie = issued.split(";")[0];
  if (!response.ok) { await response.body?.cancel(); throw new Error(`${path} returned HTTP ${response.status}.`); }
  return response;
}
async function json(path, body) { return (await request(path, body)).json(); }
async function stream(body) {
  const response = await request("/api/chat", body);
  const text = await response.text();
  const chunks = text.split("\n").filter(line => line.startsWith("data: ") && line !== "data: [DONE]").map(line => JSON.parse(line.slice(6)));
  assert.ok(!chunks.some(chunk => chunk.type === "error"), "The live stream returned an error.");
  return chunks;
}
async function conversation(id) { return (await json(`/api/conversations/${id}`)).conversation; }
function partsOf(conversation) { return conversation.messages.flatMap(message => message.parts); }
function responseText(conversation) { return conversation.messages.filter(message => message.role === "assistant").flatMap(message => message.parts).filter(part => part.type === "text").map(part => part.text).join("\n"); }
const configuration = await json("/api/conversations");
assert.equal(configuration.mode, "live", "This server is not configured for live responses.");
assert.equal(configuration.configured, true, "The live server is not configured.");
const { conversation: created } = await json("/api/conversations", {});
await stream({ conversationId: created.id, intent: "submit", requestId: randomUUID(), text: "Read the built-in project-brief with readBrief and summarize its three review areas in one short sentence. Do not create tasks." });
let saved = await conversation(created.id);
assert.ok(partsOf(saved).some(part => part.type === "tool-readBrief" && part.state === "output-available"), "The built-in brief did not return a successful tool result.");
assert.ok(responseText(saved).trim().length > 0, "The live model did not return text.");
const usage = saved.messages.at(-1)?.metadata?.usage;
assert.ok(typeof usage?.inputTokens === "number" && typeof usage?.outputTokens === "number", "Reported live usage is missing.");
assert.equal(saved.tasks.length, 0);
console.log(JSON.stringify({ check: "live brief", result: "pass", model: configuration.model, reportedUsage: true }));
await stream({ conversationId: created.id, intent: "submit", requestId: randomUUID(), text: "Create exactly one task titled Verify the launch checklist. Call createTask now and let the approval system ask me before saving it." });
saved = await conversation(created.id);
const approval = partsOf(saved).find(part => part.type === "tool-createTask" && part.state === "approval-requested");
assert.ok(approval?.approval?.id, "The model did not request task approval.");
assert.equal(saved.tasks.length, 0, "A task was saved before approval.");
console.log(JSON.stringify({ check: "live approval boundary", result: "pass", tasksBeforeApproval: 0 }));
await stream({ conversationId: created.id, intent: "approve", approvalId: approval.approval.id, approved: true });
saved = await conversation(created.id);
assert.equal(saved.tasks.length, 1, "Approval did not create exactly one task.");
assert.equal(saved.tasks[0].toolCallId, approval.toolCallId);
assert.ok(partsOf(saved).some(part => part.type === "tool-createTask" && part.state === "output-available"), "The approved task did not return its result.");
assert.ok(saved.messages.at(-1)?.parts.some(part => part.type === "text" && part.text.trim()), "The model did not reply after approval.");
console.log(JSON.stringify({ check: "live approved task", result: "pass", tasksAfterApproval: 1 }));
if (process.env.AI_REFERENCE_LIVE_STOP === "1") {
  const response = await request("/api/chat", { conversationId: created.id, intent: "submit", requestId: randomUUID(), text: "Write a detailed 30-item launch review checklist based on the brief. Do not call tools or create tasks. Start listing immediately." });
  const reader = response.body.getReader();
  const decoder = new TextDecoder(); let buffer = ""; let sawText = false;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    if (buffer.includes('"type":"text-delta"')) { sawText = true; break; }
  }
  const stopped = await json("/api/chat/stop", { conversationId: created.id });
  while (!(await reader.read()).done) {}
  reader.releaseLock();
  saved = await conversation(created.id);
  if (stopped.stopped) assert.equal(saved.messages.at(-1)?.metadata?.outcome, "stopped");
  assert.equal(saved.tasks.length, 1);
  console.log(JSON.stringify({ check: "live stop", result: stopped.stopped ? "pass" : "response already finished", sawText, persistedOutcome: saved.messages.at(-1)?.metadata?.outcome }));
}
