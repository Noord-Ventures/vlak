"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";


export type RenderJobStatus = "queued" | "rendering" | "complete" | "failed" | "canceled";
export interface RenderJob { id: string; label: string; status: RenderJobStatus; /** Completion percentage from 0 to 100. */ progress?: number | null; detail?: React.ReactNode }
export interface RenderQueueProps extends React.HTMLAttributes<HTMLDivElement> { label: React.ReactNode; jobs: RenderJob[]; onCancel?: (id: string) => void; onRetry?: (id: string) => void; disabled?: boolean }

const labels: Record<RenderJobStatus, string> = { queued: "Queued", rendering: "Rendering", complete: "Complete", failed: "Failed", canceled: "Canceled" };
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, color: vlak.ink },
  label: { margin: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "grid" },
  job: { display: "grid", gap: "0.5rem", paddingBlock: "0.875rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  header: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "0.25rem 1rem", fontSize: vlak.controlFs, lineHeight: 1.45 },
  note: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, lineHeight: 1.45 },
  progress: { display: "block", width: "100%", height: "0.5rem", accentColor: vlak.ink },
  action: { alignSelf: "start" },
});

/** Host-owned render jobs and available cancel or retry actions. */
export const RenderQueue = React.forwardRef<HTMLDivElement, RenderQueueProps>(function RenderQueue({ label, jobs, onCancel, onRetry, disabled, className, style, ...props }, ref) {
  const root = rs(["rs-render-queue", className], styles.root);
  const heading = rs(["rs-render-queue-label"], styles.label);
  const list = rs(["rs-render-queue-list"], styles.list);
  const row = rs(["rs-render-queue-job"], styles.job);
  const header = rs(["rs-render-queue-header"], styles.header);
  const note = rs(["rs-render-queue-note"], styles.note);
  const progress = rs(["rs-render-queue-progress"], styles.progress);
  const action = rs(["rs-render-queue-action"], styles.action);
  return <div {...props} ref={ref} className={root.className} style={{ ...root.style, ...style }}>
    <p className={heading.className} style={heading.style}>{label}</p>
    {jobs.length === 0 && <p className={note.className} style={note.style}>No render jobs</p>}
    <ul className={list.className} style={list.style}>{jobs.map((job) => {
      const validProgress = job.progress != null && Number.isFinite(job.progress) && job.progress >= 0 && job.progress <= 100;
      const active = job.status === "queued" || job.status === "rendering";
      const retry = job.status === "failed" || job.status === "canceled";
      return <li key={job.id} className={row.className} style={row.style}>
        <div className={header.className} style={header.style}><span>{job.label}</span><span>{Object.hasOwn(labels, job.status) ? labels[job.status] : "Unknown status"}</span></div>
        {job.detail != null && <div className={note.className} style={note.style}>{job.detail}</div>}
        {active && (validProgress ? <><progress value={job.progress!} max={100} aria-label={`${job.label} progress`} className={progress.className} style={progress.style}>{job.progress}%</progress><p className={note.className} style={note.style}>{job.progress}%</p></> : <p className={note.className} style={note.style}>{job.progress == null ? "Progress not reported" : "Progress unavailable"}</p>)}
        {active && onCancel && <Button variant="ghost" size="sm" type="button" disabled={disabled} aria-label={`Cancel ${job.label}`} className={action.className} style={action.style} onClick={() => onCancel(job.id)}>Cancel</Button>}
        {retry && onRetry && <Button variant="ghost" size="sm" type="button" disabled={disabled} aria-label={`Retry ${job.label}`} className={action.className} style={action.style} onClick={() => onRetry(job.id)}>Retry</Button>}
      </li>;
    })}</ul>
  </div>;
});
