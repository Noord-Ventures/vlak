"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { Input } from "./input";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface CoordinateReferenceOption { value: string; label: string; description?: React.ReactNode; disabled?: boolean }
export interface CoordinateReferenceAxis { id: string; label: string; unit?: string | null; min?: number; max?: number }
export interface CoordinateReferenceValue { reference: string | null; coordinates: Record<string, number | null> }
export interface CoordinateReferenceFieldProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  /** Two or three axes in the supplied coordinate order. Units are never inferred. */
  axes: readonly CoordinateReferenceAxis[];
  references: readonly CoordinateReferenceOption[];
  value?: CoordinateReferenceValue;
  defaultValue?: CoordinateReferenceValue;
  /** Assigning a reference preserves every numeric value. The host owns reprojection. */
  onValueChange?: (value: CoordinateReferenceValue) => void;
  description?: React.ReactNode;
  referenceLabel?: string;
  unknownReferenceLabel?: string;
  required?: boolean;
  readOnly?: boolean;
}

const initial: CoordinateReferenceValue = { reference: null, coordinates: {} };
const styles = stylex.create({
  root: { display: "grid", gap: "0.875rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: vlak.controlFs, fontWeight: 600 },
  axes: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))", gap: "0.75rem" },
  field: { display: "grid", alignContent: "start", gap: "0.375rem", minWidth: 0, fontSize: vlak.controlLabel },
  control: { minWidth: 0, width: "100%", minHeight: vlak.hit },
  note: { margin: 0, color: vlak.gray, fontSize: vlak.controlLabel, maxWidth: "66ch", overflowWrap: "anywhere" },
});

/** Numeric coordinates and an explicitly assigned reference, without implicit conversion. */
export const CoordinateReferenceField = React.forwardRef<HTMLFieldSetElement, CoordinateReferenceFieldProps>(function CoordinateReferenceField({ label, axes, references, value, defaultValue = initial, onValueChange, description, referenceLabel = "Coordinate reference", unknownReferenceLabel = "Unknown reference", required, readOnly, disabled, name, form, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const id = React.useId();
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<CoordinateReferenceValue, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const reference = references.find(option => option.value === current.reference);
  const unknown = current.reference != null && !reference;
  const unavailable = unknown || reference?.disabled === true;
  const validOptions = axes.length >= 2 && axes.length <= 3 && axes.every(axis => axis.id.length > 0) && new Set(axes.map(axis => axis.id)).size === axes.length && references.every(option => option.value.length > 0) && new Set(references.map(option => option.value)).size === references.length;
  const describedBy = [ariaDescribedBy, `${id}-assignment`, description != null && `${id}-description`, readOnly && `${id}-readonly`].filter(Boolean).join(" ");
  const root = rs(["rs-coordinate-reference-field", className], styles.root);
  const legend = rs(["rs-coordinate-reference-field-legend"], styles.legend);
  const fields = rs(["rs-coordinate-reference-field-axes"], styles.axes);
  const field = rs(["rs-coordinate-reference-field-label"], styles.field);
  const control = rs(["rs-coordinate-reference-field-control"], styles.control);
  const note = rs(["rs-coordinate-reference-field-note"], styles.note);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {description != null && <p {...note} id={`${id}-description`}>{description}</p>}
    <p {...note} id={`${id}-assignment`}>Assigning a reference keeps the entered coordinates. Conversion is handled by the application.</p>
    {readOnly && <p {...note} id={`${id}-readonly`}>Read only</p>}
    {!validOptions ? <p {...note}>Supply two or three uniquely named axes and unique, non-empty reference identifiers.</p> : <>
      <div {...field}><span id={`${id}-reference-label`}>{referenceLabel}</span><Select {...control} fullWidth name={name ? `${name}.reference` : undefined} form={form} value={unavailable ? "" : current.reference ?? ""} disabled={disabled} readOnly={readOnly} required={required || unavailable} aria-invalid={unavailable || undefined} aria-labelledby={`${id}-reference-label`} aria-describedby={`${describedBy} ${id}-reference`} options={[{ value: "", label: unavailable ? `Unavailable reference: ${current.reference}` : unknownReferenceLabel }, ...references.map(option => ({ value: option.value, label: option.label, disabled: option.disabled }))]} onValueChange={next => { if (!readOnly && !disabled) setValue({ ...current, reference: next || null }); }} /></div>
      <p {...note} id={`${id}-reference`}>{unavailable ? `Reference unavailable: ${current.reference}` : reference?.description ?? (reference ? reference.value : unknownReferenceLabel)}</p>
      <div {...fields}>{axes.map((axis, index) => {
        const amount = current.coordinates[axis.id];
        const finite = amount != null && Number.isFinite(amount);
        const invalid = amount != null && !finite;
        const hintId = `${id}-axis-${index}`;
        return <label {...field} key={axis.id}><span id={`${hintId}-label`}>{axis.label}{axis.unit ? ` (${axis.unit})` : ""}</span><Input plain {...control} type="number" name={name ? `${name}.coordinates.${axis.id}` : undefined} form={form} value={finite ? amount : ""} min={axis.min} max={axis.max} step="any" required={required} readOnly={readOnly} aria-invalid={invalid || undefined} aria-labelledby={`${hintId}-label`} aria-describedby={`${describedBy} ${hintId}`} ref={node => { node?.setCustomValidity(invalid ? "Coordinate unavailable. Enter a finite number." : ""); }} onChange={event => { if (!readOnly && !disabled) setValue({ ...current, coordinates: { ...current.coordinates, [axis.id]: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null } }); }} /><span {...note} id={hintId}>{invalid ? "Coordinate unavailable" : amount == null ? "Not supplied" : axis.unit ? `Unit: ${axis.unit}` : "Unit not supplied"}</span></label>;
      })}</div>
    </>}
    {children}
  </fieldset>;
});
