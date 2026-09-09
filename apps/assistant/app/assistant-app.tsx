"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, } from "ai";
import {
  Attachment, Attachments, Button, Chat, Confirmation, ContextUsage,
  MessageComposer, Reasoning, Response, ResponseActions, Suggestion,
  Suggestions, Textarea, ToolCall, Widget, WidgetEmbed, getToolCallPresentation,
} from "@noorddev/vlak-react";
import type { ReferenceConversation as ConversationData, ReferenceMessage as UIMessage, StoredUpload as UploadedFile } from "../lib/types";
import { ResponseMarkdown } from "@noorddev/vlak-react/components/response-markdown";
import { AiAvatar } from "../../www/components/ai-avatar";

type Summary = { id: string; title: string; updatedAt: string };
type Configuration = { mode: "live" | "fixture"; model?: string; configured?: boolean };
type OptimisticRequest = { text: string; files?: UploadedFile[]; messageId?: string; id?: string };

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The request could not complete. Try again.");
  return data as T;
}

function plainText(message: UIMessage) {
  return message.parts.filter(part => part.type === "text").map(part => part.text).join("\n");
}

function problem(error: unknown) {
  if (!(error instanceof Error)) return "The request could not complete. Try again.";
  try { const data = JSON.parse(error.message); return typeof data.error === "string" ? data.error : error.message; }
  catch { return error.message; }
}

function exportConversation(conversation: ConversationData, messages: UIMessage[]) {
  const content = messages.map(message => `## ${message.role === "user" ? "You" : "Assistant"}\n\n${plainText(message)}`).join("\n\n");
  const url = URL.createObjectURL(new Blob([`# ${conversation.title}\n\n${content}\n`], { type: "text/markdown" }));
  const link = document.createElement("a");
  link.href = url; link.download = `conversation-${conversation.id}.md`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AssistantApp() {
  const [conversations, setConversations] = React.useState<Summary[]>([]);
  const [selected, setSelected] = React.useState<ConversationData | null>(null);
  const [configuration, setConfiguration] = React.useState<Configuration>({ mode: "live" });
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const selection = React.useRef(0);
  const loadList = React.useCallback(async () => {
    const result = await request<Configuration & { conversations: Summary[] }>("/api/conversations");
    setConversations(result.conversations); setConfiguration(result);
    return result.conversations;
  }, []);

  const open = React.useCallback(async (id: string) => {
    const version = ++selection.current;
    setLoading(true); setError("");
    try {
      const result = await request<{ conversation: ConversationData }>(`/api/conversations/${id}`);
      if (version === selection.current) setSelected(result.conversation);
    } catch (reason) { if (version === selection.current) setError(problem(reason)); }
    finally { if (version === selection.current) setLoading(false); }
  }, []);

  const create = React.useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await request<{ conversation: ConversationData }>("/api/conversations", { method: "POST" });
      setSelected(result.conversation); await loadList();
    } catch (reason) { setError(problem(reason)); }
    finally { setLoading(false); }
  }, [loadList]);

  React.useEffect(() => {
    let mounted = true;
    void loadList().then(async list => {
      if (!mounted) return;
      const requested = new URL(window.location.href).searchParams.get("conversation");
      const match = list.find(item => item.id === requested) ?? list[0];
      if (match) await open(match.id);
      else await create();
    }).catch(reason => { if (mounted) { setError(problem(reason)); setLoading(false); } });
    return () => { mounted = false; };
  }, [create, loadList, open]);

  React.useEffect(() => {
    if (!selected) return;
    const url = new URL(window.location.href); url.searchParams.set("conversation", selected.id);
    window.history.replaceState(null, "", url);
  }, [selected]);

  return <div className="assistant-shell">
    <a className="assistant-skip" href="#assistant-main">Skip to conversation</a>
    <header className="assistant-heading">
      <div><h1>Vlak assistant</h1><p>{configuration.mode === "fixture" ? "Recorded model · Protocol test mode" : "Live model · AI SDK reference app"}</p></div>
      <div className="assistant-tools">
        <a href="https://vlak.dev/ai/">Component library</a>
        <Button variant="ghost" disabled={busy || loading} onClick={() => void create()}>New conversation</Button>
      </div>
    </header>
    <div className="assistant-grid">
      <aside className="assistant-history" aria-label="Saved conversations">
        <h2>Conversations</h2>
        <nav aria-label="Conversation history">{conversations.map(item => <Button key={item.id} variant="subtle" aria-current={item.id === selected?.id ? "page" : undefined} disabled={busy || loading} onClick={() => void open(item.id)}>{item.title}</Button>)}</nav>
      </aside>
      <main id="assistant-main" className="assistant-main" tabIndex={-1}>
        {error && <div role="alert" className="assistant-alert"><p>{error}</p><Button variant="ghost" onClick={() => void loadList().then(list => list.length ? open(list[0]!.id) : create()).catch(reason => setError(problem(reason)))}>Retry connection</Button></div>}
        {loading && <p role="status">Loading conversation…</p>}
        {selected && !loading && <ConversationView key={selected.id} initial={selected} configuration={configuration} onBusy={setBusy} onUpdated={loadList} />}
      </main>
    </div>
  </div>;
}

function ConversationView({ initial, configuration, onBusy, onUpdated }: {
  initial: ConversationData; configuration: Configuration; onBusy: (busy: boolean) => void; onUpdated: () => Promise<Summary[]>;
}) {
  const [conversation, setConversation] = React.useState(initial);
  const [draft, setDraft] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [failure, setFailure] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [stoppedId, setStoppedId] = React.useState<string | null>(null);
  const [waiting, setWaiting] = React.useState(false);
  const [stopping, setStopping] = React.useState(false);
  const [version, setVersion] = React.useState("");
  const lastRequest = React.useRef<{ intent: Record<string, unknown>; optimistic?: OptimisticRequest } | null>(null);
  const failedDraft = React.useRef<{ text: string; files: File[] } | null>(null);
  const streamError = React.useRef("");
  const actionLocked = React.useRef(false);
  const stopLocked = React.useRef(false);
  const uploadController = React.useRef<AbortController | null>(null);
  const mounted = React.useRef(true);
  const composer = React.useRef<HTMLTextAreaElement>(null);
  const transport = React.useMemo(() => new DefaultChatTransport<UIMessage>({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ body }) => ({ body: { conversationId: initial.id, ...body } }),
  }), [initial.id]);
  const chat = useChat<UIMessage>({
    id: initial.id, messages: initial.messages, transport,
    onError: error => { streamError.current = problem(error); setFailure(problem(error)); },
  });
  const generating = chat.status === "submitted" || chat.status === "streaming";
  const busy = generating || waiting || stopping;
  React.useEffect(() => { onBusy(busy); return () => onBusy(false); }, [busy, onBusy]);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false; uploadController.current?.abort();
      if (actionLocked.current) void fetch("/api/chat/stop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: initial.id }), keepalive: true }).catch(() => {});
      void chat.stop();
    };
  }, [chat.stop, initial.id]);

  async function refresh() {
    const result = await request<{ conversation: ConversationData }>(`/api/conversations/${initial.id}`);
    setConversation(result.conversation); chat.setMessages(result.conversation.messages);
    await onUpdated();
    return result.conversation;
  }

  async function run(intent: Record<string, unknown>, optimistic?: OptimisticRequest, ownsLock = false) {
    if ((!ownsLock && actionLocked.current) || stopLocked.current || !mounted.current) return;
    actionLocked.current = true; setWaiting(true); setFailure(""); setStoppedId(null); chat.clearError(); streamError.current = "";
    lastRequest.current = { intent, optimistic };
    try {
      if (intent.intent === "regenerate") {
        await chat.regenerate({ messageId: intent.messageId as string | undefined, body: intent });
      } else if (optimistic) {
        await chat.sendMessage({ ...(optimistic.id ? { id: optimistic.id } : {}), messageId: optimistic.messageId, role: "user", parts: [
          { type: "text", text: optimistic.text },
          ...(optimistic.files?.map(file => ({ type: "file" as const, url: new URL(file.url, window.location.origin).href, mediaType: file.mediaType, filename: file.name })) ?? []),
        ],
        }, { body: intent });
      } else await chat.sendMessage(undefined, { body: intent });
      await refresh();
      if (streamError.current) throw new Error(streamError.current);
      lastRequest.current = null;
    } catch (reason) {
      setFailure(problem(reason));
      throw reason;
    } finally { actionLocked.current = false; setWaiting(false); }
  }

  async function send(message: { text: string; files: File[] }) {
    if (actionLocked.current || stopLocked.current) throw new Error("Wait for the current request to finish.");
    actionLocked.current = true; setWaiting(true); setFailure("");
    failedDraft.current = message;
    const controller = new AbortController(); uploadController.current = controller;
    try {
      let uploaded: UploadedFile[] = [];
      if (message.files.length) {
        const form = new FormData(); form.set("conversationId", initial.id);
        for (const file of message.files) form.append("files", file);
        uploaded = (await request<{ files: UploadedFile[] }>("/api/uploads", { method: "POST", body: form, signal: controller.signal })).files;
      }
      if (!mounted.current || controller.signal.aborted) throw new Error("Upload cancelled. Your draft is retained.");
      uploadController.current = null;
      const requestId = crypto.randomUUID();
      await run({ intent: "submit", requestId, text: message.text, uploadIds: uploaded.map(file => file.id) }, { text: message.text, files: uploaded, id: requestId }, true);
      failedDraft.current = null;
    } finally { uploadController.current = null; actionLocked.current = false; if (mounted.current) setWaiting(false); }
  }

  async function stopResponse() {
    if (stopLocked.current) return;
    stopLocked.current = true; setStopping(true);
    if (generating && chat.messages.at(-1)?.role === "assistant") setStoppedId(chat.messages.at(-1)!.id);
    try {
      uploadController.current?.abort();
      await request("/api/chat/stop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: initial.id }) });
      await chat.stop();
      await refresh();
    } catch (reason) { setFailure(problem(reason)); }
    finally { stopLocked.current = false; setStopping(false); }
  }

  async function restore() {
    if (!version || busy) return;
    setWaiting(true); setFailure("");
    try {
      const result = await request<{ conversation: ConversationData }>(`/api/conversations/${initial.id}/restore`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionId: version }) });
      setConversation(result.conversation); chat.setMessages(result.conversation.messages); setVersion(""); await onUpdated();
    } catch (reason) { setFailure(problem(reason)); }
    finally { setWaiting(false); }
  }

  async function retryResponse() {
    try {
      const saved = await refresh();
      const failed = lastRequest.current;
      const snapshot = failed?.intent.intent === "submit" ? failedDraft.current : null;
      const pending = saved.messages.flatMap(message => message.parts).find(part => isToolUIPart(part) && part.state === "approval-requested");
      if (failed?.intent.intent === "submit") {
        const index = saved.messages.findIndex(message => message.id === failed.intent.requestId);
        if (index < 0) await run(failed.intent, failed.optimistic);
        else {
          if (pending) { setFailure(""); return; }
          const reply = saved.messages.slice(index + 1).find(message => message.role === "assistant");
          await run({ intent: "regenerate", ...(reply ? { messageId: reply.id } : {}) });
        }
      } else {
        if (pending) { setFailure(""); return; }
        if (failed?.intent.intent === "approve") await run(failed.intent);
        else if (failed?.intent.intent === "edit") await run(failed.intent, failed.optimistic);
        else if (saved.messages.length) await run({ intent: "regenerate" });
      }
      if (snapshot) {
        setDraft(current => current.trim() === snapshot.text.trim() ? "" : current);
        setFiles(current => current.length === snapshot.files.length && current.every((file, index) => file === snapshot.files[index]) ? [] : current);
        failedDraft.current = null;
      }
    } catch (reason) { setFailure(problem(reason)); }
  }

  const latest = chat.messages.at(-1);
  const pendingApproval = chat.messages.some(message => message.parts.some(part => isToolUIPart(part) && part.state === "approval-requested"));
  return <>
    {configuration.configured === false && <p role="alert" className="assistant-alert">Add OPENAI_API_KEY to the server environment to start a live conversation.</p>}
    <Chat title={conversation.title} description={configuration.mode === "fixture" ? "Recorded responses for automated verification" : configuration.model ?? "OpenAI"}
      actions={<Button variant="subtle" disabled={!chat.messages.length || busy} onClick={() => exportConversation(conversation, chat.messages)}>Export</Button>}
      historyHeight="clamp(16rem, calc(100dvh - 340px), 44rem)"
      composer={<MessageComposer ref={composer} compact maxRows={6} maxLength={8000} sendOnEnter value={draft} onValueChange={setDraft} files={files} onFilesChange={setFiles}
        allowAttachments accept=".txt,.md,.csv,.json,.pdf,image/png,image/jpeg,image/webp,image/gif" maxFiles={4} maxFileSize={5 * 1024 * 1024}
        disabled={configuration.configured === false || (pendingApproval && !busy)} generating={busy} onStop={() => void stopResponse()} onSend={send}
        placeholder={pendingApproval ? "Approve or reject the proposed action first" : "Ask about your project…"} />}
      footer="Conversations and files are saved in this browser’s private session on this server.">
      {!chat.messages.length && <div className="assistant-welcome">
        <AiAvatar state="idle" size={24} />
        <h2>What are we working on?</h2>
        <p>Review the launch brief, explore project activity, or plan the next step. You approve changes before they run.</p>
        <Suggestions wrap>{[
          ["Review the launch brief and summarize the priorities.", "Review the brief"],
          ["Show the project widget.", "Show project activity"],
          ["Create a task named Review launch checklist.", "Plan the next step"],
        ].map(([value, label]) => <Suggestion key={value} value={value!} disabled={busy} onSelect={text => { setDraft(text); composer.current?.focus(); }}>{label}</Suggestion>)}</Suggestions>
      </div>}
      {chat.messages.map(message => <div key={message.id} className="assistant-message">
        {editing === message.id ? <form className="assistant-stack" onSubmit={event => {
          event.preventDefault();
          void run({ intent: "edit", messageId: message.id, text: editText }, { text: editText, messageId: message.id }).then(() => setEditing(null)).catch(() => {});
        }}>
          <Textarea label="Edit your request" value={editText} onChange={event => setEditText(event.target.value)} maxLength={8000} required disabled={busy} />
          <div className="assistant-tools"><Button type="submit" disabled={busy || !editText.trim()}>Save and send</Button><Button variant="subtle" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button></div>
        </form> : <MessageView message={message} latest={message.id === latest?.id} streaming={generating && message.id === latest?.id} stopped={stoppedId === message.id} busy={busy}
          onApprove={(approvalId, approved) => run({ intent: "approve", approvalId, approved })}
          onEdit={() => { setEditText(plainText(message)); setEditing(message.id); }}
          onRegenerate={() => { void run({ intent: "regenerate", messageId: message.id }).catch(() => {}); }} />}
      </div>)}
      {chat.status === "submitted" && <p role="status" className="assistant-note">Connecting to the assistant…</p>}
    </Chat>
    {failure && <div role="alert" className="assistant-alert"><p>{failure}</p><p className="assistant-note">Your conversation is saved. You can retry the response.</p>
      <Button variant="ghost" disabled={busy} onClick={() => void retryResponse()}>Retry response</Button>
    </div>}
    {conversation.versions && conversation.versions.length > 0 && <div className="assistant-versions">
      <label htmlFor="saved-version">Earlier versions</label>
      <select id="saved-version" value={version} disabled={busy} onChange={event => setVersion(event.target.value)}>
        <option value="">Choose a saved version</option>{conversation.versions.map((item, index) => <option key={item.id} value={item.id}>Version {index + 1} · {new Date(item.createdAt).toLocaleString()}</option>)}
      </select><Button variant="ghost" disabled={busy || !version} onClick={() => void restore()}>Restore version</Button>
    </div>}
    {conversation.tasks.length > 0 && <Widget title="Saved tasks" provider="This conversation" footer="Created only after your approval. Restoring a conversation does not undo completed tasks.">
      <ul className="assistant-task-list">{conversation.tasks.map(task => <li key={task.id}><strong>{task.title}</strong><p className="assistant-note">{task.status}</p></li>)}</ul>
    </Widget>}
  </>;
}

function MessageView({ message, latest, streaming, stopped, busy, onApprove, onEdit, onRegenerate }: {
  message: UIMessage; latest: boolean; streaming: boolean; stopped: boolean; busy: boolean;
  onApprove: (id: string, approved: boolean) => Promise<void>; onEdit: () => void; onRegenerate: () => void;
}) {
  const [reading, setReading] = React.useState(false);
  const text = plainText(message);
  const user = message.role === "user";
  const metadata = message.metadata;
  const outcome = metadata && "outcome" in metadata ? metadata.outcome as "complete" | "stopped" | "error" : undefined;
  return <Response from={user ? "user" : "assistant"} status={streaming ? "streaming" : stopped ? "stopped" : outcome ?? "complete"}
    avatar={!user && <AiAvatar size={20} static={!latest} state={reading ? "speaking" : streaming ? "thinking" : "idle"} />}
    actions={user ? <Button variant="subtle" disabled={busy} onClick={onEdit}>Edit request</Button> : <ResponseActions text={text} onReadingChange={setReading}>
      <Button variant="subtle" disabled={busy} onClick={onRegenerate}>Regenerate</Button>
    </ResponseActions>}>
    <div className="assistant-message-content">
      {message.parts.map((part, index) => {
        if (part.type === "text") return user ? <span key={index}>{part.text}</span> : <ResponseMarkdown key={index} streaming={streaming}>{part.text}</ResponseMarkdown>;
        if (part.type === "reasoning") return <Reasoning key={index} title="Reasoning summary" variant="inline" status={streaming && part.state === "streaming" ? "streaming" : "complete"}><ResponseMarkdown streaming={streaming}>{part.text}</ResponseMarkdown></Reasoning>;
        if (part.type === "file") return <Attachments key={index} variant="inline"><Attachment data={{ id: `${message.id}-${index}`, name: part.filename ?? "Attachment", mediaType: part.mediaType, url: part.url }} /></Attachments>;
        if (isToolUIPart(part)) {
          const presentation = getToolCallPresentation(part);
          const titles: Record<string, string> = { readBrief: "Read launch brief", projectWidget: "Project activity", createTask: "Create task" };
          const title = titles[presentation.title] ?? presentation.title;
          return <div key={part.toolCallId} className="assistant-stack">
            <ToolCall title={title} state={presentation.state} statusLabel={presentation.statusLabel} input={JSON.stringify(presentation.input, null, 2)} output={JSON.stringify(presentation.output, null, 2)} error={presentation.error} />
            {presentation.approvalId && presentation.approvalStatus === "pending" && <Confirmation title="Add this task?" confirmLabel="Approve task" rejectLabel="Reject task" disabled={busy}
              onConfirm={() => onApprove(presentation.approvalId!, true)} onReject={() => onApprove(presentation.approvalId!, false)}>
              <p>This writes a task to your saved project. Review the proposed details above.</p>
            </Confirmation>}
            {part.state === "output-available" && presentation.title === "projectWidget" && <ProjectWidget output={part.output} />}
          </div>;
        }
        if (part.type === "source-url") return <a key={part.sourceId} href={/^https?:\/\//.test(part.url) ? part.url : undefined} target="_blank" rel="noopener noreferrer">{part.title ?? "Source"}</a>;
        return null;
      })}
      {metadata?.usage && <ContextUsage usedTokens={(metadata.usage.inputTokens ?? 0) + (metadata.usage.outputTokens ?? 0)} usage={metadata.usage} model={metadata.model} label="Token usage" />}
    </div>
  </Response>;
}

function ProjectWidget({ output }: { output: unknown }) {
  const [embed, setEmbed] = React.useState(false);
  const data = output && typeof output === "object" ? output as Record<string, unknown> : {};
  return <Widget role="group" title={typeof data.title === "string" ? data.title : "Launch project"} provider="Project tools" footer="Live tool result · React widget"
    actions={<Button variant="subtle" onClick={() => setEmbed(value => !value)} aria-expanded={embed}>{embed ? "Hide integration example" : "View integration example"}</Button>}>
    <p>{typeof data.summary === "string" ? data.summary : "The project is ready for review. Read the brief and assign the next step."}</p>
    {embed && <WidgetEmbed title="Example provider project widget" src="/provider-widget.html" height={180} sandbox="" />}
  </Widget>;
}
