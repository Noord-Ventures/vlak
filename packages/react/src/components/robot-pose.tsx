"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Select } from "./select";

export interface RobotPoseComponent { id: string; label: string; value: number | null; unit?: string }
export interface RobotPoseRecord {
  id: string;
  label: string;
  frame: string | null;
  timeLabel?: string | null;
  status: string | null;
  translation: { x: number | null; y: number | null; z: number | null; unit: string };
  /** Supply the representation and conventions explicitly; values are never converted or normalized. */
  orientation: { representation: string; components: readonly RobotPoseComponent[] };
}
export interface RobotPoseProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: string;
  poses: readonly RobotPoseRecord[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (poseId: string | null) => void;
  readOnly?: boolean;
  description?: React.ReactNode;
}
const styles = stylex.create({
  root: { display: "grid", gap: "1rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "1rem", fontWeight: 600 },
  field: { display: "grid", gap: "0.375rem", minWidth: 0, fontSize: "0.75rem" },
  select: { minWidth: 0, width: "100%" },
  metadata: { display: "grid", gap: "0.625rem", margin: 0, fontSize: "0.75rem" },
  detail: { display: "grid", gridTemplateColumns: "5rem minmax(0, 1fr)", gap: "0.5rem" },
  heading: { margin: 0, fontSize: "0.875rem", fontWeight: 500 },
  values: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(5rem, 1fr))", gap: "0.75rem", margin: "0.75rem 0 0", fontSize: "0.75rem" },
  value: { margin: "0.25rem 0 0", fontSize: "1rem", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" },
  text: { margin: 0, overflowWrap: "anywhere" },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
});
const recorded = (value: number | null) => value == null ? "Not supplied" : Number.isFinite(value) ? String(value) : "Unavailable";

/** Exact supplied Cartesian and orientation records, with no frame transform or pose computation. */
export const RobotPose = React.forwardRef<HTMLFieldSetElement, RobotPoseProps>(function RobotPose({ label, poses, value, defaultValue, onValueChange, readOnly = false, description, disabled, name, form, className, style, children, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<string | null, HTMLFieldSetElement>(value, defaultValue === undefined ? poses[0]?.id ?? null : defaultValue, onValueChange, refresh);
  const merged = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const valid = poses.length <= 256 && poses.every(pose => pose.id.trim() && pose.label.trim()) && new Set(poses.map(pose => pose.id)).size === poses.length;
  const pose = valid ? poses.find(pose => pose.id === current) : undefined;
  const validOrientation = pose?.orientation.representation.trim() && pose.orientation.components.length > 0 && pose.orientation.components.length <= 16 && pose.orientation.components.every(component => component.id.trim() && component.label.trim()) && new Set(pose.orientation.components.map(component => component.id)).size === pose.orientation.components.length;
  const root = rs(["rs-robot-pose", className], styles.root);
  const legend = rs(["rs-robot-pose-legend"], styles.legend);
  const field = rs(["rs-robot-pose-field"], styles.field);
  const select = rs(["rs-robot-pose-select"], styles.select);
  const metadata = rs(["rs-robot-pose-metadata"], styles.metadata);
  const detail = rs(["rs-robot-pose-detail"], styles.detail);
  const heading = rs(["rs-robot-pose-heading"], styles.heading);
  const values = rs(["rs-robot-pose-values"], styles.values);
  const valueStyle = rs(["rs-robot-pose-value"], styles.value);
  const text = rs(["rs-robot-pose-text"], styles.text);
  const copy = rs(["rs-robot-pose-copy"], styles.copy);
  return <fieldset {...props} ref={merged} disabled={disabled} name={name} form={form} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>{description != null && <p {...copy}>{description}</p>}
    {!valid ? <p {...copy}>Pose records unavailable: supply unique identifiers and at most 256 labelled poses.</p> : !poses.length ? <p {...copy}>No pose records supplied</p> : <div {...field}><span id={`${id}-record`}>Pose record</span><Select {...select} fullWidth aria-labelledby={`${id}-record`} options={poses.map(item => ({ value: item.id, label: item.label }))} value={pose?.id ?? ""} placeholder="Choose a supplied pose" disabled={disabled} readOnly={readOnly} onValueChange={next => { if (!disabled && !readOnly) setValue(next); }} /></div>}
    {pose ? <>
      <dl {...metadata}>{[["Frame", pose.frame?.trim() ? pose.frame : "Not supplied"], ["Recorded at", pose.timeLabel?.trim() ? pose.timeLabel : "Not supplied"], ["Status", pose.status?.trim() ? pose.status : "Not supplied"]].map(([label, value]) => <div key={label} {...detail}><dt>{label}</dt><dd {...text}>{value}</dd></div>)}</dl>
      <div><p {...heading}>Translation</p><p {...copy}>Unit: {pose.translation.unit.trim() || "Not supplied"}</p><dl {...values}>{(["x", "y", "z"] as const).map(axis => <div key={axis}><dt>{axis.toUpperCase()}</dt><dd {...valueStyle}>{recorded(pose.translation[axis])}</dd></div>)}</dl></div>
      <div><p {...heading}>Orientation</p><p {...copy}>Representation: {pose.orientation.representation.trim() || "Not supplied"}</p>{validOrientation ? <dl {...values}>{pose.orientation.components.map(component => <div key={component.id}><dt>{component.label}{component.unit?.trim() ? ` (${component.unit})` : ""}</dt><dd {...valueStyle}>{recorded(component.value)}</dd></div>)}</dl> : <p {...copy}>Orientation components unavailable</p>}</div>
      {name && <input type="hidden" name={name} form={form} value={pose.id} />}
    </> : valid && poses.length > 0 && <p {...copy}>{current == null ? "No pose selected" : "Selected pose unavailable"}</p>}
    <p {...copy}>Values and frame names are supplied records. Selecting a record does not transform, normalize, or command a pose.</p>{children}
  </fieldset>;
});
