"use client";

import * as React from "react";
import { Button, Card, Icon, Input } from "@noorddev/vlak-react";
import { Brand } from "../mark";
import { Face, type FaceId } from "../people";
import { interfaceBySlug } from "../catalog";
import { InspectorClose } from "../inspector-close";

const WHAT = interfaceBySlug("wall")!.what;

type Post = {
  id: string;
  who: FaceId;
  name: string;
  when: string;
  text: string;
  photo?: string;
  ratio?: string;
  likes: number;
};

type Inspect = { kind: "post"; id: string } | { kind: "profile"; who: FaceId } | null;

const FEED: Post[] = [
  {
    id: "m1",
    who: "aziez",
    name: "Mara",
    when: "09:14",
    text: "First proofs for the autumn poster series. The heavier paper keeps the black beautifully sharp.",
    photo: "/interfaces/threads/press-sheet-v2.jpg",
    ratio: "4 / 5",
    likes: 12,
  },
  {
    id: "m2",
    who: "jenny",
    name: "Inez",
    when: "09:02",
    text: "Taking the posters outside this afternoon to check the type at a distance. Studio walls only tell you so much.",
    likes: 8,
  },
  {
    id: "m3",
    who: "jenny",
    name: "Inez",
    when: "08:41",
    text: "Three directions from yesterday’s print session. I’m leaning toward the second composition.",
    photo: "/interfaces/threads/posters-v2.jpg",
    ratio: "1 / 1",
    likes: 5,
  },
  {
    id: "m4",
    who: "koen",
    name: "Elias",
    when: "08:12",
    text: "The new batch is ready. Registration looks consistent across all 200 copies.",
    likes: 3,
  },
  {
    id: "m5",
    who: "gianpiero",
    name: "Tomas",
    when: "07:55",
    text: "A few sheets from this morning’s press check. The small details survived the first run.",
    photo: "/interfaces/threads/press-sheet-v2.jpg",
    ratio: "5 / 4",
    likes: 7,
  },
  {
    id: "m6",
    who: "koen",
    name: "Elias",
    when: "07:40",
    text: "Does anyone have a favourite uncoated stock for a folded programme? Looking for something around 120 gsm.",
    likes: 9,
  },
  {
    id: "m7",
    who: "gianpiero",
    name: "Tomas",
    when: "07:11",
    text: "Final selection for the foyer. These go up on Friday, just in time for opening night.",
    photo: "/interfaces/threads/posters-v2.jpg",
    ratio: "3 / 4",
    likes: 4,
  },
];

const PEOPLE: { id: FaceId; name: string; line: string }[] = [
  { id: "aziez", name: "Mara", line: "Graphic designer" },
  { id: "jenny", name: "Inez", line: "Art director" },
  { id: "koen", name: "Elias", line: "Print production" },
  { id: "gianpiero", name: "Tomas", line: "Studio manager" },
];

const COMMENTS: Record<string, { who: FaceId; name: string; text: string }[]> = {
  m1: [
    { who: "jenny", name: "Inez", text: "Which weight did you settle on?" },
    { who: "aziez", name: "Mara", text: "170 gsm. Much less show-through than the first test." },
    { who: "koen", name: "Elias", text: "We have enough for the full run." },
  ],
  m2: [
    { who: "gianpiero", name: "Tomas", text: "I can help carry them over after lunch." },
    { who: "koen", name: "Elias", text: "Bring the smaller version too, for comparison." },
  ],
  m3: [{ who: "aziez", name: "Mara", text: "Second one for me too. The title has more room." }],
  m4: [{ who: "jenny", name: "Inez", text: "Great. I’ll pick them up at 16:00." }],
  m5: [{ who: "koen", name: "Elias", text: "The fine lines are holding up well." }],
  m6: [{ who: "aziez", name: "Mara", text: "I have a few samples in the studio. I’ll bring them tomorrow." }],
  m7: [{ who: "jenny", name: "Inez", text: "Approved. The venue has confirmed the wall space." }],
};

export function Board() {
  const [post, setPost] = React.useState("m1");
  const [inspect, setInspect] = React.useState<Inspect>(null);
  const [phonePane, setPhonePane] = React.useState<"feed" | "people">("feed");
  const [liked, setLiked] = React.useState<string[]>([]);
  const [comments, setComments] = React.useState(COMMENTS);
  const [draft, setDraft] = React.useState("");
  const board = React.useRef<HTMLElement>(null);
  const history = React.useRef<{ inspect: Inspect; trigger: HTMLElement | null }[]>([]);
  const commentList = React.useRef<HTMLDivElement>(null);
  const item = FEED.find((row) => row.id === (inspect?.kind === "post" ? inspect.id : post)) ?? FEED[0]!;
  const personId = inspect?.kind === "profile" ? inspect.who : item.who;
  const person = PEOPLE.find((row) => row.id === personId) ?? PEOPLE[0]!;
  const notes = comments[inspect?.kind === "post" ? inspect.id : post] ?? [];

  function openInspector(next: Exclude<Inspect, null>) {
    history.current.push({ inspect, trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null });
    setInspect(next);
    requestAnimationFrame(() => {
      const back = board.current?.querySelector<HTMLButtonElement>(".sc-wall-mobile-back");
      if (back?.getClientRects().length) back.focus();
    });
  }

  function closeInspector() {
    const previous = history.current.pop();
    setInspect(previous?.inspect ?? null);
    requestAnimationFrame(() => {
      if (previous?.trigger?.isConnected) previous.trigger.focus();
      else {
        const key = previous?.trigger?.dataset.focusKey;
        if (key) board.current?.querySelector<HTMLButtonElement>(`[data-focus-key="${key}"]`)?.focus();
      }
    });
  }

  function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setComments((current) => ({ ...current, [item.id]: [...(current[item.id] ?? []), { who: "jenny", name: "You", text: draft.trim() }] }));
    setDraft("");
    requestAnimationFrame(() => commentList.current?.scrollTo({ top: commentList.current.scrollHeight }));
  }

  function openPost(id: string) {
    setPost(id);
    setDraft("");
    openInspector({ kind: "post", id });
  }

  function openProfile(id: FaceId) {
    openInspector({ kind: "profile", who: id });
  }

  return (
    <section ref={board} className="if-board sc-wall" data-pane={phonePane} data-inspecting={Boolean(inspect)} aria-label={WHAT}>
      <header className="sc-wall-mobile-head">
        {inspect ? <Button variant="ghost" className="sc-wall-mobile-back" style={{ width: "auto", padding: "0 8px" }} onClick={closeInspector}>
          <Icon name="arrow-left" size={16} />Back
        </Button> : null}
        <div><h2>{inspect ? inspect.kind === "post" ? "Comments" : person.name : phonePane === "feed" ? "Studio journal" : "People"}</h2>
          {!inspect ? <p>{phonePane === "feed" ? "Work in progress, shared together" : "Four people in your studio"}</p> : null}
        </div>
      </header>
      <aside className="sc-wall-rail" aria-label="People">
        <div className="sc-wall-brand">
          <Brand slug="wall" />
          <p className="sc-wall-voice">Studio feed</p>
        </div>
        <p className="sc-wall-label if-ico-row">
          <Icon name="users" size={12} />
          People
        </p>
        {PEOPLE.map((row) => (
          <button
            key={row.id}
            type="button"
            className="sc-wall-person"
            aria-current={inspect?.kind === "profile" && inspect.who === row.id}
            onClick={() => openProfile(row.id)}
          >
            <Face who={row.id} />
            <span>
              <b>{row.name}</b>
              <i>{row.line}</i>
            </span>
          </button>
        ))}
      </aside>

      <section className="sc-wall-feed" aria-label="Feed">
        <div className="sc-wall-faces" role="group" aria-label="People">
          {PEOPLE.map((row) => (
            <button
              key={row.id}
              type="button"
              className="sc-wall-person"
              aria-current={inspect?.kind === "profile" && inspect.who === row.id}
              onClick={() => openProfile(row.id)}
            >
              <Face who={row.id} />
              <span>
                <b>{row.name}</b>
              </span>
            </button>
          ))}
        </div>
        <header className="sc-wall-head">
          <p className="if-ico-row">
            <Icon name="rows" size={16} />
            Today
          </p>
        </header>
        <div className="sc-wall-stream">
          {FEED.map((row) => (
            <article key={row.id}>
              <Card className={`sc-wall-card${post === row.id ? " is-on" : ""}${["m1", "m3", "m4", "m5"].includes(row.id) ? " sc-wall-v1" : ""}`}>
              <button type="button" className="sc-wall-open" aria-label={`Read ${row.name}’s post and comments`} onClick={() => openPost(row.id)}>
                {row.photo ? <img src={row.photo} alt="" loading="lazy" decoding="async" /> : null}
                <span className="sc-wall-v1-line">
                  {row.name} · {row.when}
                </span>
                <span className="sc-wall-who">
                  <Face who={row.who} />
                  <b>{row.name}</b>
                  <i className="if-ico-row">
                    <Icon name="clock" size={12} />
                    {row.when}
                  </i>
                </span>
                <p>{row.text}</p>
              </button>
              <div className="sc-wall-actions">
                <Button variant="ghost" aria-label={`Like ${row.name}’s post`} aria-pressed={liked.includes(row.id)} style={{ width: "auto", padding: "0 10px" }} onClick={() => setLiked((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])}>
                  <Icon name="thumbs-up" size={16} />{row.likes + Number(liked.includes(row.id))}
                </Button>
                <Button variant="ghost" aria-label={`Comments on ${row.name}’s post`} style={{ width: "auto", padding: "0 10px" }} onClick={() => openPost(row.id)}>
                  <Icon name="message" size={16} />{(comments[row.id] ?? []).length}<span>comments</span>
                </Button>
              </div>
              </Card>
            </article>
          ))}
        </div>
      </section>

      <nav className="sc-wall-mobile-tabs" aria-label="Journal sections">
        <Button variant="ghost" aria-pressed={phonePane === "feed"} style={{ width: "auto" }} onClick={() => setPhonePane("feed")}><Icon name="rows" size={16} />Feed</Button>
        <Button variant="ghost" aria-pressed={phonePane === "people"} style={{ width: "auto" }} onClick={() => setPhonePane("people")}><Icon name="users" size={16} />People</Button>
      </nav>

      <aside className={`if-inspect${inspect ? " is-open" : ""}`} aria-label={inspect?.kind === "profile" ? "Profile" : "Comments"}>
        {inspect ? <InspectorClose onClick={closeInspector} /> : null}
        {inspect?.kind === "profile" ? (
          <div key={person.id} className="sc-wall-inspect sc-fresh">
            <p className="sc-wall-label if-ico-row">
              <Icon name="user" size={12} />
              Profile
            </p>
            <div className="sc-wall-face">
              <Face who={person.id} size={48} />
              <b>{person.name}</b>
              <i>{person.line}</i>
            </div>
            <p>{person.name} shares work in progress and updates from the studio.</p>
          </div>
        ) : inspect?.kind === "post" ? (
          <div key={item.id} className="sc-wall-comments sc-fresh">
          <div className="sc-wall-inspect" ref={commentList}>
            <p className="sc-wall-label if-ico-row">
              <Icon name="message" size={12} />
              Comments
            </p>
            <article className="sc-wall-original">
              <b>{item.name}</b>
              <p>{item.text}</p>
              {item.photo ? <img src={item.photo} alt="Printed poster composition" /> : null}
            </article>
            <div className="sc-wall-note-list" aria-live="polite" aria-relevant="additions">
            {notes.map((row, index) => (
              <article key={`${row.name}-${index}`} className="sc-wall-note">
                <Face who={row.who} />
                <span>
                  {row.name === "You" ? <b>You</b> : <button type="button" className="sc-wall-note-author" data-focus-key={`comment-${index}`} onClick={() => openProfile(row.who)}>{row.name}</button>}
                  {row.text}
                </span>
              </article>
            ))}
            </div>
          </div>
          <form className="sc-wall-comment-dock" onSubmit={addComment}>
            <Input value={draft} aria-label="Add a comment" placeholder="Add a comment" enterKeyHint="send" onChange={(event) => setDraft(event.target.value)} />
            <Button type="submit" style={{ width: 44, padding: 0 }} aria-label="Post comment" disabled={!draft.trim()}><Icon name="send" size={16} /></Button>
          </form>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
