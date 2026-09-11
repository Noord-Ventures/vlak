"use client";

import * as React from "react";
import { AcquisitionSequencer, Button, Icon, Input, QuantityField, Select, StackNavigator, StagePositionList } from "@noorddev/vlak-react";
import type { AcquisitionStep, StackSelection } from "@noorddev/vlak-react";
import { PLAN_LIMITS, axisValue, formatNumber, initialPlan, parsePlan, previewFrame, reviewPlan, serializePlan } from "./plan";
import type { MicroscopyPlan, PlanAxis, PlanIssue, PlanPosition, PlanScreen } from "./plan";
import { ProjectTools } from "@/components/project-tools";

const screens = [["positions", "Positions"], ["sequence", "Sequence"], ["stack", "Stack"], ["review", "Review"]] as const;
const unitOptions = [{ value: "µm", label: "µm" }];
const boundedCount = (count: number | null) => count !== null && Number.isInteger(count) && count > 0 && count <= PLAN_LIMITS.axis ? count : 0;
const coordinate = (value: number | null, unit: string | null) => value === null ? "Not supplied" : `${formatNumber(value)} ${unit ?? "(unit unknown)"}`;
const ownRecord = <T,>(values: Record<string, T>, id: string): T | undefined => Object.hasOwn(values, id) ? values[id] : undefined;

/** Supplied positions projected to a local, automatically fitted coordinate diagram. */
function StageDiagram({ plan, selected }: { plan: MicroscopyPlan; selected: string | null }) {
  const known = plan.positions.filter(position => position.x !== null && position.y !== null && Number.isFinite(position.x) && Number.isFinite(position.y));
  const xs = known.map(position => position.x!); const ys = known.map(position => position.y!);
  const minX = Math.min(-1, ...xs); const maxX = Math.max(1, ...xs);
  const minY = Math.min(-1, ...ys); const maxY = Math.max(1, ...ys);
  const px = (x: number) => 72 + (x - minX) / (maxX - minX) * 276;
  const py = (y: number) => 274 - (y - minY) / (maxY - minY) * 180;
  const selectedPosition = known.find(position => position.id === selected);
  return <svg className="mc-stage-diagram" viewBox="0 0 420 360" role="img" aria-label={`Planned stage positions, ${known.length} of ${plan.positions.length} have known X and Y coordinates. ${selectedPosition?.name ?? "No known position"} selected. No acquired image.`}>
    <defs><pattern id="mc-stage-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" className="mc-grid-line" /></pattern></defs>
    <rect x="30" y="48" width="360" height="258" rx="3" className="mc-slide" />
    <rect x="54" y="76" width="312" height="218" fill="url(#mc-stage-grid)" />
    <path d="M30 66H390M48 48V306M30 286H48M372 48V66" className="mc-rule" />
    <path d={`M${px(0)} 76V294M54 ${py(0)}H366`} className="mc-zero" />
    {known.length > 1 && <polyline points={known.filter(position => position.enabled).map(position => `${px(position.x!)},${py(position.y!)}`).join(" ")} className="mc-route" />}
    {known.map((position, index) => <g key={position.id} className="mc-map-site" data-selected={position.id === selected} data-included={position.enabled} transform={`translate(${px(position.x!)},${py(position.y!)})`}>
      <rect x="-13" y="-10" width="26" height="20" className="mc-field-outline" />
      <path d="M-20 0H-7M7 0H20M0 -17V-5M0 5V17" className="mc-crosshair" />
      <text x="18" y="-15">{String(index + 1).padStart(2, "0")}</text>
    </g>)}
    <text x="54" y="330">X · {formatNumber(minX)} to {formatNumber(maxX)} {plan.units.x ?? "unit unknown"}</text>
    <text x="54" y="350">Y · {formatNumber(minY)} to {formatNumber(maxY)} {plan.units.y ?? "unit unknown"}</text>
    <text x="58" y="61" className="mc-slide-label">Plan preview · fitted coordinates</text>
  </svg>;
}

function DepthDiagram({ axis, index }: { axis: PlanAxis; index: number | null }) {
  const count = boundedCount(axis.count);
  const illustrated = Math.min(count, 9);
  return <svg className="mc-depth-diagram" viewBox="0 0 340 190" role="img" aria-label={`${count} planned depth slices; ${count && index !== null ? `slice ${index + 1} selected` : "no slice selected"}. Schematic, not acquired image data.`}>
    {Array.from({ length: illustrated }, (_, i) => <path key={i} d={`M54 ${124 - i * 10}L186 ${164 - i * 10}L290 ${108 - i * 10}L157 ${68 - i * 10}Z`} className={index !== null && i === Math.min(illustrated - 1, Math.floor(index * illustrated / Math.max(count, 1))) ? "mc-plane mc-plane-selected" : "mc-plane"} />)}
    <text x="16" y="184">{count > 9 ? "Up to 9 representative planes shown" : "Planned planes · no image data"}</text>
  </svg>;
}

export function MicroscopyBoard() {
  const [plan, setPlan] = React.useState(initialPlan);
  const [ready, setReady] = React.useState(false);
  const [screen, setScreen] = React.useState<PlanScreen>("positions");
  const [selectedId, setSelectedId] = React.useState<string | null>("site-01");
  const [editing, setEditing] = React.useState(false);
  const [drafts, setDrafts] = React.useState<Record<string, PlanPosition>>({});
  const [unitDrafts, setUnitDrafts] = React.useState<Record<string, MicroscopyPlan["units"]>>({});
  const [positionError, setPositionError] = React.useState("");
  const [selection, setSelection] = React.useState<StackSelection>({ position: 0, z: 0, t: 0, step: 0 });
  const [reviewed, setReviewed] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [importError, setImportError] = React.useState("");
  const [candidate, setCandidate] = React.useState<{ plan: MicroscopyPlan; name: string } | null>(null);
  const [reading, setReading] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);
  const printFrame = React.useRef<HTMLIFrameElement | null>(null);
  const root = React.useRef<HTMLElement>(null);
  const positionHeading = React.useRef<HTMLHeadingElement>(null);
  const editorTrigger = React.useRef<HTMLButtonElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const request = React.useRef(0);
  const downloadUrls = React.useRef(new Set<string>());
  const selected = plan.positions.find(position => position.id === selectedId);
  const draft = selected ? ownRecord(drafts, selected.id) ?? selected : null;
  const editorUnits = selected ? ownRecord(unitDrafts, selected.id) ?? plan.units : plan.units;
  const dirty = selected && draft ? JSON.stringify(draft) !== JSON.stringify(selected) || JSON.stringify(editorUnits) !== JSON.stringify(plan.units) : false;
  const unsaved = plan.positions.filter(position => (ownRecord(drafts, position.id) && JSON.stringify(drafts[position.id]) !== JSON.stringify(position)) || (ownRecord(unitDrafts, position.id) && JSON.stringify(unitDrafts[position.id]) !== JSON.stringify(plan.units))).length;
  const review = reviewPlan(plan);
  const included = plan.positions.filter(position => position.enabled);
  const worksheetFingerprint = React.useMemo(() => {
    // A compact content identifier for comparing worksheets, not a security digest.
    let value = 2166136261;
    for (const character of JSON.stringify(plan)) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
    return `fnv1a-${(value >>> 0).toString(16).padStart(8, "0")}`;
  }, [plan]);
  const getIndex = (key: string, length: number) => !length || selection[key] === null ? null : Math.max(0, Math.min(length - 1, selection[key] ?? 0));
  const previewSelection = { position: getIndex("position", included.length), z: getIndex("z", boundedCount(plan.z.count)), t: getIndex("t", boundedCount(plan.t.count)), step: getIndex("step", plan.steps.length) };
  const preview = previewFrame(plan, previewSelection);
  const summary = `${formatNumber(review.frames)} planned frames`;
  const nextId = (prefix: string, records: readonly { id: string }[]) => {
    let index = 1; while (records.some(record => record.id === `${prefix}-${String(index).padStart(2, "0")}`)) index++;
    return `${prefix}-${String(index).padStart(2, "0")}`;
  };
  React.useEffect(() => { setReady(true); return () => { request.current++; printFrame.current?.remove(); for (const url of downloadUrls.current) URL.revokeObjectURL(url); }; }, []);

  function update(next: MicroscopyPlan) { setPlan(next); setReviewed(false); setMessage(""); }
  function navigate(next: PlanScreen) { setScreen(next); setPositionError(""); }
  function editPosition(id = selectedId) {
    if (!id || !plan.positions.some(position => position.id === id)) return;
    setSelectedId(id); setScreen("positions"); setEditing(true); setPositionError("");
    requestAnimationFrame(() => positionHeading.current?.focus({ preventScroll: true }));
  }
  function backToPositions() { setEditing(false); setPositionError(""); requestAnimationFrame(() => editorTrigger.current?.focus({ preventScroll: true })); }
  function updateDraft(patch: Partial<PlanPosition>) {
    if (!selected || !draft) return;
    setDrafts(current => ({ ...current, [selected.id]: { ...draft, ...patch } }));
    setPositionError(""); setReviewed(false);
  }
  function applyPosition(event: React.FormEvent) {
    event.preventDefault(); if (!selected || !draft) return;
    if (!draft.name.trim()) { setPositionError("Give this position a name before applying."); return; }
    if ([draft.x, draft.y, draft.z].some(value => value !== null && (!Number.isFinite(value) || Math.abs(value) > PLAN_LIMITS.magnitude))) { setPositionError("Coordinates must be finite and within the file format's ±1,000,000,000 limit."); return; }
    update({ ...plan, units: { ...editorUnits }, positions: plan.positions.map(position => position.id === selected.id ? { ...draft, name: draft.name.trim(), enabled: position.enabled } : position) });
    setDrafts(current => { const next = { ...current }; delete next[selected.id]; return next; });
    setUnitDrafts(current => { const next = { ...current }; delete next[selected.id]; return next; });
    setMessage(`${draft.name.trim()} applied to this local plan. Not acquired.`);
  }
  function changeSteps(steps: readonly AcquisitionStep[]) {
    update({ ...plan, steps: steps.map(step => ({ id: step.id, label: step.label, exposure: step.exposure, time: step.time, depth: step.depth, channel: step.channel })) });
  }
  function focusIssue(issue: PlanIssue) {
    navigate(issue.screen);
    if (issue.screen === "positions" && !issue.positionId) setEditing(false);
    if (issue.positionId) editPosition(issue.positionId);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const path = issue.path === "frames" ? "z.count" : issue.path;
      const scope = [...(root.current?.querySelectorAll<HTMLElement>("[data-plan-path]") ?? [])].find(node => node.dataset.planPath === path);
      let target = scope?.matches("input,button") ? scope : scope?.querySelector<HTMLElement>("input:not([type=hidden]),button,summary");
      if (!target && issue.screen === "sequence") {
        const index = plan.steps.findIndex(step => path.startsWith(`steps.${step.id}.`));
        const step = plan.steps[index];
        const field = step ? path.slice(`steps.${step.id}.`.length) : "";
        const row = root.current?.querySelectorAll<HTMLElement>(".rs-acquisition-sequencer-step")[index];
        target = field === "channel" ? row?.querySelector<HTMLElement>('[role="combobox"]') : row?.querySelectorAll<HTMLInputElement>('input[type="number"]')[["exposure", "time", "depth"].indexOf(field)];
      }
      const details = target?.closest("details"); if (details) details.open = true;
      (target ?? root.current?.querySelector<HTMLElement>(".mc-workflow-heading"))?.focus({ preventScroll: false });
    }));
  }
  async function readImport(file: File | undefined) {
    if (!file) return;
    const version = ++request.current; setReading(true); setCandidate(null); setImportError("");
    try {
      if (file.size > PLAN_LIMITS.bytes) throw new Error("File exceeds the 256 KiB limit.");
      const imported = parsePlan(await file.text());
      if (version === request.current) setCandidate({ plan: imported, name: file.name });
    } catch (error) { if (version === request.current) setImportError(error instanceof Error ? error.message : "Unable to read this file."); }
    finally { if (version === request.current) setReading(false); }
  }
  function applyImport() {
    if (!candidate) return;
    update(candidate.plan); setSelectedId(candidate.plan.positions[0]?.id ?? null); setEditing(false); setDrafts({}); setUnitDrafts({}); setSelection({ position: 0, z: 0, t: 0, step: 0 });
    setMessage(`${candidate.name} imported as a local draft. Nothing has been acquired.`); setCandidate(null);
  }
  function parseProject(value: unknown): MicroscopyPlan {
    const parsed = parsePlan(JSON.stringify(value));
    return parsed;
  }
  function restoreProject(next: MicroscopyPlan, title: string) {
    update(next); setSelectedId(next.positions[0]?.id ?? null); setEditing(false); setDrafts({}); setUnitDrafts({}); setSelection({ position: 0, z: 0, t: 0, step: 0 });
    setScreen("review"); setMessage(`${title || "Microscopy project"} restored as a local draft. Nothing has been acquired.`);
  }
  async function printReview(event: React.MouseEvent<HTMLButtonElement>) {
    const sheet = root.current?.parentElement?.querySelector(".mc-print-sheet");
    if (!sheet || printing) return;
    const trigger = event.currentTarget;
    const frame = document.createElement("iframe");
    frame.title = "Microscopy worksheet";
    frame.className = "mc-print-frame";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("sandbox", "allow-same-origin allow-modals");
    printFrame.current?.remove(); printFrame.current = frame;
    document.body.append(frame); setPrinting(true); setMessage("Preparing worksheet…");
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => { if (timeout) clearTimeout(timeout); frame.remove(); if (printFrame.current === frame) printFrame.current = null; if (trigger.isConnected) { setPrinting(false); trigger.focus(); } };
    try {
      const doc = frame.contentDocument;
      const view = frame.contentWindow;
      if (!doc || !view) throw new Error("Print document unavailable");
      doc.title = `${plan.title || "Untitled plan"} · Microscopy worksheet`;
      doc.body.className = "mc-print-document";
      const styles = [...document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style')].map(source => {
        const copy = source.cloneNode(true) as HTMLLinkElement | HTMLStyleElement;
        const loaded = source.tagName === "LINK" ? new Promise<void>((resolve, reject) => {
          copy.addEventListener("load", () => resolve(), { once: true });
          copy.addEventListener("error", () => reject(new Error("Print styles unavailable")), { once: true });
        }) : Promise.resolve();
        doc.head.append(copy); return loaded;
      });
      // DOM cloning keeps user-supplied titles and values as text, with no HTML interpolation.
      doc.body.append(doc.importNode(sheet, true));
      await Promise.race([Promise.all(styles).then(() => doc.fonts.ready), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Print styles timed out")), 10000); })]);
      if (timeout) clearTimeout(timeout);
      if (!frame.isConnected) return;
      view.addEventListener("afterprint", cleanup, { once: true });
      setMessage("Worksheet opened for printing. Unapplied position edits are excluded.");
      view.focus(); view.print();
      // Some browsers do not deliver afterprint when the print dialog is dismissed.
      if (frame.isConnected) timeout = setTimeout(cleanup, 60000);
    } catch {
      if (trigger.isConnected) setMessage("The worksheet could not be prepared for printing. Your plan is unchanged; try again.");
      cleanup();
    }
  }
  function exportPlan() {
    try {
      const content = serializePlan(plan);
      for (const previous of downloadUrls.current) URL.revokeObjectURL(previous);
      downloadUrls.current.clear();
      const url = URL.createObjectURL(new Blob([content], { type: "application/json" })); downloadUrls.current.add(url);
      const link = document.createElement("a"); link.href = url; link.download = "microscopy-plan.json"; link.click();
      setMessage(`Exported the working draft${unsaved ? "; unapplied position edits are kept in the editor" : ""}. No acquisition records included.`);
    } catch (error) { setMessage(`Export unavailable: ${error instanceof Error ? error.message : "review the plan fields."}`); }
  }
  const stepRecords: AcquisitionStep[] = plan.steps.map(step => ({ ...step, exposureUnit: "ms", timeUnit: "s", depthUnit: "µm", status: "Not acquired", actions: [{ id: "remove", label: "Remove step" }] }));
  const stackAxes = [
    { id: "position", label: "Stage position", positions: included.map(position => ({ value: position.name || position.id, label: position.id })) },
    { id: "z", label: "Depth slice", unit: "µm", positions: Array.from({ length: boundedCount(plan.z.count) }, (_, index) => ({ value: axisValue(plan.z, index), label: "relative to stage Z" })) },
    { id: "t", label: "Time point", unit: "s", positions: Array.from({ length: boundedCount(plan.t.count) }, (_, index) => ({ value: axisValue(plan.t, index) })) },
    { id: "step", label: "Capture step", positions: plan.steps.map(step => ({ value: step.label || step.id })) },
  ];

  return <div className="mc-frame"><section ref={root} className="mc" data-screen={screen} data-editing={editing} data-ready={ready} aria-label="Local microscopy planning desk">
    <header className="mc-header"><div className="mc-brand"><Icon name="crosshair" size={24} /><div><strong>{plan.title.split(" · ")[0] || "Untitled plan"}</strong><span>Acquisition planning</span></div></div><span className="mc-local">Local draft</span><Button variant="ghost" onClick={() => navigate("review")}><Icon name="file-text" size={16} /><span>Review</span></Button></header>
    <div className="mc-body">
      <aside className="mc-preview" aria-label="Working plan preview"><div className="mc-pane-title"><span>Stage overview</span><span>Not acquired</span></div><div className="mc-preview-scroll"><div className="mc-preview-title"><span>{plan.stage.label || "Stage label missing"}</span><h2>{plan.title || "Untitled plan"}</h2><p>{plan.coordinateFrame?.label || "Coordinate frame not supplied"}</p></div><StageDiagram plan={plan} selected={selectedId} /><div className="mc-map-legend"><span><i />Included position</span><span>Connecting line shows list order</span></div><div className="mc-selected-record"><span>Selected position</span><strong>{selected?.name || "No position selected"}</strong><dl>{(["x", "y", "z"] as const).map(axis => <div key={axis}><dt>{axis.toUpperCase()}</dt><dd>{coordinate(selected?.[axis] ?? null, plan.units[axis])}</dd></div>)}</dl><Button variant="ghost" disabled={!selected} onClick={() => editPosition()}>Edit selected position<Icon name="arrow-right" size={16} /></Button></div><p className="mc-note">A diagram of supplied coordinates. Fitting the view changes its scale, never the stage values.</p></div><div className="mc-summary"><div><strong data-testid="mc-frame-count">{formatNumber(review.frames)}</strong><span>Planned frames</span></div><div><strong>{review.exposureMs === null ? "Unknown" : `${formatNumber(review.exposureMs / 1000)} s`}</strong><span>Total exposure</span></div></div></aside>
      <section className="mc-workflow" aria-label="Plan editor"><nav className="mc-tabs" aria-label="Planning views">{screens.map(([value, label]) => <Button key={value} variant="ghost" aria-current={screen === value ? "page" : undefined} onClick={() => navigate(value)}>{label}</Button>)}</nav>
        <header className="mc-workflow-head"><div><span>{String(screens.findIndex(([value]) => value === screen) + 1).padStart(2, "0")} / Planning</span><h2 className="mc-workflow-heading" tabIndex={-1}>{screen === "positions" ? editing ? "Position editor" : "Stage positions" : screen === "sequence" ? "Capture sequence" : screen === "stack" ? "Depth & time" : "Review the plan"}</h2></div><span className="mc-head-state">{reviewed ? "Reviewed locally" : "Draft"}</span></header>
        <div className="mc-workflow-scroll">
          {screen === "positions" && (!editing ? <>
            <div className="mc-section mc-position-summary"><p>{included.length} of {plan.positions.length} positions included. Select a record, then edit its coordinates.</p><div className="mc-actions"><Button ref={editorTrigger} disabled={!selected} onClick={() => editPosition()}>Edit position</Button><Button variant="ghost" disabled={plan.positions.length >= PLAN_LIMITS.positions} onClick={() => { const id = nextId("site", plan.positions); const position = { id, name: `Position ${plan.positions.length + 1}`, x: null, y: null, z: null, enabled: true }; update({ ...plan, positions: [...plan.positions, position] }); setSelectedId(id); setEditing(true); requestAnimationFrame(() => positionHeading.current?.focus()); }}><Icon name="plus" size={16} />Add position</Button></div>{unsaved > 0 && <p className="mc-draft-count">{unsaved} position {unsaved === 1 ? "has" : "have"} unapplied edits.</p>}</div>
            <div className="mc-section mc-position-list" data-plan-path="positions"><StagePositionList label="Position records" coordinateFrame={plan.coordinateFrame} units={plan.units} positions={plan.positions} value={selectedId} onValueChange={setSelectedId} onEnabledChange={(id, enabled) => { update({ ...plan, positions: plan.positions.map(position => position.id === id ? { ...position, enabled } : position) }); setDrafts(current => { const existing = ownRecord(current, id); return existing ? { ...current, [id]: { ...existing, enabled } } : current; }); }} onOrderChange={ids => update({ ...plan, positions: ids.map(id => plan.positions.find(position => position.id === id)!) })} onRemove={id => { const index = plan.positions.findIndex(position => position.id === id); const positions = plan.positions.filter(position => position.id !== id); update({ ...plan, positions }); if (id === selectedId) setSelectedId(positions[Math.min(index, positions.length - 1)]?.id ?? null); setDrafts(current => { const next = { ...current }; delete next[id]; return next; }); setUnitDrafts(current => { const next = { ...current }; delete next[id]; return next; }); }} /></div>
            <details className="mc-details"><summary>Coordinate context</summary><div className="mc-section mc-form-grid"><div data-plan-path="stage"><Input label="Stage label" maxLength={96} value={plan.stage.label} onChange={event => update({ ...plan, stage: { ...plan.stage, label: event.target.value } })} /></div><div data-plan-path="coordinateFrame" className="mc-field"><span id="mc-frame-label">Coordinate frame</span><Select fullWidth aria-labelledby="mc-frame-label" value={plan.coordinateFrame?.id ?? ""} options={[{ value: "", label: "Not supplied" }, { value: "slide-local", label: "Slide-local frame" }, ...(plan.coordinateFrame && plan.coordinateFrame.id !== "slide-local" ? [{ value: plan.coordinateFrame.id, label: plan.coordinateFrame.label || plan.coordinateFrame.id }] : [])]} onValueChange={value => update({ ...plan, coordinateFrame: value ? value === plan.coordinateFrame?.id ? plan.coordinateFrame : { id: "slide-local", label: "Slide-local frame" } : null })} /></div>{plan.coordinateFrame && <Input data-plan-path="coordinateFrame.label" label="Frame label" value={plan.coordinateFrame.label} maxLength={96} onChange={event => update({ ...plan, coordinateFrame: { ...plan.coordinateFrame!, label: event.target.value } })} />}<p className="mc-note">Assigning a frame or unit label does not convert coordinates. Only use labels that match your supplied values.</p>{(["x", "y", "z"] as const).map(axis => <div className="mc-field" key={axis} data-plan-path={`units.${axis}`}><span id={`mc-unit-${axis}`}>{axis.toUpperCase()} unit</span><Select fullWidth aria-labelledby={`mc-unit-${axis}`} value={plan.units[axis] ?? ""} options={[{ value: "", label: "Not supplied" }, ...unitOptions]} onValueChange={unit => update({ ...plan, units: { ...plan.units, [axis]: unit === "µm" ? unit : null } })} /></div>)}</div></details>
          </> : draft && selected ? <form className="mc-position-editor" onSubmit={applyPosition} noValidate><div className="mc-section"><Button variant="ghost" onClick={backToPositions}><Icon name="arrow-left" size={16} />Back to positions</Button><h3 ref={positionHeading} tabIndex={-1}>{selected.id}</h3><p>Edits stay here until Apply. Back preserves the draft.</p></div><div className="mc-section mc-form-grid"><div data-plan-path={`positions.${selected.id}.name`}><Input label="Position name" maxLength={96} value={draft.name} onChange={event => updateDraft({ name: event.target.value })} /></div>{(["x", "y", "z"] as const).map(axis => <div key={axis} data-plan-path={`positions.${selected.id}.${axis}`}><QuantityField label={`${axis.toUpperCase()} coordinate`} amountLabel={`${axis.toUpperCase()} coordinate amount`} unitLabel={`${axis.toUpperCase()} coordinate unit`} units={unitOptions} value={{ amount: draft[axis], unit: editorUnits[axis] }} onValueChange={value => { updateDraft({ [axis]: value.amount }); setUnitDrafts(current => ({ ...current, [selected.id]: { ...editorUnits, [axis]: value.unit === "µm" ? "µm" : null } })); }} step="any" min={-PLAN_LIMITS.magnitude} max={PLAN_LIMITS.magnitude} /><span className="mc-current">Working value: {coordinate(selected[axis], plan.units[axis])}</span></div>)}<p className="mc-note">Blank means not supplied. Zero is a known coordinate. Applying a unit change labels all positions in this plan; it does not perform conversion.</p>{positionError && <p role="alert">{positionError}</p>}</div><footer className="mc-section mc-actions mc-editor-actions"><Button type="submit" disabled={!dirty}>Apply position</Button><Button variant="ghost" disabled={!dirty} onClick={() => { setDrafts(current => { const next = { ...current }; delete next[selected.id]; return next; }); setUnitDrafts(current => { const next = { ...current }; delete next[selected.id]; return next; }); setPositionError(""); setMessage("Position edits discarded. Working coordinates restored."); }}>Discard changes</Button></footer></form> : <div className="mc-section"><p>No position is selected.</p><Button variant="ghost" onClick={backToPositions}>Back to positions</Button></div>)}
          {screen === "sequence" && <>
            <div className="mc-section"><p>Repeat these ordered steps at each included position, depth slice and time point. Exposure is in milliseconds; time and depth are offsets.</p><Button variant="ghost" disabled={plan.steps.length >= PLAN_LIMITS.steps} onClick={() => update({ ...plan, steps: [...plan.steps, { id: nextId("capture", plan.steps), label: `Capture ${plan.steps.length + 1}`, exposure: null, time: 0, depth: 0, channel: plan.channels[0]?.id ?? null }] })}><Icon name="plus" size={16} />Add capture step</Button></div>
            <div className="mc-section mc-sequencer" data-plan-path="steps"><AcquisitionSequencer label="Ordered capture steps" steps={stepRecords} channels={plan.channels} onStepsChange={changeSteps} onAction={(id, action) => { if (action === "remove") update({ ...plan, steps: plan.steps.filter(step => step.id !== id) }); }} /></div>
            <details className="mc-details"><summary>Channels and step names</summary><div className="mc-section mc-form-grid">{plan.channels.map(channel => <div className="mc-channel" key={channel.id}><Input data-plan-path={`channels.${channel.id}.label`} label={`Channel name: ${channel.id}`} value={channel.label} maxLength={96} onChange={event => update({ ...plan, channels: plan.channels.map(item => item.id === channel.id ? { ...item, label: event.target.value } : item) })} /><Button variant="ghost" aria-label={`Remove channel ${channel.label || channel.id}`} onClick={() => update({ ...plan, channels: plan.channels.filter(item => item.id !== channel.id), steps: plan.steps.map(step => step.channel === channel.id ? { ...step, channel: null } : step) })}><Icon name="trash" size={16} /></Button></div>)}<Button variant="ghost" disabled={plan.channels.length >= PLAN_LIMITS.channels} onClick={() => update({ ...plan, channels: [...plan.channels, { id: nextId("channel", plan.channels), label: `Channel ${plan.channels.length + 1}` }] })}>Add channel</Button>{plan.steps.map(step => <Input key={step.id} data-plan-path={`steps.${step.id}.label`} label={`Step name: ${step.id}`} maxLength={96} value={step.label} onChange={event => update({ ...plan, steps: plan.steps.map(item => item.id === step.id ? { ...item, label: event.target.value } : item) })} />)}</div></details>
          </>}
          {screen === "stack" && <>
            <div className="mc-section"><p>Start + interval × index. Zero-based offsets are relative to each position and to the beginning of the plan.</p><DepthDiagram axis={plan.z} index={previewSelection.z} /></div>
            {(["z", "t"] as const).map(axis => <div className="mc-section mc-form-grid" key={axis}><h3>{axis === "z" ? "Depth slices" : "Time points"}</h3>{(["start", "step"] as const).map(part => <div key={part} data-plan-path={`${axis}.${part}`}><QuantityField label={`${axis === "z" ? "Depth" : "Time"} ${part === "start" ? "start" : "interval"}`} amountLabel={`${axis === "z" ? "Depth" : "Time"} ${part === "start" ? "start" : "interval"} amount`} unitLabel={`${axis === "z" ? "Depth" : "Time"} ${part} unit`} units={[{ value: axis === "z" ? "µm" : "s", label: axis === "z" ? "µm" : "s" }]} value={{ amount: plan[axis][part], unit: axis === "z" ? "µm" : "s" }} onValueChange={value => update({ ...plan, [axis]: { ...plan[axis], [part]: value.amount } })} min={axis === "t" ? 0 : -PLAN_LIMITS.magnitude} max={PLAN_LIMITS.magnitude} /></div>)}<div data-plan-path={`${axis}.count`}><Input label={axis === "z" ? "Depth slice count" : "Time point count"} type="number" min={1} max={PLAN_LIMITS.axis} step={1} value={plan[axis].count ?? ""} onChange={event => update({ ...plan, [axis]: { ...plan[axis], count: Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : null } })} hint={`Up to ${PLAN_LIMITS.axis}; last offset: ${coordinate(axisValue(plan[axis], (plan[axis].count ?? 0) - 1), axis === "z" ? "µm" : "s")}`} /></div></div>)}
            <div className="mc-section"><StackNavigator label="Inspect a planned frame" axes={stackAxes} value={previewSelection} onValueChange={setSelection} description="Navigation changes this preview only. It does not edit the plan or move an instrument." /><dl className="mc-preview-values" data-testid="mc-preview-values"><div><dt>Position</dt><dd>{preview.position?.name ?? "Not supplied"}</dd></div><div><dt>Planned Z</dt><dd>{coordinate(preview.z, plan.units.z)}</dd></div><div><dt>Planned time</dt><dd>{coordinate(preview.time, "s")}</dd></div><div><dt>Channel</dt><dd>{preview.channel ?? "Not supplied"}</dd></div><div><dt>State</dt><dd>{preview.status}</dd></div></dl></div>
          </>}
          {screen === "review" && <>
            <div className="mc-section"><Input label="Plan title" value={plan.title} maxLength={96} onChange={event => update({ ...plan, title: event.target.value })} data-plan-path="title" /><div className="mc-review-equation"><span>{included.length} positions × {plan.z.count ?? "?"} slices × {plan.t.count ?? "?"} time points × {plan.steps.length} steps</span><strong data-testid="mc-review-frames">{summary}</strong><p>{review.exposureMs === null ? "Total exposure is unknown." : `${formatNumber(review.exposureMs / 1000)} s total exposure.`} Movement, readout and other overhead are not estimated.</p></div><p className="mc-note">Order: position → time point → depth slice → capture step. Planned Z adds the position Z, slice offset and step depth. Requested time adds the time-point and step offsets. Sequential execution and any overlap need instrument validation.</p></div>
            <div className="mc-section mc-review-status"><h3>{review.issues.length ? `${review.issues.length} fields need attention` : "Working plan is complete"}</h3>{review.issues.length > 0 ? <ul className="mc-issues">{review.issues.map(issue => <li key={issue.path}><Button variant="ghost" onClick={() => focusIssue(issue)}>{issue.message}<Icon name="arrow-right" size={16} /></Button></li>)}</ul> : <p>All required planning values are supplied. This checks the local format, not an instrument's travel, timing or compatibility.</p>}{unsaved > 0 && <p>{unsaved} position {unsaved === 1 ? "has" : "have"} unapplied edits. Review and export use the working coordinates.</p>}<Button disabled={review.issues.length > 0 || unsaved > 0 || reviewed} onClick={() => { setReviewed(true); setMessage("Working plan reviewed locally. All frames remain Not acquired."); }}>{reviewed ? "Reviewed locally" : "Mark plan reviewed"}</Button><span className="mc-not-acquired">Acquisition state: Not acquired</span></div>
            <div className="mc-section mc-transfer"><h3>Plan file</h3><p>Version 1 · JSON · up to 256 KiB. Imports are checked before you apply them. Export keeps unknown values as null.</p><div className="mc-actions"><Button variant="ghost" onClick={exportPlan}><Icon name="download" size={16} />Export draft</Button><Button variant="ghost" disabled={reading} onClick={() => fileInput.current?.click()}><Icon name="upload" size={16} />{reading ? "Reading file…" : "Import draft"}</Button><Button variant="ghost" disabled={printing} onClick={printReview}>{printing ? "Preparing worksheet…" : reviewed ? "Print reviewed worksheet" : "Print worksheet"}</Button><input ref={fileInput} className="mc-file-input" type="file" accept=".json,application/json" aria-label="Import plan file" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void readImport(file); }} /></div>{importError && <p role="alert" className="mc-import-error">{importError} Working plan and editor drafts preserved.</p>}{candidate && <div className="mc-import-candidate"><h4>Ready to import</h4><p>{candidate.name}</p><strong>{candidate.plan.title || "Untitled plan"}</strong><p>{candidate.plan.positions.length} positions · {candidate.plan.steps.length} steps · {formatNumber(reviewPlan(candidate.plan).frames)} planned frames</p><p>Apply replaces this working plan and its position edits. Imported plans always need a new local review.</p><div className="mc-actions"><Button onClick={applyImport}>Apply import</Button><Button variant="ghost" onClick={() => setCandidate(null)}>Cancel import</Button></div></div>}</div>
          </>}
        </div>
        <div className="mc-workflow-foot"><span>{screen === "positions" && dirty ? "Unapplied position edits" : summary}</span><span>Not acquired</span></div>
      </section>
    </div>
    <nav className="mc-mobile-nav" aria-label="Microscopy screens">{screens.map(([value, label]) => <Button key={value} variant="ghost" aria-current={screen === value ? "page" : undefined} onClick={() => navigate(value)}>{label}</Button>)}</nav>
    <footer className="mc-footer"><span>{plan.stage.label || "Unnamed stage"} · {plan.coordinateFrame?.label || "Frame unknown"}</span><span>No instrument connected</span></footer><p className="mc-announcement" role="status">{message}</p>
    <section className="mc-print-sheet" aria-label="Printed plan review"><h2>{plan.title || "Untitled plan"}</h2><p>{reviewed ? "Reviewed locally" : "Draft worksheet"} · schema {plan.schema} · version {plan.version}{unsaved > 0 ? " · Unapplied position edits are excluded from this worksheet." : ""}</p><p>Content fingerprint: {worksheetFingerprint}. Identifies the applied plan values printed below.</p><dl><div><dt>Planned frames</dt><dd>{formatNumber(review.frames)}</dd></div><div><dt>Total exposure</dt><dd>{review.exposureMs === null ? "Unknown" : `${formatNumber(review.exposureMs / 1000)} s`}</dd></div><div><dt>Units</dt><dd>X {plan.units.x ?? "Unknown"} · Y {plan.units.y ?? "Unknown"} · Z {plan.units.z ?? "Unknown"}</dd></div><div><dt>Coordinate frame</dt><dd>{plan.coordinateFrame?.label || "Not supplied"}</dd></div></dl><h3>Plan issues</h3>{review.issues.length ? <ul>{review.issues.map(issue => <li key={issue.path}>{issue.path}: {issue.message}</li>)}</ul> : <p>No plan issues recorded.</p>}<h3>Ordered positions</h3><ol>{plan.positions.map(position => <li key={position.id}><strong>{position.name || "Unnamed position"}</strong> · {position.enabled ? "Included" : "Excluded"} · X {coordinate(position.x, plan.units.x)} · Y {coordinate(position.y, plan.units.y)} · Z {coordinate(position.z, plan.units.z)}</li>)}</ol><h3>Capture steps</h3><ol>{plan.steps.map(step => <li key={step.id}><strong>{step.label || "Unnamed step"}</strong> · channel {plan.channels.find(channel => channel.id === step.channel)?.label || "Not supplied"} · exposure {step.exposure === null ? "Unknown" : `${formatNumber(step.exposure)} ms`} · time {step.time === null ? "Unknown" : `${formatNumber(step.time)} s`} · depth {step.depth === null ? "Unknown" : `${formatNumber(step.depth)} µm`}</li>)}</ol><h3>Axes</h3><p>Z: start {coordinate(plan.z.start, "µm")}, interval {coordinate(plan.z.step, "µm")}, count {plan.z.count ?? "Unknown"}. T: start {coordinate(plan.t.start, "s")}, interval {coordinate(plan.t.step, "s")}, count {plan.t.count ?? "Unknown"}.</p><p>Acquisition state: Not acquired. This worksheet is a review of supplied planning values, not an acquisition record.</p></section>
    <ProjectTools kind="microscopy" title={plan.title || "Microscopy plan"} value={plan} parse={parseProject} onRestore={restoreProject} documentVersion={1} />
  </section></div>;
}
