"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface DatumTransformGrid { id: string; label: string; available: boolean | null }
export interface DatumTransformation {
  id: string;
  label: string;
  accuracy?: React.ReactNode;
  area?: React.ReactNode;
  /** The host determines whether this operation can be used. Null means unknown. */
  available: boolean | null;
  unavailableReason?: React.ReactNode;
  /** An empty array explicitly means no support grids are required. */
  grids?: readonly DatumTransformGrid[];
}
export interface DatumTransformPickerProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  sourceReference: React.ReactNode;
  destinationReference: React.ReactNode;
  transformations: readonly DatumTransformation[];
  /** null means no operation selected; an unknown identifier stays explicitly unavailable. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  description?: React.ReactNode;
  selectionLabel?: string;
  noneLabel?: string;
  required?: boolean;
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.875rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600 },
  context: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10rem), 1fr))", gap: "0.75rem", margin: 0 },
  term: { fontSize: vlak.controlLabel, color: vlak.gray },
  detail: { margin: 0, fontSize: vlak.controlFs, overflowWrap: "anywhere" },
  field: { display: "grid", gap: "0.375rem", fontSize: vlak.controlLabel },
  control: { minWidth: 0, width: "100%", minHeight: vlak.hit },
  list: { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem" },
  item: { display: "grid", gap: "0.625rem", padding: "0.875rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider, minWidth: 0 },
  selected: { backgroundColor: vlak.tableAlt, borderColor: { default: vlak.controlBorder, [mq.forcedColors]: "Highlight" } },
  title: { margin: 0, fontWeight: 600, fontSize: vlak.controlFs, overflowWrap: "anywhere" },
  note: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
});

function canUse(item: DatumTransformation) { return item.available === true && !item.grids?.some(grid => grid.available !== true); }
function availability(item: DatumTransformation) { return item.available == null ? "Availability unknown" : item.available === false ? "Unavailable" : item.grids?.some(grid => grid.available !== true) ? "Required grids unavailable" : "Available"; }

/** Compares host-supplied operations and keeps unavailable alternatives visible. */
export const DatumTransformPicker = React.forwardRef<HTMLFieldSetElement, DatumTransformPickerProps>(function DatumTransformPicker({ label, sourceReference, destinationReference, transformations, value, defaultValue = null, onValueChange, description, selectionLabel = "Transformation", noneLabel = "No transformation selected", required, readOnly, disabled, name, form, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<string | null, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const validOptions = transformations.every(item => item.id.length > 0) && new Set(transformations.map(item => item.id)).size === transformations.length;
  const selected = transformations.find(item => item.id === current);
  const invalid = current != null && (!selected || !canUse(selected));
  const describedBy = [ariaDescribedBy, `${id}-selection`, description != null && `${id}-description`, readOnly && `${id}-readonly`].filter(Boolean).join(" ");
  const root = rs(["rs-datum-transform-picker", className], styles.root);
  const legend = rs(["rs-datum-transform-picker-legend"], styles.legend);
  const context = rs(["rs-datum-transform-picker-context"], styles.context);
  const term = rs(["rs-datum-transform-picker-term"], styles.term);
  const detail = rs(["rs-datum-transform-picker-detail"], styles.detail);
  const field = rs(["rs-datum-transform-picker-label"], styles.field);
  const control = rs(["rs-datum-transform-picker-control"], styles.control);
  const list = rs(["rs-datum-transform-picker-list"], styles.list);
  const title = rs(["rs-datum-transform-picker-title"], styles.title);
  const note = rs(["rs-datum-transform-picker-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {description != null && <p {...note} id={`${id}-description`}>{description}</p>}
    {readOnly && <p {...note} id={`${id}-readonly`}>Read only</p>}
    <dl {...context}><div><dt {...term}>Source reference</dt><dd {...detail}>{sourceReference ?? "Unknown source reference"}</dd></div><div><dt {...term}>Destination reference</dt><dd {...detail}>{destinationReference ?? "Unknown destination reference"}</dd></div></dl>
    {!validOptions ? <p {...note}>Transformation identifiers must be unique and non-empty.</p> : <>
      <div {...field}><span id={`${id}-choice-label`}>{selectionLabel}</span><Select {...control} fullWidth name={name} form={form} value={invalid ? "" : current ?? ""} disabled={disabled} readOnly={readOnly} required={required || invalid} aria-invalid={invalid || undefined} aria-labelledby={`${id}-choice-label`} aria-describedby={describedBy} options={[{ value: "", label: invalid ? `Unavailable transformation: ${current}` : noneLabel }, ...transformations.map(item => ({ value: item.id, label: `${item.label}${canUse(item) ? "" : ` (${availability(item)})`}`, disabled: !canUse(item) }))]} onValueChange={next => { if (!readOnly && !disabled) setValue(next || null); }} /></div>
      <ul {...list}>{transformations.map(item => {
        const row = rs(["rs-datum-transform-picker-item", current === item.id && "rs-datum-transform-picker-selected"], styles.item, current === item.id && styles.selected);
        return <li {...row} key={item.id}><p {...title}>{item.label}{current === item.id ? " · Selected" : ""}</p><p {...note}>{availability(item)}{!canUse(item) && item.unavailableReason != null ? <>: {item.unavailableReason}</> : null}</p><dl {...context}><div><dt {...term}>Reported accuracy</dt><dd {...detail}>{item.accuracy ?? "Not supplied"}</dd></div><div><dt {...term}>Area of use</dt><dd {...detail}>{item.area ?? "Not supplied"}</dd></div></dl><p {...note}>Support grids: {item.grids == null ? "Requirements not supplied" : item.grids.length === 0 ? "None required" : item.grids.map(grid => `${grid.label} (${grid.available === true ? "available" : grid.available === false ? "missing" : "availability unknown"})`).join(", ")}</p></li>;
      })}</ul>
      {transformations.length === 0 && <p {...note}>No transformations supplied</p>}
    </>}
    <p {...note} id={`${id}-selection`}>{current == null ? noneLabel : !selected ? `Unknown transformation: ${current}` : invalid ? `Selected transformation unavailable: ${selected.label}` : `Selected: ${selected.label}`}</p>
    {children}
  </fieldset>;
});
