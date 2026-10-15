"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Chat, Confirmation, MessageComposer, Response, Sources, ToolCall } from "@noorddev/vlak-react";
import type { ConfirmationStatus, ResponseStatus, ToolCallState } from "@noorddev/vlak-react";
import { sx } from "@/lib/sx";
import { playReply } from "./ai/reply-sequence";
import { specimen } from "./specimen.stylex";

type Exchange = { id: number; prompt: string; reply: string; status: ResponseStatus };
const initialExchange = (): Exchange => ({
  id: 0,
  prompt: "What should we focus on first?",
  reply: "Start with the review flow. Give each decision an owner, a next step, and a supporting source.",
  status: "complete",
});
const initial = (): Exchange[] => [initialExchange()];
const sources = [
  { id: "chat", title: "Chat", url: "/ai/chat/", description: "Conversation history and a composer that stays in reach." },
  { id: "confirmation", title: "Confirmation", url: "/ai/confirmation/", description: "Ask for approval before an application-owned action." },
];

/** A local specimen of the public components, without a model or saved data. */
export function SpecimenAiTile() {
  const [exchanges, setExchanges] = useState(initial);
  const [draft, setDraft] = useState("");
  const [decision, setDecision] = useState<ConfirmationStatus>("pending");
  const [resetId, setResetId] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [toolState, setToolState] = useState<ToolCallState>("complete");
  const [toolOpen, setToolOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const tileRef = useRef<HTMLElement>(null);
  const chatRef = useRef<HTMLElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);
  const cancelReply = useRef<(() => void) | null>(null);
  const cancelAnimation = useRef<(() => void) | null>(null);
  const generating = exchanges.some(exchange => exchange.status === "streaming");
  const playing = autoplay && motionAllowed;

  useEffect(() => () => { cancelReply.current?.(); }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setMotionAllowed(!media.matches);
      if (media.matches) {
        cancelAnimation.current?.();
        cancelReply.current?.();
        cancelReply.current = null;
        setExchanges(current => current.map(exchange => exchange.status === "streaming" ? { ...exchange, status: "stopped" } : exchange));
        setToolState("complete");
        setToolOpen(false);
      }
    };
    update();
    media.addEventListener("change", update);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting)), { threshold: 0.15 });
    if (tileRef.current) observer.observe(tileRef.current);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, []);

  // The sequence runs only on screen. Pausing or interacting cancels every pending step.
  useEffect(() => {
    if (!playing || !visible || !pageVisible) return;
    let active = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => { timers.delete(timer); if (active) callback(); }, delay);
      timers.add(timer);
    };
    const cancel = () => {
      active = false;
      timers.forEach(clearTimeout);
      timers.clear();
      cancelReply.current?.();
      cancelReply.current = null;
    };
    cancelAnimation.current = cancel;
    const cycle = () => {
      const example = initialExchange();
      const id = nextId.current++;
      setExchanges([]);
      setDraft("");
      setDecision("pending");
      setToolState("queued");
      setToolOpen(false);
      setSourcesOpen(false);
      const typePrompt = (length: number) => {
        setDraft(example.prompt.slice(0, length));
        if (length < example.prompt.length) later(() => typePrompt(length + 1), 45);
        else later(() => {
          setDraft("");
          setExchanges([{ ...example, id, reply: "", status: "streaming" }]);
          setToolState("running");
          setToolOpen(true);
          later(() => {
            setToolState("complete");
            setToolOpen(false);
            cancelReply.current = playReply({
              text: example.reply,
              onText: reply => { if (active) setExchanges([{ ...example, id, reply, status: "streaming" }]); },
              onWidget: () => {},
              onComplete: () => {
                cancelReply.current = null;
                if (!active) return;
                setExchanges([{ ...example, id }]);
                later(() => setDecision("accepted"), 1500);
                later(() => setSourcesOpen(true), 2400);
                later(cycle, 7500);
              },
            });
          }, 1600);
        }, 650);
      };
      later(() => typePrompt(1), 650);
    };
    cycle();
    return () => { cancel(); if (cancelAnimation.current === cancel) cancelAnimation.current = null; };
  }, [playing, visible, pageVisible]);

  useEffect(() => {
    if (!exchanges.length) return;
    const history = chatRef.current?.querySelector<HTMLElement>('[role="log"]');
    if (history) history.scrollTop = history.scrollHeight;
  }, [exchanges.length]);

  useEffect(() => {
    if (resetId > 0) composerRef.current?.focus({ preventScroll: true });
  }, [resetId]);

  const pause = () => {
    cancelAnimation.current?.();
    cancelAnimation.current = null;
    setAutoplay(false);
    setToolState(current => current === "running" ? "queued" : current);
    setExchanges(current => current.map(exchange => exchange.status === "streaming" ? { ...exchange, status: "stopped" } : exchange));
  };

  const takeControl = (target: EventTarget | null) => {
    if (target instanceof Element && target.closest('[data-demo-playback]')) return;
    if (playing) pause();
  };

  const send = (prompt: string) => {
    if (playing) pause();
    if (!prompt.trim() || cancelReply.current) return;
    const id = nextId.current++;
    const reply = /risk|concern|wrong/i.test(prompt)
      ? "Unclear ownership is the main risk. Name an owner before adding more features, and keep the source behind each decision visible."
      : /action|task|list|plan/i.test(prompt)
        ? "1. Outline the review flow. 2. Assign one owner to each decision. 3. Attach the source brief. Keep the first release small."
        : "Keep the scope small, assign an owner, and link the supporting source. Try the approval and source components alongside this conversation.";
    setExchanges(current => [...current, { id, prompt: prompt.trim(), reply: "", status: "streaming" }]);
    if (!motionAllowed) {
      setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, reply, status: "complete" } : exchange));
      return;
    }
    cancelReply.current = playReply({
      text: reply,
      onText: text => setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, reply: text } : exchange)),
      onWidget: () => {},
      onComplete: () => {
        cancelReply.current = null;
        setExchanges(current => current.map(exchange => exchange.id === id ? { ...exchange, status: "complete" } : exchange));
      },
    });
  };

  const stop = () => {
    if (playing) pause();
    cancelReply.current?.();
    cancelReply.current = null;
    setExchanges(current => current.map(exchange => exchange.status === "streaming" ? { ...exchange, status: "stopped" } : exchange));
  };

  const reset = () => {
    pause();
    cancelReply.current?.();
    cancelReply.current = null;
    setExchanges(initial());
    setDraft("");
    setDecision("pending");
    setToolState("complete");
    setToolOpen(false);
    setSourcesOpen(true);
    setResetId(value => value + 1);
  };

  return <section ref={tileRef} id="homepage-ai" {...sx("specimen-cell specimen-ai-tile", specimen.cell, specimen.startFeatureTile)} aria-labelledby="homepage-ai-title">
    <div {...sx("specimen-ai-demos", specimen.aiDemos)} onPointerDownCapture={event => takeControl(event.target)} onFocusCapture={event => takeControl(event.target)}>
      <Chat
        key={`chat-${resetId}`}
        ref={chatRef}
        title="Launch brief"
        description="Example conversation"
        conversationLabel="Homepage sample conversation"
        historyHeight="17rem"
        autoScroll
        actions={<>{motionAllowed && <Button data-demo-playback variant="subtle" onClick={() => { if (playing) pause(); else { cancelReply.current?.(); cancelReply.current = null; setAutoplay(true); } }}>{playing ? "Pause demo" : "Play demo"}</Button>}<Button variant="subtle" onClick={reset}>Reset</Button></>}
        composer={<MessageComposer ref={composerRef} compact maxRows={3} sendOnEnter label="Try the conversation" placeholder="Ask for an action list…" value={draft} onValueChange={setDraft} generating={generating} onStop={stop} onSend={({ text }) => send(text)} />}
        footer="Recorded replies, no model connected."
      >
        {exchanges.map(exchange => <div key={exchange.id} {...sx("specimen-ai-exchange", specimen.aiExchange, specimen.aiReveal)}>
          <Response from="user" statusLabel="">{exchange.prompt}</Response>
          <Response status={exchange.status} statusLabel={exchange.status === "complete" ? "" : undefined}>
            {exchange.reply || (exchange.status === "stopped" ? "Response stopped." : "Reviewing the example…")}
          </Response>
        </div>)}
      </Chat>
      <div key={`stack-${resetId}`} {...sx("specimen-ai-stack", specimen.aiStack)}>
        <ToolCall title="Read launch brief" state={toolState} statusLabel={!playing && toolState === "queued" ? "Paused" : undefined} open={toolOpen} onOpenChange={setToolOpen} input="launch-brief.md" output={toolState === "complete" ? "Scope, owners, and sources reviewed in this recorded example." : undefined} />
        <Confirmation title="Add this draft to the notes?" status={decision} onStatusChange={setDecision} confirmLabel="Approve draft" rejectLabel="Keep in chat" onConfirm={() => {}} onReject={() => {}}>
          <p {...sx("specimen-ai-context", specimen.aiContext)}>Try an approval. This changes only the local demo; no file is saved.</p>
        </Confirmation>
        <Sources label="Component documentation" sources={sources} open={sourcesOpen} onToggle={event => { if (!playing) setSourcesOpen(event.currentTarget.open); }} />
      </div>
    </div>
    <div {...sx("specimen-ai-copy", specimen.aiCopy)}>
      <h2 id="homepage-ai-title" {...sx("specimen-ai-title", specimen.aiTitle)}><a {...sx("specimen-ai-link", specimen.aiLink)} href="/ai/" data-start-path="ai">AI components <span aria-hidden="true">↗</span></a></h2>
      <p {...sx("specimen-ai-description", specimen.aiDescription)}>Conversations, tools and rich responses.</p>
    </div>
  </section>;
}
