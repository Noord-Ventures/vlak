"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { Input } from "./input";

import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface GenomicContig { id: string; label?: string; length: number }
export interface GenomicRegion { contig: string | null; start: number | null; end: number | null }
export interface GenomicRegionFieldProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  /** Fixed reference name or accession, submitted with the region. */
  reference: string;
  contigs: readonly GenomicContig[];
  value?: GenomicRegion;
  defaultValue?: GenomicRegion;
  onValueChange?: (value: GenomicRegion) => void;
  required?: boolean;
  readOnly?: boolean;
  description?: React.ReactNode;
}
const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, borderWidth: 0, padding: 0, margin: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.75rem", fontSize: "0.875rem", fontWeight: 600 },
  fields: { display: "grid", gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [mq.phone]: "minmax(0, 1fr)" }, gap: "0.75rem" },
  field: { display: "grid", gap: "0.375rem", minWidth: 0, fontSize: "0.75rem" },
  control: { width: "100%", minWidth: 0, fontVariantNumeric: "tabular-nums" },
  copy: { margin: 0, fontSize: "0.75rem", color: vlak.gray, overflowWrap: "anywhere", maxWidth: "66ch" },
});
const emptyRegion: GenomicRegion = { contig: null, start: null, end: null };
/** A region in one-based inclusive coordinates. No assembly or half-open conversion is performed. */
export const GenomicRegionField = React.forwardRef<HTMLFieldSetElement, GenomicRegionFieldProps>(function GenomicRegionField({ label, reference, contigs, value, defaultValue = emptyRegion, onValueChange, required = false, readOnly = false, description, name, form, disabled, className, style, children, "aria-describedby": ariaDescribedBy, ...props }, ref) {
  const [, refresh] = React.useReducer((n: number) => n + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<GenomicRegion, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const merged = useMergedRefs(ref, fieldRef);
  const startRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const validCatalog = reference.trim().length > 0 && contigs.length <= 2048 && contigs.every(contig => contig.id.trim() && Number.isSafeInteger(contig.length) && contig.length >= 1) && new Set(contigs.map(contig => contig.id)).size === contigs.length;
  const contig = validCatalog ? contigs.find(item => item.id === current.contig) : undefined;
  const empty = current.contig == null && current.start == null && current.end == null;
  const error = !validCatalog ? "Reference or contig bounds unavailable" : empty && !required ? "" : !contig ? "Choose a supplied contig" : current.start == null || current.end == null ? "Enter both start and end positions" : !Number.isSafeInteger(current.start) || !Number.isSafeInteger(current.end) ? "Positions must be whole safe integers" : current.start < 1 || current.end < 1 ? "Positions begin at 1" : current.end < current.start ? "End must be at or after start" : current.end > contig.length ? `End must be at most ${contig.length}` : "";
  React.useEffect(() => { startRef.current?.setCustomValidity(error); }, [error]);
  const describedBy = [ariaDescribedBy, `${id}-convention`, `${id}-feedback`, description != null && `${id}-description`].filter(Boolean).join(" ");
  const fieldName = (field: string) => name ? `${name}.${field}` : undefined;
  const root = rs(["rs-genomic-region-field", className], styles.root);
  const legend = rs(["rs-genomic-region-field-legend"], styles.legend);
  const fields = rs(["rs-genomic-region-field-fields"], styles.fields);
  const field = rs(["rs-genomic-region-field-label"], styles.field);
  const control = rs(["rs-genomic-region-field-control"], styles.control);
  const copy = rs(["rs-genomic-region-field-copy"], styles.copy);
  return <fieldset {...props} ref={merged} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend><p {...copy}>Reference: {reference || "Not supplied"}</p><p {...copy} id={`${id}-convention`}>1-based, inclusive. Both start and end are included.</p>
    {description != null && <div {...copy} id={`${id}-description`}>{description}</div>}
    <input type="hidden" name={fieldName("reference")} form={form} value={reference} />
    <input type="hidden" name={fieldName("coordinates")} form={form} value="1-based-inclusive" />
    <div {...fields}>
      <div {...field}><span id={`${id}-contig-label`}>Contig</span><Select fullWidth aria-labelledby={`${id}-contig-label`} name={fieldName("contig")} form={form} value={contig?.id ?? ""} required={required} disabled={disabled || !validCatalog} readOnly={readOnly} aria-describedby={describedBy} aria-invalid={!!error || undefined} onValueChange={next => setValue({ ...current, contig: next || null })} options={[{ value: "", label: "Choose contig" }, ...(validCatalog ? contigs.map(item => ({ value: item.id, label: item.label ?? item.id })) : [])]} /></div>
      <label {...field}>Start<Input plain {...control} ref={startRef} type="number" step={1} min={1} max={contig?.length} required={required} readOnly={readOnly} disabled={disabled} name={fieldName("start")} form={form} value={current.start != null && Number.isFinite(current.start) ? current.start : ""} aria-describedby={describedBy} aria-invalid={!!error || undefined} onChange={event => { if (!readOnly) setValue({ ...current, start: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null }); }} /></label>
      <label {...field}>End<Input plain {...control} type="number" step={1} min={1} max={contig?.length} required={required} readOnly={readOnly} disabled={disabled} name={fieldName("end")} form={form} value={current.end != null && Number.isFinite(current.end) ? current.end : ""} aria-describedby={describedBy} aria-invalid={!!error || undefined} onChange={event => { if (!readOnly) setValue({ ...current, end: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null }); }} /></label>
    </div>
    <p {...copy} id={`${id}-feedback`}>{error || (empty ? "No region entered" : `${current.end! - current.start! + 1} positions, including both endpoints`)}</p>{children}
  </fieldset>;
});
