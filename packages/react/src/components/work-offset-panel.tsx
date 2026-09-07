"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { Input } from "./input";
import { Button } from "./button";

import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface WorkOffsetAxis { id: string; label: string; unit: string; machine: number | null; work: number | null }
export interface WorkOffsetSystem { id: string; label: string; disabled?: boolean }
export interface WorkOffsetValue { systemId: string | null; offsets: Record<string, number | null> }
export interface WorkOffsetPanelProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: string;
  axes: readonly WorkOffsetAxis[];
  systems: readonly WorkOffsetSystem[];
  /** Actual active system reported by the controller, independent of the draft selection. */
  activeSystemId: string | null;
  value?: WorkOffsetValue;
  defaultValue?: WorkOffsetValue;
  onValueChange?: (value: WorkOffsetValue) => void;
  /** Request a complete offset update; machine control and coordinate calculations belong to the host. */
  onApply?: (value: WorkOffsetValue) => void;
  offsetState?: "active" | "suspended" | "unknown";
  pending?: boolean;
  readOnly?: boolean;
  description?: React.ReactNode;
}
const styles = stylex.create({
  root: { width: "100%", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, display: "grid", gap: "0.75rem", color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "1rem", fontWeight: 600 },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere" },
  field: { display: "grid", gap: "0.375rem", minWidth: 0, fontSize: "0.875rem" },
  control: { width: "100%", minWidth: 0, fontVariantNumeric: "tabular-nums" },
  viewport: { overflowX: "auto", minWidth: 0, maxWidth: "100%", outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  table: { width: "100%", minWidth: "23rem", borderCollapse: "collapse", fontSize: "0.875rem", fontVariantNumeric: "tabular-nums" },
  caption: { textAlign: "start", fontSize: "0.75rem", color: vlak.gray, paddingBottom: "0.5rem" },
  cell: { padding: "0.625rem 0.375rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, textAlign: "end", fontWeight: 400, verticalAlign: "middle" },
  axis: { textAlign: "start", fontWeight: 500 },
  offset: { minWidth: "7rem", width: "35%" },
  button: { justifySelf: "start" },
});
const formatPosition = (value: number | null) => value == null ? "Unknown" : Number.isFinite(value) ? String(value) : "Unavailable";

/** Edit a proposed offset while retaining independently supplied machine and work positions. */
export const WorkOffsetPanel = React.forwardRef<HTMLFieldSetElement, WorkOffsetPanelProps>(function WorkOffsetPanel({ label, axes, systems, activeSystemId, value, defaultValue = { systemId: null, offsets: {} }, onValueChange, onApply, offsetState = "unknown", pending = false, readOnly = false, disabled, description, name, form, className, style, children, ...props }, ref) {
  const [, refresh] = React.useReducer((revision: number) => revision + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<WorkOffsetValue, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const system = systems.find(item => item.id === current.systemId);
  const active = systems.find(item => item.id === activeSystemId);
  const listedAxes = new Set(axes.map(axis => axis.id));
  const hasUnlistedOffset = Object.keys(current.offsets).some(axis => !listedAxes.has(axis));
  const canApply = !hasUnlistedOffset && !!system && !system.disabled && axes.length > 0 && axes.every(axis => current.offsets[axis.id] != null && Number.isFinite(current.offsets[axis.id]));
  const root = rs(["rs-work-offset-panel", className], styles.root);
  const legend = rs(["rs-work-offset-panel-legend"], styles.legend);
  const copy = rs(["rs-work-offset-panel-copy"], styles.copy);
  const field = rs(["rs-work-offset-panel-field"], styles.field);
  const control = rs(["rs-work-offset-panel-control"], styles.control);
  const viewport = rs(["rs-work-offset-panel-viewport"], styles.viewport);
  const table = rs(["rs-work-offset-panel-table"], styles.table);
  const caption = rs(["rs-work-offset-panel-caption"], styles.caption);
  const cell = rs(["rs-work-offset-panel-cell"], styles.cell);
  const axisCell = rs(["rs-work-offset-panel-cell", "rs-work-offset-panel-axis"], styles.cell, styles.axis);
  const offset = rs(["rs-work-offset-panel-cell", "rs-work-offset-panel-offset"], styles.cell, styles.offset);
  const button = rs(["rs-work-offset-panel-button"], styles.button);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled || pending} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {description != null && <p {...copy}>{description}</p>}
    <p {...copy}>Active system: {active?.label ?? (activeSystemId == null ? "Unknown" : `${activeSystemId} (not listed)`)} · Offsets {offsetState}</p>
    <div {...field}><span id={`${id}-system-label`}>Draft coordinate system</span><Select fullWidth aria-labelledby={`${id}-system-label`} name={name ? `${name}.system` : undefined} form={form} value={system ? current.systemId! : ""} disabled={disabled || pending} readOnly={readOnly} onValueChange={next => setValue({ ...current, systemId: next || null })} options={[{ value: "", label: "Choose a system" }, ...systems.map(item => ({ value: item.id, label: item.label, disabled: item.disabled }))]} /></div>
    {current.systemId != null && !system && <p {...copy}>Draft system unavailable: {current.systemId}</p>}
    <div {...viewport} role="region" aria-labelledby={`${id}-axes`} tabIndex={0}><table {...table}>
      <caption {...caption} id={`${id}-axes`}>{label}, axis positions and draft offsets</caption>
      <thead><tr><th {...axisCell} scope="col">Axis</th><th {...cell} scope="col">Machine</th><th {...cell} scope="col">Work</th><th {...offset} scope="col">Draft offset</th></tr></thead>
      <tbody>{axes.map(axis => {
        const amount = current.offsets[axis.id];
        const valid = amount != null && Number.isFinite(amount);
        return <tr key={axis.id}><th {...axisCell} scope="row">{axis.label}<br /><span {...copy}>{axis.unit}</span></th><td {...cell}>{formatPosition(axis.machine)}</td><td {...cell}>{formatPosition(axis.work)}</td><td {...offset}><Input plain {...control} type="number" step="any" aria-label={`${axis.label} offset (${axis.unit})`} aria-invalid={amount != null && !valid || undefined} name={name ? `${name}.${axis.id}` : undefined} form={form} readOnly={readOnly} disabled={disabled || pending} value={valid ? amount : ""} onChange={event => { if (!readOnly) setValue({ ...current, offsets: { ...current.offsets, [axis.id]: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null } }); }} />{amount != null && !valid && <p {...copy}>Offset unavailable</p>}</td></tr>;
      })}</tbody>
    </table></div>
    {!axes.length && <p {...copy}>No axis positions supplied</p>}
    {hasUnlistedOffset && <p {...copy}>Draft contains offsets for unlisted axes</p>}
    {onApply && <Button {...button} type="button" disabled={disabled || pending || readOnly || !canApply} onClick={() => onApply(current)}>Apply offsets</Button>}
    <p {...copy} role="status">{pending ? "Offset update pending" : readOnly ? "Read only" : "Draft edits leave the reported positions unchanged until the host confirms an update."}</p>
    {children}
  </fieldset>;
});
