"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Input } from "./input";
import { Button } from "./button";

export interface JointRecord { id: string; label: string; unit: string; reported: number | null; minimum: number | null; maximum: number | null }
export type JointTargets = Record<string, number | null>;
export interface JointPanelProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: string;
  joints: readonly JointRecord[];
  value?: JointTargets;
  defaultValue?: JointTargets;
  onValueChange?: (targets: JointTargets) => void;
  /** Requests the complete draft. Motion and confirmation belong to the host. */
  onRequestTargets?: (targets: JointTargets) => void;
  pending?: boolean;
  confirmedLabel?: React.ReactNode;
  timeLabel?: React.ReactNode;
  description?: React.ReactNode;
  readOnly?: boolean;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "1rem", fontWeight: 600 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
  list: { listStyleType: "none", margin: 0, padding: 0, display: "grid" },
  joint: { display: "grid", gridTemplateColumns: { default: "minmax(0, 1fr) minmax(7rem, 1fr)", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem 1.25rem", paddingBlock: "1rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  title: { margin: 0, fontSize: "0.875rem", fontWeight: 500 },
  reading: { margin: "0.375rem 0", fontSize: "1.25rem", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" },
  field: { display: "grid", alignContent: "start", gap: "0.375rem", minWidth: 0, fontSize: "0.75rem" },
  input: { minWidth: vlak.hit, width: "100%", fontVariantNumeric: "tabular-nums" },
  button: { justifySelf: "start" },
});
const finite = (value: number | null | undefined): value is number => value != null && Number.isFinite(value);
const bounded = (joint: JointRecord) => finite(joint.minimum) && finite(joint.maximum) && joint.minimum <= joint.maximum;
const errorFor = (joint: JointRecord, value: number | null | undefined) => !bounded(joint) ? "Joint limits unavailable" : value == null ? "Enter a target" : !finite(value) ? "Target unavailable" : value < joint.minimum! || value > joint.maximum! ? `Target must be between ${joint.minimum} and ${joint.maximum} ${joint.unit}` : "";

/** Draft joint targets remain separate from host-reported positions and request confirmation. */
export const JointPanel = React.forwardRef<HTMLFieldSetElement, JointPanelProps>(function JointPanel({ label, joints, value, defaultValue = {}, onValueChange, onRequestTargets, pending = false, confirmedLabel, timeLabel, description, readOnly = false, disabled, name, form, className, style, children, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<JointTargets, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const merged = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const valid = joints.length <= 64 && joints.every(joint => joint.id.trim() && joint.label.trim() && joint.unit.trim()) && new Set(joints.map(joint => joint.id)).size === joints.length;
  const unlisted = Object.keys(current).filter(key => !joints.some(joint => joint.id === key));
  const ready = valid && joints.length > 0 && unlisted.length === 0 && joints.every(joint => !errorFor(joint, current[joint.id]));
  const locked = disabled || pending;
  const root = rs(["rs-joint-panel", className], styles.root);
  const legend = rs(["rs-joint-panel-legend"], styles.legend);
  const copy = rs(["rs-joint-panel-copy"], styles.copy);
  const list = rs(["rs-joint-panel-list"], styles.list);
  const jointStyle = rs(["rs-joint-panel-joint"], styles.joint);
  const title = rs(["rs-joint-panel-title"], styles.title);
  const reading = rs(["rs-joint-panel-reading"], styles.reading);
  const field = rs(["rs-joint-panel-field"], styles.field);
  const input = rs(["rs-joint-panel-input"], styles.input);
  const button = rs(["rs-joint-panel-button"], styles.button);
  return <fieldset {...props} ref={merged} disabled={locked} name={name} form={form} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>{description != null && <p {...copy}>{description}</p>}
    <p {...copy}>Reported at: {timeLabel ?? "Time not supplied"}</p>
    {!valid ? <p {...copy}>Joint records unavailable: supply unique identifiers, labels, units, and at most 64 joints.</p> : !joints.length ? <p {...copy}>No joint records supplied</p> : <ul {...list}>{joints.map((joint, index) => {
      const target = current[joint.id];
      const error = errorFor(joint, target);
      return <li key={joint.id} {...jointStyle}>
        <div><p {...title}>{joint.label}</p><p {...reading}>Reported: {finite(joint.reported) ? `${joint.reported} ${joint.unit}` : joint.reported == null ? "Not supplied" : "Unavailable"}</p><p {...copy}>{bounded(joint) ? `Limits: ${joint.minimum} to ${joint.maximum} ${joint.unit}` : "Joint limits unavailable"}</p></div>
        <label {...field}>Draft target ({joint.unit})<Input {...input} plain type="number" step="any" required readOnly={readOnly} disabled={locked} name={name ? `${name}.${joint.id}` : undefined} form={form} value={finite(target) ? target : ""} min={bounded(joint) ? joint.minimum! : undefined} max={bounded(joint) ? joint.maximum! : undefined} aria-label={`${joint.label} draft target (${joint.unit})`} aria-invalid={!!error || undefined} aria-describedby={`${id}-${index}-target`} ref={node => node?.setCustomValidity(error)} onChange={event => { if (!readOnly && !locked) setValue({ ...current, [joint.id]: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null }); }} /><span {...copy} id={`${id}-${index}-target`}>{error || "Draft only"}</span></label>
      </li>;
    })}</ul>}
    {unlisted.length > 0 && <p {...copy}>Draft contains unlisted joints: {unlisted.join(", ")}</p>}
    {onRequestTargets && <Button {...button} type="button" disabled={locked || readOnly || !ready} onClick={() => { if (ready && !locked && !readOnly) onRequestTargets(current); }}>Request targets</Button>}
    {confirmedLabel != null && <p {...copy}>Host confirmation: {confirmedLabel}</p>}
    <p {...copy} role="status">{pending ? "Target request pending; reported positions unchanged" : readOnly ? "Read only" : "Editing a target does not move a joint. The host handles motion and reports its result."}</p>{children}
  </fieldset>;
});
