"use client";

import * as React from "react";
import { Button, Card, CoverageInspector, GenomicRegionField, Icon, SequenceAlignment, Textarea, ToggleGroup } from "@noorddev/vlak-react";
import type { AlignmentSelection, CoverageLocus, GenomicRegion } from "@noorddev/vlak-react";

const references = [
  { id: "demo-01", label: "Demo contig 01", sequence: "ACGTACGTACGTACGTACGTACGTACGTACGT", reads: ["ACGTACGTACGTACGTACGTACGTACGTACGT", "ACGTACGTACGTTCGTACGTACGTACGTACGT", "ACGTACGTACGTACGTACGTACGTACGTACGT"] },
  { id: "demo-02", label: "Demo contig 02", sequence: "TGCATGCATGCATGCATGCATGCATGCATGCA", reads: ["TGCATGCATGCATGCATGCATGCATGCATGCA", "TGCATGCATGCATGCATGCATGCATGCATGCA", "TGCATGCATGCATGCATGCATGCATGCATGCA"] },
];
const depths = [18, 20, 19, 17, 21, 22, 24, 18, 19, 23, 24, 22, 12, 18, 17, 16, 0, 14, 18, 19, null, 21, 23, 20, 18, 17, 18, 24, 20, 22, 19, 18];
type Annotation = { id: string; contig: string; position: number; text: string };
type Screen = "region" | "evidence" | "notes";
const initialRegion: GenomicRegion = { contig: "demo-01", start: 1, end: 24 };

export function GenomeBoard() {
  const [draftRegion, setDraftRegion] = React.useState<GenomicRegion>(initialRegion);
  const [region, setRegion] = React.useState<GenomicRegion>(initialRegion);
  const [locus, setLocus] = React.useState<number | null>(13);
  const [selection, setSelection] = React.useState<AlignmentSelection | null>({ startColumn: 13, endColumn: 13 });
  const [screen, setScreen] = React.useState<Screen>("region");
  const [view, setView] = React.useState("coverage");
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [annotations, setAnnotations] = React.useState<Annotation[]>([]);
  const [message, setMessage] = React.useState("");
  const evidenceHeading = React.useRef<HTMLHeadingElement>(null);
  const notesHeading = React.useRef<HTMLHeadingElement>(null);
  const applyButton = React.useRef<HTMLButtonElement>(null);
  const annotateButton = React.useRef<HTMLButtonElement>(null);
  const reference = references.find(item => item.id === region.contig)!;
  const start = region.start!, end = region.end!;
  const positions = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const loci: CoverageLocus[] = positions.map(position => ({ position, depth: depths[position - 1]!, forward: depths[position - 1] == null ? null : Math.ceil(depths[position - 1]! / 2), reverse: depths[position - 1] == null ? null : Math.floor(depths[position - 1]! / 2) }));
  const selectedDepth = locus == null ? null : depths[locus - 1];
  const selectedBase = locus == null ? null : reference.sequence[locus - 1];
  const key = `${reference.id}:${locus}`;
  const draft = drafts[key] ?? "";
  const matchingNotes = annotations.filter(note => note.contig === reference.id && note.position === locus);
  const validRegion = references.some(item => item.id === draftRegion.contig) && Number.isInteger(draftRegion.start) && Number.isInteger(draftRegion.end) && draftRegion.start! >= 1 && draftRegion.end! >= draftRegion.start! && draftRegion.end! <= 32;

  function applyRegion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!validRegion) return;
    setRegion({ ...draftRegion }); setLocus(draftRegion.start); setSelection({ startColumn: 1, endColumn: 1 }); setScreen("evidence");
    setMessage(`Opened ${draftRegion.contig}, positions ${draftRegion.start} to ${draftRegion.end}, one-based inclusive.`);
    requestAnimationFrame(() => evidenceHeading.current?.focus({ preventScroll: true }));
  }
  function openNotes() {
    setScreen("notes"); requestAnimationFrame(() => notesHeading.current?.focus({ preventScroll: true }));
  }
  function saveAnnotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (locus == null || !draft.trim()) return;
    setAnnotations(current => [...current, { id: `annotation-${Date.now()}-${current.length}`, contig: reference.id, position: locus, text: draft.trim() }]);
    setDrafts(current => ({ ...current, [key]: "" }));
    setMessage(`Annotation saved locally at ${reference.id}:${locus}.`);
  }
  function exportAnnotations() {
    const data = { reference: "Vlak teaching fixture v1", fictional: true, coordinateConvention: "1-based-inclusive", region, annotations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "vlak-locus-annotations.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`Export prepared with ${annotations.length} saved annotations. Unsaved note drafts are excluded.`);
  }

  return <section className="ge" data-screen={screen} aria-label="Genome sample workspace">
    <header className="ge-header"><div className="ge-project"><Icon name="layers" size={24} /><div><strong>Reference browser</strong><span>Vlak teaching fixture v1</span></div></div><Button variant="ghost" aria-label="Export notes" onClick={exportAnnotations}><Icon name="download" size={16} /><span>Export notes</span></Button></header>
    <div className="ge-body">
      <aside className="ge-region" aria-label="Reference region">
        <div className="ge-reference-label"><span>Reference collection</span><strong>Two short contigs</strong><p>32 positions each · fictional records</p></div>
        <form className="ge-region-form" onSubmit={applyRegion}><div className="ge-region-scroll"><GenomicRegionField label="Open a region" reference="Vlak teaching fixture v1" name="region" contigs={references.map(item => ({ id: item.id, label: item.label, length: item.sequence.length }))} value={draftRegion} onValueChange={setDraftRegion} required /><Card className="ge-contract"><Icon name="info" size={16} /><strong>Coordinates stay explicit</strong><p>Both endpoints are included. Applying the form changes the supplied evidence window.</p></Card><div className="ge-reference-index"><h2>Fixture contents</h2><p>Two repeated reference strings, three supplied reads per contig, and a depth record with a missing value and recorded zero.</p><p>No mapping or variant calls are performed.</p></div></div><footer className="ge-region-actions"><Button type="submit" ref={applyButton} disabled={!validRegion}>Open region<Icon name="arrow-right" size={16} /></Button></footer></form>
      </aside>
      <section className="ge-evidence" aria-label="Reference evidence">
        <div className="ge-evidence-head"><Button variant="ghost" className="ge-mobile" onClick={() => { setScreen("region"); requestAnimationFrame(() => applyButton.current?.focus({ preventScroll: true })); }}><Icon name="arrow-left" size={16} />Region</Button><div><span className="ge-eyebrow">{reference.label}</span><h2 ref={evidenceHeading} tabIndex={-1}>{start}<span>—</span>{end}</h2><p>1-based inclusive · {positions.length} positions</p></div><span className="ge-bounded">Supplied evidence</span></div>
        <div className="ge-context" role="img" aria-label={`Region ${start} through ${end} of 32 positions`}><div className="ge-contig-track"><span style={{ insetInlineStart: `${(start - 1) / 32 * 100}%`, width: `${positions.length / 32 * 100}%` }} /></div><div><span>1</span><span>32</span></div></div>
        <div className="ge-view"><ToggleGroup aria-label="Evidence view" value={view} onValueChange={setView} options={[{ value: "coverage", label: "Coverage" }, { value: "alignment", label: "Aligned reads" }]} /><span>3 supplied reads</span></div>
        <div className="ge-evidence-scroll">{view === "coverage" ? <CoverageInspector label="Supplied depth" reference="Teaching fixture v1" contig={reference.id} loci={loci} value={locus} onValueChange={position => { setLocus(position); setSelection(position == null ? null : { startColumn: position - start + 1, endColumn: position - start + 1 }); }} /> : <SequenceAlignment label="Aligned sequence window" contig={reference.id} referenceLabel="Fixture reference" referenceSequence={reference.sequence.slice(start - 1, end)} positions={positions} reads={reference.reads.map((sequence, index) => ({ id: `read-${index}`, label: `Supplied read ${index + 1}`, sequence: sequence.slice(start - 1, end) }))} value={selection} onValueChange={next => { setSelection(next); setLocus(next == null ? null : positions[next.startColumn - 1]!); }} />}
          <Card className="ge-selection-card"><div><span>Selected locus</span><strong>{locus == null ? "None selected" : `${reference.id}:${locus}`}</strong></div><div><span>Reference base</span><strong>{selectedBase ?? "—"}</strong></div><div><span>Supplied depth</span><strong>{locus == null ? "—" : selectedDepth == null ? "Missing" : selectedDepth}</strong></div></Card>
        </div>
        <footer className="ge-evidence-actions"><span>{locus == null ? "Select a position to annotate" : `${matchingNotes.length} notes at this locus`}</span><Button ref={annotateButton} disabled={locus == null} onClick={openNotes}>Annotate locus<Icon name="arrow-right" size={16} /></Button></footer>
      </section>
      <section className="ge-notes" aria-label="Locus annotations"><header className="ge-notes-head"><Button variant="ghost" aria-label="Back to evidence" onClick={() => { setScreen("evidence"); requestAnimationFrame(() => (annotateButton.current?.disabled ? evidenceHeading.current : annotateButton.current)?.focus({ preventScroll: true })); }}><Icon name="arrow-left" size={16} /></Button><div><span className="ge-eyebrow">{reference.id}{locus != null ? `:${locus}` : ""}</span><h2 ref={notesHeading} tabIndex={-1}>Locus notebook</h2></div></header><form className="ge-note-form" onSubmit={saveAnnotation}><div className="ge-note-scroll"><Card className="ge-locus-card"><span>Reference position</span><strong>{locus ?? "None"}</strong><p>{reference.label} · 1-based inclusive</p><p>Annotations describe this supplied evidence. They are not variant calls.</p></Card><Textarea label="Locus annotation" value={draft} onChange={event => setDrafts(current => ({ ...current, [key]: event.target.value }))} required disabled={locus == null} maxLength={1200} rows={5} placeholder="Add context for the next reviewer…" /><div className="ge-annotation-list"><h3>Saved at this locus</h3>{matchingNotes.length ? <ol>{matchingNotes.map(note => <li key={note.id}>{note.text}</li>)}</ol> : <p>No saved annotations at this position.</p>}</div><div className="ge-note-total"><span>{annotations.length} saved annotations in this session</span><Button variant="ghost" onClick={exportAnnotations}><Icon name="download" size={16} />Export all notes</Button></div></div><footer className="ge-note-actions"><span>{draft.length}/1200</span><Button type="submit" disabled={locus == null || !draft.trim()}>Save annotation</Button></footer></form></section>
    </div>
    <nav className="ge-mobile-nav" aria-label="Genome screens">{([['region', 'Region'], ['evidence', 'Evidence'], ['notes', 'Notes']] as const).map(([value, label]) => <Button key={value} variant={screen === value ? "primary" : "ghost"} aria-current={screen === value ? "page" : undefined} onClick={() => setScreen(value)}>{label}</Button>)}</nav>
    <footer className="ge-status"><span>Teaching fixture v1 · 1-based inclusive</span><span>{annotations.length} local annotations</span></footer><p className="ge-announcement" role="status">{message}</p>
  </section>;
}
