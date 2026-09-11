"use client";

import * as React from "react";
import { Button, Dialog, DialogActions, DialogBody, DialogTitle, Textarea } from "@noorddev/vlak-react";
import { ProjectTools } from "@/components/project-tools";
import { parseBrief, type ModernizationBrief } from "./brief";
import styles from "./services.module.css";

type Brief = ModernizationBrief;

const fields: Array<[keyof Brief, string, string]> = [
  ["namedProblem", "Named problem", "What painful workflow is being modernized?"],
  ["currentProcess", "Current process", "Show the steps, workarounds, and recovery path."],
  ["users", "Users", "Who performs the work, buys the outcome, and operates it?"],
  ["inputOutput", "Input and output", "What enters the workflow and where must the result go?"],
  ["acceptance", "Acceptance", "What must a named user complete, and how will it be measured?"],
  ["dependencies", "Dependencies", "Which backends, integrations, credentials, and schemas remain?"],
  ["owner", "Owner", "Who decides scope, accepts the result, and owns production?"],
  ["rollout", "Rollout and rollback", "Describe sandbox, restore point, switch, and rollback owner."],
  ["support", "Support and offboarding", "State support window, limits, ownership transfer, and closeout."],
];

const blank: Brief = Object.fromEntries(fields.map(([key]) => [key, ""])) as Brief;

function markdown(brief: Brief) {
  return `# Modernization brief\n\n${fields.map(([key, label]) => `## ${label}\n\n${brief[key] || "Not supplied"}`).join("\n\n")}\n`;
}

export function ModernizationBriefWorksheet() {
  const [brief, setBrief] = React.useState<Brief>(blank);
  const [preview, setPreview] = React.useState(false);
  const [validated, setValidated] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const set = (key: keyof Brief, value: string) => setBrief(current => ({ ...current, [key]: value }));
  const missing = fields.filter(([key]) => !brief[key].trim()).map(([, label]) => label);
  const downloadMarkdown = () => {
    const content = markdown(brief);
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown" }));
    const link = document.createElement("a"); link.href = url; link.download = "vlak-modernization-brief.md"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const restore = (next: Brief, title: string) => { setBrief(next); setMessage(`${title || "Modernization brief"} restored. Review it before continuing.`); };
  return <section className={styles.worksheet} aria-labelledby="brief-worksheet-title">
    <div className={styles.worksheetHead}><div><h2 id="brief-worksheet-title" className="section-label">Local brief worksheet</h2><p className="rs-t-body">Write the boundaries before a pilot starts. Work stays in this tab until you save a project file or choose browser storage.</p></div><span className={styles.status}>{missing.length ? `${missing.length} fields to fill` : "Ready to review"}</span></div>
    <div className={styles.formGrid}>{fields.map(([key, label, hint]) => <div key={key}><Textarea label={label} value={brief[key]} onChange={event => set(key, event.currentTarget.value)} rows={3} aria-required="true" maxLength={10000} aria-invalid={validated && !brief[key].trim() || undefined} /><p className={styles.hint}>{hint}</p></div>)}</div>
    <div className={styles.actions}>
      <Button onClick={() => { setValidated(true); setMessage(missing.length ? `Complete: ${missing.join(", ")}.` : "The brief is complete and ready for review."); }}>Validate required fields</Button>
      <Button variant="ghost" onClick={() => setPreview(true)}>Preview</Button>
      <Button variant="ghost" onClick={downloadMarkdown}>Download Markdown</Button>
    </div>
    {message && <p className="rs-t-body" role="status">{message}</p>}
    <Dialog open={preview} onClose={() => setPreview(false)} closeLabel="Close preview"><DialogTitle>Brief preview</DialogTitle><DialogBody>Review the brief before exporting it.</DialogBody><pre className={styles.preview}>{markdown(brief)}</pre><DialogActions><Button onClick={() => setPreview(false)}>Close preview</Button></DialogActions></Dialog>
    <ProjectTools kind="modernization-brief" title="Modernization brief" value={brief} parse={parseBrief} onRestore={restore} documentVersion={1} />
  </section>;
}
