"use client";

import * as React from "react";
import { Button, Card, Icon, Input, Select, Textarea, ToggleGroup } from "@noorddev/vlak-react";

const original = "GASGAGGASGAGGASGAG";
const aminoAcids = [ ["A", "Alanine"], ["C", "Cysteine"], ["D", "Aspartate"], ["E", "Glutamate"], ["F", "Phenylalanine"], ["G", "Glycine"], ["H", "Histidine"], ["I", "Isoleucine"], ["K", "Lysine"], ["L", "Leucine"], ["M", "Methionine"], ["N", "Asparagine"], ["P", "Proline"], ["Q", "Glutamine"], ["R", "Arginine"], ["S", "Serine"], ["T", "Threonine"], ["V", "Valine"], ["W", "Tryptophan"], ["Y", "Tyrosine"] ];
type Variant = { id: string; name: string; sequence: string };
const initialVariants: Variant[] = [{ id: "reference", name: "Teaching reference", sequence: original }, { id: "variant-1", name: "Serine comparison", sequence: "GASGAGGASGSGGASGAG" }];
type Screen = "sequence" | "variants" | "compare" | "edit";

function Ribbon() {
  const patternId = React.useId();
  return <figure className="pr-ribbon"><svg viewBox="0 0 640 220" role="img" aria-label="Illustrative ribbon, not a calculated molecular structure"><defs><pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth=".5" /></pattern></defs><rect width="640" height="220" fill={`url(#${patternId})`} opacity=".18" /><g fill="none" strokeLinecap="round"><path d="M74 138C113 192 141 29 182 69S218 208 262 164 262 20 308 68 361 216 399 151 403 24 454 68 486 195 567 103" stroke="currentColor" strokeWidth="16" opacity=".2" /><path d="M74 122C113 176 141 13 182 53S218 192 262 148 262 4 308 52 361 200 399 135 403 8 454 52 486 179 567 87" stroke="currentColor" strokeWidth="3" /><path d="M74 138C113 192 141 29 182 69S218 208 262 164 262 20 308 68 361 216 399 151 403 24 454 68 486 195 567 103" stroke="currentColor" strokeWidth="1" opacity=".7" /></g></svg><figcaption><span>Concept view</span><span>Illustrative ribbon · no structure prediction</span></figcaption></figure>;
}

export function ProteinBoard() {
  const [screen, setScreen] = React.useState<Screen>("sequence");
  const [sequenceText, setSequenceText] = React.useState(original);
  const [position, setPosition] = React.useState(6);
  const [name, setName] = React.useState("Variant 02");
  const [variants, setVariants] = React.useState(initialVariants);
  const [variantId, setVariantId] = React.useState("variant-1");
  const [view, setView] = React.useState("compare");
  const [reviews, setReviews] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const sequence = sequenceText.replace(/\s/g, "").toUpperCase();
  const valid = /^[ACDEFGHIKLMNPQRSTVWY]{1,48}$/.test(sequence);
  const selectedPosition = Math.min(position, Math.max(1, Math.min(48, sequence.length)));
  const residue = sequence[selectedPosition - 1] ?? "";
  const residueName = aminoAcids.find(item => item[0] === residue)?.[1] ?? "Unrecognized symbol";
  const selected = variants.find(item => item.id === variantId)!;
  const changed = Array.from({ length: Math.max(original.length, selected.sequence.length) }, (_, index) => index).filter(index => original[index] !== selected.sequence[index]);
  const draftChanges = Array.from({ length: Math.max(original.length, sequence.length) }, (_, index) => index).filter(index => original[index] !== sequence[index]).length;
  const rules = [
    { label: "Keep the reference length", detail: `Expected 18 residues; supplied ${selected.sequence.length}.`, passes: selected.sequence.length === 18 },
    { label: "Retain glycine at position 6", detail: `Expected G; supplied ${selected.sequence[5] ?? "no residue"}.`, passes: selected.sequence[5] === "G" },
  ];
  const heading = React.useRef<HTMLHeadingElement>(null);
  const comparisonHeading = React.useRef<HTMLHeadingElement>(null);
  const editorHeading = React.useRef<HTMLHeadingElement>(null);
  const residues = React.useRef(new Map<number, HTMLButtonElement>());
  const editButton = React.useRef<HTMLButtonElement>(null);
  const variantButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const openedFromResidue = React.useRef(false);
  const gridId = React.useId();

  function openEditor(fromResidue = false) {
    openedFromResidue.current = fromResidue; setScreen("edit"); setError("");
    requestAnimationFrame(() => editorHeading.current?.focus({ preventScroll: true }));
  }
  function closeEditor() {
    setScreen("sequence");
    requestAnimationFrame(() => (openedFromResidue.current ? residues.current.get(selectedPosition) ?? editButton.current : editButton.current)?.focus({ preventScroll: true }));
  }
  function saveVariant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!valid || !name.trim()) return;
    if (variants.some(variant => variant.name.toLowerCase() === name.trim().toLowerCase())) { setError("Choose a different name; that variant is already saved."); return; }
    const variant = { id: `variant-${Date.now()}-${variants.length}`, name: name.trim(), sequence };
    setVariants(current => [...current, variant]); setVariantId(variant.id); setScreen("compare"); setView("compare"); setName(`Variant ${String(variants.length + 1).padStart(2, "0")}`); setError("");
    setMessage(`${variant.name} saved locally with ${sequence.length} residues.`);
    requestAnimationFrame(() => comparisonHeading.current?.focus({ preventScroll: true }));
  }
  function residueKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = Math.min(48, sequence.length, index + 1);
    else if (event.key === "ArrowLeft") next = Math.max(1, index - 1);
    else if (event.key === "Home") next = 1;
    else if (event.key === "End") next = Math.min(48, sequence.length);
    else return;
    event.preventDefault(); setPosition(next); residues.current.get(next)?.focus();
  }

  return <section className="pr" data-screen={screen} aria-label="Protein sequence workspace">
    <header className="pr-header"><div className="pr-workspace"><Icon name="layers" size={24} /><div><strong>Sequence workbench</strong><span>Teaching fragment / local drafts</span></div></div><Button variant="ghost" aria-label="Edit sequence" ref={editButton} onClick={() => openEditor()}><Icon name="edit" size={16} /><span>Edit sequence</span></Button></header>
    <div className="pr-body">
      <aside className="pr-shelf" aria-label="Saved variants"><div className="pr-shelf-head"><span>Variant shelf</span><strong>{String(variants.length).padStart(2, "0")}<span> local records</span></strong></div><div className="pr-variant-list">{variants.map(variant => <button key={variant.id} type="button" className="pr-variant" aria-current={variant.id === variantId ? "true" : undefined} ref={node => { if (node) variantButtons.current.set(variant.id, node); else variantButtons.current.delete(variant.id); }} onClick={() => { setVariantId(variant.id); setScreen("compare"); setView("compare"); requestAnimationFrame(() => comparisonHeading.current?.focus({ preventScroll: true })); }}><span>{variant.id === "reference" ? "Reference" : "Local variant"}<Icon name="chevron-right" size={16} /></span><strong>{variant.name}</strong><span>{variant.sequence.length} residues · {reviews[variant.id] ? "Reviewed" : "Unreviewed"}</span></button>)}</div><p className="pr-shelf-foot">Saved variants are immutable. Load a copy to edit.</p></aside>
      <section className="pr-canvas" aria-label="Sequence inspection"><div className="pr-canvas-scroll"><div className="pr-sequence-head"><div><span className="pr-eyebrow">Nonfunctional teaching fixture</span><h2 ref={heading} tabIndex={-1}>Teaching fragment 01</h2></div><span className="pr-draft-state">{sequence === original ? "Reference copy" : "Unsaved draft"}</span></div><Ribbon /><div className="pr-sequence-meta"><span id={gridId}>Draft sequence · {sequence.length} residues</span><span>{draftChanges} differences from reference</span></div><p className="pr-key-hint">Arrow keys move between residues. Select a residue to edit it.</p><div className="pr-residues" role="group" aria-labelledby={gridId}>{[...sequence].slice(0, 48).map((base, index) => <button key={index} type="button" ref={node => { if (node) residues.current.set(index + 1, node); else residues.current.delete(index + 1); }} aria-label={`Residue ${index + 1}, ${base}`} aria-pressed={selectedPosition === index + 1} tabIndex={selectedPosition === index + 1 ? 0 : -1} onFocus={() => setPosition(index + 1)} onKeyDown={event => residueKey(event, index + 1)} onClick={() => { setPosition(index + 1); openEditor(true); }}><span>{index + 1}</span><strong>{base}</strong></button>)}</div>{!valid && <p className="pr-invalid">Use 1–48 standard one-letter amino-acid symbols before saving.</p>}<Card className="pr-fixture-note"><Icon name="info" size={16} /><div><strong>Sequence inspection, with explicit limits</strong><p>This repeated fragment has no assigned biological function. The ribbon is an illustration and stays unchanged when the sequence changes.</p></div></Card></div><footer className="pr-canvas-actions"><span>Residue {selectedPosition} · {residueName}</span><Button onClick={() => openEditor(true)}>Edit residue {selectedPosition}<Icon name="arrow-right" size={16} /></Button></footer></section>
      <section className="pr-comparison" aria-label="Variant comparison"><header className="pr-comparison-head"><Button variant="ghost" aria-label="Back to variants" onClick={() => { setScreen("variants"); requestAnimationFrame(() => variantButtons.current.get(selected.id)?.focus({ preventScroll: true })); }}><Icon name="arrow-left" size={16} /></Button><div><span className="pr-eyebrow">Saved variant</span><h2 ref={comparisonHeading} tabIndex={-1}>{selected.name}</h2></div></header><div className="pr-comparison-view"><ToggleGroup aria-label="Variant detail" value={view} onValueChange={setView} options={[{ value: "compare", label: "Compare" }, { value: "review", label: "Constraints" }]} /></div><div className="pr-comparison-scroll">{view === "compare" ? <><Card className="pr-difference-count"><span>Exact sequence differences</span><strong>{changed.length.toString().padStart(2, "0")}</strong><p>Compared with the teaching reference. No scientific score is calculated.</p></Card>{changed.length ? <table className="pr-differences"><caption>Changed positions</caption><thead><tr><th scope="col">Position</th><th scope="col">Reference</th><th scope="col">Variant</th></tr></thead><tbody>{changed.map(index => <tr key={index}><th scope="row">{index + 1}</th><td>{original[index] ?? "Absent"}</td><td>{selected.sequence[index] ?? "Absent"}</td></tr>)}</tbody></table> : <p className="pr-no-changes">Every position matches the reference.</p>}<div className="pr-sequence-copy"><span>Saved sequence</span><code>{selected.sequence}</code></div></> : <><div className="pr-rules-intro"><h3>Two explicit draft rules</h3><p>These checks compare characters and length. They do not evaluate structure, function, stability, or safety.</p></div><ul className="pr-rules">{rules.map(rule => <li key={rule.label}><span className="pr-rule-mark" aria-hidden="true"><Icon name={rule.passes ? "check" : "minus"} size={16} /></span><div><strong>{rule.label}</strong><p>{rule.detail}</p><span>{rule.passes ? "Matches rule" : "Needs attention"}</span></div></li>)}</ul><Button variant="ghost" disabled={reviews[selected.id]} onClick={() => { setReviews(current => ({ ...current, [selected.id]: true })); setMessage(`${selected.name}: local review recorded; ${rules.filter(rule => !rule.passes).length} rules need attention.`); }}>{reviews[selected.id] ? "Review recorded locally" : "Record local review"}</Button></>}</div><footer className="pr-comparison-actions"><span>{reviews[selected.id] ? "Reviewed locally" : "Not reviewed"}</span><Button onClick={() => { setSequenceText(selected.sequence); setName(`${selected.name} copy`); setPosition(1); openEditor(); }}>Edit a copy<Icon name="arrow-right" size={16} /></Button></footer></section>
      <section className="pr-editor" aria-label="Sequence editor"><header className="pr-editor-head"><Button variant="ghost" aria-label="Back to draft sequence" onClick={closeEditor}><Icon name="arrow-left" size={16} /></Button><div><span className="pr-eyebrow">Local draft</span><h2 ref={editorHeading} tabIndex={-1}>Edit the fragment</h2></div></header><form className="pr-edit-form" onSubmit={saveVariant}><div className="pr-edit-scroll"><Card className="pr-residue-card"><span>Residue {selectedPosition}</span><strong>{residue || "—"}</strong><p>{residueName}</p></Card><div className="pr-replacement"><span id={`${gridId}-replacement`}>Replace residue {selectedPosition}</span><Select fullWidth aria-labelledby={`${gridId}-replacement`} value={aminoAcids.some(item => item[0] === residue) ? residue : ""} disabled={!valid} options={aminoAcids.map(([value, label]) => ({ value: value!, label: `${value} · ${label}` }))} onValueChange={value => setSequenceText(`${sequence.slice(0, selectedPosition - 1)}${value}${sequence.slice(selectedPosition)}`)} /></div><Textarea label="Residue sequence" rows={4} maxLength={96} value={sequenceText} onChange={event => setSequenceText(event.target.value)} spellCheck={false} autoCapitalize="characters" feedback="1–48 residues. Whitespace is ignored and letters are read in uppercase." aria-invalid={!valid} />{!valid && <p className="pr-invalid" role="status">Use standard one-letter amino-acid symbols, with at most 48 residues.</p>}<Input label="Variant name" value={name} onChange={event => { setName(event.target.value); setError(""); }} required maxLength={48} />{error && <p className="pr-invalid" role="alert">{error}</p>}<p className="pr-edit-note">Saving creates a new local record. Existing variants remain unchanged.</p></div><footer className="pr-edit-actions"><span>{sequence.length} residues</span><Button type="submit" disabled={!valid || !name.trim()}>Save variant<Icon name="check" size={16} /></Button></footer></form></section>
    </div>
    <nav className="pr-mobile-nav" aria-label="Protein screens">{([['sequence', 'Sequence'], ['variants', 'Variants'], ['edit', 'Edit']] as const).map(([value, label]) => <Button key={value} variant={screen === value || (value === "variants" && screen === "compare") ? "primary" : "ghost"} aria-current={screen === value || (value === "variants" && screen === "compare") ? "page" : undefined} onClick={() => setScreen(value)}>{label}</Button>)}</nav><footer className="pr-status"><span>Local teaching fixture · no design model connected</span><span>{variants.length} saved records</span></footer><p className="pr-announcement" role="status">{message}</p>
  </section>;
}
