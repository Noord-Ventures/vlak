"use client";

import * as React from "react";
import { Avatar, Button, Card, Icon, Input, Textarea } from "@noorddev/vlak-react";

type Reply = { id: string; author: string; initials: string; text: string; time: string };
type Message = Reply & { replies: Reply[]; acknowledged?: boolean; pinned?: boolean };
type Channel = { id: string; name: string; topic: string; messages: Message[]; draft: string };
type Screen = "channels" | "chat" | "thread" | "create" | "about";
const PEOPLE = [{ name: "Mara", initials: "MR", role: "Design" }, { name: "Tomas", initials: "TK", role: "Production" }, { name: "Inez", initials: "IV", role: "Research" }, { name: "You", initials: "YO", role: "Workspace member" }];
const INITIAL: Channel[] = [
  { id: "studio", name: "studio", topic: "The place for work in progress, small decisions, and a second pair of eyes.", draft: "", messages: [
    { id: "s1", author: "Tomas", initials: "TK", time: "09:14", text: "The client approved the poster direction. Two small changes to the event details before we send it to print.", replies: [
      { id: "s1-r1", author: "Mara", initials: "MR", time: "09:15", text: "Is that the venue address and opening time?" },
      { id: "s1-r2", author: "Tomas", initials: "TK", time: "09:16", text: "Exactly. Everything else is approved." },
    ] },
    { id: "s2", author: "Mara", initials: "MR", time: "09:22", text: "The updated proof is ready to review. I’ve marked both changes in the margin.", replies: [], pinned: true },
    { id: "s3", author: "Inez", initials: "IV", time: "09:26", text: "I’ll check the event details against the brief after our morning review.", replies: [] },
  ] },
  { id: "production", name: "production", topic: "Print proofs, final checks, and production handoffs.", draft: "", messages: [
    { id: "p1", author: "Tomas", initials: "TK", time: "08:41", text: "The first print proof is ready. Can someone check the smaller type at actual size?", replies: [{ id: "p1-r1", author: "Inez", initials: "IV", time: "08:50", text: "Checking now. Please wait before starting the full run." }] },
    { id: "p2", author: "Mara", initials: "MR", time: "08:52", text: "I’ve left the latest sheet on the review table, next to the marked-up proof.", replies: [] },
  ] },
  { id: "research", name: "research", topic: "Interview notes and questions worth following up.", draft: "", messages: [
    { id: "r1", author: "Inez", initials: "IV", time: "Yesterday", text: "Three interviews are transcribed. I’ve pulled out the moments where people switched tools to finish a task.", replies: [] },
    { id: "r2", author: "Mara", initials: "MR", time: "Yesterday", text: "Let’s use those examples in Thursday’s review. They’ll help us ask more concrete questions.", replies: [] },
  ] },
];

export function Board() {
  const [channels, setChannels] = React.useState<Channel[]>(INITIAL);
  const [selectedId, setSelectedId] = React.useState("studio");
  const [screen, setScreen] = React.useState<Screen>("channels");
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = React.useState<Record<string, string>>({});
  const [query, setQuery] = React.useState("");
  const [name, setName] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [error, setError] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const counter = React.useRef(0);
  const messageBox = React.useRef<HTMLTextAreaElement>(null);
  const replyBox = React.useRef<HTMLTextAreaElement>(null);
  const nameBox = React.useRef<HTMLInputElement>(null);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const threadHeading = React.useRef<HTMLHeadingElement>(null);
  const channelRows = React.useRef(new Map<string, HTMLButtonElement>());
  const threadButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const messageScroll = React.useRef<HTMLDivElement>(null);
  const replyScroll = React.useRef<HTMLDivElement>(null);
  const createButton = React.useRef<HTMLButtonElement>(null);
  const aboutButton = React.useRef<HTMLButtonElement>(null);
  const editorReturn = React.useRef<{ screen: Screen; threadId: string | null }>({ screen: "channels", threadId: null });
  const current = channels.find(channel => channel.id === selectedId)!;
  const selectedMessage = current.messages.find(message => message.id === threadId);
  const visible = channels.filter(channel => channel.name.toLowerCase().includes(query.toLowerCase()));
  const editing = screen === "create" || screen === "about";
  const replyDraft = threadId ? replyDrafts[threadId] ?? "" : "";

  function updateChannel(update: (channel: Channel) => Channel) {
    setChannels(rows => rows.map(channel => channel.id === selectedId ? update(channel) : channel));
  }
  function openChannel(id: string) {
    setSelectedId(id); setScreen("chat"); setThreadId(null); setError("");
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function backToChannels() {
    setScreen("channels"); setThreadId(null);
    requestAnimationFrame(() => channelRows.current.get(selectedId)?.focus({ preventScroll: true }));
  }
  function openThread(message: Message) {
    setThreadId(message.id); setScreen("thread");
    requestAnimationFrame(() => threadHeading.current?.focus({ preventScroll: true }));
  }
  function closeThread() {
    const id = threadId;
    setScreen("chat"); setThreadId(null);
    requestAnimationFrame(() => { if (id) threadButtons.current.get(id)?.focus({ preventScroll: true }); });
  }
  function send(event?: React.FormEvent) {
    event?.preventDefault();
    const text = current.draft.trim(); if (!text) return;
    updateChannel(channel => ({ ...channel, draft: "", messages: [...channel.messages, { id: `message-${++counter.current}`, author: "You", initials: "YO", text, time: "Now", replies: [] }] }));
    setAnnouncement(`Message added to ${current.name}. It stays in this local workspace.`);
    requestAnimationFrame(() => { if (messageScroll.current) messageScroll.current.scrollTop = messageScroll.current.scrollHeight; messageBox.current?.focus({ preventScroll: true }); });
  }
  function sendReply(event?: React.FormEvent) {
    event?.preventDefault();
    const text = replyDraft.trim(); if (!text || !threadId) return;
    const reply: Reply = { id: `reply-${++counter.current}`, author: "You", initials: "YO", text, time: "Now" };
    updateChannel(channel => ({ ...channel, messages: channel.messages.map(message => message.id === threadId ? { ...message, replies: [...message.replies, reply] } : message) }));
    setReplyDrafts(drafts => ({ ...drafts, [threadId]: "" })); setAnnouncement("Reply added to this thread.");
    requestAnimationFrame(() => { if (replyScroll.current) replyScroll.current.scrollTop = replyScroll.current.scrollHeight; replyBox.current?.focus({ preventScroll: true }); });
  }
  function toggleFlag(message: Message, flag: "acknowledged" | "pinned") {
    updateChannel(channel => ({ ...channel, messages: channel.messages.map(item => item.id === message.id ? { ...item, [flag]: !item[flag] } : item) }));
    setAnnouncement(flag === "pinned" ? message.pinned ? "Message unpinned." : "Message pinned in this channel." : message.acknowledged ? "Your acknowledgement was removed." : "You acknowledged this message.");
  }
  function createChannel() {
    if (editing) return;
    editorReturn.current = { screen, threadId };
    setName(""); setTopic(""); setError(""); setThreadId(null); setScreen("create");
    requestAnimationFrame(() => nameBox.current?.focus({ preventScroll: true }));
  }
  function editChannel() {
    editorReturn.current = { screen, threadId };
    setName(current.name); setTopic(current.topic); setError(""); setThreadId(null); setScreen("about");
    requestAnimationFrame(() => nameBox.current?.focus({ preventScroll: true }));
  }
  function closeEditor() {
    const isNew = screen === "create";
    setScreen(editorReturn.current.screen); setThreadId(editorReturn.current.threadId); setError("");
    requestAnimationFrame(() => (isNew ? createButton.current : aboutButton.current)?.focus({ preventScroll: true }));
  }
  function saveChannel(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = name.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned)) { setError("Use lowercase letters, numbers, and single hyphens between words."); nameBox.current?.focus(); return; }
    if (channels.some(channel => channel.name === cleaned && (screen === "create" || channel.id !== selectedId))) { setError("A channel with this name already exists."); nameBox.current?.focus(); return; }
    if (screen === "create") {
      const id = `channel-${++counter.current}`;
      setChannels(rows => [...rows, { id, name: cleaned, topic: topic.trim(), draft: "", messages: [] }]); setSelectedId(id); setQuery("");
      setAnnouncement(`Channel ${cleaned} created in this tab.`);
    } else { updateChannel(channel => ({ ...channel, name: cleaned, topic: topic.trim() })); setAnnouncement("Channel details updated."); }
    setScreen("chat"); setError("");
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function composerKey(event: React.KeyboardEvent<HTMLTextAreaElement>, action: () => void) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) { event.preventDefault(); action(); }
  }

  return <section className="tc" data-screen={screen} data-thread={Boolean(selectedMessage)} data-editing={editing} aria-label="Studio conversation workspace">
    <header className="tc-header"><div className="tc-workspace"><span className="tc-mark"><Icon name="layers" size={16} /></span><div><strong>North studio</strong><span>One place for the work</span></div></div><Button ref={createButton} className="tc-create" variant="ghost" aria-label="New channel" disabled={editing} onClick={createChannel}><Icon name="plus" size={16} /><span>New channel</span></Button></header>
    <div className="tc-body">
      <aside className="tc-sidebar" aria-label="Workspace channels"><div className="tc-search"><Input aria-label="Find channels" placeholder="Find a channel" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="tc-list-head"><h2>Channels</h2><span>{visible.length}</span></div><div className="tc-channels">{visible.map(channel => <button key={channel.id} type="button" className="tc-channel-row" data-channel={channel.id} aria-current={channel.id === selectedId ? "true" : undefined} ref={element => { if (element) channelRows.current.set(channel.id, element); else channelRows.current.delete(channel.id); }} onClick={() => openChannel(channel.id)}><span><Icon name="hash" size={16} /><strong>{channel.name}</strong><Icon name="chevron-right" size={12} /></span><span>{channel.messages.length ? channel.messages.at(-1)?.text : "A new space for your team"}</span></button>)}{!visible.length && <p className="tc-empty-search">No channels match “{query}”.</p>}</div><div className="tc-team"><h3>In this workspace</h3>{PEOPLE.map(person => <div className="tc-person" key={person.name}><Avatar initials={person.initials} aria-hidden="true" /><div><strong>{person.name}</strong><span>{person.role}</span></div></div>)}</div><div className="tc-sidebar-foot"><Icon name="lock" size={12} />Local sample workspace</div></aside>
      {editing ? <form className="tc-editor" onSubmit={saveChannel}><header className="tc-editor-head"><Button className="tc-icon" variant="ghost" aria-label={screen === "create" ? "Cancel new channel" : "Back to channel"} onClick={closeEditor}><Icon name="arrow-left" size={16} /></Button><div><span className="tc-eyebrow">North studio</span><h2>{screen === "create" ? "Create a channel" : "Channel details"}</h2></div></header><div className="tc-editor-scroll"><p>{screen === "create" ? "Give a shared conversation a clear home. New channels are added to this local workspace." : "Keep the name and purpose useful for everyone in this sample workspace."}</p><Input ref={nameBox} label="Channel name" required maxLength={40} value={name} aria-invalid={Boolean(error)} feedback={error || "Lowercase words, separated by hyphens."} onChange={event => { setName(event.target.value); setError(""); }} placeholder="project-notes" /><Textarea label="Channel purpose" maxLength={300} rows={4} value={topic} onChange={event => setTopic(event.target.value)} placeholder="What belongs here?" /><Card className="tc-editor-note"><Icon name="users" size={24} /><h3>A shared place, in this tab</h3><p>Names and messages are sample data. Your edits do not send notifications or invite anyone.</p></Card></div><footer className="tc-editor-actions"><Button type="submit" disabled={!name.trim()}>{screen === "create" ? "Create channel" : "Save changes"}<Icon name="arrow-right" size={16} /></Button><Button variant="ghost" onClick={closeEditor}>Cancel</Button></footer></form> : <>
        <section className="tc-channel" aria-label="Channel conversation"><header className="tc-channel-head"><Button className="tc-back tc-icon" variant="ghost" aria-label="Back to channels" onClick={backToChannels}><Icon name="arrow-left" size={16} /></Button><div><span className="tc-eyebrow">North studio / Channel</span><h2 tabIndex={-1} ref={heading}><Icon name="hash" size={24} />{current.name}</h2></div><Button ref={aboutButton} variant="ghost" className="tc-icon" aria-label="Channel details" onClick={editChannel}><Icon name="info" size={16} /></Button></header><div className="tc-message-scroll" ref={messageScroll}><div className="tc-message-measure"><div className="tc-channel-intro"><p>{current.topic || "A new space for your team’s conversation."}</p><span>Sample conversation · Today</span></div>{current.messages.length ? current.messages.map(message => <article className="tc-message" data-message={message.id} key={message.id}><div className="tc-message-author"><Avatar initials={message.initials} aria-hidden="true" /><strong>{message.author}</strong><span>{message.time}</span>{message.pinned && <span className="tc-pinned"><Icon name="bookmark" size={12} />Pinned</span>}</div><p>{message.text}</p><div className="tc-message-actions"><Button className="tc-open-thread" variant="ghost" ref={element => { if (element) threadButtons.current.set(message.id, element); else threadButtons.current.delete(message.id); }} aria-label={`Open thread from ${message.author}: ${message.text}`} onClick={() => openThread(message)}><Icon name="reply" size={16} /><span>{message.replies.length ? `${message.replies.length} ${message.replies.length === 1 ? "reply" : "replies"}` : "Reply"}</span></Button><Button className="tc-ack tc-icon" variant="ghost" aria-label={message.acknowledged ? `Remove acknowledgement for ${message.author}’s message` : `Acknowledge ${message.author}’s message`} aria-pressed={Boolean(message.acknowledged)} onClick={() => toggleFlag(message, "acknowledged")}><Icon name="check" size={16} /></Button></div></article>) : <div className="tc-empty"><Icon name="message" size={24} /><h3>The conversation starts here</h3><p>Share a question, a decision, or a little work in progress.</p></div>}</div></div><form className="tc-composer" onSubmit={send}><Textarea ref={messageBox} aria-label="Message channel" placeholder={`Message #${current.name}`} value={current.draft} rows={2} maxLength={2000} onChange={event => updateChannel(channel => ({ ...channel, draft: event.target.value }))} onKeyDown={event => composerKey(event, send)} /><div><span>Local messages · ⌘ / Ctrl + Enter</span><Button type="submit" disabled={!current.draft.trim()}><span>Send</span><Icon name="send" size={16} /></Button></div></form></section>
        {selectedMessage ? <section className="tc-thread" aria-label="Message thread"><header className="tc-thread-head"><Button variant="ghost" className="tc-icon" aria-label="Back to channel" onClick={closeThread}><Icon name="arrow-left" size={16} /></Button><div><span className="tc-eyebrow">#{current.name}</span><h2 ref={threadHeading} tabIndex={-1}>Thread</h2></div><span>{selectedMessage.replies.length} {selectedMessage.replies.length === 1 ? "reply" : "replies"}</span></header><div className="tc-reply-scroll" ref={replyScroll}><article className="tc-thread-original"><div className="tc-message-author"><Avatar initials={selectedMessage.initials} aria-hidden="true" /><strong>{selectedMessage.author}</strong><span>{selectedMessage.time}</span></div><p>{selectedMessage.text}</p><Button variant="ghost" className="tc-pin" aria-pressed={Boolean(selectedMessage.pinned)} onClick={() => toggleFlag(selectedMessage, "pinned")}><Icon name="bookmark" size={16} />{selectedMessage.pinned ? "Pinned message" : "Pin message"}</Button></article><div className="tc-replies">{selectedMessage.replies.length ? selectedMessage.replies.map(reply => <article className="tc-reply" key={reply.id}><div className="tc-message-author"><Avatar initials={reply.initials} aria-hidden="true" /><strong>{reply.author}</strong><span>{reply.time}</span></div><p>{reply.text}</p></article>) : <p className="tc-no-replies">No replies yet. Keep the follow-up here, with its context.</p>}</div></div><form className="tc-reply-composer" onSubmit={sendReply}><Textarea ref={replyBox} aria-label="Reply in thread" placeholder="Add a reply…" rows={2} maxLength={2000} value={replyDraft} onChange={event => { if (threadId) setReplyDrafts(drafts => ({ ...drafts, [threadId]: event.target.value })); }} onKeyDown={event => composerKey(event, sendReply)} /><Button type="submit" disabled={!replyDraft.trim()} aria-label="Send reply">Reply<Icon name="send" size={16} /></Button></form></section> : <aside className="tc-context" aria-label="Channel overview"><span className="tc-context-mark"><Icon name="hash" size={24} /></span><span className="tc-eyebrow">A little context</span><h2>Good work happens in the open</h2><p>Keep questions near the work. Use a thread when the conversation needs a closer look.</p><div className="tc-context-facts"><div><span>Messages</span><strong>{current.messages.length}</strong></div><div><span>Pinned notes</span><strong>{current.messages.filter(message => message.pinned).length}</strong></div><div><span>Sample members</span><strong>{PEOPLE.length}</strong></div></div><Button variant="ghost" onClick={editChannel}>Edit channel details<Icon name="arrow-right" size={16} /></Button></aside>}
      </>}
    </div><footer className="tc-footer"><span><Icon name="terminal" size={12} />Local demo</span><span>Messages stay in this tab</span></footer><p className="tc-announcement" role="status">{announcement}</p>
  </section>;
}
