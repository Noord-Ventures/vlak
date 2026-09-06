"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";

export interface ExperimentCondition { id: string; label: React.ReactNode; value: React.ReactNode }
export interface ExperimentAction { id: string; label: string; disabled?: boolean }
export interface ExperimentStep { id: string; label: string; status: string; details?: React.ReactNode; actions?: readonly ExperimentAction[]; pending?: boolean }
export interface ExperimentRunProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  runId?: string;
  protocol?: React.ReactNode;
  status: string;
  conditions?: readonly ExperimentCondition[];
  steps: readonly ExperimentStep[];
  /** Requests an explicit action. State remains supplied by the application. */
  onAction?: (stepId: string, actionId: string) => void;
}

const styles = stylex.create({
  root: { display: "grid", gap: "1rem", minWidth: 0, color: vlak.ink, lineHeight: 1.45, overflowWrap: "anywhere" },
  head: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem 1rem" },
  title: { margin: 0, fontSize: "1rem", fontWeight: 600 },
  context: { margin: 0, fontSize: "0.75rem", color: vlak.gray },
  conditions: { display: "grid", gridTemplateColumns: { default: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "1rem", margin: 0, paddingBlock: "1rem", borderBlockWidth: vlak.hairline, borderBlockStyle: "solid", borderBlockColor: vlak.divider },
  value: { margin: 0, marginTop: "0.25rem", fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  list: { listStyleType: "decimal", paddingInlineStart: "1.5rem", margin: 0 },
  step: { paddingBlock: "0.75rem", paddingInlineStart: "0.25rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontSize: "0.875rem" },
  details: { marginBlock: "0.5rem", fontSize: "0.875rem", maxWidth: "66ch" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" },
  action: { minWidth: vlak.hit, minHeight: vlak.hit, padding: "0.5rem 0.75rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, color: vlak.ink, backgroundColor: vlak.paper, fontFamily: "inherit", fontSize: "0.875rem", cursor: "pointer", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2, opacity: { default: 1, ":disabled": 0.55 } },
});

/** Supplied run metadata and protocol steps, with application-owned transitions. */
export const ExperimentRun = React.forwardRef<HTMLDivElement, ExperimentRunProps>(function ExperimentRun({ label, runId, protocol, status, conditions = [], steps, onAction, className, style, children, ...props }, ref) {
  const id = React.useId();
  const root = rs(["rs-experiment-run", className], styles.root);
  const head = rs(["rs-experiment-run-head"], styles.head);
  const title = rs(["rs-experiment-run-title"], styles.title);
  const context = rs(["rs-experiment-run-context"], styles.context);
  const conditionsStyle = rs(["rs-experiment-run-conditions"], styles.conditions);
  const valueStyle = rs(["rs-experiment-run-value"], styles.value);
  const list = rs(["rs-experiment-run-list"], styles.list);
  const stepStyle = rs(["rs-experiment-run-step"], styles.step);
  const details = rs(["rs-experiment-run-details"], styles.details);
  const actions = rs(["rs-experiment-run-actions"], styles.actions);
  const actionStyle = rs(["rs-experiment-run-action"], styles.action);
  return <div ref={ref} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    <div {...head}><p {...title}>{label}</p><span {...context}>{status.trim() || "Run status not supplied"}</span></div>
    {runId != null && <p {...context}>Run {runId}</p>}
    {protocol != null && <div {...context}>{protocol}</div>}
    {conditions.length > 0 && <dl {...conditionsStyle}>{conditions.map(condition => <div key={condition.id}><dt {...context}>{condition.label}</dt><dd {...valueStyle}>{condition.value == null || condition.value === "" ? "Not supplied" : condition.value}</dd></div>)}</dl>}
    {steps.length === 0 ? <p {...context}>No steps supplied</p> : <ol {...list}>{steps.map((step, index) => <li key={step.id} {...stepStyle} aria-busy={step.pending || undefined}>
      <div {...head}><span>{step.label}</span><span {...context} id={`${id}-${index}-status`}>{step.status.trim() || "Step status not supplied"}</span></div>
      {step.details != null && <div {...details}>{step.details}</div>}
      <span {...context} role="status">{step.pending ? "Update pending" : null}</span>
      {onAction && !!step.actions?.length && <div {...actions}>{step.actions.map(action => <button key={action.id} {...actionStyle} type="button" disabled={step.pending || action.disabled} aria-label={`${action.label}: step ${index + 1}, ${step.label}`} aria-describedby={`${id}-${index}-status`} onClick={() => onAction(step.id, action.id)}>{action.label}</button>)}</div>}
    </li>)}</ol>}
    {children}
  </div>;
});
