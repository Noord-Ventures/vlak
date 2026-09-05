"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export type TaskState = "pending" | "running" | "paused" | "complete" | "error" | "cancelled";
export interface TaskPhase { id: string; label: string; state: "pending" | "active" | "complete" | "error" }
export interface TaskProgressProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  state: TaskState;
  /** Percentage, omit while the amount of work is unknown. */
  value?: number;
  phases?: TaskPhase[];
  description?: React.ReactNode;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  onCancel?: () => void | Promise<void>;
  onRetry?: () => void | Promise<void>;
}
const styles = stylex.create({
  root: { display: "grid", gap: "1rem", color: vlak.ink, minWidth: 0, width: "100%" },
  title: { margin: 0, fontSize: "1rem", fontWeight: 600, lineHeight: 1.45 },
  progress: { width: "100%", height: "0.5rem", accentColor: vlak.ink },
  detail: { margin: 0, color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45, fontVariantNumeric: "tabular-nums" },
  phases: { margin: 0, paddingInlineStart: "1.5rem", lineHeight: 1.45 },
  phase: { paddingBlock: "0.5rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
});
function duration(seconds: number) { const safe = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0)); return safe < 60 ? `${safe}s` : `${Math.floor(safe / 60)}m ${safe % 60}s`; }

/** Honest long-running task state, including unknown progress and action failures. */
export const TaskProgress = React.forwardRef<HTMLElement, TaskProgressProps>(function TaskProgress({ label, state, value, phases = [], description, elapsedSeconds, remainingSeconds, onCancel, onRetry, className, style, ...props }, ref) {
  const id = React.useId();
  const [busy, setBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState("");
  const request = React.useRef(0);
  React.useEffect(() => { request.current++; setBusy(false); setActionError(""); return () => { request.current++; }; }, [state]);
  const run = async (action: () => void | Promise<void>) => { if (busy) return; const current = ++request.current; setBusy(true); setActionError(""); try { await action(); } catch { if (current === request.current) setActionError("The action failed. Try again."); } finally { if (current === request.current) setBusy(false); } };
  const percentage = value != null && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : undefined;
  const root = rs(["rs-task-progress", className], styles.root);
  const title = rs(["rs-task-progress-title"], styles.title);
  const progress = rs(["rs-task-progress-bar"], styles.progress);
  const detail = rs(["rs-task-progress-detail"], styles.detail);
  const list = rs(["rs-task-progress-phases"], styles.phases);
  const phase = rs(["rs-task-progress-phase"], styles.phase);
  const actions = rs(["rs-task-progress-actions"], styles.actions);
  const states: Record<TaskState, string> = { pending: "Waiting to start", running: "In progress", paused: "Paused", complete: "Complete", error: "Failed", cancelled: "Cancelled" };
  return <section ref={ref} aria-labelledby={id} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <h2 id={id} {...title}>{label}</h2><p role="status" {...detail}>{states[state]}</p>
    <progress {...progress} aria-label={`${label} progress`} max={100} value={state === "complete" ? 100 : percentage} />
    {description != null && <div {...detail}>{description}</div>}
    {(elapsedSeconds != null || remainingSeconds != null) && <p {...detail}>{elapsedSeconds != null ? `${duration(elapsedSeconds)} elapsed` : ""}{elapsedSeconds != null && remainingSeconds != null ? " · " : ""}{remainingSeconds != null ? `About ${duration(remainingSeconds)} remaining` : ""}</p>}
    {!!phases.length && <ol {...list}>{phases.map(item => <li key={item.id} {...phase} aria-current={item.state === "active" ? "step" : undefined}>{item.label} · {item.state}</li>)}</ol>}
    <div {...actions}>{onCancel && ["pending", "running", "paused"].includes(state) && <Button variant="ghost" disabled={busy} onClick={() => run(onCancel)}>Cancel task</Button>}{onRetry && ["error", "cancelled"].includes(state) && <Button variant="ghost" disabled={busy} onClick={() => run(onRetry)}>Retry task</Button>}</div>
    {actionError && <p role="alert" {...detail}>{actionError}</p>}
  </section>;
});
