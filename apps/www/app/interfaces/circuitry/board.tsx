"use client";

import * as React from "react";
import { AssemblyVariantMatrix, Button, Card, DesignRuleResults, Icon, Input, PadInspector, Select, Textarea, ToggleGroup } from "@noorddev/vlak-react";
import type { AssemblyVariantState, DesignRuleViolation, PadInspectorPad } from "@noorddev/vlak-react";

type Screen = "board" | "inspect" | "assistant" | "checks" | "assembly";
type Proposal = { id: number; kind: "net" | "assembly"; prompt: string; source: string; target: string; padId: string; note: string; status: "draft" | "applied" | "discarded" };
const padLocations = [{ id: "j1-1", x: 92, y: 132 }, { id: "j1-2", x: 92, y: 246 }, { id: "u1-1", x: 338, y: 132 }, { id: "tp1", x: 480, y: 255 }];
const initialPads: PadInspectorPad[] = [
  { id: "j1-1", reference: "J1", number: "1", net: "Supply", layers: ["Front copper"], type: "Through hole", shape: "Circle", geometry: [{ id: "diameter", label: "Diameter", value: "1.80", unit: "mm" }] },
  { id: "j1-2", reference: "J1", number: "2", net: "Return", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Circle", geometry: [{ id: "diameter", label: "Diameter", value: "1.80", unit: "mm" }] },
  { id: "u1-1", reference: "U1", number: "1", net: "Supply", layers: ["Front copper"], type: "Surface mount", shape: "Rectangle", geometry: [{ id: "width", label: "Width", value: "0.60", unit: "mm" }] },
  { id: "tp1", reference: "TP1", number: "1", net: "Sense", layers: ["Front copper"], type: "Surface mount", shape: "Circle", geometry: [{ id: "diameter", label: "Diameter", value: "1.20", unit: "mm" }] },
];
const initialAssembly: AssemblyVariantState[] = [{ referenceId: "r3", variantId: "pilot", populated: true, includeInBom: true, includeInPlacement: true }];
const violations: DesignRuleViolation[] = [
  { id: "clearance", title: "Connector clearance", severity: "warning", status: "open", rule: "Imported sample clearance record", layer: "Front copper", net: "Supply", location: { x: 8.4, y: 12, unit: "mm" }, objects: ["J1 pad 1", "Outline"], canResolve: false, description: "Synthetic finding supplied with revision C. No geometry checking runs in this workspace." },
  { id: "legend", title: "Reference text overlap", severity: "info", status: "excluded", layer: "Front silkscreen", objects: ["R3 reference", "R3 outline"], canResolve: false },
];

export function CircuitryBoard() {
  const [pads, setPads] = React.useState(initialPads);
  const [selected, setSelected] = React.useState<string | null>("j1-1");
  const [screen, setScreen] = React.useState<Screen>("board");
  const [panel, setPanel] = React.useState<Exclude<Screen, "board">>("assistant");
  const [assembly, setAssembly] = React.useState(initialAssembly);
  const [prompt, setPrompt] = React.useState("Rename selected net to Power input");
  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [history, setHistory] = React.useState<Proposal[]>([]);
  const [historyId, setHistoryId] = React.useState<number | null>(null);
  const [revision, setRevision] = React.useState(0);
  const [selectedCheck, setSelectedCheck] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [notes, setNotes] = React.useState<string[]>(["Revision C loaded with two synthetic check records."]);
  const nextProposal = React.useRef(1);
  const padButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const heading = React.useRef<HTMLHeadingElement>(null);
  const promptField = React.useRef<HTMLTextAreaElement>(null);
  const proposalHeading = React.useRef<HTMLHeadingElement>(null);
  const historyHeading = React.useRef<HTMLHeadingElement>(null);
  const historyButtons = React.useRef(new Map<number, HTMLButtonElement>());
  const uid = React.useId().replaceAll(":", "");
  const pad = pads.find(item => item.id === selected);
  const selectedNet = pad?.net;
  const populated = assembly.find(cell => cell.referenceId === "r3" && cell.variantId === "pilot")?.populated;
  const viewedHistory = history.find(item => item.id === historyId);
  const activePanel = screen === "board" ? panel : screen;
  const panelTitle = activePanel === "inspect" ? "Pad inspector" : activePanel === "assembly" ? "Assembly variants" : activePanel === "checks" ? "Imported checks" : "Design assistant";

  function openPanel(next: Exclude<Screen, "board">) { setPanel(next); setScreen(next); setHistoryId(null); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }
  function selectPad(id: string) { setSelected(id); openPanel("inspect"); }
  function backToBoard() { setScreen("board"); requestAnimationFrame(() => { if (selected) padButtons.current.get(selected)?.focus({ preventScroll: true }); }); }
  function generate(event: React.FormEvent) {
    event.preventDefault();
    const text = prompt.trim();
    const rename = text.match(/^rename (?:selected )?net to\s+(.+)$/i);
    const omit = /^(omit|exclude) r3 from (?:the )?pilot(?: variant)?$/i.test(text);
    let next: Proposal;
    if (rename && pad?.net) {
      const target = rename[1]!.trim();
      if (target.length > 40) { setMessage("Keep the proposed net name to 40 characters."); return; }
      next = { id: nextProposal.current++, kind: "net", prompt: text, source: pad.net, target, padId: pad.id, note: "Rename the supplied net label; preserve trace geometry.", status: "draft" };
    } else if (omit) {
      next = { id: nextProposal.current++, kind: "assembly", prompt: text, source: populated === true ? "yes" : populated === false ? "no" : "unknown", target: "no", padId: selected ?? "j1-1", note: "Change R3 population in Pilot only; keep export flags independent.", status: "draft" };
    } else { setMessage("No matching local template. Try “Rename selected net to …” or “Omit R3 from Pilot”."); return; }
    setProposal(next); setHistoryId(null); setMessage("Proposal prepared. Review and edit before applying."); requestAnimationFrame(() => proposalHeading.current?.focus({ preventScroll: true }));
  }
  function applyProposal() {
    if (!proposal?.target.trim()) return;
    const actual = proposal.kind === "net" ? pads.find(item => item.id === proposal.padId)?.net : populated === true ? "yes" : populated === false ? "no" : "unknown";
    if (actual !== proposal.source) { setMessage("The original record changed. Generate a new proposal against the current board."); return; }
    if (proposal.kind === "net") setPads(current => current.map(item => item.net === proposal.source ? { ...item, net: proposal.target.trim() } : item));
    else setAssembly(current => current.map(cell => cell.referenceId === "r3" && cell.variantId === "pilot" ? { ...cell, populated: proposal.target === "yes" } : cell));
    const accepted = { ...proposal, target: proposal.target.trim(), status: "applied" as const };
    setHistory(current => [accepted, ...current]); setProposal(null); setRevision(value => value + 1);
    setNotes(current => [`Proposal ${accepted.id}: ${accepted.note.trim() || "No note supplied."}`, ...current]);
    setMessage(`Proposal ${accepted.id} applied to the local record. Imported checks have not been rerun.`);
    requestAnimationFrame(() => promptField.current?.focus({ preventScroll: true }));
  }
  function discard() { if (!proposal) return; setHistory(current => [{ ...proposal, status: "discarded" }, ...current]); setProposal(null); setMessage("Proposal discarded. Board records were kept."); requestAnimationFrame(() => promptField.current?.focus({ preventScroll: true })); }
  function template(text: string) { setPrompt(text); setProposal(null); setHistoryId(null); requestAnimationFrame(() => promptField.current?.focus()); }
  function navigate(next: Screen) { setScreen(next); if (next !== "board") setPanel(next); setHistoryId(null); }

  return <div className="cb-frame"><section className="cb" data-screen={screen} aria-label="Circuit board editing workspace">
    <header className="cb-header"><div className="cb-brand"><Icon name="grid" /><div><strong>Sensor bridge</strong><span>Board / revision C{revision ? ` + ${revision} local` : ""}</span></div></div><span className="cb-local">Local workspace</span><Button variant="ghost" size="sm" onClick={() => openPanel("assembly")}><Icon name="layers" /><span>Variants</span></Button></header>
    <div className="cb-body">
      <section className="cb-canvas" aria-label="Board view">
        <div className="cb-toolbar"><span><Icon name="layers" size={16} />Front copper</span><span>Illustrative / 2 layers</span></div>
        <div className="cb-board-wrap"><div className="cb-board-top"><span>Sensor bridge</span><strong>01</strong></div><div className="cb-board-art">
          <svg viewBox="0 0 600 360" className="cb-board-svg" aria-hidden="true"><defs><pattern id={`${uid}-dots`} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" /></pattern></defs><rect x="20" y="25" width="560" height="310" rx="9" className="cb-substrate" /><rect x="20" y="25" width="560" height="310" rx="9" fill={`url(#${uid}-dots)`} className="cb-dots" />{[[42,47],[558,47],[42,313],[558,313]].map(([x,y], index) => <circle key={index} cx={x} cy={y} r="9" className="cb-mount" />)}
            <g className={selectedNet === pads[0]!.net ? "cb-traces cb-traces-selected" : "cb-traces"}><path d="M92 132H168L212 88H290L338 132M212 88V62H405V115" /><path d="M338 132V170H410" /></g><g className={selectedNet === pads[1]!.net ? "cb-traces cb-traces-selected" : "cb-traces"}><path d="M92 246H158L201 275H365L410 230V200M201 275V295H480V255" /></g><g className={selectedNet === pads[3]!.net ? "cb-traces cb-traces-selected" : "cb-traces"}><path d="M480 255V220L451 191H410M480 255H531V132H465" /></g>
            <rect x="58" y="103" width="68" height="158" className="cb-connector" /><rect x="350" y="135" width="72" height="75" className="cb-chip" /><circle cx="362" cy="147" r="3" className="cb-chip-mark" />{Array.from({length:6},(_,i)=><g key={i} className="cb-pins"><path d={`M338 ${144+i*11}h12M422 ${144+i*11}h12`} /></g>)}<rect x="255" y="236" width="53" height="21" className="cb-resistor" data-populated={populated === true} /><path d="M244 246h11m53 0h11" className="cb-pins" /><rect x="450" y="114" width="30" height="20" className="cb-resistor" /><text x="72" y="91">J1</text><text x="370" y="123">U1</text><text x="267" y="229">R3</text><text x="469" y="291">TP1</text><text x="88" y="293">Sensor bridge / C</text>
          </svg>
          {padLocations.map((location,index) => <Button key={location.id} variant="ghost" className="cb-pad-marker" style={{ left: `${location.x / 6}%`, top: `${location.y / 3.6}%` }} ref={node => { if (node) padButtons.current.set(location.id,node); }} aria-label={`Inspect ${pads[index]!.reference} pad ${pads[index]!.number}, ${pads[index]!.net}`} aria-pressed={selected === location.id} onClick={() => selectPad(location.id)}>{index+1}</Button>)}
        </div><div className="cb-board-bottom"><span>44 × 26 mm sample outline</span><span>Drawing only</span></div></div>
        <Card className="cb-selection"><span className="cb-selection-mark"><Icon name="crosshair" /></span><div><span>Selected pad</span><strong>{pad ? `${pad.reference} / ${pad.number}` : "None selected"}</strong></div><div><span>Net</span><strong>{selectedNet ?? "Not supplied"}</strong></div><Button variant="ghost" size="sm" onClick={() => openPanel("inspect")}>Inspect<Icon name="chevron-right" size={16} /></Button></Card>
        <div className="cb-board-actions"><Button size="sm" onClick={() => openPanel("assistant")}><Icon name="code" size={16} />Propose a change</Button><Button variant="ghost" size="sm" onClick={() => openPanel("checks")}><Icon name="shield" size={16} />2 imported checks</Button></div>
        <div className="cb-notes"><div><span>Board notes</span><span>{notes.length} records</span></div><ol>{notes.slice(0,3).map((note,index)=><li key={`${index}-${note}`}>{note}</li>)}</ol></div>
      </section>
      <section className="cb-inspector" aria-label="Board inspector"><div className="cb-inspector-head"><Button variant="ghost" className="cb-back" aria-label="Back to board" onClick={backToBoard}><Icon name="arrow-left" /></Button><div><span className="cb-eyebrow">Sensor bridge / local</span><h2 ref={heading} tabIndex={-1}>{panelTitle}</h2></div></div>
        <div className="cb-desktop-tabs"><ToggleGroup aria-label="Board panel" value={activePanel} onValueChange={value => openPanel(value as Exclude<Screen,"board">)} options={[{value:"assistant",label:"Assistant"},{value:"inspect",label:"Pad"},{value:"checks",label:"Checks"},{value:"assembly",label:"Variants"}]} /></div>
        <div className="cb-inspector-scroll">
          {activePanel === "inspect" ? <PadInspector label="Selected board record" pads={pads} value={selected} onValueChange={setSelected} boardLabel={`Revision C${revision ? ` + ${revision} local changes` : ""}`} /> : activePanel === "assembly" ? <><p className="cb-copy">Edit one assembly variant. These flags update the local record independently.</p><AssemblyVariantMatrix label="Pilot build" references={[{ id:"r3",label:"R3",partLabel:"10 kΩ sample resistor" }]} variants={[{id:"pilot",label:"Pilot"}]} value={assembly} onValueChange={next => {setAssembly(next);setRevision(value=>value+1);setNotes(current=>["Pilot assembly flags edited manually.",...current]);setMessage("Assembly flags updated locally. Imported checks remain unchanged.");}} /></> : activePanel === "checks" ? <><p className="cb-stale">{revision ? `Board has ${revision} local changes. ` : ""}Imported revision C records. Checks have not been computed or rerun here.</p><DesignRuleResults label="Sample design-rule records" violations={violations} selectedId={selectedCheck} onSelect={id=>{setSelectedCheck(id);setSelected(id === "clearance" ? "j1-1" : "u1-1");setMessage("Related sample pad highlighted in the board view.");}} /><Button variant="ghost" onClick={backToBoard}>Show highlighted pad<Icon name="arrow-right" /></Button></> : <>
            <div className="cb-assistant-intro"><span className="cb-assistant-mark"><Icon name="code" /></span><div><strong>A change you can inspect</strong><p>Local prompt templates. No remote model.</p></div></div>
            {proposal ? <Card className="cb-proposal"><div className="cb-proposal-title"><span>Proposal {String(proposal.id).padStart(2,"0")}</span><span>Review needed</span></div><h3 ref={proposalHeading} tabIndex={-1}>{proposal.kind === "net" ? "Rename net label" : "Update Pilot population"}</h3><p className="cb-quoted">{proposal.prompt}</p><div className="cb-diff"><span>{proposal.kind === "net" ? "Net name" : "R3 populated"}</span><del>{proposal.source}</del><Icon name="arrow-right" size={16} /><strong>{proposal.target || "Enter a value"}</strong></div>
              {proposal.kind === "net" ? <Input label="Proposed net name" value={proposal.target} maxLength={40} onChange={event=>setProposal({...proposal,target:event.target.value})} /> : <div className="cb-field"><span id={`${uid}-population`}>Proposed population</span><Select fullWidth aria-labelledby={`${uid}-population`} value={proposal.target} onValueChange={target=>setProposal({...proposal,target})} options={[{value:"no",label:"Not populated"},{value:"yes",label:"Populated"}]} /></div>}
              <Textarea label="Change note" rows={2} maxLength={240} value={proposal.note} onChange={event=>setProposal({...proposal,note:event.target.value})} /><p className="cb-copy">{proposal.kind === "net" ? "All pads on this supplied net receive the new label. Trace geometry stays as drawn." : "Only population changes. Bill-of-materials and placement flags keep their current values."}</p>
            </Card> : viewedHistory ? <Card className="cb-history-detail"><Button variant="ghost" size="sm" onClick={()=>{setHistoryId(null);requestAnimationFrame(()=>historyButtons.current.get(viewedHistory.id)?.focus({preventScroll:true}));}}><Icon name="arrow-left" size={16} />All proposals</Button><span className="cb-eyebrow">Proposal {viewedHistory.id} · {viewedHistory.status}</span><h3 ref={historyHeading} tabIndex={-1}>{viewedHistory.kind === "net" ? "Net label" : "Pilot population"}</h3><div className="cb-diff"><del>{viewedHistory.source}</del><Icon name="arrow-right" /><strong>{viewedHistory.target}</strong></div><p>{viewedHistory.note || "No note supplied."}</p></Card> : <>
              <form className="cb-composer" onSubmit={generate}><Textarea ref={promptField} label="Describe a board change" rows={3} maxLength={200} required value={prompt} onChange={event=>setPrompt(event.target.value)} /><Button type="submit" disabled={!prompt.trim()}><Icon name="code" />Prepare proposal</Button></form>
              <div className="cb-templates"><span>Try a supported template</span><Button variant="ghost" size="sm" onClick={()=>template("Rename selected net to Power input")}>Rename selected net<Icon name="arrow-right" size={16} /></Button><Button variant="ghost" size="sm" onClick={()=>template("Omit R3 from Pilot")}>Omit R3 from Pilot<Icon name="arrow-right" size={16} /></Button></div>
              {history.length>0 && <div className="cb-history"><h3>Proposal history</h3>{history.map(item=><Button key={item.id} variant="ghost" className="cb-history-row" ref={node=>{if(node)historyButtons.current.set(item.id,node);}} onClick={()=>{setHistoryId(item.id);requestAnimationFrame(()=>historyHeading.current?.focus({preventScroll:true}));}}><span>0{item.id}</span><strong>{item.kind === "net" ? item.target : "Pilot population"}<small>{item.status}</small></strong><Icon name="chevron-right" size={16} /></Button>)}</div>}
            </>}
          </>}
          {message && <p className="cb-feedback" role="status">{message}</p>}
        </div>
        {activePanel === "assistant" && proposal && <div className="cb-apply"><span>Updates this tab only</span><div><Button disabled={!proposal.target.trim() || proposal.target.trim()===proposal.source} onClick={applyProposal}><Icon name="check" />Apply proposal</Button><Button variant="ghost" onClick={discard}>Discard</Button></div></div>}
      </section>
    </div>
    <footer className="cb-footer"><span><Icon name="code" size={12} />Local templates / 2 available</span><span>Imported checks remain supplied records</span></footer>
    <nav className="cb-mobile-nav" aria-label="Circuit board screens">{([{value:"board",label:"Board",icon:"grid"},{value:"inspect",label:"Inspect",icon:"crosshair"},{value:"assistant",label:"Assistant",icon:"code"},{value:"checks",label:"Checks",icon:"shield"}] as const).map(item=><Button key={item.value} variant="ghost" aria-pressed={screen===item.value} onClick={()=>navigate(item.value)}><Icon name={item.icon} /><span>{item.label}</span></Button>)}</nav>
  </section></div>;
}
