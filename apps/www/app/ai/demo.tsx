"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Chat, Confirmation, MessageComposer, Reasoning, Response, ResponseActions, Suggestion, Suggestions, ToolCall } from "@noorddev/vlak-react";
import type { ResponseStatus } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { CalendarWidget, EmbeddedCalendarWidget, ProjectWidget } from "@/components/ai-widgets";
import { playReply } from "./reply-sequence";
import "./demo.css";

type ReplyKind = "overview" | "actions" | "risks" | "short" | "widgets";
type Reply = { intro: string; points?: string[]; outro?: string };
type Exchange = { id: number; prompt: string; kind: ReplyKind; text: string; status: ResponseStatus; visibleWidgets?: number };

const replies: Record<ReplyKind, Reply> = {
  overview: {
    intro: "I’d focus the first release on three things:",
    points: [
      "Keep the scope small. Ship the review flow before adding more ways to collaborate.",
      "Give each decision an owner. Make it clear who is taking the next step.",
      "Keep sources close. Link the brief behind each recommendation.",
    ],
    outro: "The review flow is a good place to start. Want me to turn this into an action list?",
  },
  actions: {
    intro: "Here’s a short action list for the team:",
    points: ["Outline the review flow and agree on what ships first.", "Assign an owner to scope, design, and launch communications.", "Attach the supporting source to each decision."],
    outro: "Review the draft below before adding it to the example project notes.",
  },
  risks: {
    intro: "The main risk is expanding the scope before the review flow works well.",
    points: ["Unclear ownership can leave decisions waiting between teams.", "Recommendations without sources are harder to check.", "Extra collaboration features could delay the first release."],
    outro: "A small release with named owners and linked sources addresses all three.",
  },
  short: { intro: "Ship the review flow first. Give every decision an owner, and link the source behind it. Save the extra collaboration features for later." },
  widgets: { intro: "Here’s the project checklist, followed by a React calendar integration and an embedded calendar. Each uses the same widget frame." },
};
const suggestions = ["Draft an action list", "What are the risks?", "Show widgets"];
const replyText = (kind: ReplyKind) => {
  const reply = replies[kind];
  return [reply.intro, reply.points?.map(point => `• ${point}`).join("\n"), reply.outro].filter(Boolean).join("\n\n");
};
const initialExchange = (id: number): Exchange => ({ id, prompt: "Review the launch brief. What should we focus on first?", kind: "overview", text: replyText("overview"), status: "complete" });
const selectReply = (prompt: string): ReplyKind => /widget|calendar|integration/i.test(prompt) ? "widgets" : /action|task|draft|plan/i.test(prompt) ? "actions" : /risk|concern|wrong/i.test(prompt) ? "risks" : /short|brief|summari/i.test(prompt) ? "short" : "overview";

function ReplyContent({ exchange }: { exchange: Exchange }) {
  if (exchange.status !== "complete") return <p className="ai-chat-stream">{exchange.text || (exchange.status === "stopped" ? "Response stopped before any text was generated." : "Reviewing the brief…")}</p>;
  const reply = replies[exchange.kind];
  return <>
    <p>{reply.intro}</p>
    {reply.points && <ul>{reply.points.map(point => <li key={point}>{point}</li>)}</ul>}
    {reply.outro && <p>{reply.outro}</p>}
  </>;
}

/** A local conversation with recorded replies; prompts never leave this page. */
export function AiDemo() {
  const [exchanges, setExchanges] = useState<Exchange[]>(() => [initialExchange(0)]);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [readingId, setReadingId] = useState<number | null>(null);
  const cancelReply = useRef<(() => void) | null>(null);
  const nextId = useRef(1);
  const chatRef = useRef<HTMLElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const generating = exchanges.some(exchange => exchange.status === "streaming");

  useEffect(() => () => { cancelReply.current?.(); }, []);
  const messageCount = exchanges.length;
  const firstMessageId = exchanges[0]?.id ?? 0;
  useEffect(() => {
    if (firstMessageId > 0) composerRef.current?.focus({ preventScroll: true });
  }, [firstMessageId]);
  useEffect(() => {
    if (messageCount < 2) return;
    const viewport = chatRef.current?.querySelector<HTMLElement>('[role="log"]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messageCount]);

  const stop = () => {
    cancelReply.current?.();
    cancelReply.current = null;
    setExchanges(current => current.map(exchange => exchange.status === "streaming" ? { ...exchange, status: "stopped" } : exchange));
  };
  const send = (prompt: string) => {
    if (cancelReply.current || !prompt.trim()) return;
    const id = nextId.current++;
    const kind = selectReply(prompt);
    setExchanges(current => [...current, { id, prompt: prompt.trim(), kind, text: "", status: "streaming", visibleWidgets: 0 }]);
    cancelReply.current = playReply({
      text: replyText(kind),
      widgetCount: kind === "widgets" ? 3 : 0,
      onText: text => setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, text } : exchange)),
      onWidget: visibleWidgets => setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, visibleWidgets } : exchange)),
      onComplete: () => {
        cancelReply.current = null;
        setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, status: "complete" } : exchange));
      },
    });
  };
  const reset = () => {
    cancelReply.current?.();
    cancelReply.current = null;
    setExchanges([initialExchange(nextId.current++)]);
    setNotes({});
    setReadingId(null);
    setDraft("");
  };

  return <Chat
    key={firstMessageId}
    ref={chatRef}
    className="ai-chat-demo"
    title="Launch brief"
    description="Example project"
    conversationLabel="Launch brief conversation"
    historyHeight="26rem"
    autoScroll={messageCount > 1}
    actions={<Button variant="subtle" className="ai-chat-reset" onClick={reset}>Reset chat</Button>}
    composer={<MessageComposer ref={composerRef} className="ai-chat-input" compact maxRows={6} label="Message" placeholder="Ask a follow-up…" value={draft} onValueChange={setDraft} sendOnEnter generating={generating} onStop={stop} onSend={({ text }) => send(text)} />}
    footer={<span>Interactive demo · Recorded replies, no model connected</span>}
  >
    {exchanges.map((exchange, index) => <div className="ai-chat-exchange" key={exchange.id}>
      {exchange.prompt && <Response className="ai-chat-user" from="user">
        {exchange.prompt}
      </Response>}
      <div className="ai-chat-assistant">
        <span className="ai-chat-avatar">{index === exchanges.length - 1 && <AiAvatar size={20} state={readingId === exchange.id ? "speaking" : exchange.status === "streaming" ? "thinking" : "idle"} />}</span>
        <div className="ai-chat-answer">
          <Response className="ai-chat-reply" aria-label="Assistant" status={exchange.status} statusLabel={exchange.kind === "widgets" && exchange.status === "streaming" && (exchange.visibleWidgets ?? 0) > 0 ? "Adding widgets…" : undefined}
            actions={exchange.kind !== "widgets" && exchange.status !== "streaming" && exchange.text ? <ResponseActions text={exchange.text} onReadingChange={reading => setReadingId(current => reading ? exchange.id : current === exchange.id ? null : current)} /> : undefined}>
            <ReplyContent exchange={exchange} />
            {index === 0 && <Reasoning variant="inline" className="ai-chat-activity" title="Reviewed the launch brief" statusLabel="1 source">
              <p>The example checks the proposed scope, ownership, and supporting sources.</p>
              <ToolCall title="Read launch-brief.md" state="complete" input="Example project / launch-brief.md" output="Scope, owners, and sources reviewed from the recorded example." />
            </Reasoning>}
          </Response>
          {exchange.kind === "widgets" && (exchange.visibleWidgets ?? 0) > 0 && <div className="ai-chat-widgets">
            {[
              { name: "project", content: <ProjectWidget /> },
              { name: "calendar", content: <CalendarWidget /> },
              { name: "embed", content: <EmbeddedCalendarWidget /> },
            ].slice(0, exchange.visibleWidgets).map(widget => <div key={widget.name} className="ai-chat-widget-reveal"><div className="ai-chat-widget-content">{widget.content}</div></div>)}
          </div>}
          {exchange.kind === "widgets" && exchange.status !== "streaming" && exchange.text && <div className="ai-chat-widget-actions"><ResponseActions text={exchange.text} onReadingChange={reading => setReadingId(current => reading ? exchange.id : current === exchange.id ? null : current)} /></div>}
          {exchange.kind === "actions" && exchange.status === "complete" && <Confirmation className="ai-chat-confirmation" title="Add this draft to the example notes?" confirmLabel="Add to notes" rejectLabel="Keep in chat" onConfirm={() => { setNotes(current => ({ ...current, [exchange.id]: exchange.text })); }} onReject={() => {}}>
            <p>This changes only the local example. No file is saved.</p>
          </Confirmation>}
          {notes[exchange.id] && <p className="ai-chat-note" role="status">Draft added to the example notes.</p>}
          {index === exchanges.length - 1 && exchange.status === "complete" && <Suggestions wrap className="ai-chat-suggestions" aria-label="Suggested follow-ups">
            {suggestions.filter(prompt => selectReply(prompt) !== exchange.kind).map(prompt => <Suggestion key={prompt} value={prompt} onSelect={value => { send(value); composerRef.current?.focus({ preventScroll: true }); }} />)}
          </Suggestions>}
        </div>
      </div>
    </div>)}
  </Chat>;
}
