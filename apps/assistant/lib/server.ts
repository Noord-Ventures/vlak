import { randomBytes, randomUUID } from "node:crypto";
import { createAgentUIStreamResponse, createUIMessageStream, createUIMessageStreamResponse, consumeStream, isToolUIPart, type UIMessageStreamOnEndCallback } from "ai";
import { z } from "zod";
import { createReferenceAgent, referenceConfiguration, resolveMessageFiles } from "./agent.ts";
import { checkedId, consumeModelBudget, conversationRunState, createConversation, dataDirectory, listConversations, lockConversation, monitorConversationStop, ownerId, readConversation, readUpload, ReferenceAppError, requestConversationStop, restoreConversation, saveConversation, saveUploads, snapshotConversation, uploadLimits, usesBlobStorage } from "./store.ts";
import type { ChatIntent, ReferenceConversation, ReferenceMessage } from "./types.ts";

type ActiveRun = { controller: AbortController; done: Promise<void>; finish: () => void };
const runtimeState = globalThis as typeof globalThis & { __vlakReferenceRuns?: Map<string, ActiveRun> };
const activeRuns = runtimeState.__vlakReferenceRuns ?? new Map<string, ActiveRun>();
runtimeState.__vlakReferenceRuns = activeRuns;
const runKey = (owner: string, id: string) => `${dataDirectory()}:${owner}:${id}`;
const COOKIE = "vlak-reference-session";
const tokenPattern = /^[a-f0-9]{64}$/;
const idSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/);
export const chatIntentSchema = z.discriminatedUnion("intent", [
  z.object({ conversationId: idSchema, intent: z.literal("submit"), requestId: idSchema.optional(), text: z.string().max(8000), uploadIds: z.array(idSchema).max(4).optional() }),
  z.object({ conversationId: idSchema, intent: z.literal("approve"), approvalId: idSchema, approved: z.boolean() }),
  z.object({ conversationId: idSchema, intent: z.literal("edit"), messageId: idSchema, text: z.string().trim().min(1).max(8000) }),
  z.object({ conversationId: idSchema, intent: z.literal("regenerate"), messageId: idSchema.optional() }),
]);
export function assertSameOrigin(request: Request) {
  const expected = new URL(request.url).origin;
  if (request.headers.get("origin") !== expected || request.headers.get("sec-fetch-site") === "cross-site") throw new ReferenceAppError(403, "Requests must come from this application.");
}
function session(request: Request, create: boolean) {
  const existing = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (existing && tokenPattern.test(existing)) return { owner: ownerId(existing), cookie: undefined };
  if (!create) throw new ReferenceAppError(401, "Open the conversation list to start a local session.");
  const token = randomBytes(32).toString("hex");
  return { owner: ownerId(token), cookie: `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` };
}
export async function readLimitedBody(request: Request, limit: number) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > limit) throw new ReferenceAppError(413, "The request is too large.");
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const result = await reader.read(); if (result.done) break; size += result.value.byteLength; if (size > limit) { await reader.cancel(); throw new ReferenceAppError(413, "The request is too large."); } chunks.push(result.value); } }
  finally { reader.releaseLock(); }
  const body = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; } return body;
}
async function requestJson(request: Request) {
  try { return JSON.parse(new TextDecoder().decode(await readLimitedBody(request, 64 * 1024))); }
  catch (error) { if (error instanceof ReferenceAppError) throw error; throw new ReferenceAppError(400, "Send a valid JSON request."); }
}
function jsonResponse(body: unknown, status = 200) { return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
async function handle(request: Request, createSession: boolean, operation: (owner: string) => Promise<Response>) {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") assertSameOrigin(request);
    const identity = session(request, createSession);
    const response = await operation(identity.owner);
    response.headers.set("Cache-Control", "no-store");
    if (identity.cookie) response.headers.append("Set-Cookie", identity.cookie);
    return response;
  } catch (error) {
    if (error instanceof ReferenceAppError) return jsonResponse({ error: error.message }, error.status);
    if (error instanceof z.ZodError) return jsonResponse({ error: "The request contains invalid fields." }, 400);
    return jsonResponse({ error: "The local assistant could not complete the request. Try again." }, 500);
  }
}
export function conversationsGet(request: Request) { return handle(request, true, async owner => jsonResponse({ conversations: await listConversations(owner), ...referenceConfiguration(), uploadLimits: uploadLimits(), storage: usesBlobStorage() ? "private-blob" : "local" })); }
export function conversationsPost(request: Request) { return handle(request, true, async owner => jsonResponse({ conversation: await createConversation(owner) }, 201)); }
export function conversationGet(request: Request, id: string) { return handle(request, false, async owner => jsonResponse({ conversation: await readConversation(owner, checkedId(id)) })); }
export function conversationRestore(request: Request, id: string) { return handle(request, false, async owner => { const body = z.object({ versionId: idSchema }).parse(await requestJson(request)); return jsonResponse({ conversation: await restoreConversation(owner, checkedId(id), body.versionId) }); }); }
export function uploadsPost(request: Request) {
  return handle(request, false, async owner => {
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new ReferenceAppError(400, "Upload files as multipart form data.");
    const bytes = await readLimitedBody(request, uploadLimits().maxTotalBytes + 64 * 1024);
    let form: FormData;
    try { form = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type")! }, body: bytes }).formData(); }
    catch { throw new ReferenceAppError(400, "The upload form could not be read."); }
    const conversationId = form.get("conversationId");
    if (typeof conversationId === "string") await readConversation(owner, checkedId(conversationId));
    const files = form.getAll("files");
    if (files.some(file => typeof file === "string")) throw new ReferenceAppError(400, "The files field must contain files.");
    return jsonResponse({ files: await saveUploads(owner, files as File[]) }, 201);
  });
}
export function uploadGet(request: Request, id: string) {
  return handle(request, false, async owner => {
    const upload = await readUpload(owner, checkedId(id));
    return new Response(new Uint8Array(upload.bytes), { headers: {
      "Content-Type": upload.mediaType,
      "Content-Length": String(upload.size),
      "Content-Disposition": `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(upload.name)}`,
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "X-Content-Type-Options": "nosniff",
    } });
  });
}
function pendingApprovals(conversation: ReferenceConversation) { return conversation.messages.flatMap(message => message.parts).filter(part => isToolUIPart(part) && part.state === "approval-requested"); }
export async function applyIntent(owner: string, conversation: ReferenceConversation, intent: ChatIntent) {
  if (intent.intent === "submit") {
    const previous = intent.requestId ? conversation.messages.find(message => message.id === intent.requestId) : undefined;
    if (previous) {
      const text = previous.parts.filter(part => part.type === "text").map(part => part.text).join("");
      const uploads = previous.parts.filter(part => part.type === "file").map(part => part.url);
      if (previous.role !== "user" || text !== intent.text.trim() || JSON.stringify(uploads) !== JSON.stringify([...new Set(intent.uploadIds ?? [])].map(id => `/api/uploads/${id}`))) throw new ReferenceAppError(409, "This request ID belongs to a different message.");
      return conversation.messages.at(-1)?.id === previous.id ? "resume" as const : "replay" as const;
    }
    if (pendingApprovals(conversation).length) throw new ReferenceAppError(409, "Approve or decline the pending task before sending another message.");
    if (!intent.text.trim() && !intent.uploadIds?.length) throw new ReferenceAppError(400, "Write a message or attach a file.");
    if (conversation.messages.length >= 100) throw new ReferenceAppError(409, "Start a new conversation to continue.");
    const uploads = await Promise.all([...new Set(intent.uploadIds ?? [])].map(id => readUpload(owner, id)));
    const parts: ReferenceMessage["parts"] = [{ type: "text", text: intent.text.trim() }, ...uploads.map(upload => ({ type: "file" as const, filename: upload.name, mediaType: upload.mediaType, url: upload.url }))];
    conversation.messages.push({ id: intent.requestId ?? randomUUID(), role: "user", parts });
    if (conversation.title === "New conversation") conversation.title = (intent.text.trim() || uploads[0]?.name || "Files for review").slice(0, 72);
  } else if (intent.intent === "approve") {
    const last = conversation.messages.at(-1);
    const part = last?.role === "assistant" ? last.parts.find(part => part.type === "tool-createTask" && (part.state === "approval-requested" || part.state === "approval-responded") && part.approval.id === intent.approvalId) : undefined;
    if (part?.type !== "tool-createTask" || (part.state !== "approval-requested" && part.state !== "approval-responded")) throw new ReferenceAppError(409, "This approval is no longer pending. Reload the conversation.");
    if (part.state === "approval-responded" && part.approval.approved !== intent.approved) throw new ReferenceAppError(409, "This approval already has a different decision.");
    Object.assign(part, { state: "approval-responded", approval: { ...part.approval, approved: intent.approved } });
  } else {
    let index: number;
    if (intent.intent === "edit") index = conversation.messages.findIndex(message => message.id === intent.messageId && message.role === "user");
    else index = intent.messageId ? conversation.messages.findIndex(message => message.id === intent.messageId && message.role === "assistant") : conversation.messages.at(-1)?.role === "user" ? conversation.messages.length : conversation.messages.map(message => message.role).lastIndexOf("assistant");
    if (index < 0 || (intent.intent === "regenerate" && !conversation.messages.slice(0, index).some(message => message.role === "user"))) throw new ReferenceAppError(400, "Choose an existing message to revise.");
    await snapshotConversation(owner, conversation);
    if (intent.intent === "edit") {
      const message = conversation.messages[index]!;
      message.parts = [{ type: "text", text: intent.text }, ...message.parts.filter(part => part.type === "file")];
      conversation.messages = conversation.messages.slice(0, index + 1);
    } else conversation.messages = conversation.messages.slice(0, index);
  }
  await saveConversation(owner, conversation);
}
export function chatPost(request: Request) {
  return handle(request, false, async owner => {
    const intent = chatIntentSchema.parse(await requestJson(request));
    const unlock = await lockConversation(owner, intent.conversationId);
    let complete!: () => void;
    const run: ActiveRun = { controller: new AbortController(), done: new Promise<void>(resolve => { complete = resolve; }), finish: () => complete() };
    const key = runKey(owner, intent.conversationId);
    activeRuns.set(key, run);
    const stopMonitoring = monitorConversationStop(owner, intent.conversationId, run.controller);
    const abort = () => run.controller.abort();
    request.signal.addEventListener("abort", abort, { once: true });
    if (request.signal.aborted) abort();
    const release = async () => { stopMonitoring(); request.signal.removeEventListener("abort", abort); try { await unlock(); } finally { if (activeRuns.get(key) === run) activeRuns.delete(key); run.finish(); } };
    try {
      const config = referenceConfiguration();
      if (!config.configured) throw new ReferenceAppError(503, "Set OPENAI_API_KEY on the server to use the live assistant.");
      const conversation = await readConversation(owner, intent.conversationId);
      const applied = await applyIntent(owner, conversation, intent);
      if (applied === "replay") {
        return createUIMessageStreamResponse({ consumeSseStream: ({ stream }) => { void consumeStream({ stream, onError: () => {} }); }, stream: createUIMessageStream<ReferenceMessage>({ originalMessages: conversation.messages, onEnd: release, execute({ writer }) { writer.write({ type: "start", messageId: conversation.messages.at(-1)!.id }); writer.write({ type: "finish" }); } }) });
      }
      let streamFailed = false;
      const finish: UIMessageStreamOnEndCallback<ReferenceMessage> = async ({ messages, responseMessage, isAborted, outcome }) => {
        try {
          responseMessage.metadata = { ...responseMessage.metadata, mode: config.mode, model: config.model, outcome: isAborted || run.controller.signal.aborted ? "stopped" : streamFailed || outcome.status === "failed" ? "error" : "complete" };
          conversation.messages = messages; await saveConversation(owner, conversation);
        } finally { await release(); }
      };
      const consumeSseStream = ({ stream }: { stream: ReadableStream<string> }) => { void consumeStream({ stream, onError: () => {} }); };
      if (intent.intent === "approve" && pendingApprovals(conversation).length) {
        return createUIMessageStreamResponse({ consumeSseStream, stream: createUIMessageStream<ReferenceMessage>({ originalMessages: conversation.messages, onEnd: finish, execute({ writer }) { writer.write({ type: "start", messageId: conversation.messages.at(-1)!.id }); writer.write({ type: "tool-approval-response", approvalId: intent.approvalId, approved: intent.approved }); writer.write({ type: "finish" }); } }) });
      }
      if (config.mode === "live") await consumeModelBudget(owner);
      const agent = await createReferenceAgent(owner, conversation.id);
      return await createAgentUIStreamResponse({
        agent, uiMessages: await resolveMessageFiles(owner, conversation.messages), originalMessages: conversation.messages,
        generateMessageId: randomUUID,
        abortSignal: run.controller.signal, timeout: { totalMs: 120_000 }, consumeSseStream,
        sendReasoning: false,
        onError: () => { streamFailed = true; return "The response could not be completed. Your saved conversation is available to retry."; },
        messageMetadata: ({ part }) => part.type === "finish" ? { mode: config.mode, model: config.model, ...(config.mode === "live" ? { usage: { inputTokens: part.totalUsage.inputTokens, outputTokens: part.totalUsage.outputTokens, reasoningTokens: part.totalUsage.outputTokenDetails.reasoningTokens, cachedInputTokens: part.totalUsage.inputTokenDetails.cacheReadTokens } } : {}) } : undefined,
        onEnd: finish,
      });
    } catch (error) { await release(); throw error; }
  });
}

export function chatStop(request: Request) {
  return handle(request, false, async owner => {
    const { conversationId } = z.object({ conversationId: idSchema }).parse(await requestJson(request));
    await readConversation(owner, conversationId);
    const run = activeRuns.get(runKey(owner, conversationId));
    const sharedRun = await requestConversationStop(owner, conversationId);
    if (!run && !sharedRun) return jsonResponse({ stopped: false });
    run?.controller.abort();
    const waitForRun = run?.done ?? (async () => {
      const deadline = Date.now() + 10_000;
      while ((await conversationRunState(owner, conversationId)).running) {
        if (Date.now() >= deadline) throw new ReferenceAppError(503, "Stopping is still in progress. Reload the conversation shortly.");
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    })();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try { await Promise.race([waitForRun, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new ReferenceAppError(503, "Stopping is still in progress. Reload the conversation shortly.")), 10_000); })]); }
    finally { clearTimeout(timer); }
    return jsonResponse({ stopped: true });
  });
}
