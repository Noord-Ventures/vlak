"use client";

import * as React from "react";
import { Button, Icon, Input, InputGroup } from "@noorddev/vlak-react";
import { Brand } from "../mark";
import { Face, type FaceId } from "../people";
import { interfaceBySlug } from "../catalog";
import { InspectorClose } from "../inspector-close";

const WHAT = interfaceBySlug("room")!.what;

const CHANNELS = [
  { id: "desk", name: "studio", count: 12, preview: "12 members · New client feedback" },
  { id: "press", name: "production", count: 4, preview: "4 members · Print proofs ready" },
  { id: "yard", name: "deliveries", count: 2, preview: "2 members · Morning collection" },
];

const PEOPLE: { id: FaceId; name: string; state: string; mark: "user-check" | "activity" | "moon" | "users"; extra?: boolean }[] = [
  { id: "aziez", name: "Mara", state: "In a meeting", mark: "activity" },
  { id: "jenny", name: "Inez", state: "Away", mark: "moon" },
  { id: "koen", name: "Elias", state: "In a meeting", mark: "activity", extra: true },
  { id: "gianpiero", name: "Tomas", state: "Available", mark: "user-check", extra: true },
];

type Msg = { id: string; who: FaceId; name: string; text: string; when: string; replies: number };

const LINES: Record<string, Msg[]> = {
  desk: [
    { id: "d1", who: "gianpiero", name: "Tomas", text: "The client approved the poster direction. Two small changes to the event details before we send it to print.", when: "09:14", replies: 2 },
    { id: "d2", who: "aziez", name: "Mara", text: "The updated proof is ready to review. I’ve marked both changes.", when: "09:16", replies: 0 },
    { id: "d3", who: "jenny", name: "Inez", text: "Seen. I’ll review it after lunch.", when: "09:18", replies: 1 },
    { id: "d4", who: "koen", name: "Elias", text: "I’ve booked Friday’s print slot. We need final approval by Thursday at 15:00.", when: "09:19", replies: 0 },
  ],
  press: [
    { id: "p1", who: "gianpiero", name: "Tomas", text: "The first print proof is ready. Can someone check the smaller type?", when: "08:41", replies: 1 },
    { id: "p2", who: "jenny", name: "Inez", text: "Checking now. Please wait before starting the full run.", when: "08:50", replies: 0 },
    { id: "p3", who: "koen", name: "Elias", text: "Ink density looks good on the latest sheet.", when: "08:52", replies: 0 },
  ],
  yard: [
    { id: "y1", who: "aziez", name: "Mara", text: "The courier is back. All six packages were delivered.", when: "07:12", replies: 1 },
    { id: "y2", who: "koen", name: "Elias", text: "Thanks. The next collection is at 14:00.", when: "07:20", replies: 0 },
  ],
};

const THREAD: Record<string, { who: FaceId; name: string; text: string }[]> = {
  d1: [
    { who: "aziez", name: "Mara", text: "Is that the venue address and opening time?" },
    { who: "gianpiero", name: "Tomas", text: "Exactly. Everything else is approved." },
  ],
  d3: [{ who: "koen", name: "Elias", text: "I have it." }],
  p1: [{ who: "jenny", name: "Inez", text: "I’ll check it at actual size." }],
  y1: [{ who: "koen", name: "Elias", text: "Logged." }],
};

export function Board() {
  const [channel, setChannel] = React.useState("desk");
  const [pane, setPane] = React.useState<"none" | "thread" | "person">("none");
  const [line, setLine] = React.useState("d1");
  const [who, setWho] = React.useState<FaceId>("aziez");
  const [draft, setDraft] = React.useState("");
  const [extra, setExtra] = React.useState<Record<string, Msg[]>>({});
  const [phonePane, setPhonePane] = React.useState<"channels" | "chat">("channels");
  const [threadDraft, setThreadDraft] = React.useState("");
  const [threadExtra, setThreadExtra] = React.useState<typeof THREAD>({});
  const board = React.useRef<HTMLElement>(null);
  const lines = React.useRef<HTMLDivElement>(null);
  const replyList = React.useRef<HTMLDivElement>(null);
  const history = React.useRef<{ pane: typeof pane; line: string; who: FaceId; trigger: HTMLElement | null }[]>([]);
  const box = React.useRef<HTMLInputElement>(null);
  const room = CHANNELS.find((row) => row.id === channel) ?? CHANNELS[0]!;
  const messages = [...(LINES[channel] ?? LINES.desk!), ...(extra[channel] ?? [])];
  const person = PEOPLE.find((row) => row.id === who) ?? PEOPLE[0]!;
  const selected = messages.find((row) => row.id === line) ?? messages[0]!;
  const replies = [...(THREAD[line] ?? []), ...(threadExtra[line] ?? [])];

  function focusMobileBack() {
    requestAnimationFrame(() => {
      const back = board.current?.querySelector<HTMLButtonElement>(".sc-room-mobile-back");
      if (back?.getClientRects().length) back.focus();
    });
  }

  function openPane(next: "thread" | "person", personId?: FaceId) {
    history.current.push({ pane, line, who, trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null });
    setPane(next);
    if (personId) setWho(personId);
    focusMobileBack();
  }

  function closePane() {
    const previous = history.current.pop();
    setPane(previous?.pane ?? "none");
    if (previous) {
      setWho(previous.who);
      setLine(previous.line);
    }
    requestAnimationFrame(() => {
      if (previous?.trigger?.isConnected) previous.trigger.focus();
      else {
        const key = previous?.trigger?.dataset.focusKey;
        if (key) board.current?.querySelector<HTMLButtonElement>(`[data-focus-key="${key}"]`)?.focus();
      }
    });
  }

  function openChannel(id: string, compose = false) {
    setChannel(id);
    setPane("none");
    setLine((LINES[id] ?? LINES.desk!)[0]!.id);
    setPhonePane("chat");
    history.current = [];
    if (compose) requestAnimationFrame(() => box.current?.focus());
    else focusMobileBack();
  }

  function backToChannels() {
    setPhonePane("channels");
    requestAnimationFrame(() => board.current?.querySelector<HTMLButtonElement>(`[data-channel="${channel}"]`)?.focus());
  }

  function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!threadDraft.trim()) return;
    setThreadExtra((current) => ({ ...current, [line]: [...(current[line] ?? []), { who: "jenny", name: "You", text: threadDraft.trim() }] }));
    setThreadDraft("");
    requestAnimationFrame(() => replyList.current?.scrollTo({ top: replyList.current.scrollHeight }));
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const msg: Msg = {
      id: `you-${Date.now()}`,
      who: "jenny",
      name: "Inez",
      text,
      when: "Now",
      replies: 0,
    };
    setExtra((map) => ({ ...map, [channel]: [...(map[channel] ?? []), msg] }));
    setLine(msg.id);
    requestAnimationFrame(() => lines.current?.scrollTo({ top: lines.current.scrollHeight }));
  }

  return (
    <section ref={board} className="if-board sc-room" data-pane={phonePane} data-inspecting={pane !== "none"} aria-label={WHAT}>
      <header className="sc-room-mobile-head">
        {pane !== "none" || phonePane === "chat" ? <Button variant="ghost" className="sc-room-mobile-back" style={{ width: 44, padding: 0 }} aria-label={pane !== "none" ? "Back to conversation" : "Back to channels"} onClick={pane !== "none" ? closePane : backToChannels}><Icon name="arrow-left" size={16} /></Button> : null}
        <div><h2>{pane === "person" ? person.name : pane === "thread" ? "Thread" : phonePane === "chat" ? `#${room.name}` : "Studio workspace"}</h2>
          <p>{pane === "person" ? person.state : pane === "thread" ? `#${room.name} · ${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : phonePane === "chat" ? `${room.count} members` : "Channels and people"}</p>
        </div>
        {pane === "none" && phonePane === "channels" ? <Button variant="ghost" style={{ width: 44, padding: 0 }} aria-label="Message studio" onClick={() => openChannel("desk", true)}><Icon name="edit" size={16} /></Button> : null}
      </header>
      <aside className="sc-room-rail" aria-label="People">
        <div className="sc-room-brand">
          <Brand slug="room" />
          <p className="sc-room-voice">Studio workspace</p>
        </div>
        <p className="sc-room-label if-ico-row">
          <Icon name="hash" size={12} />
          Channels
        </p>
        {CHANNELS.map((row) => (
          <button
            key={row.id}
            data-channel={row.id}
            type="button"
            className="sc-room-ch"
            aria-current={channel === row.id && pane !== "person"}
            onClick={() => openChannel(row.id)}
          >
            <b className="if-ico-row">
              <Icon name="hash" size={16} />
              <span className="sc-room-ch-hash"># </span>
              {row.name}
            </b>
            <i className="sc-room-ch-count">{row.count}</i>
            <span className="sc-room-v1-copy">{row.preview}</span>
          </button>
        ))}
        <p className="sc-room-label if-ico-row">
          <Icon name="users" size={12} />
          People
        </p>
        {PEOPLE.map((row) => (
          <button
            key={row.id}
            type="button"
            className={`sc-room-person${row.extra ? " sc-room-extra" : ""}`}
            aria-current={who === row.id && pane === "person"}
            onClick={() => openPane("person", row.id)}
          >
            <Face who={row.id} />
            <span>
              <b>{row.name}</b>
              <i className="if-ico-row">
                <Icon name={row.mark} size={12} />
                {row.state}
              </i>
            </span>
          </button>
        ))}
      </aside>

      <section className="sc-room-chat" aria-label="Channel">
        <header className="sc-room-head">
          <p className="if-ico-row">
            <Icon name="hash" size={16} />
            {room.name}
          </p>
          <span className="if-ico-row">
            <Icon name="users" size={12} />
            {room.count} members
          </span>
        </header>
        <div className="sc-room-lines" ref={lines}>
          {messages.map((row) => (
            <button
              key={row.id}
              type="button"
              className="sc-room-msg"
              aria-current={line === row.id && pane === "thread"}
              aria-label={`Open thread from ${row.name}: ${row.text}`}
              onClick={() => {
                setLine(row.id);
                setThreadDraft("");
                openPane("thread", row.who);
              }}
            >
              <Face who={row.who} />
              <span>
                <b>
                  {row.name}{" "}
                  <em className="if-ico-row">
                    <Icon name="clock" size={12} />
                    {row.when}
                  </em>
                </b>
                {row.text}
                  <i className={`if-ico-row${row.replies + (threadExtra[row.id]?.length ?? 0) === 0 ? " sc-room-start-reply" : ""}`}>
                    <Icon name="reply" size={12} />
                    {row.replies + (threadExtra[row.id]?.length ?? 0) || "Reply"} {row.replies + (threadExtra[row.id]?.length ?? 0) > 0 ? row.replies + (threadExtra[row.id]?.length ?? 0) === 1 ? "reply" : "replies" : ""}
                  </i>
              </span>
            </button>
          ))}
        </div>
      </section>

      <form
        className="sc-room-dock"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <InputGroup className="sc-room-field">
          <span className="sc-room-field-mark" aria-hidden="true"><Icon name="message" size={16} /></span>
          <Input
            ref={box}
            value={draft}
            placeholder={`Message #${room.name}`}
            aria-label="Message"
            enterKeyHint="send"
            onChange={(event) => setDraft(event.target.value)}
          />
        </InputGroup>
        <Button type="submit" size="sm" style={{ width: "auto" }} disabled={!draft.trim()}>
          <Icon name="send" size={16} />
          Send
        </Button>
      </form>

      <aside className={`if-inspect${pane !== "none" ? " is-open" : ""}`} aria-label="Thread">
        {pane !== "none" ? <InspectorClose onClick={closePane} /> : null}
        {pane === "thread" ? (
          <div key={selected.id} className="sc-room-thread sc-fresh">
          <div className="sc-room-inspect" ref={replyList}>
            <p className="sc-room-label if-ico-row">
              <Icon name="reply" size={12} />
              Thread
            </p>
            <article className="sc-room-thread-original"><b>{selected.name}</b><p className="sc-room-lead">{selected.text}</p></article>
            <div className="sc-room-reply-list" aria-live="polite" aria-relevant="additions">
            {replies.length === 0 ? <p className="sc-room-no-replies">No replies yet. Start the conversation below.</p> : null}
            {replies.map((row, index) => (
              <article key={`${row.name}-${index}`} className="sc-room-reply">
                <Face who={row.who} />
                <span>
                  {row.name === "You" ? <b>You</b> : <button type="button" className="sc-room-reply-author" data-focus-key={`reply-${index}`} onClick={() => openPane("person", row.who)}>{row.name}</button>}
                  {row.text}
                </span>
              </article>
            ))}
            </div>
          </div>
          <form className="sc-room-reply-dock" onSubmit={sendReply}>
            <Input value={threadDraft} aria-label="Reply in thread" placeholder="Reply in thread" enterKeyHint="send" onChange={(event) => setThreadDraft(event.target.value)} />
            <Button type="submit" style={{ width: 44, padding: 0 }} aria-label="Send reply" disabled={!threadDraft.trim()}><Icon name="send" size={16} /></Button>
          </form>
          </div>
        ) : null}
        {pane === "person" ? (
          <div key={person.id} className="sc-room-inspect sc-fresh">
            <p className="sc-room-label if-ico-row">
              <Icon name="user" size={12} />
              Person
            </p>
            <div className="sc-room-card">
              <Face who={person.id} size={48} />
              <b>{person.name}</b>
              <i className="if-ico-row">
                <Icon name={person.mark} size={12} />
                {person.state}
              </i>
            </div>
            <p>{person.name} is part of the studio team. Select a message to read their conversation.</p>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
