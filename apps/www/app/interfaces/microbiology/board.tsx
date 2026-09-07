"use client";

import * as React from "react";
import { Button, Card, ColonyPlate, CultureLog, Icon, Input, Textarea, ToggleGroup } from "@noorddev/vlak-react";
import type { ColonyMarker, CultureObservation } from "@noorddev/vlak-react";

const cultures = [
  { id: "C-042", sample: "S-204", name: "Courtyard collection", medium: "Source medium A", count: 12, label: "Plate 042", context: "Collection north · 04 Sep", markers: [
    { id: "042-1", label: "Record 01", x: 28, y: 36, description: "Round outline · source note" },
    { id: "042-2", label: "Record 02", x: 62, y: 28, description: "Irregular outline · source note" },
    { id: "042-3", label: "Record 03", x: 56, y: 67, description: "Small outline · source note" },
    { id: "042-4", label: "Record 04", x: null, y: null, description: "Position was not recorded" },
  ] },
  { id: "C-043", sample: "S-205", name: "Window collection", medium: "Source medium B", count: 6, label: "Plate 043", context: "Collection east · 04 Sep", markers: [
    { id: "043-1", label: "Record 01", x: 42, y: 38, description: "Round outline · source note" },
    { id: "043-2", label: "Record 02", x: 67, y: 59, description: "Small outline · source note" },
  ] },
  { id: "C-044", sample: "S-206", name: "Blank record", medium: "Source medium A", count: 0, label: "Plate 044", context: "Collection blank · 04 Sep", markers: [] },
] satisfies { id: string; sample: string; name: string; medium: string; count: number; label: string; context: string; markers: ColonyMarker[] }[];

type Note = { id: string; dateTime: string; text: string; record: string };
type Screen = "cultures" | "plate" | "notebook";

export function MicrobiologyBoard() {
  const [cultureId, setCultureId] = React.useState("C-042");
  const [colonyId, setColonyId] = React.useState<string | null>(null);
  const [screen, setScreen] = React.useState<Screen>("cultures");
  const [view, setView] = React.useState("plate");
  const [query, setQuery] = React.useState("");
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [notes, setNotes] = React.useState<Record<string, Note[]>>({});
  const [reviews, setReviews] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState("");
  const culture = cultures.find(item => item.id === cultureId)!;
  const colony = culture.markers.find(item => item.id === colonyId);
  const noteKey = `${culture.id}/${colony?.id ?? "culture"}`;
  const draft = drafts[noteKey] ?? "";
  const saved = notes[culture.id] ?? [];
  const heading = React.useRef<HTMLHeadingElement>(null);
  const notebookHeading = React.useRef<HTMLHeadingElement>(null);
  const queueButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const plate = React.useRef<HTMLElement>(null);
  const notebookButton = React.useRef<HTMLButtonElement>(null);
  const openedByColony = React.useRef(false);

  function openCulture(id: string) {
    setCultureId(id); setColonyId(null); setScreen("plate"); setView("plate");
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function openNotebook(fromColony = false) {
    openedByColony.current = fromColony; setScreen("notebook");
    requestAnimationFrame(() => notebookHeading.current?.focus({ preventScroll: true }));
  }
  function backToPlate() {
    setScreen("plate");
    requestAnimationFrame(() => {
      const record = plate.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
      (openedByColony.current && record ? record : notebookButton.current)?.focus({ preventScroll: true });
    });
  }
  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const note: Note = { id: `note-${Date.now()}-${saved.length}`, dateTime: new Date().toISOString(), text: draft.trim(), record: colony?.label ?? "Culture" };
    setNotes(current => ({ ...current, [culture.id]: [...(current[culture.id] ?? []), note] }));
    setDrafts(current => ({ ...current, [noteKey]: "" }));
    setReviews(current => ({ ...current, [culture.id]: false }));
    setMessage(`Note saved locally for ${culture.id}, ${note.record}. Review reopened.`);
  }
  const observations: CultureObservation[] = [
    { id: "received", label: "Source record received", dateTime: "2026-09-04T09:10:00Z", timeLabel: "04 Sep · 09:10 UTC", status: "Recorded", notes: `${culture.count} colonies in the source record. ${culture.markers.length} marker records supplied.` },
    { id: "image", label: "Plate positions transcribed", dateTime: "2026-09-04T11:20:00Z", timeLabel: "04 Sep · 11:20 UTC", notes: "Positions reflect the supplied record. No automated detection was run." },
    ...saved.map(note => ({ id: note.id, label: `${note.record} · notebook entry`, dateTime: note.dateTime, timeLabel: "This session", notes: note.text, status: "Local note" })),
  ];

  return <section className="mi" data-screen={screen} aria-label="Microbiology workspace">
    <header className="mi-header"><div className="mi-workspace"><Icon name="layers" size={24} /><div><strong>Collection notebook</strong><span>September field records</span></div></div><span className="mi-local">Local collection</span></header>
    <div className="mi-body">
      <aside className="mi-collection" aria-label="Culture collection">
        <Card className="mi-total"><span>Collection 09 / 26</span><strong>03<span> cultures</span></strong><p>Source records, ready to inspect</p></Card>
        <div className="mi-search"><Input label="Find a culture" type="search" placeholder="Name or sample" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <div className="mi-list">{cultures.filter(item => `${item.name} ${item.id} ${item.sample}`.toLowerCase().includes(query.toLowerCase())).map(item => <button key={item.id} type="button" ref={node => { if (node) queueButtons.current.set(item.id, node); else queueButtons.current.delete(item.id); }} className="mi-culture" aria-current={item.id === cultureId ? "true" : undefined} onClick={() => openCulture(item.id)}><span>{item.id}<Icon name="chevron-right" size={16} /></span><strong>{item.name}</strong><span>{item.sample} · {reviews[item.id] ? "Reviewed locally" : "Needs review"}</span></button>)}
          {!cultures.some(item => `${item.name} ${item.id} ${item.sample}`.toLowerCase().includes(query.toLowerCase())) && <p className="mi-empty">No matching cultures. Try a sample number.</p>}
        </div><p className="mi-collection-foot">Fictional samples · no live instruments</p>
      </aside>
      <section className="mi-detail" aria-label="Selected culture">
        <div className="mi-detail-head"><Button variant="ghost" className="mi-mobile" onClick={() => { setScreen("cultures"); requestAnimationFrame(() => queueButtons.current.get(culture.id)?.focus({ preventScroll: true })); }}><Icon name="arrow-left" size={16} />Cultures</Button><div><span className="mi-eyebrow">{culture.id} / {culture.sample}</span><h2 tabIndex={-1} ref={heading}>{culture.name}</h2><p>{culture.context}</p></div><span className="mi-review-state">{reviews[culture.id] ? "Reviewed locally" : "Needs review"}</span></div>
        <div className="mi-view"><ToggleGroup aria-label="Culture view" value={view} onValueChange={setView} options={[{ value: "plate", label: "Plate records" }, { value: "history", label: "History" }]} /><span>{saved.length} local notes</span></div>
        <div className="mi-detail-scroll">{view === "plate" ? <><ColonyPlate ref={plate} label={culture.label} source="Transcribed source record · illustrative positions" markers={culture.markers} recordedCount={culture.count} value={colonyId} onValueChange={id => { setColonyId(id); if (id) openNotebook(true); }} /><div className="mi-source-note"><Icon name="info" size={16} /><p>Source counts and supplied markers are separate records. Select a marker to add context; the source record stays intact.</p></div></> : <CultureLog label="Observation history" cultureId={culture.id} sampleId={culture.sample} medium={culture.medium} status={reviews[culture.id] ? "Reviewed locally" : "Needs review"} observations={observations} order="newest" />}</div>
        <div className="mi-detail-actions"><span>{colony ? `${colony.label} selected` : "Culture-level notebook"}</span><Button ref={notebookButton} onClick={() => openNotebook()}><Icon name="file" size={16} />Open notebook</Button></div>
      </section>
      <section className="mi-notebook" aria-label="Observation notebook">
        <header className="mi-notebook-head"><Button variant="ghost" onClick={backToPlate} aria-label="Back to plate"><Icon name="arrow-left" size={16} /></Button><div><span className="mi-eyebrow">{culture.id} / {colony?.label ?? "Culture"}</span><h2 ref={notebookHeading} tabIndex={-1}>Observation notebook</h2></div></header>
        <form className="mi-note-form" onSubmit={saveNote}><div className="mi-note-scroll"><Card className="mi-record-card"><span>Selected source record</span><strong>{colony?.label ?? culture.label}</strong><p>{colony?.description ?? `${culture.count} colonies recorded in the source.`}</p>{colony && <p>{colony.x == null || colony.y == null ? "Position not supplied" : `Position x ${colony.x}%, y ${colony.y}%`}</p>}</Card><Textarea label="Observation note" value={draft} onChange={event => setDrafts(current => ({ ...current, [noteKey]: event.target.value }))} rows={5} maxLength={1200} required placeholder="Describe what this record needs next…" feedback="Saved in this session. A note reopens the culture review." /><div className="mi-saved-notes"><h3>Saved in this session</h3>{saved.length ? <ol>{saved.map(note => <li key={note.id}><strong>{note.record}</strong><p>{note.text}</p></li>)}</ol> : <p>No local notes yet.</p>}</div><Button variant="ghost" disabled={reviews[culture.id]} onClick={() => { setReviews(current => ({ ...current, [culture.id]: true })); setMessage(`${culture.id} reviewed locally. Source observations are unchanged.`); }}>{reviews[culture.id] ? <><Icon name="check" size={16} />Reviewed locally</> : "Mark culture reviewed"}</Button></div><footer className="mi-note-actions"><span>{draft.length}/1200</span><Button type="submit" disabled={!draft.trim()}>Save note<Icon name="check" size={16} /></Button></footer></form>
      </section>
    </div>
    <nav className="mi-mobile-nav" aria-label="Microbiology screens">{([['cultures', 'Cultures'], ['plate', 'Plate'], ['notebook', 'Notebook']] as const).map(([value, label]) => <Button key={value} variant={screen === value ? "primary" : "ghost"} aria-current={screen === value ? "page" : undefined} onClick={() => { setScreen(value); if (value === "notebook") openedByColony.current = false; }}>{label}</Button>)}</nav>
    <footer className="mi-status"><span>{culture.id} · {culture.sample}</span><span>Fictional records · session only</span></footer><p className="mi-announcement" role="status">{message}</p>
  </section>;
}
