"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogTitle } from "@noorddev/vlak-react";
import { createProject, PROJECT_LIMIT, RECOVERY_LIMIT, readRecovery, projectFilename, readProject, serializeProject } from "@/lib/project-file";
import type { Project } from "@/lib/project-file";
import { listProjects, projectHistory, recoveryProjects, removeProject, saveProjectRevision } from "@/lib/project-store";
import "./project-tools.css";

export function downloadProjectFile(text: string, filename: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Props<T> = {
  kind: string; title: string; value: T; parse: (value: unknown) => T;
  onRestore: (value: T, title: string) => void; documentVersion?: number;
};
type Candidate<T> = { project: Project<T>; copy: boolean };

/** Common project ownership controls; domain parsers remain inside each app. */
export function ProjectTools<T>({ kind, title, value, parse, onRestore, documentVersion = 1 }: Props<T>) {
  const [notice, setNotice] = useState("Changes stay in this tab until saved.");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Project<unknown>[]>([]);
  const [history, setHistory] = useState<Project<unknown>[]>([]);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [candidate, setCandidate] = useState<Candidate<T> | null>(null);
  const [recovery, setRecovery] = useState<{ projects: Project<T>[]; issues: string[] } | null>(null);
  const importSequence = useRef(0);
  const [deleting, setDeleting] = useState<Project<unknown> | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [writing, setWriting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [copyTick, setCopyTick] = useState(0);
  const file = useRef<HTMLInputElement>(null);
  const identity = useRef<Project<T> | null>(null);
  const expected = useRef<string | null>(null);
  const savedKey = useRef("");
  const generation = useRef(0);
  const alive = useRef(true);
  const current = useRef({ value, title, parse }); current.current = { value, title, parse };
  const signature = JSON.stringify([title, value]);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; generation.current++; };
  }, []);
  function metadata(): Project<T> {
    identity.current ??= createProject(kind, title, value, documentVersion);
    return identity.current;
  }
  function snapshot(): Project<T> {
    const data = current.current;
    const payload = data.parse(JSON.parse(JSON.stringify(data.value)));
    return { ...metadata(), title: data.title.trim() || "Untitled project", payload, revision: crypto.randomUUID(),
      ...(expected.current ? { parentRevision: expected.current } : {}), updatedAt: new Date().toISOString() };
  }
  async function refresh() {
    try { const projects = await listProjects(kind); if (alive.current) setRecent(projects); }
    catch (failure) { if (alive.current) setError(failure instanceof Error ? failure.message : "Project storage could not be opened."); }
  }
  useEffect(() => {
    let current = true;
    listProjects(kind).then(projects => { if (current) setRecent(projects); }).catch(failure => { if (current) setError(failure instanceof Error ? failure.message : "Project storage could not be opened."); });
    return () => { current = false; };
  }, [kind]);

  // snapshot reads the latest render through current; copyTick deliberately retries an unchanged value.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref-backed snapshot and explicit retry trigger are intentional.
  useEffect(() => {
    if (!enabled || writing || blocked || savedKey.current === signature) return;
    const timer = window.setTimeout(async () => {
      const token = generation.current;
      setWriting(true);
      try {
        const project = snapshot();
        const key = JSON.stringify([current.current.title, current.current.value]);
        await saveProjectRevision(project, expected.current);
        if (!alive.current || token !== generation.current) return;
        identity.current = project; expected.current = project.revision; savedKey.current = key;
        setError(""); setNotice("Saved in this browser. Keep a project file as a backup.");
      } catch (failure) {
        if (alive.current && token === generation.current) { setError(failure instanceof Error ? failure.message : "Browser save failed. Your work stays in this tab."); setBlocked(true); }
      } finally { if (alive.current) setWriting(false); }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [signature, enabled, writing, blocked, copyTick]);

  function exportFile() {
    try {
      const project = snapshot();
      downloadProjectFile(serializeProject(project), projectFilename(project.title, `${kind}.json`));
      setError(""); setNotice("Project file download requested. Open it to verify your copy.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Project could not be exported."); }
  }
  async function importFile(selected: File | undefined) {
    if (!selected) return;
    const sequence = ++importSequence.current;
    try {
      if (selected.size > RECOVERY_LIMIT) throw new Error("This file exceeds the recovery collection limit.");
      const text = await selected.text();
      if (!alive.current || sequence !== importSequence.current) return;
      const decoded: unknown = JSON.parse(text);
      if (decoded && typeof decoded === "object" && "schema" in decoded && decoded.schema === "vlak.project-recovery") {
        setRecovery(readRecovery(text, kind, parse, documentVersion)); setError(""); return;
      }
      if (selected.size > PROJECT_LIMIT) throw new Error("Project files must be 8 MiB or smaller.");
      const project = readProject(text, kind, parse, title, documentVersion);
      setCandidate({ project, copy: true }); setError("");
    } catch (failure) { if (alive.current && sequence === importSequence.current) setError(failure instanceof Error ? failure.message : "Project could not be opened. Current work is unchanged."); }
  }
  function inspect(project: Project<unknown>, copy = false) {
    try {
      const validated = readProject(serializeProject(project), kind, parse, title, documentVersion);
      setBrowserOpen(false); setCandidate({ project: validated, copy }); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "This saved project could not be read."); }
  }
  function restore() {
    if (!candidate) return;
    try {
      // Validate the outgoing snapshot; the dialog offers file export before replacement.
      const outgoing = snapshot();
      serializeProject(outgoing);
      const next = candidate.copy ? createProject(kind, candidate.project.title, candidate.project.payload, documentVersion) : candidate.project;
      onRestore(next.payload, next.title);
      generation.current++;
      identity.current = next; expected.current = candidate.copy ? null : next.revision;
      savedKey.current = candidate.copy ? "" : JSON.stringify([next.title, next.payload]);
      setEnabled(true); setBlocked(false); setCandidate(null); setRecovery(null); setBrowserOpen(false); setHistory([]); setError("");
      setNotice(candidate.copy ? "Opened as a new copy. Browser save will keep this project." : "Project opened. Changes will save in this browser.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Project could not be restored."); }
  }
  function saveCopy() {
    generation.current++; identity.current = createProject(kind, title, value, documentVersion); expected.current = null; savedKey.current = "";
    setEnabled(true); setBlocked(false); setError(""); setCopyTick(tick => tick + 1);
  }
  return <section className="project-tools" aria-label="Project files">
    <div className="project-tools-actions">
      <Button type="button" variant="ghost" size="sm" onClick={() => file.current?.click()}>Open project</Button>
      <Button type="button" variant="ghost" size="sm" onClick={exportFile}>Save project file</Button>
      <Button type="button" variant="ghost" size="sm" disabled={writing} onClick={() => { setEnabled(true); setBlocked(false); setCopyTick(tick => tick + 1); }}>Save in browser</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => { setBrowserOpen(true); setHistory([]); void refresh(); }}>Recent projects</Button>
      {blocked && <Button type="button" size="sm" onClick={saveCopy}>Save a new copy</Button>}
    </div>
    <input ref={file} type="file" accept=".json,application/json" hidden onChange={event => { void importFile(event.target.files?.[0]); event.target.value = ""; }} />
    <p role={error ? "alert" : "status"}>{writing ? "Saving in this browser…" : error || (enabled && savedKey.current !== signature && !blocked ? "Unsaved changes. Saving shortly…" : notice)}</p>
    <Dialog open={browserOpen} onClose={() => setBrowserOpen(false)} className="project-tools-dialog">
      <DialogTitle>Recent projects</DialogTitle>
      <p>Saved on this browser. Clearing browser data removes these projects.</p>
      {error && <p role="status">{error}</p>}
      {recent.length === 0 && <p>No projects saved here yet.</p>}
      <ul className="project-tools-list">{recent.map(project => <li key={project.projectId}>
        <span><strong>{project.title}</strong><small>{new Date(project.updatedAt).toLocaleString()}</small></span>
        <div><Button type="button" variant="ghost" onClick={() => inspect(project)}>Open</Button>
          <Button type="button" variant="ghost" onClick={async () => { try { setHistory((await projectHistory(project.projectId)).filter(item => item.revision !== project.revision)); } catch { setError("History could not be opened."); } }}>History</Button>
          <Button type="button" variant="ghost" onClick={() => downloadProjectFile(serializeProject(project), projectFilename(project.title, `${kind}.json`))}>Download</Button>
          <Button type="button" variant="ghost" onClick={() => { setBrowserOpen(false); setError(""); setDeleting(project); }}>Remove</Button></div>
      </li>)}</ul>
      {history.length > 0 && <><h3>Previous revisions</h3><p>Open a revision as a copy to keep the latest project.</p><ul className="project-tools-list">{history.map(project => <li key={project.revision}><span>{project.title}<small>{new Date(project.updatedAt).toLocaleString()}</small></span><Button type="button" variant="ghost" onClick={() => inspect(project, true)}>Open copy</Button></li>)}</ul></>}
      <div className="project-tools-actions"><Button type="button" variant="ghost" onClick={async () => { try { downloadProjectFile(await recoveryProjects(kind), "vlak-project-recovery.json"); } catch { setError("Recovery data could not be read."); } }}>Download recovery data</Button><Button type="button" onClick={() => setBrowserOpen(false)}>Done</Button></div>
    </Dialog>
    <Dialog open={Boolean(recovery)} onClose={() => setRecovery(null)} className="project-tools-dialog">
      <DialogTitle>Recovery projects</DialogTitle>
      <p>Choose a project to open as a separate copy. Keep the original recovery file; unsupported entries are preserved there.</p>
      {recovery?.issues.map(issue => <p key={issue} role="status">{issue}</p>)}
      <ul className="project-tools-list">{recovery?.projects.map((project, index) => <li key={`${project.projectId}-${index}`}><span>{project.title}</span><Button type="button" onClick={() => { setRecovery(null); setCandidate({ project, copy: true }); }}>Open copy</Button></li>)}</ul>
      <Button type="button" onClick={() => setRecovery(null)}>Done</Button>
    </Dialog>
    <Dialog open={Boolean(candidate)} onClose={() => setCandidate(null)} className="project-tools-dialog">
      <DialogTitle>Open {candidate?.project.title}?</DialogTitle>
      <p>This replaces the work on screen. Save your current project file first if you want to keep it. Imported files and historical revisions open as separate copies.</p>
      {error && <p role="status">{error}</p>}
      <div className="project-tools-actions"><Button type="button" variant="ghost" onClick={exportFile}>Save current file</Button><Button type="button" variant="ghost" onClick={() => setCandidate(null)}>Cancel</Button><Button type="button" onClick={restore}>Open project</Button></div>
    </Dialog>
    <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} className="project-tools-dialog">
      <DialogTitle>Remove {deleting?.title}?</DialogTitle>{error && <p role="status">{error}</p>}<p>This removes the browser copy and its saved revisions. Download a project file first to keep it.</p>
      <div className="project-tools-actions"><Button type="button" variant="ghost" onClick={() => { if (deleting) downloadProjectFile(serializeProject(deleting), projectFilename(deleting.title, `${kind}.json`)); }}>Download file</Button><Button type="button" variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button><Button type="button" onClick={async () => {
        if (!deleting) return;
        try { await removeProject(deleting.projectId, deleting.revision); if (identity.current?.projectId === deleting.projectId) { generation.current++; setEnabled(false); expected.current = null; identity.current = null; savedKey.current = ""; setNotice("Browser copy removed. Work on screen stays in this tab."); } setDeleting(null); await refresh(); }
        catch (failure) { setError(failure instanceof Error ? failure.message : "Project could not be removed."); }
      }}>Remove browser copy</Button></div>
    </Dialog>
  </section>;
}
