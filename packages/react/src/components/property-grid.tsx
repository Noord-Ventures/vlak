"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Input } from "./input";
import { NativeSelect } from "./native-select";
import { Switch } from "./switch";
import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface PropertyField { id: string; label: string; type?: "text" | "number" | "select" | "switch"; unit?: string; options?: Array<{ value: string; label: string }>; min?: number; max?: number; step?: number; disabled?: boolean; description?: string }
export type PropertyValues = Record<string, string | number | boolean>;
export interface PropertyGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  fields: PropertyField[];
  value?: PropertyValues;
  defaultValue?: PropertyValues;
  onValueChange?: (values: PropertyValues) => void;
  label?: string;
}
const styles = stylex.create({
  root: { color: vlak.ink, width: "100%", minWidth: 0 },
  row: { display: "grid", gridTemplateColumns: { default: "minmax(7rem, 1fr) minmax(0, 2fr)", [mq.phone]: "minmax(0, 1fr)" }, alignItems: "center", gap: "0.75rem", paddingBlock: "0.75rem", borderBottomWidth: vlak.hairline, borderBottomStyle: "solid", borderBottomColor: vlak.divider },
  label: { lineHeight: 1.45, fontSize: "0.875rem" },
  control: { display: "flex", gap: "0.5rem", alignItems: "center", minWidth: 0 },
  note: { color: vlak.gray, fontSize: "0.875rem", lineHeight: 1.45, marginBlock: "0.5rem 0" },
});

/** Editable property rows with shared label/value/unit alignment. */
export const PropertyGrid = React.forwardRef<HTMLDivElement, PropertyGridProps>(function PropertyGrid({ fields, value, defaultValue = {}, onValueChange, label = "Properties", className, style, ...props }, ref) {
  const [values, setValues, localRef] = useInputValue<PropertyValues, HTMLDivElement>(value, defaultValue, onValueChange);
  const mergedRef = useMergedRefs(ref, localRef);
  const id = React.useId();
  const set = (field: string, next: string | number | boolean) => setValues({ ...values, [field]: next });
  const root = rs(["rs-property-grid", className], styles.root);
  const row = rs(["rs-property-grid-row"], styles.row);
  const lab = rs(["rs-property-grid-label"], styles.label);
  const control = rs(["rs-property-grid-control"], styles.control);
  const note = rs(["rs-property-grid-note"], styles.note);
  return <div ref={mergedRef} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>{fields.map(field => { const fieldId = `${id}-${field.id}`; const hint = [field.description ? `${fieldId}-hint` : null, field.unit ? `${fieldId}-unit` : null].filter(Boolean).join(" ") || undefined; return <div key={field.id} {...row}><label {...lab} htmlFor={fieldId}>{field.label}</label><div><div {...control}>
    {field.type === "switch" ? <><Switch id={fieldId} aria-label={field.label} aria-describedby={hint} checked={Boolean(values[field.id])} disabled={field.disabled} onCheckedChange={next => set(field.id, next)} /><input type="hidden" name={field.id} value={String(Boolean(values[field.id]))} disabled={field.disabled} /></> : field.type === "select" ? <NativeSelect id={fieldId} name={field.id} aria-label={field.label} aria-describedby={hint} value={String(values[field.id] ?? "")} disabled={field.disabled} onChange={event => set(field.id, event.target.value)}><option value="">Select {field.label.toLocaleLowerCase()}</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</NativeSelect> : <Input plain id={fieldId} name={field.id} aria-describedby={hint} type={field.type === "number" ? "number" : "text"} min={field.min} max={field.max} step={field.step} disabled={field.disabled} value={String(values[field.id] ?? "")} onChange={event => set(field.id, field.type === "number" && event.target.value !== "" && Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : event.target.value)} />}
    {field.unit && <span {...note} id={`${fieldId}-unit`}>{field.unit}</span>}</div>{field.description && <p {...note} id={`${fieldId}-hint`}>{field.description}</p>}</div></div>; })}</div>;
});
