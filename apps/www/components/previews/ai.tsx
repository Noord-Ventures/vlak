"use client";

import { useState, type ComponentType } from "react";
import { Chat, Confirmation, Conversation, MessageComposer, Reasoning, Response, ResponseActions, ToolCall, Widget } from "@noorddev/vlak-react";

function ChatPreview() {
  const [messages, setMessages] = useState([{ prompt: "What should we focus on first?", reply: "Start with the review flow. Name an owner and next step for each decision." }]);
  return <Chat title="Project conversation" historyHeight="18rem" autoScroll={messages.length > 1} footer="Local example · Recorded replies"
    composer={<MessageComposer compact maxRows={6} sendOnEnter label="Project conversation prompt" onSend={({ text }) => setMessages(current => [...current, { prompt: text, reply: "Keep the scope small, assign an owner, and link the supporting source." }])} placeholder="Ask a follow-up…" />}>
    {messages.map((message, index) => <div key={index} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 0 }}>
      <Response from="user" statusLabel="">{message.prompt}</Response>
      <Response statusLabel="" actions={<ResponseActions text={message.reply} />}>{message.reply}</Response>
    </div>)}
  </Chat>;
}

export const aiPreviews: Record<string, ComponentType> = {
  chat: ChatPreview,
  conversation: () => <Conversation label="Project brief conversation" maxHeight="20rem"><Response from="user" statusLabel="">What changed in the brief?</Response><Response statusLabel="">Each decision now has an owner, a next step, and a supporting source.</Response></Conversation>,
  response: () => <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", minWidth: 0 }}><Response from="user" statusLabel="">What should we focus on first?</Response><Response statusLabel="" actions={<ResponseActions text="Start with the review flow. Name an owner and next step for each decision." />}>Start with the review flow. Name an owner and next step for each decision.</Response></div>,
  "response-actions": () => <ResponseActions text="The brief now names one owner and one next step." />,
  widget: () => <Widget title="Project brief" provider="Workspace"><span>One owner, one next step, and three supporting sources.</span></Widget>,
  reasoning: () => <Reasoning title="Review summary" statusLabel="1 source"><p>Checked the proposed scope, owners, and supporting sources.</p></Reasoning>,
  "tool-call": () => <ToolCall title="Read project brief" state="complete" input="project-brief.md" output="Scope, owners, and sources · 3 sections read" />,
  confirmation: () => <Confirmation title="Add a review note?" confirmLabel="Approve draft" rejectLabel="Keep in chat" onConfirm={() => {}} onReject={() => {}}><p>This example records your decision locally.</p></Confirmation>,
};
