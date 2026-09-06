"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface PadInspectorMeasurement { id: string; label: string; value: number | string | null; unit: string | null }
export interface PadInspectorPad {
  id: string;
  number?: string | null;
  reference?: string | null;
  net?: string | null;
  /** null or omitted means unknown; an empty list means none recorded. */
  layers?: readonly string[] | null;
  type?: string | null;
  shape?: string | null;
  geometry?: readonly PadInspectorMeasurement[];
  disabled?: boolean;
}
export interface PadInspectorProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  pads: readonly PadInspectorPad[];
  value?: string | null;
  defaultValue?: string | null;
  /** Requests pad selection only. The host owns board and schematic cross-highlighting. */
  onValueChange?: (id: string | null) => void;
  boardLabel?: React.ReactNode;
  description?: React.ReactNode;
  selectionLabel?: string;
  required?: boolean;
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.875rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600 },
  field: { display: "grid", gap: "0.375rem", minWidth: 0, fontSize: vlak.controlLabel },
  control: { minWidth: 0, width: "100%", minHeight: vlak.hit },
  properties: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))", gap: "0.875rem", margin: 0, paddingBlock: "0.875rem", borderTopWidth: vlak.hairline, borderTopStyle: "solid", borderTopColor: vlak.divider },
  term: { color: vlak.gray, fontSize: vlak.controlLabel },
  detail: { margin: 0, fontSize: vlak.controlFs, overflowWrap: "anywhere" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: vlak.controlLabel },
  caption: { textAlign: "start", fontSize: vlak.controlFs, fontWeight: 600, paddingBottom: "0.5rem" },
  cell: { textAlign: "start", verticalAlign: "top", paddingBlock: "0.625rem", paddingInlineEnd: "0.5rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontWeight: 400, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" },
  note: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, overflowWrap: "anywhere", maxWidth: "66ch" },
});

function text(value: string | null | undefined) { return value?.trim() ? value : "Not supplied"; }
function measurement(value: number | string | null) { return value == null || typeof value === "string" && !value.trim() ? "Not supplied" : typeof value === "number" && !Number.isFinite(value) ? "Unavailable" : value; }

/** Inspects supplied pad records without inferring connectivity, shape or dimensions. */
export const PadInspector = React.forwardRef<HTMLFieldSetElement, PadInspectorProps>(function PadInspector({ label, pads, value, defaultValue = null, onValueChange, boardLabel, description, selectionLabel = "Pad", required, readOnly, disabled, name, form, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<string | null, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const validRecords = pads.every(pad => pad.id.length > 0 && (!pad.geometry || pad.geometry.every(item => item.id.length > 0) && new Set(pad.geometry.map(item => item.id)).size === pad.geometry.length)) && new Set(pads.map(pad => pad.id)).size === pads.length;
  const selected = pads.find(pad => pad.id === current);
  const unavailable = current != null && (!selected || selected.disabled);
  const describedBy = [ariaDescribedBy, `${id}-selection`, description != null && `${id}-description`, readOnly && `${id}-readonly`].filter(Boolean).join(" ");
  const root = rs(["rs-pad-inspector", className], styles.root);
  const legend = rs(["rs-pad-inspector-legend"], styles.legend);
  const field = rs(["rs-pad-inspector-label"], styles.field);
  const control = rs(["rs-pad-inspector-control"], styles.control);
  const properties = rs(["rs-pad-inspector-properties"], styles.properties);
  const term = rs(["rs-pad-inspector-term"], styles.term);
  const detail = rs(["rs-pad-inspector-detail"], styles.detail);
  const table = rs(["rs-pad-inspector-table"], styles.table);
  const caption = rs(["rs-pad-inspector-caption"], styles.caption);
  const cell = rs(["rs-pad-inspector-cell"], styles.cell);
  const note = rs(["rs-pad-inspector-note"], styles.note);
  const records = selected ? [["Pad identifier", selected.id], ["Footprint reference", text(selected.reference)], ["Pad number", text(selected.number)], ["Net", text(selected.net)], ["Pad type", text(selected.type)], ["Shape", text(selected.shape)], ["Layers", selected.layers == null ? "Not supplied" : selected.layers.length === 0 ? "None recorded" : selected.layers.join(", ")]] : [];
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {boardLabel != null && <p {...note}>{boardLabel}</p>}
    {description != null && <p {...note} id={`${id}-description`}>{description}</p>}
    {readOnly && <p {...note} id={`${id}-readonly`}>Read only</p>}
    {!validRecords ? <p {...note}>Pad and measurement identifiers must be unique and non-empty.</p> : <>
      <div {...field}><span id={`${id}-choice-label`}>{selectionLabel}</span><Select {...control} fullWidth name={name} form={form} value={unavailable ? "" : current ?? ""} disabled={disabled} readOnly={readOnly} required={required || unavailable} aria-invalid={unavailable || undefined} aria-labelledby={`${id}-choice-label`} aria-describedby={describedBy} options={[{ value: "", label: unavailable ? `Unavailable pad: ${current}` : "No pad selected" }, ...pads.map(pad => ({ value: pad.id, label: `${pad.reference?.trim() ? `${pad.reference} / ` : ""}${pad.number?.trim() ? `Pad ${pad.number} · ` : ""}${pad.id}`, disabled: pad.disabled }))]} onValueChange={next => { if (!readOnly && !disabled) setValue(next || null); }} /></div>
      {selected && <>
        <dl {...properties}>{records.map(([key, value]) => <div key={key}><dt {...term}>{key}</dt><dd {...detail}>{value}</dd></div>)}</dl>
        {selected.geometry?.length ? <table {...table}><caption {...caption}>Supplied geometry</caption><thead><tr><th {...cell} scope="col">Dimension</th><th {...cell} scope="col">Value</th><th {...cell} scope="col">Unit</th></tr></thead><tbody>{selected.geometry.map(item => <tr key={item.id}><th {...cell} scope="row">{item.label}</th><td {...cell}>{measurement(item.value)}</td><td {...cell}>{text(item.unit)}</td></tr>)}</tbody></table> : <p {...note}>Geometry not supplied</p>}
      </>}
      {pads.length === 0 && <p {...note}>No pad records supplied</p>}
    </>}
    <p {...note} id={`${id}-selection`}>{unavailable ? `Selected pad unavailable: ${current}` : selected ? `Selected pad: ${selected.id}` : "No pad selected"}</p>
    {children}
  </fieldset>;
});
