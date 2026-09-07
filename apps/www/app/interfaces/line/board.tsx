"use client";

import * as React from "react";
import { Button, Card, DescriptionList, Icon, Input, Select, Textarea } from "@noorddev/vlak-react";

type Message = { id: string; role: "you" | "assistant"; text: string; saved?: boolean; prompt?: string; format?: string };
type Conversation = { id: string; title: string; context: string; messages: Message[]; draft: string };
type Screen = "list" | "chat" | "details";
const INITIAL: Conversation[] = [
  { id: "onboarding", title: "A better first five minutes", context: "Product thinking", draft: "", messages: [
    { id: "a1", role: "you", text: "Help me plan the first session for someone joining our research workspace." },
    { id: "a2", role: "assistant", text: "Start with one useful outcome, not a tour of every feature.\n\n1. Ask what they want to learn.\n2. Let them bring in one research note.\n3. Help them turn that note into a question for the team.\n\nLeave the full workspace setup until they have something worth keeping.", prompt: "Help me plan the first session for someone joining our research workspace.", format: "Sample response" },
  ] },
  { id: "questions", title: "Interview questions", context: "Research planning", draft: "", messages: [
    { id: "b1", role: "you", text: "What should we ask in a first research interview?" },
    { id: "b2", role: "assistant", text: "Ask about a recent, concrete experience. What started the task, what did the person try, and where did they get stuck?\n\nEnd by asking to see the tools or notes they used. Examples are easier to discuss than hypothetical preferences.", prompt: "What should we ask in a first research interview?", format: "Sample response" },
  ] },
  { id: "release", title: "A quieter release note", context: "Writing", draft: "", messages: [
    { id: "c1", role: "you", text: "Help me structure a release note for improved search." },
    { id: "c2", role: "assistant", text: "Lead with the change people will notice: search now includes the content of your notes.\n\nFollow with one example, then explain where to try it. Keep internal implementation details in the technical changelog.", prompt: "Help me structure a release note for improved search.", format: "Sample response" },
  ] },
];
const STARTERS = ["Outline a research plan", "Make a brief easier to read", "Explore a product decision"];

function localReply(prompt: string, format: string) {
  return format === "outline"
    ? `Working outline for: “${prompt}”\n\n1. Define the outcome and who it serves.\n2. List what is known and what still needs evidence.\n3. Choose one small next step and a way to review it.\n\nThis local template is a starting structure. Replace each point with the details of your project.`
    : `A starting point for: “${prompt}”\n\nDescribe the outcome in one sentence, name the main uncertainty, and choose one step that helps you learn.\n\nThis is a local writing template, ready for you to adapt.`;
}

export function Board() {
  const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL);
  const [selected, setSelected] = React.useState("onboarding");
  const [screen, setScreen] = React.useState<Screen>("list");
  const [query, setQuery] = React.useState("");
  const [format, setFormat] = React.useState("outline");
  const [responseId, setResponseId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const counter = React.useRef(0);
  const messageBox = React.useRef<HTMLTextAreaElement>(null);
  const conversationHeading = React.useRef<HTMLHeadingElement>(null);
  const detailHeading = React.useRef<HTMLHeadingElement>(null);
  const scroll = React.useRef<HTMLDivElement>(null);
  const responseButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const rows = React.useRef(new Map<string, HTMLButtonElement>());
  const current = conversations.find(item => item.id === selected)!;
  const response = current.messages.find(item => item.id === responseId);
  const visible = conversations.filter(item => `${item.title} ${item.context}`.toLowerCase().includes(query.toLowerCase()));
  const savedCount = current.messages.filter(item => item.saved).length;

  function updateConversation(change: (item: Conversation) => Conversation) {
    setConversations(items => items.map(item => item.id === selected ? change(item) : item));
  }
  function openConversation(id: string) {
    setSelected(id); setScreen("chat"); setResponseId(null);
    requestAnimationFrame(() => conversationHeading.current?.focus({ preventScroll: true }));
  }
  function backToList() {
    setScreen("list"); setResponseId(null);
    requestAnimationFrame(() => rows.current.get(selected)?.focus({ preventScroll: true }));
  }
  function newConversation() {
    const id = `conversation-${++counter.current}`;
    setConversations(items => [{ id, title: "Untitled conversation", context: "New conversation", messages: [], draft: "" }, ...items]);
    setSelected(id); setScreen("chat"); setResponseId(null); setQuery("");
    requestAnimationFrame(() => messageBox.current?.focus({ preventScroll: true }));
  }
  function send(event?: React.FormEvent) {
    event?.preventDefault();
    const value = current.draft.trim();
    if (!value) return;
    const id = ++counter.current;
    updateConversation(item => ({ ...item, title: item.messages.length ? item.title : value.slice(0, 52), context: "Local draft", draft: "", messages: [...item.messages,
      { id: `you-${id}`, role: "you", text: value },
      { id: `reply-${id}`, role: "assistant", text: localReply(value, format), prompt: value, format: format === "outline" ? "Working outline" : "Short response" },
    ] }));
    setAnnouncement("Message added. A local template response is ready.");
    requestAnimationFrame(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; messageBox.current?.focus({ preventScroll: true }); });
  }
  function inspect(message: Message) {
    setResponseId(message.id); setScreen("details");
    requestAnimationFrame(() => detailHeading.current?.focus({ preventScroll: true }));
  }
  function closeDetails() {
    const id = responseId;
    setScreen("chat"); setResponseId(null);
    requestAnimationFrame(() => { if (id) responseButtons.current.get(id)?.focus({ preventScroll: true }); });
  }
  function toggleSave(message: Message) {
    updateConversation(item => ({ ...item, messages: item.messages.map(row => row.id === message.id ? { ...row, saved: !row.saved } : row) }));
    setAnnouncement(message.saved ? "Response removed from saved notes." : "Response saved to this conversation.");
  }
  function exportConversation() {
    const text = `# ${current.title}\n\nLocal conversation example. Assistant replies are sample text or local templates.\n\n${current.messages.map(item => `## ${item.role === "you" ? "You" : "Draft assistant"}${item.saved ? " · Saved" : ""}\n\n${item.text}`).join("\n\n")}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${current.id}.md`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setAnnouncement("Conversation exported as a Markdown file.");
  }

  return <section className="ac" data-screen={screen} aria-label="Draft conversation workspace">
    <header className="ac-header"><div className="ac-project"><span className="ac-mark"><Icon name="message" size={16} /></span><div><strong>Research notebook</strong><span>A space to work through ideas</span></div></div><Button className="ac-new" variant="ghost" aria-label="New conversation" onClick={newConversation}><Icon name="plus" size={16} /><span>New conversation</span></Button></header>
    <div className="ac-body">
      <aside className="ac-sidebar" aria-label="Conversations">
        <div className="ac-search"><Input aria-label="Search conversations" placeholder="Find a conversation" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <div className="ac-list-head"><h2>Conversations</h2><span>{visible.length}</span></div>
        <div className="ac-conversations">{visible.map(item => <button type="button" className="ac-conversation" key={item.id} data-conversation={item.id} ref={element => { if (element) rows.current.set(item.id, element); else rows.current.delete(item.id); }} aria-current={selected === item.id ? "true" : undefined} onClick={() => openConversation(item.id)}><span className="ac-row-context">{item.context}<Icon name="chevron-right" size={12} /></span><strong>{item.title}</strong><span className="ac-row-count">{item.messages.length ? `${item.messages.length} messages` : "Start with a question"}</span></button>)}{!visible.length && <p className="ac-list-empty">No conversations match “{query}”.</p>}</div>
        <div className="ac-sidebar-foot"><Icon name="lock" size={12} />Changes stay in this tab</div>
      </aside>
      {screen === "details" && response ? <section className="ac-details" aria-label="Response details">
        <header className="ac-detail-head"><Button className="ac-icon" variant="ghost" aria-label="Back to conversation" onClick={closeDetails}><Icon name="arrow-left" size={16} /></Button><div><span className="ac-eyebrow">Conversation note</span><h2 tabIndex={-1} ref={detailHeading}>Response details</h2></div></header>
        <div className="ac-detail-scroll" tabIndex={0} role="region" aria-label="Response content"><Card className="ac-detail-card"><h3>The starting question</h3><p>{response.prompt}</p></Card><Card className="ac-detail-card"><h3>Draft response</h3><p className="ac-prose">{response.text}</p></Card><DescriptionList items={[{ id: "source", label: "Source", value: response.format === "Sample response" ? "Authored sample text" : "Local writing template" }, { id: "format", label: "Format", value: response.format ?? "Sample response" }, { id: "saved", label: "Notebook", value: response.saved ? "Saved in this conversation" : "Not saved" }]} /><p className="ac-detail-note">No model or research service is connected. Review and adapt this text before using it.</p></div>
        <div className="ac-detail-actions"><Button variant="ghost" aria-pressed={Boolean(response.saved)} onClick={() => toggleSave(response)}><Icon name="bookmark" size={16} />{response.saved ? "Saved response" : "Save response"}</Button><Button variant="ghost" onClick={exportConversation}><Icon name="download" size={16} />Export conversation</Button></div>
      </section> : <section className="ac-chat" aria-label="Current conversation">
        <header className="ac-chat-head"><Button className="ac-back ac-icon" variant="ghost" aria-label="Back to conversations" onClick={backToList}><Icon name="arrow-left" size={16} /></Button><div><span className="ac-eyebrow">{current.context}</span><h2 tabIndex={-1} ref={conversationHeading}>{current.title}</h2></div><Button className="ac-icon ac-export" variant="ghost" aria-label="Export conversation" disabled={!current.messages.length} onClick={exportConversation}><Icon name="download" size={16} /></Button></header>
        <div className="ac-messages" ref={scroll}><div className="ac-measure">{current.messages.length ? <><div className="ac-session"><span>Conversation notes</span><span>{savedCount ? `${savedCount} saved` : "Local example"}</span></div>{current.messages.map(message => <article className="ac-message" data-role={message.role} key={message.id}><div className="ac-author"><span className="ac-author-mark"><Icon name={message.role === "you" ? "user" : "layers"} size={16} /></span><strong>{message.role === "you" ? "You" : "Draft assistant"}</strong><span>{message.role === "assistant" ? message.format === "Sample response" ? "Sample" : "Local template" : "Note"}</span></div><p className="ac-prose">{message.text}</p>{message.role === "assistant" && <div className="ac-response-actions"><Button variant="ghost" className="ac-inspect" ref={element => { if (element) responseButtons.current.set(message.id, element); else responseButtons.current.delete(message.id); }} onClick={() => inspect(message)}><Icon name="file-text" size={16} />Response details</Button><Button variant="ghost" className="ac-save ac-icon" aria-label={message.saved ? "Unsave response" : "Save response"} aria-pressed={Boolean(message.saved)} onClick={() => toggleSave(message)}><Icon name={message.saved ? "check" : "bookmark"} size={16} /></Button></div>}</article>)}</> : <div className="ac-empty"><span className="ac-empty-mark"><Icon name="layers" size={24} /></span><span className="ac-eyebrow">A new page</span><h3>What are you working through?</h3><p>Start with a question or a rough idea. The local assistant will give you a structure to build on.</p><div className="ac-starters">{STARTERS.map(text => <Button key={text} variant="ghost" onClick={() => { updateConversation(item => ({ ...item, draft: text })); messageBox.current?.focus(); }}>{text}<Icon name="arrow-right" size={16} /></Button>)}</div></div>}</div></div>
        <form className="ac-composer" onSubmit={send}><Textarea ref={messageBox} aria-label="Message" value={current.draft} rows={2} maxLength={2000} placeholder="Ask a question or add a thought…" onChange={event => updateConversation(item => ({ ...item, draft: event.target.value }))} onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} /><div className="ac-compose-actions"><Select className="ac-format" fullWidth aria-label="Response format" value={format} onValueChange={setFormat} options={[{ value: "outline", label: "Working outline" }, { value: "short", label: "Short response" }]} /><Button type="submit" disabled={!current.draft.trim()} className="ac-send"><span>Send</span><Icon name="arrow-up" size={16} /></Button></div><p className="ac-compose-note">Local templates, no connected model. <span>⌘ / Ctrl + Enter to send.</span></p></form>
      </section>}
    </div><footer className="ac-footer"><span><Icon name="terminal" size={12} />Local demo</span><span>Your ideas, kept in context</span></footer><p className="ac-announcement" role="status">{announcement}</p>
  </section>;
}
