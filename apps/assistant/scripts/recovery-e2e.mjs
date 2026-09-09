// All API traffic is intercepted, including when the target app has a live model configured.
// AI_REFERENCE_BASE=http://localhost:3211 node apps/assistant/scripts/recovery-e2e.mjs
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const base = new URL(process.env.AI_REFERENCE_BASE || "http://localhost:3211");
assert.ok(["http:", "https:"].includes(base.protocol), "Use an HTTP application address.");
const artifacts = resolve(process.env.AI_REFERENCE_RECOVERY_ARTIFACTS || "/tmp/vlak-assistant-recovery-e2e");
mkdirSync(artifacts, { recursive: true });
const passed = []; const failures = [];
const pause = milliseconds => new Promise(done => setTimeout(done, milliseconds));
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
async function until(condition, message) {
  const end = Date.now() + 10_000;
  while (Date.now() < end) { if (await condition()) return; await pause(25); }
  throw new Error(message);
}
const fixtureFile = { id: "file-one", name: "brief.txt", size: 5, mediaType: "text/plain", url: "/api/uploads/file-one" };
const originalQuestion = "A new request after the previous conversation";
function seed() {
  return { id: "conversation-one", title: "Previous conversation", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", tasks: [], versions: [], messages: [
    { id: "old-user", role: "user", parts: [{ type: "text", text: "Previous question" }] },
    { id: "old-answer", role: "assistant", metadata: { outcome: "complete" }, parts: [{ type: "text", text: "Previous answer" }] },
  ] };
}
function messageStream(id, text) {
  const chunks = [{ type: "start", messageId: id }, { type: "text-start", id: "text" }, { type: "text-delta", id: "text", delta: text }, { type: "text-end", id: "text" }, { type: "finish", finishReason: "stop" }];
  return { status: 200, headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" }, body: `${chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n` };
}
function saveReply(state, request, text, outcome = "complete") {
  const id = `answer-${state.chatCalls.length}`;
  if (!state.conversation.messages.some(message => message.id === request.requestId)) {
    state.conversation.messages.push({ id: request.requestId, role: "user", parts: [
      { type: "text", text: request.text },
      ...(request.uploadIds?.map(fileId => ({ type: "file", filename: fixtureFile.name, mediaType: fixtureFile.mediaType, url: `/api/uploads/${fileId}` })) ?? []),
    ] });
  }
  state.conversation.messages.push({ id, role: "assistant", metadata: { outcome }, parts: [{ type: "text", text }] });
  return messageStream(id, text);
}
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || chromium.executablePath() });

async function scenario(name, handlers, run) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", serviceWorkers: "block" });
  const page = await context.newPage(); page.setDefaultTimeout(10_000);
  const state = { conversation: seed(), chatCalls: [], stopCalls: [], uploads: 0, reads: 0, unexpected: [], errors: [], aborted: new Set(), closing: false };
  const pageError = error => state.errors.push(error.message);
  const requestFailed = request => { if (new URL(request.url()).pathname.startsWith("/api/")) state.aborted.add(request); };
  page.on("pageerror", pageError); page.on("requestfailed", requestFailed);
  await context.route("**/*", async route => {
    const request = route.request(); const url = new URL(request.url());
    const json = (body, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
    try {
      if (url.origin !== base.origin || (!url.pathname.startsWith("/api/") && !["GET", "HEAD"].includes(request.method()))) {
        state.unexpected.push(`${request.method()} ${url.origin}${url.pathname}`); await route.abort("blockedbyclient"); return;
      }
      if (!url.pathname.startsWith("/api/")) { await route.continue(); return; }
      let response;
      if (url.pathname === "/api/conversations" && request.method() === "GET") {
        response = json({ configured: true, mode: "fixture", model: "intercepted-recovery-test", conversations: [{ id: state.conversation.id, title: state.conversation.title, updatedAt: state.conversation.updatedAt }] });
      } else if (url.pathname === `/api/conversations/${state.conversation.id}` && request.method() === "GET") {
        state.reads++; response = json({ conversation: state.conversation });
      } else if (url.pathname === "/api/chat" && request.method() === "POST" && handlers.chat) {
        const body = request.postDataJSON(); state.chatCalls.push(body); response = await handlers.chat({ state, body, json });
      } else if (url.pathname === "/api/uploads" && request.method() === "POST" && handlers.upload) {
        state.uploads++; response = await handlers.upload({ state, json });
      } else if (url.pathname === "/api/chat/stop" && request.method() === "POST") {
        const body = request.postDataJSON(); state.stopCalls.push(body); response = handlers.stop ? await handlers.stop({ state, body, json }) : json({ stopped: false });
      } else {
        state.unexpected.push(`${request.method()} ${url.pathname}`); await route.abort("blockedbyclient"); return;
      }
      await route.fulfill(response);
    } catch (error) {
      // A held upload is intentionally cancelled in the lifecycle scenarios.
      if (!state.closing && !state.aborted.has(request)) state.errors.push(`Mock route failed: ${error.message}`);
    }
  });
  try {
    await page.goto(base.href, { waitUntil: "networkidle" });
    const input = page.getByRole("textbox", { name: "Message", exact: true });
    const composer = page.locator(".rs-message-composer");
    const newConversation = page.getByRole("button", { name: "New conversation", exact: true });
    await input.waitFor(); await until(() => newConversation.isEnabled(), "Initial conversation did not settle.");
    await run({ page, state, input, composer, newConversation });
    assert.deepEqual(state.unexpected, [], "Unexpected requests were blocked; no API request is allowed to reach the real server.");
    assert.deepEqual(state.errors, [], "Browser or mock route errors occurred.");
    passed.push(name); console.log(`Passed ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`); console.error(failures.at(-1));
    await page.screenshot({ path: resolve(artifacts, `${name.replace(/\W+/g, "-")}.png`), fullPage: true }).catch(() => {});
  } finally {
    state.closing = true; handlers.release?.();
    page.off("pageerror", pageError); page.off("requestfailed", requestFailed);
    await context.close();
  }
}

async function retryScenario(preserveChanges) {
  const retry = deferred();
  await scenario(preserveChanges ? "retry preserves later draft and file changes" : "retry keeps intent and id then clears the submitted draft", {
    release: () => retry.resolve(),
    upload: ({ json }) => json({ files: [fixtureFile] }, 201),
    chat: async ({ state, body, json }) => {
      if (state.chatCalls.length === 1) return json({ error: "The intercepted first request failed before acceptance." }, 503);
      if (preserveChanges) await retry.promise;
      return saveReply(state, body, "The retried request succeeded.");
    },
  }, async ({ page, state, input, composer, newConversation }) => {
    await composer.locator('input[type="file"]').setInputFiles({ name: fixtureFile.name, mimeType: fixtureFile.mediaType, buffer: Buffer.from("brief") });
    await input.fill(originalQuestion); await input.press("Enter");
    const retryButton = page.getByRole("button", { name: "Retry response", exact: true });
    await retryButton.waitFor(); await until(() => newConversation.isEnabled(), "The failed request did not release its operation lock.");
    assert.equal(await input.inputValue(), originalQuestion, "The initial failure should preserve the draft.");
    await retryButton.click(); await until(() => state.chatCalls.length === 2, "Retry did not send a second intercepted request.");
    assert.equal(state.chatCalls[1].intent, "submit", "Retry must not regenerate an older answer.");
    assert.equal(state.chatCalls[1].text, originalQuestion);
    assert.ok(state.chatCalls[0].requestId, "Submission needs a stable request id.");
    assert.equal(state.chatCalls[1].requestId, state.chatCalls[0].requestId);
    assert.deepEqual(state.chatCalls[1].uploadIds, [fixtureFile.id]);
    assert.equal(state.uploads, 1, "Retry should reuse the uploaded file instead of uploading it again.");
    if (preserveChanges) {
      await input.fill("A different draft written while retrying");
      await composer.getByRole("button", { name: `Remove ${fixtureFile.name}`, exact: true }).click();
      await composer.locator('input[type="file"]').setInputFiles({ name: "next.txt", mimeType: "text/plain", buffer: Buffer.from("next") });
    }
    retry.resolve();
    await page.getByText("The retried request succeeded.", { exact: true }).waitFor();
    await until(() => newConversation.isEnabled(), "The successful retry did not settle.");
    await until(async () => await input.inputValue() === (preserveChanges ? "A different draft written while retrying" : ""), "Successful retry cleared newer text or retained the submitted draft.");
    assert.equal(await retryButton.count(), 0);
    assert.equal(await composer.getByRole("button", { name: `Remove ${fixtureFile.name}`, exact: true }).count(), 0, "The original attachment should clear or be replaced.");
    assert.equal(await composer.getByRole("button", { name: "Remove next.txt", exact: true }).count(), preserveChanges ? 1 : 0);
  });
  retry.resolve();
}

async function uploadScenario(leavePage) {
  const upload = deferred();
  await scenario(leavePage ? "leaving the page aborts upload without sending" : "upload locks navigation and Stop aborts before sending", {
    release: () => upload.resolve(),
    upload: async ({ json }) => { await upload.promise; return json({ files: [fixtureFile] }, 201); },
    chat: ({ state, body }) => saveReply(state, body, "This response must never be requested."),
  }, async ({ page, state, input, composer, newConversation }) => {
    await composer.locator('input[type="file"]').setInputFiles({ name: fixtureFile.name, mimeType: fixtureFile.mediaType, buffer: Buffer.from("brief") });
    await input.fill("Review this upload"); await input.press("Enter");
    await until(() => state.uploads === 1, "The upload did not start.");
    await until(async () => !(await newConversation.isEnabled()), "Navigation stayed enabled while uploading.");
    assert.equal(await page.getByRole("button", { name: "Previous conversation", exact: true }).isEnabled(), false);
    if (leavePage) await page.goto("about:blank");
    else await page.getByRole("button", { name: "Stop response", exact: true }).click();
    await until(() => [...state.aborted].some(request => new URL(request.url()).pathname === "/api/uploads"), "The pending upload was not aborted.");
    upload.resolve(); await pause(150);
    assert.equal(state.chatCalls.length, 0, "A cancelled upload must never start a chat request.");
    if (!leavePage) {
      await until(() => newConversation.isEnabled(), "Upload cancellation did not release the busy state.");
      assert.equal(await input.inputValue(), "Review this upload", "Cancelled upload should retain the draft.");
    }
  });
  upload.resolve();
}

async function stopScenario() {
  const firstReply = deferred(); const stopReply = deferred();
  await scenario("pending Stop holds the next turn until persistence settles", {
    release: () => { firstReply.resolve(); stopReply.resolve(); },
    chat: async ({ state, body }) => {
      if (state.chatCalls.length === 1) { await firstReply.promise; return saveReply(state, body, "The first response stopped.", "stopped"); }
      return saveReply(state, body, "The next request completed.");
    },
    stop: async ({ json }) => { await stopReply.promise; return json({ stopped: true }); },
  }, async ({ page, state, input, newConversation }) => {
    await input.fill("Start the first response"); await input.press("Enter");
    await until(() => state.chatCalls.length === 1, "The first request did not start.");
    await page.getByRole("button", { name: "Stop response", exact: true }).click();
    await until(() => state.stopCalls.length === 1, "Stop did not contact the intercepted stop endpoint.");
    const reads = state.reads; firstReply.resolve();
    await page.getByText("The first response stopped.", { exact: true }).waitFor();
    await until(() => state.reads > reads, "The ended stream did not refresh saved history.");
    await until(() => input.isEnabled(), "The completed send did not release its draft field.");
    assert.equal(await newConversation.isEnabled(), false, "A pending Stop must keep navigation and new turns locked.");
    await input.fill("Start the next response"); await input.press("Enter"); await pause(100);
    assert.equal(state.chatCalls.length, 1, "Enter started another request before the previous Stop completed.");
    stopReply.resolve(); await until(() => newConversation.isEnabled(), "Stop did not release its lock after refreshing.");
    await input.press("Enter");
    await page.getByText("The next request completed.", { exact: true }).waitFor();
    await until(() => newConversation.isEnabled(), "The next request did not complete.");
    assert.equal(state.chatCalls.length, 2);
    assert.equal([...state.aborted].filter(request => new URL(request.url()).pathname === "/api/chat").length, 0, "The previous Stop aborted a subsequent chat request.");
  });
  firstReply.resolve(); stopReply.resolve();
}

try {
  await retryScenario(false);
  await retryScenario(true);
  await uploadScenario(false);
  await uploadScenario(true);
  await stopScenario();
} finally { await browser.close(); }
writeFileSync(resolve(artifacts, "report.json"), `${JSON.stringify({ base: base.origin, passed, failures }, null, 2)}\n`);
console.log(JSON.stringify({ passed, failures, artifacts }, null, 2));
if (failures.length) process.exitCode = 1;
