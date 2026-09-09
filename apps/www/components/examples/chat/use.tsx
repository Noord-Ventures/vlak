"use client";

import { useState } from "react";
import { Button, Chat, MessageComposer, Response, ResponseActions } from "@noorddev/vlak-react";
import { AiAvatar } from "@/components/ai-avatar";
import { UseField } from "../use-frame";
import "@/app/ai/demo.css";

type Message = { id: string; from: "user" | "assistant"; text: string };
const reply = "Name the owner and add one dated next step. Keep the supporting sources beside each decision.";
const initial: Message[] = [
  { id: "question", from: "user", text: "What needs to change in the brief?" },
  { id: "answer", from: "assistant", text: reply },
];

export function Use() {
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");
  const [version, setVersion] = useState(0);
  const [readingId, setReadingId] = useState<string | null>(null);

  return <UseField name="chat">
    <h3 className="rs-use-type">A project conversation</h3>
    <div className="rs-use-body">
      <Chat
        className="ai-chat-demo"
        title="Project brief"
        description="Ask about the current draft"
        conversationLabel="Project brief messages"
        historyHeight="24rem"
        actions={<Button variant="subtle" className="ai-chat-reset" onClick={() => { setMessages(initial); setDraft(""); setReadingId(null); setVersion(value => value + 1); }}>Reset chat</Button>}
        composer={<MessageComposer
          className="ai-chat-input"
          compact
          maxRows={6}
          label="Follow-up message"
          placeholder="Ask a follow-up…"
          value={draft}
          onValueChange={setDraft}
          sendOnEnter
          onSend={({ text }) => setMessages(previous => [
            ...previous,
            { id: `question-${previous.length}`, from: "user", text },
            { id: `answer-${previous.length}`, from: "assistant", text: reply },
          ])}
        />}
        footer="Local example. Every prompt receives the same recorded reply."
      >
        {messages.map((message, index) => message.from === "user"
          ? <Response key={`${version}-${message.id}`} className="ai-chat-user" from="user">{message.text}</Response>
          : <div className="ai-chat-assistant" key={`${version}-${message.id}`}>
            <span className="ai-chat-avatar">{index === messages.length - 1 && <AiAvatar size={20} state={readingId === message.id ? "speaking" : "idle"} />}</span>
            <div className="ai-chat-answer"><Response className="ai-chat-reply" aria-label="Assistant"
              actions={<ResponseActions text={message.text} onReadingChange={reading => setReadingId(current => reading ? message.id : current === message.id ? null : current)} />}
            ><p>{message.text}</p></Response></div>
          </div>)}
      </Chat>
    </div>
  </UseField>;
}
