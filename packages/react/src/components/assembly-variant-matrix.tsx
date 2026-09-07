"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";
import { Select } from "./select";

export interface AssemblyReference { id: string; label: string; partLabel?: string }
export interface AssemblyVariant { id: string; label: string }
export interface AssemblyVariantState { referenceId: string; variantId: string; populated: boolean | null; includeInBom: boolean | null; includeInPlacement: boolean | null }
export interface AssemblyVariantMatrixProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  label: React.ReactNode;
  references: AssemblyReference[];
  variants: AssemblyVariant[];
  value?: AssemblyVariantState[];
  defaultValue?: AssemblyVariantState[];
  onValueChange?: (cells: AssemblyVariantState[]) => void;
  readOnly?: boolean;
}

const flags = [{ key: "populated", label: "Populated" }, { key: "includeInBom", label: "In bill of materials" }, { key: "includeInPlacement", label: "In placement file" }] as const;
const flagLabel = (value: boolean | null | undefined) => value === true ? "Yes" : value === false ? "No" : "Unspecified";
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink },
  legend: { marginBottom: "0.75rem", padding: 0, fontSize: vlak.controlFs, fontWeight: 600, lineHeight: 1.45 },
  viewport: { minWidth: 0, maxWidth: "100%", overflow: "auto", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.divider },
  table: { width: "100%", borderCollapse: "collapse", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  header: { padding: "0.75rem", minWidth: "7rem", textAlign: "start", verticalAlign: "top", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider, fontWeight: 600 },
  part: { display: "block", fontSize: vlak.controlLabel, color: vlak.gray, fontWeight: 400, lineHeight: 1.45 },
  cell: { padding: "0.5rem", minWidth: "12rem", verticalAlign: "top", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  summary: { boxSizing: "border-box", minWidth: vlak.hit, minHeight: vlak.hit, padding: "0.625rem", borderWidth: vlak.hairline, borderStyle: "solid", borderColor: vlak.controlBorder, borderRadius: vlak.radiusSm, cursor: "pointer", backgroundColor: vlak.paper, color: vlak.ink, outlineWidth: { default: null, ":focus-visible": 2 }, outlineStyle: { default: null, ":focus-visible": "solid" }, outlineColor: vlak.ink, outlineOffset: 2 },
  details: { "::details-content": { color: { default: vlak.ink, [mq.forcedColors]: "CanvasText" } } },
  editor: { display: "grid", gap: "0.625rem", paddingTop: "0.75rem" },
  field: { display: "grid", gap: "0.25rem", fontSize: vlak.controlLabel, lineHeight: 1.45 },
  select: { minWidth: 0, width: "100%" },
  note: { margin: 0, fontSize: vlak.controlLabel, color: vlak.gray, lineHeight: 1.45 },
});

/** Independent fitted, bill-of-materials and placement choices per reference and variant. */
export const AssemblyVariantMatrix = React.forwardRef<HTMLFieldSetElement, AssemblyVariantMatrixProps>(function AssemblyVariantMatrix({ label, references, variants, value, defaultValue = [], onValueChange, readOnly, disabled, name, form, className, style, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<AssemblyVariantState[], HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const unknown = current.filter((cell) => !references.some((reference) => reference.id === cell.referenceId) || !variants.some((variant) => variant.id === cell.variantId));
  const root = rs(["rs-assembly-variant-matrix", className], styles.root);
  const legend = rs(["rs-assembly-variant-matrix-legend"], styles.legend);
  const viewport = rs(["rs-assembly-variant-matrix-viewport"], styles.viewport);
  const table = rs(["rs-assembly-variant-matrix-table"], styles.table);
  const header = rs(["rs-assembly-variant-matrix-header"], styles.header);
  const part = rs(["rs-assembly-variant-matrix-part"], styles.part);
  const cellStyle = rs(["rs-assembly-variant-matrix-cell"], styles.cell);
  const details = rs(["rs-assembly-variant-matrix-details"], styles.details);
  const summary = rs(["rs-assembly-variant-matrix-summary"], styles.summary);
  const editor = rs(["rs-assembly-variant-matrix-editor"], styles.editor);
  const field = rs(["rs-assembly-variant-matrix-field"], styles.field);
  const select = rs(["rs-assembly-variant-matrix-select"], styles.select);
  const note = rs(["rs-assembly-variant-matrix-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} className={root.className} style={{ ...root.style, ...style }}>
    <legend className={legend.className} style={legend.style}>{label}</legend>
    {references.length === 0 || variants.length === 0 ? <p className={note.className} style={note.style}>Supply references and variants to edit assembly choices.</p> : <div className={viewport.className} style={viewport.style}><table className={table.className} style={table.style}>
      <thead><tr><th scope="col" className={header.className} style={header.style}>Reference / variant</th>{variants.map((variant) => <th key={variant.id} scope="col" className={header.className} style={header.style}>{variant.label}</th>)}</tr></thead>
      <tbody>{references.map((reference) => <tr key={reference.id}><th scope="row" className={header.className} style={header.style}>{reference.label}{reference.partLabel && <span className={part.className} style={part.style}>{reference.partLabel}</span>}</th>{variants.map((variant) => {
        const matches = current.filter((cell) => cell.referenceId === reference.id && cell.variantId === variant.id);
        const cell = matches[0];
        const duplicate = matches.length > 1;
        const context = `${reference.label} in ${variant.label}`;
        return <td key={variant.id} className={cellStyle.className} style={cellStyle.style}>
          {duplicate ? <p className={note.className} style={note.style}>Conflicting records for {context}</p> : <details className={details.className} style={details.style}>
            <summary aria-label={`Edit ${context}`} className={summary.className} style={summary.style}><span>Edit {context}</span><span className={part.className} style={part.style}>{cell ? `Populated: ${flagLabel(cell.populated)} · Bill: ${flagLabel(cell.includeInBom)} · Placement: ${flagLabel(cell.includeInPlacement)}` : "Not specified"}</span></summary>
            <div className={editor.className} style={editor.style}>{flags.map((flag) => <div key={flag.key} className={field.className} style={field.style}><span>{flag.label}</span><Select fullWidth options={[{ value: "", label: "Unspecified" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" }]} aria-label={`${flag.label}, ${context}`} name={name ? `${name}.${reference.id}.${variant.id}.${flag.key}` : undefined} form={form} value={cell?.[flag.key] === true ? "yes" : cell?.[flag.key] === false ? "no" : ""} disabled={disabled} readOnly={readOnly} className={select.className} style={select.style} onValueChange={(nextValue) => {
              const next = { referenceId: reference.id, variantId: variant.id, populated: null, includeInBom: null, includeInPlacement: null, ...cell, [flag.key]: nextValue === "" ? null : nextValue === "yes" };
              setValue(cell ? current.map((record) => record === cell ? next : record) : [...current, next]);
            }} /></div>)}</div>
          </details>}
        </td>;
      })}</tr>)}</tbody>
    </table></div>}
    <p className={note.className} style={note.style}>{readOnly ? "Read only. " : ""}Population, bill of materials, and placement choices are independent.</p>
    {unknown.length > 0 && <div className={note.className} style={note.style}>Records with unavailable references or variants:<ul>{unknown.map((cell, index) => <li key={index}>{cell.referenceId} in {cell.variantId}</li>)}</ul></div>}
  </fieldset>;
});
