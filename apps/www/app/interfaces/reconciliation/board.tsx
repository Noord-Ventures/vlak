"use client";

import * as React from "react";
import { Badge, Button, Checkbox, Input, Select } from "@noorddev/vlak-react";
import { ProjectTools, downloadProjectFile } from "@/components/project-tools";
import {
  RECONCILIATION_LIMITS,
  columnPairs,
  exportComparison,
  exportRecipe,
  initialProject,
  readRecipe,
  makeRecipe,
  parseReconciliationProject,
  reconcileDecisions,
  shouldAcceptJob,
} from "./model";
import type { Category, Comparison, ReconciliationProject, ReconciliationSource, ResultGroup, ReviewDecision } from "./model";
import type { WorkerPayload, WorkerRequest, WorkerResponse } from "./worker";

const categories: { value: Category; label: string }[] = [
  { value: "matched", label: "Matched" },
  { value: "missing", label: "Missing" },
  { value: "conflicting", label: "Conflicting" },
  { value: "ambiguous", label: "Ambiguous" },
];

function sourceLabel(source: ReconciliationSource | null) {
  if (!source) return "No file chosen";
  return `${source.name} · ${source.table.rows.length.toLocaleString()} rows · ${source.table.headers.length} columns`;
}

function cellLabel(value: string | null) { return value === null ? "Missing" : value === "" ? "Empty" : value; }
function safeFilename(value: string, suffix: string) { return `${value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "reconciliation"}-${suffix}`; }
function pairIdentity(pair: { leftId: string; rightId: string }) { return `${pair.leftId}\u0000${pair.rightId}`; }

function SourcePreview({ side, source, onChoose, busy }: { side: "left" | "right"; source: ReconciliationSource | null; onChoose: (file?: File) => void; busy: boolean }) {
  const input = React.useRef<HTMLInputElement>(null);
  return <section className="rc-source" aria-labelledby={`rc-${side}-heading`}>
    <header><div><span>{side === "left" ? "Source A" : "Source B"}</span><h3 id={`rc-${side}-heading`}>{source?.name ?? "Choose a CSV file"}</h3></div><Button variant="ghost" disabled={busy} onClick={() => input.current?.click()}>{source ? "Replace" : "Choose file"}</Button></header>
    <input ref={input} hidden type="file" accept=".csv,text/csv" onChange={event => { onChoose(event.target.files?.[0]); event.target.value = ""; }} />
    <p>{sourceLabel(source)}</p>
    {source?.table.diagnostics.map(message => <p className="rc-diagnostic" key={message}>{message}</p>)}
    {source && source.table.headers.length > 0 && <div className="rc-table-scroll"><table><thead><tr>{source.table.headers.map(header => <th key={header.id} scope="col">{header.label}</th>)}</tr></thead><tbody>{source.table.rows.slice(0, 5).map(row => <tr key={row.id}>{source.table.headers.map((header, index) => <td key={header.id} data-missing={row.cells[index] === null}>{cellLabel(row.cells[index] ?? null)}</td>)}</tr>)}</tbody></table></div>}
    {source && <small>Saved digest {source.hash.slice(0, 12)}… (not independently verified) · source text kept unchanged in the project</small>}
  </section>;
}

function GroupSide({ label, source, rows }: { label: string; source: ReconciliationSource; rows: ResultGroup["left"] }) {
  const [visible, setVisible] = React.useState(20);
  return <section><h4>{label}</h4>{rows.length === 0 ? <p>No row with this key.</p> : <>{rows.slice(0, visible).map(row => <dl key={row.id}><div><dt>Source row</dt><dd>{row.sourceRow}</dd></div>{source.table.headers.map((header, index) => <div key={header.id}><dt>{header.label}</dt><dd data-missing={row.cells[index] === null}>{cellLabel(row.cells[index] ?? null)}</dd></div>)}</dl>)}{rows.length > visible && <Button variant="ghost" onClick={() => setVisible(count => count + 20)}>Show 20 more of {rows.length}</Button>}</> }</section>;
}

function GroupDetail({ group, project, decision, onDecision, onBack }: { group: ResultGroup; project: ReconciliationProject; decision?: ReviewDecision; onDecision: (status: ReviewDecision["status"]) => void; onBack: () => void }) {
  const sides = [["Source A", project.sources.left!, group.left], ["Source B", project.sources.right!, group.right]] as const;
  return <article className="rc-record" aria-labelledby="rc-record-title">
    <Button className="rc-back" variant="ghost" onClick={onBack}>Back to worklist</Button>
    <header><div><Badge>{group.category}</Badge><h3 id="rc-record-title">Key: {cellLabel(group.key)}</h3></div><span>{group.left.length} A · {group.right.length} B</span></header>
    {group.category === "ambiguous" && <p>At least one side has a duplicate key, or the key field is missing or empty. Exact matching does not create a many-to-many result.</p>}
    {group.category === "missing" && <p>This key occurs on only one side.</p>}
    {group.category === "conflicting" && <p>Different fields: {group.differences.join(", ") || "none"}.</p>}
    <div className="rc-record-sides">{sides.map(([label, source, rows]) => <GroupSide key={`${group.id}:${label}`} label={label} source={source} rows={rows} />)}</div>
    {group.category !== "matched" && <footer><span>{decision ? `Decision: ${decision.status}` : "Decision: unreviewed"}</span><div><Button onClick={() => onDecision("reviewed")}>Mark reviewed</Button><Button variant="ghost" onClick={() => onDecision("follow-up")}>Needs follow-up</Button></div></footer>}
  </article>;
}

export function ReconciliationBoard() {
  const [project, setProject] = React.useState<ReconciliationProject>(() => initialProject());
  const [leftKey, setLeftKey] = React.useState(""); const [rightKey, setRightKey] = React.useState("");
  const [comparison, setComparison] = React.useState<Comparison | null>(null);
  const [category, setCategory] = React.useState<Category>("conflicting");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("Choose two local CSV files. Nothing is uploaded.");
  const [error, setError] = React.useState(""); const [busy, setBusy] = React.useState(false);
  const [includedColumns, setIncludedColumns] = React.useState<string[] | null>(null);
  const [columnsOpen, setColumnsOpen] = React.useState(false);
  const worker = React.useRef<Worker | null>(null); const activeJob = React.useRef(0);

  React.useEffect(() => () => { worker.current?.terminate(); activeJob.current++; }, []);
  const dispatch = React.useCallback((request: WorkerPayload, apply: (response: WorkerResponse) => void, working: string) => {
    worker.current?.terminate(); const jobId = ++activeJob.current;
    const next = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }); worker.current = next;
    setBusy(true); setError(""); setStatus(working);
    next.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (!shouldAcceptJob(activeJob.current, event.data.jobId)) return;
      setBusy(false); worker.current?.terminate(); worker.current = null;
      if (event.data.kind === "error") { setError(`${event.data.message} Current work is unchanged.`); setStatus("Worker stopped without replacing the last valid result."); return; }
      apply(event.data);
    };
    next.onerror = () => { if (shouldAcceptJob(activeJob.current, jobId)) { setBusy(false); setError("The local worker stopped. Current work is unchanged."); setStatus("Worker stopped without replacing the last valid result."); } };
    next.postMessage({ ...request, jobId } as WorkerRequest);
  }, []);

  function cancel() { fileSequence.current++; worker.current?.terminate(); worker.current = null; activeJob.current++; setBusy(false); setStatus("Canceled. The last valid comparison is still available."); }
  function changeKey(side: "left" | "right", value: string) {
    cancel();
    if (side === "left") setLeftKey(value); else setRightKey(value);
    setIncludedColumns(null);
    setProject(current => ({ ...current, recipe: null, decisions: [] }));
    setComparison(null); setSelectedId(null); setStatus("Key selection changed. Run a new exact comparison.");
  }
  const fileSequence = React.useRef(0);
  const recipeInput = React.useRef<HTMLInputElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(100);
  async function chooseSource(side: "left" | "right", file?: File) {
    if (!file) return;
    const sequence = ++fileSequence.current;
    const other = project.sources[side === "left" ? "right" : "left"];
    if (file.size + (other?.size ?? 0) > RECONCILIATION_LIMITS.combinedBytes) { setError("The two files exceed the 10 MiB combined limit. Current work is unchanged."); return; }
    try {
      const text = await file.text();
      if (sequence !== fileSequence.current) return;
      dispatch({ kind: "parse", name: file.name, size: new TextEncoder().encode(text).byteLength, text }, response => {
        if (response.kind !== "parsed") return;
        const totalRows = response.source.table.rows.length + (other?.table.rows.length ?? 0);
        if (totalRows > RECONCILIATION_LIMITS.rows) { setError("The two files exceed the 50,000-row combined limit. Current work is unchanged."); return; }
        setProject(current => ({ ...current, sources: { ...current.sources, [side]: response.source }, recipe: null, decisions: [] }));
        setIncludedColumns(null);
        setComparison(null); setSelectedId(null);
        if (side === "left") setLeftKey(response.source.table.headers[0]?.id ?? ""); else setRightKey(response.source.table.headers[0]?.id ?? "");
        setStatus(`${file.name} parsed locally. Choose the exact key columns.`);
      }, `Parsing ${file.name} locally…`);
    } catch { setError("The selected file could not be read. Current work is unchanged."); }
  }
  function runComparison(nextProject = project) {
    const { left, right } = nextProject.sources;
    if (!left || !right) { setError("Choose both CSV files first."); return; }
    try {
      const recipe = nextProject.recipe ?? makeRecipe(left.table, right.table, leftKey, rightKey, selectedPairs);
      dispatch({ kind: "compare", left, right, recipe }, response => {
        if (response.kind !== "compared") return;
        setVisibleCount(100);
        setProject(current => ({ ...current, recipe, decisions: reconcileDecisions(current.decisions, response.comparison) }));
        setComparison(response.comparison); setSelectedId(null);
        const firstIssue = response.comparison.groups.find(group => group.category !== "matched"); if (firstIssue) setCategory(firstIssue.category);
        setStatus("Exact comparison complete. Review exception groups, then export a fixed result revision.");
      }, "Comparing exact keys in a local worker…");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The recipe could not be applied."); }
  }
  function restore(value: ReconciliationProject, title: string) {
    cancel(); fileSequence.current++;
    const restored = { ...value, title: value.title || title }; setProject(restored); setComparison(null); setSelectedId(null);
    setLeftKey(restored.recipe?.leftKeyId ?? restored.sources.left?.table.headers[0]?.id ?? "");
    setRightKey(restored.recipe?.rightKeyId ?? restored.sources.right?.table.headers[0]?.id ?? "");
    setIncludedColumns(restored.recipe?.compare.map(pairIdentity) ?? null);
    setStatus("Project reopened. Rebuilding its exact comparison locally…");
    if (restored.sources.left && restored.sources.right && restored.recipe) runComparison(restored);
  }
  function decide(group: ResultGroup, decisionStatus: ReviewDecision["status"]) {
    if (!comparison) return;
    const next = { groupId: group.id, fingerprint: comparison.fingerprint, status: decisionStatus, note: "" } satisfies ReviewDecision;
    setProject(current => ({ ...current, decisions: [...reconcileDecisions(current.decisions, comparison).filter(item => item.groupId !== group.id), next] }));
    setStatus(`Key ${cellLabel(group.key)} marked ${decisionStatus}.`);
  }
  function includeColumn(identity: string, checked: boolean) {
    cancel();
    const next = checked ? [...new Set([...selectedPairs.map(pairIdentity), identity])] : selectedPairs.map(pairIdentity).filter(value => value !== identity);
    setIncludedColumns(next); setProject(current => ({ ...current, recipe: null, decisions: [] })); setComparison(null); setSelectedId(null);
    setStatus("Comparison columns changed. Run a new exact comparison.");
  }
  function download(kind: "data" | "spreadsheet" | "recipe") {
    if (!comparison || !project.recipe || !project.sources.left || !project.sources.right) return;
    if (kind === "recipe") downloadProjectFile(exportRecipe(project.recipe), safeFilename(project.title, "recipe.json"));
    else downloadProjectFile(exportComparison(comparison, project.sources.left, project.sources.right, project.decisions, kind === "spreadsheet"), safeFilename(project.title, kind === "spreadsheet" ? "spreadsheet.csv" : "data.csv"), "text/csv;charset=utf-8");
    setStatus(`${kind === "recipe" ? "Recipe" : kind === "spreadsheet" ? "Spreadsheet-oriented result" : "Data-preserving result"} download requested. Open the file to verify it.`);
  }

  const activeDecisions = React.useMemo(() => comparison ? reconcileDecisions(project.decisions, comparison) : [], [comparison, project.decisions]);
  const decisionByGroup = React.useMemo(() => new Map(activeDecisions.map(decision => [decision.groupId, decision])), [activeDecisions]);
  const groupById = React.useMemo(() => new Map(comparison?.groups.map(group => [group.id, group]) ?? []), [comparison]);
  const issueIds = React.useMemo(() => new Set(comparison?.groups.filter(group => group.category !== "matched").map(group => group.id) ?? []), [comparison]);
  const availablePairs = React.useMemo(() => project.sources.left && project.sources.right && leftKey && rightKey ? columnPairs(project.sources.left.table, project.sources.right.table, leftKey, rightKey) : [], [leftKey, project.sources.left, project.sources.right, rightKey]);
  const includedSet = React.useMemo(() => includedColumns === null ? null : new Set(includedColumns), [includedColumns]);
  const selectedPairs = React.useMemo(() => includedSet === null ? availablePairs : availablePairs.filter(pair => includedSet.has(pairIdentity(pair))), [availablePairs, includedSet]);
  const groups = comparison?.groups.filter(group => group.category === category) ?? [];
  const selected = selectedId ? groupById.get(selectedId) ?? null : null;
  const reviewed = activeDecisions.filter(decision => issueIds.has(decision.groupId)).length;
  const issueCount = comparison?.groups.filter(group => group.category !== "matched").length ?? 0;
  return <div className="rc-frame"><section className="rc" aria-label="CSV reconciliation workspace">
    <header className="rc-header"><div><strong>Local reconciliation</strong><span>Exact text matching · project revision 1</span></div><ProjectTools kind="reconciliation" title={project.title} value={project} parse={parseReconciliationProject} onRestore={restore} documentVersion={1} /></header>
    <div className="rc-body">
      <aside className="rc-setup" aria-label="Sources and matching recipe">
        <section className="rc-intro"><Input label="Project title" maxLength={120} value={project.title} onChange={event => setProject(current => ({ ...current, title: event.target.value }))} /><p>Files stay in this browser tab. Input limit: 10 MiB and 50,000 rows combined. Project backups have a separate 8 MiB limit.</p></section>
        <SourcePreview side="left" source={project.sources.left} onChoose={file => void chooseSource("left", file)} busy={busy} />
        <SourcePreview side="right" source={project.sources.right} onChoose={file => void chooseSource("right", file)} busy={busy} />
        <section className="rc-recipe"><h3>Exact key recipe</h3><p>Values are compared as text. Case, spaces, Unicode and leading zeros are preserved. No fuzzy or automatic normalization is applied.</p>
          <div>{project.sources.left?.table.headers.length ? <label className="rc-field"><span id="rc-left-key">Source A key</span><Select fullWidth aria-labelledby="rc-left-key" value={leftKey} options={project.sources.left.table.headers.map(header => ({ value: header.id, label: header.label }))} onValueChange={value => changeKey("left", value)} /></label> : <span>Choose source A</span>}{project.sources.right?.table.headers.length ? <label className="rc-field"><span id="rc-right-key">Source B key</span><Select fullWidth aria-labelledby="rc-right-key" value={rightKey} options={project.sources.right.table.headers.map(header => ({ value: header.id, label: header.label }))} onValueChange={value => changeKey("right", value)} /></label> : <span>Choose source B</span>}</div>
          {project.sources.left && project.sources.right && <><p>{selectedPairs.length} of {availablePairs.length} same-header non-key {availablePairs.length === 1 ? "column is" : "columns are"} selected for exact comparison. Headers that occur more than once are paired by occurrence.</p><details className="rc-columns" onToggle={event => setColumnsOpen(event.currentTarget.open)}><summary>Choose comparison columns</summary>{columnsOpen && <fieldset><legend>Included same-header columns</legend>{availablePairs.length === 0 ? <p>No same-header non-key columns are available.</p> : availablePairs.map(pair => <Checkbox key={pairIdentity(pair)} label={pair.label} checked={selectedPairs.some(selected => pairIdentity(selected) === pairIdentity(pair))} onCheckedChange={checked => includeColumn(pairIdentity(pair), checked)} />)}</fieldset>}</details></>}
          <input ref={recipeInput} type="file" accept=".json,application/json" hidden onChange={async event => {
            const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
            const sequence = ++fileSequence.current;
            try { if (file.size > 262144) throw new Error("Recipe files must be 256 KiB or smaller."); const text = await file.text(); if (sequence !== fileSequence.current) return; const recipe = readRecipe(text, project.sources.left, project.sources.right); cancel(); setLeftKey(recipe.leftKeyId); setRightKey(recipe.rightKeyId); setIncludedColumns(recipe.compare.map(pairIdentity)); setProject(current => ({ ...current, recipe, decisions: [] })); setComparison(null); setSelectedId(null); setStatus("Recipe opened. Compare the current sources to review a new result."); }
            catch (failure) { setError(failure instanceof Error ? failure.message : "Recipe could not be opened."); }
          }} />
          <div className="rc-actions"><Button variant="ghost" disabled={busy || !project.sources.left || !project.sources.right} onClick={() => recipeInput.current?.click()}>Open recipe</Button><Button disabled={busy || !leftKey || !rightKey} onClick={() => runComparison()}>Compare exact keys</Button>{busy && <Button variant="ghost" onClick={cancel}>Cancel current job</Button>}</div>
        </section>
      </aside>
      <section className="rc-results" aria-label="Comparison results">
        {selected && comparison ? <GroupDetail group={selected} project={project} decision={decisionByGroup.get(selected.id)} onDecision={value => decide(selected, value)} onBack={() => setSelectedId(null)} /> : <>
          <header className="rc-results-head"><div><span>Output candidate</span><h2>{comparison ? `${issueCount} exception groups` : "Ready for two sources"}</h2></div>{comparison && <span>{reviewed} of {issueCount} exceptions reviewed</span>}</header>
          {comparison ? <><div className="rc-totals">{categories.map(item => <button key={item.value} type="button" aria-pressed={category === item.value} onClick={() => { setCategory(item.value); setVisibleCount(100); }}><strong>{comparison.totals[item.value]}</strong><span>{item.label}</span></button>)}</div>
            <div className="rc-worklist"><header><h3>{categories.find(item => item.value === category)?.label}</h3><span>{groups.length} groups</span></header>{groups.length === 0 ? <p className="rc-empty">No groups in this category.</p> : <ul>{groups.slice(0, visibleCount).map(group => { const decision = decisionByGroup.get(group.id); return <li key={group.id}><button type="button" onClick={() => setSelectedId(group.id)}><span><strong>{cellLabel(group.key)}</strong><small>{group.left.length} A · {group.right.length} B{group.differences.length ? ` · ${group.differences.join(", ")}` : ""}</small></span><Badge>{decision?.status ?? (group.category === "matched" ? "exact" : "unreviewed")}</Badge></button></li>; })}</ul>}{groups.length > visibleCount && <Button variant="ghost" onClick={() => setVisibleCount(count => count + 100)}>Show 100 more</Button>}</div>
            <section className="rc-export"><h3>Export revision</h3><p>{comparison.totals.leftRows} A rows + {comparison.totals.rightRows} B rows = {comparison.totals.outputRows} output records. Each source row appears once. Missing fields are listed explicitly.</p><div className="rc-actions"><Button onClick={() => download("data")}>Data-preserving CSV</Button><Button variant="ghost" onClick={() => download("spreadsheet")}>Spreadsheet-oriented CSV</Button><Button variant="ghost" onClick={() => download("recipe")}>Recipe JSON</Button></div><p>The spreadsheet-oriented file prefixes cells beginning with =, +, - or @ with an apostrophe to prevent formula interpretation. The data-preserving file keeps the exact text.</p></section>
          </> : <div className="rc-empty"><p>Parse both files, choose one key column from each, then run the comparison.</p><p>Duplicate keys become ambiguous groups for review. Missing, empty and present key values stay distinct.</p></div>}
        </>}
      </section>
    </div>
    <footer className="rc-status"><p role={error ? "alert" : "status"}>{error || status}</p><span>{busy ? "Worker active" : comparison ? `Result ${comparison.fingerprint}` : "No result yet"}</span></footer>
  </section></div>;
}
