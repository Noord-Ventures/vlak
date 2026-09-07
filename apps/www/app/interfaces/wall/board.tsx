"use client";

import * as React from "react";
import { Button, Card, Icon, Input, Select, Textarea, ToggleGroup } from "@noorddev/vlak-react";
import { Face, type FaceId } from "../people";

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

type Inspect = { kind: "post"; id: string } | { kind: "profile"; who: FaceId } | { kind: "compose" } | null;

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
  const [posts, setPosts] = React.useState(FEED);
  const [inspect, setInspect] = React.useState<Inspect>(null);
  const [screen, setScreen] = React.useState<"feed" | "people">("feed");
  const [filter, setFilter] = React.useState("all");
  const [contributor, setContributor] = React.useState("all");
  const [liked, setLiked] = React.useState<string[]>([]);
  const [following, setFollowing] = React.useState<FaceId[]>(["aziez", "jenny"]);
  const [comments, setComments] = React.useState(COMMENTS);
  const [draft, setDraft] = React.useState("");
  const [postDraft, setPostDraft] = React.useState("");
  const [notice, setNotice] = React.useState("Fictional studio · Changes stay in this tab");
  const board = React.useRef<HTMLElement>(null);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const detailHeading = React.useRef<HTMLHeadingElement>(null);
  const commentList = React.useRef<HTMLDivElement>(null);
  const postSequence = React.useRef(0);
  const history = React.useRef<{ inspect: Inspect; trigger: HTMLElement | null }[]>([]);
  const composeId = React.useId();
  const item = posts.find(row => row.id === (inspect?.kind === "post" ? inspect.id : "m1")) ?? posts[0]!;
  const person = PEOPLE.find(row => row.id === (inspect?.kind === "profile" ? inspect.who : item.who)) ?? PEOPLE[0]!;
  const notes = comments[item.id] ?? [];
  const visible = posts.filter(row => (contributor === "all" || row.who === contributor) && (filter === "all" || Boolean(row.photo)));

  function open(next: Exclude<Inspect, null>) {
    history.current.push({ inspect, trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null });
    setInspect(next);
    if (next.kind === "post") setDraft("");
    requestAnimationFrame(() => detailHeading.current?.focus({ preventScroll: true }));
  }
  function back() {
    const previous = history.current.pop();
    setInspect(previous?.inspect ?? null);
    requestAnimationFrame(() => {
      if (previous?.trigger?.isConnected) previous.trigger.focus();
      else {
        const key = previous?.trigger?.dataset.sfFocus;
        const target = key ? [...(board.current?.querySelectorAll<HTMLButtonElement>("[data-sf-focus]") ?? [])].find(element => element.dataset.sfFocus === key) : null;
        (target ?? heading.current)?.focus();
      }
    });
  }
  function browse(next: "feed" | "people") {
    setScreen(next); setInspect(null); history.current = [];
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function addComment(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim(); if (!text) return;
    setComments(current => ({ ...current, [item.id]: [...(current[item.id] ?? []), { who: "jenny", name: "You", text }] }));
    setDraft(""); setNotice("Comment added locally");
    requestAnimationFrame(() => commentList.current?.scrollTo({ top: commentList.current.scrollHeight }));
  }
  function publish(event: React.FormEvent) {
    event.preventDefault();
    const text = postDraft.trim(); if (!text) return;
    setPosts(current => [{ id: `local-${++postSequence.current}`, who: "jenny", name: "You", when: "Just now", text, likes: 0 }, ...current]);
    setPostDraft(""); setContributor("all"); setFilter("all"); browse("feed");
    setNotice("Your update was published in this local feed");
    requestAnimationFrame(() => board.current?.querySelector(".sf-stream")?.scrollTo({ top: 0 }));
  }
  function toggleLike(row: Post) {
    setLiked(current => current.includes(row.id) ? current.filter(id => id !== row.id) : [...current, row.id]);
    setNotice(liked.includes(row.id) ? "Like removed locally" : "Like added locally");
  }
  const peopleList = <div className="sf-people-list">{PEOPLE.map(row => <Button key={row.id} variant="ghost" className="sf-person" data-sf-focus={`person-${row.id}`} onClick={() => open({ kind: "profile", who: row.id })}><Face who={row.id} /><span><strong>{row.name}</strong><span>{row.line}</span></span><Icon name="arrow-right" /></Button>)}</div>;

  return <section ref={board} className="sf" data-screen={screen} data-detail={inspect?.kind ?? "none"} aria-label="Studio journal workspace">
    <header className="sf-header"><div className="sf-context"><span className="sf-mark"><Icon name="rows" size={24} /></span><div><strong>Studio 03</strong><span>A shared work journal</span></div></div><Button className="sf-create" onClick={() => open({ kind: "compose" })}><Icon name="plus" /><span>New post</span></Button></header>
    <div className="sf-body">
      <section className="sf-main" aria-label={screen === "feed" ? "Studio feed" : "Studio people"}>
        <header className="sf-main-header"><div><span className="sf-eyebrow">Tuesday, 8 September</span><h2 ref={heading} tabIndex={-1}>{screen === "feed" ? "In the studio" : "The people behind it"}</h2></div><nav className="sf-desktop-nav" aria-label="Journal sections"><Button variant="ghost" aria-pressed={screen === "feed"} onClick={() => browse("feed")}>Feed</Button><Button variant="ghost" aria-pressed={screen === "people"} onClick={() => browse("people")}>People</Button></nav></header>
        {screen === "feed" ? <><div className="sf-filters"><ToggleGroup aria-label="Post type" value={filter} options={[{ value: "all", label: "All updates" }, { value: "photos", label: "Photos" }]} onValueChange={setFilter} /><Select aria-label="Contributor" fullWidth value={contributor} options={[{ value: "all", label: "Everyone" }, ...PEOPLE.map(row => ({ value: row.id, label: row.name }))]} onValueChange={setContributor} /></div><div className="sf-stream">
          <p className="sf-feed-count">{visible.length} {visible.length === 1 ? "update" : "updates"} · Work in progress</p>
          {visible.length ? visible.map(row => <article key={row.id} className="sf-post" data-post={row.id}><Card><div className="sf-post-head"><Button variant="ghost" className="sf-author" aria-label={`View ${row.name === "You" ? "Inez" : row.name}’s profile`} data-sf-focus={`author-${row.id}`} onClick={() => open({ kind: "profile", who: row.who })}><Face who={row.who} /><span><strong>{row.name}</strong><span>{row.when}</span></span></Button><span className="sf-post-tag">Studio update</span></div><p className="sf-post-copy">{row.text}</p>{row.photo && <Button variant="ghost" className="sf-post-photo" aria-label={`Read ${row.name}’s post and comments`} data-sf-focus={`photo-${row.id}`} onClick={() => open({ kind: "post", id: row.id })}><img src={row.photo} alt="Printed poster compositions from the fictional studio" loading="lazy" /></Button>}<div className="sf-post-actions"><Button variant="ghost" aria-label={`Like ${row.name}’s post`} aria-pressed={liked.includes(row.id)} onClick={() => toggleLike(row)}><Icon name="thumbs-up" /><span>{row.likes + Number(liked.includes(row.id))}</span></Button><Button variant="ghost" data-sf-focus={`comments-${row.id}`} aria-label={`Comments on ${row.name}’s post`} onClick={() => open({ kind: "post", id: row.id })}><Icon name="message" /><span>{(comments[row.id] ?? []).length} comments</span></Button></div></Card></article>) : <div className="sf-empty"><Icon name="rows" size={24} /><h3>No updates in this view</h3><p>Try a different contributor or include text updates.</p><Button variant="ghost" onClick={() => { setContributor("all"); setFilter("all"); }}>Show all updates</Button></div>}
        </div></> : <div className="sf-people-screen"><p>Four collaborators sharing ideas, proofs, and progress.</p>{peopleList}<p className="sf-small">All people and posts in this example are fictional.</p></div>}
      </section>
      <aside className="sf-side" aria-label={inspect?.kind === "post" ? "Comments" : inspect?.kind === "profile" ? "Contributor profile" : inspect?.kind === "compose" ? "New post" : "Studio context"}>
        {inspect ? <header className="sf-detail-header"><Button variant="ghost" className="sf-back" onClick={back}><Icon name="arrow-left" />Back</Button><h2 ref={detailHeading} tabIndex={-1}>{inspect.kind === "post" ? "Conversation" : inspect.kind === "profile" ? "Contributor" : "Share an update"}</h2></header> : null}
        {!inspect ? <div className="sf-context-scroll"><span className="sf-eyebrow">Your circle</span><h2>Good work is shared</h2><p>A place for the small things that move a project forward.</p>{peopleList}<div className="sf-studio-note"><Icon name="pin" /><h3>On the studio table</h3><p>Autumn poster proofs, a new paper stock, and the final foyer selection.</p></div><span className="sf-small">Fictional people · Local example</span></div> : inspect.kind === "profile" ? <div className="sf-profile"><Face who={person.id} size={48} /><div><h3>{person.name}</h3><p>{person.line}</p></div><p>{person.name} shares work in progress and thoughtful notes from the studio.</p><div className="sf-profile-stats"><span><strong>{posts.filter(row => row.who === person.id).length}</strong> updates</span><span>Studio member</span></div><Button variant={following.includes(person.id) ? "ghost" : "primary"} aria-pressed={following.includes(person.id)} aria-label={`Follow ${person.name}`} onClick={() => { setFollowing(current => current.includes(person.id) ? current.filter(id => id !== person.id) : [...current, person.id]); setNotice(following.includes(person.id) ? `${person.name} removed from your local circle` : `${person.name} added to your local circle`); }}><Icon name={following.includes(person.id) ? "check" : "plus"} />Follow {person.name}</Button><span className="sf-small">{following.includes(person.id) ? "Following in this local example" : "Not following"}</span><Button variant="ghost" onClick={() => { setContributor(person.id); setFilter("all"); browse("feed"); }}>View {person.name}’s updates<Icon name="arrow-right" /></Button></div> : inspect.kind === "post" ? <><div className="sf-conversation" ref={commentList}><article className="sf-original"><span className="sf-eyebrow">{item.name} · {item.when}</span><p>{item.text}</p>{item.photo && <img src={item.photo} alt="Printed poster composition" />}</article><h3>{notes.length} {notes.length === 1 ? "comment" : "comments"}</h3><div className="sf-comments">{notes.map((row, index) => <article className="sf-comment" key={`${row.name}-${index}`}><Face who={row.who} /><div>{row.name === "You" ? <strong>You</strong> : <Button variant="ghost" className="sf-comment-author" data-sf-focus={`comment-${index}`} onClick={() => open({ kind: "profile", who: row.who })}>{row.name}</Button>}<p>{row.text}</p></div></article>)}</div></div><form className="sf-comment-dock" onSubmit={addComment}><Input value={draft} aria-label="Add a comment" placeholder="Add a comment" maxLength={500} enterKeyHint="send" onChange={event => setDraft(event.target.value)} /><Button type="submit" aria-label="Post comment" disabled={!draft.trim()}><Icon name="send" /></Button></form></> : <form id={composeId} className="sf-compose" onSubmit={publish}><div className="sf-compose-content"><div className="sf-compose-person"><Face who="jenny" /><span><strong>You</strong><span>Sharing with your studio</span></span></div><label htmlFor={`${composeId}-text`}>Your update</label><Textarea id={`${composeId}-text`} value={postDraft} onChange={event => setPostDraft(event.target.value)} placeholder="What are you working on?" rows={6} maxLength={1000} required /><span className="sf-small">{postDraft.length}/1000 characters · Text only</span><p>This creates a post in this browser tab. No external account is connected.</p></div><div className="sf-compose-actions"><Button variant="ghost" onClick={back}>Cancel</Button><Button type="submit" disabled={!postDraft.trim()}><Icon name="send" />Publish locally</Button></div></form>}
      </aside>
    </div>
    <nav className="sf-mobile-nav" aria-label="Journal sections"><Button variant="ghost" aria-pressed={screen === "feed" && !inspect} onClick={() => browse("feed")}><Icon name="rows" />Feed</Button><Button variant="ghost" aria-pressed={screen === "people" && !inspect} onClick={() => browse("people")}><Icon name="users" />People</Button></nav>
    <footer className="sf-footer"><span role="status">{notice}</span><span>No connected social account</span></footer>
  </section>;
}
