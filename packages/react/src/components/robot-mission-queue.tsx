"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";

export interface RobotMissionAction { id: string; label: string; disabled?: boolean; description?: string }
export interface RobotMissionStep { id: string; label: string; detail?: string; status: string; confirmedLabel?: string; pending?: boolean; actions?: readonly RobotMissionAction[] }
export interface RobotMissionQueueProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label: string;
  steps: readonly RobotMissionStep[];
  /** Proposed step identifiers in order; the host confirms and supplies the resulting records. */
  onOrderChange?: (stepIds: readonly string[]) => void;
  onAction?: (stepId: string, actionId: string) => void;
  readOnly?: boolean;
  description?: React.ReactNode;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "1rem", fontWeight: 600 },
  list: { paddingInlineStart: "1.5rem", margin: 0 },
  step: { paddingBlock: "1rem", paddingInlineStart: "0.25rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  head: { display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.375rem 1rem" },
  title: { margin: 0, fontSize: "0.875rem", fontWeight: 500, overflowWrap: "anywhere" },
  copy: { margin: "0.375rem 0 0", fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
  status: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" },
  button: { minHeight: vlak.hit },
});

/** A supplied mission order, recorded step states, and explicit host request actions. */
export const RobotMissionQueue = React.forwardRef<HTMLFieldSetElement, RobotMissionQueueProps>(function RobotMissionQueue({ label, steps, onOrderChange, onAction, readOnly = false, description, disabled, name, form, className, style, children, ...props }, ref) {
  const id = React.useId();
  const valid = steps.length <= 256 && steps.every(step => step.id.trim() && step.label.trim() && (!step.actions || step.actions.every(action => action.id.trim() && action.label.trim()) && new Set(step.actions.map(action => action.id)).size === step.actions.length)) && new Set(steps.map(step => step.id)).size === steps.length;
  const move = (index: number, delta: number) => { const ids = steps.map(step => step.id); [ids[index], ids[index + delta]] = [ids[index + delta]!, ids[index]!]; onOrderChange?.(ids); };
  const root = rs(["rs-robot-mission-queue", className], styles.root);
  const legend = rs(["rs-robot-mission-queue-legend"], styles.legend);
  const list = rs(["rs-robot-mission-queue-list"], styles.list);
  const stepStyle = rs(["rs-robot-mission-queue-step"], styles.step);
  const head = rs(["rs-robot-mission-queue-head"], styles.head);
  const title = rs(["rs-robot-mission-queue-title"], styles.title);
  const copy = rs(["rs-robot-mission-queue-copy"], styles.copy);
  const status = rs(["rs-robot-mission-queue-status"], styles.status);
  const actions = rs(["rs-robot-mission-queue-actions"], styles.actions);
  const button = rs(["rs-robot-mission-queue-button"], styles.button);
  return <fieldset {...props} ref={ref} disabled={disabled} name={name} form={form} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>{description != null && <p {...copy}>{description}</p>}
    {!valid ? <p {...copy}>Mission records unavailable: supply unique labelled steps and actions, with at most 256 steps.</p> : !steps.length ? <p {...copy}>No mission steps supplied</p> : <ol {...list}>{steps.map((step, index) => {
      const context = `step ${index + 1}, ${step.label}`;
      const locked = disabled || readOnly || step.pending;
      return <li key={step.id} {...stepStyle}>
        <div {...head}><p {...title}>{step.label}</p><p {...status} id={`${id}-${index}-status`}>Recorded: {step.status.trim() || "Not supplied"}</p></div>
        {step.detail != null && <p {...copy}>{step.detail}</p>}
        {step.confirmedLabel != null && <p {...copy}>Host confirmation: {step.confirmedLabel}</p>}
        {step.pending && <p {...copy} role="status">Request pending; recorded status unchanged</p>}
        {!!(onOrderChange || onAction && step.actions?.length) && <div {...actions}>
          {onOrderChange && <><Button {...button} variant="ghost" type="button" disabled={locked || index === 0 || steps[index - 1]?.pending} aria-label={`Move ${context} up`} onClick={() => move(index, -1)}>Move up</Button><Button {...button} variant="ghost" type="button" disabled={locked || index === steps.length - 1 || steps[index + 1]?.pending} aria-label={`Move ${context} down`} onClick={() => move(index, 1)}>Move down</Button></>}
          {onAction && step.actions?.map((action, actionIndex) => <React.Fragment key={action.id}><Button {...button} variant="ghost" type="button" disabled={locked || action.disabled} aria-label={`${action.label}: ${context}`} aria-describedby={[`${id}-${index}-status`, action.description && `${id}-${index}-${actionIndex}-description`].filter(Boolean).join(" ")} onClick={() => onAction(step.id, action.id)}>{action.label}</Button>{action.description && <span {...copy} id={`${id}-${index}-${actionIndex}-description`}>{action.description}</span>}</React.Fragment>)}
        </div>}
        {name && <input type="hidden" name={name} form={form} value={step.id} />}
      </li>;
    })}</ol>}
    <p {...copy}>Reordering and actions request host changes. Reported mission state remains supplied by the host.</p>{children}
  </fieldset>;
});
