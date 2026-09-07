"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Select } from "./select";
import { Input } from "./input";

import { useInputValue } from "../use-input-value";
import { useMergedRefs } from "../merge-refs";

export interface QuantityValue { amount: number | null; unit: string | null }
export interface QuantityUnit { value: string; label: string; disabled?: boolean }
export interface QuantityFieldProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue"> {
  label: React.ReactNode;
  units: readonly QuantityUnit[];
  value?: QuantityValue;
  defaultValue?: QuantityValue;
  /** Requests a quantity change. A unit change preserves the amount; the host owns conversion. */
  onValueChange?: (value: QuantityValue) => void;
  description?: React.ReactNode;
  /** Input names: name submits the amount; unitName defaults to name + '.unit'. */
  unitName?: string;
  amountLabel?: string;
  unitLabel?: string;
  unitPlaceholder?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  required?: boolean;
  readOnly?: boolean;
}

const styles = stylex.create({
  root: { display: "grid", gap: "0.75rem", minWidth: 0, margin: 0, padding: 0, borderWidth: 0, color: vlak.ink, lineHeight: 1.45 },
  legend: { padding: 0, marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" },
  row: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "0.75rem" },
  field: { display: "grid", gap: "0.375rem", minWidth: 0, fontSize: "0.75rem", color: vlak.gray },
  control: { width: "100%", minWidth: 0, fontVariantNumeric: "tabular-nums" },
  description: { margin: 0, fontSize: "0.75rem", color: vlak.gray, maxWidth: "66ch" },
});

/** A native numeric input and unit selector. Selection never converts the amount. */
export const QuantityField = React.forwardRef<HTMLFieldSetElement, QuantityFieldProps>(function QuantityField({ label, units, value, defaultValue = { amount: null, unit: null }, onValueChange, description, name, unitName = name ? `${name}.unit` : undefined, form, amountLabel = "Amount", unitLabel = "Unit", unitPlaceholder = "Choose unit", min, max, step = "any", required, readOnly = false, disabled, className, style, "aria-describedby": ariaDescribedBy, children, ...props }, ref) {
  const [, refresh] = React.useReducer((revision: number) => revision + 1, 0);
  const [current, setValue, fieldRef] = useInputValue<QuantityValue, HTMLFieldSetElement>(value, defaultValue, onValueChange, refresh);
  const mergedRef = useMergedRefs(ref, fieldRef);
  const id = React.useId();
  const describedBy = [ariaDescribedBy, description != null && `${id}-description`, readOnly && `${id}-readonly`].filter(Boolean).join(" ") || undefined;
  const validAmount = current.amount != null && Number.isFinite(current.amount);
  const validUnit = current.unit != null && units.some(unit => unit.value === current.unit);
  const root = rs(["rs-quantity-field", className], styles.root);
  const legend = rs(["rs-quantity-field-legend"], styles.legend);
  const row = rs(["rs-quantity-field-row"], styles.row);
  const field = rs(["rs-quantity-field-label"], styles.field);
  const control = rs(["rs-quantity-field-control"], styles.control);
  const copy = rs(["rs-quantity-field-description"], styles.description);
  return <fieldset {...props} ref={mergedRef} name={name} form={form} disabled={disabled} aria-describedby={describedBy} className={root.className} style={{ ...root.style, ...style }}>
    <legend {...legend}>{label}</legend>
    {description != null && <p {...copy} id={`${id}-description`}>{description}</p>}
    {readOnly && <p {...copy} id={`${id}-readonly`}>Read only</p>}
    <div {...row}>
      <label {...field}><span>{amountLabel}</span><Input plain {...control} type="number" name={name} form={form} value={validAmount ? current.amount! : ""} min={min} max={max} step={step} required={required} readOnly={readOnly} disabled={disabled} aria-describedby={describedBy} onChange={event => { if (!readOnly) setValue({ amount: Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null, unit: current.unit }); }} /></label>
      <div {...field}><span id={`${id}-unit-label`}>{unitLabel}</span><Select fullWidth aria-labelledby={`${id}-unit-label`} name={unitName} form={form} value={validUnit ? current.unit! : ""} required={required} disabled={disabled} readOnly={readOnly} aria-describedby={describedBy} onValueChange={next => setValue({ amount: current.amount, unit: next || null })} options={[{ value: "", label: unitPlaceholder }, ...units]} /></div>
    </div>
    {current.amount != null && !validAmount && <p {...copy}>Amount unavailable</p>}
    {current.unit != null && !validUnit && <p {...copy}>Unit unavailable</p>}
    {children}
  </fieldset>;
});
